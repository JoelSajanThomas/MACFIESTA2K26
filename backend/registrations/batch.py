"""Secure payment batch helpers."""

from __future__ import annotations

import secrets
from decimal import Decimal

from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from events.models import Event

from .fees import (
    accommodation_fee_per_person,
    breakfast_fee,
    compute_registration_amount,
    dinner_fee,
    food_package_fee,
    lunch_fee,
)
from .models import Registration, TeamMember
from .services import next_waitlist_position, send_registration_email


MAX_EVENTS_PER_BATCH = 12


def new_payment_batch_id() -> str:
    return f"PB{secrets.token_hex(8).upper()}"


def new_payment_reference() -> str:
    # Short, human-friendly reference for UPI note + DB match
    return f"MF{secrets.token_hex(4).upper()}"


def _prepare_identity(user, data: dict) -> dict:
    out = dict(data)
    if not (out.get("email") or "").strip():
        out["email"] = (user.email or "").strip().lower()
    if not (out.get("participant_name") or "").strip():
        out["participant_name"] = (user.get_full_name() or "").strip() or user.username
    return out


def _create_one_registration(
    *,
    user,
    event: Event,
    base: dict,
    apply_addons: bool,
    payment_batch_id: str,
    payment_reference: str,
    members_data: list | None = None,
) -> Registration:
    if not event.is_registration_open:
        raise serializers.ValidationError({"events": f"Registration is closed for {event.title}."})
    if event.status == "cancelled":
        raise serializers.ValidationError({"events": f"{event.title} has been cancelled."})
    if event.registration_deadline and timezone.now() > event.registration_deadline:
        raise serializers.ValidationError({"events": f"Deadline passed for {event.title}."})
    if event.event_date and event.event_date < timezone.localdate():
        raise serializers.ValidationError({"events": f"Registration closed for {event.title}."})
    if Registration.objects.filter(user=user, event=event, cancelled_at__isnull=True).exists():
        raise serializers.ValidationError({"events": f"Already registered for {event.title}."})

    confirmed_count = event.registrations.filter(
        is_waiting_list=False, cancelled_at__isnull=True
    ).count()
    is_waiting = False
    wait_pos = None
    if confirmed_count >= event.max_participants:
        if event.waiting_list_enabled:
            is_waiting = True
            wait_pos = next_waitlist_position(event)
        else:
            raise serializers.ValidationError({"events": f"{event.title} is full."})

    food = base.get("food_preference", "none") if apply_addons else "none"
    needs_acc = bool(base.get("needs_accommodation")) if apply_addons else False
    needs_tr = False  # Transport not offered
    acc_count = base.get("accommodation_count") if apply_addons else None

    breakdown = compute_registration_amount(
        event_fee=event.registration_fee,
        food_preference=food,
        needs_accommodation=needs_acc,
        accommodation_count=acc_count,
        needs_transport=False,
    )
    initial_payment_status = "waived" if breakdown["total"] <= 0 else "pending"

    if event.max_team_size and event.max_team_size > 1:
        reg_type = "team"
    elif event.max_team_size and event.max_team_size <= 1:
        reg_type = "individual"
    else:
        reg_type = "team" if base.get("registration_type") == "team" else "individual"

    is_team_event = (reg_type == "team")
    default_team_name = f"{base['participant_name']}'s Team"
    resolved_team_name = (base.get("team_name") or default_team_name).strip() if is_team_event else ""

    raw_gender = str(base.get("gender") or "").strip().lower()
    if raw_gender in ("female", "f"):
        gender = "female"
    elif raw_gender in ("others", "other", "o"):
        gender = "other"
    else:
        gender = "male"

    create_kwargs = {
        "user": user,
        "event": event,
        "registration_type": reg_type,
        "team_name": resolved_team_name,
        "participant_name": base["participant_name"],
        "college_name": base["college_name"],
        "email": base["email"],
        "phone": base["phone"],
        "gender": gender,
        "food_preference": food if apply_addons else "none",
        "food_notes": (base.get("food_notes") or "") if apply_addons else "",
        "needs_accommodation": needs_acc,
        "accommodation_count": acc_count if needs_acc else None,
        "accommodation_notes": (base.get("accommodation_notes") or "") if apply_addons else "",
        "needs_transport": needs_tr,
        "transport_note": (base.get("transport_note") or "") if apply_addons else "",
        "is_waiting_list": is_waiting,
        "waitlist_position": wait_pos,
        "approval_status": "approved" if not is_waiting else "pending",
        "payment_status": initial_payment_status,
        "payment_amount": breakdown["total"],
        "payment_notes": (
            f"Event ₹{breakdown['event_fee']}"
            f" + Food ₹{breakdown['food_fee']}"
            f" + Stay ₹{breakdown['accommodation_fee']}"
            f" + Transport ₹{breakdown['transport_fee']}"
            f" = ₹{breakdown['total']}"
        ),
        "payment_batch_id": payment_batch_id,
        "payment_reference": payment_reference,
    }
    registration = Registration.objects.create(**create_kwargs)
    try:
        from .institutions import ensure_institution

        ensure_institution(registration.college_name)
    except Exception:
        pass

    if registration.registration_type == "team" and members_data:
        for member in members_data:
            if not member:
                continue
            name = (member.get("name") or "").strip()
            if not name:
                continue
            TeamMember.objects.create(
                registration=registration,
                name=name,
                phone=(member.get("phone") or "").strip(),
                email=(member.get("email") or "").strip(),
                college_name=(member.get("college_name") or "").strip(),
            )

    return registration


@transaction.atomic
def create_registration_batch(*, user, event_ids: list[int], profile: dict, members_by_event: dict | None = None):
    if not event_ids:
        raise serializers.ValidationError({"events": "Select at least one event."})
    if len(event_ids) > MAX_EVENTS_PER_BATCH:
        raise serializers.ValidationError(
            {"events": f"You can register for at most {MAX_EVENTS_PER_BATCH} events at once."}
        )
    # Preserve order, drop dupes
    seen = set()
    ordered_ids = []
    for eid in event_ids:
        try:
            eid_int = int(eid)
        except (TypeError, ValueError):
            raise serializers.ValidationError({"events": "Invalid event id."}) from None
        if eid_int in seen:
            continue
        seen.add(eid_int)
        ordered_ids.append(eid_int)

    events = list(
        Event.objects.select_for_update().filter(pk__in=ordered_ids).order_by("event_date", "title")
    )
    if len(events) != len(ordered_ids):
        raise serializers.ValidationError({"events": "One or more events were not found."})

    # Keep user-selected order
    by_id = {e.pk: e for e in events}
    events = [by_id[i] for i in ordered_ids]

    base = _prepare_identity(user, profile)
    for field in ("participant_name", "college_name", "phone", "email"):
        if not str(base.get(field) or "").strip():
            raise serializers.ValidationError({field: "This field is required."})

    batch_id = new_payment_batch_id()
    reference = new_payment_reference()
    created = []
    for index, event in enumerate(events):
        members = None
        if members_by_event and str(event.pk) in members_by_event:
            members = members_by_event[str(event.pk)]
        elif members_by_event and event.pk in members_by_event:
            members = members_by_event[event.pk]
        reg = _create_one_registration(
            user=user,
            event=event,
            base=base,
            apply_addons=(index == 0),  # hospitality add-ons charged once per checkout
            payment_batch_id=batch_id,
            payment_reference=reference,
            members_data=members,
        )
        created.append(reg)
    batch_total = sum((r.payment_amount or Decimal("0")) for r in created)
    event_fee_total = sum(Decimal(r.event.registration_fee or 0) for r in created)
    # The first registration holds the accommodation and food breakdown
    first_reg = created[0] if created else None
    acc_count = int(base.get("accommodation_count") or 1) if base.get("needs_accommodation") else 0
    accommodation_fee_total = (
        accommodation_fee_per_person() * max(1, acc_count)
        if base.get("needs_accommodation")
        else Decimal("0.00")
    )

    food_fee_total = Decimal("0.00")
    if base.get("needs_accommodation"):
        pref = str(base.get("food_preference") or "none").lower()
        if pref in ("full", "all", "veg", "non_veg", "jain", "package"):
            food_fee_total = food_package_fee() * max(1, acc_count)
        elif pref != "none":
            meals = [m.strip() for m in pref.replace("+", ",").replace(";", ",").split(",") if m.strip()]
            bf = breakfast_fee() if ("breakfast" in meals or "bf" in meals) else Decimal("0.00")
            ln = lunch_fee() if ("lunch" in meals or "ln" in meals) else Decimal("0.00")
            dn = dinner_fee() if ("dinner" in meals or "dn" in meals) else Decimal("0.00")
            calc = (bf + ln + dn) * max(1, acc_count)
            food_fee_total = calc if calc > 0 else (food_package_fee() * max(1, acc_count))

    return {
        "payment_batch_id": batch_id,
        "payment_reference": reference,
        "payment_amount_total": batch_total,
        "event_fee_total": event_fee_total,
        "accommodation_fee_total": accommodation_fee_total,
        "food_fee_total": food_fee_total,
        "hospitality_total": accommodation_fee_total + food_fee_total,
        "registrations": created,
    }

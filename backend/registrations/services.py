import logging

from django.core.mail import send_mail
from django.conf import settings
from django.db import transaction
from django.db.models import Max
from django.utils import timezone

from .models import Registration

logger = logging.getLogger(__name__)


def next_waitlist_position(event):
    current = (
        Registration.objects.filter(event=event, is_waiting_list=True, cancelled_at__isnull=True)
        .aggregate(Max("waitlist_position"))
        .get("waitlist_position__max")
    )
    return (current or 0) + 1


def send_registration_email(registration):
    if not registration.email:
        return
    status = "waiting list" if registration.is_waiting_list else "confirmed"
    subject = f"MacFiesta registration {registration.registration_number}"
    message = (
        f"Hi {registration.participant_name},\n\n"
        f"Your registration for {registration.event.title} is {status}.\n"
        f"Registration number: {registration.registration_number}\n"
        f"Venue: {registration.event.venue}\n"
        f"Date: {registration.event.event_date}\n\n"
        "Show this registration number / QR at the fest desk for payment and entry.\n"
        "Payment is collected manually at the finance desk unless waived.\n\n"
        "— MacFiesta Pro\n"
    )
    try:
        send_mail(
            subject,
            message,
            getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@macfiesta.local"),
            [registration.email],
            fail_silently=True,
        )
    except Exception:
        logger.exception(
            "Failed to send registration email for registration_id=%s",
            registration.id,
        )


@transaction.atomic
def promote_next_waitlisted(event):
    """Promote the earliest waitlisted registration into a confirmed spot."""
    confirmed = event.registrations.filter(
        is_waiting_list=False, cancelled_at__isnull=True
    ).count()
    if confirmed >= event.max_participants:
        return None
    if not event.is_registration_open and event.status == "cancelled":
        return None

    nxt = (
        event.registrations.select_for_update()
        .filter(is_waiting_list=True, cancelled_at__isnull=True)
        .order_by("waitlist_position", "registered_at")
        .first()
    )
    if not nxt:
        return None

    nxt.is_waiting_list = False
    nxt.waitlist_position = None
    nxt.approval_status = "approved"
    nxt.save(update_fields=["is_waiting_list", "waitlist_position", "approval_status"])
    send_registration_email(nxt)
    return nxt


@transaction.atomic
def cancel_registration(registration, *, by_user=None):
    if registration.cancelled_at:
        return registration
    if registration.attendance_marked:
        raise ValueError("Cannot cancel a registration that is already verified/attended.")

    event = registration.event
    was_confirmed = not registration.is_waiting_list
    registration.cancelled_at = timezone.now()
    registration.approval_status = "cancelled"
    registration.is_waiting_list = False
    registration.waitlist_position = None
    registration.save(
        update_fields=[
            "cancelled_at",
            "approval_status",
            "is_waiting_list",
            "waitlist_position",
        ]
    )

    if was_confirmed:
        promote_next_waitlisted(event)
    return registration

import re

from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework import serializers

from events.models import Event
from .models import Registration, TeamMember
from .services import (
    cancel_registration,
    next_waitlist_position,
    send_registration_email,
)


class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = ["id", "name", "phone", "email", "college_name"]


class RegistrationSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source="event.title", read_only=True)
    event_venue = serializers.CharField(source="event.venue", read_only=True)
    event_date = serializers.DateField(source="event.event_date", read_only=True)
    event_time = serializers.TimeField(source="event.event_time", read_only=True)
    team_members = TeamMemberSerializer(many=True, required=False)

    class Meta:
        model = Registration
        fields = [
            "id",
            "event",
            "event_title",
            "event_venue",
            "event_date",
            "event_time",
            "registration_type",
            "team_name",
            "team_members",
            "participant_name",
            "college_name",
            "email",
            "phone",
            "payment_status",
            "approval_status",
            "is_waiting_list",
            "waitlist_position",
            "attendance_marked",
            "registration_number",
            "registered_at",
            "food_preference",
            "food_notes",
            "needs_accommodation",
            "accommodation_count",
            "accommodation_notes",
            "needs_transport",
            "transport_note",
            "payment_amount",
            "payment_method",
            "payment_receipt_number",
            "payment_confirmed_at",
            "payment_notes",
            "verified_at",
            "cancelled_at",
            "user",
        ]
        read_only_fields = [
            "user",
            "payment_status",
            "approval_status",
            "is_waiting_list",
            "waitlist_position",
            "attendance_marked",
            "registration_number",
            "registered_at",
            "payment_amount",
            "payment_method",
            "payment_receipt_number",
            "payment_confirmed_at",
            "payment_notes",
            "verified_at",
            "cancelled_at",
        ]

    def validate_email(self, value):
        return value.strip().lower()

    def validate_phone(self, value):
        digits = re.sub(r"\D", "", str(value))
        if len(digits) < 10 or len(digits) > 15:
            raise serializers.ValidationError("Enter a valid phone number (10–15 digits).")
        return value.strip()

    def validate(self, attrs):
        event = attrs.get("event")
        if not event:
            return attrs

        now = timezone.now()
        if event.registration_deadline and now > event.registration_deadline:
            raise serializers.ValidationError({"event": "Registration deadline has passed."})
        if event.event_date and event.event_date < timezone.localdate():
            raise serializers.ValidationError({"event": "Registration is closed for past events."})

        registration_type = attrs.get("registration_type", "individual")
        if registration_type == "team" and not attrs.get("team_name", "").strip():
            raise serializers.ValidationError(
                {"team_name": "Team name is required for team registration."}
            )

        min_size = event.min_team_size or 1
        max_size = event.max_team_size
        if registration_type == "individual" and min_size > 1:
            raise serializers.ValidationError(
                {
                    "registration_type": (
                        f"This event requires a team of at least {min_size} members. "
                        "Choose Team registration."
                    )
                }
            )
        if registration_type == "team" and max_size == 1:
            raise serializers.ValidationError(
                {"registration_type": "This event only accepts individual registrations."}
            )

        members = self.initial_data.get("team_members") or []
        if registration_type == "team":
            total = 1 + len(members)
            if min_size and total < min_size:
                raise serializers.ValidationError(
                    {"team_members": f"This event needs at least {min_size} members (including you)."}
                )
            if max_size and total > max_size:
                raise serializers.ValidationError(
                    {"team_members": f"This event allows at most {max_size} members (including you)."}
                )

        for field in ("participant_name", "college_name"):
            if field in attrs and attrs[field] is not None:
                attrs[field] = attrs[field].strip()
                if not attrs[field]:
                    raise serializers.ValidationError({field: "This field may not be blank."})

        return attrs

    def create(self, validated_data):
        members_data = validated_data.pop("team_members", None)
        if members_data is None:
            raw = self.initial_data.get("team_members") or []
            members_data = raw if isinstance(raw, list) else []

        user = validated_data.pop("user", None) or self.context["request"].user
        event_id = validated_data["event"].pk

        try:
            with transaction.atomic():
                event = Event.objects.select_for_update().get(pk=event_id)

                if not event.is_registration_open:
                    raise serializers.ValidationError(
                        {"event": "Registration is closed for this event."}
                    )
                if event.status == "cancelled":
                    raise serializers.ValidationError({"event": "This event has been cancelled."})
                if event.registration_deadline and timezone.now() > event.registration_deadline:
                    raise serializers.ValidationError(
                        {"event": "Registration deadline has passed."}
                    )
                if event.event_date and event.event_date < timezone.localdate():
                    raise serializers.ValidationError(
                        {"event": "Registration is closed for past events."}
                    )
                if Registration.objects.filter(
                    user=user, event=event, cancelled_at__isnull=True
                ).exists():
                    raise serializers.ValidationError(
                        {"event": "You are already registered for this event."}
                    )

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
                        raise serializers.ValidationError({"event": "This event is full."})

                fee = event.registration_fee
                registration = Registration.objects.create(
                    user=user,
                    is_waiting_list=is_waiting,
                    waitlist_position=wait_pos,
                    approval_status="approved" if not is_waiting else "pending",
                    payment_amount=fee,
                    **validated_data,
                )

                if registration.registration_type == "team":
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

                send_registration_email(registration)
                return registration
        except IntegrityError as exc:
            raise serializers.ValidationError(
                {"event": "You are already registered for this event."}
            ) from exc


class AdminRegistrationSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source="event.title", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    team_members = TeamMemberSerializer(many=True, read_only=True)
    verified_by_username = serializers.CharField(
        source="verified_by.username", read_only=True, default=None
    )

    class Meta:
        model = Registration
        fields = [
            "id",
            "event",
            "event_title",
            "username",
            "registration_type",
            "team_name",
            "team_members",
            "participant_name",
            "college_name",
            "email",
            "phone",
            "payment_status",
            "approval_status",
            "is_waiting_list",
            "waitlist_position",
            "attendance_marked",
            "registration_number",
            "registered_at",
            "food_preference",
            "food_notes",
            "needs_accommodation",
            "accommodation_count",
            "accommodation_notes",
            "needs_transport",
            "transport_note",
            "payment_amount",
            "payment_method",
            "payment_receipt_number",
            "payment_confirmed_at",
            "payment_notes",
            "verified_at",
            "verified_by",
            "verified_by_username",
            "cancelled_at",
        ]
        read_only_fields = ["registration_number", "registered_at", "verified_by_username"]

    def update(self, instance, validated_data):
        from django.utils import timezone

        prev_paid = instance.payment_status
        prev_attendance = instance.attendance_marked
        instance = super().update(instance, validated_data)

        if (
            instance.payment_status == "paid"
            and prev_paid != "paid"
            and not instance.payment_confirmed_at
        ):
            instance.payment_confirmed_at = timezone.now()
            instance.save(update_fields=["payment_confirmed_at"])

        request = self.context.get("request")
        if instance.attendance_marked and not prev_attendance:
            instance.verified_at = timezone.now()
            if request and request.user and request.user.is_authenticated:
                instance.verified_by = request.user
            instance.save(update_fields=["verified_at", "verified_by"])

        return instance

import re
from decimal import Decimal
from rest_framework import serializers

from events.models import Event
from .fees import (
    accommodation_fee_per_person,
    food_package_fee,
    breakfast_fee,
    lunch_fee,
    dinner_fee,
)
from .models import Registration, TeamMember, Institution


class TeamMemberSerializer(serializers.ModelSerializer):
    qr_pass_code = serializers.CharField(read_only=True)
    payment_proof_url = serializers.SerializerMethodField()
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = TeamMember
        fields = [
            "id",
            "role",
            "name",
            "phone",
            "email",
            "college_name",
            "department",
            "register_number",
            "gender",
            "photo",
            "photo_url",
            "invitation_status",
            "invited_at",
            "accepted_at",
            "payment_status",
            "payment_amount",
            "payment_method",
            "payment_transaction_id",
            "payment_proof",
            "payment_proof_url",
            "payment_rejection_reason",
            "payment_verified_at",
            "finance_status",
            "finance_verified_at",
            "organizer_status",
            "organizer_verified_at",
            "attendance_marked",
            "verification_attendance_marked",
            "event_attendance_marked",
            "event_attended_at",
            "qr_pass_code",
            "user",
        ]
        read_only_fields = [
            "qr_pass_code",
            "invited_at",
            "accepted_at",
            "payment_verified_at",
            "finance_verified_at",
            "organizer_verified_at",
            "user",
        ]

    def get_payment_proof_url(self, obj):
        if not obj.payment_proof:
            return None
        request = self.context.get("request")
        url = obj.payment_proof.url
        return request.build_absolute_uri(url) if request else url

    def get_photo_url(self, obj):
        if not obj.photo:
            return None
        request = self.context.get("request")
        url = obj.photo.url
        return request.build_absolute_uri(url) if request else url


class RegistrationSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source="event.title", read_only=True)
    event_venue = serializers.CharField(source="event.venue", read_only=True)
    event_date = serializers.DateField(source="event.event_date", read_only=True)
    event_time = serializers.TimeField(source="event.event_time", read_only=True)
    min_team_size = serializers.IntegerField(source="event.min_team_size", read_only=True)
    max_team_size = serializers.IntegerField(source="event.max_team_size", read_only=True)
    team_members = TeamMemberSerializer(many=True, required=False)
    pass_token = serializers.SerializerMethodField()
    entry_qr_status = serializers.SerializerMethodField()
    payment_proof_uploaded = serializers.SerializerMethodField()
    is_captain = serializers.SerializerMethodField()
    can_pay = serializers.SerializerMethodField()
    is_team_full = serializers.BooleanField(read_only=True)
    is_team_paid = serializers.BooleanField(read_only=True)
    is_locked = serializers.BooleanField(read_only=True)
    is_team_locked = serializers.BooleanField(read_only=True)
    meets_minimum_team_size = serializers.BooleanField(read_only=True)
    can_proceed_to_payment = serializers.BooleanField(read_only=True)
    total_team_members_count = serializers.IntegerField(read_only=True)
    gender = serializers.CharField(required=False, allow_blank=True, default="male")
    event_fee = serializers.SerializerMethodField()
    accommodation_fee = serializers.SerializerMethodField()
    food_fee = serializers.SerializerMethodField()
    hospitality_fee = serializers.SerializerMethodField()

    class Meta:
        model = Registration
        fields = [
            "id",
            "event",
            "event_title",
            "event_venue",
            "event_date",
            "event_time",
            "event_fee",
            "min_team_size",
            "max_team_size",
            "registration_type",
            "team_name",
            "team_members",
            "participant_name",
            "college_name",
            "department",
            "register_number",
            "email",
            "phone",
            "gender",
            "payment_status",
            "approval_status",
            "is_waiting_list",
            "waitlist_position",
            "attendance_marked",
            "verification_attendance_marked",
            "event_attendance_marked",
            "event_attended_at",
            "registration_number",
            "pass_token",
            "entry_qr_status",
            "registered_at",
            "food_preference",
            "food_notes",
            "food_fee",
            "needs_accommodation",
            "accommodation_count",
            "accommodation_notes",
            "accommodation_fee",
            "hospitality_fee",
            "needs_transport",
            "transport_note",
            "payment_amount",
            "payment_method",
            "payment_receipt_number",
            "payment_transaction_id",
            "payment_proof_uploaded",
            "payment_rejection_reason",
            "payment_confirmed_at",
            "payment_notes",
            "payment_batch_id",
            "payment_reference",
            "refund_amount",
            "refund_transaction_id",
            "refunded_at",
            "refund_notes",
            "verified_at",
            "cancelled_at",
            "is_captain",
            "can_pay",
            "is_team_full",
            "is_team_paid",
            "is_locked",
            "is_team_locked",
            "meets_minimum_team_size",
            "can_proceed_to_payment",
            "total_team_members_count",
        ]
        read_only_fields = [
            "user",
            "payment_status",
            "approval_status",
            "is_waiting_list",
            "waitlist_position",
            "attendance_marked",
            "verification_attendance_marked",
            "event_attendance_marked",
            "event_attended_at",
            "registration_number",
            "pass_token",
            "entry_qr_status",
            "registered_at",
            "payment_amount",
            "payment_method",
            "payment_receipt_number",
            "payment_transaction_id",
            "payment_proof_uploaded",
            "payment_rejection_reason",
            "payment_confirmed_at",
            "payment_notes",
            "payment_batch_id",
            "payment_reference",
            "refund_amount",
            "refund_transaction_id",
            "refunded_at",
            "refund_notes",
            "verified_at",
            "cancelled_at",
            "is_captain",
            "can_pay",
            "is_team_full",
            "is_team_paid",
            "is_locked",
            "is_team_locked",
            "meets_minimum_team_size",
            "can_proceed_to_payment",
            "total_team_members_count",
            "event_fee",
            "accommodation_fee",
            "food_fee",
            "hospitality_fee",
        ]

    def get_event_fee(self, obj):
        try:
            return str(Decimal(obj.event.registration_fee or 0))
        except Exception:
            return "0.00"

    def get_accommodation_fee(self, obj):
        if not obj.needs_accommodation:
            return "0.00"
        try:
            count = int(obj.accommodation_count or 1)
            if count < 1:
                count = 1
            return str(accommodation_fee_per_person() * count)
        except Exception:
            return "0.00"

    def get_food_fee(self, obj):
        if not obj.needs_accommodation or not obj.food_preference or str(obj.food_preference).lower() == "none":
            return "0.00"
        try:
            count = int(obj.accommodation_count or 1)
            if count < 1:
                count = 1
            pref = str(obj.food_preference).lower()
            if pref in ("full", "all", "veg", "non_veg", "jain", "package"):
                fee = food_package_fee()
            else:
                meals = [m.strip() for m in pref.replace("+", ",").replace(";", ",").split(",") if m.strip()]
                bf = breakfast_fee() if ("breakfast" in meals or "bf" in meals) else Decimal("0.00")
                ln = lunch_fee() if ("lunch" in meals or "ln" in meals) else Decimal("0.00")
                dn = dinner_fee() if ("dinner" in meals or "dn" in meals) else Decimal("0.00")
                calc = bf + ln + dn
                fee = calc if calc > 0 else food_package_fee()
            return str(fee * count)
        except Exception:
            return "0.00"

    def get_hospitality_fee(self, obj):
        try:
            acc = Decimal(self.get_accommodation_fee(obj))
            food = Decimal(self.get_food_fee(obj))
            return str(acc + food)
        except Exception:
            return "0.00"

    def get_pass_token(self, obj):
        if not obj.registration_number:
            return None
        from .signing import sign_registration_number

        return sign_registration_number(obj.registration_number)

    def get_entry_qr_status(self, obj):
        from .payment import entry_qr_status

        return entry_qr_status(obj)

    def get_payment_proof_uploaded(self, obj):
        return bool(obj.payment_proof)

    def get_is_captain(self, obj):
        request = self.context.get("request")
        if not request or not request.user or not request.user.is_authenticated:
            return False
        return obj.user_id == request.user.id or request.user.is_staff

    def get_can_pay(self, obj):
        request = self.context.get("request")
        if not request or not request.user or not request.user.is_authenticated:
            return False
        is_cap = (obj.user_id == request.user.id or request.user.is_staff)
        is_unpaid = obj.payment_status not in ("paid", "waived")
        return is_cap and is_unpaid and obj.can_proceed_to_payment

    def validate_email(self, value):
        return value.strip().lower()

    def validate_phone(self, value):
        stripped = re.sub(r"\s+", "", str(value or "").strip())
        digits = re.sub(r"\D", "", stripped)

        # 10 digits starting with 6-9
        if len(digits) == 10 and re.match(r"^[6-9]\d{9}$", digits):
            return digits
        # +91 prefix (12 digits, remaining 10 start with 6-9)
        if len(digits) == 12 and digits.startswith("91") and re.match(r"^[6-9]\d{9}$", digits[2:]):
            return digits[2:]

        if len(digits) > 10:
            raise serializers.ValidationError("Mobile number cannot exceed 10 digits.")
        if len(digits) < 10:
            raise serializers.ValidationError("Mobile number must be exactly 10 digits.")
        raise serializers.ValidationError(
            "Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9."
        )

    def validate_gender(self, value):
        val = (value or "").strip().lower()
        if val in ("female", "f"):
            return "female"
        if val in ("others", "other", "o"):
            return "other"
        if val in ("male", "m"):
            return "male"
        return "unspecified"

    def validate(self, attrs):
        user = self.context.get("request").user if self.context.get("request") else None
        event = attrs.get("event")
        if not event and self.instance:
            event = self.instance.event

        if not self.instance and event:
            if not event.is_registration_open:
                raise serializers.ValidationError({"event": f"Registration is closed for {event.title}."})

            if user and Registration.objects.filter(user=user, event=event, cancelled_at__isnull=True).exists():
                raise serializers.ValidationError({"event": "You are already registered for this event."})

        return attrs

    def create(self, validated_data):
        from .services import next_waitlist_position
        event = validated_data.get("event")

        confirmed_count = event.registrations.filter(
            is_waiting_list=False, cancelled_at__isnull=True
        ).count()
        is_waiting = False
        wait_pos = None
        if confirmed_count >= event.max_participants:
            if getattr(event, "waiting_list_enabled", True):
                is_waiting = True
                wait_pos = next_waitlist_position(event)
            else:
                raise serializers.ValidationError({"event": f"{event.title} has reached maximum capacity."})

        validated_data["is_waiting_list"] = is_waiting
        validated_data["waitlist_position"] = wait_pos
        validated_data["approval_status"] = "pending" if is_waiting else "approved"
        if "payment_status" not in validated_data:
            fee = getattr(event, "registration_fee", 0) or 0
            validated_data["payment_status"] = "waived" if fee <= 0 else "pending"
            validated_data["payment_amount"] = fee

        return super().create(validated_data)


class AdminRegistrationSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source="event.title", read_only=True)
    event_audience = serializers.CharField(source="event.audience", read_only=True)
    event_date = serializers.DateField(source="event.event_date", read_only=True)
    verified_by_username = serializers.CharField(source="verified_by.username", read_only=True)
    payment_verified_by_username = serializers.CharField(
        source="payment_verified_by.username", read_only=True
    )
    event_attended_by_username = serializers.CharField(
        source="event_attended_by.username", read_only=True
    )
    payment_proof_url = serializers.SerializerMethodField()
    entry_qr_status = serializers.SerializerMethodField()
    min_team_size = serializers.IntegerField(source="event.min_team_size", read_only=True)
    max_team_size = serializers.IntegerField(source="event.max_team_size", read_only=True)
    team_members = TeamMemberSerializer(many=True, required=False)

    class Meta:
        model = Registration
        fields = [
            "id",
            "user",
            "event",
            "event_title",
            "registration_type",
            "team_name",
            "team_members",
            "participant_name",
            "college_name",
            "department",
            "register_number",
            "email",
            "phone",
            "gender",
            "food_preference",
            "food_notes",
            "needs_accommodation",
            "accommodation_count",
            "accommodation_notes",
            "accommodation_status",
            "accommodation_hostel",
            "accommodation_room",
            "needs_transport",
            "transport_note",
            "payment_status",
            "payment_amount",
            "payment_method",
            "payment_receipt_number",
            "payment_transaction_id",
            "payment_rejection_reason",
            "payment_confirmed_at",
            "payment_notes",
            "payment_batch_id",
            "payment_reference",
            "approval_status",
            "is_waiting_list",
            "waitlist_position",
            "attendance_marked",
            "verification_attendance_marked",
            "event_attendance_marked",
            "event_attended_at",
            "event_attended_by",
            "event_attended_by_username",
            "registration_number",
            "registered_at",
            "entry_qr_status",
            "verified_by_username",
            "payment_verified_by_username",
            "payment_proof_url",
            "cancelled_at",
            "verified_by",
            "verified_at",
            "payment_verified_by",
            "payment_verified_at",
            "event_audience",
            "event_date",
            "min_team_size",
            "max_team_size",
        ]

    def get_entry_qr_status(self, obj):
        from .payment import entry_qr_status

        return entry_qr_status(obj)

    def get_payment_proof_url(self, obj):
        if not obj.payment_proof:
            return None
        request = self.context.get("request")
        from .payment import can_manage_payments

        if request and not can_manage_payments(request.user):
            return None
        url = obj.payment_proof.url
        if request:
            return request.build_absolute_uri(url)
        return url

    def update(self, instance, validated_data):
        from django.utils import timezone
        from .payment import can_manage_payments

        request = self.context.get("request")
        user = request.user if request else None

        payment_keys = {
            "payment_status",
            "payment_rejection_reason",
            "payment_transaction_id",
            "payment_proof",
            "payment_method",
            "payment_receipt_number",
            "payment_amount",
            "payment_notes",
            "payment_confirmed_at",
        }
        if any(k in validated_data for k in payment_keys) and not can_manage_payments(user):
            raise serializers.ValidationError(
                {"payment_status": "Only Finance or Core staff can change payment fields."}
            )

        prev_paid = instance.payment_status
        prev_approval = instance.approval_status
        prev_attendance = instance.attendance_marked
        prev_verification_attendance = instance.verification_attendance_marked
        prev_event_attendance = instance.event_attendance_marked
        prev_needs_stay = instance.needs_accommodation
        instance = super().update(instance, validated_data)

        if instance.needs_accommodation and instance.accommodation_status == "none":
            instance.accommodation_status = "pending"
            instance.save(update_fields=["accommodation_status"])
        if not instance.needs_accommodation and instance.accommodation_status != "none":
            if not prev_needs_stay:
                pass
            elif "accommodation_status" not in validated_data:
                instance.accommodation_status = "none"
                instance.save(update_fields=["accommodation_status"])

        if instance.payment_status == "paid" and prev_paid != "paid":
            if not instance.payment_confirmed_at:
                instance.payment_confirmed_at = timezone.now()
            instance.payment_verified_at = timezone.now()
            if user and user.is_authenticated:
                instance.payment_verified_by = user
            instance.payment_rejection_reason = ""
            instance.save(
                update_fields=[
                    "payment_confirmed_at",
                    "payment_verified_at",
                    "payment_verified_by",
                    "payment_rejection_reason",
                ]
            )
            # Also clear team members if this is a team registration
            instance.team_members.all().update(
                payment_status="paid",
                payment_verified_at=timezone.now(),
                finance_status="verified",
                finance_verified_at=timezone.now(),
            )
            try:
                from .services import send_registration_approval_email
                send_registration_approval_email(instance)
            except Exception:
                pass
        elif instance.approval_status == "approved" and prev_approval != "approved":
            is_cleared = instance.payment_status in ("paid", "waived") or Decimal(instance.payment_amount or 0) <= 0
            if is_cleared:
                try:
                    from .services import send_registration_approval_email
                    send_registration_approval_email(instance)
                except Exception:
                    pass

        if instance.payment_status in ("failed", "rejected") and prev_paid not in ("failed", "rejected"):
            instance.payment_verified_at = None
            instance.payment_verified_by = None
            if instance.payment_status == "failed":
                instance.payment_status = "rejected"
            instance.save(
                update_fields=[
                    "payment_status",
                    "payment_verified_at",
                    "payment_verified_by",
                ]
            )

        # Verification attendance changes (Desk / Gate Check-in)
        if "verification_attendance_marked" in validated_data:
            if instance.verification_attendance_marked and not prev_verification_attendance:
                if not instance.verified_at:
                    instance.verified_at = timezone.now()
                if user and user.is_authenticated:
                    instance.verified_by = user
                instance.attendance_marked = True
                instance.save(update_fields=["verified_at", "verified_by", "attendance_marked"])
            elif not instance.verification_attendance_marked and prev_verification_attendance:
                instance.attendance_marked = False
                instance.save(update_fields=["attendance_marked"])

        # Event attendance changes (Specific Event / Arena Check-in)
        if "event_attendance_marked" in validated_data:
            if instance.event_attendance_marked and not prev_event_attendance:
                instance.event_attended_at = timezone.now()
                if user and user.is_authenticated:
                    instance.event_attended_by = user
                instance.save(update_fields=["event_attended_at", "event_attended_by"])
            elif not instance.event_attendance_marked and prev_event_attendance:
                instance.event_attended_at = None
                instance.event_attended_by = None
                instance.save(update_fields=["event_attended_at", "event_attended_by"])

        # Backward compatibility: if attendance_marked directly passed without verification_attendance_marked
        if "attendance_marked" in validated_data and "verification_attendance_marked" not in validated_data:
            instance.verification_attendance_marked = instance.attendance_marked
            if instance.attendance_marked and not prev_attendance:
                if not instance.verified_at:
                    instance.verified_at = timezone.now()
                if user and user.is_authenticated:
                    instance.verified_by = user
                instance.save(update_fields=["verification_attendance_marked", "verified_at", "verified_by"])
            else:
                instance.save(update_fields=["verification_attendance_marked"])

        return instance


class InstitutionSerializer(serializers.ModelSerializer):
    registration_count = serializers.SerializerMethodField()

    class Meta:
        model = Institution
        fields = ["id", "name", "created_at", "registration_count"]

    def get_registration_count(self, obj):
        return Registration.objects.filter(college_name__iexact=obj.name).count()

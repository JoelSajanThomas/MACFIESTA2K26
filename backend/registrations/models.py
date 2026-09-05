import uuid

from django.conf import settings
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from events.models import Event


class Registration(models.Model):
    REGISTRATION_TYPE_CHOICES = [
        ("individual", "Individual"),
        ("team", "Team"),
    ]

    PAYMENT_STATUS_CHOICES = [
        ("pending", "Pending"),
        ("initiated", "Initiated"),
        ("paid", "Paid"),
        ("failed", "Failed"),
        ("cancelled", "Cancelled"),
        ("rejected", "Rejected"),
        ("refunded", "Refunded"),
        ("waived", "Waived"),
    ]

    APPROVAL_STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("cancelled", "Cancelled"),
    ]

    FOOD_CHOICES = [
        ("none", "None"),
        ("veg", "Vegetarian"),
        ("non_veg", "Non-Vegetarian"),
        ("jain", "Jain"),
    ]

    GENDER_CHOICES = [
        ("unspecified", "Prefer not to say"),
        ("male", "Male"),
        ("female", "Female"),
        ("other", "Other"),
        ("others", "Others"),
    ]

    ACCOMMODATION_STATUS_CHOICES = [
        ("none", "Not required"),
        ("pending", "Pending allocation"),
        ("allocated", "Allocated"),
        ("checked_in", "Checked in"),
        ("checked_out", "Checked out"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="registrations")
    event = models.ForeignKey(Event, related_name="registrations", on_delete=models.CASCADE)
    registration_type = models.CharField(
        max_length=20, choices=REGISTRATION_TYPE_CHOICES, default="individual"
    )
    team_name = models.CharField(max_length=150, blank=True)
    participant_name = models.CharField(max_length=150)
    college_name = models.CharField(max_length=200)
    department = models.CharField(max_length=150, blank=True)
    register_number = models.CharField(max_length=50, blank=True)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    gender = models.CharField(
        max_length=20, choices=GENDER_CHOICES, default="unspecified", blank=True
    )
    payment_status = models.CharField(
        max_length=20, choices=PAYMENT_STATUS_CHOICES, default="pending", db_index=True
    )
    approval_status = models.CharField(
        max_length=20, choices=APPROVAL_STATUS_CHOICES, default="approved", db_index=True
    )
    is_waiting_list = models.BooleanField(default=False)
    waitlist_position = models.PositiveIntegerField(null=True, blank=True)
    attendance_marked = models.BooleanField(default=False)
    verification_attendance_marked = models.BooleanField(default=False, db_index=True)
    event_attendance_marked = models.BooleanField(default=False, db_index=True)
    event_attended_at = models.DateTimeField(null=True, blank=True)
    event_attended_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="event_attendances_marked",
    )
    registration_number = models.CharField(max_length=32, blank=True, unique=True, null=True)
    registered_at = models.DateTimeField(auto_now_add=True)
    is_locked = models.BooleanField(default=False, help_text="Locked after payment confirmation to freeze team details.")

    # Lightweight ops fields (desk / committee planning — not full ERP)
    food_preference = models.CharField(max_length=20, choices=FOOD_CHOICES, default="none")
    food_notes = models.CharField(max_length=200, blank=True)
    needs_accommodation = models.BooleanField(default=False)
    accommodation_count = models.PositiveSmallIntegerField(null=True, blank=True)
    accommodation_notes = models.CharField(max_length=200, blank=True)
    accommodation_status = models.CharField(
        max_length=20, choices=ACCOMMODATION_STATUS_CHOICES, default="none"
    )
    accommodation_hostel = models.CharField(max_length=80, blank=True)
    accommodation_room = models.CharField(max_length=40, blank=True)
    needs_transport = models.BooleanField(default=False)
    transport_note = models.CharField(max_length=200, blank=True)

    payment_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    payment_method = models.CharField(max_length=40, blank=True)
    payment_receipt_number = models.CharField(max_length=60, blank=True)
    payment_transaction_id = models.CharField(max_length=80, blank=True)
    payment_proof = models.ImageField(upload_to="registrations/payment_proof/", blank=True, null=True)
    payment_rejection_reason = models.CharField(max_length=255, blank=True)
    payment_confirmed_at = models.DateTimeField(null=True, blank=True)
    payment_notes = models.CharField(max_length=255, blank=True)
    # Shared checkout: one UPI payment can cover multiple event registrations
    payment_batch_id = models.CharField(max_length=40, blank=True, db_index=True)
    payment_reference = models.CharField(max_length=32, blank=True, db_index=True)
    payment_verified_at = models.DateTimeField(null=True, blank=True)
    payment_verified_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="payment_verifications_done",
    )
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    refund_transaction_id = models.CharField(max_length=80, blank=True)
    refunded_at = models.DateTimeField(null=True, blank=True)
    refund_notes = models.CharField(max_length=255, blank=True)
    refunded_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="refunds_processed",
    )

    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="verifications_done",
    )
    cancelled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        # Active duplicate prevention is enforced in the serializer (cancelled rows may re-register).
        # registration_number itself is unique=True on the field.
        indexes = [
            models.Index(fields=["event", "is_waiting_list"]),
            models.Index(fields=["registration_number"]),
        ]

    def assign_registration_number(self):
        if self.registration_number:
            return
        year = timezone.localdate().year % 100
        code = (self.event.slug or "EVT")[:3].upper()
        # Temporary unique until pk is known; finalized after first save when possible
        self.registration_number = f"MCF{year:02d}-{code}-{uuid.uuid4().hex[:4].upper()}"

    def finalize_registration_number(self):
        if not self.pk:
            return
        year = timezone.localdate().year % 100
        code = (self.event.slug or "EVT")[:3].upper()
        desired = f"MCF{year:02d}-{code}-{self.pk:04d}"
        if self.registration_number != desired:
            # Ensure uniqueness if collision
            if (
                not Registration.objects.filter(registration_number=desired)
                .exclude(pk=self.pk)
                .exists()
            ):
                self.registration_number = desired
                Registration.objects.filter(pk=self.pk).update(registration_number=desired)

    def save(self, *args, **kwargs):
        creating = self.pk is None
        if not self.registration_number:
            self.assign_registration_number()
        super().save(*args, **kwargs)
        if creating:
            self.finalize_registration_number()

    @property
    def is_team_event(self):
        return self.registration_type == "team" or (self.event and (self.event.max_team_size or 1) > 1)

    @property
    def total_team_members_count(self):
        # Count all members in team_members (Captain + team members)
        count = self.team_members.exclude(invitation_status="declined").count()
        has_captain = self.team_members.filter(role="captain").exclude(invitation_status="declined").exists()
        if not has_captain:
            count += 1
        return count

    @property
    def meets_minimum_team_size(self):
        min_size = self.event.min_team_size or 1
        return self.total_team_members_count >= min_size

    @property
    def exceeds_maximum_team_size(self):
        max_size = self.event.max_team_size or 999
        return self.total_team_members_count > max_size

    @property
    def can_proceed_to_payment(self):
        return self.meets_minimum_team_size and not self.exceeds_maximum_team_size

    @property
    def is_team_full(self):
        return self.meets_minimum_team_size

    @property
    def is_team_paid(self):
        # One single payment by Captain covers the entire team
        return self.payment_status in ("paid", "waived")

    @property
    def is_team_locked(self):
        return bool(self.is_locked or self.is_team_paid)

    def __str__(self):
        return f"{self.participant_name} - {self.event.title}"


class Institution(models.Model):
    """College/school names added via Others — shared with later students."""

    name = models.CharField(max_length=200, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class TeamMember(models.Model):
    ROLE_CHOICES = [
        ("captain", "Captain"),
        ("member", "Member"),
    ]

    INVITATION_STATUS_CHOICES = [
        ("pending", "Invitation Pending"),
        ("accepted", "Accepted"),
        ("declined", "Declined"),
    ]

    PAYMENT_STATUS_CHOICES = [
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("failed", "Failed"),
        ("rejected", "Rejected"),
        ("refunded", "Refunded"),
        ("waived", "Waived"),
    ]

    VERIFICATION_STATUS_CHOICES = [
        ("pending", "Pending"),
        ("verified", "Verified"),
        ("rejected", "Rejected"),
    ]

    registration = models.ForeignKey(
        Registration, related_name="team_members", on_delete=models.CASCADE
    )
    user = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="team_memberships",
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="member")
    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    college_name = models.CharField(max_length=200, blank=True)
    department = models.CharField(max_length=150, blank=True)
    register_number = models.CharField(max_length=50, blank=True)
    gender = models.CharField(max_length=20, blank=True, default="unspecified")
    photo = models.ImageField(upload_to="team_members/photos/", blank=True, null=True)

    invitation_status = models.CharField(
        max_length=20, choices=INVITATION_STATUS_CHOICES, default="accepted"
    )
    invited_at = models.DateTimeField(default=timezone.now)
    accepted_at = models.DateTimeField(null=True, blank=True)

    # Per-member independent payment tracking
    payment_status = models.CharField(
        max_length=20, choices=PAYMENT_STATUS_CHOICES, default="pending"
    )
    payment_amount = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    payment_method = models.CharField(max_length=40, blank=True)
    payment_transaction_id = models.CharField(max_length=80, blank=True)
    payment_proof = models.ImageField(
        upload_to="team_members/payment_proof/", blank=True, null=True
    )
    payment_rejection_reason = models.CharField(max_length=255, blank=True)
    payment_verified_at = models.DateTimeField(null=True, blank=True)
    payment_verified_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="member_payment_verifications",
    )

    # Separate Finance & Organizer Verification
    finance_status = models.CharField(
        max_length=20, choices=VERIFICATION_STATUS_CHOICES, default="pending"
    )
    finance_verified_at = models.DateTimeField(null=True, blank=True)
    finance_verified_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="member_finance_verifications",
    )

    organizer_status = models.CharField(
        max_length=20, choices=VERIFICATION_STATUS_CHOICES, default="pending"
    )
    organizer_verified_at = models.DateTimeField(null=True, blank=True)
    organizer_verified_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="member_organizer_verifications",
    )

    attendance_marked = models.BooleanField(default=False)
    verification_attendance_marked = models.BooleanField(default=False)
    event_attendance_marked = models.BooleanField(default=False)
    event_attended_at = models.DateTimeField(null=True, blank=True)
    qr_pass_code = models.CharField(max_length=64, blank=True, unique=True, null=True)

    def save(self, *args, **kwargs):
        if not self.qr_pass_code:
            self.qr_pass_code = f"TMB-{uuid.uuid4().hex[:10].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.role} - {self.registration.team_name or self.registration.registration_number})"

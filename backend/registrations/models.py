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
        ("paid", "Paid"),
        ("failed", "Failed"),
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

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, related_name="registrations", on_delete=models.CASCADE)
    registration_type = models.CharField(
        max_length=20, choices=REGISTRATION_TYPE_CHOICES, default="individual"
    )
    team_name = models.CharField(max_length=150, blank=True)
    participant_name = models.CharField(max_length=150)
    college_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    payment_status = models.CharField(
        max_length=20, choices=PAYMENT_STATUS_CHOICES, default="pending"
    )
    approval_status = models.CharField(
        max_length=20, choices=APPROVAL_STATUS_CHOICES, default="approved"
    )
    is_waiting_list = models.BooleanField(default=False)
    waitlist_position = models.PositiveIntegerField(null=True, blank=True)
    attendance_marked = models.BooleanField(default=False)
    registration_number = models.CharField(max_length=32, blank=True, unique=True, null=True)
    registered_at = models.DateTimeField(auto_now_add=True)

    # Lightweight ops fields (desk / committee planning — not full ERP)
    food_preference = models.CharField(max_length=20, choices=FOOD_CHOICES, default="none")
    food_notes = models.CharField(max_length=200, blank=True)
    needs_accommodation = models.BooleanField(default=False)
    accommodation_count = models.PositiveSmallIntegerField(null=True, blank=True)
    accommodation_notes = models.CharField(max_length=200, blank=True)
    needs_transport = models.BooleanField(default=False)
    transport_note = models.CharField(max_length=200, blank=True)

    payment_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    payment_method = models.CharField(max_length=40, blank=True)
    payment_receipt_number = models.CharField(max_length=60, blank=True)
    payment_confirmed_at = models.DateTimeField(null=True, blank=True)
    payment_notes = models.CharField(max_length=255, blank=True)

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

    def __str__(self):
        return f"{self.participant_name} - {self.event.title}"


class TeamMember(models.Model):
    registration = models.ForeignKey(
        Registration, related_name="team_members", on_delete=models.CASCADE
    )
    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    college_name = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return f"{self.name} ({self.registration.registration_number})"

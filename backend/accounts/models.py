from django.contrib.auth.models import User
from django.db import models

from .permissions import ALL_MODULES, MODULES_BY_COMMITTEE


class StaffProfile(models.Model):
    """Committee role for staff users (same login page, filtered admin tools)."""

    COMMITTEE_CHOICES = [
        ("core", "Core Team"),
        ("finance", "Finance"),
        ("food", "Food"),
        ("hospitality", "Hospitality"),
        ("event", "Event"),
        ("program", "Program"),
        ("cultural", "Cultural"),
        ("publicity", "Publicity"),
        ("invitation", "Invitation"),
        ("verification", "Verification Volunteer"),
        ("judge", "Judge / Jury"),
        ("volunteer", "Volunteer"),
        ("coordinator", "Faculty / Event Coordinator"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="staff_profile")
    committee = models.CharField(max_length=32, choices=COMMITTEE_CHOICES, default="core")
    display_name = models.CharField(max_length=120, blank=True)
    phone = models.CharField(max_length=30, blank=True)
    must_change_password = models.BooleanField(
        default=False,
        help_text="Force password change after login (set True when seeding).",
    )

    class Meta:
        verbose_name = "Staff profile"
        verbose_name_plural = "Staff profiles"

    def __str__(self):
        return f"{self.user.username} ({self.get_committee_display()})"

    @property
    def modules(self):
        if self.user.is_superuser or self.committee == "core":
            return list(ALL_MODULES)
        return list(MODULES_BY_COMMITTEE.get(self.committee, ["insights"]))

    def can_access_module(self, module: str) -> bool:
        if self.user.is_superuser or self.committee == "core":
            return True
        if self.committee == module:
            return True
        return module in self.modules


class ParticipantProfile(models.Model):
    """College / contact details for student accounts (not staff)."""

    GENDER_CHOICES = [
        ("male", "Male"),
        ("female", "Female"),
        ("other", "Other"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="participant_profile")
    college_name = models.CharField(max_length=200, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, default="male")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Participant profile"
        verbose_name_plural = "Participant profiles"

    def __str__(self):
        return f"{self.user.username} ({self.college_name or 'no college'})"


class UniversePollVote(models.Model):
    CHOICES = [
        ("marvel", "Marvel"),
        ("dc", "DC"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="universe_poll_vote")
    choice = models.CharField(max_length=16, choices=CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Universe poll vote"
        verbose_name_plural = "Universe poll votes"

    def __str__(self):
        return f"{self.user_id}:{self.choice}"


class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="audit_logs")
    action = models.CharField(max_length=100)
    resource_type = models.CharField(max_length=80, blank=True)
    resource_id = models.CharField(max_length=60, blank=True)
    details = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __init__(self, *args, **kwargs):
        if "module" in kwargs and "resource_type" not in kwargs:
            kwargs["resource_type"] = kwargs.pop("module")
        super().__init__(*args, **kwargs)

    @property
    def module(self):
        return self.resource_type

    @module.setter
    def module(self, value):
        self.resource_type = value

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Audit log"
        verbose_name_plural = "Audit logs"

    def __str__(self):
        actor = self.user.username if self.user else "System"
        return f"[{self.created_at:%Y-%m-%d %H:%M}] {actor} - {self.action} ({self.resource_type})"


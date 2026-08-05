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

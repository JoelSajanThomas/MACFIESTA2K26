import os

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand, CommandError

from accounts.models import StaffProfile

# Never hardcode a shared seed password in source. Set COMMITTEE_SEED_PASSWORD in the environment.

COMMITTEE_ACCOUNTS = [
    {
        "username": "core",
        "committee": "core",
        "display_name": "Core Team",
        "email": "core@macfiesta.local",
    },
    {
        "username": "finance",
        "committee": "finance",
        "display_name": "Finance Head",
        "email": "finance@macfiesta.local",
    },
    {
        "username": "food",
        "committee": "food",
        "display_name": "Food Head",
        "email": "food@macfiesta.local",
    },
    {
        "username": "hospitality",
        "committee": "hospitality",
        "display_name": "Hospitality Head",
        "email": "hospitality@macfiesta.local",
    },
    {
        "username": "event",
        "committee": "event",
        "display_name": "Event Head",
        "email": "event@macfiesta.local",
    },
    {
        "username": "program",
        "committee": "program",
        "display_name": "Program Head",
        "email": "program@macfiesta.local",
    },
    {
        "username": "cultural",
        "committee": "cultural",
        "display_name": "Cultural Head",
        "email": "cultural@macfiesta.local",
    },
    {
        "username": "publicity",
        "committee": "publicity",
        "display_name": "Publicity Head",
        "email": "publicity@macfiesta.local",
    },
    {
        "username": "invitation",
        "committee": "invitation",
        "display_name": "Invitation Head",
        "email": "invitation@macfiesta.local",
    },
    {
        "username": "verification",
        "committee": "verification",
        "display_name": "Verification Desk",
        "email": "verify@macfiesta.local",
    },
]


class Command(BaseCommand):
    help = (
        "Create staff logins for each MacFiesta committee (idempotent). "
        "Requires COMMITTEE_SEED_PASSWORD in the environment. "
        "Never print passwords. Change them immediately after first login."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--dev-testuser",
            action="store_true",
            help="Also create/enable local-only testuser (never use in production).",
        )
        parser.add_argument(
            "--disable-testuser",
            action="store_true",
            help="Deactivate testuser if it exists (recommended for production).",
        )

    def handle(self, *args, **options):
        password = os.environ.get("COMMITTEE_SEED_PASSWORD")
        if not password:
            raise CommandError(
                "Set COMMITTEE_SEED_PASSWORD in the environment before seeding. "
                "Do not commit that value. Example (PowerShell): "
                "$env:COMMITTEE_SEED_PASSWORD = 'your-strong-temporary-password'"
            )

        for row in COMMITTEE_ACCOUNTS:
            username = row["username"]
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": row["email"],
                    "is_staff": True,
                    "is_active": True,
                },
            )
            if not created:
                user.email = row["email"]
                user.is_staff = True
                user.is_active = True
                user.save(update_fields=["email", "is_staff", "is_active"])
            user.set_password(password)
            user.save()

            StaffProfile.objects.update_or_create(
                user=user,
                defaults={
                    "committee": row["committee"],
                    "display_name": row["display_name"],
                    "must_change_password": True,
                },
            )
            action = "Created" if created else "Updated"
            self.stdout.write(self.style.SUCCESS(f"{action}: {username} ({row['committee']})"))

        if options["dev_testuser"]:
            user, created = User.objects.get_or_create(
                username="testuser",
                defaults={
                    "email": "testuser@macfiesta.local",
                    "is_staff": True,
                    "is_active": True,
                },
            )
            user.is_staff = True
            user.is_active = True
            user.set_password(password)
            user.save()
            StaffProfile.objects.update_or_create(
                user=user,
                defaults={
                    "committee": "core",
                    "display_name": "Test Coordinator",
                    "must_change_password": True,
                },
            )
            self.stdout.write(
                self.style.WARNING(
                    f"{'Created' if created else 'Updated'}: testuser (dev only)"
                )
            )

        if options["disable_testuser"]:
            updated = User.objects.filter(username="testuser").update(is_active=False, is_staff=False)
            if updated:
                self.stdout.write(self.style.WARNING("Disabled: testuser"))
            else:
                self.stdout.write("testuser not found (nothing to disable).")

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS("Passwords set from COMMITTEE_SEED_PASSWORD (value not printed).")
        )
        self.stdout.write(
            self.style.WARNING(
                "Require password change on first login (must_change_password=True). "
                "Change all seeded passwords before public launch."
            )
        )

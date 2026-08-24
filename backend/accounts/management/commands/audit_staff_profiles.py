"""Report staff users and StaffProfile coverage (no passwords)."""

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand, CommandError

from accounts.models import StaffProfile
from accounts.permissions import user_modules


class Command(BaseCommand):
    help = (
        "Audit staff accounts: username, StaffProfile presence, committee, modules. "
        "Never prints passwords. Fails (exit 1) if any non-superuser staff lacks a "
        "StaffProfile unless --no-fail-on-missing is passed."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--no-fail-on-missing",
            action="store_true",
            help="Report only; always exit 0.",
        )

    def handle(self, *args, **options):
        fail_on_missing = not options.get("no_fail_on_missing")
        staff_qs = (
            User.objects.filter(is_staff=True)
            .select_related("staff_profile")
            .order_by("username")
        )

        missing = []
        self.stdout.write(
            "username | superuser | profile | committee | must_change_pw | modules"
        )
        self.stdout.write("-" * 100)

        for user in staff_qs:
            profile = getattr(user, "staff_profile", None)
            has_profile = profile is not None
            committee = profile.committee if has_profile else "-"
            must_change = str(bool(profile.must_change_password)) if has_profile else "-"
            modules = ",".join(user_modules(user))

            self.stdout.write(
                f"{user.username} | {user.is_superuser} | "
                f"{'yes' if has_profile else 'NO'} | {committee} | {must_change} | {modules}"
            )

            if not has_profile and not user.is_superuser:
                missing.append(user.username)

        self.stdout.write("")
        self.stdout.write(f"Staff users: {staff_qs.count()}")
        self.stdout.write(f"StaffProfile rows: {StaffProfile.objects.count()}")
        self.stdout.write(f"Missing StaffProfile (non-superuser): {len(missing)}")

        if missing:
            self.stdout.write(self.style.WARNING("Missing profiles: " + ", ".join(missing)))
            self.stdout.write(
                self.style.WARNING(
                    "These accounts currently receive ALL modules via legacy fallback. "
                    "Create a StaffProfile (or re-run seed_committee_accounts for known desks) "
                    "before production open. This command does not assign permissions."
                )
            )
            if fail_on_missing:
                raise CommandError(
                    f"{len(missing)} staff user(s) missing StaffProfile: {', '.join(missing)}"
                )
        else:
            self.stdout.write(
                self.style.SUCCESS("All non-superuser staff have a StaffProfile.")
            )

from django.contrib.auth.models import User

from django.core.management.base import BaseCommand, CommandError



from accounts.desk_accounts import DESK_COMMITTEES, iter_desk_accounts

from accounts.models import StaffProfile





class Command(BaseCommand):

    help = (

        "Create/update committee desk admin logins from environment credentials "

        "(DESK_PASSWORD_<COMMITTEE> or DESK_PASSWORD_TEMPLATE). "

        "Never prints passwords. Intended for local/staging — rotate before launch."

    )



    def add_arguments(self, parser):

        parser.add_argument(

            "--deactivate-legacy-shortnames",

            action="store_true",

            help="Deactivate legacy short usernames (finance, food, …) if present.",

        )



    def handle(self, *args, **options):

        rows = list(iter_desk_accounts())

        missing = [r["committee"] for r in rows if not r["password"]]

        if missing:

            raise CommandError(

                "Missing desk passwords in environment for: "

                + ", ".join(missing)

                + ". Set DESK_PASSWORD_TEMPLATE (with {committee}) or "

                "DESK_PASSWORD_<COMMITTEE> in backend/.env. "

                "Do not commit real passwords."

            )



        created_n = 0

        updated_n = 0



        for row in rows:

            user, created = User.objects.get_or_create(

                username=row["username"],

                defaults={

                    "email": row["email"],

                    "is_staff": True,

                    "is_active": True,

                },

            )

            user.email = row["email"]

            user.is_staff = True

            user.is_active = True

            user.set_password(row["password"])

            user.save()



            StaffProfile.objects.update_or_create(

                user=user,

                defaults={

                    "committee": row["committee"],

                    "display_name": row["display_name"],

                    "must_change_password": False,

                },

            )



            if created:

                created_n += 1

                self.stdout.write(self.style.SUCCESS(f"Created: {row['username']} ({row['committee']})"))

            else:

                updated_n += 1

                self.stdout.write(self.style.SUCCESS(f"Updated: {row['username']} ({row['committee']})"))



        if options["deactivate_legacy_shortnames"]:

            legacy = User.objects.filter(username__in=DESK_COMMITTEES, is_active=True)

            n = legacy.update(is_active=False)

            self.stdout.write(self.style.WARNING(f"Deactivated {n} legacy shortname desk account(s)."))



        self.stdout.write("")

        self.stdout.write(self.style.SUCCESS(f"Desk admins ready — created {created_n}, updated {updated_n}."))

        self.stdout.write(

            self.style.WARNING(

                "Passwords were read from .env (not printed). "

                "Login via /desks. Rotate credentials before production."

            )

        )



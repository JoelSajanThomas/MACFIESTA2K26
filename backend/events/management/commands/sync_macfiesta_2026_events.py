from django.core.management.base import BaseCommand
from django.db import transaction

from events.macfiesta_2026_catalog import (
    OFFICIAL_EVENTS,
    OFFICIAL_SLUGS,
    PLANNING_TARGETS,
    RETIRED_SLUGS,
)
from events.models import Event

# Fields updated on every sync (safe overwrite of catalogue data).
SYNC_FIELDS = (
    "title",
    "category",
    "audience",
    "department",
    "description",
    "event_date",
    "event_time",
    "event_end_time",
    "registration_fee",
    "prize_pool",
)


class Command(BaseCommand):
    help = (
        "Idempotently create/update official MacFiesta 2026 competitive events "
        "by stable slug. Does not delete events that have registrations."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--retire-demos",
            action="store_true",
            help=(
                "Mark non-official events as cancelled and close registration "
                "(never deletes; preserves registration history)."
            ),
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Print actions without writing to the database.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        dry = options["dry_run"]
        created = updated = 0

        for spec in OFFICIAL_EVENTS:
            slug = spec["slug"]
            defaults = {k: spec[k] for k in SYNC_FIELDS}

            existing = Event.objects.filter(slug=slug).first()
            if existing:
                changes = []
                for field in SYNC_FIELDS:
                    new_val = defaults[field]
                    old_val = getattr(existing, field)
                    if old_val != new_val:
                        changes.append(field)
                        if not dry:
                            setattr(existing, field, new_val)
                # Ensure cancelled official events are restored to upcoming + open.
                if existing.status == "cancelled":
                    changes.append("status")
                    if not dry:
                        existing.status = "upcoming"
                # Venue never invented — only fill blank venues with TBD; keep custom venues.
                if not existing.venue:
                    changes.append("venue")
                    if not dry:
                        existing.venue = "TBD"
                if changes and not dry:
                    existing.save()
                if changes:
                    updated += 1
                    self.stdout.write(f"UPDATE {slug} ({', '.join(changes)})")
                else:
                    self.stdout.write(f"OK     {slug} (unchanged)")
            else:
                if not dry:
                    Event.objects.create(
                        slug=slug,
                        venue="TBD",
                        status="upcoming",
                        is_registration_open=True,
                        waiting_list_enabled=True,
                        max_participants=100,
                        **defaults,
                    )
                created += 1
                self.stdout.write(self.style.SUCCESS(f"CREATE {slug}"))

        retired = 0
        if options["retire_demos"]:
            demos = Event.objects.exclude(slug__in=OFFICIAL_SLUGS)
            # Always retire explicitly replaced catalogue slugs.
            demos = demos | Event.objects.filter(slug__in=RETIRED_SLUGS)
            demos = demos.distinct()
            for ev in demos:
                if ev.slug in OFFICIAL_SLUGS:
                    continue
                if ev.status == "cancelled" and not ev.is_registration_open:
                    continue
                retired += 1
                self.stdout.write(
                    self.style.WARNING(
                        f"RETIRE {ev.slug} (regs={ev.registrations.count()}) — cancelled, not deleted"
                    )
                )
                if not dry:
                    ev.status = "cancelled"
                    ev.is_registration_open = False
                    ev.save(update_fields=["status", "is_registration_open"])

        self.stdout.write("")
        self.stdout.write(
            f"Done. created={created} updated={updated} retired={retired} dry_run={dry}"
        )
        self.stdout.write(
            "Planning targets (NOT hard capacity — admin reference only):"
        )
        for slug, target in PLANNING_TARGETS.items():
            self.stdout.write(f"  - {slug}: {target}")
        if dry:
            transaction.set_rollback(True)
            self.stdout.write(self.style.WARNING("Dry run — no changes committed."))

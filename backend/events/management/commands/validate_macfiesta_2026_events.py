from django.core.management.base import BaseCommand
from django.db.models import Sum

from events.macfiesta_2026_catalog import (
    COLLEGE_EVENTS,
    DAY1_DATE,
    DAY2_DATE,
    OFFICIAL_SLUGS,
    SCHOOL_EVENTS,
)
from events.models import Event


class Command(BaseCommand):
    help = "Validate DB events against the official MacFiesta 2026 catalogue."

    def handle(self, *args, **options):
        errors = []

        school = list(Event.objects.filter(audience="school", status="upcoming").order_by("title"))
        college = list(Event.objects.filter(audience="college", status="upcoming").order_by("title"))

        school_titles = {e.title for e in school}
        college_titles = {e.title for e in college}
        expected_school = {e["title"] for e in SCHOOL_EVENTS}
        expected_college = {e["title"] for e in COLLEGE_EVENTS}

        if school_titles != expected_school:
            errors.append(f"School titles mismatch: {school_titles ^ expected_school}")
        if college_titles != expected_college:
            errors.append(f"College titles mismatch: {college_titles ^ expected_college}")

        for spec in SCHOOL_EVENTS + COLLEGE_EVENTS:
            ev = Event.objects.filter(slug=spec["slug"]).first()
            if not ev:
                errors.append(f"Missing slug {spec['slug']}")
                continue
            for field in (
                "title",
                "category",
                "audience",
                "department",
                "event_date",
                "event_time",
                "event_end_time",
                "registration_fee",
                "prize_pool",
            ):
                if getattr(ev, field) != spec[field]:
                    errors.append(
                        f"{spec['slug']}.{field}: db={getattr(ev, field)!r} expected={spec[field]!r}"
                    )

        expo = Event.objects.filter(slug="school-stark-expo").first()
        if not expo:
            errors.append("Missing STARK EXPO (school-stark-expo)")

        day1 = Event.objects.filter(
            audience="school", event_date=DAY1_DATE, status="upcoming"
        ).count()
        day2 = Event.objects.filter(
            audience="college", event_date=DAY2_DATE, status="upcoming"
        ).count()
        if day1 != len(SCHOOL_EVENTS):
            errors.append(f"Day1 count {day1} != {len(SCHOOL_EVENTS)}")
        if day2 != len(COLLEGE_EVENTS):
            errors.append(f"Day2 count {day2} != {len(COLLEGE_EVENTS)}")

        prize_sum = (
            Event.objects.filter(
                audience="college", prize_pool__isnull=False, status="upcoming"
            ).aggregate(t=Sum("prize_pool"))["t"]
            or 0
        )
        expected_prize = sum(e["prize_pool"] for e in COLLEGE_EVENTS)
        if prize_sum != expected_prize:
            errors.append(f"College prize sum {prize_sum} != {expected_prize}")

        # Internal org budgets must never appear as registration fees / prize pools.
        for bad in (35000, 96000, 4000, 150000):
            if Event.objects.filter(registration_fee=bad).exists():
                errors.append(f"Internal budget value {bad} found as registration_fee")
            if Event.objects.filter(prize_pool=bad).exists():
                errors.append(f"Internal budget value {bad} found as prize_pool")

        leaked = Event.objects.exclude(slug__in=OFFICIAL_SLUGS).exclude(status="cancelled")
        if leaked.exists():
            errors.append(
                "Non-official active events: " + ", ".join(leaked.values_list("slug", flat=True))
            )

        if errors:
            for e in errors:
                self.stderr.write(self.style.ERROR(f"FAIL: {e}"))
            raise SystemExit(1)

        self.stdout.write(self.style.SUCCESS("PASS: MacFiesta 2026 event catalogue matches specification."))
        self.stdout.write(f"  School events: {len(school)}")
        self.stdout.write(f"  College events: {len(college)}")
        self.stdout.write(f"  College prize pool total: Rs {prize_sum}")

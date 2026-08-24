from django.core.management.base import BaseCommand

from cms.models import (
    SiteSetting,
    FestivalHighlight,
    EventCategoryContent,
    EventFormat,
    GuestProfile,
    ThemeSection,
    Testimonial,
    FAQ,
    Sponsor,
    HomepageSection,
)


HOMEPAGE_SECTIONS = [
    ("hero", "Hero", "", 1),
    ("live_updates", "Live Updates", "", 2),
    ("about", "About MacFiesta", "Two days. One campus. Every arena.", 3),
    ("formats", "Event Formats", "Solo, duo, trio, squad, or group.", 4),
    ("highlights", "Festival Highlights", "The experiences that make every edition unforgettable.", 5),
    ("categories", "Event Categories", "Pick your arena — tech, culture, music, dance, gaming, and more.", 6),
    ("theme", "This Year's Theme", "", 7),
    ("guests", "Guest Profiles", "Sessions and appearances you won't want to miss.", 8),
    ("rewind", "Fest Rewind", "", 9),
    ("featured_events", "Featured Events", "Open competitions with live registration counts.", 10),
    ("statistics", "Festival Statistics", "Real-time numbers from the MacFiesta dashboard.", 11),
    ("winners", "Winners Preview", "Celebrating excellence across competitions.", 12),
    ("gallery", "Gallery Preview", "Glimpses from past editions and this year's fest.", 13),
    ("announcements", "Announcements", "Official fest updates and coordinator notices.", 14),
    ("sponsors", "Our Sponsors", "Campus partners and sponsors.", 15),
    ("testimonials", "Testimonials", "Voices from delegates and coordinators.", 16),
    ("faq", "FAQ", "Everything you need to know before the fest begins.", 17),
    ("cta", "Registration CTA", "Head to the registration desk.", 18),
]


class Command(BaseCommand):
    help = "Seed default CMS content (safe to run multiple times — skips existing records)"

    def handle(self, *args, **options):
        self._seed_site_settings()
        self._seed_highlights()
        self._seed_categories()
        self._seed_formats()
        self._seed_theme()
        self._seed_guests()
        self._seed_testimonials()
        self._seed_faqs()
        self._seed_sponsors()
        self._seed_homepage_sections()
        self.stdout.write(self.style.SUCCESS("CMS seed complete."))

    def _seed_site_settings(self):
        if SiteSetting.objects.exists():
            self.stdout.write("Site settings already exist — skipped.")
            return
        SiteSetting.objects.create(
            fest_name="MacFiesta",
            fest_year=2026,
            tagline="Heroes Rise. Legends Compete.",
            college_name="MACFAST",
            hero_title="MACFIESTA",
            hero_subtitle="Marvel × DC — Superhero Universe",
            hero_description="A modern cinematic Marvel & DC fest — two universes, one ultimate celebration at MACFAST.",
            fest_date="2026-09-24",
            venue="MACFAST Campus, Thiruvalla",
            location="Pathanamthitta, Kerala, India",
            contact_email="fest@macfast.ac.in",
            contact_phone="",
            official_website="https://macfiesta.macfast.org/",
            instagram_url="https://instagram.com/macfiesta",
            youtube_url="https://youtube.com/@macfiesta",
            facebook_url="https://facebook.com/macfiesta",
            about_title="Two days. One campus. Every arena.",
            about_body=(
                "MacFiesta 2026 brings together students from schools and colleges across India "
                "for two days of competitions, creativity, technology, culture, gaming, and "
                "entertainment at MACFAST, Thiruvalla."
            ),
        )
        self.stdout.write("Created site settings.")

    def _seed_highlights(self):
        if FestivalHighlight.objects.exists():
            return
        data = [
            ("🌏", "National Participation", "Student teams from colleges across India — competing at MACFAST campus venues."),
            ("🎤", "Main Stage & Cultural Night", "Evening performances, fashion walks, and DJ night at the open-air main stage."),
            ("📋", "Live Fest Desk", "Registration counts, schedules, and result desk updates — all on MacFiesta Pro."),
        ]
        for i, (icon, title, desc) in enumerate(data):
            FestivalHighlight.objects.create(icon=icon, title=title, description=desc, order=i)
        self.stdout.write(f"Created {len(data)} highlights.")

    def _seed_categories(self):
        if EventCategoryContent.objects.exists():
            return
        cats = [
            ("Technology", "💻"), ("Arts", "🎨"), ("Music", "🎵"), ("Dance", "💃"),
            ("Gaming", "🎮"), ("Management", "📊"), ("Literary", "📚"),
            ("Photography", "📷"), ("Sports", "⚽"), ("Workshops", "🛠"),
        ]
        for i, (name, icon) in enumerate(cats):
            EventCategoryContent.objects.create(name=name, icon=icon, order=i)
        self.stdout.write(f"Created {len(cats)} category cards.")

    def _seed_formats(self):
        if EventFormat.objects.exists():
            return
        formats = [
            ("1", "Solo", "Walk in alone — one participant, one shot at the podium."),
            ("2", "Duo", "Pair up with a teammate for two-person competitions."),
            ("3", "Trio", "Form a three-member team for group-format events."),
            ("4", "Squad", "Four students per squad — common for gaming and tech battles."),
            ("∞", "Group", "Full crew events for cultural performances and stage acts."),
        ]
        for i, (label, title, desc) in enumerate(formats):
            EventFormat.objects.create(label=label, title=title, description=desc, order=i)
        self.stdout.write(f"Created {len(formats)} event formats.")

    def _seed_theme(self):
        if ThemeSection.objects.exists():
            return
        ThemeSection.objects.create(
            eyebrow="This year's theme",
            title="Marvel × DC",
            description=(
                "Two days of competition, creativity, technology, culture, and entertainment "
                "come together at MACFAST as students rise to take on the MacFiesta arena."
            ),
        )
        self.stdout.write("Created theme section.")

    def _seed_guests(self):
        if GuestProfile.objects.exists():
            return
        GuestProfile.objects.create(
            name="Sayip OP",
            role="Kerala Gamer | Eagle Gaming",
            description=(
                "BGMI streamer and Kerala gaming creator — joining MacFiesta 2026 for an "
                "Eagle Gaming guest session packed with gameplay energy and fan interaction."
            ),
            order=0,
        )
        self.stdout.write("Created guest profile.")

    def _seed_testimonials(self):
        if Testimonial.objects.exists():
            return
        items = [
            ("Last year's main stage lineup kept the whole campus buzzing till midnight.", "Priya N.", "Inter-college Delegate"),
            ("MacFiesta Pro made registration tracking and publishing results straightforward.", "Arun K.", "Fest Coordinator"),
            ("The tech arena and cultural night back-to-back — that's what a national fest should feel like.", "Cultural Club", "MACFAST"),
        ]
        for i, (quote, name, role) in enumerate(items):
            Testimonial.objects.create(quote=quote, name=name, role=role, order=i)
        self.stdout.write(f"Created {len(items)} testimonials.")

    def _seed_faqs(self):
        if FAQ.objects.exists():
            return
        items = [
            ("What is Macfiesta?", "Macfiesta is the national-level inter-college fest of MACFAST. Student teams from colleges across India compete across campus venues."),
            ("How do I register?", "Log in, open Events, pick a competition, and complete the registration form. Slots are limited per event."),
            ("Where are events held?", "Competitions run at the main stage, tech arena, cultural halls, and outdoor venues across MACFAST campus."),
            ("When are results published?", "Coordinators publish winners at the result desk after each event. Results appear on the Results page."),
            ("Who do I contact for help?", "Email registrations@macfast.ac.in or call +91 98765 43211 during fest days."),
        ]
        for i, (q, a) in enumerate(items):
            FAQ.objects.create(question=q, answer=a, order=i)
        self.stdout.write(f"Created {len(items)} FAQs.")

    def _seed_sponsors(self):
        if Sponsor.objects.exists():
            return
        # Host institution only — do not seed placeholder partner names for public display.
        items = [
            ("MACFAST", "Host"),
        ]
        for i, (name, stype) in enumerate(items):
            Sponsor.objects.create(name=name, sponsor_type=stype, order=i)
        self.stdout.write(f"Created {len(items)} sponsors.")

    def _seed_homepage_sections(self):
        created = 0
        for key, title, subtitle, order in HOMEPAGE_SECTIONS:
            _, was_created = HomepageSection.objects.get_or_create(
                section_key=key,
                defaults={"title": title, "subtitle": subtitle, "order": order, "is_visible": True},
            )
            if was_created:
                created += 1
        self.stdout.write(f"Homepage sections: {created} created, {len(HOMEPAGE_SECTIONS) - created} already existed.")

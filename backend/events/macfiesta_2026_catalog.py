"""
MacFiesta 2026 official competitive event catalogue.

Source: final event list PDF (College + School).
Do NOT put organizational budget figures here — they must never reach public APIs.
"""

from datetime import date, time
from decimal import Decimal

DAY1_DATE = date(2026, 9, 24)  # School Event Day
DAY2_DATE = date(2026, 9, 25)  # College Event Day

DAY1_THEME = "Explore • Create • Compete"
DAY2_THEME = "Compete • Innovate • Entertain"

# Addon fee defaults (rupees). Live amounts come from backend/.env via Django settings;
# registrations.fees reads settings — keep these as documentation / offline fallbacks only.
FOOD_PACKAGE_FEE = Decimal("150.00")
ACCOMMODATION_FEE_PER_PERSON = Decimal("300.00")
TRANSPORT_ASSIST_FEE = Decimal("100.00")

PLANNING_TARGETS = {
    "vibe-coding-hackathon": "30–40 participants",
    "coding-challenge": "50–70 participants",
    "bgmi": "16–35 teams",
    "efootball": "16–35 teams",
    "shark-tank": "15–20 teams",
    "photography": "20–50 participants",
    "reels-competition": "20–30 entries",
    "group-dance": "12–16 teams",
    "treasure-hunt": "20–40 teams",
    "cold-investigation": "30–40 participants",
    "escape-room": "20–30 per available slots",
    "master-cook": "teams / slots as available",
    "ultimate-marketing-challenge": "15–25 teams",
}


def _t(h, m=0):
    return time(h, m)


def _event(
    *,
    slug,
    title,
    category,
    audience,
    department,
    description,
    event_date,
    event_time,
    event_end_time,
    registration_fee,
    prize_pool,
    min_team_size=1,
    max_team_size=1,
):
    return {
        "slug": slug,
        "title": title,
        "category": category,
        "audience": audience,
        "department": department,
        "description": description,
        "event_date": event_date,
        "event_time": event_time,
        "event_end_time": event_end_time,
        "registration_fee": Decimal(registration_fee),
        "prize_pool": None if prize_pool is None else Decimal(prize_pool),
        "min_team_size": min_team_size,
        "max_team_size": max_team_size,
    }


# ---------------------------------------------------------------------------
# Day 1 — School Events (final list)
# Registration: Free (₹0.00). Prize pools from official document.
# ---------------------------------------------------------------------------
SCHOOL_EVENTS = [
    _event(
        slug="school-ai-image-creation",
        title="Multiverse: Imagine It (AI Prompt – Image Creation)",
        category="tech",
        audience="school",
        department="Open Event",
        description="School Day — AI prompt image creation.",
        event_date=DAY1_DATE,
        event_time=_t(10, 30),
        event_end_time=_t(12, 30),
        registration_fee="0.00",
        prize_pool="3000.00",
        min_team_size=1,
        max_team_size=1,
    ),
    _event(
        slug="school-photography",
        title="SpiderLens: Freeze the Moment (Photography)",
        category="arts",
        audience="school",
        department="Open Event",
        description="School Day — photography challenge.",
        event_date=DAY1_DATE,
        event_time=_t(10),
        event_end_time=_t(13),
        registration_fee="0.00",
        prize_pool="3000.00",
        min_team_size=1,
        max_team_size=1,
    ),
    _event(
        slug="school-spot-dance",
        title="HeroVerse Dance-Off (Spot Dance)",
        category="arts",
        audience="school",
        department="Major Attraction",
        description="School Day — spot dance.",
        event_date=DAY1_DATE,
        event_time=_t(10, 30),
        event_end_time=_t(12, 30),
        registration_fee="0.00",
        prize_pool="5000.00",
        min_team_size=1,
        max_team_size=1,
    ),
    _event(
        slug="school-treasure-hunt",
        title="The Endgame Heist: Hunt for the Stones (Treasure Hunt)",
        category="general",
        audience="school",
        department="Major Attraction",
        description="School Day — treasure hunt.",
        event_date=DAY1_DATE,
        event_time=_t(10),
        event_end_time=_t(13),
        registration_fee="0.00",
        prize_pool="5000.00",
        min_team_size=3,
        max_team_size=4,
    ),
    _event(
        slug="school-best-out-of-waste",
        title="Groot's Green Mission (Best Out of Waste)",
        category="arts",
        audience="school",
        department="Creative",
        description="School Day — best out of waste.",
        event_date=DAY1_DATE,
        event_time=_t(10),
        event_end_time=_t(13),
        registration_fee="0.00",
        prize_pool="3000.00",
        min_team_size=2,
        max_team_size=2,
    ),
    _event(
        slug="school-mystery-case",
        title="Gotham: Mystery Files (Mystery Case / Detective Challenge)",
        category="general",
        audience="school",
        department="Fun / Problem-Solving",
        description="School Day — mystery case / detective challenge.",
        event_date=DAY1_DATE,
        event_time=_t(10),
        event_end_time=_t(13),
        registration_fee="0.00",
        prize_pool="3000.00",
        min_team_size=2,
        max_team_size=2,
    ),
    _event(
        slug="school-3v3-football",
        title="Justice League: Mini Clash (3v3 Football)",
        category="sports",
        audience="school",
        department="Major Attraction",
        description="School Day — 3v3 football.",
        event_date=DAY1_DATE,
        event_time=_t(10),
        event_end_time=_t(13),
        registration_fee="0.00",
        prize_pool="3000.00",
        min_team_size=3,
        max_team_size=4,
    ),
    _event(
        slug="school-debate-extempore",
        title="Civil War: The Great Ideology Debate (Debate / Extempore)",
        category="general",
        audience="school",
        department="Supporting Event",
        description="School Day — debate / extempore.",
        event_date=DAY1_DATE,
        event_time=_t(10),
        event_end_time=_t(12),
        registration_fee="0.00",
        prize_pool="3000.00",
        min_team_size=1,
        max_team_size=1,
    ),
    _event(
        slug="school-stark-expo",
        title="STARK EXPO",
        category="tech",
        audience="school",
        department="Exhibition / Expo",
        description=(
            "One Expo. Infinite Worlds of Discovery. "
            "A non-competitive free expo and interactive exhibition for students to gain hands-on "
            "experience across different domains: Artificial Intelligence (AI), "
            "Internet of Things (IoT), Science & Experiments, Biology & Life Sciences, "
            "and Psychology & Human Behaviour."
        ),
        event_date=DAY1_DATE,
        event_time=_t(10),
        event_end_time=_t(16),
        registration_fee="0.00",
        prize_pool=None,
        min_team_size=2,
        max_team_size=4,
    ),
]

# ---------------------------------------------------------------------------
# Day 2 — College Events (Official 13 Events)
# ---------------------------------------------------------------------------
COLLEGE_EVENTS = [
    _event(
        slug="vibe-coding-hackathon",
        title="Avengers: Code Assemble (Vibe Coding Hackathon)",
        category="tech",
        audience="college",
        department="Tech Zone",
        description="College Day Tech Zone — vibe coding hackathon.",
        event_date=DAY2_DATE,
        event_time=_t(10),
        event_end_time=_t(16),
        registration_fee="200.00",
        prize_pool="15000.00",
        min_team_size=1,
        max_team_size=3,
    ),
    _event(
        slug="coding-challenge",
        title="The Flash: Code Rush (Coding Challenge)",
        category="tech",
        audience="college",
        department="Tech Zone",
        description="College Day Tech Zone — coding challenge.",
        event_date=DAY2_DATE,
        event_time=_t(11),
        event_end_time=_t(13),
        registration_fee="100.00",
        prize_pool="5000.00",
        min_team_size=1,
        max_team_size=1,
    ),
    _event(
        slug="bgmi",
        title="Battle of Wakanda (BGMI)",
        category="sports",
        audience="college",
        department="Arena Zone",
        description="College Day Arena Zone — Battle of Wakanda (BGMI).",
        event_date=DAY2_DATE,
        event_time=_t(10),
        event_end_time=_t(13),
        registration_fee="200.00",
        prize_pool="7000.00",
        min_team_size=4,
        max_team_size=4,
    ),
    _event(
        slug="efootball",
        title="Justice League: Ultimate XI (EFootball)",
        category="sports",
        audience="college",
        department="Arena Zone",
        description="College Day Arena Zone — eFootball.",
        event_date=DAY2_DATE,
        event_time=_t(10),
        event_end_time=_t(13),
        registration_fee="100.00",
        prize_pool="7000.00",
        min_team_size=1,
        max_team_size=1,
    ),
    _event(
        slug="shark-tank",
        title="Stark Industries: The Pitch (Shark Tank)",
        category="management",
        audience="college",
        department="Business Zone",
        description="College Day Business Zone — Shark Tank.",
        event_date=DAY2_DATE,
        event_time=_t(11),
        event_end_time=_t(13),
        registration_fee="150.00",
        prize_pool="15000.00",
        min_team_size=2,
        max_team_size=2,
    ),
    _event(
        slug="photography",
        title="Spider-Verse: Frame Hunt (Photography)",
        category="arts",
        audience="college",
        department="Creative Zone",
        description="College Day Creative Zone — photography.",
        event_date=DAY2_DATE,
        event_time=_t(10),
        event_end_time=_t(14),
        registration_fee="100.00",
        prize_pool="5000.00",
        min_team_size=1,
        max_team_size=1,
    ),
    _event(
        slug="reels-competition",
        title="Deadpool: Reel Chaos (Reels Competition)",
        category="arts",
        audience="college",
        department="Talent Zone",
        description="College Day Talent Zone — reels competition.",
        event_date=DAY2_DATE,
        event_time=_t(10),
        event_end_time=_t(14),
        registration_fee="100.00",
        prize_pool="5000.00",
        min_team_size=1,
        max_team_size=1,
    ),
    _event(
        slug="group-dance",
        title="Guardians of the Galaxy: Dance Off (Group Dance)",
        category="arts",
        audience="college",
        department="Talent Zone",
        description="College Day Talent Zone — group dance.",
        event_date=DAY2_DATE,
        event_time=_t(11),
        event_end_time=_t(13),
        registration_fee="150.00",
        prize_pool="5000.00",
        min_team_size=4,
        max_team_size=8,
    ),
    _event(
        slug="treasure-hunt",
        title="The Dark Knight: Hunt for the Signal (Treasure Hunt)",
        category="general",
        audience="college",
        department="Adventure / Mystery Zone",
        description="College Day Adventure / Mystery Zone — treasure hunt.",
        event_date=DAY2_DATE,
        event_time=_t(10),
        event_end_time=_t(13),
        registration_fee="200.00",
        prize_pool="15000.00",
        min_team_size=4,
        max_team_size=4,
    ),
    _event(
        slug="cold-investigation",
        title="Batman: Gotham Files (Cold Investigation)",
        category="general",
        audience="college",
        department="Adventure / Mystery Zone",
        description="College Day Adventure / Mystery Zone — cold investigation.",
        event_date=DAY2_DATE,
        event_time=_t(10),
        event_end_time=_t(14),
        registration_fee="150.00",
        prize_pool="7000.00",
        min_team_size=2,
        max_team_size=4,
    ),
    _event(
        slug="escape-room",
        title="Doctor Strange: Multiverse Escape (Escape Room)",
        category="general",
        audience="college",
        department="Adventure / Mystery Zone",
        description="College Day Adventure / Mystery Zone — escape room.",
        event_date=DAY2_DATE,
        event_time=_t(10),
        event_end_time=_t(13),
        registration_fee="200.00",
        prize_pool="5000.00",
        min_team_size=2,
        max_team_size=4,
    ),
    _event(
        slug="master-cook",
        title="Iron Chef: Battle of Heroes (Master Cook)",
        category="arts",
        audience="college",
        department="Creative Zone",
        description="College Day Creative Zone — Master Cook.",
        event_date=DAY2_DATE,
        event_time=_t(10),
        event_end_time=_t(13),
        registration_fee="200.00",
        prize_pool="10000.00",
        min_team_size=2,
        max_team_size=2,
    ),
    _event(
        slug="ultimate-marketing-challenge",
        title="LexCorp vs Stark Industries (The Ultimate Marketing Challenge)",
        category="management",
        audience="college",
        department="Business Zone",
        description="College Day Business Zone — ultimate marketing challenge.",
        event_date=DAY2_DATE,
        event_time=_t(10, 30),
        event_end_time=_t(13, 30),
        registration_fee="150.00",
        prize_pool="10000.00",
        min_team_size=2,
        max_team_size=4,
    ),
]

OFFICIAL_EVENTS = SCHOOL_EVENTS + COLLEGE_EVENTS
OFFICIAL_SLUGS = {e["slug"] for e in OFFICIAL_EVENTS}

# Legacy/retired slugs removed from the official catalog
RETIRED_SLUGS = {
    "school-innovation-expo",
}

BEST_PARTICIPATING_SCHOOL = {
    "title": "Best Participating School — Overall Trophy",
    "day": "Day 1",
    "points": [
        "Awarded at the end of Day 1",
        "Based on overall points earned across events",
        "Additional points for active participation",
    ],
}

BEST_PARTICIPATING_COLLEGE = {
    "title": "Best Participating College — Overall Trophy",
    "day": "Day 2",
    "points": [
        "Awarded at the end of Day 2",
        "Based on overall points earned across events",
        "Additional points for active participation",
    ],
}

MINI_GAMES = {
    "title": "Mini Games & Activity Zone",
    "activities": [
        "Target Throw",
        "Ping-Pong Cup Toss",
        "Knock the Cans",
        "Ring Toss",
        "Bell Protocol",
        "Carrom",
        "Spin the Wheel",
        "Rubik's Cube",
    ],
    "pricing_notes": [
        "Most games: ₹10",
        "Bell Protocol: ₹20",
        "Some activities: Free",
    ],
}

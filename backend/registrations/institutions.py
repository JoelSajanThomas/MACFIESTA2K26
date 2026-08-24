"""Seed + helpers for college/school institution picker."""

from __future__ import annotations

import re

SEED_INSTITUTIONS = [
    "MACFAST",
    "Bishop Moore College",
    "Christian College, Chengannur",
    "MSM College, Kayamkulam",
    "N.S.S. College, Cherthala",
    "SN College, Cherthala",
    "SD College, Alappuzha",
    "St. Joseph's College for Women, Alappuzha",
    "St. Michael's College, Cherthala",
    "TKMM College, Nangiarkulangara",
    "SN College, Chengannur",
    "Sree Ayyappa College, Eramallikara",
    "Fatima Mata National College",
    "Sree Narayana College for Women, Kollam",
    "SN College, Kollam",
    "Government Arts & Science College, Thazhava",
    "Baby John Memorial Government College",
    "Kumpalathu Sanku Pillai Memorial Devaswom Board College",
    "TKM College of Arts & Science, Karicode",
    "St. Gregorios College, Kottarakkara",
    "St. Stephen's College, Pathanapuram",
    "NSS College Nilamel",
    "St. John's College, Anchal",
    "Sree Narayana College, Punalur",
    "MMNSS College Kottiyam",
    "SN College, Chathannur",
    "Ayyankali Memorial Arts and Science College",
    "St. Cyril's College, Adoor",
    "N.S.S. College, Pandalam",
    "Government College for Women, Thiruvananthapuram",
    "St. Xavier's College, Thumba",
    "University College, Thiruvananthapuram",
    "Government College, Kariavattom",
    "Government Sanskrit College, Thiruvananthapuram",
    "Government College, Attingal",
    "Government College, Nedumangad",
    "Kunjukrishnan Nadar Memorial Government Arts and Science College",
    "All Saints College, Thiruvananthapuram",
    "H.H. Maharani Sethu Parvathi Bai N.S.S. College for Women",
    "Mahatma Gandhi College",
    "Mar Ivanios College",
    "S.N. College, Sivagiri",
    "Sree Narayana College, Chempazhanthy",
    "VTM NSS College, Dhanuvachapuram",
    "Adi Shankara Institute of Engineering and Technology",
    "Al Azhar College of Engineering and Technology",
    "Albertian Institute of Science and Technology",
    "Amal Jyothi College of Engineering",
    "Baselios Poulose II Catholicos College",
    "Baselios Poulose Second College",
    "Baselius College",
    "Berchmans Institute of Management Studies",
    "Bharata Mata College",
    "Bishop Chulaparambil Memorial College for Women",
    "CMS College Kottayam",
    "Christ Knowledge City",
    "Cochin College",
    "College of Applied Science, Pathanamthitta",
    "College of Applied Science, Muvattupuzha",
    "College of Applied Science, Piravom",
    "College of Applied Science, Kothamangalam",
    "College of Applied Science, Kottayam",
    "College of Applied Science, Punnappra",
    "College of Applied Science, Kanjirappally",
]

_WHITESPACE = re.compile(r"\s+")


def normalize_institution_name(value: str) -> str:
    name = _WHITESPACE.sub(" ", (value or "").strip())
    return name[:200]


def ensure_institution(name: str) -> str | None:
    """Persist a custom institution so later students can pick it."""
    cleaned = normalize_institution_name(name)
    if len(cleaned) < 2:
        return None

    seed_keys = {s.casefold() for s in SEED_INSTITUTIONS}
    if cleaned.casefold() in seed_keys:
        return cleaned

    from .models import Institution

    existing = Institution.objects.filter(name__iexact=cleaned).first()
    if existing:
        return existing.name
    return Institution.objects.create(name=cleaned).name


def list_institutions() -> list[str]:
    from .models import Institution, Registration

    names = set(SEED_INSTITUTIONS)
    names.update(
        Institution.objects.order_by("name").values_list("name", flat=True)
    )
    names.update(
        Registration.objects.exclude(college_name="")
        .values_list("college_name", flat=True)
        .distinct()
    )
    # Drop empty / whitespace-only
    cleaned = {normalize_institution_name(n) for n in names if normalize_institution_name(n)}
    return sorted(cleaned, key=str.casefold)

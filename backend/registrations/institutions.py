"""Seed + helpers for college/school institution picker."""

from __future__ import annotations

import re

SEED_INSTITUTIONS = [
    # Pathanamthitta & Central Travancore Colleges
    "Titus II Teachers College, Tiruvalla",
    "Mar Thoma College, Tiruvalla",
    "Believers Church Medical College Hospital, Thiruvalla",
    "Pushpagiri Institute of Medical Sciences, Tiruvalla",
    "Pushpagiri College of Pharmacy, Tiruvalla",
    "Pushpagiri College of Nursing, Tiruvalla",
    "Pushpagiri College of Dental Sciences, Medicity, Perumthuruthy",
    "St. Thomas College, Kozhencherry",
    "Catholicate College, Pathanamthitta",
    "N.S.S. College, Pandalam",
    "St. Cyril's College, Adoor",
    "College of Engineering, Adoor",
    "College of Engineering, Kallooppara",
    "College of Engineering, Aranmula",
    "Mount Zion College of Engineering, Kadammanitta",
    "Musaliar College of Engineering and Technology, Pathanamthitta",
    "Musaliar Institute of Management, Pathanamthitta",
    "College of Applied Science (IHRD), Pathanamthitta",
    "College of Applied Science (IHRD), Mallappally",
    "College of Applied Science (IHRD), Konni",
    "College of Applied Science (IHRD), Adoor",
    "Government Arts & Science College, Elanthoor",
    "Government Polytechnic College, Vennikulam",
    "Government Polytechnic College, Adoor",
    "SAS SNDP Yogam College, Konni",
    "BAM College, Thuruthicad, Mallappally",
    "St. Thomas College, Ranny",
    "Caarmel Engineering College, Ranni, Perunad",
    "Mar Severios College of Teacher Education, Chengaroor",
    "SNDP Yogam Arts & Science College, Kadammanitta",
    "Ayyankali Memorial Arts and Science College, Kulanada, Pandalam",
    "Bishop Abraham Memorial College, Thuruthicad",
    "UIT (University Institute of Technology), Pathanamthitta",
    "UIT (University Institute of Technology), Adoor",

    # Other Major Kerala Colleges
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
    "TKM College of Engineering, Kollam",
    "St. Gregorios College, Kottarakkara",
    "St. Stephen's College, Pathanapuram",
    "NSS College Nilamel",
    "St. John's College, Anchal",
    "Sree Narayana College, Punalur",
    "MMNSS College Kottiyam",
    "SN College, Chathannur",
    "Government College for Women, Thiruvananthapuram",
    "St. Xavier's College, Thumba",
    "University College, Thiruvananthapuram",
    "Government College, Kariavattom",
    "Government Sanskrit College, Thiruvananthapuram",
    "Government College, Attingal",
    "Government College, Nedumangad",
    "All Saints College, Thiruvananthapuram",
    "Mahatma Gandhi College",
    "Mar Ivanios College",
    "S.N. College, Sivagiri",
    "Sree Narayana College, Chempazhanthy",
    "VTM NSS College, Dhanuvachapuram",
    "College of Engineering Trivandrum (CET)",
    "Government Engineering College, Barton Hill",
    "Adi Shankara Institute of Engineering and Technology",
    "Albertian Institute of Science and Technology",
    "Amal Jyothi College of Engineering",
    "Saintgits College of Engineering, Pathamuttom",
    "Federal Institute of Science and Technology (FISAT), Angamaly",
    "Model Engineering College (MEC), Thrikkakara",
    "Baselios Poulose II Catholicos College",
    "Baselius College",
    "Berchmans Institute of Management Studies",
    "Bharata Mata College",
    "Bishop Chulaparambil Memorial College for Women",
    "CMS College Kottayam",
    "St. Berchmans College (SB College), Changanassery",
    "Assumption College, Changanassery",
    "St. Thomas College, Pala",
    "Alphonsa College, Pala",
    "Deva Matha College, Kuravilangad",
    "Cochin College",
    "Maharaja's College, Ernakulam",
    "St. Teresa's College (Autonomous), Ernakulam",
    "St. Albert's College, Ernakulam",
    "Sacred Heart College (SH College), Thevara",
    "Rajagiri College of Social Sciences, Kalamassery",
    "Cochin University of Science and Technology (CUSAT)",
    "Mar Athanasius College of Engineering (MACE), Kothamangalam",
    "Nirmala College, Muvattupuzha",
    "Government Engineering College, Thrissur (GECT)",
    "St. Thomas College (Autonomous), Thrissur",
    "Christ College (Autonomous), Irinjalakuda",
    "National Institute of Technology Calicut (NITC)",
    "Farook College (Autonomous), Kozhikode",
    "St. Joseph's College, Devagiri, Kozhikode",
    "Government College of Engineering, Kannur (GCEK)",
    "Brennen College, Thalassery",

    # Pathanamthitta Schools (Comprehensive)
    "Believers Church Residential School (BCRS), Thiruvalla",
    "Scared Heart Higher Secondary School, Thiruvalla",
    "MGM Higher Secondary School, Thiruvalla",
    "St. Mary's Residential Central School, Thiruvalla",
    "Christ Central School, Muthoor, Thiruvalla",
    "The Choice School, Thiruvalla",
    "Mar Thoma Residential School (MTRS), Tiruvalla",
    "Balikamadom Higher Secondary School, Thiruvalla",
    "St. Thomas Higher Secondary School, Thiruvalla",
    "Devalokam Higher Secondary School, Thiruvalla",
    "Govt Boys Higher Secondary School, Thiruvalla",
    "Govt Girls Higher Secondary School, Thiruvalla",
    "NSS Higher Secondary School, Kaviyoor, Thiruvalla",
    "St. John's Higher Secondary School, Eraviperoor, Thiruvalla",
    "YMCA Centenary School, Thiruvalla",
    "Seventh Day Adventist Higher Secondary School, Thiruvalla",
    "St. Paul's Higher Secondary School, Muthoor, Thiruvalla",
    "NSS High School, Kuttoor, Thiruvalla",
    "St. Thomas Higher Secondary School, Kozhencherry",
    "Govt Higher Secondary School, Kozhencherry",
    "St. Mary's Higher Secondary School, Kozhencherry",
    "St. Thomas Higher Secondary School, Ranny",
    "Citadel Residential School, Ranni",
    "Govt Higher Secondary School, Ranny",
    "MS Higher Secondary School, Ranny",
    "Bethany Higher Secondary School, Ranni",
    "CMS Higher Secondary School, Mallappally",
    "St. George Higher Secondary School, Kottangal, Mallappally",
    "Govt Higher Secondary School, Kunnamthanam, Mallappally",
    "NSS Higher Secondary School, Kunnamthanam",
    "BAM Higher Secondary School, Thuruthicad",
    "St. Teresa's Higher Secondary School, Chengaroor, Mallappally",
    "Kendriya Vidyalaya, Adoor",
    "Holy Angels English Medium Higher Secondary School, Adoor",
    "St. Cyril's Higher Secondary School, Adoor",
    "Govt Boys Higher Secondary School, Adoor",
    "Govt Girls Higher Secondary School, Adoor",
    "St. Mary's Higher Secondary School, Adoor",
    "Tapovanam Residential School, Adoor",
    "N.S.S. Higher Secondary School, Pandalam",
    "Govt Higher Secondary School, Pandalam",
    "St. Thomas Higher Secondary School, Pandalam",
    "Govt Higher Secondary School, Thumpamon, Pandalam",
    "Marthoma Higher Secondary School, Pathanamthitta",
    "Catholicate Higher Secondary School, Pathanamthitta",
    "Govt Boys Higher Secondary School, Pathanamthitta",
    "Govt Girls Higher Secondary School, Pathanamthitta",
    "St. Peter's Higher Secondary School, Jnanapeedam, Pathanamthitta",
    "SNDP Higher Secondary School, Chenneerkkara, Pathanamthitta",
    "Navodaya Vidyalaya, Vechoochira, Pathanamthitta",
    "Govt Higher Secondary School, Omalloor",
    "St. Mary's Higher Secondary School, Niranam",
    "Govt Higher Secondary School, Konni",
    "St. George Higher Secondary School, Attachakkal, Konni",
    "Govt Higher Secondary School, Kalanjoor, Konni",
    "Govt Higher Secondary School, Aranmula",
    "NSS Higher Secondary School, Choorakode",
    "Govt Higher Secondary School, Mezhuveli",
    "St. Thomas Higher Secondary School, Kadampanad",

    # Prominent Schools Across Kerala
    "St. Berchmans Higher Secondary School, Changanassery",
    "Placid Vidya Vihar Senior Secondary School, Chethipuzha",
    "Kristu Jyoti Higher Secondary School, Chethipuzha",
    "Pallikoodam School, Kalathilpady, Kottayam",
    "Girideepam Bethany Central School, Kottayam",
    "Marian Senior Secondary School, Kottayam",
    "Lourdes Public School and Junior College, Kottayam",
    "Mount Carmel Higher Secondary School, Kottayam",
    "St. Ephrem's Higher Secondary School, Mannanam",
    "St. Joseph's Higher Secondary School, Manarcad",
    "St. Anne's Higher Secondary School, Chengannur",
    "Govt Boys Higher Secondary School, Chengannur",
    "Bishop Moore Vidyapith, Mavelikara",
    "Infant Jesus Anglo Indian Higher Secondary School, Tangasseri, Kollam",
    "St. Aloysius Higher Secondary School, Kollam",
    "Trinity Lyceum, Kollam",
    "Mount Tabor Girls Higher Secondary School, Pathanapuram",
    "Loyola School, Sreekariyam, Thiruvananthapuram",
    "St. Thomas Residential School, Mukkolakkal, Thiruvananthapuram",
    "St. Thomas Central School, Mukkolakkal, Thiruvananthapuram",
    "Sarvodaya Vidyalaya, Nalanchira, Thiruvananthapuram",
    "Arya Central School, Pattom, Thiruvananthapuram",
    "Kendriya Vidyalaya, Pattom, Thiruvananthapuram",
    "Kendriya Vidyalaya, Pangode, Thiruvananthapuram",
    "Bhavans Vidya Mandir, Girinagar, Kochi",
    "Bhavans Vidya Mandir, Elamakkara, Kochi",
    "Bhavans Adarsha Vidyalaya, Kakkanad",
    "Bhavans Varuna Vidyalaya, Thrikkakara",
    "The Choice School, Thripunithura, Kochi",
    "Rajagiri Christu Jayanthi Public School, Kakkanad",
    "Rajagiri Public School, Kalamassery",
    "Chinmaya Vidyalaya, Vaduthala, Kochi",
    "Hari Sri Vidya Nidhi School, Thrissur",
    "Kulapati Munshi Bhavans Vidya Mandir, Pottore, Thrissur",
    "Don Bosco Higher Secondary School, Irinjalakuda",
    "The Choice School, Kozhikode",
    "Devagiri CMI Public School, Kozhikode",
    "Silver Hills Public School, Kozhikode",
    "Chinmaya Vidyalaya, Kannur",
]

_WHITESPACE = re.compile(r"\s+")


EXCLUDED_INSTITUTIONS = {
    "macfast",
    "macfast tiruvalla",
    "macfast, tiruvalla",
}


def normalize_institution_name(value: str) -> str:
    name = _WHITESPACE.sub(" ", (value or "").strip())
    return name[:200]


def ensure_institution(name: str) -> str | None:
    """Persist a custom institution so later students can pick it."""
    cleaned = normalize_institution_name(name)
    if len(cleaned) < 2:
        return None

    if cleaned.casefold() in EXCLUDED_INSTITUTIONS:
        return cleaned

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
    # Drop empty / whitespace-only and standalone duplicate shorthand / excluded host names
    cleaned = {
        normalize_institution_name(n)
        for n in names
        if normalize_institution_name(n) and normalize_institution_name(n).lower() not in EXCLUDED_INSTITUTIONS
    }
    return sorted(cleaned, key=str.casefold)

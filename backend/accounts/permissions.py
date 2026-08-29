"""Committee → admin module map (shared by API and seed docs)."""

ALL_MODULES = (
    "insights",
    "events",
    "registrations",
    "results",
    "schedule",
    "users",
    "verification",
    "reports",
    "sponsors",
    "guests",
    "content",
    "announcements",
    "gallery",
    "hospitality",
)

# What each committee can open in Admin (and write via API when enforced).
MODULES_BY_COMMITTEE = {
    "core": list(ALL_MODULES),
    "finance": ["insights", "registrations", "verification", "reports"],
    "food": ["insights", "registrations", "reports", "announcements", "hospitality"],
    "hospitality": ["insights", "registrations", "verification", "reports", "hospitality"],

    "event": [
        "insights",
        "events",
        "registrations",
        "results",
        "schedule",
        "verification",
        "reports",
        "announcements",
    ],
    "program": [
        "insights",
        "events",
        "schedule",
        "announcements",
        "results",
        "reports",
    ],
    "cultural": [
        "insights",
        "events",
        "results",
        "announcements",
        "gallery",
        "schedule",
    ],
    "publicity": [
        "insights",
        "announcements",
        "gallery",
        "sponsors",
        "guests",
        "content",
    ],
    "invitation": ["insights", "announcements", "guests", "content"],
    "verification": ["insights", "verification", "registrations"],
}

def user_modules(user):
    if not user or not user.is_authenticated:
        return []
    if user.is_superuser:
        return list(ALL_MODULES)
    if not user.is_staff:
        return []
    profile = getattr(user, "staff_profile", None)
    if profile is None:
        return list(ALL_MODULES)
    return profile.modules


def user_has_module(user, module):
    return module in user_modules(user)


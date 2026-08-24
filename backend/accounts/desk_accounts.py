"""Committee desk account helpers — usernames/passwords come from environment only."""



from __future__ import annotations



import os



from django.conf import settings



# Ops desks (not core).

DESK_COMMITTEES = (

    "finance",

    "food",

    "hospitality",

    "event",

    "program",

    "cultural",

    "publicity",

    "invitation",

    "verification",

)



DESK_LABELS = {

    "finance": "Finance",

    "food": "Food",

    "hospitality": "Hospitality",

    "event": "Event",

    "program": "Program",

    "cultural": "Cultural",

    "publicity": "Publicity",

    "invitation": "Invitation",

    "verification": "Verification",

}





def _env(name: str, default: str = "") -> str:

    return (os.environ.get(name) or getattr(settings, name, None) or default or "").strip()





def desk_username(committee: str) -> str:

    template = _env("DESK_USERNAME_TEMPLATE", "macfiesta{committee}admin")

    return template.replace("{committee}", committee)





def desk_email(committee: str) -> str:

    domain = _env("DESK_EMAIL_DOMAIN", "macfiesta.local")

    return f"{committee}@{domain}"





def desk_password(committee: str) -> str:

    """

    Resolve desk password from env (never hardcode in source).



    Priority:

      1. DESK_PASSWORD_<COMMITTEE>  e.g. DESK_PASSWORD_FINANCE

      2. DESK_PASSWORD_TEMPLATE with {committee} placeholder

      3. empty → caller must reject

    """

    specific = _env(f"DESK_PASSWORD_{committee.upper()}")

    if specific:

        return specific

    template = _env("DESK_PASSWORD_TEMPLATE")

    if template:

        return template.replace("{committee}", committee)

    return ""





def iter_desk_accounts():

    for committee in DESK_COMMITTEES:

        password = desk_password(committee)

        yield {

            "committee": committee,

            "username": desk_username(committee),

            "password": password,

            "email": desk_email(committee),

            "display_name": f"{DESK_LABELS[committee]} Desk Admin",

            "label": DESK_LABELS[committee],

        }



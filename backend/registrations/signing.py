"""QR / pass signing helpers (HMAC-backed verification payload).



Public QR encodes a signed token; desk can still search by plain registration number.

Salt and max-age come from environment via Django settings.

"""



import re

from urllib.parse import unquote, urlparse, parse_qs



from django.conf import settings

from django.core.signing import BadSignature, SignatureExpired, TimestampSigner



# Typical MacFiesta registration numbers: MCF26-ABC-0001

REG_NUMBER_RE = re.compile(r"MCF\d{2}-[A-Z0-9]{2,8}-\d{3,6}", re.IGNORECASE)





def _signer_salt() -> str:

    return getattr(settings, "REGISTRATION_SIGNER_SALT", "macfiesta.registration.pass")





def _max_age_seconds() -> int:

    days = int(getattr(settings, "REGISTRATION_PASS_MAX_AGE_DAYS", 60) or 60)

    return 60 * 60 * 24 * max(1, days)





def sign_registration_number(registration_number: str) -> str:

    signer = TimestampSigner(salt=_signer_salt())

    return signer.sign(str(registration_number))





def unsign_registration_number(token: str, max_age: int | None = None) -> str | None:

    if not token:

        return None

    if max_age is None:

        max_age = _max_age_seconds()

    signer = TimestampSigner(salt=_signer_salt())

    try:

        return signer.unsign(token, max_age=max_age)

    except (BadSignature, SignatureExpired, ValueError, TypeError):

        return None





def _extract_candidate(raw: str) -> str:

    """Normalize scanner output (URL, whitespace, embedded reg #)."""

    value = unquote((raw or "").strip())

    if not value:

        return ""



    if value.startswith("http://") or value.startswith("https://"):

        parsed = urlparse(value)

        qs = parse_qs(parsed.query)

        for key in ("q", "reg", "token", "pass", "data"):

            if qs.get(key):

                value = qs[key][0]

                break

        else:

            parts = [p for p in parsed.path.split("/") if p]

            if parts:

                value = parts[-1]



    value = value.strip().strip('"').strip("'")

    match = REG_NUMBER_RE.search(value)

    if match and ":" not in value[: match.start() + 1]:

        if ":" not in value:

            return match.group(0)

    return value





def resolve_registration_lookup(raw: str) -> str:

    """Accept signed QR token or plain registration number (including scanner noise)."""

    value = _extract_candidate(raw)

    if not value:

        return ""

    unsigned = unsign_registration_number(value)

    if unsigned:

        return unsigned

    match = REG_NUMBER_RE.search(value)

    if match:

        return match.group(0)

    return value



"""Registration fee breakdown helpers (server-side totals). Fees come from env via settings."""

from decimal import Decimal

from django.conf import settings


def _money(value, default="0.00"):
    try:
        return Decimal(str(value if value is not None else default))
    except Exception:
        return Decimal(default)


def breakfast_fee():
    return _money(getattr(settings, "BREAKFAST_FEE", "50.00"), "50.00")


def lunch_fee():
    return _money(getattr(settings, "LUNCH_FEE", "70.00"), "70.00")


def dinner_fee():
    return _money(getattr(settings, "DINNER_FEE", "50.00"), "50.00")


def food_package_fee():
    return _money(getattr(settings, "FOOD_PACKAGE_FEE", "170.00"), "170.00")


def accommodation_fee_per_person():
    return _money(getattr(settings, "ACCOMMODATION_FEE_PER_PERSON", "350.00"), "350.00")


def transport_assist_fee():
    return _money(getattr(settings, "TRANSPORT_ASSIST_FEE", "100.00"), "100.00")


def compute_registration_amount(
    *,
    event_fee,
    food_preference="none",
    needs_accommodation=False,
    accommodation_count=None,
    needs_transport=False,
):
    """
    Total payable = event fee + selected add-ons.

    Amounts are configured in backend/.env (BREAKFAST_FEE=50, LUNCH_FEE=70, DINNER_FEE=50, etc.).
    """
    total = Decimal(event_fee or 0)
    food = Decimal("0.00")
    accommodation = Decimal("0.00")
    transport = Decimal("0.00")

    pref = str(food_preference or "none").lower()
    if pref in ("full", "all", "veg", "non_veg", "jain", "package"):
        food = food_package_fee()
    elif pref != "none":
        meals = [m.strip() for m in pref.replace("+", ",").replace(";", ",").split(",") if m.strip()]
        bf = breakfast_fee() if ("breakfast" in meals or "bf" in meals) else Decimal("0.00")
        ln = lunch_fee() if ("lunch" in meals or "ln" in meals) else Decimal("0.00")
        dn = dinner_fee() if ("dinner" in meals or "dn" in meals) else Decimal("0.00")
        calc = bf + ln + dn
        food = calc if calc > 0 else food_package_fee()

    total += food

    if needs_accommodation:
        count = int(accommodation_count or 1)
        if count < 1:
            count = 1
        accommodation = accommodation_fee_per_person() * count
        total += accommodation

    # Transport is not offered for MacFiesta — never charge it.
    transport = Decimal("0.00")

    return {
        "event_fee": Decimal(event_fee or 0),
        "food_fee": food,
        "accommodation_fee": accommodation,
        "transport_fee": transport,
        "total": total,
    }

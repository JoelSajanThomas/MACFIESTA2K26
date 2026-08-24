"""Registration fee breakdown helpers (server-side totals). Fees come from env via settings."""



from decimal import Decimal



from django.conf import settings





def _money(value, default="0.00"):

    try:

        return Decimal(str(value if value is not None else default))

    except Exception:

        return Decimal(default)





def food_package_fee():

    return _money(getattr(settings, "FOOD_PACKAGE_FEE", "150.00"), "150.00")





def accommodation_fee_per_person():

    return _money(getattr(settings, "ACCOMMODATION_FEE_PER_PERSON", "300.00"), "300.00")





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

    Amounts are configured in backend/.env (FOOD_PACKAGE_FEE, etc.).

    """

    total = Decimal(event_fee or 0)

    food = Decimal("0.00")

    accommodation = Decimal("0.00")

    transport = Decimal("0.00")



    if (food_preference or "none") != "none":

        food = food_package_fee()

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



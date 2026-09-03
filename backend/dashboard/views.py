from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from events.models import Event
from registrations.models import Registration
from results.models import Result
from gallery.models import GalleryImage
from accounts.drf import HasModule


@api_view(["GET"])
def public_fest_stats(request):
    """Public aggregate counts for the homepage stats section."""
    data = {
        "total_events": Event.objects.count(),
        "total_registrations": Registration.objects.count(),
        "total_results": Result.objects.filter(event__is_result_published=True).count(),
        "total_gallery_images": GalleryImage.objects.count(),
    }
    return Response(data)


@api_view(["GET"])
def public_fest_config(request):
    """
    Public non-secret fest config from backend/.env
    (payment display details + add-on fees + QR image API).
    """
    from django.conf import settings

    return Response(
        {
            "payment": {
                "account_name": settings.PAYMENT_ACCOUNT_NAME,
                "upi_id": settings.PAYMENT_UPI_ID,
                "hostel_account_name": getattr(settings, "HOSTEL_PAYMENT_ACCOUNT_NAME", "ST ALPHONSA HOSTEL"),
                "hostel_upi_id": getattr(settings, "HOSTEL_PAYMENT_UPI_ID", "stalphonsahostel@iob"),
                "bank_name": settings.PAYMENT_BANK_NAME,
                "account_number": settings.PAYMENT_ACCOUNT_NUMBER,
                "ifsc": settings.PAYMENT_IFSC,
                "instructions": settings.PAYMENT_INSTRUCTIONS,
                "qr_image_url": settings.PAYMENT_QR_IMAGE_URL,
                "hostel_qr_image_url": settings.HOSTEL_PAYMENT_QR_IMAGE_URL,
            },
            "fees": {
                "food_package": float(settings.FOOD_PACKAGE_FEE),
                "breakfast": float(getattr(settings, "BREAKFAST_FEE", 50.0)),
                "lunch": float(getattr(settings, "LUNCH_FEE", 70.0)),
                "dinner": float(getattr(settings, "DINNER_FEE", 50.0)),
                "accommodation_per_person": float(settings.ACCOMMODATION_FEE_PER_PERSON),
                "transport_assist": float(settings.TRANSPORT_ASSIST_FEE),
            },
            "contact": {
                "email": settings.CONTACT_EMAIL,
                "phone": settings.CONTACT_PHONE,
                "registration_help_email": settings.REGISTRATION_HELP_EMAIL,
                "registration_help_phone": settings.REGISTRATION_HELP_PHONE,
                "website": settings.OFFICIAL_WEBSITE,
                "instagram": settings.INSTAGRAM_URL,
                "youtube": settings.YOUTUBE_URL,
                "facebook": settings.FACEBOOK_URL,
            },
            "qr_image_api_url": settings.QR_IMAGE_API_URL,
        }
    )


@api_view(["GET"])
@permission_classes([HasModule("insights")])
def dashboard_stats(request):
    from django.db.models import Count, Sum, Q
    from django.utils import timezone

    regs = Registration.objects.exclude(approval_status="cancelled")
    payment_rows = (
        regs.values("payment_status")
        .annotate(count=Count("id"))
        .order_by("payment_status")
    )
    payment_summary = {row["payment_status"]: row["count"] for row in payment_rows}
    for key in ("pending", "paid", "failed", "refunded", "waived"):
        payment_summary.setdefault(key, 0)

    attended = regs.filter(attendance_marked=True).count()
    total_regs = regs.count()
    today = timezone.localdate()
    today_regs = regs.filter(registered_at__date=today).count()

    verified_revenue = (
        regs.filter(payment_status="paid").aggregate(t=Sum("payment_amount"))["t"] or 0
    )
    pending_amount = (
        regs.filter(payment_status="pending").aggregate(t=Sum("payment_amount"))["t"] or 0
    )

    stay_qs = regs.filter(needs_accommodation=True)
    food_qs = regs.exclude(food_preference="none")

    data = {
        "total_events": Event.objects.exclude(status="cancelled").count(),
        "total_registrations": total_regs,
        "registrations_today": today_regs,
        "total_results": Result.objects.count(),
        "published_results": Result.objects.filter(event__is_result_published=True).count(),
        "results_pending_events": Event.objects.filter(
            is_result_published=False
        ).exclude(status="cancelled").count(),
        "total_gallery_images": GalleryImage.objects.count(),
        "attended": attended,
        "not_attended": total_regs - attended,
        "payment_summary": payment_summary,
        "verified_revenue": float(verified_revenue),
        "pending_payment_amount": float(pending_amount),
        "approval_pending": regs.filter(approval_status="pending").count(),
        "waitlisted": regs.filter(is_waiting_list=True).count(),
        "accommodation_requests": stay_qs.count(),
        "accommodation_pending": stay_qs.filter(accommodation_status="pending").count(),
        "accommodation_allocated": stay_qs.filter(
            accommodation_status__in=["allocated", "checked_in"]
        ).count(),
        "accommodation_male": stay_qs.filter(gender="male").count(),
        "accommodation_female": stay_qs.filter(gender="female").count(),
        "food_requests": food_qs.count(),
        "food_veg": food_qs.filter(food_preference="veg").count(),
        "food_non_veg": food_qs.filter(food_preference="non_veg").count(),
        "food_jain": food_qs.filter(food_preference="jain").count(),
        "events_today": Event.objects.filter(event_date=today).exclude(status="cancelled").count(),
        "gender_distribution": {
            "male": regs.filter(gender="male").count(),
            "female": regs.filter(gender="female").count(),
            "other": regs.filter(gender="other").count(),
            "unspecified": regs.filter(gender="unspecified").count(),
        },
    }
    return Response(data)




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    from accounts.permissions import user_modules

    user = request.user
    if not user.is_active:
        return Response({"detail": "Account is inactive."}, status=403)

    profile = getattr(user, "staff_profile", None)
    modules = user_modules(user)
    full_name = (user.get_full_name() or "").strip()
    display = ""
    if profile and profile.display_name:
        display = profile.display_name.strip()
    if not display:
        display = full_name or user.username
    return Response({
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name or "",
        "last_name": user.last_name or "",
        "full_name": full_name,
        "is_active": user.is_active,
        "is_staff": user.is_staff,
        "is_superuser": user.is_superuser,
        "committee": profile.committee if profile else ("core" if user.is_superuser else None),
        "committee_label": (
            profile.get_committee_display()
            if profile
            else ("Core Team" if user.is_superuser else None)
        ),
        "display_name": display,
        "phone": (profile.phone if profile else "") or "",
        "modules": modules,
        "must_change_password": bool(profile and profile.must_change_password),
    })

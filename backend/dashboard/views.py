from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Q, Sum
from django.utils import timezone
from datetime import datetime, time, timedelta
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
    regs = Registration.objects.exclude(approval_status="cancelled")

    today = timezone.localdate()
    today_start = timezone.make_aware(datetime.combine(today, time.min))
    tomorrow_start = today_start + timedelta(days=1)
    metrics = regs.aggregate(
        total=Count("id"),
        attended=Count("id", filter=Q(attendance_marked=True)),
        registrations_today=Count(
            "id", filter=Q(registered_at__gte=today_start, registered_at__lt=tomorrow_start)
        ),
        verified_revenue=Sum("payment_amount", filter=Q(payment_status="paid")),
        pending_payment_amount=Sum("payment_amount", filter=Q(payment_status="pending")),
        approval_pending=Count("id", filter=Q(approval_status="pending")),
        waitlisted=Count("id", filter=Q(is_waiting_list=True)),
        accommodation_requests=Count("id", filter=Q(needs_accommodation=True)),
        accommodation_pending=Count(
            "id", filter=Q(needs_accommodation=True, accommodation_status="pending")
        ),
        accommodation_allocated=Count(
            "id", filter=Q(
                needs_accommodation=True,
                accommodation_status__in=["allocated", "checked_in"],
            )
        ),
        accommodation_male=Count("id", filter=Q(needs_accommodation=True, gender="male")),
        accommodation_female=Count("id", filter=Q(needs_accommodation=True, gender="female")),
        food_requests=Count("id", filter=~Q(food_preference="none")),
        food_veg=Count("id", filter=Q(food_preference="veg")),
        food_non_veg=Count("id", filter=Q(food_preference="non_veg")),
        food_jain=Count("id", filter=Q(food_preference="jain")),
        gender_male=Count("id", filter=Q(gender="male")),
        gender_female=Count("id", filter=Q(gender="female")),
        gender_other=Count("id", filter=Q(gender="other")),
        gender_unspecified=Count("id", filter=Q(gender="unspecified")),
        payment_pending=Count("id", filter=Q(payment_status="pending")),
        payment_initiated=Count("id", filter=Q(payment_status="initiated")),
        payment_paid=Count("id", filter=Q(payment_status="paid")),
        payment_failed=Count("id", filter=Q(payment_status="failed")),
        payment_cancelled=Count("id", filter=Q(payment_status="cancelled")),
        payment_refunded=Count("id", filter=Q(payment_status="refunded")),
        payment_waived=Count("id", filter=Q(payment_status="waived")),
    )

    event_metrics = Event.objects.aggregate(
        total=Count("id", filter=~Q(status="cancelled")),
        results_pending=Count(
            "id", filter=Q(is_result_published=False) & ~Q(status="cancelled")
        ),
        events_today=Count("id", filter=Q(event_date=today) & ~Q(status="cancelled")),
    )
    result_metrics = Result.objects.aggregate(
        total=Count("id"),
        published=Count("id", filter=Q(event__is_result_published=True)),
    )
    payment_summary = {
        key: metrics[f"payment_{key}"]
        for key in ("pending", "initiated", "paid", "failed", "cancelled", "refunded", "waived")
    }

    data = {
        "total_events": event_metrics["total"],
        "total_registrations": metrics["total"],
        "registrations_today": metrics["registrations_today"],
        "total_results": result_metrics["total"],
        "published_results": result_metrics["published"],
        "results_pending_events": event_metrics["results_pending"],
        "total_gallery_images": GalleryImage.objects.count(),
        "attended": metrics["attended"],
        "not_attended": metrics["total"] - metrics["attended"],
        "payment_summary": payment_summary,
        "verified_revenue": float(metrics["verified_revenue"] or 0),
        "pending_payment_amount": float(metrics["pending_payment_amount"] or 0),
        "approval_pending": metrics["approval_pending"],
        "waitlisted": metrics["waitlisted"],
        "accommodation_requests": metrics["accommodation_requests"],
        "accommodation_pending": metrics["accommodation_pending"],
        "accommodation_allocated": metrics["accommodation_allocated"],
        "accommodation_male": metrics["accommodation_male"],
        "accommodation_female": metrics["accommodation_female"],
        "food_requests": metrics["food_requests"],
        "food_veg": metrics["food_veg"],
        "food_non_veg": metrics["food_non_veg"],
        "food_jain": metrics["food_jain"],
        "events_today": event_metrics["events_today"],
        "gender_distribution": {
            "male": metrics["gender_male"],
            "female": metrics["gender_female"],
            "other": metrics["gender_other"],
            "unspecified": metrics["gender_unspecified"],
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
        "id": user.id,
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


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_audit_logs(request):
    if not (request.user.is_superuser or (hasattr(request.user, "staff_profile") and request.user.staff_profile.can_access_module("insights"))):
        return Response({"detail": "Permission denied."}, status=403)

    from accounts.models import AuditLog
    from django.db.models import Q

    qs = AuditLog.objects.select_related("user").order_by("-created_at")
    module = request.GET.get("module")
    if module:
        qs = qs.filter(Q(resource_type__iexact=module) | Q(resource_type__icontains=module))
    action = request.GET.get("action")
    if action:
        qs = qs.filter(action=action)
    search = request.GET.get("search")
    if search:
        qs = qs.filter(Q(details__icontains=search) | Q(action__icontains=search))

    logs = qs[:200]
    data = [
        {
            "id": log.id,
            "username": log.user.username if log.user else "System",
            "action": log.action,
            "module": log.resource_type or "",
            "resource_type": log.resource_type or "",
            "details": log.details,
            "ip_address": log.ip_address,
            "created_at": log.created_at.isoformat(),
        }
        for log in logs
    ]
    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_system_backup(request):
    if not request.user.is_superuser:
        return Response({"detail": "Superuser permission required."}, status=403)

    from io import StringIO
    from django.core.management import call_command
    from django.http import HttpResponse
    from django.utils import timezone

    buf = StringIO()
    call_command("dumpdata", stdout=buf, indent=2, exclude=["contenttypes", "auth.permission"])
    response = HttpResponse(buf.getvalue(), content_type="application/json")
    timestamp = timezone.now().strftime("%Y%m%d_%H%M%S")
    response["Content-Disposition"] = f'attachment; filename="macfiesta_backup_{timestamp}.json"'
    return response


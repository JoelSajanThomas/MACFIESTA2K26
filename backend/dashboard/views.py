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
@permission_classes([HasModule("insights")])
def dashboard_stats(request):
    from django.db.models import Count

    regs = Registration.objects.all()
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

    data = {
        "total_events": Event.objects.count(),
        "total_registrations": total_regs,
        "total_results": Result.objects.count(),
        "total_gallery_images": GalleryImage.objects.count(),
        "attended": attended,
        "not_attended": total_regs - attended,
        "payment_summary": payment_summary,
        "approval_pending": regs.filter(approval_status="pending").count(),
    }
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    from accounts.permissions import user_modules

    user = request.user
    profile = getattr(user, "staff_profile", None)
    modules = user_modules(user)
    return Response({
        "username": user.username,
        "email": user.email,
        "is_staff": user.is_staff,
        "is_superuser": user.is_superuser,
        "committee": profile.committee if profile else ("core" if user.is_superuser else None),
        "committee_label": (
            profile.get_committee_display()
            if profile
            else ("Core Team" if user.is_superuser else None)
        ),
        "display_name": (profile.display_name if profile else "") or user.username,
        "modules": modules,
        "must_change_password": bool(profile and profile.must_change_password),
    })

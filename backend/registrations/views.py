from django.utils import timezone
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from accounts.drf import HasModule, HasStaffModule
from results.models import Result
from .models import Registration
from .serializers import RegistrationSerializer, AdminRegistrationSerializer
from .services import cancel_registration, promote_next_waitlisted


class RegistrationViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Registration.objects.filter(user=self.request.user).select_related("event")
        if self.request.query_params.get("include_cancelled") != "1":
            qs = qs.filter(cancelled_at__isnull=True)
        return qs.prefetch_related("team_members")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        registration = self.get_object()
        if registration.user_id != request.user.id:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
        try:
            cancel_registration(registration, by_user=request.user)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(RegistrationSerializer(registration, context={"request": request}).data)


class AdminRegistrationListView(ListAPIView):
    serializer_class = AdminRegistrationSerializer
    permission_classes = [HasStaffModule]
    required_module = "registrations"

    def get_queryset(self):
        return (
            Registration.objects.select_related("event", "user", "verified_by")
            .prefetch_related("team_members")
            .order_by("-registered_at")
        )


class AdminRegistrationDetailView(RetrieveUpdateAPIView):
    serializer_class = AdminRegistrationSerializer
    permission_classes = [HasStaffModule]
    required_module = "registrations"
    queryset = Registration.objects.select_related("event", "user", "verified_by").prefetch_related(
        "team_members"
    )


@api_view(["POST"])
@permission_classes([HasModule("registrations")])
def admin_promote_waitlist(request, event_id):
    from events.models import Event

    try:
        event = Event.objects.get(pk=event_id)
    except Event.DoesNotExist:
        return Response({"detail": "Event not found."}, status=status.HTTP_404_NOT_FOUND)
    promoted = promote_next_waitlisted(event)
    if not promoted:
        return Response({"detail": "No waitlisted participant to promote or event is full."})
    return Response(AdminRegistrationSerializer(promoted).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_pass(request, pk):
    """Digital participant pass / ID for a registration."""
    try:
        reg = (
            Registration.objects.select_related("event")
            .prefetch_related("team_members")
            .get(pk=pk, user=request.user, cancelled_at__isnull=True)
        )
    except Registration.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
    return Response(RegistrationSerializer(reg, context={"request": request}).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def certificate_data(request, result_id):
    try:
        result = Result.objects.select_related("event").get(
            pk=result_id, event__is_result_published=True
        )
    except Result.DoesNotExist:
        return Response({"detail": "Certificate not available."}, status=status.HTTP_404_NOT_FOUND)
    return Response(
        {
            "id": result.id,
            "participant_name": result.participant_name,
            "college_name": result.college_name,
            "position": result.position,
            "remarks": result.remarks,
            "event_title": result.event.title,
            "event_date": result.event.event_date,
            "fest_name": "MacFiesta",
            "issued_at": timezone.localdate().isoformat(),
        }
    )


@api_view(["GET"])
@permission_classes([HasModule("reports")])
def attendance_report(request):
    rows = (
        Registration.objects.filter(cancelled_at__isnull=True)
        .select_related("event", "user", "verified_by")
        .order_by("event__title", "participant_name")
    )
    event_id = request.query_params.get("event")
    if event_id:
        rows = rows.filter(event_id=event_id)
    data = [
        {
            "registration_number": r.registration_number,
            "participant_name": r.participant_name,
            "college_name": r.college_name,
            "event": r.event.title,
            "payment_status": r.payment_status,
            "attendance_marked": r.attendance_marked,
            "verified_at": r.verified_at,
            "verified_by": r.verified_by.username if r.verified_by else None,
            "food_preference": r.food_preference,
            "food_notes": r.food_notes,
            "needs_accommodation": r.needs_accommodation,
            "accommodation_count": r.accommodation_count,
            "accommodation_notes": r.accommodation_notes,
            "needs_transport": r.needs_transport,
            "transport_note": r.transport_note,
        }
        for r in rows
    ]
    return Response({"count": len(data), "results": data})

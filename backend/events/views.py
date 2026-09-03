from django.db.models import Count, Q
from rest_framework import status, viewsets
from rest_framework.response import Response

from config.permissions import IsAdminOrReadOnly
from .models import Event
from .serializers import EventSerializer


class EventViewSet(viewsets.ModelViewSet):
    queryset = (
        Event.objects.annotate(
            participant_count_cached=Count(
                "registrations",
                filter=Q(registrations__is_waiting_list=False, registrations__cancelled_at__isnull=True),
            )
        )
        .all()
        .order_by("event_date", "event_time")
    )
    serializer_class = EventSerializer
    permission_classes = [IsAdminOrReadOnly]
    required_module = "events"

    def destroy(self, request, *args, **kwargs):
        user = request.user
        if not (user and user.is_authenticated and user.is_superuser):
            return Response(
                {"detail": "Only Super Admin can delete an event."},
                status=status.HTTP_403_FORBIDDEN,
            )

        password = (
            request.data.get("password")
            or request.data.get("admin_password")
            or request.headers.get("X-Admin-Password")
            or request.query_params.get("password")
            or ""
        )
        raw_password = request.data.get("raw_password") or ""

        if not password and not raw_password:
            return Response(
                {"detail": "Super Admin password is required to delete an event."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        verified = False
        for pw in [password, raw_password]:
            if not pw:
                continue
            if user.check_password(pw):
                verified = True
                break

        if not verified:
            return Response(
                {"detail": "Incorrect Super Admin password. Deletion denied."},
                status=status.HTTP_403_FORBIDDEN,
            )

        event = self.get_object()
        active_regs = event.registrations.filter(cancelled_at__isnull=True).count()
        if active_regs > 0:
            return Response(
                {
                    "detail": (
                        f"Cannot delete this event: {active_regs} registration(s) still exist. "
                        "Cancel or archive registrations first, or close the event instead."
                    )
                },
                status=status.HTTP_409_CONFLICT,
            )
        return super().destroy(request, *args, **kwargs)

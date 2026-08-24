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

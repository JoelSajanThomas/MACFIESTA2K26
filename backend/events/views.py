from django.db.models import Count, Q
from rest_framework import viewsets

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

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from .models import Hostel, AccommodationBooking
from .serializers import (
    HostelSerializer,
    AccommodationBookingSerializer,
    AdminAccommodationBookingSerializer,
)


class HostelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Hostel.objects.filter(is_active=True)
    serializer_class = HostelSerializer
    permission_classes = [permissions.AllowAny]


class AccommodationBookingViewSet(viewsets.ModelViewSet):
    serializer_class = AccommodationBookingSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and (user.is_staff or user.is_superuser):
            return AccommodationBooking.objects.all().select_related("hostel")
        elif user.is_authenticated:
            return AccommodationBooking.objects.filter(user=user).select_related("hostel")
        return AccommodationBooking.objects.none()

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(user=user)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def my_bookings(self, request):
        bookings = AccommodationBooking.objects.filter(user=request.user).select_related("hostel")
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def admin_hospitality_stats(request):
    if not (request.user.is_staff or request.user.is_superuser):
        return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    total_requests = AccommodationBooking.objects.count()
    pending = AccommodationBooking.objects.filter(status="pending").count()
    allocated = AccommodationBooking.objects.filter(status__in=["allocated", "confirmed"]).count()
    checked_in = AccommodationBooking.objects.filter(status="checked_in").count()
    males = AccommodationBooking.objects.filter(gender="male").count()
    females = AccommodationBooking.objects.filter(gender="female").count()

    return Response({
        "total_requests": total_requests,
        "pending": pending,
        "allocated": allocated,
        "checked_in": checked_in,
        "males": males,
        "females": females,
    })

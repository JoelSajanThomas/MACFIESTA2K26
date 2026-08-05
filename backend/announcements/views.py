from rest_framework import viewsets

from config.permissions import IsAdminOrReadOnly
from .models import Announcement
from .serializers import AnnouncementSerializer


class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all().order_by("-created_at")
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAdminOrReadOnly]
    required_module = "announcements"

    def get_queryset(self):
        qs = Announcement.objects.all().order_by("-created_at")
        user = self.request.user
        is_staff = user.is_authenticated and (user.is_staff or user.is_superuser)
        if not is_staff:
            qs = qs.filter(is_active=True)
        return qs

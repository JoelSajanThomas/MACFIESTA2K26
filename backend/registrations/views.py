from rest_framework import viewsets, permissions
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAdminUser
from .models import Registration
from .serializers import RegistrationSerializer


class RegistrationViewSet(viewsets.ModelViewSet):
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Registration.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AdminRegistrationListView(ListAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return Registration.objects.select_related('event', 'user').order_by('-registered_at')
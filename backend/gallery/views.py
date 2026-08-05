from rest_framework import viewsets

from config.permissions import IsAdminOrReadOnly
from .models import GalleryImage
from .serializers import GalleryImageSerializer


class GalleryImageViewSet(viewsets.ModelViewSet):
    queryset = GalleryImage.objects.all().order_by("-uploaded_at")
    serializer_class = GalleryImageSerializer
    permission_classes = [IsAdminOrReadOnly]
    required_module = "gallery"

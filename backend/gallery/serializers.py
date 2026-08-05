from rest_framework import serializers

from config.validators import validate_uploaded_image
from .models import GalleryImage


class GalleryImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryImage
        fields = "__all__"

    def validate_image(self, value):
        return validate_uploaded_image(value)
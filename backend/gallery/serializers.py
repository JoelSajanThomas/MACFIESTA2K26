from rest_framework import serializers

from config.serializers_mixins import ImageValidationMixin
from .models import GalleryImage


class GalleryImageSerializer(ImageValidationMixin, serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)
    thumbnail = serializers.ImageField(required=False, allow_null=True)
    # Computed convenience field so the frontend can use a single 'url' key
    url = serializers.SerializerMethodField()

    class Meta:
        model = GalleryImage
        fields = [
            'id', 'type', 'category', 'title',
            'image', 'thumbnail', 'video_url',
            'url', 'featured', 'uploaded_at',
        ]

    def get_url(self, obj):
        """Return the primary media URL for the item."""
        request = self.context.get('request')
        if obj.type == 'video':
            return obj.video_url or ''
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return ''

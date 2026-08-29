from rest_framework import serializers

from config.serializers_mixins import ImageValidationMixin
from .models import Event


class EventSerializer(ImageValidationMixin, serializers.ModelSerializer):
    participant_count = serializers.SerializerMethodField()
    image = serializers.FileField(required=False, allow_null=True)
    banner_image = serializers.FileField(required=False, allow_null=True)
    poster_image = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = Event
        fields = "__all__"

    def get_participant_count(self, obj):
        if hasattr(obj, "participant_count_cached"):
            return obj.participant_count_cached
        return obj.registrations.filter(
            is_waiting_list=False, cancelled_at__isnull=True
        ).count()
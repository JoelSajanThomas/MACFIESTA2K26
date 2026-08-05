from rest_framework import serializers

from config.validators import validate_uploaded_image
from .models import Event


class EventSerializer(serializers.ModelSerializer):
    participant_count = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = "__all__"

    def get_participant_count(self, obj):
        if hasattr(obj, "participant_count_cached"):
            return obj.participant_count_cached
        return obj.registrations.filter(
            is_waiting_list=False, cancelled_at__isnull=True
        ).count()

    def validate_image(self, value):
        return validate_uploaded_image(value)

    def validate_banner_image(self, value):
        return validate_uploaded_image(value)

    def validate_poster_image(self, value):
        return validate_uploaded_image(value)
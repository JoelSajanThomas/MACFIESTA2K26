from rest_framework import serializers
from .models import Event


class EventSerializer(serializers.ModelSerializer):
    participant_count = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = '__all__'

    def get_participant_count(self, obj):
        return obj.registrations.count()
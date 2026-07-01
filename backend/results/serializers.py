from rest_framework import serializers
from .models import Result


class ResultSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source='event.title', read_only=True)
    event_category = serializers.CharField(source='event.category', read_only=True)
    event_venue = serializers.CharField(source='event.venue', read_only=True)
    event_date = serializers.DateField(source='event.event_date', read_only=True)

    class Meta:
        model = Result
        fields = '__all__'
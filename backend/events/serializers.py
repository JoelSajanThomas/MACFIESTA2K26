from rest_framework import serializers

from config.serializers_mixins import ImageValidationMixin
from .models import Event


class EventSerializer(ImageValidationMixin, serializers.ModelSerializer):
    participant_count = serializers.SerializerMethodField()
    image = serializers.FileField(required=False, allow_null=True)
    banner_image = serializers.FileField(required=False, allow_null=True)
    poster_image = serializers.FileField(required=False, allow_null=True)

    slug = serializers.SlugField(required=False)

    class Meta:
        model = Event
        fields = "__all__"

    def validate(self, attrs):
        if not attrs.get("slug") and attrs.get("title") and not self.instance:
            from django.utils.text import slugify
            candidate = slugify(attrs["title"]) or "event"
            slug = candidate
            counter = 1
            while Event.objects.filter(slug=slug).exists():
                slug = f"{candidate}-{counter}"
                counter += 1
            attrs["slug"] = slug

        min_team = attrs.get("min_team_size") or (self.instance.min_team_size if self.instance else None)
        max_team = attrs.get("max_team_size") or (self.instance.max_team_size if self.instance else None)
        if min_team and max_team and min_team > max_team:
            raise serializers.ValidationError({"min_team_size": "Minimum team size cannot exceed maximum team size."})
        return super().validate(attrs)

    def get_participant_count(self, obj):
        if hasattr(obj, "participant_count_cached"):
            return obj.participant_count_cached
        return obj.registrations.filter(
            is_waiting_list=False, cancelled_at__isnull=True
        ).count()
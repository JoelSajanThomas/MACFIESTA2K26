from rest_framework import serializers

from config.serializers_mixins import ImageValidationMixin
from .models import (
    SiteSetting,
    FestivalHighlight,
    EventCategoryContent,
    EventFormat,
    GuestProfile,
    ThemeSection,
    Testimonial,
    FAQ,
    Sponsor,
    HomepageSection,
    FestRewindItem,
)


class SiteSettingSerializer(ImageValidationMixin, serializers.ModelSerializer):
    class Meta:
        model = SiteSetting
        fields = "__all__"


class FestivalHighlightSerializer(serializers.ModelSerializer):
    class Meta:
        model = FestivalHighlight
        fields = "__all__"


class EventCategoryContentSerializer(ImageValidationMixin, serializers.ModelSerializer):
    class Meta:
        model = EventCategoryContent
        fields = "__all__"


class EventFormatSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventFormat
        fields = "__all__"


class GuestProfileSerializer(ImageValidationMixin, serializers.ModelSerializer):
    class Meta:
        model = GuestProfile
        fields = "__all__"


class ThemeSectionSerializer(ImageValidationMixin, serializers.ModelSerializer):
    class Meta:
        model = ThemeSection
        fields = "__all__"


class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = "__all__"


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = "__all__"


class SponsorSerializer(ImageValidationMixin, serializers.ModelSerializer):
    class Meta:
        model = Sponsor
        fields = "__all__"


class HomepageSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomepageSection
        fields = "__all__"


class FestRewindItemSerializer(ImageValidationMixin, serializers.ModelSerializer):
    class Meta:
        model = FestRewindItem
        fields = "__all__"

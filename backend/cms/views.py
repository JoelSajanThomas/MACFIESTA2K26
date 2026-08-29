from rest_framework import viewsets

from config.permissions import IsAdminOrReadOnly

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
from .serializers import (
    SiteSettingSerializer,
    FestivalHighlightSerializer,
    EventCategoryContentSerializer,
    EventFormatSerializer,
    GuestProfileSerializer,
    ThemeSectionSerializer,
    TestimonialSerializer,
    FAQSerializer,
    SponsorSerializer,
    HomepageSectionSerializer,
    FestRewindItemSerializer,
)


def _is_staff(user):
    return user.is_authenticated and (user.is_staff or user.is_superuser)


class ActiveContentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    required_module = "content"

    def get_queryset(self):
        qs = super().get_queryset()
        if self.action == "list" and not _is_staff(self.request.user):
            qs = qs.filter(is_active=True)
        return qs



class SiteSettingViewSet(viewsets.ModelViewSet):
    queryset = SiteSetting.objects.all().order_by("-updated_at")
    serializer_class = SiteSettingSerializer
    permission_classes = [IsAdminOrReadOnly]
    required_module = "content"


class FestivalHighlightViewSet(ActiveContentViewSet):
    queryset = FestivalHighlight.objects.all()
    serializer_class = FestivalHighlightSerializer


class EventCategoryContentViewSet(ActiveContentViewSet):
    queryset = EventCategoryContent.objects.all()
    serializer_class = EventCategoryContentSerializer


class EventFormatViewSet(ActiveContentViewSet):
    queryset = EventFormat.objects.all()
    serializer_class = EventFormatSerializer


class GuestProfileViewSet(ActiveContentViewSet):
    queryset = GuestProfile.objects.all()
    serializer_class = GuestProfileSerializer


class ThemeSectionViewSet(ActiveContentViewSet):
    queryset = ThemeSection.objects.all()
    serializer_class = ThemeSectionSerializer


class TestimonialViewSet(ActiveContentViewSet):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer


class FAQViewSet(ActiveContentViewSet):
    queryset = FAQ.objects.all()
    serializer_class = FAQSerializer


class SponsorViewSet(ActiveContentViewSet):
    queryset = Sponsor.objects.all()
    serializer_class = SponsorSerializer


class FestRewindItemViewSet(ActiveContentViewSet):
    queryset = FestRewindItem.objects.all()
    serializer_class = FestRewindItemSerializer


class HomepageSectionViewSet(viewsets.ModelViewSet):
    queryset = HomepageSection.objects.all()
    serializer_class = HomepageSectionSerializer
    permission_classes = [IsAdminOrReadOnly]
    required_module = "content"

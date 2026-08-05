from django.contrib import admin

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
)


@admin.register(SiteSetting)
class SiteSettingAdmin(admin.ModelAdmin):
    list_display = ("fest_name", "fest_year", "updated_at")


@admin.register(FestivalHighlight)
class FestivalHighlightAdmin(admin.ModelAdmin):
    list_display = ("title", "order", "is_active")
    list_filter = ("is_active",)


@admin.register(EventCategoryContent)
class EventCategoryContentAdmin(admin.ModelAdmin):
    list_display = ("name", "order", "is_active")


@admin.register(EventFormat)
class EventFormatAdmin(admin.ModelAdmin):
    list_display = ("title", "label", "order", "is_active")


@admin.register(GuestProfile)
class GuestProfileAdmin(admin.ModelAdmin):
    list_display = ("name", "role", "order", "is_active")


@admin.register(ThemeSection)
class ThemeSectionAdmin(admin.ModelAdmin):
    list_display = ("title", "is_active")


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ("name", "order", "is_active")


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ("question", "order", "is_active")


@admin.register(Sponsor)
class SponsorAdmin(admin.ModelAdmin):
    list_display = ("name", "sponsor_type", "order", "is_active")
    list_filter = ("sponsor_type", "is_active")


@admin.register(HomepageSection)
class HomepageSectionAdmin(admin.ModelAdmin):
    list_display = ("section_key", "title", "is_visible", "order")
    list_filter = ("is_visible",)

from django.contrib import admin
from .models import Event


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "slug",
        "audience",
        "department",
        "category",
        "event_date",
        "event_time",
        "event_end_time",
        "registration_fee",
        "prize_pool",
        "status",
        "is_registration_open",
    )
    list_filter = ("audience", "category", "status", "event_date", "is_registration_open")
    search_fields = ("title", "slug", "department", "venue")
    prepopulated_fields = {"slug": ("title",)}
    fieldsets = (
        (None, {
            "fields": (
                "title",
                "slug",
                "category",
                "audience",
                "department",
                "description",
                "rules",
                "venue",
                "status",
            ),
        }),
        ("Schedule", {
            "fields": ("event_date", "event_time", "event_end_time", "registration_deadline"),
        }),
        ("Registration", {
            "fields": (
                "registration_fee",
                "prize_pool",
                "max_participants",
                "min_team_size",
                "max_team_size",
                "is_registration_open",
                "waiting_list_enabled",
                "is_result_published",
            ),
        }),
        ("Coordinator", {
            "fields": ("coordinator_name", "coordinator_phone", "coordinator_email"),
        }),
        ("Media", {
            "fields": ("image", "banner_image", "poster_image"),
        }),
    )

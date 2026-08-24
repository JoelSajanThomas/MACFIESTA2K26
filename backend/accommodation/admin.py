from django.contrib import admin
from .models import Hostel, AccommodationBooking


@admin.register(Hostel)
class HostelAdmin(admin.ModelAdmin):
    list_display = ("name", "gender", "hostel_type", "location", "tariff_per_night", "available_beds", "is_active", "order")
    list_filter = ("gender", "is_active")
    search_fields = ("name", "location", "warden_name", "warden_phone")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(AccommodationBooking)
class AccommodationBookingAdmin(admin.ModelAdmin):
    list_display = ("booking_id", "full_name", "hostel", "gender", "persons_count", "check_in_date", "status", "allocated_room", "created_at")
    list_filter = ("status", "gender", "hostel")
    search_fields = ("booking_id", "full_name", "phone", "college", "allocated_room")
    readonly_fields = ("booking_id", "created_at", "updated_at")

from django.contrib import admin
from .models import Registration, TeamMember, Institution


class TeamMemberInline(admin.TabularInline):
    model = TeamMember
    extra = 0


@admin.register(Institution)
class InstitutionAdmin(admin.ModelAdmin):
    list_display = ("name", "created_at")
    search_fields = ("name",)


@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    list_display = (
        "registration_number",
        "participant_name",
        "event",
        "payment_status",
        "is_waiting_list",
        "attendance_marked",
        "cancelled_at",
    )
    list_filter = ("payment_status", "is_waiting_list", "attendance_marked", "food_preference")
    search_fields = ("registration_number", "participant_name", "email", "college_name")
    inlines = [TeamMemberInline]


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ("name", "registration", "phone", "email")

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User

from .models import StaffProfile


class StaffProfileInline(admin.StackedInline):
    model = StaffProfile
    can_delete = False
    fk_name = "user"


class UserAdmin(BaseUserAdmin):
    inlines = [StaffProfileInline]


admin.site.unregister(User)
admin.site.register(User, UserAdmin)


@admin.register(StaffProfile)
class StaffProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "committee", "display_name", "phone", "must_change_password")
    list_filter = ("committee", "must_change_password")
    search_fields = ("user__username", "display_name", "phone")

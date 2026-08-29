from django.contrib import admin
from .models import GalleryImage


@admin.register(GalleryImage)
class GalleryImageAdmin(admin.ModelAdmin):
    list_display = ('title', 'type', 'category', 'featured', 'uploaded_at')
    list_filter = ('type', 'category', 'featured')
    search_fields = ('title',)
    list_editable = ('featured',)
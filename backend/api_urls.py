from django.urls import path, include
from rest_framework.routers import DefaultRouter

from events.views import EventViewSet
from registrations.views import RegistrationViewSet, AdminRegistrationListView
from results.views import ResultViewSet
from gallery.views import GalleryImageViewSet
from announcements.views import AnnouncementViewSet
from dashboard.views import dashboard_stats, current_user

router = DefaultRouter()
router.register('events', EventViewSet)
router.register('registrations', RegistrationViewSet, basename='registrations')
router.register('results', ResultViewSet)
router.register('gallery', GalleryImageViewSet)
router.register('announcements', AnnouncementViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/stats/', dashboard_stats),
    path('auth/me/', current_user),
    path('admin/registrations/', AdminRegistrationListView.as_view()),
]
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from events.views import EventViewSet
from registrations.views import (
    RegistrationViewSet,
    AdminRegistrationListView,
    AdminRegistrationDetailView,
    admin_promote_waitlist,
    my_pass,
    certificate_data,
    attendance_report,
)
from results.views import ResultViewSet
from gallery.views import GalleryImageViewSet
from announcements.views import AnnouncementViewSet
from dashboard.views import dashboard_stats, current_user, public_fest_stats
from cms.views import (
    SiteSettingViewSet,
    FestivalHighlightViewSet,
    EventCategoryContentViewSet,
    EventFormatViewSet,
    GuestProfileViewSet,
    ThemeSectionViewSet,
    TestimonialViewSet,
    FAQViewSet,
    SponsorViewSet,
    HomepageSectionViewSet,
    FestRewindItemViewSet,
)

router = DefaultRouter()
router.register('events', EventViewSet)
router.register('registrations', RegistrationViewSet, basename='registrations')
router.register('results', ResultViewSet)
router.register('gallery', GalleryImageViewSet)
router.register('announcements', AnnouncementViewSet)

cms_router = DefaultRouter()
cms_router.register('site-settings', SiteSettingViewSet, basename='cms-site-settings')
cms_router.register('highlights', FestivalHighlightViewSet, basename='cms-highlights')
cms_router.register('categories', EventCategoryContentViewSet, basename='cms-categories')
cms_router.register('formats', EventFormatViewSet, basename='cms-formats')
cms_router.register('guests', GuestProfileViewSet, basename='cms-guests')
cms_router.register('theme', ThemeSectionViewSet, basename='cms-theme')
cms_router.register('testimonials', TestimonialViewSet, basename='cms-testimonials')
cms_router.register('faqs', FAQViewSet, basename='cms-faqs')
cms_router.register('sponsors', SponsorViewSet, basename='cms-sponsors')
cms_router.register('rewind', FestRewindItemViewSet, basename='cms-rewind')
cms_router.register('homepage-sections', HomepageSectionViewSet, basename='cms-homepage-sections')

urlpatterns = [
    path('', include(router.urls)),
    path('cms/', include(cms_router.urls)),
    path('public/stats/', public_fest_stats),
    path('dashboard/stats/', dashboard_stats),
    path('auth/me/', current_user),
    path('admin/registrations/', AdminRegistrationListView.as_view()),
    path('admin/registrations/<int:pk>/', AdminRegistrationDetailView.as_view()),
    path('admin/events/<int:event_id>/promote-waitlist/', admin_promote_waitlist),
    path('admin/reports/attendance/', attendance_report),
    path('registrations/<int:pk>/pass/', my_pass),
    path('certificates/<int:result_id>/', certificate_data),
]
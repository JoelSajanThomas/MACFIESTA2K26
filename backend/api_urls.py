from django.urls import path, include
from rest_framework.routers import DefaultRouter

from events.views import EventViewSet
from registrations.views import (
    RegistrationViewSet,
    AdminRegistrationListView,
    AdminRegistrationDetailView,
    admin_promote_waitlist,
    admin_verify_member_finance,
    admin_verify_member_organizer,
    my_pass,
    certificate_data,
    attendance_report,
    export_registrations_csv,
    verify_lookup,
    verify_check_in,
    public_institutions,
)
from results.views import ResultViewSet
from gallery.views import GalleryImageViewSet
from announcements.views import AnnouncementViewSet
from dashboard.views import (
    dashboard_stats,
    current_user,
    public_fest_stats,
    public_fest_config,
)
from accounts.staff_views import (
    staff_directory,
    staff_detail,
    participant_user_list,
    participant_user_detail,
    purge_registered_users_data,
)
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
from accommodation.views import (
    HostelViewSet,
    AccommodationBookingViewSet,
    admin_hospitality_stats,
)

router = DefaultRouter()
router.register('events', EventViewSet)
router.register('registrations', RegistrationViewSet, basename='registrations')
router.register('results', ResultViewSet)
router.register('gallery', GalleryImageViewSet)
router.register('announcements', AnnouncementViewSet)
router.register('hostels', HostelViewSet, basename='hostels')
router.register('accommodation/bookings', AccommodationBookingViewSet, basename='accommodation-bookings')

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
    path('public/config/', public_fest_config),
    path('public/institutions/', public_institutions),
    path('dashboard/stats/', dashboard_stats),
    path('auth/me/', current_user),
    path('admin/staff/', staff_directory),
    path('admin/staff/<int:pk>/', staff_detail),
    path('admin/participants/', participant_user_list),
    path('admin/participants/<int:pk>/', participant_user_detail),
    path('admin/registrations/', AdminRegistrationListView.as_view()),
    path('admin/registrations/<int:pk>/', AdminRegistrationDetailView.as_view()),
    path('admin/team-members/<int:member_id>/verify-finance/', admin_verify_member_finance),
    path('admin/team-members/<int:member_id>/verify-organizer/', admin_verify_member_organizer),
    path('admin/events/<int:event_id>/promote-waitlist/', admin_promote_waitlist),
    path('admin/reports/attendance/', attendance_report),
    path('admin/reports/registrations.csv', export_registrations_csv),
    path('admin/hospitality/stats/', admin_hospitality_stats),
    path('admin/purge-registered-data/', purge_registered_users_data),
    path('admin/verification/lookup/', verify_lookup),
    path('admin/verification/check-in/', verify_check_in),
    path('registrations/<int:pk>/pass/', my_pass),
    path('certificates/<int:result_id>/', certificate_data),
]
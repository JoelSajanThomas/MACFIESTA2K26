from django.contrib import admin
from django.http import HttpResponse
from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve

from rest_framework_simplejwt.views import TokenRefreshView

from config.auth_views import (
    ChangePasswordView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    SignupView,
    ThrottledTokenObtainPairView,
)


def api_root(_request):
    """Django serves the API only. The React site runs on Vite (port 5173)."""
    return HttpResponse(
        "<!doctype html><html><head><meta charset='utf-8'><title>MacFiesta Pro API</title></head>"
        "<body style='font-family:system-ui;max-width:40rem;margin:3rem auto;line-height:1.5'>"
        "<h1>MacFiesta Pro API</h1>"
        "<p>This is the Django backend (port 8000). The website is the React app.</p>"
        "<p>Open the frontend at "
        "<a href='http://127.0.0.1:5173'>http://127.0.0.1:5173</a> "
        "(run <code>npm run dev</code> in <code>frontend/</code>).</p>"
        "<p>Useful backend paths:</p>"
        "<ul>"
        "<li><a href='/admin/'>/admin/</a> — Django Admin</li>"
        "<li><a href='/api/'>/api/</a> — REST API</li>"
        "</ul>"
        "</body></html>",
        content_type="text/html",
    )


urlpatterns = [
    path('', api_root),
    path('admin/', admin.site.urls),

    path('api/', include('api_urls')),

    path('api/auth/login/', ThrottledTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/register/', SignupView.as_view(), name='auth_register'),
    path('api/auth/password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path(
        'api/auth/password-reset/confirm/',
        PasswordResetConfirmView.as_view(),
        name='password_reset_confirm',
    ),
    path('api/auth/change-password/', ChangePasswordView.as_view(), name='change_password'),
]

# Serve uploaded media in both DEBUG and production.
# WhiteNoise covers STATIC_ROOT only; this keeps media working when DEBUG=False.
if getattr(settings, "SERVE_MEDIA", True):
    urlpatterns += [
        re_path(
            r"^media/(?P<path>.*)$",
            serve,
            {"document_root": settings.MEDIA_ROOT},
        ),
    ]

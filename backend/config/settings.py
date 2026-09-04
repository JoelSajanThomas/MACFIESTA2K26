"""
Django settings for MacFiesta Pro.
Local development uses SQLite and DEBUG=True by default.
Production reads configuration from environment variables.
"""

import os
from decimal import Decimal as _Decimal
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


def env_bool(name, default=False):
    value = os.environ.get(name)
    if value is None:
        return default
    return value.lower() in {"1", "true", "yes", "on"}


def env_list(name, default=None):
    raw = os.environ.get(name, "")
    items = [item.strip() for item in raw.split(",") if item.strip()]
    if items:
        return items
    return default or []


DEBUG = env_bool("DEBUG", True)

SECRET_KEY = os.environ.get("SECRET_KEY")
if not SECRET_KEY:
    if DEBUG:
        # Ephemeral local-only key — regenerates each process start so a known
        # committed string is never a stable signing secret. Production MUST set SECRET_KEY.
        import secrets as _secrets

        SECRET_KEY = f"django-insecure-dev-{_secrets.token_urlsafe(48)}"
    else:
        raise ValueError("SECRET_KEY environment variable is required when DEBUG=False")

ALLOWED_HOSTS = env_list("ALLOWED_HOSTS")
if not ALLOWED_HOSTS:
    ALLOWED_HOSTS = ["*"]

# Allow all CORS origins if explicitly set, or if CORS_ALLOW_ALL_ORIGINS=True, or if DEBUG
CORS_ALLOW_ALL_ORIGINS = env_bool("CORS_ALLOW_ALL_ORIGINS", True)
CORS_ALLOWED_ORIGINS = env_list("CORS_ALLOWED_ORIGINS")

CSRF_TRUSTED_ORIGINS = env_list("CSRF_TRUSTED_ORIGINS", CORS_ALLOWED_ORIGINS)
if not CSRF_TRUSTED_ORIGINS:
    CSRF_TRUSTED_ORIGINS = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "https://*.onrender.com",
        "https://*.vercel.app",
    ]

# Auto-trust Render external domain if running on Render
RENDER_EXTERNAL_HOSTNAME = os.environ.get("RENDER_EXTERNAL_HOSTNAME")
if RENDER_EXTERNAL_HOSTNAME:
    if RENDER_EXTERNAL_HOSTNAME not in ALLOWED_HOSTS and "*" not in ALLOWED_HOSTS:
        ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)
    render_origin = f"https://{RENDER_EXTERNAL_HOSTNAME}"
    if render_origin not in CSRF_TRUSTED_ORIGINS:
        CSRF_TRUSTED_ORIGINS.append(render_origin)


AUTHENTICATION_BACKENDS = [
    "accounts.backends.EmailOrUsernameBackend",
    "django.contrib.auth.backends.ModelBackend",
]


REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "1000/min" if DEBUG else "120/min",
        "user": "2000/min" if DEBUG else "300/min",
        "login": "60/min" if DEBUG else "10/min",
        "signup": "60/min" if DEBUG else "10/min",
        "password_reset": "30/min" if DEBUG else "5/min",
        "jwt_refresh": "120/min" if DEBUG else "30/min",
    },
}

DATA_UPLOAD_MAX_MEMORY_SIZE = 50 * 1024 * 1024
FILE_UPLOAD_MAX_MEMORY_SIZE = 50 * 1024 * 1024

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
# WhiteNoise serves STATIC_ROOT only. Media is served via urls.py `serve` unless disabled.
SERVE_MEDIA = env_bool("SERVE_MEDIA", True)

# Frontend origin for password-reset links (e.g. https://macfiesta-pro.vercel.app)
FRONTEND_BASE_URL = os.environ.get("FRONTEND_BASE_URL", "").rstrip("/")
if FRONTEND_BASE_URL:
    if FRONTEND_BASE_URL not in CSRF_TRUSTED_ORIGINS:
        CSRF_TRUSTED_ORIGINS.append(FRONTEND_BASE_URL)
    if FRONTEND_BASE_URL not in CORS_ALLOWED_ORIGINS:
        CORS_ALLOWED_ORIGINS.append(FRONTEND_BASE_URL)


# --- Fest payment + add-on fees (from .env — never hardcode live UPI/bank in source) ---

PAYMENT_ACCOUNT_NAME = os.environ.get("PAYMENT_ACCOUNT_NAME", "MANAGER MAR ATHANASIOS COLLEGE FOR ADVANCED STUDIES TIRUVALLA")
PAYMENT_UPI_ID = os.environ.get("PAYMENT_UPI_ID", "macfast12230qr@fbl")
HOSTEL_PAYMENT_ACCOUNT_NAME = os.environ.get("HOSTEL_PAYMENT_ACCOUNT_NAME", "ST ALPHONSA HOSTEL")
HOSTEL_PAYMENT_UPI_ID = os.environ.get("HOSTEL_PAYMENT_UPI_ID", "stalphonsahostel@iob")
PAYMENT_BANK_NAME = os.environ.get("PAYMENT_BANK_NAME", "")
PAYMENT_ACCOUNT_NUMBER = os.environ.get("PAYMENT_ACCOUNT_NUMBER", "")
PAYMENT_IFSC = os.environ.get("PAYMENT_IFSC", "")
PAYMENT_INSTRUCTIONS = os.environ.get(
    "PAYMENT_INSTRUCTIONS",
    "Pay the total amount to the official fest account. Keep the UPI/bank receipt - "
    "the desk will verify payment against your registration number.",
)

ACCOMMODATION_FEE_PER_PERSON = _Decimal(os.environ.get("ACCOMMODATION_FEE_PER_PERSON", "350.00"))
BREAKFAST_FEE = _Decimal(os.environ.get("BREAKFAST_FEE", "50.00"))
LUNCH_FEE = _Decimal(os.environ.get("LUNCH_FEE", "70.00"))
DINNER_FEE = _Decimal(os.environ.get("DINNER_FEE", "50.00"))
# FOOD_PACKAGE_FEE = Breakfast + Lunch + Dinner = 50 + 70 + 50 = 170
FOOD_PACKAGE_FEE = _Decimal(os.environ.get("FOOD_PACKAGE_FEE", "170.00"))
TRANSPORT_ASSIST_FEE = _Decimal(os.environ.get("TRANSPORT_ASSIST_FEE", "100.00"))

# Public QR image renderer used by digital pass (client may also set VITE_QR_API_URL)
QR_IMAGE_API_URL = os.environ.get(
    "QR_IMAGE_API_URL",
    "https://api.qrserver.com/v1/create-qr-code/",
)

PAYMENT_QR_IMAGE_URL = os.environ.get("PAYMENT_QR_IMAGE_URL", "/event-payment-qr.jpg")
HOSTEL_PAYMENT_QR_IMAGE_URL = os.environ.get("HOSTEL_PAYMENT_QR_IMAGE_URL", "/hostel-payment-qr.jpg")

# --- Desk seed credentials (passwords MUST live in .env — never in source/docs) ---
DESK_USERNAME_TEMPLATE = os.environ.get("DESK_USERNAME_TEMPLATE", "macfiesta{committee}admin")
DESK_EMAIL_DOMAIN = os.environ.get("DESK_EMAIL_DOMAIN", "macfiesta.local")
DESK_PASSWORD_TEMPLATE = os.environ.get("DESK_PASSWORD_TEMPLATE", "")
# Optional per-desk overrides: DESK_PASSWORD_FINANCE, DESK_PASSWORD_FOOD, …

# QR / pass HMAC salt (uses Django SECRET_KEY under the hood; salt should be unique per deploy)
REGISTRATION_SIGNER_SALT = os.environ.get("REGISTRATION_SIGNER_SALT", "macfiesta.registration.pass")
REGISTRATION_PASS_MAX_AGE_DAYS = int(os.environ.get("REGISTRATION_PASS_MAX_AGE_DAYS", "60"))

# Public contact fallbacks (CMS site-settings can override on the site)
CONTACT_EMAIL = os.environ.get("CONTACT_EMAIL", "macfiesta@macfast.org")
CONTACT_PHONE = os.environ.get("CONTACT_PHONE", "")
REGISTRATION_HELP_EMAIL = os.environ.get("REGISTRATION_HELP_EMAIL", "macfiesta@macfast.org")
REGISTRATION_HELP_PHONE = os.environ.get("REGISTRATION_HELP_PHONE", "")
OFFICIAL_WEBSITE = os.environ.get("OFFICIAL_WEBSITE", "https://macfast.org/")
INSTAGRAM_URL = os.environ.get("INSTAGRAM_URL", "https://www.instagram.com/macfiestaofficial/")
YOUTUBE_URL = os.environ.get("YOUTUBE_URL", "https://www.youtube.com/@macfastofficial161")
FACEBOOK_URL = os.environ.get("FACEBOOK_URL", "https://www.facebook.com/macfastofficial/")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "events",
    "registrations",
    "results",
    "gallery",
    "announcements",
    "dashboard",
    "cms",
    "accounts",
    "accommodation",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "config.middleware.SecurityHeadersMiddleware",  # custom: hides server info + no-cache API responses
]

# ─── Security headers & production hardening ─────────────────────────────────
SECURE_CONTENT_TYPE_NOSNIFF = True       # X-Content-Type-Options: nosniff
X_FRAME_OPTIONS = "DENY"                  # X-Frame-Options: DENY (no iframe embedding)
SECURE_BROWSER_XSS_FILTER = True         # Legacy X-XSS-Protection header
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"

# Only force HTTPS / HSTS behind reverse-proxy in actual production (DEBUG=False).
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_SSL_REDIRECT = env_bool("SECURE_SSL_REDIRECT", True)
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = int(os.environ.get("SECURE_HSTS_SECONDS", "31536000"))
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"


ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

DATABASE_URL = os.environ.get("DATABASE_URL")
if DATABASE_URL:
    DATABASES = {
        "default": dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=600,
            ssl_require=not DEBUG,
        )
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# Explicit hashers — passwords are NEVER stored in plain text.
# create_user / set_password / check_password all use this stack (PBKDF2 by default).
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.PBKDF2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher",
    "django.contrib.auth.hashers.Argon2PasswordHasher",
    "django.contrib.auth.hashers.BCryptSHA256PasswordHasher",
    "django.contrib.auth.hashers.ScryptPasswordHasher",
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

from datetime import timedelta

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "UPDATE_LAST_LOGIN": False,
}

# --- Email Configuration (SMTP / Console fallback) ---
EMAIL_BACKEND = os.environ.get(
    "EMAIL_BACKEND",
    "django.core.mail.backends.smtp.EmailBackend"
    if (os.environ.get("EMAIL_HOST_USER") and os.environ.get("EMAIL_HOST_PASSWORD"))
    else "django.core.mail.backends.console.EmailBackend",
)
EMAIL_HOST = os.environ.get("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.environ.get("EMAIL_PORT", "587"))
EMAIL_USE_TLS = env_bool("EMAIL_USE_TLS", True)
EMAIL_USE_SSL = env_bool("EMAIL_USE_SSL", False)
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", "")
DEFAULT_FROM_EMAIL = os.environ.get(
    "DEFAULT_FROM_EMAIL",
    f"MACFIESTA 2026 <{os.environ.get('EMAIL_HOST_USER') or 'macfiesta@macfast.org'}>",
)
EMAIL_TIMEOUT = int(os.environ.get("EMAIL_TIMEOUT", "10"))


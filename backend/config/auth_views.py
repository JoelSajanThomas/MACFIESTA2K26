import logging
import re
import secrets

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.cache import cache
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.mail import EmailMultiAlternatives, send_mail
from django.db.models import Q
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from rest_framework import serializers, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

User = get_user_model()
logger = logging.getLogger(__name__)

OTP_TTL_SECONDS = 10 * 60
OTP_CACHE_PREFIX = "macfiesta:pwd_otp:"
OTP_REGEX = re.compile(r"^\d{6}$")
EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class LoginRateThrottle(AnonRateThrottle):
    scope = "login"


class SignupRateThrottle(AnonRateThrottle):
    scope = "signup"


class PasswordResetRateThrottle(AnonRateThrottle):
    scope = "password_reset"


class JwtRefreshRateThrottle(AnonRateThrottle):
    scope = "jwt_refresh"


class EmailOrUsernameTokenSerializer(TokenObtainPairSerializer):
    """Accept username OR email in the username field (same JWT login endpoint)."""

    def validate(self, attrs):
        raw = (attrs.get(self.username_field) or "").strip()
        if raw and "@" in raw:
            match = User.objects.filter(email__iexact=raw).order_by("id").first()
            if match:
                attrs[self.username_field] = match.username
        return super().validate(attrs)


class ThrottledTokenObtainPairView(TokenObtainPairView):
    throttle_classes = [LoginRateThrottle]
    serializer_class = EmailOrUsernameTokenSerializer


class ThrottledTokenRefreshView(TokenRefreshView):
    throttle_classes = [JwtRefreshRateThrottle]


class SignupSerializer(serializers.Serializer):
    email = serializers.EmailField()
    full_name = serializers.CharField(max_length=150)
    college_name = serializers.CharField(max_length=200)
    phone = serializers.CharField(max_length=20)
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    # Legacy clients may still send username; ignored when present.
    username = serializers.CharField(required=False, allow_blank=True, max_length=150)

    def validate_email(self, value):
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        if User.objects.filter(username__iexact=email).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return email

    def validate_full_name(self, value):
        name = (value or "").strip()
        if len(name) < 2:
            raise serializers.ValidationError("Enter your full name.")
        return name

    def validate_college_name(self, value):
        college = (value or "").strip()
        if len(college) < 2:
            raise serializers.ValidationError("Enter your college or school name.")
        return college

    def validate_phone(self, value):
        phone = re.sub(r"\s+", "", (value or "").strip())
        digits = re.sub(r"\D", "", phone)

        # 10 digits starting with 6-9
        if len(digits) == 10 and re.match(r"^[6-9]\d{9}$", digits):
            return digits
        # +91 prefix (12 digits, remaining 10 start with 6-9)
        if len(digits) == 12 and digits.startswith("91") and re.match(r"^[6-9]\d{9}$", digits[2:]):
            return digits[2:]

        if len(digits) > 10:
            raise serializers.ValidationError("Mobile number cannot exceed 10 digits.")
        if len(digits) < 10:
            raise serializers.ValidationError("Mobile number must be exactly 10 digits.")
        raise serializers.ValidationError(
            "Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9."
        )

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        try:
            validate_password(attrs["password"])
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": list(exc.messages)}) from exc
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm", None)
        validated_data.pop("username", None)
        college_name = validated_data.pop("college_name", "")
        phone = validated_data.pop("phone", "")
        full_name = validated_data.pop("full_name", "") or ""
        email = validated_data["email"]
        first_name = full_name
        last_name = ""
        if full_name and " " in full_name:
            first_name, last_name = full_name.split(" ", 1)
        user = User.objects.create_user(
            username=email,
            email=email,
            password=validated_data["password"],
            first_name=first_name[:150],
            last_name=last_name[:150],
        )
        # Stash participant details for checkout prefill (no separate student profile yet).
        user._signup_college_name = college_name
        user._signup_phone = phone
        return user


class SignupView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [SignupRateThrottle]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        self._send_welcome_email(user)

        college_name = getattr(user, "_signup_college_name", "") or ""
        phone = getattr(user, "_signup_phone", "") or ""
        if college_name:
            try:
                from registrations.institutions import ensure_institution

                ensure_institution(college_name)
            except Exception:
                logger.exception("Failed to persist institution from signup")

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "username": user.username,
                    "email": user.email,
                    "full_name": user.get_full_name(),
                    "college_name": college_name,
                    "phone": phone,
                    "is_staff": user.is_staff,
                    "is_superuser": user.is_superuser,
                },
                "detail": "Account created successfully.",
            },
            status=status.HTTP_201_CREATED,
        )

    def _send_welcome_email(self, user):
        if not user.email:
            return
        display = (user.get_full_name() or "").strip() or user.email
        subject = "Welcome to MacFiesta Pro"
        message = (
            f"Hi {display},\n\n"
            "Your MacFiesta Pro account is ready. You can now register for events.\n\n"
            "If you did not create this account, contact the fest desk.\n"
        )
        try:
            send_mail(
                subject,
                message,
                getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@macfiesta.local"),
                [user.email],
                fail_silently=True,
            )
        except Exception:
            logger.exception("Failed to send welcome email to user_id=%s", user.id)


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        email = value.strip().lower()
        if not EMAIL_REGEX.match(email):
            raise serializers.ValidationError("Enter a valid email address.")
        return email


class PasswordResetRequestView(APIView):
    """
    Validates that the email belongs to a registered active user.
    Sends a 6-digit OTP to the user's email address.
    """

    permission_classes = [AllowAny]
    throttle_classes = [PasswordResetRateThrottle]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].strip().lower()

        user = User.objects.filter(
            Q(email__iexact=email) | Q(username__iexact=email),
            is_active=True,
        ).order_by("id").first()

        if not user:
            return Response(
                {
                    "detail": "No registered account was found with this email address. Please register for an account first or check your email spelling.",
                    "not_registered": True,
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        target_email = user.email if user.email else email
        otp = f"{secrets.randbelow(1_000_000):06d}"
        cache.set(f"{OTP_CACHE_PREFIX}{email}", make_password(otp), timeout=OTP_TTL_SECONDS)
        if target_email.lower() != email:
            cache.set(f"{OTP_CACHE_PREFIX}{target_email.lower()}", make_password(otp), timeout=OTP_TTL_SECONDS)

        subject = "MACFIESTA 2026 — Password Reset Verification Code"
        text_message = (
            f"Hello {user.first_name or user.username},\n\n"
            "You requested a password reset for your MACFIESTA 2026 account.\n\n"
            f"Your 6-digit verification code is:\n\n"
            f"  {otp}\n\n"
            "This code will expire in 10 minutes.\n"
            "If you did not request this code, please disregard this transmission.\n\n"
            "Best regards,\n"
            "MACFIESTA 2026 Team\n"
            "MACFAST, Thiruvalla"
        )
        html_message = (
            f'<div style="font-family: Arial, sans-serif; background: #05050A; color: #FFFFFF; padding: 28px; border-radius: 16px; max-width: 500px; margin: 0 auto; border: 1px solid #1E293B;">'
            f'<div style="text-align: center; margin-bottom: 20px;">'
            f'<h1 style="color: #FFD700; margin: 0; font-size: 24px; letter-spacing: 2px;">MACFIESTA 2026</h1>'
            f'<p style="color: #00D4FF; font-size: 11px; margin-top: 4px; letter-spacing: 1px; font-weight: bold;">S.H.I.E.L.D. SECURE ACCESS RECOVERY</p>'
            f'</div>'
            f'<p style="color: #CBD5E1; font-size: 14px;">Hello <strong>{user.first_name or user.username}</strong>,</p>'
            f'<p style="color: #94A3B8; font-size: 13px; line-height: 1.5;">We received a request to reset your MACFIESTA account password. Use the single-use OTP code below to verify your identity and set a new password:</p>'
            f'<div style="text-align: center; margin: 24px 0;">'
            f'<div style="display: inline-block; background: #0B1120; border: 2px solid #00D4FF; border-radius: 12px; padding: 14px 28px; font-size: 28px; font-weight: bold; letter-spacing: 8px; color: #00D4FF; font-family: monospace; box-shadow: 0 0 15px rgba(0,212,255,0.3);">'
            f'{otp}'
            f'</div>'
            f'</div>'
            f'<p style="color: #F87171; font-size: 11px; text-align: center; margin-bottom: 20px;">⏱ This code expires in 10 minutes. Do not share this code with anyone.</p>'
            f'<hr style="border: 0; border-top: 1px solid #1E293B; margin: 20px 0;" />'
            f'<p style="color: #64748B; font-size: 11px; text-align: center; margin: 0;">If you did not request this password reset, please ignore this email or contact fest support.</p>'
            f'</div>'
        )

        from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "macfiesta@macfast.org")
        try:
            msg = EmailMultiAlternatives(subject, text_message, from_email, [target_email])
            msg.attach_alternative(html_message, "text/html")
            msg.send(fail_silently=False)
        except Exception as exc:
            logger.exception("Failed to send password reset OTP to %s (user_id=%s): %s", target_email, user.id, exc)
            return Response(
                {
                    "detail": "Failed to transmit OTP via email. Please check your network or try again in a few moments.",
                    "error": str(exc),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        if settings.DEBUG:
            logger.info("Password OTP generated for user_id=%s (email=%s, otp=%s)", user.id, target_email, otp)

        return Response(
            {
                "detail": f"A 6-digit OTP code has been sent to {target_email}. Please check your inbox (and spam folder).",
                "otp_required": True,
                "email": target_email,
            },
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmSerializer(serializers.Serializer):
    """OTP flow (preferred) or legacy uid+token link."""

    email = serializers.EmailField(required=False, allow_blank=True)
    otp = serializers.CharField(required=False, allow_blank=True, max_length=8)
    uid = serializers.CharField(required=False, allow_blank=True)
    token = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    def validate_otp(self, value):
        value = (value or "").strip()
        if value and not OTP_REGEX.match(value):
            raise serializers.ValidationError("OTP must be exactly 6 digits.")
        return value

    def validate_email(self, value):
        if not value:
            return ""
        email = value.strip().lower()
        if not EMAIL_REGEX.match(email):
            raise serializers.ValidationError("Enter a valid email address.")
        return email

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        try:
            validate_password(attrs["password"])
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": list(exc.messages)}) from exc

        email = (attrs.get("email") or "").strip().lower()
        otp = (attrs.get("otp") or "").strip()
        uid = (attrs.get("uid") or "").strip()
        token = (attrs.get("token") or "").strip()

        user = None
        if email and otp:
            user = User.objects.filter(email__iexact=email, is_active=True).order_by("id").first()
            if not user:
                raise serializers.ValidationError({"otp": "Invalid or expired OTP."})
            cached = cache.get(f"{OTP_CACHE_PREFIX}{email}")
            if not cached or not check_password(otp, cached):
                raise serializers.ValidationError({"otp": "Invalid or expired OTP."})
            attrs["_otp_email"] = email
        elif uid and token:
            try:
                uid_int = force_str(urlsafe_base64_decode(uid))
                user = User.objects.get(pk=uid_int)
            except (TypeError, ValueError, OverflowError, User.DoesNotExist) as exc:
                raise serializers.ValidationError({"uid": "Invalid reset link."}) from exc
            if not default_token_generator.check_token(user, token):
                raise serializers.ValidationError({"token": "This reset link is invalid or has expired."})
        else:
            raise serializers.ValidationError(
                {"otp": "Provide email + 6-digit OTP (or a valid reset link)."}
            )

        attrs["user"] = user
        return attrs


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [PasswordResetRateThrottle]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        # Django hashes with PBKDF2 (AUTH_PASSWORD_VALIDATORS / default hasher)
        user.set_password(serializer.validated_data["password"])
        user.save(update_fields=["password"])
        otp_email = serializer.validated_data.get("_otp_email")
        if otp_email:
            cache.delete(f"{OTP_CACHE_PREFIX}{otp_email}")
        return Response({"detail": "Password updated. You can sign in with your new password."})


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = self.context["request"].user
        if not user.check_password(attrs["current_password"]):
            raise serializers.ValidationError({"current_password": "Current password is incorrect."})
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        if attrs["password"] == attrs["current_password"]:
            raise serializers.ValidationError({"password": "Choose a password different from the current one."})
        try:
            validate_password(attrs["password"], user=user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": list(exc.messages)}) from exc
        return attrs


class ChangePasswordView(APIView):
    """Authenticated password change; clears staff must_change_password flag."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = request.user
        user.set_password(serializer.validated_data["password"])
        user.save(update_fields=["password"])
        profile = getattr(user, "staff_profile", None)
        if profile and profile.must_change_password:
            profile.must_change_password = False
            profile.save(update_fields=["must_change_password"])
        return Response({"detail": "Password updated."})

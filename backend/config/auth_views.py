import logging

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import serializers, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

User = get_user_model()
logger = logging.getLogger(__name__)


class LoginRateThrottle(AnonRateThrottle):
    scope = "login"


class SignupRateThrottle(AnonRateThrottle):
    scope = "signup"


class PasswordResetRateThrottle(AnonRateThrottle):
    scope = "password_reset"


class ThrottledTokenObtainPairView(TokenObtainPairView):
    throttle_classes = [LoginRateThrottle]


class SignupSerializer(serializers.Serializer):
    username = serializers.CharField(min_length=3, max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    def validate_username(self, value):
        username = value.strip()
        if User.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError("This username is already taken.")
        return username

    def validate_email(self, value):
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return email

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        try:
            validate_password(attrs["password"])
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": list(exc.messages)}) from exc
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )


class SignupView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [SignupRateThrottle]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        self._send_welcome_email(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "username": user.username,
                    "email": user.email,
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
        subject = "Welcome to MacFiesta Pro"
        message = (
            f"Hi {user.username},\n\n"
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


class PasswordResetRequestView(APIView):
    """
    Always returns a generic success message (no email enumeration).
    When email backend is configured, sends a reset link.
    Staff can also reset passwords via Django admin (/admin/).
    """

    permission_classes = [AllowAny]
    throttle_classes = [PasswordResetRateThrottle]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].strip().lower()

        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            frontend = getattr(settings, "FRONTEND_BASE_URL", "").rstrip("/")
            if not frontend:
                frontend = "http://127.0.0.1:5173" if settings.DEBUG else ""
            reset_path = f"/reset-password?uid={uid}&token={token}"
            reset_url = f"{frontend}{reset_path}" if frontend else reset_path

            subject = "MacFiesta Pro password reset"
            message = (
                f"Hi {user.username},\n\n"
                "We received a request to reset your password.\n"
                f"Open this link to choose a new password:\n{reset_url}\n\n"
                "If you did not request this, you can ignore this email.\n"
                "Fest desk / admin can also reset passwords in Django admin.\n"
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
                logger.exception("Failed to send password reset email to user_id=%s", user.id)

            # Local/dev: include reset path so QA can complete without SMTP.
            payload = {
                "detail": (
                    "If an account exists for that email, password reset instructions "
                    "have been sent. You can also ask the fest desk to reset your password."
                ),
            }
            if settings.DEBUG:
                payload["debug_reset_path"] = reset_path
            return Response(payload)

        return Response(
            {
                "detail": (
                    "If an account exists for that email, password reset instructions "
                    "have been sent. You can also ask the fest desk to reset your password."
                ),
            }
        )


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        try:
            validate_password(attrs["password"])
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": list(exc.messages)}) from exc

        try:
            uid = force_str(urlsafe_base64_decode(attrs["uid"]))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist) as exc:
            raise serializers.ValidationError({"uid": "Invalid reset link."}) from exc

        if not default_token_generator.check_token(user, attrs["token"]):
            raise serializers.ValidationError({"token": "This reset link is invalid or has expired."})

        attrs["user"] = user
        return attrs


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [PasswordResetRateThrottle]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        user.set_password(serializer.validated_data["password"])
        user.save(update_fields=["password"])
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

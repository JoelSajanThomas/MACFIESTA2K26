"""Core/Admin staff & volunteer account management (JWT + StaffProfile)."""

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from accounts.drf import HasModule
from accounts.models import StaffProfile
from accounts.permissions import ALL_MODULES, MODULES_BY_COMMITTEE

User = get_user_model()

VOLUNTEER_COMMITTEES = [
    "finance",
    "food",
    "hospitality",
    "event",
    "program",
    "cultural",
    "publicity",
    "invitation",
    "verification",
]

# Core may also be assigned by Core admins (not via volunteer self-serve).
MANAGEABLE_COMMITTEES = ["core", *VOLUNTEER_COMMITTEES]


def _serialize_staff(user):
    profile = getattr(user, "staff_profile", None)
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "display_name": (profile.display_name if profile else "")
        or user.get_full_name()
        or user.username,
        "phone": (profile.phone if profile else "") or "",
        "committee": profile.committee if profile else ("core" if user.is_superuser else None),
        "committee_label": (
            profile.get_committee_display()
            if profile
            else ("Core Team" if user.is_superuser else "—")
        ),
        "is_active": user.is_active,
        "is_superuser": user.is_superuser,
        "must_change_password": bool(profile and profile.must_change_password),
        "last_login": user.last_login,
        "date_joined": user.date_joined,
        "modules": list(ALL_MODULES)
        if user.is_superuser or (profile and profile.committee == "core")
        else list(MODULES_BY_COMMITTEE.get(profile.committee if profile else "", [])),
    }


class StaffCreateSerializer(serializers.Serializer):
    username = serializers.CharField(min_length=3, max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    display_name = serializers.CharField(max_length=120)
    phone = serializers.CharField(required=False, allow_blank=True, max_length=30)
    committee = serializers.ChoiceField(choices=[(c, c) for c in MANAGEABLE_COMMITTEES])
    temporary_password = serializers.CharField(min_length=8, write_only=True)
    is_active = serializers.BooleanField(default=True)

    def validate_username(self, value):
        username = value.strip()
        if User.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError("This username is already taken.")
        return username

    def validate_email(self, value):
        email = (value or "").strip().lower()
        if not email:
            return ""
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return email

    def validate_temporary_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages)) from exc
        return value

    def validate_display_name(self, value):
        return (value or "").strip()

    def validate_phone(self, value):
        return (value or "").strip()


class StaffUpdateSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False, allow_blank=True)
    display_name = serializers.CharField(required=False, max_length=120)
    phone = serializers.CharField(required=False, allow_blank=True, max_length=30)
    committee = serializers.ChoiceField(
        required=False, choices=[(c, c) for c in MANAGEABLE_COMMITTEES]
    )
    is_active = serializers.BooleanField(required=False)
    temporary_password = serializers.CharField(
        required=False, allow_blank=True, min_length=8, write_only=True
    )
    must_change_password = serializers.BooleanField(required=False)

    def validate_email(self, value):
        return (value or "").strip().lower()

    def validate_temporary_password(self, value):
        if not value:
            return ""
        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages)) from exc
        return value

    def validate_display_name(self, value):
        return (value or "").strip()

    def validate_phone(self, value):
        return (value or "").strip()


@api_view(["GET", "POST"])
@permission_classes([HasModule("users")])
def staff_directory(request):
    """List or create staff/volunteer accounts. Passwords never returned."""
    if request.method == "GET":
        qs = (
            User.objects.filter(is_staff=True)
            .select_related("staff_profile")
            .order_by("username")
        )
        rows = [_serialize_staff(u) for u in qs]
        return Response({"results": rows, "count": len(rows)})

    ser = StaffCreateSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    data = ser.validated_data

    with transaction.atomic():
        full = data["display_name"]
        first, last = full, ""
        if " " in full:
            first, last = full.split(" ", 1)
        user = User.objects.create_user(
            username=data["username"],
            email=data.get("email") or "",
            password=data["temporary_password"],
            first_name=first[:150],
            last_name=last[:150],
            is_staff=True,
            is_active=data.get("is_active", True),
        )
        StaffProfile.objects.create(
            user=user,
            committee=data["committee"],
            display_name=data["display_name"],
            phone=data.get("phone") or "",
            must_change_password=True,
        )

    return Response(_serialize_staff(user), status=status.HTTP_201_CREATED)


@api_view(["PATCH"])
@permission_classes([HasModule("users")])
def staff_detail(request, pk):
    """Update volunteer/staff: committee, active, phone, reset password."""
    try:
        user = User.objects.select_related("staff_profile").get(pk=pk, is_staff=True)
    except User.DoesNotExist:
        return Response({"detail": "Staff account not found."}, status=status.HTTP_404_NOT_FOUND)

    # Protect last superuser / self-lockouts lightly
    if user.is_superuser and not request.user.is_superuser:
        return Response(
            {"detail": "Only a superuser can modify another superuser."},
            status=status.HTTP_403_FORBIDDEN,
        )

    ser = StaffUpdateSerializer(data=request.data, partial=True)
    ser.is_valid(raise_exception=True)
    data = ser.validated_data

    if "email" in data:
        email = data["email"]
        if email and User.objects.filter(email__iexact=email).exclude(pk=user.pk).exists():
            return Response(
                {"email": "An account with this email already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.email = email

    if "is_active" in data:
        if user.pk == request.user.pk and data["is_active"] is False:
            return Response(
                {"is_active": "You cannot deactivate your own account."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.is_active = data["is_active"]

    temp_pw = data.get("temporary_password") or ""
    if temp_pw:
        user.set_password(temp_pw)

    user.save()

    profile, _ = StaffProfile.objects.get_or_create(
        user=user,
        defaults={"committee": "core", "must_change_password": False},
    )
    update_fields = []
    if "display_name" in data:
        profile.display_name = data["display_name"]
        update_fields.append("display_name")
        # Keep Django name roughly in sync
        full = data["display_name"]
        first, last = full, ""
        if " " in full:
            first, last = full.split(" ", 1)
        user.first_name = first[:150]
        user.last_name = last[:150]
        user.save(update_fields=["first_name", "last_name"])
    if "phone" in data:
        profile.phone = data["phone"]
        update_fields.append("phone")
    if "committee" in data:
        profile.committee = data["committee"]
        update_fields.append("committee")
    if temp_pw or data.get("must_change_password") is True:
        profile.must_change_password = True
        update_fields.append("must_change_password")
    elif data.get("must_change_password") is False:
        profile.must_change_password = False
        update_fields.append("must_change_password")
    if update_fields:
        profile.save(update_fields=list(dict.fromkeys(update_fields)))

    user.refresh_from_db()
    return Response(_serialize_staff(user))

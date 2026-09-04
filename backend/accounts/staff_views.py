"""Core/Admin staff & volunteer account management (JWT + StaffProfile)."""

import csv
import hashlib
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.db.models import Q
from django.http import HttpResponse
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


# ---------------------------------------------------------------------------
# Participant / Regular User Directory
# ---------------------------------------------------------------------------

def _serialize_participant(user):
    """Return a safe dict for a regular (non-staff) user."""
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email or "",
        "full_name": user.get_full_name() or user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "is_active": user.is_active,
        "date_joined": user.date_joined,
        "last_login": user.last_login,
    }


@api_view(["GET", "POST"])
@permission_classes([HasModule("users")])
def participant_user_list(request):
    """List or create regular (non-staff) participants.

    GET query params:
      - q         : search by name / email / username (case-insensitive)
      - page      : page number (default 1)
      - page_size : results per page (default 50, max 200)
      - export    : if 'csv', streams a CSV download

    POST body (JSON):
      - full_name         : str (required)
      - username          : str (required, unique)
      - email             : str (optional but recommended)
      - password          : str (required, min 8 chars)
      - password_confirm  : str (required, must match)
      - is_active         : bool (default True)
    """
    if request.method == "POST":
        data = request.data
        full_name = (data.get("full_name") or "").strip()
        username = (data.get("username") or "").strip()
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""
        password_confirm = data.get("password_confirm") or ""
        is_active = bool(data.get("is_active", True))

        errors = {}

        if not full_name:
            errors["full_name"] = "Full name is required."
        if not username or len(username) < 3:
            errors["username"] = "Username must be at least 3 characters."
        elif User.objects.filter(username__iexact=username).exists():
            errors["username"] = "This username is already taken."

        if email and User.objects.filter(email__iexact=email).exists():
            errors["email"] = "An account with this email already exists."

        if not password or len(password) < 8:
            errors["password"] = "Password must be at least 8 characters."
        elif password != password_confirm:
            errors["password_confirm"] = "Passwords do not match."
        else:
            try:
                from django.contrib.auth.password_validation import validate_password as _vp
                _vp(password)
            except DjangoValidationError as exc:
                errors["password"] = " ".join(exc.messages)

        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        first, last = full_name, ""
        if " " in full_name:
            first, last = full_name.split(" ", 1)

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first[:150],
            last_name=last[:150],
            is_staff=False,
            is_active=is_active,
        )
        return Response(_serialize_participant(user), status=status.HTTP_201_CREATED)

    # ── GET ──
    q = (request.query_params.get("q") or "").strip()
    export = (request.query_params.get("export") or "").lower()

    qs = (
        User.objects.filter(is_staff=False)
        .order_by("-date_joined")
    )

    if q:
        qs = qs.filter(
            Q(username__icontains=q)
            | Q(email__icontains=q)
            | Q(first_name__icontains=q)
            | Q(last_name__icontains=q)
        )

    total = qs.count()

    if export == "csv":
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="macfiesta_participants.csv"'
        writer = csv.writer(response)
        writer.writerow(["ID", "Username", "Full Name", "Email", "Active", "Date Joined", "Last Login"])
        for u in qs.iterator():
            writer.writerow([
                u.id,
                u.username,
                u.get_full_name() or u.username,
                u.email,
                "Yes" if u.is_active else "No",
                u.date_joined.strftime("%Y-%m-%d %H:%M") if u.date_joined else "",
                u.last_login.strftime("%Y-%m-%d %H:%M") if u.last_login else "Never",
            ])
        return response

    try:
        page = max(1, int(request.query_params.get("page", 1)))
        page_size = min(200, max(10, int(request.query_params.get("page_size", 50))))
    except (ValueError, TypeError):
        page = 1
        page_size = 50

    start = (page - 1) * page_size
    rows = [_serialize_participant(u) for u in qs[start: start + page_size]]

    return Response({
        "count": total,
        "page": page,
        "page_size": page_size,
        "num_pages": max(1, (total + page_size - 1) // page_size),
        "results": rows,
    })


@api_view(["GET", "PATCH"])
@permission_classes([HasModule("users")])
def participant_user_detail(request, pk):
    """Retrieve or update a single participant user.

    PATCH body (all optional):
      - is_active  : bool   — activate / deactivate the account
      - password   : str    — reset to a new password (min 8 chars)
      - email      : str    — update email address
      - full_name  : str    — update display name
    """
    try:
        user = User.objects.get(pk=pk, is_staff=False)
    except User.DoesNotExist:
        return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        return Response(_serialize_participant(user))

    data = request.data
    errors = {}

    if "is_active" in data:
        user.is_active = bool(data["is_active"])

    if "email" in data:
        email = (data["email"] or "").strip().lower()
        if email and User.objects.filter(email__iexact=email).exclude(pk=user.pk).exists():
            errors["email"] = "An account with this email already exists."
        else:
            user.email = email

    if "full_name" in data:
        full_name = (data["full_name"] or "").strip()
        first, last = full_name, ""
        if " " in full_name:
            first, last = full_name.split(" ", 1)
        user.first_name = first[:150]
        user.last_name = last[:150]

    if "password" in data:
        password = data["password"] or ""
        if len(password) < 8:
            errors["password"] = "Password must be at least 8 characters."
        else:
            try:
                from django.contrib.auth.password_validation import validate_password as _vp
                _vp(password, user=user)
                user.set_password(password)
            except DjangoValidationError as exc:
                errors["password"] = " ".join(exc.messages)

    if errors:
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)

    user.save()
    user.refresh_from_db()
    return Response(_serialize_participant(user))


# ---------------------------------------------------------------------------
# Danger Zone / Purge All Registered Participant Data
# ---------------------------------------------------------------------------

@api_view(["POST"])
@permission_classes([HasModule("users")])
def purge_registered_users_data(request):
    """Purge all public participant users, event registrations, and accommodation bookings.

    Requires:
      - Admin/Superuser authentication
      - Valid Super Admin password verification in request body
    """
    if not (request.user.is_superuser or request.user.is_staff):
        return Response(
            {"detail": "Only authorized administrators can perform this operation."},
            status=status.HTTP_403_FORBIDDEN,
        )

    password = (
        request.data.get("password")
        or request.data.get("admin_password")
        or request.data.get("superadmin_password")
        or request.headers.get("X-Superadmin-Password")
        or request.headers.get("X-Admin-Password")
        or request.query_params.get("password")
        or ""
    )
    raw_password = request.data.get("raw_password") or ""
    if not password and not raw_password:
        return Response(
            {"detail": "Super Admin password is required to confirm this operation."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    superusers = User.objects.filter(is_superuser=True, is_active=True)
    verified = False
    for pw in [password, raw_password]:
        if not pw:
            continue
        if superusers.exists():
            for su in superusers:
                if su.check_password(pw):
                    verified = True
                    break
                try:
                    if su.check_password(hashlib.sha256(pw.encode("utf-8")).hexdigest()):
                        verified = True
                        break
                except Exception:
                    pass
            if verified:
                break
        else:
            if request.user.check_password(pw):
                verified = True
                break

    if not verified:
        return Response(
            {"detail": "Incorrect Super Admin password. Verification failed."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    from registrations.models import Registration, TeamMember
    from accommodation.models import AccommodationBooking
    from results.models import Result
    from events.models import Event
    from accounts.models import AuditLog

    with transaction.atomic():
        # 1. Target non-staff, non-superuser participant accounts
        participants_qs = User.objects.filter(is_staff=False, is_superuser=False)
        participants_count = participants_qs.count()

        # 2. Registrations & Team members
        reg_count = Registration.objects.count()
        team_count = TeamMember.objects.count()
        Registration.objects.all().delete()
        TeamMember.objects.all().delete()

        # 3. Accommodation bookings
        booking_count = AccommodationBooking.objects.count()
        AccommodationBooking.objects.all().delete()

        # 4. Results & Published statuses
        results_count = Result.objects.count()
        Result.objects.all().delete()
        Event.objects.filter(is_result_published=True).update(is_result_published=False)

        # 5. Delete participant users
        participants_qs.delete()

        # 6. Record in Audit Log
        AuditLog.objects.create(
            user=request.user,
            action="DANGER_PURGE_DATA",
            module="system",
            ip_address=request.META.get("REMOTE_ADDR"),
            details=f"Purged {participants_count} participants, {reg_count} registrations, {booking_count} bookings, and {results_count} results.",
        )

    return Response({
        "success": True,
        "message": "All registered participant records, bookings, and event results have been completely purged.",
        "deleted": {
            "participants": participants_count,
            "registrations": reg_count,
            "team_members": team_count,
            "bookings": booking_count,
            "results": results_count,
        },
    }, status=status.HTTP_200_OK)


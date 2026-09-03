import uuid
from decimal import Decimal
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework import mixins, permissions, serializers, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User

from accounts.drf import HasModule, HasStaffModule
from events.models import Event
from results.models import Result
from .models import Registration, TeamMember
from .serializers import (
    RegistrationSerializer,
    AdminRegistrationSerializer,
    TeamMemberSerializer,
)
from .services import cancel_registration, promote_next_waitlisted, send_registration_email
from .exports import build_registrations_csv_response
from .payment import can_manage_payments, entry_qr_status, payment_is_cleared


def _apply_payment_proof(registration, *, user, txn, proof, payment_method="upi_qr"):
    """Validate and apply payment proof to one registration (does not sync batch)."""
    if registration.user_id != user.id:
        raise serializers.ValidationError({"detail": "Not allowed."})
    if registration.cancelled_at or registration.approval_status == "cancelled":
        raise serializers.ValidationError({"detail": "Registration is cancelled."})
    if registration.payment_status == "paid":
        raise serializers.ValidationError({"detail": "Payment already verified."})
    if registration.payment_status == "waived" or (
        registration.payment_amount is not None and registration.payment_amount <= 0
    ):
        raise serializers.ValidationError({"detail": "No payment required for this registration."})

    txn = (txn or "").strip()
    if not txn:
        raise serializers.ValidationError(
            {"payment_transaction_id": "Transaction / reference ID is required."}
        )
    if not proof and not registration.payment_proof:
        raise serializers.ValidationError(
            {"payment_proof": "Upload a screenshot of the successful payment."}
        )

    # Same batch may share one txn; block only other batches / solo regs
    qs = Registration.objects.filter(payment_transaction_id__iexact=txn).exclude(pk=registration.pk)
    qs = qs.exclude(approval_status="cancelled").exclude(cancelled_at__isnull=False)
    if registration.payment_batch_id:
        qs = qs.exclude(payment_batch_id=registration.payment_batch_id)
    if qs.exists():
        raise serializers.ValidationError(
            {"payment_transaction_id": "This transaction ID has already been submitted."}
        )

    if proof:
        from django.core.exceptions import ValidationError as DjangoValidationError
        from config.validators import validate_uploaded_image

        try:
            validate_uploaded_image(proof)
        except DjangoValidationError as exc:
            msg = exc.messages[0] if getattr(exc, "messages", None) else "Invalid image file."
            raise serializers.ValidationError({"payment_proof": msg}) from exc

    registration.payment_transaction_id = txn[:80]
    registration.payment_method = (payment_method or "upi_qr").strip()[:40]
    if proof:
        registration.payment_proof = proof
    registration.payment_status = "pending"
    registration.payment_rejection_reason = ""
    registration.payment_verified_at = None
    registration.payment_verified_by = None
    registration.save(
        update_fields=[
            "payment_transaction_id",
            "payment_method",
            "payment_proof",
            "payment_status",
            "payment_rejection_reason",
            "payment_verified_at",
            "payment_verified_by",
        ]
    )
    return registration


def _sync_batch_payment(primary):
    if not primary.payment_batch_id:
        return
    siblings = (
        Registration.objects.filter(
            user_id=primary.user_id,
            payment_batch_id=primary.payment_batch_id,
            cancelled_at__isnull=True,
        )
        .exclude(pk=primary.pk)
        .exclude(payment_status="paid")
        .exclude(payment_status="waived")
    )
    for sib in siblings:
        sib.payment_transaction_id = primary.payment_transaction_id
        sib.payment_method = primary.payment_method
        if primary.payment_proof:
            sib.payment_proof = primary.payment_proof
        sib.payment_status = "pending"
        sib.payment_rejection_reason = ""
        sib.payment_verified_at = None
        sib.payment_verified_by = None
        sib.save(
            update_fields=[
                "payment_transaction_id",
                "payment_method",
                "payment_proof",
                "payment_status",
                "payment_rejection_reason",
                "payment_verified_at",
                "payment_verified_by",
            ]
        )


class RegistrationViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Registrations where user is the Captain OR an accepted Team Member
        qs = Registration.objects.filter(
            Q(user=user) | Q(team_members__user=user, team_members__invitation_status="accepted")
        ).distinct().select_related("event")
        if self.request.query_params.get("include_cancelled") != "1":
            qs = qs.filter(cancelled_at__isnull=True)
        return qs.prefetch_related("team_members")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        registration = self.get_object()
        if registration.user_id != request.user.id:
            return Response({"detail": "Only the team captain or registrant can cancel this."}, status=status.HTTP_403_FORBIDDEN)
        try:
            cancel_registration(registration, by_user=request.user)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(RegistrationSerializer(registration, context={"request": request}).data)

    @action(detail=True, methods=["post"], url_path="submit-payment")
    def submit_payment(self, request, pk=None):
        registration = self.get_object()
        try:
            _apply_payment_proof(
                registration,
                user=request.user,
                txn=request.data.get("payment_transaction_id"),
                proof=request.FILES.get("payment_proof"),
                payment_method=request.data.get("payment_method") or "upi_qr",
            )
        except serializers.ValidationError as exc:
            return Response(exc.detail, status=status.HTTP_400_BAD_REQUEST)
        _sync_batch_payment(registration)
        return Response(RegistrationSerializer(registration, context={"request": request}).data)

    @action(detail=False, methods=["post"], url_path="batch")
    def batch_create(self, request):
        from .batch import create_registration_batch

        event_ids = request.data.get("events") or request.data.get("event_ids") or []
        if isinstance(event_ids, str):
            event_ids = [x.strip() for x in event_ids.split(",") if x.strip()]
        if not isinstance(event_ids, list):
            return Response({"events": "Provide a list of event ids."}, status=status.HTTP_400_BAD_REQUEST)

        profile = {
            "registration_type": request.data.get("registration_type") or "individual",
            "team_name": request.data.get("team_name") or "",
            "participant_name": request.data.get("participant_name") or "",
            "college_name": request.data.get("college_name") or "",
            "department": request.data.get("department") or "",
            "register_number": request.data.get("register_number") or "",
            "email": request.data.get("email") or "",
            "phone": request.data.get("phone") or "",
            "food_preference": request.data.get("food_preference") or "none",
            "food_notes": request.data.get("food_notes") or "",
            "needs_accommodation": bool(request.data.get("needs_accommodation")),
            "accommodation_count": request.data.get("accommodation_count"),
            "accommodation_notes": request.data.get("accommodation_notes") or "",
            "needs_transport": False,
            "transport_note": "",
        }
        members_by_event = request.data.get("team_members_by_event") or {}

        try:
            result = create_registration_batch(
                user=request.user,
                event_ids=event_ids,
                profile=profile,
                members_by_event=members_by_event,
            )
        except serializers.ValidationError as exc:
            return Response(exc.detail, status=status.HTTP_400_BAD_REQUEST)

        regs = RegistrationSerializer(result["registrations"], many=True, context={"request": request}).data
        return Response(
            {
                "payment_batch_id": result["payment_batch_id"],
                "payment_reference": result["payment_reference"],
                "payment_amount_total": str(result["payment_amount_total"]),
                "event_fee_total": str(result.get("event_fee_total", "0.00")),
                "accommodation_fee_total": str(result.get("accommodation_fee_total", "0.00")),
                "food_fee_total": str(result.get("food_fee_total", "0.00")),
                "hospitality_total": str(result.get("hospitality_total", "0.00")),
                "registrations": regs,
            },
            status=status.HTTP_201_CREATED,
        )

    # ──────────────────────────────────────────────────────────────────────────
    # TEAM REGISTRATION & CAPTAIN MANAGEMENT WORKFLOW
    # ──────────────────────────────────────────────────────────────────────────

    @action(detail=False, methods=["post"], url_path="team/create")
    def create_team(self, request):
        """
        Step 1: Create a new Team Registration.
        Logged-in user is automatically & immutably assigned as Captain.
        """
        event_id = request.data.get("event_id") or request.data.get("event")
        if not event_id:
            return Response({"event_id": "Event ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            event = Event.objects.get(pk=event_id)
        except Event.DoesNotExist:
            return Response({"event_id": "Event not found."}, status=status.HTTP_404_NOT_FOUND)

        if not event.is_registration_open:
            return Response({"detail": f"Registration is closed for {event.title}."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if already registered
        if Registration.objects.filter(user=request.user, event=event, cancelled_at__isnull=True).exists():
            return Response({"detail": f"You are already registered for {event.title}."}, status=status.HTTP_400_BAD_REQUEST)

        team_name = (request.data.get("team_name") or "").strip()
        if not team_name:
            return Response({"team_name": "Team name is required."}, status=status.HTTP_400_BAD_REQUEST)

        college_name = (request.data.get("college_name") or "").strip()
        if not college_name:
            return Response({"college_name": "College / institution name is required."}, status=status.HTTP_400_BAD_REQUEST)

        phone = (request.data.get("phone") or "").strip()
        department = (request.data.get("department") or "").strip()
        register_number = (request.data.get("register_number") or "").strip()
        participant_name = (request.user.get_full_name() or "").strip() or request.user.username

        reg = Registration.objects.create(
            user=request.user,
            event=event,
            registration_type="team",
            team_name=team_name,
            participant_name=participant_name,
            college_name=college_name,
            department=department,
            register_number=register_number,
            email=request.user.email,
            phone=phone or getattr(getattr(request.user, 'profile', None), 'phone', ''),
            payment_status="waived" if Decimal(event.registration_fee or 0) <= 0 else "pending",
            payment_amount=Decimal(event.registration_fee or 0),
        )

        return Response(RegistrationSerializer(reg, context={"request": request}).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="team/invite")
    def invite_member(self, request, pk=None):
        """Captain invites a new team member by email or search query."""
        registration = self.get_object()
        if registration.user_id != request.user.id and not request.user.is_staff:
            return Response({"detail": "Only the Captain can invite members."}, status=status.HTTP_403_FORBIDDEN)

        max_size = registration.event.max_team_size or 4
        current_members_count = 1 + registration.team_members.exclude(invitation_status="declined").count()
        if current_members_count >= max_size:
            return Response({"detail": f"Team is already at maximum capacity ({max_size} members)."}, status=status.HTTP_400_BAD_REQUEST)

        name = (request.data.get("name") or "").strip()
        email = (request.data.get("email") or "").strip().lower()
        phone = (request.data.get("phone") or "").strip()
        college = (request.data.get("college_name") or registration.college_name).strip()
        department = (request.data.get("department") or "").strip()
        reg_no = (request.data.get("register_number") or "").strip()
        gender = (request.data.get("gender") or "unspecified").strip()

        if not name:
            return Response({"name": "Member name is required."}, status=status.HTTP_400_BAD_REQUEST)
        if not email:
            return Response({"email": "Member email is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Look up if user already exists
        target_user = User.objects.filter(email__iexact=email).first()

        # Check if already invited in this team
        if registration.team_members.filter(email__iexact=email).exclude(invitation_status="declined").exists():
            return Response({"email": "This member is already in the team or has a pending invite."}, status=status.HTTP_400_BAD_REQUEST)

        member = TeamMember.objects.create(
            registration=registration,
            user=target_user,
            role="member",
            name=name,
            email=email,
            phone=phone,
            college_name=college,
            department=department,
            register_number=reg_no,
            gender=gender,
            invitation_status="pending",
            payment_status=registration.payment_status if registration.payment_status in ("paid", "waived") else "pending",
            payment_amount=Decimal(registration.event.registration_fee or 0),
        )

        return Response(RegistrationSerializer(registration, context={"request": request}).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="team/remove-member")
    def remove_member(self, request, pk=None):
        """Captain or Admin removes an unverified/invited member."""
        registration = self.get_object()
        if registration.user_id != request.user.id and not request.user.is_staff:
            return Response({"detail": "Only the Captain or Staff can remove members."}, status=status.HTTP_403_FORBIDDEN)

        member_id = request.data.get("member_id")
        if not member_id:
            return Response({"member_id": "Member ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        member = registration.team_members.filter(pk=member_id).first()
        if not member:
            return Response({"detail": "Member not found in this team."}, status=status.HTTP_404_NOT_FOUND)

        if member.role == "captain":
            return Response({"detail": "Captain cannot be removed from the team."}, status=status.HTTP_400_BAD_REQUEST)

        member.delete()
        return Response(RegistrationSerializer(registration, context={"request": request}).data)

    @action(detail=True, methods=["post"], url_path="team/member-payment")
    def submit_member_payment(self, request, pk=None):
        """Submit payment proof for an individual team member."""
        registration = self.get_object()
        member_id = request.data.get("member_id")
        member = registration.team_members.filter(pk=member_id).first()
        if not member:
            return Response({"detail": "Team member not found."}, status=status.HTTP_404_NOT_FOUND)

        # Only the team captain (registration owner) or staff can submit payment
        if registration.user_id != request.user.id and not request.user.is_staff:
            return Response({"detail": "Only the Team Captain has permission to submit payment for the team."}, status=status.HTTP_403_FORBIDDEN)

        txn = (request.data.get("payment_transaction_id") or "").strip()
        proof = request.FILES.get("payment_proof")
        method = (request.data.get("payment_method") or "upi_qr").strip()

        if not txn:
            return Response({"payment_transaction_id": "Transaction ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        member.payment_transaction_id = txn
        member.payment_method = method
        if proof:
            member.payment_proof = proof
        member.payment_status = "pending"
        member.finance_status = "pending"
        member.save()

        return Response(RegistrationSerializer(registration, context={"request": request}).data)

    @action(detail=False, methods=["get"], url_path="invitations/my")
    def my_invitations(self, request):
        """List pending invitations for the logged-in user."""
        email = request.user.email.strip().lower()
        invites = TeamMember.objects.filter(
            Q(user=request.user) | Q(email__iexact=email),
            invitation_status="pending",
            registration__cancelled_at__isnull=True,
        ).select_related("registration", "registration__event")

        data = []
        for inv in invites:
            data.append({
                "invitation_id": inv.id,
                "team_name": inv.registration.team_name,
                "captain_name": inv.registration.participant_name,
                "captain_email": inv.registration.email,
                "event_title": inv.registration.event.title,
                "event_date": inv.registration.event.event_date,
                "venue": inv.registration.event.venue,
                "invited_at": inv.invited_at,
            })
        return Response(data)

    @action(detail=False, methods=["post"], url_path="invitations/respond")
    def respond_invitation(self, request):
        """Accept or decline a team invitation."""
        invitation_id = request.data.get("invitation_id")
        action_type = request.data.get("action")  # "accept" or "decline"

        if not invitation_id or action_type not in ("accept", "decline"):
            return Response({"detail": "Provide invitation_id and action ('accept' or 'decline')."}, status=status.HTTP_400_BAD_REQUEST)

        email = request.user.email.strip().lower()
        member = TeamMember.objects.filter(
            pk=invitation_id,
            invitation_status="pending",
        ).filter(Q(user=request.user) | Q(email__iexact=email)).first()

        if not member:
            return Response({"detail": "Invitation not found or already processed."}, status=status.HTTP_404_NOT_FOUND)

        if action_type == "accept":
            member.invitation_status = "accepted"
            member.user = request.user
            member.accepted_at = timezone.now()
            member.save()
            return Response({"detail": "Invitation accepted successfully!"})
        else:
            member.invitation_status = "declined"
            member.save()
            return Response({"detail": "Invitation declined."})

    @action(detail=False, methods=["get"], url_path="students/search")
    def search_students(self, request):
        """Student database search is disabled for privacy. Captains invite members directly via name/email or shareable link."""
        return Response([])



class AdminRegistrationListView(ListAPIView):
    serializer_class = AdminRegistrationSerializer
    permission_classes = [HasStaffModule]
    required_module = "registrations"

    def get_queryset(self):
        return (
            Registration.objects.select_related("event", "user", "verified_by", "payment_verified_by")
            .prefetch_related("team_members", "team_members__user")
            .order_by("-registered_at")
        )


class AdminRegistrationDetailView(RetrieveUpdateAPIView):
    serializer_class = AdminRegistrationSerializer
    permission_classes = [HasStaffModule]
    required_module = "registrations"
    queryset = Registration.objects.select_related("event", "user", "verified_by").prefetch_related(
        "team_members"
    )


@api_view(["POST"])
@permission_classes([HasModule("payments")])
def admin_verify_member_finance(request, member_id):
    """Finance desk verifies or rejects a single team member's payment."""
    member = TeamMember.objects.filter(pk=member_id).first()
    if not member:
        return Response({"detail": "Team member not found."}, status=status.HTTP_404_NOT_FOUND)

    action_type = request.data.get("status")  # "verified" or "rejected"
    if action_type not in ("verified", "rejected"):
        return Response({"detail": "Status must be 'verified' or 'rejected'."}, status=status.HTTP_400_BAD_REQUEST)

    if action_type == "verified":
        member.finance_status = "verified"
        member.payment_status = "paid"
        member.payment_verified_at = timezone.now()
        member.payment_verified_by = request.user
        member.payment_rejection_reason = ""
    else:
        member.finance_status = "rejected"
        member.payment_status = "rejected"
        member.payment_rejection_reason = request.data.get("reason") or "Payment rejected by Finance."

    member.save()
    return Response(TeamMemberSerializer(member, context={"request": request}).data)


@api_view(["POST"])
@permission_classes([HasModule("registrations")])
def admin_verify_member_organizer(request, member_id):
    """Organizer verifies or rejects a single team member."""
    member = TeamMember.objects.filter(pk=member_id).first()
    if not member:
        return Response({"detail": "Team member not found."}, status=status.HTTP_404_NOT_FOUND)

    action_type = request.data.get("status")  # "verified" or "rejected"
    if action_type not in ("verified", "rejected"):
        return Response({"detail": "Status must be 'verified' or 'rejected'."}, status=status.HTTP_400_BAD_REQUEST)

    member.organizer_status = action_type
    member.organizer_verified_at = timezone.now()
    member.organizer_verified_by = request.user
    member.save()
    return Response(TeamMemberSerializer(member, context={"request": request}).data)


@api_view(["POST"])
@permission_classes([HasModule("registrations")])
def admin_promote_waitlist(request, event_id):
    try:
        event = Event.objects.get(pk=event_id)
    except Event.DoesNotExist:
        return Response({"detail": "Event not found."}, status=status.HTTP_404_NOT_FOUND)
    promoted = promote_next_waitlisted(event)
    if not promoted:
        return Response({"detail": "No waitlisted participant to promote or event is full."})
    return Response(AdminRegistrationSerializer(promoted).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_pass(request, pk):
    """Digital participant pass / ID for a registration or team member (Available only upon approved verification)."""
    user = request.user
    base_qs = (
        Registration.objects.select_related("event")
        .prefetch_related("team_members")
        .filter(pk=pk, cancelled_at__isnull=True)
    )
    if user.is_staff or user.is_superuser:
        reg = base_qs.first()
    else:
        reg = base_qs.filter(
            Q(user=user) | Q(team_members__user=user, team_members__invitation_status="accepted")
        ).first()

    if not reg:
        return Response({"detail": "Pass not found or unauthorized."}, status=status.HTTP_404_NOT_FOUND)

    # Enforce Approved Verification requirement:
    # 1. Approval status must be 'approved'
    # 2. Payment status must be 'paid' or 'waived' (or free event)
    is_free = (reg.payment_amount is not None and reg.payment_amount <= 0) or (Decimal(reg.event.registration_fee or 0) <= 0)
    is_paid_or_waived = reg.payment_status in ("paid", "waived") or is_free

    if reg.approval_status != "approved" or not is_paid_or_waived:
        return Response(
            {
                "detail": "Pass is available only after official verification & approval. Your payment/registration is currently under review.",
                "approval_status": reg.approval_status,
                "payment_status": reg.payment_status,
                "is_approved": False,
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    return Response(RegistrationSerializer(reg, context={"request": request}).data)



@api_view(["GET"])
@permission_classes([AllowAny])
def certificate_data(request, result_id):
    try:
        result = Result.objects.select_related("event").get(
            pk=result_id, event__is_result_published=True
        )
    except Result.DoesNotExist:
        return Response({"detail": "Certificate not available."}, status=status.HTTP_404_NOT_FOUND)
    return Response(
        {
            "id": result.id,
            "participant_name": result.participant_name,
            "college_name": result.college_name,
            "position": result.position,
            "remarks": result.remarks,
            "event_title": result.event.title,
            "event_date": result.event.event_date,
            "fest_name": "MacFiesta",
            "issued_at": timezone.localdate().isoformat(),
        }
    )


@api_view(["GET"])
@permission_classes([HasModule("reports")])
def attendance_report(request):
    rows = (
        Registration.objects.filter(cancelled_at__isnull=True)
        .select_related("event", "user", "verified_by")
        .prefetch_related("team_members")
        .order_by("event__title", "participant_name")
    )
    event_id = request.query_params.get("event")
    if event_id:
        rows = rows.filter(event_id=event_id)
    data = [
        {
            "registration_number": r.registration_number,
            "participant_name": r.participant_name,
            "team_name": r.team_name,
            "college_name": r.college_name,
            "event": r.event.title,
            "payment_status": r.payment_status,
            "attendance_marked": r.attendance_marked,
            "verification_attendance_marked": r.verification_attendance_marked,
            "event_attendance_marked": r.event_attendance_marked,
            "verified_at": r.verified_at,
            "verified_by": r.verified_by.username if r.verified_by else None,
            "event_attended_at": r.event_attended_at,
            "event_attended_by": r.event_attended_by.username if r.event_attended_by else None,
            "food_preference": r.food_preference,
            "food_notes": r.food_notes,
            "needs_accommodation": r.needs_accommodation,
            "accommodation_count": r.accommodation_count,
            "accommodation_notes": r.accommodation_notes,
            "needs_transport": r.needs_transport,
            "transport_note": r.transport_note,
        }
        for r in rows
    ]
    if request.query_params.get("export") == "csv" or request.query_params.get("format") == "csv":
        return build_registrations_csv_response(request.query_params)
    return Response({"count": len(data), "results": data})


@api_view(["GET"])
@permission_classes([HasModule("reports")])
def export_registrations_csv(request):
    return build_registrations_csv_response(request.query_params)


@api_view(["GET"])
@permission_classes([HasModule("verification")])
def verify_lookup(request):
    """Desk verification: accept registration number, pass token, or member QR pass code."""
    from .signing import resolve_registration_lookup

    raw = (request.query_params.get("q") or "").strip()
    if not raw:
        return Response(
            {"detail": "Provide q=registration number or pass token."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Check if this is a Team Member individual QR pass code
    if raw.startswith("TMB-"):
        member = TeamMember.objects.select_related("registration", "registration__event").filter(qr_pass_code__iexact=raw).first()
        if member:
            reg = member.registration
            data = AdminRegistrationSerializer(reg, context={"request": request}).data
            data["verification_target"] = "team_member"
            data["target_member_id"] = member.id
            data["target_member_name"] = member.name
            data["verification_status"] = "VERIFIED" if (member.payment_status in ("paid", "waived") and member.organizer_status != "rejected") else "PENDING"
            return Response(data)

    key = resolve_registration_lookup(raw)
    reg = (
        Registration.objects.select_related("event")
        .prefetch_related("team_members")
        .filter(registration_number__iexact=key)
        .first()
    )
    if not reg:
        return Response(
            {"detail": "INVALID", "verification_status": "INVALID"},
            status=status.HTTP_404_NOT_FOUND,
        )

    if reg.cancelled_at or reg.approval_status in ("cancelled", "rejected"):
        state = "CANCELLED" if reg.approval_status != "rejected" else "INVALID"
    else:
        state = entry_qr_status(reg)

    data = AdminRegistrationSerializer(reg, context={"request": request}).data
    data["verification_status"] = state
    return Response(data)


@api_view(["POST"])
@permission_classes([HasModule("verification")])
def verify_check_in(request):
    """Mark attendance from the verification desk for a registration or team member."""
    reg_id = request.data.get("id")
    member_id = request.data.get("member_id")
    reg_number = (request.data.get("registration_number") or request.data.get("token") or "").strip()

    if member_id:
        member = TeamMember.objects.select_related("registration", "registration__event").filter(pk=member_id).first()
        if not member:
            return Response({"detail": "Team member not found."}, status=status.HTTP_404_NOT_FOUND)
        member.verification_attendance_marked = True
        member.attendance_marked = True
        member.save(update_fields=["verification_attendance_marked", "attendance_marked"])
        data = AdminRegistrationSerializer(member.registration, context={"request": request}).data
        data["verification_status"] = "VERIFIED"
        return Response(data)

    if not reg_id and not reg_number:
        return Response(
            {"detail": "Provide registration id or registration_number."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if reg_number:
        from .signing import resolve_registration_lookup
        reg_number = resolve_registration_lookup(reg_number)

    qs = Registration.objects.select_related("event").prefetch_related("team_members")
    reg = qs.filter(pk=reg_id).first() if reg_id else qs.filter(registration_number__iexact=reg_number).first()
    if not reg:
        return Response({"detail": "Registration not found."}, status=status.HTTP_404_NOT_FOUND)
    if reg.cancelled_at or reg.approval_status in ("cancelled", "rejected"):
        return Response({"detail": "Cannot check in a cancelled registration."}, status=status.HTTP_400_BAD_REQUEST)
    if not payment_is_cleared(reg):
        return Response(
            {
                "detail": "Payment not verified. Entry QR is PENDING until Finance verifies payment.",
                "verification_status": "PENDING",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not reg.verification_attendance_marked or not reg.attendance_marked:
        reg.verification_attendance_marked = True
        reg.attendance_marked = True
        if not reg.verified_at:
            reg.verified_at = timezone.now()
        reg.verified_by = request.user
        reg.save(update_fields=["verification_attendance_marked", "attendance_marked", "verified_at", "verified_by"])

    data = AdminRegistrationSerializer(reg, context={"request": request}).data
    data["verification_status"] = entry_qr_status(reg)
    return Response(data)


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def public_institutions(request):
    from .institutions import ensure_institution, list_institutions, normalize_institution_name

    if request.method == "GET":
        return Response({"institutions": list_institutions()})

    name = normalize_institution_name(request.data.get("name") or "")
    if len(name) < 2:
        return Response(
            {"name": ["Enter a valid college or school name."]},
            status=status.HTTP_400_BAD_REQUEST,
        )
    saved = ensure_institution(name)
    return Response({"name": saved}, status=status.HTTP_201_CREATED)

from django.utils import timezone
from rest_framework import mixins, permissions, serializers, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from accounts.drf import HasModule, HasStaffModule
from results.models import Result
from .models import Registration
from .serializers import RegistrationSerializer, AdminRegistrationSerializer
from .services import cancel_registration, promote_next_waitlisted
from .exports import build_registrations_csv_response


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
        qs = Registration.objects.filter(user=self.request.user).select_related("event")
        if self.request.query_params.get("include_cancelled") != "1":
            qs = qs.filter(cancelled_at__isnull=True)
        return qs.prefetch_related("team_members")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        registration = self.get_object()
        if registration.user_id != request.user.id:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
        try:
            cancel_registration(registration, by_user=request.user)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(RegistrationSerializer(registration, context={"request": request}).data)

    @action(detail=True, methods=["post"], url_path="submit-payment")
    def submit_payment(self, request, pk=None):
        """
        Student uploads payment screenshot + transaction/reference ID.
        Does not change payment_status to paid — Finance must verify.
        """
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
        """
        Register for multiple events in one checkout.
        Hospitality add-ons are charged once (on the first event).
        Returns payment_batch_id + payment_reference for UPI note / auto txn field.
        """
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
            "email": request.data.get("email") or "",
            "phone": request.data.get("phone") or "",
            "food_preference": request.data.get("food_preference") or "none",
            "food_notes": request.data.get("food_notes") or "",
            "needs_accommodation": bool(request.data.get("needs_accommodation")),
            "accommodation_count": request.data.get("accommodation_count"),
            "accommodation_notes": request.data.get("accommodation_notes") or "",
            # MacFiesta does not offer transport assist.
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
                "registrations": regs,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["post"], url_path="submit-payment-batch")
    def submit_payment_batch(self, request):
        """Apply one UPI proof + transaction id to every registration in a payment batch."""
        batch_id = (request.data.get("payment_batch_id") or "").strip()
        if not batch_id:
            return Response({"payment_batch_id": "Batch id is required."}, status=status.HTTP_400_BAD_REQUEST)

        qs = Registration.objects.filter(
            user=request.user,
            payment_batch_id=batch_id,
            cancelled_at__isnull=True,
        ).select_related("event")
        primary = qs.order_by("id").first()
        if not primary:
            return Response({"detail": "Payment batch not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            _apply_payment_proof(
                primary,
                user=request.user,
                txn=request.data.get("payment_transaction_id"),
                proof=request.FILES.get("payment_proof"),
                payment_method=request.data.get("payment_method") or "upi_qr",
            )
        except serializers.ValidationError as exc:
            return Response(exc.detail, status=status.HTTP_400_BAD_REQUEST)
        _sync_batch_payment(primary)
        regs = RegistrationSerializer(qs.order_by("id"), many=True, context={"request": request}).data
        return Response(
            {
                "payment_batch_id": batch_id,
                "payment_reference": primary.payment_reference,
                "registrations": regs,
            }
        )


class AdminRegistrationListView(ListAPIView):
    serializer_class = AdminRegistrationSerializer
    permission_classes = [HasStaffModule]
    required_module = "registrations"

    def get_queryset(self):
        return (
            Registration.objects.select_related("event", "user", "verified_by", "payment_verified_by")
            .prefetch_related("team_members")
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
@permission_classes([HasModule("registrations")])
def admin_promote_waitlist(request, event_id):
    from events.models import Event

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
    """Digital participant pass / ID for a registration."""
    try:
        reg = (
            Registration.objects.select_related("event")
            .prefetch_related("team_members")
            .get(pk=pk, user=request.user, cancelled_at__isnull=True)
        )
    except Registration.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
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
        .order_by("event__title", "participant_name")
    )
    event_id = request.query_params.get("event")
    if event_id:
        rows = rows.filter(event_id=event_id)
    data = [
        {
            "registration_number": r.registration_number,
            "participant_name": r.participant_name,
            "college_name": r.college_name,
            "event": r.event.title,
            "payment_status": r.payment_status,
            "attendance_marked": r.attendance_marked,
            "verified_at": r.verified_at,
            "verified_by": r.verified_by.username if r.verified_by else None,
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
    """
    CSV export of active registrations for committee reports.
    Adapted from legacy ExportRegistrationsExcelView — CSV only, no Razorpay/receipt files.
    Query params: event, payment, attendance, waitlist
    Prefer ?export=csv on attendance (DRF reserves ?format=).
    """
    return build_registrations_csv_response(request.query_params)


@api_view(["GET"])
@permission_classes([HasModule("verification")])
def verify_lookup(request):
    """Desk verification: accept plain registration number or signed QR pass token."""
    from .signing import resolve_registration_lookup

    raw = (request.query_params.get("q") or "").strip()
    if not raw:
        return Response(
            {"detail": "Provide q=registration number or pass token."},
            status=status.HTTP_400_BAD_REQUEST,
        )

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
        from .payment import entry_qr_status

        state = entry_qr_status(reg)

    data = AdminRegistrationSerializer(reg, context={"request": request}).data
    data["verification_status"] = state
    return Response(data)


@api_view(["POST"])
@permission_classes([HasModule("verification")])
def verify_check_in(request):
    """Mark attendance from the verification desk after a successful lookup."""
    from .payment import entry_qr_status, payment_is_cleared

    reg_id = request.data.get("id")
    reg_number = (request.data.get("registration_number") or "").strip()
    if not reg_id and not reg_number:
        return Response(
            {"detail": "Provide registration id or registration_number."},
            status=status.HTTP_400_BAD_REQUEST,
        )

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

    if not reg.attendance_marked:
        reg.attendance_marked = True
        reg.verified_at = timezone.now()
        reg.verified_by = request.user
        reg.save(update_fields=["attendance_marked", "verified_at", "verified_by"])

    data = AdminRegistrationSerializer(reg, context={"request": request}).data
    data["verification_status"] = entry_qr_status(reg)
    return Response(data)


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def public_institutions(request):
    """
    College/school list for registration pickers.
    GET: seed + DB customs + names already used on registrations.
    POST: add a custom name from Others so later students can select it.
    """
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

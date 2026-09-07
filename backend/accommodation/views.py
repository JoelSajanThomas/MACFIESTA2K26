from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response

from accounts.drf import HasModule
from accounts.models import AuditLog
from config.mail_utils import send_mail_async
from registrations.payment import can_manage_payments
from .models import Hostel, AccommodationBooking
from .serializers import (
    HostelSerializer,
    AccommodationBookingSerializer,
    AdminAccommodationBookingSerializer,
)

User = get_user_model()


def _finance_staff_emails():
    qs = User.objects.filter(is_active=True).filter(
        Q(is_superuser=True) | Q(staff_profile__committee__in=["finance", "core"])
    )
    return list({u.email.strip() for u in qs if u.email})


def _notify_finance_of_hostel_payment(booking):
    recipients = _finance_staff_emails()
    if not recipients:
        return
    subject = f"MacFiesta hostel payment {booking.booking_id} — pending verification"
    message = (
        f"A hostel stay payment is waiting for finance verification.\n\n"
        f"Reference: {booking.booking_id}\n"
        f"Name: {booking.full_name}\n"
        f"College: {booking.college}\n"
        f"Hostel: {booking.hostel.name if booking.hostel else '—'}\n"
        f"Amount: ₹{booking.payment_amount}\n"
        f"UTR: {booking.payment_transaction_id or '—'}\n\n"
        f"Open Admin → Payments to verify or reject this hostel payment.\n"
    )
    send_mail_async(
        subject=subject,
        message=message,
        recipient_list=recipients,
        context_id=f"acc_pay_{booking.id}",
    )


def _hospitality_staff_emails():
    qs = User.objects.filter(is_active=True).filter(
        Q(staff_profile__committee__in=["hospitality", "food"])
    )
    return list({u.email.strip() for u in qs if u.email})


def _notify_hospitality_of_request(booking):
    recipients = _hospitality_staff_emails()
    if not recipients:
        return
    subject = f"MacFiesta hostel booking {booking.booking_id} — mark allocation"
    message = (
        f"A student booked a hostel stay.\n\n"
        f"Reference: {booking.booking_id}\n"
        f"Name: {booking.full_name}\n"
        f"College: {booking.college}\n"
        f"Phone: {booking.phone}\n"
        f"Hostel: {booking.hostel.name if booking.hostel else '—'}\n"
        f"Dates: {booking.check_in_date} → {booking.check_out_date}\n"
        f"Persons: {booking.persons_count}\n\n"
        f"Open Hospitality → Stay bookings to allocate a room or mark check-in.\n"
    )
    send_mail_async(
        subject=subject,
        message=message,
        recipient_list=recipients,
        context_id=f"acc_request_{booking.id}",
    )


class HostelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Hostel.objects.filter(is_active=True)
    serializer_class = HostelSerializer
    permission_classes = [permissions.AllowAny]


class AccommodationBookingViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        user = self.request.user
        if user.is_authenticated and (user.is_staff or user.is_superuser):
            return AdminAccommodationBookingSerializer
        return AccommodationBookingSerializer

    def get_permissions(self):
        if self.action in ["update", "partial_update", "destroy", "approve", "reject"]:
            return [HasModule("hospitality")()]
        if self.action in ["verify_payment", "reject_payment"]:
            return [HasModule("finance")()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return AccommodationBooking.objects.none()
        from accounts.permissions import user_has_module
        if user.is_superuser or (
            user.is_staff
            and (
                user_has_module(user, "hospitality")
                or can_manage_payments(user)
            )
        ):
            return AccommodationBooking.objects.all().select_related("hostel", "user")
        return AccommodationBooking.objects.filter(user=user).select_related("hostel", "user")

    def perform_create(self, serializer):
        with transaction.atomic():
            hostel = serializer.validated_data.get("hostel")
            heads = serializer.validated_data.get("persons_count") or 1
            if hostel:
                hostel = Hostel.objects.select_for_update().get(pk=hostel.pk)
                remaining = hostel.beds_remaining()
                if remaining < heads:
                    from rest_framework.exceptions import ValidationError
                    raise ValidationError({
                        "hostel": (
                            f"{hostel.name} is full. "
                            f"{remaining} bed(s) left, {heads} requested."
                        )
                    })
            booking = serializer.save(user=self.request.user, status="pending", payment_status="pending")
            if hostel:
                hostel.sync_available_beds()
        try:
            _notify_hospitality_of_request(booking)
        except Exception:
            pass
        try:
            if booking.payment_proof or booking.payment_transaction_id:
                _notify_finance_of_hostel_payment(booking)
        except Exception:
            pass
        try:
            AuditLog.objects.create(
                user=self.request.user,
                action="ACCOMMODATION_BOOKING",
                resource_type="hospitality",
                resource_id=str(booking.id),
                details=f"Stay booking {booking.booking_id} submitted for {booking.hostel.name if booking.hostel else 'hostel'}.",
                ip_address=self.request.META.get("REMOTE_ADDR"),
            )
        except Exception:
            pass

    def perform_update(self, serializer):
        booking = serializer.save()
        if booking.hostel_id:
            booking.hostel.sync_available_beds()

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def my_bookings(self, request):
        bookings = AccommodationBooking.objects.filter(user=request.user).select_related("hostel")
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], permission_classes=[HasModule("hospitality")])
    def approve(self, request, pk=None):
        with transaction.atomic():
            booking = get_object_or_404(
                self.get_queryset().select_for_update().select_related("hostel"),
                pk=pk,
            )
            if booking.status in ("cancelled", "checked_out"):
                return Response(
                    {"detail": "This request cannot be reserved."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if booking.status != "pending":
                return Response(self.get_serializer(booking).data)

            room = (request.data.get("allocated_room") or "").strip()
            notes = (request.data.get("admin_notes") or "").strip()
            booking.status = "allocated" if room else "confirmed"
            if room:
                booking.allocated_room = room
            if booking.hostel:
                booking.allocated_hostel = booking.hostel.name
                booking.hostel.sync_available_beds()
            if notes:
                booking.admin_notes = notes
            booking.save()

        try:
            AuditLog.objects.create(
                user=request.user,
                action="ACCOMMODATION_APPROVE",
                resource_type="hospitality",
                resource_id=str(booking.id),
                details=f"Reserved {booking.booking_id} ({booking.status}).",
                ip_address=request.META.get("REMOTE_ADDR"),
            )
        except Exception:
            pass

        if booking.email:
            send_mail_async(
                subject=f"MacFiesta hostel reserved — {booking.booking_id}",
                message=(
                    f"Hello {booking.full_name},\n\n"
                    f"Hospitality has allocated your stay {booking.booking_id}.\n"
                    f"Hostel: {booking.allocated_hostel or (booking.hostel.name if booking.hostel else '')}\n"
                    f"Room: {booking.allocated_room or 'Will be assigned at check-in'}\n"
                    f"Dates: {booking.check_in_date} → {booking.check_out_date}\n\n"
                    f"Your bed is now reserved.\n"
                ),
                recipient_list=[booking.email],
                context_id=f"acc_approved_{booking.id}",
            )

        return Response(self.get_serializer(booking).data)

    @action(detail=True, methods=["post"], permission_classes=[HasModule("hospitality")])
    def reject(self, request, pk=None):
        booking = self.get_object()
        if booking.status in ("allocated", "confirmed", "checked_in"):
            return Response(
                {"detail": "A reserved stay cannot be rejected here. Cancel allocation first."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        notes = (request.data.get("admin_notes") or request.data.get("reason") or "").strip()
        booking.status = "cancelled"
        if notes:
            booking.admin_notes = notes
        booking.save(update_fields=["status", "admin_notes", "updated_at"])
        if booking.hostel:
            booking.hostel.sync_available_beds()

        try:
            AuditLog.objects.create(
                user=request.user,
                action="ACCOMMODATION_REJECT",
                resource_type="hospitality",
                resource_id=str(booking.id),
                details=f"Rejected stay request {booking.booking_id}.",
                ip_address=request.META.get("REMOTE_ADDR"),
            )
        except Exception:
            pass

        if booking.email:
            send_mail_async(
                subject=f"MacFiesta hostel booking {booking.booking_id} was cancelled",
                message=(
                    f"Hello {booking.full_name},\n\n"
                    f"Hospitality could not continue booking {booking.booking_id}.\n"
                    f"{('Note: ' + notes) if notes else 'Please contact the hospitality desk for alternatives.'}\n"
                ),
                recipient_list=[booking.email],
                context_id=f"acc_rejected_{booking.id}",
            )

        return Response(self.get_serializer(booking).data)

    @action(detail=True, methods=["post"], url_path="verify-payment", permission_classes=[HasModule("finance")])
    def verify_payment(self, request, pk=None):
        booking = self.get_object()
        if booking.status == "cancelled":
            return Response({"detail": "Cancelled stays cannot be verified."}, status=status.HTTP_400_BAD_REQUEST)
        booking.payment_status = "paid"
        booking.save(update_fields=["payment_status", "updated_at"])
        try:
            AuditLog.objects.create(
                user=request.user,
                action="HOSTEL_PAYMENT_VERIFY",
                resource_type="finance",
                resource_id=str(booking.id),
                details=f"Verified hostel payment {booking.booking_id}.",
                ip_address=request.META.get("REMOTE_ADDR"),
            )
        except Exception:
            pass
        return Response(self.get_serializer(booking).data)

    @action(detail=True, methods=["post"], url_path="reject-payment", permission_classes=[HasModule("finance")])
    def reject_payment(self, request, pk=None):
        booking = self.get_object()
        reason = (request.data.get("reason") or request.data.get("admin_notes") or "").strip()
        booking.payment_status = "rejected"
        if reason:
            booking.admin_notes = reason
        booking.save(update_fields=["payment_status", "admin_notes", "updated_at"])
        try:
            AuditLog.objects.create(
                user=request.user,
                action="HOSTEL_PAYMENT_REJECT",
                resource_type="finance",
                resource_id=str(booking.id),
                details=f"Rejected hostel payment {booking.booking_id}.",
                ip_address=request.META.get("REMOTE_ADDR"),
            )
        except Exception:
            pass
        return Response(self.get_serializer(booking).data)


@api_view(["GET"])
@permission_classes([HasModule("hospitality")])
def admin_hospitality_stats(request):
    total_requests = AccommodationBooking.objects.count()
    pending = AccommodationBooking.objects.filter(status="pending").count()
    allocated = AccommodationBooking.objects.filter(status__in=["allocated", "confirmed"]).count()
    checked_in = AccommodationBooking.objects.filter(status="checked_in").count()
    males = AccommodationBooking.objects.filter(gender="male").count()
    females = AccommodationBooking.objects.filter(gender="female").count()

    return Response({
        "total_requests": total_requests,
        "pending": pending,
        "allocated": allocated,
        "checked_in": checked_in,
        "males": males,
        "females": females,
    })

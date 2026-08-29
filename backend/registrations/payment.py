"""Payment / entry-QR helpers for MacFiesta registrations."""

from django.contrib.auth.models import User
from django.utils import timezone


UNPAID_PAYMENT_STATUSES = frozenset({"pending", "failed", "rejected"})
VALID_PAYMENT_STATUSES = frozenset({"paid", "waived"})


def can_manage_payments(user: User | None) -> bool:
    """Finance desk + Core/superuser may verify/reject and view payment screenshots."""
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser:
        return True
    if not user.is_staff:
        return False
    profile = getattr(user, "staff_profile", None)
    if profile is None:
        return False
    return profile.committee in ("finance", "core")


def payment_is_cleared(reg) -> bool:
    amount = reg.payment_amount
    if amount is not None and amount <= 0:
        return True
    return reg.payment_status in VALID_PAYMENT_STATUSES


def entry_qr_status(reg) -> str:
    """
    Registration / entry QR validity for desks and student pass.

    PENDING until Finance verifies payment (unless amount is 0).
    """
    if reg.cancelled_at or reg.approval_status in ("cancelled", "rejected"):
        return "CANCELLED" if reg.approval_status != "rejected" else "INVALID"
    if reg.attendance_marked:
        return "ALREADY CHECKED IN"
    if reg.approval_status == "pending" and reg.is_waiting_list:
        return "PENDING"
    if not payment_is_cleared(reg):
        return "PENDING"
    return "VALID"


def mark_payment_verified(reg, *, by_user: User):
    reg.payment_status = "paid"
    reg.payment_rejection_reason = ""
    now = timezone.now()
    if not reg.payment_confirmed_at:
        reg.payment_confirmed_at = now
    reg.payment_verified_at = now
    reg.payment_verified_by = by_user
    reg.save(
        update_fields=[
            "payment_status",
            "payment_rejection_reason",
            "payment_confirmed_at",
            "payment_verified_at",
            "payment_verified_by",
        ]
    )
    return reg


def mark_payment_rejected(reg, *, by_user: User, reason: str = ""):
    reg.payment_status = "rejected"
    reg.payment_rejection_reason = (reason or "").strip() or "Payment rejected by finance desk"
    reg.payment_verified_at = None
    reg.payment_verified_by = None
    reg.save(
        update_fields=[
            "payment_status",
            "payment_rejection_reason",
            "payment_verified_at",
            "payment_verified_by",
        ]
    )
    return reg

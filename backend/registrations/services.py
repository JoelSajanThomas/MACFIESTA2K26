import logging

from django.core.mail import send_mail
from django.conf import settings
from django.db import transaction
from django.db.models import Max
from django.utils import timezone

from .models import Registration

logger = logging.getLogger(__name__)


def next_waitlist_position(event):
    current = (
        Registration.objects.filter(event=event, is_waiting_list=True, cancelled_at__isnull=True)
        .aggregate(Max("waitlist_position"))
        .get("waitlist_position__max")
    )
    return (current or 0) + 1


import threading

def _send_mail_worker(subject, message, from_email, recipient_list, reg_id):
    try:
        send_mail(
            subject,
            message,
            from_email,
            recipient_list,
            fail_silently=True,
        )
    except Exception:
        logger.exception(
            "Failed to send registration email for registration_id=%s",
            reg_id,
        )

def send_registration_approval_email(registration):
    """Sends official confirmation email to participant ONLY after Admin approves/verifies the registration."""
    if not registration.email:
        return
    
    is_team = registration.registration_type == "team"
    team_info = f"\n• Team / Squad: {registration.team_name or 'Squad'}" if is_team else ""
    amount_str = f"₹{registration.payment_amount}" if registration.payment_amount else "Free Pass"

    subject = f"Registration Approved & Verified: {registration.event.title} | MacFiesta 2026"
    message = (
        f"Dear {registration.participant_name},\n\n"
        f"Congratulations! Your registration for {registration.event.title} has been APPROVED & VERIFIED by the MacFiesta Administration.\n\n"
        f"══════════════════════════════════════════════════\n"
        f"OFFICIAL MISSION / EVENT PASS DETAILS\n"
        f"══════════════════════════════════════════════════\n"
        f"• Registration No: {registration.registration_number}\n"
        f"• Event / Mission: {registration.event.title}\n"
        f"• Format: {'Squad Competition (Captain)' if is_team else 'Solo Competition'}{team_info}\n"
        f"• Institution: {registration.college_name}\n"
        f"• Event Date: {registration.event.event_date}\n"
        f"• Venue: {registration.event.venue or 'Main Festival Arena'}\n"
        f"• Payment Status: {registration.payment_status.upper()} ({amount_str})\n"
        f"• Approval Status: APPROVED & VERIFIED\n"
        f"══════════════════════════════════════════════════\n\n"
        f"Your official tournament entry pass QR is now active.\n"
        f"You can view and present your Digital Entry Pass from your Student Dashboard:\n"
        f"https://macfiesta.in/pass/{registration.id}\n\n"
        f"We look forward to seeing you at MacFiesta 2026!\n\n"
        f"Best regards,\n"
        f"MacFiesta 2026 Organizing Committee\n"
        f"Mar Athanasios College for Advanced Studies Tiruvalla (MACFAST)\n"
    )
    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "macfiesta@macfast.org")
    recipients = [registration.email]
    
    # Run in background thread to ensure instantaneous API response
    threading.Thread(
        target=_send_mail_worker,
        args=(subject, message, from_email, recipients, registration.id),
        daemon=True,
    ).start()


def send_registration_email(registration):
    """Alias for backwards-compatibility - routed to approval email when verified."""
    send_registration_approval_email(registration)


@transaction.atomic
def promote_next_waitlisted(event):
    """Promote the earliest waitlisted registration into a confirmed spot."""
    confirmed = event.registrations.filter(
        is_waiting_list=False, cancelled_at__isnull=True
    ).count()
    if confirmed >= event.max_participants:
        return None
    if not event.is_registration_open and event.status == "cancelled":
        return None

    nxt = (
        event.registrations.select_for_update()
        .filter(is_waiting_list=True, cancelled_at__isnull=True)
        .order_by("waitlist_position", "registered_at")
        .first()
    )
    if not nxt:
        return None

    nxt.is_waiting_list = False
    nxt.waitlist_position = None
    nxt.approval_status = "approved"
    nxt.save(update_fields=["is_waiting_list", "waitlist_position", "approval_status"])
    send_registration_email(nxt)
    return nxt


@transaction.atomic
def cancel_registration(registration, *, by_user=None):
    if registration.cancelled_at:
        return registration
    if registration.attendance_marked:
        raise ValueError("Cannot cancel a registration that is already verified/attended.")

    event = registration.event
    was_confirmed = not registration.is_waiting_list
    registration.cancelled_at = timezone.now()
    registration.approval_status = "cancelled"
    registration.is_waiting_list = False
    registration.waitlist_position = None
    registration.save(
        update_fields=[
            "cancelled_at",
            "approval_status",
            "is_waiting_list",
            "waitlist_position",
        ]
    )

    if was_confirmed:
        promote_next_waitlisted(event)
    return registration

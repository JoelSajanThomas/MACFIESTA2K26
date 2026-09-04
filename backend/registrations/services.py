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


from config.mail_utils import send_mail_async


def send_registration_received_email(registration):
    """Sends official registration receipt email immediately after participant registers."""
    if not registration.email:
        return

    is_team = registration.registration_type == "team"
    team_info = f"\n• Team / Squad: {registration.team_name or 'Squad'}" if is_team else ""
    amount_str = f"₹{registration.payment_amount}" if registration.payment_amount else "Free Pass"
    status_str = "Confirmed" if registration.payment_status in ("paid", "waived") else "Pending Verification"
    if registration.is_waiting_list:
        status_str = f"Waiting List (Position #{registration.waitlist_position})"

    subject = f"Registration Received: {registration.event.title} | Reg #{registration.registration_number}"
    text_message = (
        f"Dear {registration.participant_name},\n\n"
        f"Thank you for registering for {registration.event.title} at MacFiesta 2026!\n\n"
        f"══════════════════════════════════════════════════\n"
        f"OFFICIAL REGISTRATION DETAILS\n"
        f"══════════════════════════════════════════════════\n"
        f"• Registration No: {registration.registration_number}\n"
        f"• Event / Mission: {registration.event.title}\n"
        f"• Format: {'Squad Competition (Captain)' if is_team else 'Solo Competition'}{team_info}\n"
        f"• Institution: {registration.college_name}\n"
        f"• Event Date: {registration.event.event_date}\n"
        f"• Venue: {registration.event.venue or 'Main Festival Arena'}\n"
        f"• Status: {status_str}\n"
        f"• Fee / Amount: {amount_str}\n"
        f"══════════════════════════════════════════════════\n\n"
        f"You can view and manage your registration and digital pass from your Student Dashboard:\n"
        f"https://macfiesta.in/student-dashboard\n\n"
        f"If you made an online UPI payment, our Finance & Verification Desk will verify the transaction.\n"
        f"Once verified, your digital entry QR pass will be fully authorized.\n\n"
        f"Best regards,\n"
        f"MacFiesta 2026 Organizing Committee\n"
        f"Mar Athanasios College for Advanced Studies Tiruvalla (MACFAST)\n"
    )

    html_message = (
        f'<div style="font-family: Arial, sans-serif; background: #05050A; color: #FFFFFF; padding: 28px; border-radius: 16px; max-width: 540px; margin: 0 auto; border: 1px solid #1E293B;">'
        f'<div style="text-align: center; margin-bottom: 20px;">'
        f'<h1 style="color: #FFD700; margin: 0; font-size: 24px; letter-spacing: 2px;">MACFIESTA 2026</h1>'
        f'<p style="color: #00D4FF; font-size: 11px; margin-top: 4px; letter-spacing: 1px; font-weight: bold;">MISSION REGISTRATION RECEIVED</p>'
        f'</div>'
        f'<p style="color: #CBD5E1; font-size: 14px;">Dear Agent <strong>{registration.participant_name}</strong>,</p>'
        f'<p style="color: #94A3B8; font-size: 13px; line-height: 1.5;">Your registration for <strong>{registration.event.title}</strong> has been logged successfully.</p>'
        f'<div style="background: #0B1120; border: 1px solid #1E293B; border-radius: 12px; padding: 16px 20px; margin: 20px 0; font-size: 13px; line-height: 1.8;">'
        f'<div><span style="color: #64748B;">Registration No:</span> <strong style="color: #00D4FF; font-family: monospace;">{registration.registration_number}</strong></div>'
        f'<div><span style="color: #64748B;">Event:</span> <strong style="color: #FFFFFF;">{registration.event.title}</strong></div>'
        f'<div><span style="color: #64748B;">Institution:</span> <span style="color: #CBD5E1;">{registration.college_name}</span></div>'
        f'<div><span style="color: #64748B;">Date & Venue:</span> <span style="color: #CBD5E1;">{registration.event.event_date} | {registration.event.venue or "Main Arena"}</span></div>'
        f'<div><span style="color: #64748B;">Status:</span> <strong style="color: #FFD700;">{status_str}</strong> ({amount_str})</div>'
        f'</div>'
        f'<div style="text-align: center; margin: 24px 0;">'
        f'<a href="https://macfiesta.in/student-dashboard" style="display: inline-block; background: #FFD700; color: #000000; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">'
        f'VIEW DIGITAL PASS'
        f'</a>'
        f'</div>'
        f'<hr style="border: 0; border-top: 1px solid #1E293B; margin: 20px 0;" />'
        f'<p style="color: #64748B; font-size: 11px; text-align: center; margin: 0;">MacFiesta 2026 · Mar Athanasios College for Advanced Studies Tiruvalla (MACFAST)</p>'
        f'</div>'
    )

    send_mail_async(
        subject=subject,
        message=text_message,
        recipient_list=[registration.email],
        html_message=html_message,
        context_id=f"reg_received_{registration.id}",
    )


def send_registration_approval_email(registration):
    """Sends official confirmation email to participant ONLY after Admin approves/verifies the registration."""
    if not registration.email:
        return

    is_team = registration.registration_type == "team"
    team_info = f"\n• Team / Squad: {registration.team_name or 'Squad'}" if is_team else ""
    amount_str = f"₹{registration.payment_amount}" if registration.payment_amount else "Free Pass"

    subject = f"Registration Approved & Verified: {registration.event.title} | MacFiesta 2026"
    text_message = (
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

    html_message = (
        f'<div style="font-family: Arial, sans-serif; background: #05050A; color: #FFFFFF; padding: 28px; border-radius: 16px; max-width: 540px; margin: 0 auto; border: 1px solid #1E293B;">'
        f'<div style="text-align: center; margin-bottom: 20px;">'
        f'<h1 style="color: #FFD700; margin: 0; font-size: 24px; letter-spacing: 2px;">MACFIESTA 2026</h1>'
        f'<p style="color: #00D4FF; font-size: 11px; margin-top: 4px; letter-spacing: 1px; font-weight: bold;">MISSION PASS APPROVED &amp; VERIFIED</p>'
        f'</div>'
        f'<p style="color: #CBD5E1; font-size: 14px;">Congratulations Agent <strong>{registration.participant_name}</strong>,</p>'
        f'<p style="color: #94A3B8; font-size: 13px; line-height: 1.5;">Your registration for <strong>{registration.event.title}</strong> has been officially APPROVED &amp; VERIFIED.</p>'
        f'<div style="background: #0B1120; border: 1px solid #1E293B; border-radius: 12px; padding: 16px 20px; margin: 20px 0; font-size: 13px; line-height: 1.8;">'
        f'<div><span style="color: #64748B;">Registration No:</span> <strong style="color: #00D4FF; font-family: monospace;">{registration.registration_number}</strong></div>'
        f'<div><span style="color: #64748B;">Event:</span> <strong style="color: #FFFFFF;">{registration.event.title}</strong></div>'
        f'<div><span style="color: #64748B;">Venue &amp; Date:</span> <span style="color: #CBD5E1;">{registration.event.venue or "Main Arena"} | {registration.event.event_date}</span></div>'
        f'<div><span style="color: #64748B;">Pass Status:</span> <strong style="color: #10B981;">VERIFIED &amp; ACTIVE</strong></div>'
        f'</div>'
        f'<div style="text-align: center; margin: 24px 0;">'
        f'<a href="https://macfiesta.in/pass/{registration.id}" style="display: inline-block; background: #00D4FF; color: #000000; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">'
        f'OPEN ENTRY PASS QR'
        f'</a>'
        f'</div>'
        f'<hr style="border: 0; border-top: 1px solid #1E293B; margin: 20px 0;" />'
        f'<p style="color: #64748B; font-size: 11px; text-align: center; margin: 0;">MacFiesta 2026 · Mar Athanasios College for Advanced Studies Tiruvalla (MACFAST)</p>'
        f'</div>'
    )

    send_mail_async(
        subject=subject,
        message=text_message,
        recipient_list=[registration.email],
        html_message=html_message,
        context_id=f"reg_approved_{registration.id}",
    )


def send_registration_email(registration):
    """Sends the initial registration receipt email."""
    send_registration_received_email(registration)


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

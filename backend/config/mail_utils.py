"""Reusable asynchronous email dispatching utility for MacFiesta Pro.

Uses a persistent ThreadPoolExecutor so emails are sent in the background
without blocking user requests, while ensuring worker threads stay alive
until transmission completes, with detailed logging.
"""

from __future__ import annotations

import logging
from concurrent.futures import ThreadPoolExecutor
from django.conf import settings
from django.core.mail import EmailMultiAlternatives, send_mail

logger = logging.getLogger(__name__)

# Persistent background thread pool for sending outgoing SMTP emails
_email_executor = ThreadPoolExecutor(max_workers=4, thread_name_prefix="mail_worker")


def send_mail_async(
    subject: str,
    message: str,
    recipient_list: list[str] | str,
    from_email: str | None = None,
    html_message: str | None = None,
    context_id: str | int | None = None,
):
    """Dispatches an email asynchronously in a dedicated worker thread.
    
    Catches exceptions and logs them with full stack trace so email failures
    never crash web requests while remaining fully visible in server logs.
    """
    if not recipient_list:
        return None

    if isinstance(recipient_list, str):
        recipients = [r.strip() for r in recipient_list.split(",") if r.strip()]
    else:
        recipients = [str(r).strip() for r in recipient_list if str(r).strip()]

    if not recipients:
        return None

    sender = from_email or getattr(settings, "DEFAULT_FROM_EMAIL", "macfiesta@macfast.org")

    def _worker():
        try:
            logger.info(
                "[MailWorker] Sending email '%s' to %s (context=%s)",
                subject,
                recipients,
                context_id or "general",
            )
            if html_message:
                msg = EmailMultiAlternatives(subject, message, sender, recipients)
                msg.attach_alternative(html_message, "text/html")
                sent_count = msg.send(fail_silently=False)
            else:
                sent_count = send_mail(
                    subject,
                    message,
                    sender,
                    recipients,
                    fail_silently=False,
                )
            logger.info(
                "[MailWorker] Successfully delivered '%s' to %s (sent_count=%s)",
                subject,
                recipients,
                sent_count,
            )
            return sent_count
        except Exception as exc:
            logger.error(
                "[MailWorker] FAILED to deliver email '%s' to %s: %s",
                subject,
                recipients,
                exc,
                exc_info=True,
            )
            return 0

    return _email_executor.submit(_worker)

"""Admin export helpers adapted from old rootapp Excel export (CSV, no openpyxl)."""

from __future__ import annotations

import csv
from io import StringIO

from django.http import HttpResponse
from django.utils import timezone

from .models import Registration


EXPORT_HEADERS = [
    "Registration No",
    "Participant Name",
    "Email",
    "Phone",
    "College",
    "Event",
    "Category",
    "Team Name",
    "Payment Status",
    "Payment Amount",
    "Payment Method",
    "Transaction ID",
    "Receipt No",
    "Approval Status",
    "Waitlist",
    "Attendance",
    "Food Preference",
    "Accommodation",
    "Transport",
    "Registered At",
]


def registrations_queryset_for_export(params):
    qs = (
        Registration.objects.filter(cancelled_at__isnull=True)
        .select_related("event", "user")
        .order_by("event__title", "participant_name")
    )
    event_id = params.get("event") or params.get("event_id")
    if event_id:
        qs = qs.filter(event_id=event_id)
    payment = params.get("payment") or params.get("payment_status")
    if payment:
        qs = qs.filter(payment_status=payment)
    attendance = params.get("attendance")
    if attendance in ("1", "true", "yes"):
        qs = qs.filter(attendance_marked=True)
    elif attendance in ("0", "false", "no"):
        qs = qs.filter(attendance_marked=False)
    waitlist = params.get("waitlist")
    if waitlist in ("1", "true", "yes"):
        qs = qs.filter(is_waiting_list=True)
    return qs


def registration_export_row(reg: Registration) -> list:
    return [
        reg.registration_number or "",
        reg.participant_name,
        reg.email,
        reg.phone,
        reg.college_name,
        reg.event.title if reg.event_id else "",
        getattr(reg.event, "category", "") or "",
        reg.team_name or "",
        reg.payment_status,
        str(reg.payment_amount) if reg.payment_amount is not None else "",
        reg.payment_method or "",
        reg.payment_transaction_id or "",
        reg.payment_receipt_number or "",
        reg.approval_status,
        "Yes" if reg.is_waiting_list else "No",
        "Yes" if reg.attendance_marked else "No",
        reg.food_preference,
        "Yes" if reg.needs_accommodation else "No",
        "Yes" if reg.needs_transport else "No",
        timezone.localtime(reg.registered_at).strftime("%Y-%m-%d %H:%M")
        if reg.registered_at
        else "",
    ]


def build_registrations_csv_response(params) -> HttpResponse:
    qs = registrations_queryset_for_export(params)
    buffer = StringIO()
    writer = csv.writer(buffer)
    writer.writerow(EXPORT_HEADERS)
    for reg in qs.iterator(chunk_size=200):
        writer.writerow(registration_export_row(reg))

    response = HttpResponse(buffer.getvalue(), content_type="text/csv; charset=utf-8")
    stamp = timezone.localdate().isoformat()
    response["Content-Disposition"] = f'attachment; filename="macfiesta-registrations-{stamp}.csv"'
    return response

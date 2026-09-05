"""Automated Test Suite for Batch Registration and Batch Payment Submission."""

from decimal import Decimal
from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from events.models import Event
from registrations.models import Registration


class BatchPaymentWorkflowTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="clint_barton",
            email="hawkeye@avengers.io",
            password="ArrowPassword123!",
            first_name="Clint",
            last_name="Barton",
        )
        self.outsider = User.objects.create_user(
            username="loki_laufeyson",
            email="loki@asgard.io",
            password="MischiefPassword123!",
            first_name="Loki",
            last_name="Laufeyson",
        )

        future_date = (timezone.now() + timezone.timedelta(days=7)).date()
        self.event_1 = Event.objects.create(
            title="Archery Target Precision",
            slug="archery-target-precision",
            category="sports",
            event_date=future_date,
            registration_fee=Decimal("150.00"),
            min_team_size=1,
            max_team_size=1,
            max_participants=50,
            is_registration_open=True,
            status="published",
        )
        self.event_2 = Event.objects.create(
            title="Avengers Code Assemble",
            slug="avengers-code-assemble",
            category="technical",
            event_date=future_date,
            registration_fee=Decimal("200.00"),
            min_team_size=1,
            max_team_size=4,
            max_participants=50,
            is_registration_open=True,
            status="published",
        )

    def test_01_batch_creation_and_batch_payment_submission(self):
        self.client.force_authenticate(user=self.user)

        # 1. Create a batch of 2 events
        create_payload = {
            "events": [self.event_1.id, self.event_2.id],
            "participant_name": "Clint Barton",
            "college_name": "SHIELD Academy",
            "department": "Marksmanship",
            "phone": "9876543210",
            "email": "hawkeye@avengers.io",
            "needs_accommodation": False,
        }
        res_create = self.client.post("/api/registrations/batch/", data=create_payload, format="json")
        self.assertEqual(res_create.status_code, status.HTTP_201_CREATED, res_create.data)
        batch_id = res_create.data["payment_batch_id"]
        self.assertTrue(batch_id.startswith("PB"))
        self.assertEqual(len(res_create.data["registrations"]), 2)

        # Verify initial state
        regs = Registration.objects.filter(payment_batch_id=batch_id)
        self.assertEqual(regs.count(), 2)
        for r in regs:
            self.assertEqual(r.payment_status, "pending")
            self.assertFalse(r.is_locked)

        # 2. Test missing batch ID
        res_empty = self.client.post("/api/registrations/submit-payment-batch/", data={}, format="json")
        self.assertEqual(res_empty.status_code, status.HTTP_400_BAD_REQUEST)

        # 3. Test outsider cannot submit for this batch
        self.client.force_authenticate(user=self.outsider)
        res_outsider = self.client.post(
            "/api/registrations/submit-payment-batch/",
            data={"payment_batch_id": batch_id, "payment_transaction_id": "UPI/OUTSIDER123"},
            format="json",
        )
        self.assertEqual(res_outsider.status_code, status.HTTP_404_NOT_FOUND)

        # 4. Authenticated owner submits payment proof and txn ID
        self.client.force_authenticate(user=self.user)
        from django.core.files.uploadedfile import SimpleUploadedFile
        proof_file = SimpleUploadedFile("payment_proof.png", b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR", content_type="image/png")
        pay_payload = {
            "payment_batch_id": batch_id,
            "payment_transaction_id": "UPI/HAWKEYE999888",
            "payment_method": "upi_qr",
            "payment_proof": proof_file,
        }
        res_pay = self.client.post("/api/registrations/submit-payment-batch/", data=pay_payload, format="multipart")
        self.assertEqual(res_pay.status_code, status.HTTP_200_OK, res_pay.data)
        self.assertEqual(res_pay.data["payment_batch_id"], batch_id)

        # Verify both registrations in batch now reflect the transaction ID
        regs = Registration.objects.filter(payment_batch_id=batch_id)
        for r in regs:
            self.assertEqual(r.payment_transaction_id, "UPI/HAWKEYE999888")
            self.assertEqual(r.payment_status, "pending")

        # 5. Confirm batch payment
        res_confirm = self.client.post(
            "/api/registrations/submit-payment-batch/",
            data={"payment_batch_id": batch_id, "status": "paid", "auto_confirm": True},
            format="json",
        )
        self.assertEqual(res_confirm.status_code, status.HTTP_200_OK)

        regs = Registration.objects.filter(payment_batch_id=batch_id)
        for r in regs:
            self.assertEqual(r.payment_status, "paid")
            self.assertTrue(r.is_locked)
            self.assertEqual(r.approval_status, "approved")

        # 6. Duplicate payment is rejected
        res_dup = self.client.post(
            "/api/registrations/submit-payment-batch/",
            data={"payment_batch_id": batch_id, "payment_transaction_id": "UPI/DUPE123"},
            format="json",
        )
        self.assertEqual(res_dup.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("already been completed", res_dup.data["detail"])

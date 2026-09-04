"""Committee desk RBAC — API boundaries for MacFiesta Pro desks."""

from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from accounts.models import StaffProfile
from accounts.permissions import MODULES_BY_COMMITTEE, user_modules
from events.models import Event
from registrations.models import Registration


TINY_PNG = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
    b"\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00"
    b"\x00\x01\x01\x00\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82"
)


def _staff(username: str, committee: str) -> User:
    user = User.objects.create_user(username, password="TestPass123!", is_staff=True)
    StaffProfile.objects.create(user=user, committee=committee, must_change_password=False)
    return user


class DeskRbacTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.student = User.objects.create_user(
            "student1", email="s1@example.com", password="TestPass123!"
        )
        self.core = _staff("coredesk", "core")
        self.finance = _staff("financedesk", "finance")
        self.food = _staff("fooddesk", "food")
        self.hospitality = _staff("hospdesk", "hospitality")
        self.event = _staff("eventdesk", "event")
        self.program = _staff("progdesk", "program")
        self.cultural = _staff("cultdesk", "cultural")
        self.publicity = _staff("pubdesk", "publicity")
        self.invitation = _staff("invdesk", "invitation")
        self.verification = _staff("verifydesk", "verification")

        self.mission = Event.objects.create(
            title="Desk RBAC Event",
            slug="desk-rbac-event",
            category="arts",
            audience="college",
            department="Arts",
            description="RBAC",
            venue="Hall",
            event_date=timezone.localdate(),
            event_time=timezone.now().time().replace(microsecond=0),
            max_participants=50,
            registration_fee=100,
            is_registration_open=True,
        )
        self.reg = Registration.objects.create(
            user=self.student,
            event=self.mission,
            participant_name="Student One",
            college_name="Test College",
            email="s1@example.com",
            phone="9999999999",
            payment_status="pending",
            payment_amount=100,
            payment_transaction_id="TXN-ORIGINAL",
            approval_status="approved",
            payment_proof=SimpleUploadedFile("proof.png", TINY_PNG, content_type="image/png"),
            needs_accommodation=True,
            gender="male",
            food_preference="veg",
        )

    def test_module_matrix_matches_seed_map(self):
        mapping = {
            "core": self.core,
            "finance": self.finance,
            "food": self.food,
            "hospitality": self.hospitality,
            "event": self.event,
            "program": self.program,
            "cultural": self.cultural,
            "publicity": self.publicity,
            "invitation": self.invitation,
            "verification": self.verification,
        }
        for committee, user in mapping.items():
            expected = MODULES_BY_COMMITTEE[committee]
            if committee == "core":
                from accounts.permissions import ALL_MODULES

                expected = list(ALL_MODULES)
            self.assertEqual(set(user_modules(user)), set(expected))

    def test_student_blocked_from_admin_apis(self):
        self.client.force_authenticate(self.student)
        self.assertIn(self.client.get("/api/admin/registrations/").status_code, (401, 403))
        self.assertIn(
            self.client.get("/api/admin/verification/lookup/?q=x").status_code, (401, 403)
        )
        self.assertIn(
            self.client.patch(
                f"/api/admin/registrations/{self.reg.id}/",
                {"payment_status": "paid"},
                format="json",
            ).status_code,
            (401, 403),
        )

    def test_finance_can_verify_and_reject_payment(self):
        self.client.force_authenticate(self.finance)
        paid = self.client.patch(
            f"/api/admin/registrations/{self.reg.id}/",
            {"payment_status": "paid"},
            format="json",
        )
        self.assertEqual(paid.status_code, 200)
        self.assertEqual(paid.data.get("payment_status"), "paid")
        self.assertTrue(paid.data.get("payment_proof_url"))

        rejected = self.client.patch(
            f"/api/admin/registrations/{self.reg.id}/",
            {"payment_status": "rejected", "payment_rejection_reason": "Blurry screenshot"},
            format="json",
        )
        self.assertEqual(rejected.status_code, 200)
        self.assertEqual(rejected.data.get("payment_status"), "rejected")

    def test_finance_cannot_write_events_or_cms(self):
        self.client.force_authenticate(self.finance)
        create_event = self.client.post(
            "/api/events/",
            {
                "title": "Finance Hack",
                "slug": "finance-hack",
                "category": "tech",
                "description": "x",
                "venue": "TBD",
                "event_date": str(timezone.localdate()),
                "event_time": "10:00:00",
                "max_participants": 10,
                "registration_fee": 0,
            },
            format="json",
        )
        self.assertIn(create_event.status_code, (401, 403))
        create_guest = self.client.post(
            "/api/cms/guests/",
            {
                "name": "Blocked Guest",
                "role": "Speaker",
                "description": "Nope",
                "is_active": True,
            },
            format="json",
        )
        self.assertIn(create_guest.status_code, (401, 403))

    def test_non_finance_cannot_change_payment_or_see_proof(self):
        for desk in (
            self.food,
            self.hospitality,
            self.event,
            self.verification,
        ):
            self.client.force_authenticate(desk)
            detail = self.client.get(f"/api/admin/registrations/{self.reg.id}/")
            self.assertEqual(detail.status_code, 200, msg=desk.username)
            self.assertIsNone(detail.data.get("payment_proof_url"))
            patch = self.client.patch(
                f"/api/admin/registrations/{self.reg.id}/",
                {"payment_status": "paid"},
                format="json",
            )
            self.assertIn(patch.status_code, (400, 401, 403), msg=desk.username)
            self.reg.refresh_from_db()
            self.assertEqual(self.reg.payment_status, "pending")

        for desk in (self.program, self.cultural, self.publicity, self.invitation):
            self.client.force_authenticate(desk)
            self.assertIn(
                self.client.get(f"/api/admin/registrations/{self.reg.id}/").status_code,
                (401, 403),
                msg=desk.username,
            )

    def test_food_can_read_regs_and_reports(self):
        self.client.force_authenticate(self.food)
        self.assertEqual(self.client.get("/api/admin/registrations/").status_code, 200)
        self.assertEqual(self.client.get("/api/admin/reports/registrations.csv").status_code, 200)
        self.assertIn(
            self.client.get("/api/admin/verification/lookup/?q=NOPE").status_code,
            (401, 403),
        )

    def test_hospitality_cannot_write_results(self):
        self.client.force_authenticate(self.hospitality)
        create = self.client.post(
            "/api/results/",
            {
                "event": self.mission.id,
                "participant_name": "Winner",
                "college_name": "X",
                "position": "first",
            },
            format="json",
        )
        self.assertIn(create.status_code, (401, 403))
        self.assertEqual(self.client.get("/api/admin/registrations/").status_code, 200)

    def test_event_cannot_verify_payments(self):
        self.client.force_authenticate(self.event)
        self.assertEqual(self.client.get("/api/admin/registrations/").status_code, 200)
        patch = self.client.patch(
            f"/api/admin/registrations/{self.reg.id}/",
            {"payment_status": "paid"},
            format="json",
        )
        self.assertEqual(patch.status_code, 400)

    def test_program_blocked_from_registrations_module(self):
        self.client.force_authenticate(self.program)
        self.assertIn(self.client.get("/api/admin/registrations/").status_code, (401, 403))
        self.assertEqual(self.client.get("/api/admin/reports/registrations.csv").status_code, 200)

    def test_cultural_denied_registrations_and_reports(self):
        self.client.force_authenticate(self.cultural)
        self.assertIn(self.client.get("/api/admin/registrations/").status_code, (401, 403))
        self.assertIn(self.client.get("/api/admin/reports/registrations.csv").status_code, (401, 403))
        self.assertEqual(self.client.get("/api/events/").status_code, 200)

    def test_publicity_and_invitation_cannot_read_private_regs(self):
        for desk in (self.publicity, self.invitation):
            self.client.force_authenticate(desk)
            self.assertIn(self.client.get("/api/admin/registrations/").status_code, (401, 403))
            self.assertIn(
                self.client.get("/api/admin/verification/lookup/?q=x").status_code,
                (401, 403),
            )

    def test_verification_check_in_blocked_until_paid(self):
        self.client.force_authenticate(self.verification)
        lookup = self.client.get(
            f"/api/admin/verification/lookup/?q={self.reg.registration_number}"
        )
        self.assertEqual(lookup.status_code, 200)
        self.assertEqual(lookup.data.get("verification_status"), "PENDING")
        self.assertIsNone(lookup.data.get("payment_proof_url"))

        denied = self.client.post(
            "/api/admin/verification/check-in/",
            {"id": self.reg.id},
            format="json",
        )
        self.assertEqual(denied.status_code, 400)

        self.client.force_authenticate(self.finance)
        self.client.patch(
            f"/api/admin/registrations/{self.reg.id}/",
            {"payment_status": "paid"},
            format="json",
        )

        self.client.force_authenticate(self.verification)
        ok = self.client.post(
            "/api/admin/verification/check-in/",
            {"id": self.reg.id},
            format="json",
        )
        self.assertEqual(ok.status_code, 200)
        self.assertEqual(ok.data.get("verification_status"), "ALREADY CHECKED IN")

    def test_verification_cannot_write_cms(self):
        self.client.force_authenticate(self.verification)
        create = self.client.post(
            "/api/cms/guests/",
            {
                "name": "Hacker",
                "role": "x",
                "description": "x",
                "is_active": True,
            },
            format="json",
        )
        self.assertIn(create.status_code, (401, 403))

    def test_core_has_ops_access(self):
        self.client.force_authenticate(self.core)
        self.assertEqual(self.client.get("/api/admin/registrations/").status_code, 200)
        self.assertEqual(self.client.get("/api/admin/reports/registrations.csv").status_code, 200)
        self.assertEqual(self.client.get("/api/events/").status_code, 200)
        paid = self.client.patch(
            f"/api/admin/registrations/{self.reg.id}/",
            {"payment_status": "paid"},
            format="json",
        )
        self.assertEqual(paid.status_code, 200)

    def test_purge_registered_data_requires_superadmin_password(self):
        User.objects.create_user("superadmin", password="SuperPassword123!", is_staff=True, is_superuser=True)
        self.client.force_authenticate(self.core)

        # 1. Without password
        res_no_pw = self.client.post("/api/admin/purge-registered-data/", {}, format="json")
        self.assertEqual(res_no_pw.status_code, 400)
        self.assertIn("Super Admin password is required", res_no_pw.data.get("detail", ""))

        # 2. With staff user's own password (TestPass123!) -> Denied!
        res_staff_pw = self.client.post(
            "/api/admin/purge-registered-data/",
            {"raw_password": "TestPass123!"},
            format="json",
        )
        self.assertEqual(res_staff_pw.status_code, 400)
        self.assertIn("Incorrect Super Admin password", res_staff_pw.data.get("detail", ""))

        # 3. With superadmin password -> Allowed!
        res_ok = self.client.post(
            "/api/admin/purge-registered-data/",
            {"raw_password": "SuperPassword123!"},
            format="json",
        )
        self.assertEqual(res_ok.status_code, 200)
        self.assertTrue(res_ok.data.get("success"))


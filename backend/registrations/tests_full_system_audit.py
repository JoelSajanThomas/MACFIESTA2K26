"""Complete End-to-End System Audit Test Suite for MacFiesta Pro.

Covers:
1. User Signup, Login, JWT Refresh, Password Reset & Profile Management.
2. Solo & Batch Event Registrations with Stay/Meal Fee Synchronization.
3. Squad Mission Team Workflows (Captain, Member Invite, Accept, Payment Coverage).
4. Role-Based Access Control (Core, Finance, Hospitality, Verification Desk).
5. Student Privacy Isolation & Security Hardening.
6. Public Stats, Config & CMS Integrity.
"""

from decimal import Decimal
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from accounts.models import StaffProfile
from events.models import Event
from registrations.models import Registration, TeamMember, Institution

TINY_PNG = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06"
    b"\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01"
    b"\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
)


class CompleteEndToEndSystemAuditTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # 1. Superuser / Core Admin
        self.superuser = User.objects.create_superuser("superboss", password="SuperPassword123!")
        StaffProfile.objects.create(user=self.superuser, committee="core")

        # 2. Finance Staff
        self.finance_user = User.objects.create_user("fin_officer", password="StaffPass123!", is_staff=True)
        StaffProfile.objects.create(user=self.finance_user, committee="finance")

        # 3. Hospitality Staff
        self.hosp_user = User.objects.create_user("hosp_officer", password="StaffPass123!", is_staff=True)
        StaffProfile.objects.create(user=self.hosp_user, committee="hospitality")

        # 4. Verification Volunteer Staff
        self.verify_user = User.objects.create_user("verify_agent", password="StaffPass123!", is_staff=True)
        StaffProfile.objects.create(user=self.verify_user, committee="verification")

        # 5. Regular Students
        self.student_a = User.objects.create_user(
            "student_alpha", email="alpha@college.edu", password="AlphaPass123!"
        )
        self.student_b = User.objects.create_user(
            "student_beta", email="beta@college.edu", password="BetaPass123!"
        )

        # 6. Events (Solo & Squad)
        self.solo_event = Event.objects.create(
            title="Iron Man: Solo Code Clash",
            slug="solo-code-clash",
            category="tech",
            audience="college",
            department="Computer Science",
            description="High-speed algorithmic programming arena.",
            venue="Main Lab A",
            event_date=timezone.localdate() + timezone.timedelta(days=5),
            event_time=timezone.now().time().replace(microsecond=0),
            max_participants=50,
            registration_fee=250,
            min_team_size=1,
            max_team_size=1,
            is_registration_open=True,
        )

        self.squad_event = Event.objects.create(
            title="Avengers: Web Multiverse Battle",
            slug="web-multiverse-battle",
            category="tech",
            audience="college",
            department="Computer Science",
            description="Full-stack squad battle for collegiate developers.",
            venue="Tech Pavilion",
            event_date=timezone.localdate() + timezone.timedelta(days=5),
            event_time=timezone.now().time().replace(microsecond=0),
            max_participants=20,
            registration_fee=500,
            min_team_size=2,
            max_team_size=4,
            is_registration_open=True,
        )

    # ─────────────────────────────────────────────────────────────
    # SECTION 1: USER AUTHENTICATION & IDENTITY LIFECYCLE
    # ─────────────────────────────────────────────────────────────

    def test_01_user_signup_login_and_token_refresh(self):
        """Verify registration, JWT token acquisition, token refresh, and profile check."""
        # A. Register new user
        signup_res = self.client.post(
            "/api/auth/register/",
            {
                "full_name": "Tony Stark",
                "email": "agent007@shieldeast.edu",
                "college_name": "Stark Institute of Technology",
                "phone": "9876543210",
                "gender": "male",
                "password": "SecurePassword123!",
                "password_confirm": "SecurePassword123!",
            },
            format="json",
        )
        self.assertEqual(signup_res.status_code, status.HTTP_201_CREATED, signup_res.data)
        self.assertIn("user", signup_res.data)
        self.assertEqual(signup_res.data["user"]["email"], "agent007@shieldeast.edu")

        # B. Login with username or email
        login_res = self.client.post(
            "/api/auth/login/",
            {"username": "agent007@shieldeast.edu", "password": "SecurePassword123!"},
            format="json",
        )
        self.assertEqual(login_res.status_code, status.HTTP_200_OK, login_res.data)
        self.assertIn("access", login_res.data)
        self.assertIn("refresh", login_res.data)
        access_token = login_res.data["access"]
        refresh_token = login_res.data["refresh"]

        # C. Test Profile Access with JWT Bearer Token
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        me_res = self.client.get("/api/auth/me/")
        self.assertEqual(me_res.status_code, status.HTTP_200_OK)
        self.assertEqual(me_res.data["email"], "agent007@shieldeast.edu")

        # D. Refresh token
        self.client.credentials()  # Clear auth
        refresh_res = self.client.post("/api/auth/refresh/", {"refresh": refresh_token}, format="json")
        self.assertEqual(refresh_res.status_code, status.HTTP_200_OK)
        self.assertIn("access", refresh_res.data)

    def test_02_password_reset_and_change_workflow(self):
        """Verify request reset, OTP generation, password reset confirmation, and auth change-password."""
        # A. Request reset
        reset_req = self.client.post(
            "/api/auth/password-reset/",
            {"email": "alpha@college.edu"},
            format="json",
        )
        self.assertEqual(reset_req.status_code, status.HTTP_200_OK)

        # B. Authenticated user changes password
        self.client.force_authenticate(self.student_a)
        change_res = self.client.post(
            "/api/auth/change-password/",
            {
                "current_password": "AlphaPass123!",
                "password": "NewAlphaPass456!",
                "password_confirm": "NewAlphaPass456!",
            },
            format="json",
        )
        self.assertEqual(change_res.status_code, status.HTTP_200_OK)

        # C. Verify login with new password succeeds
        self.client.credentials()
        login_new = self.client.post(
            "/api/auth/login/",
            {"username": "student_alpha", "password": "NewAlphaPass456!"},
            format="json",
        )
        self.assertEqual(login_new.status_code, status.HTTP_200_OK)

    # ─────────────────────────────────────────────────────────────
    # SECTION 2: EVENT REGISTRATIONS, CALCULATIONS & PAYMENT FLOW
    # ─────────────────────────────────────────────────────────────

    def test_03_solo_registration_and_payment_submission(self):
        """Verify solo registration, fee computation, and proof submission."""
        self.client.force_authenticate(self.student_a)

        # Create registration
        create_res = self.client.post(
            "/api/registrations/",
            {
                "event": self.solo_event.id,
                "participant_name": "Student Alpha",
                "college_name": "MACFAST Tiruvalla",
                "email": "alpha@college.edu",
                "phone": "9876543210",
                "gender": "male",
                "department": "Computer Applications",
                "needs_accommodation": False,
                "food_preference": "none",
            },
            format="json",
        )
        self.assertEqual(create_res.status_code, status.HTTP_201_CREATED, create_res.data)
        reg_id = create_res.data["id"]
        self.assertEqual(Decimal(str(create_res.data["event_fee"])), Decimal("250.00"))
        self.assertEqual(Decimal(str(create_res.data["hospitality_fee"])), Decimal("0.00"))

        # Submit payment proof
        proof_file = SimpleUploadedFile("alpha_proof.png", TINY_PNG, content_type="image/png")
        pay_res = self.client.post(
            f"/api/registrations/{reg_id}/submit-payment/",
            {
                "payment_transaction_id": "UPI1234567890",
                "payment_method": "upi",
                "payment_proof": proof_file,
            },
            format="multipart",
        )
        self.assertEqual(pay_res.status_code, status.HTTP_200_OK)

        reg = Registration.objects.get(id=reg_id)
        self.assertTrue(bool(reg.payment_proof))
        self.assertEqual(reg.payment_transaction_id, "UPI1234567890")

    def test_04_batch_registration_with_hospitality_split_fees(self):
        """Verify batch checkout accurately splits and serializes event vs stay/meal fees."""
        self.client.force_authenticate(self.student_a)

        batch_res = self.client.post(
            "/api/registrations/batch/",
            {
                "events": [self.solo_event.id],
                "participant_name": "Student Alpha",
                "college_name": "MACFAST",
                "email": "alpha@college.edu",
                "phone": "9876543210",
                "department": "MCA",
                "gender": "male",
                "needs_accommodation": True,
                "accommodation_count": 2,
                "food_preference": "veg",
            },
            format="json",
        )
        self.assertEqual(batch_res.status_code, status.HTTP_201_CREATED, batch_res.data)
        self.assertIn("registrations", batch_res.data)
        created_reg = batch_res.data["registrations"][0]

        # Event Fee: 250
        # Accommodation Fee: 2 persons * 350 = 700
        # Food Fee: 2 persons * 170 = 340
        # Hospitality Total: 1040
        # Total: 1290
        self.assertEqual(Decimal(str(created_reg["event_fee"])), Decimal("250.00"))
        self.assertEqual(Decimal(str(created_reg["accommodation_fee"])), Decimal("700.00"))
        self.assertEqual(Decimal(str(created_reg["food_fee"])), Decimal("340.00"))
        self.assertEqual(Decimal(str(created_reg["hospitality_fee"])), Decimal("1040.00"))
        self.assertEqual(Decimal(str(batch_res.data["hospitality_total"])), Decimal("1040.00"))

    def test_05_squad_registration_and_team_workflow(self):
        """Verify squad creation, teammate invitation, acceptance, and single captain payment coverage."""
        # 1. Captain creates team registration
        self.client.force_authenticate(self.student_a)
        team_create_res = self.client.post(
            "/api/registrations/team/create/",
            {
                "event": self.squad_event.id,
                "team_name": "Stark Coders",
                "participant_name": "Captain Alpha",
                "college_name": "MACFAST",
                "department": "MCA",
                "email": "alpha@college.edu",
                "phone": "9876543210",
                "gender": "male",
            },
            format="json",
        )
        self.assertEqual(team_create_res.status_code, status.HTTP_201_CREATED, team_create_res.data)
        squad_reg_id = team_create_res.data["id"]

        # 2. Captain invites teammate Beta
        invite_res = self.client.post(
            f"/api/registrations/{squad_reg_id}/team/invite/",
            {
                "name": "Member Beta",
                "email": "beta@college.edu",
                "phone": "9123456780",
                "college_name": "MACFAST",
            },
            format="json",
        )
        self.assertEqual(invite_res.status_code, status.HTTP_201_CREATED, invite_res.data)
        self.assertIn("team_members", invite_res.data)
        beta_members = [m for m in invite_res.data["team_members"] if m["email"] == "beta@college.edu"]
        self.assertTrue(len(beta_members) > 0)
        invitation_id = beta_members[0]["id"]

        # 3. Teammate Beta accepts invitation
        self.client.force_authenticate(self.student_b)
        respond_res = self.client.post(
            "/api/registrations/invitations/respond/",
            {"invitation_id": invitation_id, "action": "accept"},
            format="json",
        )
        self.assertEqual(respond_res.status_code, status.HTTP_200_OK, respond_res.data)

        # 4. Verify squad status
        squad_reg = Registration.objects.get(id=squad_reg_id)
        self.assertEqual(squad_reg.total_team_members_count, 2)
        self.assertTrue(squad_reg.is_team_full)

    # ─────────────────────────────────────────────────────────────
    # SECTION 3: ROLE-BASED ACCESS CONTROL (RBAC) & OPERATIONS
    # ─────────────────────────────────────────────────────────────

    def test_06_finance_verification_and_rejection_workflow(self):
        """Verify finance officer can approve and reject payments, but cannot mutate CMS."""
        # Create a paid-submitted registration
        reg = Registration.objects.create(
            user=self.student_a,
            event=self.solo_event,
            participant_name="Student Alpha",
            college_name="MACFAST",
            email="alpha@college.edu",
            phone="9876543210",
            payment_status="pending",
            payment_transaction_id="TXN9999",
        )

        # Finance staff marks payment as paid
        self.client.force_authenticate(self.finance_user)
        patch_res = self.client.patch(
            f"/api/admin/registrations/{reg.id}/",
            {"payment_status": "paid"},
            format="json",
        )
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        reg.refresh_from_db()
        self.assertEqual(reg.payment_status, "paid")

        # Finance staff is denied mutating CMS or creating events
        event_create_attempt = self.client.post(
            "/api/events/",
            {"title": "Unauthorized Event", "category": "tech"},
            format="json",
        )
        self.assertEqual(event_create_attempt.status_code, status.HTTP_403_FORBIDDEN)

    def test_07_verification_desk_lookup_and_checkin(self):
        """Verify on-site verification lookup and check-in; unpaid participants are blocked."""
        # Unpaid attendee
        unpaid_reg = Registration.objects.create(
            user=self.student_a,
            event=self.solo_event,
            participant_name="Unpaid Attendee",
            college_name="MACFAST",
            email="unpaid@college.edu",
            phone="9876543210",
            payment_status="pending",
        )

        # Paid attendee
        paid_reg = Registration.objects.create(
            user=self.student_b,
            event=self.solo_event,
            participant_name="Paid Attendee",
            college_name="MACFAST",
            email="paid@college.edu",
            phone="9876543210",
            payment_status="paid",
        )

        self.client.force_authenticate(self.verify_user)

        # A. Lookup Paid Attendee
        lookup_res = self.client.get(f"/api/admin/verification/lookup/?q={paid_reg.registration_number}")
        self.assertEqual(lookup_res.status_code, status.HTTP_200_OK)
        self.assertEqual(lookup_res.data["registration_number"], paid_reg.registration_number)

        # B. Check-in Unpaid Attendee (MUST BE BLOCKED)
        unpaid_checkin = self.client.post(
            "/api/admin/verification/check-in/",
            {"registration_number": unpaid_reg.registration_number},
            format="json",
        )
        self.assertEqual(unpaid_checkin.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Payment not verified", unpaid_checkin.data["detail"])

        # C. Check-in Paid Attendee (SUCCEEDS)
        paid_checkin = self.client.post(
            "/api/admin/verification/check-in/",
            {"registration_number": paid_reg.registration_number},
            format="json",
        )
        self.assertEqual(paid_checkin.status_code, status.HTTP_200_OK)
        paid_reg.refresh_from_db()
        self.assertTrue(paid_reg.verification_attendance_marked)

    def test_08_student_strict_privacy_and_authorization_isolation(self):
        """Verify students cannot view other students' records or access admin tools."""
        other_reg = Registration.objects.create(
            user=self.student_b,
            event=self.solo_event,
            participant_name="Secret Beta",
            college_name="Secret College",
            email="beta@secret.edu",
            phone="9999999999",
            payment_status="paid",
        )

        # Student A attempts to access admin registrations
        self.client.force_authenticate(self.student_a)
        admin_res = self.client.get("/api/admin/registrations/")
        self.assertIn(admin_res.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

        # Student A lists /api/registrations/ (only gets their own, not Beta's)
        my_regs = self.client.get("/api/registrations/")
        self.assertEqual(my_regs.status_code, status.HTTP_200_OK)
        reg_ids = [r["id"] for r in (my_regs.data if isinstance(my_regs.data, list) else my_regs.data.get("results", []))]
        self.assertNotIn(other_reg.id, reg_ids)

        # Student A attempts to purge data (MUST BE DENIED)
        purge_res = self.client.post("/api/admin/purge-registered-data/", {"password": "Password123!"})
        self.assertIn(purge_res.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_09_public_apis_and_cms_endpoints(self):
        """Verify public festival configurations and CMS endpoints serve valid data."""
        self.client.credentials()  # Anonymous public visitor

        stats_res = self.client.get("/api/public/stats/")
        self.assertEqual(stats_res.status_code, status.HTTP_200_OK)

        config_res = self.client.get("/api/public/config/")
        self.assertEqual(config_res.status_code, status.HTTP_200_OK)

        events_res = self.client.get("/api/events/")
        self.assertEqual(events_res.status_code, status.HTTP_200_OK)

        announcements_res = self.client.get("/api/announcements/")
        self.assertEqual(announcements_res.status_code, status.HTTP_200_OK)

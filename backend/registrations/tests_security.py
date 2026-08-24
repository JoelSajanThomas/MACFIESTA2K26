"""Focused security / ownership tests for MacFiesta Pro."""

from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from accounts.models import StaffProfile
from accounts.permissions import user_modules
from events.models import Event
from registrations.models import Registration
from registrations.signing import resolve_registration_lookup, sign_registration_number


class SecurityHardeningTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.student_a = User.objects.create_user(
            "studenta", email="studenta@example.com", password="TestPass123!"
        )
        self.student_b = User.objects.create_user(
            "studentb", email="studentb@example.com", password="TestPass123!"
        )
        self.staff = User.objects.create_user("eventdesk", password="TestPass123!", is_staff=True)
        StaffProfile.objects.create(user=self.staff, committee="event", must_change_password=False)
        self.orphan_staff = User.objects.create_user("orphan", password="TestPass123!", is_staff=True)

        self.event = Event.objects.create(
            title="Coding Challenge",
            slug="coding-challenge-sec",
            category="tech",
            audience="college",
            department="Tech Zone",
            description="Security test event",
            venue="TBD",
            event_date=timezone.localdate(),
            event_time=timezone.now().time().replace(microsecond=0),
            max_participants=10,
            registration_fee=100,
            is_registration_open=True,
        )

        self.reg_a = Registration.objects.create(
            user=self.student_a,
            event=self.event,
            participant_name="Student A",
            college_name="College A",
            email="a@example.com",
            phone="9999999999",
            payment_status="paid",
            approval_status="approved",
        )

    def test_student_cannot_access_other_registration(self):
        self.client.force_authenticate(self.student_b)
        res = self.client.get(f"/api/registrations/{self.reg_a.id}/")
        self.assertEqual(res.status_code, 404)

    def test_student_cannot_create_event(self):
        self.client.force_authenticate(self.student_a)
        res = self.client.post(
            "/api/events/",
            {
                "title": "Hack",
                "slug": "hack-event",
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
        self.assertIn(res.status_code, (401, 403))

    def test_cannot_delete_event_with_registrations(self):
        self.client.force_authenticate(self.staff)
        res = self.client.delete(f"/api/events/{self.event.id}/")
        self.assertEqual(res.status_code, 409)
        self.assertTrue(Event.objects.filter(pk=self.event.id).exists())

    def test_orphan_staff_has_no_modules(self):
        self.assertEqual(user_modules(self.orphan_staff), [])

    def test_unregistered_email_cannot_request_reset(self):
        res = self.client.post(
            "/api/auth/password-reset/",
            {"email": "nonexistent_user@example.com"},
            format="json",
        )
        self.assertEqual(res.status_code, 404)
        body = res.json() if hasattr(res, "json") else res.data
        self.assertTrue(body.get("not_registered"))

    def test_password_reset_does_not_leak_token(self):
        res = self.client.post(
            "/api/auth/password-reset/",
            {"email": "studenta@example.com"},
            format="json",
        )
        self.assertEqual(res.status_code, 200)
        body = res.json() if hasattr(res, "json") else res.data
        self.assertNotIn("debug_reset_path", body)
        self.assertNotIn("token", body)
        self.assertNotIn("uid", body)
        self.assertNotIn("otp", body)
        self.assertTrue(body.get("otp_required"))

    def test_password_reset_otp_confirm_hashes_password(self):
        from django.contrib.auth.hashers import check_password
        from django.core.cache import cache
        from django.contrib.auth.hashers import make_password

        email = "studenta@example.com"
        cache.set("macfiesta:pwd_otp:studenta@example.com", make_password("123456"), timeout=600)
        res = self.client.post(
            "/api/auth/password-reset/confirm/",
            {
                "email": email,
                "otp": "123456",
                "password": "NewSecurePass9!",
                "password_confirm": "NewSecurePass9!",
            },
            format="json",
        )
        self.assertEqual(res.status_code, 200)
        self.student_a.refresh_from_db()
        self.assertTrue(check_password("NewSecurePass9!", self.student_a.password))
        self.assertFalse(self.student_a.password.startswith("NewSecure"))  # hashed, not plain

    def test_signup_password_is_hashed(self):
        from django.contrib.auth.hashers import check_password
        from django.contrib.auth.models import User

        res = self.client.post(
            "/api/auth/register/",
            {
                "full_name": "Hash User",
                "college_name": "Test College",
                "phone": "9876543210",
                "email": "hashuser@example.com",
                "password": "HashPass123!",
                "password_confirm": "HashPass123!",
            },
            format="json",
        )
        self.assertEqual(res.status_code, 201)
        body = res.json() if hasattr(res, "json") else res.data
        self.assertNotIn("password", body)
        self.assertNotIn("password", body.get("user") or {})
        user = User.objects.get(email="hashuser@example.com")
        self.assertEqual(user.username, "hashuser@example.com")
        self.assertTrue(user.password.startswith("pbkdf2_"))
        self.assertTrue(check_password("HashPass123!", user.password))
        self.assertNotEqual(user.password, "HashPass123!")
    def test_signed_pass_token_resolves(self):
        from registrations.signing import unsign_registration_number

        token = sign_registration_number(self.reg_a.registration_number)
        self.assertEqual(
            resolve_registration_lookup(token),
            self.reg_a.registration_number,
        )
        self.assertIsNone(unsign_registration_number("forged:token:value"))

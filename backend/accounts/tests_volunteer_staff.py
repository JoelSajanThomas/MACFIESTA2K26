"""Volunteer staff account management + email login."""

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import StaffProfile
from accounts.staff_views import VOLUNTEER_COMMITTEES


def _core():
    user = User.objects.create_user("coreadmin", password="CorePass123!", is_staff=True, is_superuser=True)
    StaffProfile.objects.create(user=user, committee="core", must_change_password=False)
    return user


class VolunteerStaffApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.core = _core()

    def test_core_can_create_volunteer(self):
        self.client.force_authenticate(self.core)
        res = self.client.post(
            "/api/admin/staff/",
            {
                "username": "finance_test",
                "email": "finance_test@example.com",
                "display_name": "Finance Test",
                "phone": "9999999999",
                "committee": "finance",
                "temporary_password": "TempPass123!",
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(res.status_code, 201, res.data)
        self.assertEqual(res.data["committee"], "finance")
        self.assertTrue(res.data["must_change_password"])
        self.assertNotIn("password", res.data)
        self.assertNotIn("temporary_password", res.data)

        user = User.objects.get(username="finance_test")
        self.assertTrue(user.is_staff)
        self.assertTrue(user.check_password("TempPass123!"))
        self.assertEqual(user.staff_profile.committee, "finance")

    def test_student_cannot_create_volunteer(self):
        student = User.objects.create_user("stud", password="TestPass123!")
        self.client.force_authenticate(student)
        res = self.client.post(
            "/api/admin/staff/",
            {
                "username": "x",
                "display_name": "X",
                "committee": "food",
                "temporary_password": "TempPass123!",
            },
            format="json",
        )
        self.assertIn(res.status_code, (401, 403))

    def test_finance_volunteer_cannot_create_staff(self):
        vol = User.objects.create_user("finvol", password="TestPass123!", is_staff=True)
        StaffProfile.objects.create(user=vol, committee="finance", must_change_password=False)
        self.client.force_authenticate(vol)
        res = self.client.post(
            "/api/admin/staff/",
            {
                "username": "hack",
                "display_name": "Hack",
                "committee": "event",
                "temporary_password": "TempPass123!",
            },
            format="json",
        )
        self.assertIn(res.status_code, (401, 403))

    def test_update_committee_and_deactivate(self):
        self.client.force_authenticate(self.core)
        create = self.client.post(
            "/api/admin/staff/",
            {
                "username": "food_test",
                "display_name": "Food Test",
                "committee": "food",
                "temporary_password": "TempPass123!",
            },
            format="json",
        )
        pk = create.data["id"]
        patch = self.client.patch(
            f"/api/admin/staff/{pk}/",
            {"committee": "hospitality", "is_active": False},
            format="json",
        )
        self.assertEqual(patch.status_code, 200)
        self.assertEqual(patch.data["committee"], "hospitality")
        self.assertFalse(patch.data["is_active"])

    def test_email_login_works(self):
        user = User.objects.create_user(
            "event_test",
            email="event_test@example.com",
            password="TempPass123!",
            is_staff=True,
        )
        StaffProfile.objects.create(user=user, committee="event", must_change_password=False)
        res = self.client.post(
            "/api/auth/login/",
            {"username": "event_test@example.com", "password": "TempPass123!"},
            format="json",
        )
        self.assertEqual(res.status_code, 200)
        self.assertIn("access", res.data)

    def test_volunteer_committees_exclude_core_from_volunteer_set(self):
        self.assertNotIn("core", VOLUNTEER_COMMITTEES)
        self.assertEqual(len(VOLUNTEER_COMMITTEES), 9)

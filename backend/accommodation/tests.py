from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from accounts.models import StaffProfile
from accommodation.models import Hostel, AccommodationBooking


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class AccommodationCapacityAndDeskTests(TestCase):
    def setUp(self):
        self.student = User.objects.create_user("student1", "student@test.com", "pass12345")
        self.hosp = User.objects.create_user("hosp1", "hosp@test.com", "pass12345", is_staff=True)
        StaffProfile.objects.create(user=self.hosp, committee="hospitality")
        self.hostel = Hostel.objects.create(
            name="St. Thomas Mens Hostel",
            slug="st-thomas-mens-hostel",
            gender="male",
            warden_name="Warden",
            warden_phone="9876543210",
            available_beds=50,
            total_capacity=50,
        )
        self.payload = {
            "hostel": self.hostel.id,
            "full_name": "Test Student",
            "email": "student@test.com",
            "phone": "9876543210",
            "college": "MACFAST",
            "gender": "male",
            "persons_count": 1,
            "check_in_date": "2026-09-24",
            "check_out_date": "2026-09-26",
            "payment_amount": 700,
        }
        self.client = APIClient()

    def _book(self, n=1):
        self.client.force_authenticate(self.student)
        payload = {**self.payload, "persons_count": n}
        return self.client.post("/api/accommodation/bookings/", payload, format="json")

    def test_booking_holds_a_bed_immediately(self):
        res = self._book()
        self.assertEqual(res.status_code, 201, res.data)
        self.assertEqual(res.data["status"], "pending")
        self.hostel.refresh_from_db()
        self.assertEqual(self.hostel.beds_remaining(), 49)

    def test_hostel_closes_after_capacity(self):
        self.hostel.total_capacity = 2
        self.hostel.available_beds = 2
        self.hostel.save()
        self.assertEqual(self._book().status_code, 201)
        self.assertEqual(self._book().status_code, 201)
        full = self._book()
        self.assertEqual(full.status_code, 400)
        self.assertEqual(self.hostel.beds_remaining(), 0)

    def test_hospitality_marks_allocation_without_second_bed_take(self):
        data = self._book().data
        self.client.force_authenticate(self.hosp)
        res = self.client.post(
            f"/api/accommodation/bookings/{data['id']}/approve/",
            {"allocated_room": "A-12"},
            format="json",
        )
        self.assertEqual(res.status_code, 200, res.data)
        self.assertEqual(res.data["status"], "allocated")
        self.assertEqual(res.data["allocated_room"], "A-12")
        self.assertEqual(self.hostel.beds_remaining(), 49)

    def test_hospitality_cancel_frees_bed(self):
        data = self._book().data
        self.client.force_authenticate(self.hosp)
        res = self.client.post(
            f"/api/accommodation/bookings/{data['id']}/reject/",
            {"admin_notes": "Duplicate"},
            format="json",
        )
        self.assertEqual(res.status_code, 200, res.data)
        self.assertEqual(res.data["status"], "cancelled")
        self.assertEqual(self.hostel.beds_remaining(), 50)
        self.assertEqual(AccommodationBooking.objects.get(id=data["id"]).status, "cancelled")

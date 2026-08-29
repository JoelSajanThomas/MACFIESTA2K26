from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import Hostel, AccommodationBooking
from accounts.models import StaffProfile

User = get_user_model()


class AccommodationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.hostel = Hostel.objects.create(
            name="St. Thomas Hostel",
            slug="st-thomas",
            gender="male",
            hostel_type="Campus Mens Hostel",
            location="Block A",
            tariff_per_night=250,
            total_capacity=100,
            available_beds=50,
            is_active=True,
        )

        self.student = User.objects.create_user(
            username="student@macfast.org",
            email="student@macfast.org",
            password="TestPassword123!",
            first_name="Student",
            last_name="User",
        )

        self.staff_user = User.objects.create_user(
            username="staff_hosp",
            email="hosp@macfast.org",
            password="TestPassword123!",
            is_staff=True,
        )
        StaffProfile.objects.create(
            user=self.staff_user,
            committee="hospitality",
            display_name="Hospitality Officer",
        )

    def test_list_hostels_public(self):
        res = self.client.get("/api/hostels/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res.data), 1)

    def test_create_booking_and_protect_status(self):
        self.client.force_authenticate(user=self.student)
        payload = {
            "hostel": self.hostel.id,
            "full_name": "Student User",
            "email": "student@macfast.org",
            "phone": "9876543210",
            "college": "MACFAST",
            "gender": "male",
            "persons_count": 1,
            "check_in_date": "2026-03-20",
            "check_out_date": "2026-03-22",
            "status": "confirmed",  # Student trying to bypass status
            "allocated_room": "VIP 1",
        }
        res = self.client.post("/api/accommodation/bookings/", payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        booking = AccommodationBooking.objects.get(pk=res.data["id"])
        # Must default to pending and not allow student to set confirmed/room
        self.assertEqual(booking.status, "pending")
        self.assertEqual(booking.allocated_room, "")

    def test_staff_hospitality_stats_and_update(self):
        booking = AccommodationBooking.objects.create(
            user=self.student,
            hostel=self.hostel,
            full_name="Student User",
            email="student@macfast.org",
            phone="9876543210",
            college="MACFAST",
            gender="male",
            persons_count=1,
            check_in_date="2026-03-20",
            check_out_date="2026-03-22",
            status="pending",
        )

        # Student cannot access hospitality stats
        self.client.force_authenticate(user=self.student)
        res = self.client.get("/api/admin/hospitality/stats/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Staff with hospitality module can access stats
        self.client.force_authenticate(user=self.staff_user)
        res = self.client.get("/api/admin/hospitality/stats/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["pending"], 1)

        # Staff can allocate room and confirm
        patch_res = self.client.patch(
            f"/api/accommodation/bookings/{booking.id}/",
            {"status": "allocated", "allocated_room": "Room 204"},
        )
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        booking.refresh_from_db()
        self.assertEqual(booking.status, "allocated")
        self.assertEqual(booking.allocated_room, "Room 204")

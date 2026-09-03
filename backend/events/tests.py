from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from accounts.models import StaffProfile
from accommodation.models import Hostel, AccommodationBooking
from events.models import Event
from registrations.models import Registration
from registrations.signing import sign_registration_number
from results.models import Result
from cms.models import FAQ

User = get_user_model()


class ComprehensiveAuditTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.superuser = User.objects.create_superuser(
            username="superadmin",
            email="super@macfast.org",
            password="SuperPassword123!",
        )

        self.event_staff = User.objects.create_user(
            username="event_officer",
            email="event@macfast.org",
            password="EventPassword123!",
            is_staff=True,
        )
        StaffProfile.objects.create(
            user=self.event_staff,
            committee="event",
            display_name="Event Head",
        )

        self.hosp_staff = User.objects.create_user(
            username="hosp_officer",
            email="hosp_officer@macfast.org",
            password="HospPassword123!",
            is_staff=True,
        )
        StaffProfile.objects.create(
            user=self.hosp_staff,
            committee="hospitality",
            display_name="Hospitality Head",
        )

        self.verify_staff = User.objects.create_user(
            username="verify_officer",
            email="verify@macfast.org",
            password="VerifyPassword123!",
            is_staff=True,
        )
        StaffProfile.objects.create(
            user=self.verify_staff,
            committee="verification",
            display_name="Verification Desk",
        )

        self.publicity_staff = User.objects.create_user(
            username="pub_officer",
            email="pub@macfast.org",
            password="PubPassword123!",
            is_staff=True,
        )
        StaffProfile.objects.create(
            user=self.publicity_staff,
            committee="publicity",
            display_name="Publicity Head",
        )

        self.student = User.objects.create_user(
            username="student_test@macfast.org",
            email="student_test@macfast.org",
            password="StudentPassword123!",
            first_name="Iron",
            last_name="Man",
        )

        self.event = Event.objects.create(
            title="Vibe Coding Hackathon",
            slug="vibe-coding-hackathon",
            category="technical",
            description="Build next-gen AI applications.",
            venue="APJ Hall",
            event_date=timezone.localdate() + timezone.timedelta(days=10),
            event_time="10:00:00",
            max_participants=50,
            min_team_size=1,
            max_team_size=4,
            registration_fee=150,
            is_registration_open=True,
        )

        self.hostel = Hostel.objects.create(
            name="Campus Annex",
            slug="campus-annex",
            gender="male",
            tariff_per_night=200,
            total_capacity=50,
            available_beds=30,
            is_active=True,
        )

    def test_event_auto_slug_on_creation(self):
        self.client.force_authenticate(user=self.event_staff)
        payload = {
            "title": "Quantum Robowars 2026",
            "category": "tech",
            "description": "Robotics battle in an octagonal cage.",
            "venue": "Main Arena",
            "event_date": str(timezone.localdate() + timezone.timedelta(days=12)),
            "event_time": "11:00:00",
            "max_participants": 30,
            "min_team_size": 2,
            "max_team_size": 5,
            "registration_fee": 300,
            "is_registration_open": True,
        }
        res = self.client.post("/api/events/", payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["slug"], "quantum-robowars-2026")

    def test_event_invalid_team_size_rejected(self):
        self.client.force_authenticate(user=self.event_staff)
        payload = {
            "title": "Bad Team Event",
            "category": "general",
            "description": "Invalid min/max team size.",
            "venue": "Hall A",
            "event_date": str(timezone.localdate() + timezone.timedelta(days=10)),
            "event_time": "10:00:00",
            "max_participants": 20,
            "min_team_size": 5,
            "max_team_size": 2,
            "registration_fee": 0,
            "is_registration_open": True,
        }
        res = self.client.post("/api/events/", payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("min_team_size", res.data)

    def test_accommodation_booking_date_validation(self):
        self.client.force_authenticate(user=self.student)
        payload = {
            "hostel": self.hostel.id,
            "full_name": "Tony Stark",
            "email": "tony@stark.com",
            "phone": "9876543210",
            "college": "MIT",
            "gender": "male",
            "persons_count": 1,
            "check_in_date": "2026-09-25",
            "check_out_date": "2026-09-20",
        }
        res = self.client.post("/api/accommodation/bookings/", payload)
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("check_out_date", res.data)

    def test_non_hospitality_staff_cannot_mutate_bookings(self):
        booking = AccommodationBooking.objects.create(
            user=self.student,
            hostel=self.hostel,
            full_name="Tony Stark",
            email="tony@stark.com",
            phone="9876543210",
            college="MIT",
            gender="male",
            persons_count=1,
            check_in_date="2026-09-24",
            check_out_date="2026-09-26",
            status="pending",
        )

        self.client.force_authenticate(user=self.publicity_staff)
        patch_res = self.client.patch(
            f"/api/accommodation/bookings/{booking.id}/",
            {"status": "allocated"},
        )
        self.assertEqual(patch_res.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user=self.hosp_staff)
        ok_res = self.client.patch(
            f"/api/accommodation/bookings/{booking.id}/",
            {"status": "allocated", "allocated_room": "Annex 101"},
        )
        self.assertEqual(ok_res.status_code, status.HTTP_200_OK)
        booking.refresh_from_db()
        self.assertEqual(booking.status, "allocated")

    def test_unpaid_registration_check_in_blocked(self):
        reg = Registration.objects.create(
            user=self.student,
            event=self.event,
            participant_name="Bruce Banner",
            college_name="Culver University",
            email="bruce@banner.org",
            phone="9876543211",
            payment_status="pending",
            payment_amount=150,
            approval_status="pending",
        )

        signed_token = sign_registration_number(reg.registration_number)
        self.client.force_authenticate(user=self.verify_staff)

        lookup_res = self.client.get(f"/api/admin/verification/lookup/?q={signed_token}")
        self.assertEqual(lookup_res.status_code, status.HTTP_200_OK)
        self.assertEqual(lookup_res.data["verification_status"], "PENDING")

        checkin_res = self.client.post(
            "/api/admin/verification/check-in/",
            {"registration_number": reg.registration_number},
        )
        self.assertEqual(checkin_res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Payment not verified", checkin_res.data.get("detail", ""))

    def test_paid_registration_check_in_succeeds_and_prevents_duplicate(self):
        reg = Registration.objects.create(
            user=self.student,
            event=self.event,
            participant_name="Steve Rogers",
            college_name="Brooklyn Academy",
            email="steve@avengers.org",
            phone="9876543212",
            payment_status="paid",
            payment_amount=150,
            approval_status="approved",
        )

        signed_token = sign_registration_number(reg.registration_number)
        self.client.force_authenticate(user=self.verify_staff)

        res1 = self.client.post(
            "/api/admin/verification/check-in/",
            {"token": signed_token},
        )
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        reg.refresh_from_db()
        self.assertTrue(reg.attendance_marked)

        # Second check-in is idempotent and returns 200 with attendance_marked=True
        res2 = self.client.post(
            "/api/admin/verification/check-in/",
            {"token": signed_token},
        )
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertTrue(res2.data["attendance_marked"])

    def test_unpublished_result_hidden_from_public(self):
        self.event.is_result_published = False
        self.event.save()

        result = Result.objects.create(
            event=self.event,
            position="first",
            participant_name="Natasha Romanoff",
            college_name="KGB Academy",
        )

        res = self.client.get("/api/results/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 0)

        cert_res = self.client.get(f"/api/certificates/{result.id}/")
        self.assertEqual(cert_res.status_code, status.HTTP_404_NOT_FOUND)

        self.event.is_result_published = True
        self.event.save()

        pub_res = self.client.get("/api/results/")
        self.assertEqual(pub_res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(pub_res.data), 1)

        cert_ok = self.client.get(f"/api/certificates/{result.id}/")
        self.assertEqual(cert_ok.status_code, status.HTTP_200_OK)
        self.assertEqual(cert_ok.data["participant_name"], "Natasha Romanoff")

    def test_cms_highlights_and_faqs(self):
        FAQ.objects.create(question="Is lunch provided?", answer="Yes, food coupons are available.", is_active=True)
        res = self.client.get("/api/cms/faqs/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)

        self.client.force_authenticate(user=self.student)
        fail_post = self.client.post("/api/cms/highlights/", {"title": "Test", "description": "Test"})
        self.assertEqual(fail_post.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user=self.publicity_staff)
        ok_post = self.client.post(
            "/api/cms/highlights/",
            {"title": "DJ Night", "description": "Electrifying live DJ set", "order": 1, "is_active": True},
        )
        self.assertEqual(ok_post.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ok_post.data["title"], "DJ Night")

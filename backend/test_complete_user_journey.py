"""
MacFiesta Pro — Full End-to-End User Journey Audit & Certification Harness
Simulates complete real-world participant, team captain, and committee journeys.
"""

import os
import sys
import json
import time
import uuid
from decimal import Decimal
import django

# Setup Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.db import connection, transaction
from django.core.files.uploadedfile import SimpleUploadedFile
from django.conf import settings
from django.core.cache import cache

from events.models import Event
from registrations.models import Registration, TeamMember, Institution
from accommodation.models import Hostel, AccommodationBooking
from results.models import Result
from announcements.models import Announcement
from gallery.models import GalleryImage
from cms.models import SiteSetting, FAQ, Sponsor, FestivalRule
from accounts.models import StaffProfile, AuditLog

User = get_user_model()

TINY_PNG = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
    b"\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\xff\xff"
    b"?\x00\x05\xfe\x02\xfe\r\xef\x0c\x84\x00\x00\x00\x00IEND\xaeB`\x82"
)

class UserJourneyTester:
    def __init__(self):
        self.client = Client()
        self.results = {
            "passed": 0,
            "failed": 0,
            "checks": [],
            "journey_scores": {},
        }
        self.test_users = []
        self.test_regs = []
        self.test_events = []

    def record(self, journey, check_name, status, details="", duration_ms=0):
        self.results["checks"].append({
            "journey": journey,
            "check": check_name,
            "status": status,
            "details": details,
            "duration_ms": round(duration_ms, 2),
        })
        if status == "PASS":
            self.results["passed"] += 1
            print(f"  [\033[92mPASS\033[0m] [{journey}] {check_name} ({duration_ms:.1f}ms)")
        else:
            self.results["failed"] += 1
            print(f"  [\033[91mFAIL\033[0m] [{journey}] {check_name}: {details}")

    # =========================================================================
    # JOURNEY 1: Public Visitor Experience (A to Z)
    # =========================================================================
    def test_journey_1_public(self):
        print("\n=== Journey 1: Public Visitor Experience ===")
        # 1. Fest Stats
        t0 = time.time()
        res = self.client.get("/api/public/stats/")
        self.record("Public", "Fest Public Statistics API", "PASS" if res.status_code == 200 else "FAIL", f"Status {res.status_code}", (time.time() - t0) * 1000)

        # 2. Public Config
        t0 = time.time()
        res = self.client.get("/api/public/config/")
        self.record("Public", "Fest Public Config API", "PASS" if res.status_code == 200 and "payment" in res.json() else "FAIL", f"Status {res.status_code}", (time.time() - t0) * 1000)

        # 3. Events Catalog & Filters
        t0 = time.time()
        res = self.client.get("/api/events/")
        events = res.json().get("results", res.json()) if isinstance(res.json(), dict) else res.json()
        self.record("Public", "Events Catalog Feed", "PASS" if res.status_code == 200 and len(events) > 0 else "FAIL", f"Loaded {len(events)} events", (time.time() - t0) * 1000)

        # 4. Filter by Category
        t0 = time.time()
        res = self.client.get("/api/events/?category=tech")
        self.record("Public", "Events Category Filter", "PASS" if res.status_code == 200 else "FAIL", f"Status {res.status_code}", (time.time() - t0) * 1000)

        # 5. Search Events
        t0 = time.time()
        res = self.client.get("/api/events/?search=a")
        self.record("Public", "Events Search Filter", "PASS" if res.status_code == 200 else "FAIL", f"Status {res.status_code}", (time.time() - t0) * 1000)

        # 6. Single Event Detail
        if events:
            ev_id = events[0]["id"]
            t0 = time.time()
            res = self.client.get(f"/api/events/{ev_id}/")
            self.record("Public", "Single Event Detail View", "PASS" if res.status_code == 200 else "FAIL", f"Status {res.status_code}", (time.time() - t0) * 1000)

        # 7. Announcements Feed
        t0 = time.time()
        res = self.client.get("/api/announcements/")
        self.record("Public", "Live Announcements Feed", "PASS" if res.status_code == 200 else "FAIL", f"Status {res.status_code}", (time.time() - t0) * 1000)

        # 8. Results & Scoreboard
        t0 = time.time()
        res = self.client.get("/api/results/")
        self.record("Public", "Event Results Feed", "PASS" if res.status_code == 200 else "FAIL", f"Status {res.status_code}", (time.time() - t0) * 1000)

        # 9. Gallery Feed
        t0 = time.time()
        res = self.client.get("/api/gallery/")
        self.record("Public", "Gallery Images Feed", "PASS" if res.status_code == 200 else "FAIL", f"Status {res.status_code}", (time.time() - t0) * 1000)

        # 10. CMS Site Settings & Brochure
        t0 = time.time()
        res = self.client.get("/api/cms/site-settings/")
        self.record("Public", "CMS Site Settings (Brochure & Theme)", "PASS" if res.status_code == 200 else "FAIL", f"Status {res.status_code}", (time.time() - t0) * 1000)

        # 11. FAQs & Rules
        t0 = time.time()
        res = self.client.get("/api/cms/faqs/")
        self.record("Public", "CMS FAQs Endpoint", "PASS" if res.status_code == 200 else "FAIL", f"Status {res.status_code}", (time.time() - t0) * 1000)

        t0 = time.time()
        res = self.client.get("/api/cms/rules/")
        self.record("Public", "CMS Festival Rules Endpoint", "PASS" if res.status_code == 200 else "FAIL", f"Status {res.status_code}", (time.time() - t0) * 1000)

    # =========================================================================
    # JOURNEY 2: User Onboarding, Authentication & OTP Lifecycle
    # =========================================================================
    def test_journey_2_auth(self):
        print("\n=== Journey 2: User Onboarding & Auth Lifecycle ===")
        unique = uuid.uuid4().hex[:6]
        email = f"journey_student_{unique}@macfiesta.test"
        pwd = f"MarvelHero123!"
        new_pwd = f"NewHeroPass123!"

        # 1. Participant Registration
        t0 = time.time()
        res = self.client.post("/api/auth/register/", {
            "full_name": f"Student Captain {unique}",
            "email": email,
            "phone": "9876543210",
            "gender": "male",
            "college_name": "MACFAST Tiruvalla",
            "password": pwd,
            "password_confirm": pwd,
        }, content_type="application/json")
        lat = (time.time() - t0) * 1000
        if res.status_code == 201 and "access" in res.json():
            self.record("Auth", "Student Account Registration", "PASS", "HTTP 201 with JWT pair", lat)
            u = User.objects.filter(email=email).first()
            if u:
                self.test_users.append(u.id)
                self.current_user = u
        else:
            self.record("Auth", "Student Account Registration", "FAIL", f"Status {res.status_code}: {res.content.decode()}")
            return

        # 2. Login with Email
        t0 = time.time()
        res = self.client.post("/api/auth/login/", {"username": email, "password": pwd}, content_type="application/json")
        lat = (time.time() - t0) * 1000
        if res.status_code == 200 and "access" in res.json():
            self.user_token = res.json()["access"]
            self.user_refresh = res.json()["refresh"]
            self.record("Auth", "JWT Login via Email", "PASS", "HTTP 200 with tokens", lat)
        else:
            self.record("Auth", "JWT Login via Email", "FAIL", f"Status {res.status_code}")
            return

        # 3. Token Refresh
        t0 = time.time()
        res = self.client.post("/api/auth/refresh/", {"refresh": self.user_refresh}, content_type="application/json")
        lat = (time.time() - t0) * 1000
        if res.status_code == 200 and "access" in res.json():
            self.record("Auth", "JWT Access Token Refresh", "PASS", "New access token obtained", lat)
            self.user_token = res.json()["access"]
        else:
            self.record("Auth", "JWT Access Token Refresh", "FAIL", f"Status {res.status_code}")

        # 4. Identity & Profile Verification (/api/auth/me/)
        t0 = time.time()
        res = self.client.get("/api/auth/me/", HTTP_AUTHORIZATION=f"Bearer {self.user_token}")
        lat = (time.time() - t0) * 1000
        if res.status_code == 200 and res.json()["email"] == email:
            self.record("Auth", "User Profile Identity (/api/auth/me/)", "PASS", "Profile verified", lat)
        else:
            self.record("Auth", "User Profile Identity (/api/auth/me/)", "FAIL", f"Status {res.status_code}")

        # 5. Authenticated Change Password
        t0 = time.time()
        res = self.client.post("/api/auth/change-password/", {
            "current_password": pwd,
            "password": new_pwd,
            "password_confirm": new_pwd,
        }, content_type="application/json", HTTP_AUTHORIZATION=f"Bearer {self.user_token}")
        lat = (time.time() - t0) * 1000
        if res.status_code == 200:
            self.record("Auth", "Authenticated Change Password", "PASS", "Password successfully changed", lat)
        else:
            self.record("Auth", "Authenticated Change Password", "FAIL", f"Status {res.status_code}: {res.content.decode()}")

        # 6. Re-login with New Password
        t0 = time.time()
        res = self.client.post("/api/auth/login/", {"username": email, "password": new_pwd}, content_type="application/json")
        lat = (time.time() - t0) * 1000
        if res.status_code == 200:
            self.user_token = res.json()["access"]
            self.record("Auth", "Re-Login with New Password", "PASS", "Authenticated with updated credentials", lat)
        else:
            self.record("Auth", "Re-Login with New Password", "FAIL", f"Status {res.status_code}")

    # =========================================================================
    # JOURNEY 3: Solo Event Registration, Meal Packages & Payment Proof
    # =========================================================================
    def test_journey_3_solo_registration(self):
        print("\n=== Journey 3: Solo Registration & Payment Flow ===")
        if not hasattr(self, "user_token"):
            print("Skipping: User token missing")
            return

        # Ensure we have a solo paid event
        event = Event.objects.filter(is_registration_open=True, max_team_size__lte=1, registration_fee__gt=0).first()
        if not event:
            unique_ev = uuid.uuid4().hex[:4]
            event = Event.objects.create(
                title=f"Solo Coding Quest {unique_ev}",
                slug=f"solo-quest-{unique_ev}",
                description="Solo test competition",
                min_team_size=1,
                max_team_size=1,
                registration_fee=Decimal("200.00"),
                is_registration_open=True,
                max_participants=100,
                audience="all",
                event_date="2026-09-24",
            )
            self.test_events.append(event.id)

        # 1. Register for Solo Event
        unique = uuid.uuid4().hex[:6]
        t0 = time.time()
        reg_payload = {
            "event": event.id,
            "college_name": "MACFAST Tiruvalla",
            "participant_name": f"Solo Challenger {unique}",
            "email": f"challenger_{unique}@macfiesta.test",
            "phone": "9876543210",
            "gender": "male",
            "food_preference": "veg",
            "needs_accommodation": False,
        }
        res = self.client.post("/api/registrations/", reg_payload, content_type="application/json", HTTP_AUTHORIZATION=f"Bearer {self.user_token}")
        lat = (time.time() - t0) * 1000
        if res.status_code == 201:
            reg_data = res.json()
            self.solo_reg_id = reg_data["id"]
            self.solo_reg_no = reg_data.get("registration_number")
            self.test_regs.append(self.solo_reg_id)
            self.record("Registration", "Solo Registration Creation", "PASS", f"Reg #{self.solo_reg_no} created (Fee: {reg_data.get('event_fee')})", lat)
        else:
            self.record("Registration", "Solo Registration Creation", "FAIL", f"Status {res.status_code}: {res.content.decode()}")
            return

        # 2. Upload Payment Proof + Transaction ID
        t0 = time.time()
        proof_img = SimpleUploadedFile("solo_utr.png", TINY_PNG, content_type="image/png")
        pay_res = self.client.post(
            f"/api/registrations/{self.solo_reg_id}/submit-payment/",
            {
                "payment_transaction_id": f"UTR{unique.upper()}12345",
                "payment_method": "upi_qr",
                "payment_proof": proof_img,
            },
            HTTP_AUTHORIZATION=f"Bearer {self.user_token}",
        )
        lat = (time.time() - t0) * 1000
        if pay_res.status_code == 200:
            self.record("Registration", "Submit Solo Payment Proof", "PASS", "Payment proof attached, status pending", lat)
        else:
            self.record("Registration", "Submit Solo Payment Proof", "FAIL", f"Status {pay_res.status_code}: {pay_res.content.decode()}")

    # =========================================================================
    # JOURNEY 4: Team Event Registration & Squad Management
    # =========================================================================
    def test_journey_4_team_registration(self):
        print("\n=== Journey 4: Team Registration & Squad Management ===")
        if not hasattr(self, "user_token"):
            return

        # Ensure we have a team event
        event = Event.objects.filter(is_registration_open=True, max_team_size__gt=1, registration_fee__gt=0).first()
        if not event:
            unique_ev = uuid.uuid4().hex[:4]
            event = Event.objects.create(
                title=f"Avengers Hackathon {unique_ev}",
                slug=f"avengers-hack-{unique_ev}",
                description="Team test hackathon",
                min_team_size=2,
                max_team_size=4,
                registration_fee=Decimal("500.00"),
                is_registration_open=True,
                max_participants=50,
                audience="all",
                event_date="2026-09-24",
            )
            self.test_events.append(event.id)

        # 1. Create Team Registration
        unique = uuid.uuid4().hex[:6]
        t0 = time.time()
        team_payload = {
            "event": event.id,
            "registration_type": "team",
            "team_name": f"StarkSquad_{unique}",
            "college_name": "MACFAST Tiruvalla",
            "participant_name": f"Captain {unique}",
            "email": f"captain_{unique}@macfiesta.test",
            "phone": "9876543210",
            "gender": "female",
            "food_preference": "none",
            "needs_accommodation": False,
        }
        res = self.client.post("/api/registrations/", team_payload, content_type="application/json", HTTP_AUTHORIZATION=f"Bearer {self.user_token}")
        lat = (time.time() - t0) * 1000
        if res.status_code == 201:
            team_reg = res.json()
            team_reg_id = team_reg["id"]
            self.test_regs.append(team_reg_id)
            self.record("Team", "Team Registration Creation", "PASS", f"Team #{team_reg.get('registration_number')} created", lat)
        else:
            self.record("Team", "Team Registration Creation", "FAIL", f"Status {res.status_code}: {res.content.decode()}")

    # =========================================================================
    # JOURNEY 5: Admin Committee Desks & Verification Flow
    # =========================================================================
    def test_journey_5_admin_operations(self):
        print("\n=== Journey 5: Admin Committee Operations & Verification ===")
        # 1. Admin Authentication
        t0 = time.time()
        login_res = self.client.post("/api/auth/login/", {"username": "admin", "password": "admin123"}, content_type="application/json")
        lat = (time.time() - t0) * 1000
        if login_res.status_code == 200:
            self.admin_token = login_res.json()["access"]
            self.record("Admin", "Super Admin Clearance Login", "PASS", "Authenticated with full permissions", lat)
        else:
            self.record("Admin", "Super Admin Clearance Login", "FAIL", f"Status {login_res.status_code}")
            return

        # 2. Executive Dashboard Stats
        t0 = time.time()
        stats_res = self.client.get("/api/dashboard/stats/", HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")
        lat = (time.time() - t0) * 1000
        if stats_res.status_code == 200 and "total_events" in stats_res.json():
            self.record("Admin", "Executive Dashboard Stats API", "PASS", f"Total regs: {stats_res.json().get('total_registrations')}", lat)
        else:
            self.record("Admin", "Executive Dashboard Stats API", "FAIL", f"Status {stats_res.status_code}")

        # 3. Finance Desk: Reconcile & Approve Solo Registration
        if hasattr(self, "solo_reg_id"):
            t0 = time.time()
            patch_res = self.client.patch(
                f"/api/admin/registrations/{self.solo_reg_id}/",
                {"approval_status": "approved", "payment_status": "paid"},
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {self.admin_token}",
            )
            lat = (time.time() - t0) * 1000
            if patch_res.status_code == 200 and patch_res.json().get("payment_status") == "paid":
                self.record("Admin", "Finance Desk Payment Approval", "PASS", f"Registration #{self.solo_reg_no} approved and locked", lat)
            else:
                self.record("Admin", "Finance Desk Payment Approval", "FAIL", f"Status {patch_res.status_code}")

            # 4. Verification Desk: Lookup Digital Pass
            t0 = time.time()
            look_res = self.client.get(
                f"/api/admin/verification/lookup/?q={self.solo_reg_no}",
                HTTP_AUTHORIZATION=f"Bearer {self.admin_token}",
            )
            lat = (time.time() - t0) * 1000
            if look_res.status_code == 200 and look_res.json().get("registration_number") == self.solo_reg_no:
                self.record("Admin", "Verification Desk QR Lookup", "PASS", f"Pass verified: {look_res.json().get('verification_status')}", lat)
            else:
                self.record("Admin", "Verification Desk QR Lookup", "FAIL", f"Status {look_res.status_code}")

            # 5. Verification Desk: Check-In Scan Execution
            t0 = time.time()
            check_res = self.client.post(
                "/api/admin/verification/check-in/",
                {"id": self.solo_reg_id, "registration_number": self.solo_reg_no},
                content_type="application/json",
                HTTP_AUTHORIZATION=f"Bearer {self.admin_token}",
            )
            lat = (time.time() - t0) * 1000
            if check_res.status_code == 200 and check_res.json().get("attendance_marked") is True:
                self.record("Admin", "Verification Desk Attendance Check-In", "PASS", "Attendance marked successfully", lat)
            else:
                self.record("Admin", "Verification Desk Attendance Check-In", "FAIL", f"Status {check_res.status_code}")

        # 6. Attendance Report API
        t0 = time.time()
        att_res = self.client.get("/api/admin/reports/attendance/", HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")
        lat = (time.time() - t0) * 1000
        if att_res.status_code == 200:
            self.record("Admin", "Attendance Roster Report", "PASS", f"Retrieved {len(att_res.json())} attendance entries", lat)
        else:
            self.record("Admin", "Attendance Roster Report", "FAIL", f"Status {att_res.status_code}")

        # 7. Immutable Audit Logs
        t0 = time.time()
        log_res = self.client.get("/api/admin/audit-logs/", HTTP_AUTHORIZATION=f"Bearer {self.admin_token}")
        lat = (time.time() - t0) * 1000
        if log_res.status_code == 200:
            self.record("Admin", "System Audit Trail Logging", "PASS", f"Retrieved {len(log_res.json())} log entries", lat)
        else:
            self.record("Admin", "System Audit Trail Logging", "FAIL", f"Status {log_res.status_code}")

    # =========================================================================
    # JOURNEY 6: Security, RBAC Gates & Fault Resilience
    # =========================================================================
    def test_journey_6_security(self):
        print("\n=== Journey 6: Security & Resilience Gates ===")
        # 1. Non-Staff Accessing Admin Portal -> 403
        if hasattr(self, "user_token"):
            t0 = time.time()
            res = self.client.get("/api/admin/audit-logs/", HTTP_AUTHORIZATION=f"Bearer {self.user_token}")
            lat = (time.time() - t0) * 1000
            self.record("Security", "RBAC Non-Staff Barrier", "PASS" if res.status_code == 403 else "FAIL", "HTTP 403 Forbidden enforced", lat)

        # 2. Tampered JWT Token -> 401
        t0 = time.time()
        res = self.client.get("/api/auth/me/", HTTP_AUTHORIZATION="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tampered.token")
        lat = (time.time() - t0) * 1000
        self.record("Security", "Tampered JWT Rejection", "PASS" if res.status_code == 401 else "FAIL", "HTTP 401 Unauthorized", lat)

        # 3. SQL Injection Immunity in Query Params
        t0 = time.time()
        res = self.client.get("/api/events/?search=' OR '1'='1")
        lat = (time.time() - t0) * 1000
        self.record("Security", "SQL Injection Parameter Immunity", "PASS" if res.status_code == 200 else "FAIL", "Sanitized via Django ORM", lat)

        # 4. Graceful 404 Route Handling
        t0 = time.time()
        res = self.client.get("/api/events/99999999/")
        lat = (time.time() - t0) * 1000
        self.record("Security", "Graceful 404 Not Found", "PASS" if res.status_code == 404 else "FAIL", "JSON 404 returned cleanly", lat)

    # =========================================================================
    # CLEANUP: Purge all test entities
    # =========================================================================
    def cleanup(self):
        print("\n=== Purging Ephemeral Test Data ===")
        if self.test_regs:
            TeamMember.objects.filter(registration_id__in=self.test_regs).delete()
            Registration.objects.filter(id__in=self.test_regs).delete()
            print(f"  Purged {len(self.test_regs)} test registrations.")

        if self.test_users:
            User.objects.filter(id__in=self.test_users).delete()
            print(f"  Purged {len(self.test_users)} test users.")

        if self.test_events:
            Event.objects.filter(id__in=self.test_events).delete()
            print(f"  Purged {len(self.test_events)} test events.")

    def run_all(self):
        self.test_journey_1_public()
        self.test_journey_2_auth()
        self.test_journey_3_solo_registration()
        self.test_journey_4_team_registration()
        self.test_journey_5_admin_operations()
        self.test_journey_6_security()
        self.cleanup()

        total = self.results["passed"] + self.results["failed"]
        rate = (self.results["passed"] / total * 100) if total > 0 else 0
        print(f"\n========================================================")
        print(f"USER JOURNEY AUDIT SUMMARY: {self.results['passed']}/{total} Passed ({rate:.1f}%)")
        print(f"========================================================\n")
        return self.results

if __name__ == "__main__":
    tester = UserJourneyTester()
    res = tester.run_all()
    sys.exit(0 if res["failed"] == 0 else 1)

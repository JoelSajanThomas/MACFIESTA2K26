"""
Comprehensive Automated Test Suite for Event Registration Checkout Flow.
Tests all 7 scenarios specified:
1. Only Solo Event selected.
2. Only Squad Event selected.
3. Multiple Solo Events selected.
4. Multiple Squad Events selected.
5. Solo + Squad selected together (Mixed).
6. Payment completion after each scenario.
7. Database records verification (Registration rows, TeamMember rows, counts, and types).
"""

from decimal import Decimal
from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from events.models import Event
from registrations.models import Registration, TeamMember


class RegistrationCheckoutMatrixTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="tony_stark",
            email="tony@starkindustries.com",
            password="IronManPassword123!",
            first_name="Tony",
            last_name="Stark",
        )

        future_date = (timezone.now() + timezone.timedelta(days=14)).date()

        # Solo Event 1 (Coding Challenge)
        self.solo_event_1 = Event.objects.create(
            title="The Flash: Code Rush",
            slug="coding-challenge",
            category="technical",
            event_date=future_date,
            registration_fee=Decimal("150.00"),
            min_team_size=1,
            max_team_size=1,
            max_participants=100,
            is_registration_open=True,
            status="published",
        )

        # Solo Event 2 (Photography)
        self.solo_event_2 = Event.objects.create(
            title="Spider-Verse: Frame Hunt",
            slug="photography",
            category="arts",
            event_date=future_date,
            registration_fee=Decimal("100.00"),
            min_team_size=1,
            max_team_size=1,
            max_participants=100,
            is_registration_open=True,
            status="published",
        )

        # Squad Event 1 (Hackathon, min=1, max=3)
        self.squad_event_1 = Event.objects.create(
            title="Avengers: Code Assemble",
            slug="hackathon",
            category="technical",
            event_date=future_date,
            registration_fee=Decimal("300.00"),
            min_team_size=1,
            max_team_size=3,
            max_participants=50,
            is_registration_open=True,
            status="published",
        )

        # Squad Event 2 (BGMI, min=3, max=4)
        self.squad_event_2 = Event.objects.create(
            title="Battle of Wakanda",
            slug="bgmi",
            category="esports",
            event_date=future_date,
            registration_fee=Decimal("400.00"),
            min_team_size=3,
            max_team_size=4,
            max_participants=50,
            is_registration_open=True,
            status="published",
        )

        self.client.force_authenticate(user=self.user)

    def test_01_only_solo_event_selected(self):
        """Scenario 1: Only Solo Event selected registers individual participant with 0 team members."""
        payload = {
            "events": [self.solo_event_1.id],
            "participant_name": "Tony Stark",
            "college_name": "MIT",
            "department": "Robotics",
            "phone": "9876543210",
            "email": "tony@starkindustries.com",
            "gender": "male",
        }
        res = self.client.post("/api/registrations/batch/", data=payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED, res.data)

        batch_id = res.data["payment_batch_id"]
        reg = Registration.objects.get(payment_batch_id=batch_id, event=self.solo_event_1)

        # Verification: individual type, blank team name, zero TeamMember records
        self.assertEqual(reg.registration_type, "individual")
        self.assertEqual(reg.team_name, "")
        self.assertEqual(reg.team_members.count(), 0)
        self.assertEqual(reg.payment_amount, Decimal("150.00"))

    def test_01b_solo_event_rejects_squad_members(self):
        """Backend validation: Solo event must reject any teammate submission."""
        payload = {
            "events": [self.solo_event_1.id],
            "participant_name": "Tony Stark",
            "college_name": "MIT",
            "phone": "9876543210",
            "email": "tony@starkindustries.com",
            "team_members_by_event": {
                str(self.solo_event_1.id): [
                    {"name": "James Rhodes", "phone": "9998887770"}
                ]
            },
        }
        res = self.client.post("/api/registrations/batch/", data=payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("team_members", res.data)

    def test_02_only_squad_event_selected_with_validation(self):
        """Scenario 2: Squad event requires team name and enforces min/max size."""
        # 1. Missing team name
        payload_no_name = {
            "events": [self.squad_event_2.id],
            "participant_name": "Tony Stark",
            "college_name": "MIT",
            "phone": "9876543210",
            "email": "tony@starkindustries.com",
            "team_members_by_event": {
                str(self.squad_event_2.id): [
                    {"name": "Rhodey", "phone": "9876500001"},
                    {"name": "Happy", "phone": "9876500002"},
                ]
            },
        }
        res_no_name = self.client.post("/api/registrations/batch/", data=payload_no_name, format="json")
        self.assertEqual(res_no_name.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("team_name", res_no_name.data)

        # 2. Too few members (BGMI min=3: captain + 1 teammate = 2 -> fails)
        payload_under = {
            "events": [self.squad_event_2.id],
            "participant_name": "Tony Stark",
            "college_name": "MIT",
            "phone": "9876543210",
            "email": "tony@starkindustries.com",
            "squads_by_event": {
                str(self.squad_event_2.id): {
                    "team_name": "Iron Legion",
                    "members": [{"name": "Rhodey", "phone": "9876500001"}],
                }
            },
        }
        res_under = self.client.post("/api/registrations/batch/", data=payload_under, format="json")
        self.assertEqual(res_under.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("team_members", res_under.data)

        # 3. Too many members (BGMI max=4: captain + 4 teammates = 5 -> fails)
        payload_over = {
            "events": [self.squad_event_2.id],
            "participant_name": "Tony Stark",
            "college_name": "MIT",
            "phone": "9876543210",
            "email": "tony@starkindustries.com",
            "squads_by_event": {
                str(self.squad_event_2.id): {
                    "team_name": "Iron Legion",
                    "members": [
                        {"name": "Rhodey", "phone": "9876500001"},
                        {"name": "Happy", "phone": "9876500002"},
                        {"name": "Pepper", "phone": "9876500003"},
                        {"name": "Jarvis", "phone": "9876500004"},
                    ],
                }
            },
        }
        res_over = self.client.post("/api/registrations/batch/", data=payload_over, format="json")
        self.assertEqual(res_over.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("team_members", res_over.data)

        # 4. Valid squad (captain + 2 teammates = 3 members -> success)
        payload_valid = {
            "events": [self.squad_event_2.id],
            "participant_name": "Tony Stark",
            "college_name": "MIT",
            "phone": "9876543210",
            "email": "tony@starkindustries.com",
            "squads_by_event": {
                str(self.squad_event_2.id): {
                    "team_name": "Iron Legion",
                    "members": [
                        {"name": "Rhodey", "phone": "9876500001"},
                        {"name": "Happy", "phone": "9876500002"},
                    ],
                }
            },
        }
        res_valid = self.client.post("/api/registrations/batch/", data=payload_valid, format="json")
        self.assertEqual(res_valid.status_code, status.HTTP_201_CREATED, res_valid.data)

        batch_id = res_valid.data["payment_batch_id"]
        reg = Registration.objects.get(payment_batch_id=batch_id, event=self.squad_event_2)
        self.assertEqual(reg.registration_type, "team")
        self.assertEqual(reg.team_name, "Iron Legion")
        # 1 Captain + 2 Members = 3 TeamMember rows
        self.assertEqual(reg.team_members.count(), 3)
        self.assertTrue(reg.team_members.filter(role="captain", user=self.user).exists())
        self.assertEqual(reg.team_members.filter(role="member").count(), 2)

    def test_02b_existing_teammate_is_linked_and_can_view_registration(self):
        teammate = User.objects.create_user(
            username="rhodey",
            email="rhodey@starkindustries.com",
            password="WarMachinePassword123!",
        )
        payload = {
            "events": [self.squad_event_1.id],
            "participant_name": "Tony Stark",
            "college_name": "MIT",
            "phone": "9876543210",
            "email": "tony@starkindustries.com",
            "squads_by_event": {
                str(self.squad_event_1.id): {
                    "team_name": "Iron Legion",
                    "members": [{"name": "James Rhodes", "email": "RHODEY@STARKINDUSTRIES.COM"}],
                }
            },
        }
        created = self.client.post("/api/registrations/batch/", data=payload, format="json")
        self.assertEqual(created.status_code, status.HTTP_201_CREATED, created.data)

        member = TeamMember.objects.get(registration__payment_batch_id=created.data["payment_batch_id"], role="member")
        self.assertEqual(member.user_id, teammate.id)
        self.assertEqual(member.invitation_status, "accepted")
        self.assertIsNotNone(member.accepted_at)

        self.client.force_authenticate(user=teammate)
        visible = self.client.get("/api/registrations/")
        self.assertEqual(visible.status_code, status.HTTP_200_OK, visible.data)
        self.assertEqual(len(visible.data), 1)
        self.assertEqual(visible.data[0]["team_name"], "Iron Legion")

    def test_02c_teammate_can_view_registration_after_creating_account_later(self):
        teammate_email = "late.teammate@starkindustries.com"
        payload = {
            "events": [self.squad_event_1.id],
            "participant_name": "Tony Stark",
            "college_name": "MIT",
            "phone": "9876543210",
            "email": "tony@starkindustries.com",
            "squads_by_event": {
                str(self.squad_event_1.id): {
                    "team_name": "Iron Legion",
                    "members": [{"name": "Late Teammate", "email": teammate_email}],
                }
            },
        }
        created = self.client.post("/api/registrations/batch/", data=payload, format="json")
        self.assertEqual(created.status_code, status.HTTP_201_CREATED, created.data)

        teammate = User.objects.create_user(
            username="late_teammate",
            email=teammate_email,
            password="LateTeammatePassword123!",
        )
        self.client.force_authenticate(user=teammate)
        visible = self.client.get("/api/registrations/")

        self.assertEqual(visible.status_code, status.HTTP_200_OK, visible.data)
        self.assertEqual(len(visible.data), 1)
        self.assertEqual(visible.data[0]["event_title"], self.squad_event_1.title)
        self.assertFalse(visible.data[0]["is_captain"])
        self.assertEqual(
            TeamMember.objects.get(email=teammate_email).user_id,
            teammate.id,
        )

    def test_03_multiple_solo_events_selected(self):
        """Scenario 3: Multiple solo events in 1 batch -> each stored as individual with 0 members."""
        payload = {
            "events": [self.solo_event_1.id, self.solo_event_2.id],
            "participant_name": "Tony Stark",
            "college_name": "MIT",
            "phone": "9876543210",
            "email": "tony@starkindustries.com",
        }
        res = self.client.post("/api/registrations/batch/", data=payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED, res.data)

        batch_id = res.data["payment_batch_id"]
        regs = Registration.objects.filter(payment_batch_id=batch_id)
        self.assertEqual(regs.count(), 2)

        for r in regs:
            self.assertEqual(r.registration_type, "individual")
            self.assertEqual(r.team_name, "")
            self.assertEqual(r.team_members.count(), 0)

        # Total fee = 150 + 100 = 250
        self.assertEqual(Decimal(res.data["payment_amount_total"]), Decimal("250.00"))

    def test_04_multiple_squad_events_selected(self):
        """Scenario 4: Multiple squad events -> each has its own distinct squad name and members."""
        payload = {
            "events": [self.squad_event_1.id, self.squad_event_2.id],
            "participant_name": "Tony Stark",
            "college_name": "MIT",
            "phone": "9876543210",
            "email": "tony@starkindustries.com",
            "squads_by_event": {
                str(self.squad_event_1.id): {
                    "team_name": "Stark Coders",
                    "members": [{"name": "Friday", "phone": "9876500010"}],
                },
                str(self.squad_event_2.id): {
                    "team_name": "War Machine XI",
                    "members": [
                        {"name": "Rhodey", "phone": "9876500001"},
                        {"name": "Sam Wilson", "phone": "9876500002"},
                    ],
                },
            },
        }
        res = self.client.post("/api/registrations/batch/", data=payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED, res.data)

        batch_id = res.data["payment_batch_id"]
        reg_hack = Registration.objects.get(payment_batch_id=batch_id, event=self.squad_event_1)
        reg_bgmi = Registration.objects.get(payment_batch_id=batch_id, event=self.squad_event_2)

        self.assertEqual(reg_hack.team_name, "Stark Coders")
        self.assertEqual(reg_hack.team_members.count(), 2)  # Captain + Friday

        self.assertEqual(reg_bgmi.team_name, "War Machine XI")
        self.assertEqual(reg_bgmi.team_members.count(), 3)  # Captain + Rhodey + Sam Wilson

    def test_05_mixed_checkout_solo_plus_squad(self):
        """Scenario 5: Mixed checkout -> Solo event individual (0 members), Squad event team (members)."""
        payload = {
            "events": [self.solo_event_1.id, self.squad_event_2.id],
            "participant_name": "Tony Stark",
            "college_name": "MIT",
            "phone": "9876543210",
            "email": "tony@starkindustries.com",
            "squads_by_event": {
                str(self.squad_event_2.id): {
                    "team_name": "Avengers Strike",
                    "members": [
                        {"name": "Bruce Banner", "phone": "9876500021"},
                        {"name": "Steve Rogers", "phone": "9876500022"},
                    ],
                }
            },
        }
        res = self.client.post("/api/registrations/batch/", data=payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED, res.data)

        batch_id = res.data["payment_batch_id"]
        reg_solo = Registration.objects.get(payment_batch_id=batch_id, event=self.solo_event_1)
        reg_squad = Registration.objects.get(payment_batch_id=batch_id, event=self.squad_event_2)

        # Solo check: strictly individual, no team_name, no TeamMember rows
        self.assertEqual(reg_solo.registration_type, "individual")
        self.assertEqual(reg_solo.team_name, "")
        self.assertEqual(reg_solo.team_members.count(), 0)

        # Squad check: team type, squad name, captain + 2 teammates = 3 members
        self.assertEqual(reg_squad.registration_type, "team")
        self.assertEqual(reg_squad.team_name, "Avengers Strike")
        self.assertEqual(reg_squad.team_members.count(), 3)

        # Combined fee = 150 + 400 = 550
        self.assertEqual(Decimal(res.data["payment_amount_total"]), Decimal("550.00"))

    def test_06_payment_completion_and_synchronization(self):
        """Scenario 6: Payment completion updates all registrations in the batch atomically."""
        payload = {
            "events": [self.solo_event_1.id, self.squad_event_1.id],
            "participant_name": "Tony Stark",
            "college_name": "MIT",
            "phone": "9876543210",
            "email": "tony@starkindustries.com",
            "squads_by_event": {
                str(self.squad_event_1.id): {
                    "team_name": "Arc Reactors",
                    "members": [],  # Min 1, so Captain alone is valid
                }
            },
        }
        res_create = self.client.post("/api/registrations/batch/", data=payload, format="json")
        self.assertEqual(res_create.status_code, status.HTTP_201_CREATED)
        batch_id = res_create.data["payment_batch_id"]

        # Confirm payment for the batch directly
        pay_payload = {
            "payment_batch_id": batch_id,
            "payment_transaction_id": "UPI/STARK/998877",
            "auto_confirm": True,
        }
        res_pay = self.client.post("/api/registrations/submit-payment-batch/", data=pay_payload, format="json")
        self.assertEqual(res_pay.status_code, status.HTTP_200_OK, res_pay.data)

        # Check that BOTH registrations are now paid and locked
        regs = Registration.objects.filter(payment_batch_id=batch_id)
        self.assertEqual(regs.count(), 2)
        for r in regs:
            self.assertEqual(r.payment_status, "paid")
            self.assertTrue(r.is_locked)
            self.assertEqual(r.payment_transaction_id, "UPI/STARK/998877")

    def test_07_database_records_integrity(self):
        """Scenario 7: Verify database records consistency across Solo and Squad."""
        payload = {
            "events": [self.solo_event_2.id, self.squad_event_1.id],
            "participant_name": "Tony Stark",
            "college_name": "MIT",
            "department": "Engineering",
            "register_number": "MIT-STARK-01",
            "phone": "9876543210",
            "email": "tony@starkindustries.com",
            "squads_by_event": {
                str(self.squad_event_1.id): {
                    "team_name": "NanoTech Squad",
                    "members": [
                        {"name": "Peter Parker", "phone": "9123456780", "college_name": "Midtown High"}
                    ],
                }
            },
        }
        res = self.client.post("/api/registrations/batch/", data=payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        batch_id = res.data["payment_batch_id"]

        reg_solo = Registration.objects.get(payment_batch_id=batch_id, event=self.solo_event_2)
        reg_squad = Registration.objects.get(payment_batch_id=batch_id, event=self.squad_event_1)

        # DB integrity checks
        self.assertEqual(reg_solo.user, self.user)
        self.assertEqual(reg_solo.participant_name, "Tony Stark")
        self.assertEqual(reg_solo.register_number, "MIT-STARK-01")
        self.assertEqual(TeamMember.objects.filter(registration=reg_solo).count(), 0)

        self.assertEqual(reg_squad.user, self.user)
        self.assertEqual(reg_squad.team_name, "NanoTech Squad")
        self.assertEqual(TeamMember.objects.filter(registration=reg_squad).count(), 2)

        captain_member = TeamMember.objects.get(registration=reg_squad, role="captain")
        self.assertEqual(captain_member.user, self.user)
        self.assertEqual(captain_member.name, "Tony Stark")

        regular_member = TeamMember.objects.get(registration=reg_squad, role="member")
        self.assertEqual(regular_member.name, "Peter Parker")
        self.assertEqual(regular_member.college_name, "Midtown High")

"""Complete Event Registration & Team Management Flow Automated Test Suite.

Scenarios Tested:
1. Team created without members (Captain auto-assigned as member #1).
2. Team below minimum members (Payment strictly blocked).
3. Team reaching minimum members (Payment unlocked & initiation succeeded).
4. Team exceeding maximum members (Member addition blocked at ceiling).
5. Non-captain member trying to pay (HTTP 403 Forbidden).
6. Captain paying successfully (Status paid, team locked, all members marked paid).
7. Payment failure state handling (Status failed, unlocked).
8. Duplicate payment attempts (HTTP 400 Bad Request).
9. Unauthorized user attempting team modification (HTTP 403 Forbidden).
10. Modifying team after successful payment (HTTP 400 Bad Request, locked).
"""

from decimal import Decimal
from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from events.models import Event
from registrations.models import Registration, TeamMember


class TeamRegistrationWorkflowTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Users: Captain, Team Members, and an Outsider
        self.captain = User.objects.create_user(
            username="tony_stark",
            email="stark@avengers.io",
            password="IronPassword123!",
            first_name="Tony",
            last_name="Stark",
        )
        self.member_1 = User.objects.create_user(
            username="peter_parker",
            email="peter@avengers.io",
            password="SpideyPassword123!",
            first_name="Peter",
            last_name="Parker",
        )
        self.member_2 = User.objects.create_user(
            username="bruce_banner",
            email="banner@avengers.io",
            password="HulkPassword123!",
            first_name="Bruce",
            last_name="Banner",
        )
        self.member_3 = User.objects.create_user(
            username="steve_rogers",
            email="rogers@avengers.io",
            password="CapPassword123!",
            first_name="Steve",
            last_name="Rogers",
        )
        self.member_4 = User.objects.create_user(
            username="natasha_romanoff",
            email="natasha@avengers.io",
            password="WidowPassword123!",
            first_name="Natasha",
            last_name="Romanoff",
        )
        self.outsider = User.objects.create_user(
            username="loki_laufeyson",
            email="loki@asgard.io",
            password="MischiefPass123!",
            first_name="Loki",
            last_name="Laufeyson",
        )

        # Event requiring Min: 3 members, Max: 5 members
        self.team_event = Event.objects.create(
            title="Avengers Hackathon Championship",
            slug="avengers-hackathon-championship",
            category="tech",
            audience="college",
            department="Cyber Systems",
            description="Multi-member collegiate hackathon requiring 3 to 5 builders.",
            venue="Stark Tower Lab A",
            event_date=timezone.localdate() + timezone.timedelta(days=7),
            event_time=timezone.now().time().replace(microsecond=0),
            max_participants=50,
            registration_fee=600,
            min_team_size=3,
            max_team_size=5,
            is_registration_open=True,
        )

    def test_01_team_created_without_additional_members(self):
        """User creates team; Captain is automatically recorded as member #1."""
        self.client.force_authenticate(self.captain)
        res = self.client.post(
            "/api/registrations/team/create/",
            {
                "event": self.team_event.id,
                "team_name": "Stark Industries Alpha",
                "college_name": "MIT",
                "phone": "9876543210",
                "department": "Robotics",
            },
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED, res.data)
        reg_id = res.data["id"]

        reg = Registration.objects.get(id=reg_id)
        self.assertEqual(reg.user, self.captain)
        self.assertEqual(reg.team_name, "Stark Industries Alpha")
        self.assertEqual(reg.total_team_members_count, 1)
        self.assertFalse(reg.meets_minimum_team_size)
        self.assertFalse(reg.can_proceed_to_payment)

        # Captain must be in team_members with role='captain'
        captain_member = reg.team_members.filter(role="captain").first()
        self.assertIsNotNone(captain_member)
        self.assertEqual(captain_member.user, self.captain)
        self.assertEqual(captain_member.name, "Tony Stark")

    def test_02_payment_blocked_when_below_minimum_members(self):
        """Payment initiation and submission MUST be rejected if team size < min_team_size."""
        self.client.force_authenticate(self.captain)
        create_res = self.client.post(
            "/api/registrations/team/create/",
            {
                "event": self.team_event.id,
                "team_name": "Understrength Squad",
                "college_name": "MIT",
                "phone": "9876543210",
            },
            format="json",
        )
        reg_id = create_res.data["id"]

        # 1. Attempt payment with only 1 member (Captain)
        init_res = self.client.post(f"/api/registrations/{reg_id}/team/initiate-payment/", format="json")
        self.assertEqual(init_res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("minimum required is 3", init_res.data["detail"])

        # 2. Add 1 member (Total = 2, still below min of 3)
        add_res = self.client.post(
            f"/api/registrations/{reg_id}/team/add-member/",
            {
                "name": "Peter Parker",
                "email": "peter@avengers.io",
                "phone": "9876543211",
                "college_name": "Empire State",
            },
            format="json",
        )
        self.assertEqual(add_res.status_code, status.HTTP_201_CREATED)

        # Attempt payment with 2 members -> MUST FAIL
        pay_attempt = self.client.post(
            f"/api/registrations/{reg_id}/submit-payment/",
            {"auto_confirm": True},
            format="json",
        )
        self.assertEqual(pay_attempt.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("minimum required is 3", pay_attempt.data["detail"])

    def test_03_payment_unlocked_when_reaching_minimum_members(self):
        """Team reaches 3 members (Captain + 2 members); payment is enabled and succeeds."""
        self.client.force_authenticate(self.captain)
        reg = self._create_team_with_members(member_count=2)  # Captain + 2 = 3
        self.assertEqual(reg.total_team_members_count, 3)
        self.assertTrue(reg.meets_minimum_team_size)
        self.assertTrue(reg.can_proceed_to_payment)

        # Captain initiates payment
        init_res = self.client.post(f"/api/registrations/{reg.id}/team/initiate-payment/", format="json")
        self.assertEqual(init_res.status_code, status.HTTP_200_OK)
        reg.refresh_from_db()
        self.assertEqual(reg.payment_status, "initiated")

    def test_04_team_exceeding_maximum_members_blocked(self):
        """Cannot add members beyond max_team_size (5 members)."""
        self.client.force_authenticate(self.captain)
        reg = self._create_team_with_members(member_count=4)  # Captain + 4 = 5 (Max capacity)
        self.assertEqual(reg.total_team_members_count, 5)

        # Attempt to add 6th member -> MUST FAIL
        overflow_res = self.client.post(
            f"/api/registrations/{reg.id}/team/add-member/",
            {
                "name": "Wanda Maximoff",
                "email": "wanda@avengers.io",
                "phone": "9876543219",
                "college_name": "Sokovia Tech",
            },
            format="json",
        )
        self.assertEqual(overflow_res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("maximum allowed capacity of 5", overflow_res.data["detail"])

    def test_05_non_captain_member_cannot_pay(self):
        """Team member (non-captain) attempting to initiate or make payment is denied with 403 Forbidden."""
        self.client.force_authenticate(self.captain)
        reg = self._create_team_with_members(member_count=2)  # Valid team of 3

        # Peter Parker (Member) attempts to pay
        self.client.force_authenticate(self.member_1)

        init_res = self.client.post(f"/api/registrations/{reg.id}/team/initiate-payment/", format="json")
        self.assertEqual(init_res.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("Only the Team Captain", init_res.data["detail"])

        pay_res = self.client.post(
            f"/api/registrations/{reg.id}/submit-payment/",
            {"auto_confirm": True},
            format="json",
        )
        self.assertEqual(pay_res.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("Only the Team Captain", pay_res.data["detail"])

    def test_06_captain_paying_successfully_locks_team_and_marks_all_members_paid(self):
        """One single successful payment by Captain marks entire squad as registered & paid and locks team."""
        self.client.force_authenticate(self.captain)
        reg = self._create_team_with_members(member_count=2)

        pay_res = self.client.post(
            f"/api/registrations/{reg.id}/submit-payment/",
            {
                "auto_confirm": True,
                "payment_transaction_id": "UPI-STARK-2026-9999",
            },
            format="json",
        )
        self.assertEqual(pay_res.status_code, status.HTTP_200_OK)

        reg.refresh_from_db()
        self.assertEqual(reg.payment_status, "paid")
        self.assertEqual(reg.approval_status, "approved")
        self.assertTrue(reg.is_locked)
        self.assertTrue(reg.is_team_locked)
        self.assertIsNotNone(reg.payment_confirmed_at)

        # All team members must be marked paid
        for member in reg.team_members.all():
            self.assertEqual(member.payment_status, "paid")

    def test_07_payment_failure_state_handling(self):
        """Payment failure updates state to failed without locking team."""
        self.client.force_authenticate(self.captain)
        reg = self._create_team_with_members(member_count=2)

        fail_res = self.client.post(
            f"/api/registrations/{reg.id}/submit-payment/",
            {"status": "failed"},
            format="json",
        )
        self.assertEqual(fail_res.status_code, status.HTTP_200_OK)

        reg.refresh_from_db()
        self.assertEqual(reg.payment_status, "failed")
        self.assertFalse(reg.is_locked)

    def test_08_duplicate_payment_attempts_blocked(self):
        """Cannot pay again on an already paid / confirmed team."""
        self.client.force_authenticate(self.captain)
        reg = self._create_team_with_members(member_count=2)

        # First payment succeeds
        self.client.post(
            f"/api/registrations/{reg.id}/submit-payment/",
            {"auto_confirm": True},
            format="json",
        )

        # Duplicate payment attempt -> MUST BE BLOCKED
        dup_res = self.client.post(
            f"/api/registrations/{reg.id}/submit-payment/",
            {"auto_confirm": True},
            format="json",
        )
        self.assertEqual(dup_res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("already been completed", dup_res.data["detail"])

    def test_09_unauthorized_user_cannot_modify_team(self):
        """Non-captain user cannot add or remove members from someone else's team."""
        self.client.force_authenticate(self.captain)
        reg = self._create_team_with_members(member_count=2)
        member_to_remove = reg.team_members.filter(role="member").first()

        # Loki (Outsider) attempts to add a member (denied with 403 or 404 isolation)
        self.client.force_authenticate(self.outsider)
        add_attempt = self.client.post(
            f"/api/registrations/{reg.id}/team/add-member/",
            {
                "name": "Frost Giant",
                "email": "frost@asgard.io",
                "phone": "9999999999",
            },
            format="json",
        )
        self.assertIn(add_attempt.status_code, (status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND))

        # Loki attempts to remove Captain's team member (denied)
        remove_attempt = self.client.post(
            f"/api/registrations/{reg.id}/team/remove-member/",
            {"member_id": member_to_remove.id},
            format="json",
        )
        self.assertIn(remove_attempt.status_code, (status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND))

    def test_10_modifying_team_after_payment_strictly_blocked(self):
        """After successful payment, team details are locked; adding or removing members fails."""
        self.client.force_authenticate(self.captain)
        reg = self._create_team_with_members(member_count=2)

        # Pay and lock
        self.client.post(
            f"/api/registrations/{reg.id}/submit-payment/",
            {"auto_confirm": True},
            format="json",
        )
        reg.refresh_from_db()
        self.assertTrue(reg.is_locked)

        # Captain attempts to add a member to locked team
        add_attempt = self.client.post(
            f"/api/registrations/{reg.id}/team/add-member/",
            {
                "name": "Clint Barton",
                "email": "hawkeye@avengers.io",
                "phone": "9876543217",
            },
            format="json",
        )
        self.assertEqual(add_attempt.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("locked after successful payment", add_attempt.data["detail"])

        # Captain attempts to remove a member from locked team
        member = reg.team_members.filter(role="member").first()
        remove_attempt = self.client.post(
            f"/api/registrations/{reg.id}/team/remove-member/",
            {"member_id": member.id},
            format="json",
        )
        self.assertEqual(remove_attempt.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("locked after successful payment", remove_attempt.data["detail"])

    def test_11_solo_event_registration_without_team_flow(self):
        """Solo event (max_team_size=1) registers directly without team name and is eligible for payment."""
        solo_event = Event.objects.create(
            title="The Flash: Code Rush (Coding Challenge)",
            slug="coding-challenge-test",
            category="tech",
            audience="college",
            department="Coding",
            description="Rapid solo algorithmic challenge.",
            venue="Stark Lab B",
            event_date=timezone.localdate() + timezone.timedelta(days=7),
            event_time=timezone.now().time().replace(microsecond=0),
            max_participants=100,
            registration_fee=250,
            min_team_size=1,
            max_team_size=1,
            is_registration_open=True,
        )

        self.client.force_authenticate(self.member_1)
        # Register for solo event without team_name
        res = self.client.post(
            "/api/registrations/team/create/",
            {
                "event": solo_event.id,
                "participant_name": "Peter Parker",
                "college_name": "Empire State University",
                "phone": "9876543210",
                "department": "Biophysics",
                "register_number": "ESU-101",
                "gender": "male",
            },
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["registration_type"], "individual")
        self.assertEqual(res.data["team_name"], "Peter Parker")
        self.assertEqual(res.data["total_team_members_count"], 1)

        # Solo registration immediately satisfies min_team_size=1 and can initiate payment
        reg_id = res.data["id"]
        pay_init = self.client.post(f"/api/registrations/{reg_id}/team/initiate-payment/", format="json")
        self.assertEqual(pay_init.status_code, status.HTTP_200_OK)
        self.assertEqual(pay_init.data["payment_status"], "initiated")

    def test_12_solo_event_registration_by_slug(self):
        """Event lookup by slug allows seamless registration from URL params."""
        solo_event = Event.objects.create(
            title="Spider-Verse: Frame Hunt",
            slug="photography-test-slug",
            category="arts",
            audience="college",
            department="Media",
            description="Solo photo competition.",
            venue="Campus Grounds",
            event_date=timezone.localdate() + timezone.timedelta(days=7),
            event_time=timezone.now().time().replace(microsecond=0),
            max_participants=50,
            registration_fee=0,
            min_team_size=1,
            max_team_size=1,
            is_registration_open=True,
        )

        self.client.force_authenticate(self.member_2)
        res = self.client.post(
            "/api/registrations/team/create/",
            {
                "event": "photography-test-slug",
                "participant_name": "Bruce Banner",
                "college_name": "Caltech",
                "phone": "9876543210",
            },
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["registration_type"], "individual")
        self.assertEqual(res.data["event"], solo_event.id)

    # Helper method
    def _create_team_with_members(self, member_count=2):
        create_res = self.client.post(
            "/api/registrations/team/create/",
            {
                "event": self.team_event.id,
                "team_name": "Avengers Elite",
                "college_name": "MIT",
                "phone": "9876543210",
                "department": "Engineering",
            },
            format="json",
        )
        reg_id = create_res.data["id"]

        extra_users = [self.member_1, self.member_2, self.member_3, self.member_4]
        for i in range(member_count):
            u = extra_users[i]
            self.client.post(
                f"/api/registrations/{reg_id}/team/add-member/",
                {
                    "name": u.get_full_name(),
                    "email": u.email,
                    "phone": f"987654321{i+1}",
                    "college_name": "MIT",
                    "department": "Computer Science",
                },
                format="json",
            )
        return Registration.objects.get(id=reg_id)

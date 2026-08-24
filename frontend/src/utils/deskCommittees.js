/**
 * Eight MacFiesta operations desks — dedicated login portals.
 * Desk passwords live only in backend/.env (never in frontend source).
 * Seed with: python manage.py seed_committee_desk_admins
 */

export const DESK_COMMITTEES = [
  {
    slug: "finance",
    label: "Finance",
    blurb: "Check payments and verify money screenshots.",
    modulesHint: "Payments · Registrations · Reports",
  },
  {
    slug: "food",
    label: "Food",
    blurb: "See who needs veg / non-veg / jain meals.",
    modulesHint: "Hospitality food lists · Reports",
  },
  {
    slug: "hospitality",
    label: "Hospitality",
    blurb: "Hostel lists, accommodation, and welcome desk.",
    modulesHint: "Hospitality · Verification · Reports",
  },
  {
    slug: "event",
    label: "Event",
    blurb: "Missions, participants, winners, and schedule.",
    modulesHint: "Missions · Participants · Results",
  },
  {
    slug: "program",
    label: "Program",
    blurb: "Day plan, schedule, and result coordination.",
    modulesHint: "Missions · Schedule · Results",
  },
  {
    slug: "cultural",
    label: "Cultural",
    blurb: "Cultural missions, gallery, and results.",
    modulesHint: "Missions · Gallery · Results",
  },
  {
    slug: "publicity",
    label: "Publicity",
    blurb: "Announcements, gallery, sponsors, and website.",
    modulesHint: "Announcements · Gallery · Sponsors",
  },
  {
    slug: "invitation",
    label: "Invitation",
    blurb: "Guests and invitation content.",
    modulesHint: "Guests · Content",
  },
  {
    slug: "verification",
    label: "Verification",
    blurb: "Scan QR passes and check students in.",
    modulesHint: "Verification · Registrations",
  },
];

/** Username template from env (optional local hint only — never put passwords in VITE_*). */
export function deskUsername(slug) {
  const template = import.meta.env.VITE_DESK_USERNAME_TEMPLATE || "macfiesta{committee}admin";
  return String(template).replace("{committee}", slug);
}

export function getDeskBySlug(slug) {
  return DESK_COMMITTEES.find((d) => d.slug === slug) || null;
}

export function deskLoginPath(slug) {
  return `/desk/${slug}/login`;
}

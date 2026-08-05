import { Link } from "react-router-dom";

const OPS = [
  { title: "Hospitality", desc: "Mark attendance and welcome desks", href: "/admin/registrations", query: "" },
  { title: "Finance", desc: "Review payment status", href: "/admin/registrations", query: "?payment=paid" },
  { title: "Lunch Registration", desc: "Campus meal pass sample desk", href: "/admin/registrations", query: "" },
  { title: "Set Winners", desc: "Publish results per event", href: "/admin/results", query: "" },
];

export default function VolunteerOps() {
  return (
    <div className="volunteer-ops-grid">
      {OPS.map((op) => (
        <Link key={op.title} to={`${op.href}${op.query}`} className="volunteer-ops-card">
          <strong>{op.title}</strong>
          <span>{op.desc}</span>
        </Link>
      ))}
    </div>
  );
}

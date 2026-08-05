import { Link } from "react-router-dom";
import { CMS_DASHBOARD_CARDS } from "./cmsAdminConfig";

export default function AdminContentDashboard() {
  return (
    <div className="admin-list-page">
      <div className="admin-list-head">
        <h2>Website Content</h2>
        <Link to="/admin/insights" className="btn btn-outline btn-sm">Back to Dashboard</Link>
      </div>
      <p className="admin-page-desc">
        Manage homepage sections, branding, sponsors, FAQs, and other public website content.
      </p>
      <div className="cms-dashboard-grid">
        {CMS_DASHBOARD_CARDS.map((card) => (
          <div key={card.href} className="cms-dashboard-card detail-panel">
            <h3>{card.title}</h3>
            <p>{card.desc}</p>
            <Link to={card.href} className="btn btn-gold btn-sm">Manage</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

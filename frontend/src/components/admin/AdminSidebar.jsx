import { Link, NavLink, useNavigate } from "react-router-dom";
import { logout } from "../../utils/auth";
import { filterAdminNav } from "../../utils/committeeAccess";
import { useAdminStaff } from "./AdminStaffContext";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const staff = useAdminStaff();
  const modules = staff?.modules || [];
  const nav = filterAdminNav(modules);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <span className="section-eyebrow">MacFiesta Pro</span>
        <strong>{staff?.committee_label || "Coordinator"}</strong>
        <span className="admin-sidebar-user">{staff?.display_name || staff?.username}</span>
      </div>
      <nav className="admin-sidebar-nav" aria-label="Admin navigation">
        {nav.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `admin-sidebar-link${isActive ? " active" : ""}`}
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="admin-sidebar-foot">
        <Link to="/" className="admin-sidebar-link muted">View Public Site</Link>
        <button type="button" className="admin-sidebar-link logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}

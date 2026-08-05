import { Outlet, Link, Navigate, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { AdminStaffContext } from "./AdminStaffContext";
import { defaultAdminPath, pathAllowed } from "../../utils/committeeAccess";

export default function AdminLayout({ user }) {
  const location = useLocation();
  const modules = user?.modules || [];

  if (!pathAllowed(location.pathname, modules)) {
    return <Navigate to={defaultAdminPath(modules)} replace />;
  }

  return (
    <AdminStaffContext.Provider value={user}>
      <div className="admin-shell">
        <AdminSidebar />
        <div className="admin-shell-main">
          <header className="admin-shell-top">
            <p className="admin-shell-role">
              {user?.committee_label || "Staff"} · {user?.display_name || user?.username}
            </p>
            <Link to="/" className="btn btn-outline btn-sm admin-shell-top-link">Public Site</Link>
          </header>
          <div className="admin-shell-body container">
            <Outlet />
          </div>
        </div>
      </div>
    </AdminStaffContext.Provider>
  );
}

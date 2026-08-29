import { useEffect, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { RiMenuLine, RiCloseLine } from "react-icons/ri";
import AdminSidebar from "./AdminSidebar";
import AdminBottomNav from "./AdminBottomNav";
import { AdminStaffContext } from "./AdminStaffContext";
import { defaultAdminPath, pathAllowed, dashboardRoleLabel, volunteerHomePath } from "../../utils/committeeAccess";

export default function AdminLayout({ user }) {
  const location = useLocation();
  const modules = user?.modules || [];
  const committee = user?.is_superuser ? "core" : user?.committee;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  /* Public mobile menu can leave body.nav-menu-open (touch-action: none). Clear it on desk. */
  useEffect(() => {
    document.body.classList.remove("nav-menu-open");
    document.body.style.touchAction = "";
    document.documentElement.style.overflow = "";
  }, [location.pathname]);

  const role = dashboardRoleLabel(committee, user?.is_superuser);
  const myDesk =
    committee && committee !== "core" && !user?.is_superuser
      ? volunteerHomePath(committee, modules)
      : defaultAdminPath(modules, committee);

  if (!pathAllowed(location.pathname, modules, committee, user?.is_superuser)) {
    return (
      <AdminStaffContext.Provider value={user}>
        <div className="admin-shell admin-shell--ops">
          <div className="admin-shell-main">
            <div className="admin-shell-body container">
              <div className="admin-ops-page admin-access-denied">
                <header className="admin-ops-header">
                  <h1>Access Denied</h1>
                  <p>You do not have permission to access this section.</p>
                </header>
                <Link to={myDesk} className="admin-action-btn admin-action-btn--primary">
                  Return to My Desk
                </Link>
              </div>
            </div>
          </div>
        </div>
      </AdminStaffContext.Provider>
    );
  }

  const clock = now.toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <AdminStaffContext.Provider value={user}>
      <div className="admin-shell admin-shell--ops">
        <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="admin-shell-main">
          <header className="admin-shell-top">
            <button
              type="button"
              className="admin-menu-toggle"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              {mobileOpen ? (
                <RiCloseLine className="text-base text-arc-cyan" />
              ) : (
                <RiMenuLine className="text-base text-arc-cyan" />
              )}
              <span>Menu</span>
            </button>
            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full border border-metallic-gold/30 bg-metallic-gold/10 text-metallic-gold text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(212,175,55,0.2)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>S.H.I.E.L.D. COMMAND ACTIVE</span>
            </div>
            <p className="admin-shell-role truncate">
              <span className="text-white font-bold">{role}</span> · {user?.display_name || user?.username}
            </p>
            <p className="admin-shell-clock" aria-live="polite">
              {clock}
            </p>
            <Link to="/" className="btn btn-outline btn-sm admin-shell-top-link flex items-center gap-1">
              <span>Public Site</span>
            </Link>
          </header>
          <div className="admin-shell-body">
            <Outlet />
          </div>
          <AdminBottomNav />
        </div>
      </div>
    </AdminStaffContext.Provider>
  );
}

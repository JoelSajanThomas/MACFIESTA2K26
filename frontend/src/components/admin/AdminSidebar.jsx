import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  RiHome5Line,
  RiCompass3Line,
  RiGroupLine,
  RiWalletLine,
  RiHotelBedLine,
  RiCheckboxCircleLine,
  RiTrophyLine,
  RiCalendarEventLine,
  RiMegaphoneLine,
  RiGalleryLine,
  RiGlobalLine,
  RiUserStarLine,
  RiFileChartLine,
  RiExternalLinkLine,
  RiLogoutBoxRLine,
  RiStarSmileLine,
  RiToggleLine,
  RiCloseLine,
} from "react-icons/ri";
import { logout } from "../../utils/auth";
import { dashboardRoleLabel, groupedAdminNav, staffLogoutPath } from "../../utils/committeeAccess";
import { useAdminStaff } from "./AdminStaffContext";

const NAV_ICONS = {
  "/admin/insights": RiHome5Line,
  "/admin/controls": RiToggleLine,
  "/admin/events": RiCompass3Line,
  "/admin/registrations": RiGroupLine,
  "/admin/payments": RiWalletLine,
  "/admin/hospitality": RiHotelBedLine,
  "/admin/verification": RiCheckboxCircleLine,
  "/admin/results": RiTrophyLine,
  "/admin/schedule": RiCalendarEventLine,
  "/admin/announcements": RiMegaphoneLine,
  "/admin/gallery": RiGalleryLine,
  "/admin/content/sponsors": RiStarSmileLine,
  "/admin/content/guests": RiUserStarLine,
  "/admin/content": RiGlobalLine,
  "/admin/users": RiGroupLine,
  "/admin/reports": RiFileChartLine,
};

export default function AdminSidebar({ mobileOpen = false, onClose }) {
  const navigate = useNavigate();
  const staff = useAdminStaff();
  const modules = staff?.modules || [];
  const committee = staff?.is_superuser ? "core" : staff?.committee;
  const groups = groupedAdminNav(modules, committee, staff?.is_superuser);
  const roleLabel = dashboardRoleLabel(committee, staff?.is_superuser);

  function handleLogout() {
    logout();
    navigate(staffLogoutPath());
  }

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          aria-label="Close menu"
          onClick={onClose}
        />
      )}
      <aside className={`admin-sidebar${mobileOpen ? " is-open" : ""}`}>
        {/* Brand Header */}
        <div className="admin-sidebar-brand relative">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FFD700] via-amber-500 to-amber-700 flex items-center justify-center text-black font-black text-sm shrink-0 shadow-[0_0_15px_rgba(255,215,0,0.35)]">
                MF
              </div>
              <div className="min-w-0">
                <span className="section-eyebrow">COMMAND OS</span>
                <strong className="truncate block">MacFiesta Pro</strong>
              </div>
            </div>

            {/* Mobile close button inside drawer */}
            <button
              type="button"
              className="admin-sidebar-close-btn p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              onClick={onClose}
              aria-label="Close navigation"
            >
              <RiCloseLine size={20} />
            </button>
          </div>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="admin-sidebar-user truncate">
              {staff?.display_name || staff?.username || "Operator"}
            </span>
            <span className="admin-sidebar-committee">
              {roleLabel}
            </span>
          </div>
        </div>

        {/* Nav Groups */}
        <nav className="admin-sidebar-nav" aria-label="Admin navigation">
          {groups.map(({ group, items }) => (
            <div key={group} className="admin-nav-group-block">
              <p className="admin-nav-group">{group}</p>
              {items.map(({ to, label, end }) => {
                const IconComponent = NAV_ICONS[to] || RiCompass3Line;
                return (
                  <NavLink
                    key={`${to}-${label}`}
                    to={to}
                    end={end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `admin-sidebar-link admin-nav-link${isActive ? " active" : ""}`
                    }
                  >
                    <IconComponent className="text-base shrink-0 opacity-80" />
                    <span className="truncate">{label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="admin-sidebar-foot">
          <Link to="/" className="admin-sidebar-link flex-1 flex items-center justify-center gap-1.5" onClick={onClose}>
            <RiExternalLinkLine className="text-sm" />
            <span>Public Site</span>
          </Link>
          <button type="button" className="admin-sidebar-link logout flex items-center justify-center gap-1.5 px-3" onClick={handleLogout}>
            <RiLogoutBoxRLine className="text-sm" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

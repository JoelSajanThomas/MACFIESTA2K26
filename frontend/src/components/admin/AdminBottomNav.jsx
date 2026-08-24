import { NavLink } from "react-router-dom";
import {
  RiHome5Line,
  RiWalletLine,
  RiUserSearchLine,
  RiFileChartLine,
  RiQrCodeLine,
  RiCompass3Line,
  RiHotelBedLine,
  RiRestaurantLine,
  RiCalendarEventLine,
  RiMegaphoneLine,
  RiGalleryLine,
  RiStarSmileLine,
  RiUserStarLine,
  RiGlobalLine,
  RiApps2Line,
  RiShieldFlashLine,
  RiToggleLine,
} from "react-icons/ri";
import { committeeBottomNav } from "../../utils/committeeAccess";
import { useAdminStaff } from "./AdminStaffContext";

const NAV_ITEM_ICONS = {
  "Home": RiHome5Line,
  "Pending": RiWalletLine,
  "Payments": RiWalletLine,
  "Search": RiUserSearchLine,
  "Registrations": RiUserSearchLine,
  "Reports": RiFileChartLine,
  "Scan": RiQrCodeLine,
  "Verification": RiQrCodeLine,
  "Events": RiCompass3Line,
  "Stay": RiHotelBedLine,
  "Hospitality": RiHotelBedLine,
  "Food": RiRestaurantLine,
  "Schedule": RiCalendarEventLine,
  "News": RiMegaphoneLine,
  "Gallery": RiGalleryLine,
  "Sponsors": RiStarSmileLine,
  "Guests": RiUserStarLine,
  "CMS": RiGlobalLine,
  "Controls": RiToggleLine,
  "More": RiApps2Line,
};

export default function AdminBottomNav() {
  const staff = useAdminStaff();
  const committee = staff?.is_superuser ? "core" : staff?.committee || "core";
  const items = committeeBottomNav(committee, staff?.modules || []);

  if (!items.length) return null;

  return (
    <div className="admin-bottom-nav-container">
      <nav className="admin-bottom-nav" aria-label="Desk shortcuts">
        {items.map((item) => {
          const Icon = NAV_ITEM_ICONS[item.label] || RiShieldFlashLine;
          return (
            <NavLink
              key={`${item.to}-${item.label}`}
              to={item.to}
              end={item.to === "/admin/insights"}
              className={({ isActive }) =>
                `admin-bottom-nav__item ${isActive ? "admin-bottom-nav__item--active" : ""}`
              }
            >
              <div className="admin-bottom-nav__icon-box">
                <Icon className="admin-bottom-nav__icon" />
              </div>
              <span className="admin-bottom-nav__label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

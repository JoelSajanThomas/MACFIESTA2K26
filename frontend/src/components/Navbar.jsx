import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import BrandLogo from "./BrandLogo";
import { getCurrentUser, isLoggedIn } from "../services/api";
import { AUTH_CHANGE_EVENT, logout, isUnauthorized } from "../utils/auth";

const PUBLIC_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/events", label: "Events" },
  { to: "/schedule", label: "Schedule" },
  { to: "/results", label: "Results" },
  { to: "/gallery", label: "Gallery" },
  { to: "/announcements", label: "Announcements" },
  { to: "/sponsors", label: "Sponsors" },
  { to: "/committees", label: "Committees" },
  { to: "/about", label: "About" },
  { to: "/history", label: "History" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function closeMenu() {
    setOpen(false);
  }

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle("nav-menu-open", open);
    return () => document.body.classList.remove("nav-menu-open");
  }, [open]);

  useEffect(() => {
    function loadUser() {
      if (!isLoggedIn()) {
        setUser(null);
        return;
      }
      getCurrentUser()
        .then((res) => setUser(res.data))
        .catch((err) => {
          if (isUnauthorized(err)) logout();
          setUser(null);
        });
    }

    loadUser();
    window.addEventListener(AUTH_CHANGE_EVENT, loadUser);
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, loadUser);
  }, [location.pathname]);

  function handleLogout() {
    closeMenu();
    logout();
    setUser(null);
    navigate("/");
  }

  const isStaff = user?.is_staff || user?.is_superuser;

  return (
    <header
      className={`site-navbar${scrolled ? " scrolled" : ""}${isHome && !scrolled ? " transparent" : ""}`}
    >
      <div className="navbar-container">
        <BrandLogo className="navbar-logo" onClick={closeMenu} />

        <button
          type="button"
          className={`nav-burger${open ? " open" : ""}`}
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>

        <nav className={`navbar-menu${open ? " open" : ""}`} aria-label="Main">
          {PUBLIC_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={closeMenu}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              {label}
            </NavLink>
          ))}

          {user && (
            <NavLink
              to="/student-dashboard"
              onClick={closeMenu}
              className={({ isActive }) => `nav-link nav-link-dash${isActive ? " active" : ""}`}
            >
              My Dashboard
            </NavLink>
          )}

          {isStaff && (
            <NavLink
              to="/admin/insights"
              onClick={closeMenu}
              className={({ isActive }) => `nav-link nav-link-admin${isActive ? " active" : ""}`}
            >
              Admin
            </NavLink>
          )}

          {!user ? (
            <>
              <NavLink
                to="/register"
                onClick={closeMenu}
                className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
              >
                Create Account
              </NavLink>
              <NavLink
                to="/login"
                onClick={closeMenu}
                className={({ isActive }) => `nav-link nav-link-login${isActive ? " active" : ""}`}
              >
                Login
              </NavLink>
            </>
          ) : (
            <button type="button" className="nav-link nav-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          )}
        </nav>
      </div>

      {open && (
        <button
          type="button"
          className="nav-mobile-backdrop"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      )}
    </header>
  );
}

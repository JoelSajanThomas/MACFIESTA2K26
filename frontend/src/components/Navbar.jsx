import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  { to: "/about", label: "About" },
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

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

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
    logout();
    setUser(null);
    navigate("/");
  }

  const isStaff = user?.is_staff || user?.is_superuser;

  return (
    <motion.header
      className={`site-navbar${scrolled ? " scrolled" : ""}${isHome && !scrolled ? " transparent" : ""}`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">MF</span>
          <span className="logo-text">
            MacFiesta<span className="logo-accent">.</span>
          </span>
        </Link>

        <button
          type="button"
          className={`nav-burger${open ? " open" : ""}`}
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>

        <nav className={`navbar-menu${open ? " open" : ""}`}>
          {PUBLIC_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              {label}
            </NavLink>
          ))}

          {user && (
            <NavLink
              to="/student-dashboard"
              className={({ isActive }) => `nav-link nav-link-dash${isActive ? " active" : ""}`}
            >
              My Dashboard
            </NavLink>
          )}

          {isStaff && (
            <NavLink
              to="/admin-dashboard"
              className={({ isActive }) => `nav-link nav-link-admin${isActive ? " active" : ""}`}
            >
              Admin
            </NavLink>
          )}

          {!user ? (
            <NavLink
              to="/login"
              className={({ isActive }) => `nav-link nav-link-login${isActive ? " active" : ""}`}
            >
              Login
            </NavLink>
          ) : (
            <button type="button" className="nav-link nav-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          )}
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="nav-mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.header>
  );
}

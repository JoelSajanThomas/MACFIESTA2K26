import { Link } from "react-router-dom";
import { FEST_YEAR, OFFICIAL_SITE } from "../utils/constants";

const FOOTER_LINKS = {
  Explore: [
    { to: "/events", label: "Events" },
    { to: "/schedule", label: "Schedule" },
    { to: "/results", label: "Results" },
    { to: "/gallery", label: "Gallery" },
    { to: "/announcements", label: "Announcements" },
  ],
  Festival: [
    { to: "/about", label: "About" },
    { to: "/sponsors", label: "Sponsors" },
    { to: "/contact", label: "Contact" },
    { to: "/login", label: "Login" },
    { to: "/student-dashboard", label: "Student Dashboard" },
  ],
};

export default function Footer() {
  return (
    <footer className="site-footer-premium">
      <div className="footer-glow" aria-hidden="true" />
      <div className="container footer-grid">
        <div className="footer-brand-col">
          <Link to="/" className="footer-logo">
            <span className="logo-icon">MF</span>
            Macfiesta {FEST_YEAR}
          </Link>
          <p>
            MacFiesta Pro is the official event platform for MACFAST&apos;s national-level fest.
            Register for competitions, track results, and stay updated — alongside{" "}
            <a href={OFFICIAL_SITE} target="_blank" rel="noopener noreferrer">
              macfiesta.macfast.org
            </a>
            .
          </p>
          <div className="footer-social">
            <a href={OFFICIAL_SITE} target="_blank" rel="noopener noreferrer" aria-label="Official site">
              Web
            </a>
            <a href="#" aria-label="Instagram">IG</a>
            <a href="#" aria-label="YouTube">YT</a>
          </div>
        </div>

        {Object.entries(FOOTER_LINKS).map(([title, links]) => (
          <div key={title} className="footer-col">
            <h4>{title}</h4>
            <ul>
              {links.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="footer-col">
          <h4>Contact</h4>
          <ul className="footer-contact">
            <li>
              <a href={OFFICIAL_SITE} target="_blank" rel="noopener noreferrer">
                macfiesta.macfast.org
              </a>
            </li>
            <li>MACFAST, Thiruvalla</li>
            <li>Kerala, India</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {new Date().getFullYear()} Macfiesta · MACFAST. All rights reserved.</p>
          <p className="footer-credit">MacFiesta Pro — event management platform</p>
        </div>
      </div>
    </footer>
  );
}

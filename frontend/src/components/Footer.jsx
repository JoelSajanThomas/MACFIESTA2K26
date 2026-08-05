import { Link } from "react-router-dom";
import { useSiteSettings } from "../hooks/useSiteSettings";
import { BRAND } from "../utils/brand";

export default function Footer() {
  const settings = useSiteSettings();

  const contactEmail = settings?.contact_email || BRAND.contactEmail;
  const contactPhone = settings?.contact_phone || BRAND.contactPhone;
  const venue = settings?.venue || BRAND.venue;
  const collegeName = settings?.college_name || BRAND.collegeName;
  const festName = settings?.fest_name || BRAND.festName;
  const copyright = settings?.footer_copyright || `© ${new Date().getFullYear()} ${festName} · ${collegeName}. All rights reserved.`;
  const tagline = settings?.footer_tagline;

  const socialLinks = [
    { label: "Instagram", href: settings?.instagram_url || BRAND.socialLinks.instagram },
    { label: "YouTube", href: settings?.youtube_url || BRAND.socialLinks.youtube },
    { label: "Facebook", href: settings?.facebook_url || BRAND.socialLinks.facebook },
    { label: "Official Site", href: settings?.official_website || BRAND.socialLinks.website },
  ].filter((s) => s.href);

  return (
    <footer className="site-footer-simple">
      <div className="container site-footer-simple-inner">
        <div className="footer-simple-contact">
          <h2>Contact Us</h2>
          <p>
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
          </p>
          <p>
            <a href={`tel:${contactPhone.replace(/\s/g, "")}`}>{contactPhone}</a>
          </p>
          <p>{venue}</p>
          {tagline && <p className="footer-simple-tagline">{tagline}</p>}
        </div>

        {socialLinks.length > 0 && (
          <div className="footer-simple-social">
            <h3>Follow Us</h3>
            <div className="footer-simple-links">
              {socialLinks.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>
              ))}
            </div>
          </div>
        )}

        <div className="footer-simple-legal">
          <p>{copyright}</p>
          <div className="footer-legal-links">
            <Link to="/terms">Terms</Link>
            <Link to="/privacy">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

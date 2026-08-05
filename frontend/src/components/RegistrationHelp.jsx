import { Link } from "react-router-dom";
import { BRAND } from "../utils/brand";

export default function RegistrationHelp() {
  return (
    <section className="section registration-help-section">
      <div className="container">
        <div className="registration-help-panel detail-panel">
          <div className="registration-help-copy">
            <span className="section-eyebrow">Need help?</span>
            <h2>Registration Support</h2>
            <p>
              Having trouble registering for an event? Contact the fest registration desk
              during office hours or fest days.
            </p>
          </div>
          <ul className="registration-help-contacts">
            <li>
              <strong>Email</strong>
              <a href={`mailto:${BRAND.registrationHelpEmail}`}>{BRAND.registrationHelpEmail}</a>
            </li>
            <li>
              <strong>Phone</strong>
              <a href={`tel:${BRAND.registrationHelpPhone.replace(/\s/g, "")}`}>{BRAND.registrationHelpPhone}</a>
            </li>
            <li>
              <strong>Venue</strong>
              <span>{BRAND.venue}</span>
            </li>
          </ul>
          <Link to="/contact" className="btn btn-outline">Contact Coordinators</Link>
        </div>
      </div>
    </section>
  );
}

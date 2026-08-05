import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { useSiteSettings } from "../hooks/useSiteSettings";
import { PAGE_IMAGES } from "../utils/assets";
import { BRAND } from "../utils/brand";

function DefaultPrivacyContent({ year, brand }) {
  return (
    <>
      <p className="legal-updated">
        Last updated: {year}. This policy describes how {brand.festName} and {brand.collegeFullName} handle information on MacFiesta Pro.
      </p>

      <h2>1. Information we collect</h2>
      <p>
        When you register for events we collect participant name, college, email, phone number, and account details needed to manage your registrations.
      </p>

      <h2>2. How we use information</h2>
      <ul>
        <li>To process event registrations and publish official fest results.</li>
        <li>To communicate schedule, venue, and payment status updates.</li>
        <li>To improve fest operations and website reliability.</li>
      </ul>

      <h2>3. Data sharing</h2>
      <p>
        We do not sell personal data. Limited information may be shared with event coordinators for legitimate fest administration.
      </p>

      <h2>4. Data retention</h2>
      <p>
        Registration records are retained for fest operations and institutional reporting as required by college policy.
      </p>

      <h2>5. Your rights</h2>
      <p>
        Contact us to request correction of inaccurate registration details or to raise privacy concerns.
      </p>

      <h2>6. Contact</h2>
      <p>
        Email: <a href={`mailto:${brand.contactEmail}`}>{brand.contactEmail}</a>
        {" · "}
        <Link to="/contact">Contact page</Link>
      </p>
    </>
  );
}

function renderCmsBlocks(body) {
  return body.split(/\n\n+/).map((block) => {
    const trimmed = block.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("## ")) {
      return <h2 key={trimmed.slice(0, 48)}>{trimmed.replace(/^##\s+/, "")}</h2>;
    }
    if (trimmed.startsWith("- ")) {
      const items = trimmed.split("\n").filter((line) => line.startsWith("- "));
      return (
        <ul key={trimmed.slice(0, 48)}>
          {items.map((item) => (
            <li key={item}>{item.replace(/^-\s+/, "")}</li>
          ))}
        </ul>
      );
    }
    return <p key={trimmed.slice(0, 48)}>{trimmed}</p>;
  });
}

export default function Privacy() {
  const settings = useSiteSettings();
  const year = settings?.fest_year || BRAND.festYear;
  const cmsPrivacy = settings?.privacy_body?.trim();

  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle={`How MacFiesta ${year} collects and uses participant information.`}
        image={PAGE_IMAGES.about}
      />

      <section className="section page-content">
        <div className="container narrow-wide legal-content">
          {cmsPrivacy ? renderCmsBlocks(cmsPrivacy) : <DefaultPrivacyContent year={year} brand={BRAND} />}
        </div>
      </section>
    </>
  );
}

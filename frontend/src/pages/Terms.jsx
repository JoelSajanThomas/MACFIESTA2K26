import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { useSiteSettings } from "../hooks/useSiteSettings";
import { PAGE_IMAGES } from "../utils/assets";
import { BRAND } from "../utils/brand";

function DefaultTermsContent({ year, brand }) {
  return (
    <>
      <p className="legal-updated">
        Last updated: {year}. These terms apply to MacFiesta Pro and MacFiesta {year} events hosted by {brand.collegeFullName}.
      </p>

      <h2>1. Acceptance of terms</h2>
      <p>
        By registering for events, accessing this website, or participating in MacFiesta {year},
        you agree to these Terms and Conditions. If you do not agree, do not register or participate.
      </p>

      <h2>2. Registration rules</h2>
      <ul>
        <li>Registrations must be completed through MacFiesta Pro or authorized fest desks only.</li>
        <li>Each participant must provide accurate name, college, contact email, and phone number.</li>
        <li>One registration per person per event unless the event format explicitly allows teams.</li>
        <li>Registration is confirmed only after successful submission and applicable fee payment (where required).</li>
        <li>The organizers may close registration when event capacity is reached.</li>
        <li>False or duplicate registrations may be cancelled without refund.</li>
      </ul>

      <h2>3. Event participation rules</h2>
      <ul>
        <li>Participants must report to the assigned venue at the scheduled time with valid college identification.</li>
        <li>Event-specific rules published on the event page form part of these terms.</li>
        <li>Judges&apos; and coordinators&apos; decisions are final for all competitions.</li>
        <li>Participants must follow campus rules, venue instructions, and safety guidelines at all times.</li>
      </ul>

      <h2>4. Payment and refunds</h2>
      <p>Registration fees, if applicable, are displayed on each event page before checkout.</p>

      <h2>5. Code of conduct</h2>
      <ul>
        <li>Respect fellow participants, volunteers, staff, judges, and campus property.</li>
        <li>Harassment, discrimination, violence, or vandalism will result in immediate removal.</li>
      </ul>

      <h2>6. Contact</h2>
      <p>
        Email: <a href={`mailto:${brand.contactEmail}`}>{brand.contactEmail}</a>
        {" · "}
        <Link to="/contact">Contact page</Link>
      </p>
    </>
  );
}

export default function Terms() {
  const settings = useSiteSettings();
  const year = settings?.fest_year || BRAND.festYear;
  const cmsTerms = settings?.terms_body?.trim();

  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms and Conditions"
        subtitle={`MacFiesta ${year} — participation terms for delegates, teams, and visitors.`}
        image={PAGE_IMAGES.about}
      />

      <section className="section page-content">
        <div className="container narrow-wide legal-content">
          {cmsTerms ? (
            cmsTerms.split(/\n\n+/).map((block) => {
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
            })
          ) : (
            <DefaultTermsContent year={year} brand={BRAND} />
          )}
        </div>
      </section>
    </>
  );
}

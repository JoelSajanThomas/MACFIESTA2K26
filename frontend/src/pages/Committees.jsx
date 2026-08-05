import PageHeader from "../components/PageHeader";
import { CORE_TEAM, COMMITTEE_HEADS } from "../utils/committees";
import { PAGE_IMAGES } from "../utils/assets";

function PersonCard({ person }) {
  return (
    <article className="committee-card detail-panel">
      <h3>{person.name}</h3>
      <p className="committee-role">{person.role}</p>
      {person.detail && <p className="committee-detail">{person.detail}</p>}
      <a className="committee-phone" href={`tel:${person.phone.replace(/\s/g, "")}`}>
        {person.phone}
      </a>
    </article>
  );
}

export default function Committees() {
  return (
    <>
      <PageHeader
        eyebrow="Organizing Team"
        title="Committees"
        subtitle="Core Team and committee heads coordinating MacFiesta. Contact numbers are for fest desk coordination."
        seoDescription="MacFiesta Core Team and committee heads with contact numbers."
        image={PAGE_IMAGES.about}
      />
      <section className="section page-content">
        <div className="container">
          <h2 className="section-title">Core Team</h2>
          <div className="committee-grid">
            {CORE_TEAM.map((p) => (
              <PersonCard key={p.name + p.phone} person={p} />
            ))}
          </div>

          <h2 className="section-title" style={{ marginTop: "2.5rem" }}>
            Heads
          </h2>
          <div className="committee-grid">
            {COMMITTEE_HEADS.map((p) => (
              <PersonCard key={p.name + p.role} person={p} />
            ))}
          </div>

          <p className="committee-note">
            Staff and volunteers use the shared Login page with staff accounts. Hospitality, Food and Finance desks
            work from Admin tools (verification, registrations, payment status) plus on-ground processes.
          </p>
        </div>
      </section>
    </>
  );
}

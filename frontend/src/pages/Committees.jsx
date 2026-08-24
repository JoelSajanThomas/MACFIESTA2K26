import PageHeader from "../components/PageHeader";
import SectionBadge from "../components/theme/SectionBadge";
import { CORE_TEAM, COMMITTEE_HEADS } from "../utils/committees";
import { PAGE_IMAGES } from "../utils/assets";
import { SUPERHERO_THEME } from "../theme/superheroTheme";
import { COMMITTEE_DIVISIONS } from "../theme/roster";
import { ORIGINAL_BACKGROUNDS } from "../theme/originalAssets";

function resolveDivision(roleOrName) {
  const raw = String(roleOrName || "").toLowerCase();
  const entries = Object.entries(COMMITTEE_DIVISIONS);
  for (const [key, div] of entries) {
    if (raw.includes(key)) return { key, ...div };
  }
  for (const [key, label] of Object.entries(SUPERHERO_THEME.committeeDisplay)) {
    if (raw.includes(key)) {
      return COMMITTEE_DIVISIONS[key]
        ? { key, ...COMMITTEE_DIVISIONS[key] }
        : { key, label, emblem: COMMITTEE_DIVISIONS.core.emblem };
    }
  }
  return { key: "core", ...COMMITTEE_DIVISIONS.core, label: roleOrName || "Division" };
}

function PersonCard({ person }) {
  const division = resolveDivision(person.role) || resolveDivision(person.detail);
  const displayRole = division.label || person.role;

  return (
    <article className="committee-card detail-panel comic-panel comic-panel--gold committee-division-card">
      <img
        src={division.emblem}
        alt=""
        className="committee-division-emblem"
        width={48}
        height={48}
        loading="lazy"
      />
      <SectionBadge tone="gold">Division</SectionBadge>
      <h3>{person.name}</h3>
      <p className="committee-role">{displayRole}</p>
      {person.detail && <p className="committee-detail">{person.detail}</p>}
      {person.phone && (
        <a className="committee-phone" href={`tel:${person.phone.replace(/\s/g, "")}`}>
          {person.phone}
        </a>
      )}
      {person.image && (
        <img src={person.image} alt="" className="committee-member-photo" loading="lazy" decoding="async" />
      )}
    </article>
  );
}

export default function Committees() {
  return (
    <>
      <PageHeader
        eyebrow="Command Divisions"
        title="Committees"
        subtitle="Meet the teams behind MacFiesta."
        seoDescription="MacFiesta Core Team and committee heads with contact numbers."
        image={PAGE_IMAGES.about}
      />
      <section
        className="section page-content committees-divisions mf-command-divisions"
        style={{ backgroundImage: `url(${ORIGINAL_BACKGROUNDS.command})` }}
      >
        <div className="committees-divisions__veil" />
        <div className="container">
          <h2 className="section-title">Core Command</h2>
          <div className="committee-grid">
            {CORE_TEAM.map((p) => (
              <PersonCard key={p.name + p.phone} person={p} />
            ))}
          </div>

          <h2 className="section-title" style={{ marginTop: "2.5rem" }}>
            Operational Divisions
          </h2>
          <div className="committee-grid">
            {COMMITTEE_HEADS.map((p) => (
              <PersonCard key={p.name + p.role} person={p} />
            ))}
          </div>

          <p className="committee-note">
            Staff and volunteers sign in at the same{" "}
            <a href="/login">Sign In</a>
            {" "}page as students — your assigned desk opens automatically after login.
          </p>
        </div>
      </section>
    </>
  );
}

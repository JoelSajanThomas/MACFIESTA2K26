import ScrollReveal from "../ScrollReveal";
import Mf1SectionHeader from "../Mf1SectionHeader";
import { BRAND } from "../../utils/brand";

/** Known seed / demo sponsor labels — never show as production partners. */
const DEMO_SPONSOR_NAMES = new Set(
  [
    "Campus Partner",
    "Tech Sponsor",
    "Cultural Partner",
    "Media House",
    "Student Council",
    "Event Partner",
  ].map((n) => n.toLowerCase())
);

function isDemoSponsor(sponsor) {
  const name = String(sponsor?.name || "").trim().toLowerCase();
  if (!name) return true;
  if (DEMO_SPONSOR_NAMES.has(name)) return true;
  return /^(tech|cultural|media|student|campus|event)\s+(sponsor|partner|house|council)$/i.test(name);
}

function LogoRow({ list }) {
  if (!list.length) return null;
  return (
    <div className="home-sponsors-row">
      {list.map((sponsor, i) => (
        <ScrollReveal key={sponsor.id || sponsor.name || i} delay={i} className="home-sponsor-item">
          <div className="home-sponsor-logo">
            {sponsor.logo ? (
              <img src={sponsor.logo} alt="" loading="lazy" decoding="async" />
            ) : (
              <span>{sponsor.name}</span>
            )}
          </div>
          {sponsor.logo && sponsor.name ? (
            <p className="home-sponsor-name">{sponsor.name}</p>
          ) : null}
        </ScrollReveal>
      ))}
    </div>
  );
}

/**
 * Sponsors — Presented By MACFAST + real CMS sponsors only (no seed placeholders).
 */
export default function HomeSponsors({ sponsors = [] }) {
  const realSponsors = sponsors.filter(
    (s) => s?.name && s?.is_active !== false && !isDemoSponsor(s)
  );

  const presentedList = [{ name: BRAND.collegeName, tier: "Host", logo: null }];
  const officialList = realSponsors.filter((s) => !/^macfast$/i.test(String(s.name).trim()));

  return (
    <section className="home-sponsors section" id="sponsors" aria-labelledby="sponsors-title">
      <div className="container">
        <ScrollReveal>
          <Mf1SectionHeader
            id="sponsors-title"
            badge="Sponsors & Partners"
            title="Our Sponsors"
            titleAccent="& Partners"
          />
        </ScrollReveal>

        <div className="home-sponsors-block">
          <ScrollReveal>
            <h3 className="mf1-footer__col-label">Presented By</h3>
          </ScrollReveal>
          <LogoRow list={presentedList} />
        </div>

        <div className="home-sponsors-block">
          <ScrollReveal>
            <h3 className="mf1-footer__col-label">Official Sponsors</h3>
          </ScrollReveal>
          {officialList.length > 0 ? (
            <LogoRow list={officialList} />
          ) : (
            <p className="home-sponsors-empty">Official sponsor announcements coming soon.</p>
          )}
        </div>
      </div>
    </section>
  );
}

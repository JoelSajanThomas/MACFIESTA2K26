import ScrollReveal from "../ScrollReveal";
import Mf1SectionHeader from "../Mf1SectionHeader";
import { REF_UI } from "../../utils/assets";
import { BRAND } from "../../utils/brand";

const TWO_DAY_THEME_DESC =
  "Two days of competition, creativity, technology, culture, and entertainment come together at MACFAST as students rise to take on the MacFiesta arena.";

const CANONICAL_THEME_TITLE = `MACFIESTA ${BRAND.festYear} — MARVEL × DC`;

const MARVEL_FRAMES = [
  { src: REF_UI.floatLeft, label: "Marvel energy" },
  { src: REF_UI.heroScarletOrbit, label: "Scarlet orbit" },
  { src: REF_UI.panelA, label: "Arena panel" },
  { src: REF_UI.panelB, label: "Clash panel" },
];

const DC_FRAMES = [
  { src: REF_UI.floatRight, label: "DC energy" },
  { src: REF_UI.heroCobaltVigil, label: "Cobalt vigil" },
  { src: REF_UI.panelC, label: "Night panel" },
  { src: REF_UI.panelD, label: "Legacy panel" },
];

function resolvePublicThemeTitle(rawTitle) {
  const raw = String(rawTitle || "").trim();
  if (!raw || /^campus carnival$/i.test(raw)) return CANONICAL_THEME_TITLE;

  const normalized = raw
    .replace(/MACFiESTA/gi, "MACFIESTA")
    .replace(/Macfiesta/gi, "MacFiesta")
    .replace(/\s*[–—-]\s*/g, " — ")
    .trim();

  const hasFest = /MACFIESTA\s*20\d{2}/i.test(normalized);
  const hasMarvelDc = /MARVEL/i.test(normalized) && /DC/i.test(normalized);

  if (hasFest && hasMarvelDc) return CANONICAL_THEME_TITLE;
  if (/^marvel\s*[×x]\s*dc$/i.test(normalized)) return CANONICAL_THEME_TITLE;
  if (/^MARVEL\s*×\s*DC$/i.test(normalized)) return CANONICAL_THEME_TITLE;

  return normalized;
}

function resolveThemeDescription(rawDescription) {
  const raw = String(rawDescription || "").trim();
  if (!raw) return TWO_DAY_THEME_DESC;
  if (/three\s+days/i.test(raw)) return TWO_DAY_THEME_DESC;
  return raw;
}

/** Theme section — Marvel × DC with character / panel artwork */
export default function HomeTheme({ theme }) {
  const themeTitle = resolvePublicThemeTitle(theme?.title);
  const description = resolveThemeDescription(theme?.description);

  return (
    <section className="home-theme section home-theme-marvel-dc" aria-labelledby="fest-theme-title">
      <div className="home-theme-bg" aria-hidden="true">
        <img
          src={REF_UI.atmosphere}
          alt=""
          className="home-theme-bg-gif"
          loading="lazy"
          decoding="async"
        />
        <div className="home-theme-overlay" />
      </div>

      <div className="container home-theme-content">
        <ScrollReveal delay={1}>
          <Mf1SectionHeader
            id="fest-theme-title"
            badge="Fest Theme"
            title="Marvel"
            titleAccent="× DC"
            subtitle={description}
          />
          <div className="mvd-versus-strip home-theme-versus" aria-hidden="true">
            <span className="mvd-versus-side mvd-versus-side--marvel">
              <img src={REF_UI.emblemRed} alt="" width={28} height={28} />
              Marvel
            </span>
            <span className="mvd-versus-badge">VS</span>
            <span className="mvd-versus-side mvd-versus-side--dc">
              <img src={REF_UI.emblemBlue} alt="" width={28} height={28} />
              DC
            </span>
          </div>
          <p className="home-theme-kicker">Heroes Rise. Legends Compete.</p>
          <p className="home-theme-title home-theme-title--canonical">{themeTitle}</p>
        </ScrollReveal>

        <ScrollReveal delay={2} className="home-theme-clash">
          <figure className="home-theme-clash__side home-theme-clash__side--marvel">
            <img
              src={REF_UI.heroScarletOrbit}
              alt="Marvel universe side"
              loading="lazy"
              decoding="async"
            />
            <figcaption>
              <img src={REF_UI.emblemRed} alt="" width={36} height={36} />
              <span>Marvel</span>
            </figcaption>
          </figure>

          <figure className="home-theme-clash__versus">
            <img
              src={REF_UI.marvelDcVersusStatic}
              alt="Marvel versus DC"
              loading="lazy"
              decoding="async"
            />
          </figure>

          <figure className="home-theme-clash__side home-theme-clash__side--dc">
            <img
              src={REF_UI.heroCobaltVigil}
              alt="DC universe side"
              loading="lazy"
              decoding="async"
            />
            <figcaption>
              <img src={REF_UI.emblemBlue} alt="" width={36} height={36} />
              <span>DC</span>
            </figcaption>
          </figure>
        </ScrollReveal>

        <ScrollReveal delay={3} className="home-theme-frames" aria-label="Marvel and DC theme frames">
          <div className="home-theme-frames__col home-theme-frames__col--marvel">
            {MARVEL_FRAMES.map((frame) => (
              <img key={frame.src} src={frame.src} alt={frame.label} loading="lazy" decoding="async" />
            ))}
          </div>
          <div className="home-theme-frames__col home-theme-frames__col--dc">
            {DC_FRAMES.map((frame) => (
              <img key={frame.src} src={frame.src} alt={frame.label} loading="lazy" decoding="async" />
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

import { Link, useNavigate } from "react-router-dom";
import { DAY1_DATE, DAY1_THEME, DAY2_DATE, DAY2_THEME } from "../../utils/festDays";
import { ORIGINAL_HERO_IMAGES, ORIGINAL_EMBLEM_IMAGES } from "../../theme/originalAssets";
import ScrollReveal from "../ScrollReveal";

function formatDayLong(iso) {
  try {
    return new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function DayCard({
  variant,
  dayLabel,
  titleLines,
  theme,
  dateIso,
  eventsTo,
  scheduleTo,
  scheduleLabel,
  heroSrc,
  emblemSrc,
  ariaTitle,
}) {
  const navigate = useNavigate();
  const universeClass = variant === "school" ? "title-red-universe" : "title-blue-universe";

  return (
    <article
      className={`home-two-day-card home-two-day-card--${variant} ux-day-card`}
      onClick={() => navigate(eventsTo)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(eventsTo);
        }
      }}
      role="link"
      tabIndex={0}
      aria-label={`View ${ariaTitle}`}
    >
      <div className="home-two-day-media" aria-hidden="true">
        <img src={heroSrc} alt="" loading="lazy" decoding="async" />
        <img className="home-two-day-emblem" src={emblemSrc} alt="" loading="lazy" />
        <div className="ux-day-card__veil" />
      </div>
      <div className={`home-two-day-body ux-day-card__body ${universeClass}`}>
        <p className="title-universe-chip" aria-hidden="true">
          {dayLabel}
        </p>
        <h3 className="title-stack">
          {titleLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h3>
        <p className="home-two-day-theme">{theme}</p>
        <p className="ux-day-card__date">{formatDayLong(dateIso)}</p>
        <div className="home-two-day-actions ux-day-card__actions">
          <Link to={eventsTo} className="btn btn-gold" onClick={(e) => e.stopPropagation()}>
            View {ariaTitle}
          </Link>
          <Link to={scheduleTo} className="btn btn-outline" onClick={(e) => e.stopPropagation()}>
            {scheduleLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}

/**
 * School / College paths — clear CTAs; universe styling is visual only.
 */
export default function HomeTwoDay() {
  return (
    <section className="section home-two-day home-two-day--pro ux-two-day" aria-labelledby="two-day-title">
      <div className="container">
        <ScrollReveal>
          <header className="ux-section-head">
            <p className="ux-section-head__eyebrow">Two universes · Two days</p>
            <h2 id="two-day-title" className="ux-section-head__title">
              Marvel school &amp; DC <span>college</span>
            </h2>
            <p className="ux-section-head__sub">
              Day 1 is the Marvel arena for school events. Day 2 is the DC arena for college events.
              Pick your universe and enter the championship.
            </p>
          </header>
        </ScrollReveal>

        <div className="home-two-day-grid ux-two-day__grid">
          <ScrollReveal variant="left">
            <DayCard
              variant="school"
              dayLabel="Day 01 · Marvel"
              titleLines={["School", "Events"]}
              ariaTitle="School Events"
              theme={`${DAY1_THEME} · Marvel Universe`}
              dateIso={DAY1_DATE}
              eventsTo="/events?day=school"
              scheduleTo="/schedule?day=school"
              scheduleLabel="View School Schedule"
              heroSrc={ORIGINAL_HERO_IMAGES.scarletOrbit}
              emblemSrc={ORIGINAL_EMBLEM_IMAGES.redUniverse}
            />
          </ScrollReveal>
          <ScrollReveal delay={1} variant="right">
            <DayCard
              variant="college"
              dayLabel="Day 02 · DC"
              titleLines={["College", "Events"]}
              ariaTitle="College Events"
              theme={`${DAY2_THEME} · DC Universe`}
              dateIso={DAY2_DATE}
              eventsTo="/events?day=college"
              scheduleTo="/schedule?day=college"
              scheduleLabel="View College Schedule"
              heroSrc={ORIGINAL_HERO_IMAGES.cobaltVigil}
              emblemSrc={ORIGINAL_EMBLEM_IMAGES.blueUniverse}
            />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

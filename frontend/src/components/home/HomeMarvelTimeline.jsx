import { MF1_MARVEL } from "../../utils/assets";

const TIMELINE_STEPS = [
  {
    phase: "PHASE I",
    micro: "Recruitment",
    titleLines: ["Registration", "Opens"],
    date: "August 1, 2026",
    desc: "Create an account and register online for eligible events.",
    accent: "#F0C14B",
  },
  {
    phase: "PHASE II",
    micro: "Command Entry",
    titleLines: ["Fest", "Check-In"],
    date: "September 24, 2026 · 8:00 AM",
    desc: "Complete on-campus verification and access your digital participant pass.",
    accent: "#ED1D24",
  },
  {
    phase: "PHASE III",
    micro: "Battle Arena",
    titleLines: ["Competitions"],
    date: "September 24–25, 2026",
    desc: "Take part in technology, cultural, management, gaming, and creative events across campus.",
    accent: "#FFE08A",
  },
  {
    phase: "PHASE IV",
    micro: "Hall of Heroes",
    titleLines: ["Grand", "Finale"],
    date: "September 25, 2026 · Evening",
    desc: "Results, awards, performances, and the closing celebration of MacFiesta 2026.",
    accent: "#8F1018",
  },
];

/** Festival roadmap — clear phases; themed micro-labels secondary. */
export default function HomeMarvelTimeline() {
  return (
    <section className="mf1-zip-section mf1-timeline ux-roadmap" aria-labelledby="timeline-title">
      <div className="mf1-zip-section__bg mf1-zip-section__bg--soft" aria-hidden="true">
        <img src={MF1_MARVEL.spider} alt="" loading="lazy" decoding="async" />
        <div className="mf1-zip-section__veil" />
      </div>

      <div className="container mf1-zip-section__inner">
        <header className="ux-section-head">
          <p className="ux-section-head__eyebrow">Festival roadmap</p>
          <h2 id="timeline-title" className="ux-section-head__title">
            From registration to <span>finale</span>
          </h2>
          <p className="ux-section-head__sub">
            Four phases from registration to the grand finale and awards ceremony.
          </p>
        </header>

        <ol className="mf1-timeline__list ux-roadmap__list">
          {TIMELINE_STEPS.map((step) => (
            <li
              key={step.phase}
              className="mf1-timeline__item ux-roadmap__item"
              style={{ "--accent": step.accent }}
            >
              <span className="mf1-timeline__dot ux-roadmap__dot" aria-hidden="true" />
              <div className="mf1-timeline__card ux-roadmap__card">
                <p className="mf1-timeline__phase">
                  {step.phase}
                  <span className="ux-roadmap__micro" aria-hidden="true">
                    {" "}
                    • {step.micro}
                  </span>
                </p>
                <h3 className="title-stack ux-roadmap__title">
                  {step.titleLines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </h3>
                <p className="mf1-timeline__date">{step.date}</p>
                <p className="mf1-timeline__desc">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

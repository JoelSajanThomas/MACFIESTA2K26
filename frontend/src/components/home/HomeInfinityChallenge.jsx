import { useState } from "react";
import { MF1_MARVEL } from "../../utils/assets";
import Mf1SectionHeader from "../Mf1SectionHeader";

const INFINITY_STONES = [
  {
    name: "Space Stone",
    color: "#00D4FF",
    domain: "Networking & Cloud Warfare",
    desc: "Control over spatial computing, cloud architecture, and serverless hackathons.",
  },
  {
    name: "Reality Stone",
    color: "#ED1D24",
    domain: "AR/VR & UI/UX Realm",
    desc: "Alter perception through 3D modeling, game design, and immersive digital worlds.",
  },
  {
    name: "Power Stone",
    color: "#7B2FBE",
    domain: "Esports & Gaming Gauntlet",
    desc: "Raw competitive strength in BGMI, Valorant, FIFA, and console battles.",
  },
  {
    name: "Mind Stone",
    color: "#FFD700",
    domain: "AI & Algorithmic Conquest",
    desc: "Unleash machine learning, competitive programming, and neural networking brilliance.",
  },
  {
    name: "Time Stone",
    color: "#10B981",
    domain: "Speed Coding & Live Debates",
    desc: "Master time-pressured challenges, rapid debugging, and fast-paced quizzes.",
  },
  {
    name: "Soul Stone",
    color: "#FF8C00",
    domain: "Cultural Arts & Pro Concert",
    desc: "Infuse your passion into dance, beatboxing, music bands, and dramatic arts.",
  },
];

/** MACFIESTA1 Infinity Gauntlet Challenge section (frontend-only). */
export default function HomeInfinityChallenge() {
  const [active, setActive] = useState(INFINITY_STONES[0]);

  return (
    <section
      className="mf1-zip-section mf1-infinity"
      aria-labelledby="infinity-title"
      style={{ "--stone": active.color }}
    >
      <div className="mf1-zip-section__bg" aria-hidden="true">
        <img src={MF1_MARVEL.infinityBg} alt="" loading="lazy" decoding="async" />
        <div className="mf1-zip-section__veil" />
      </div>

      <div className="container mf1-zip-section__inner">
        <Mf1SectionHeader
          id="infinity-title"
          badge="The Six Domains of Victory"
          title="Infinity Gauntlet"
          titleAccent="Challenge"
          subtitle="Explore 6 unique event domains — compete across technology, gaming, cultural arts, management, and more at MACFIESTA."
        />

        <div className="mf1-infinity__stones" role="list">
          {INFINITY_STONES.map((stone) => {
            const selected = active.name === stone.name;
            return (
              <button
                key={stone.name}
                type="button"
                role="listitem"
                className={`mf1-infinity__stone${selected ? " is-active" : ""}`}
                style={{
                  borderColor: selected ? stone.color : undefined,
                  boxShadow: selected ? `0 0 24px ${stone.color}55` : undefined,
                }}
                onClick={() => setActive(stone)}
              >
                <span
                  className="mf1-infinity__gem"
                  style={{ background: stone.color, boxShadow: `0 0 16px ${stone.color}` }}
                >
                  ★
                </span>
                <span>{stone.name}</span>
              </button>
            );
          })}
        </div>

        <div
          className="mf1-infinity__detail"
          style={{ borderColor: `${active.color}70` }}
        >
          <div
            className="mf1-infinity__detail-gem"
            style={{ background: active.color, boxShadow: `0 0 32px ${active.color}` }}
          >
            ★
          </div>
          <div>
            <p className="mf1-infinity__detail-meta" style={{ color: active.color }}>
              {active.name} · {active.domain}
            </p>
            <h3>{active.domain}</h3>
            <p>{active.desc}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

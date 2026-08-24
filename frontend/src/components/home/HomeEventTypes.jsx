import { Link } from "react-router-dom";
import ScrollReveal from "../ScrollReveal";
import Mf1SectionHeader from "../Mf1SectionHeader";
import { useTilt } from "../../hooks/useTilt";
import { categoryImages, REF_UI } from "../../utils/assets";

const EVENT_TYPE_META = [
  {
    label: "SOLO",
    participants: "1 Participant",
    description: "Compete individually and represent your skill.",
    image: categoryImages.tech || REF_UI.panelA,
  },
  {
    label: "DUO",
    participants: "2 Participants",
    description: "Team up with one partner.",
    image: categoryImages.dance || REF_UI.panelB,
  },
  {
    label: "TRIO",
    participants: "3 Participants",
    description: "Compete as a three-member team.",
    image: categoryImages.music || REF_UI.panelC,
  },
  {
    label: "SQUAD",
    participants: "4 Participants",
    description: "Designed for gaming, technology, and team challenges.",
    image: categoryImages.gaming || REF_UI.panelD,
  },
  {
    label: "GROUP",
    participants: "Team Event",
    description: "Built for performances and larger team competitions.",
    image: categoryImages.cultural || REF_UI.panelA,
  },
];

/**
 * Event format cards — Solo → Group.
 */
export default function HomeEventTypes({ formats = [] }) {
  const tiles = formats.length
    ? formats.map((fmt, i) => ({
        ...EVENT_TYPE_META[i % EVENT_TYPE_META.length],
        ...fmt,
        image: EVENT_TYPE_META[i % EVENT_TYPE_META.length].image,
        description:
          EVENT_TYPE_META[i % EVENT_TYPE_META.length].description ||
          fmt.description ||
          fmt.desc,
      }))
    : EVENT_TYPE_META;

  return (
    <section
      className="home-types section home-universe-section mf-divisions home-types--pro"
      aria-labelledby="event-types-title"
    >
      <div className="container">
        <ScrollReveal>
          <Mf1SectionHeader
            id="event-types-title"
            badge="Event Formats"
            title="Compete"
            titleAccent="Your Way"
            subtitle="Choose from individual, pair, trio, squad, and group competitions."
          />
        </ScrollReveal>
        <div className="home-types-grid">
          {tiles.map((fmt, i) => (
            <EventTypeTile key={fmt.id || fmt.label || i} fmt={fmt} delay={i} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function EventTypeTile({ fmt, delay, index }) {
  const tiltRef = useTilt(true, 4.25);
  const meta = EVENT_TYPE_META[index] || EVENT_TYPE_META[EVENT_TYPE_META.length - 1];
  const image = fmt.image || meta.image;
  const description = meta.description;

  return (
    <ScrollReveal ref={tiltRef} delay={delay} className="home-type-tile comic-panel home-type-tile--media">
      <div className="home-type-tile__media" aria-hidden="true">
        <img src={image} alt="" loading="lazy" decoding="async" />
      </div>
      <div className="home-type-tile__body">
        <h3 className="home-type-tile__label">{meta.label}</h3>
        <p className="home-type-tile__count">{meta.participants}</p>
        <p className="home-type-tile__desc">{description}</p>
        <Link to={fmt.link || "/events"} className="home-type-cta">
          View Events
        </Link>
      </div>
    </ScrollReveal>
  );
}

import ScrollReveal from "../ScrollReveal";
import Mf1SectionHeader from "../Mf1SectionHeader";
import { ORIGINAL_BACKGROUNDS } from "../../theme/originalAssets";
import { useTilt } from "../../hooks/useTilt";

/** Guest Profile — single clean guest presentation. */
export default function HomeGuest({ guests = [] }) {
  const list = guests.length ? guests : [];
  if (!list.length) return null;

  return (
    <section
      className="home-guest section home-universe-section legends-multiverse"
      style={{ backgroundImage: `url(${ORIGINAL_BACKGROUNDS.guest})` }}
      aria-labelledby="guest-profile-title"
    >
      <div className="legends-multiverse__veil" />
      <div className="container">
        <ScrollReveal>
          <Mf1SectionHeader
            id="guest-profile-title"
            badge="Special Guest"
            title="Featured"
            titleAccent="Guest"
          />
        </ScrollReveal>

        <div className={`legends-guest-grid${list.length > 1 ? " multi" : ""}`}>
          {list.map((guest, i) => (
            <GuestCard key={guest.name + i} guest={guest} delay={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function GuestCard({ guest, delay }) {
  const tiltRef = useTilt(true, 4.5);
  const alt = guest.alt || `${guest.name} at MacFiesta 2026`;

  return (
    <ScrollReveal ref={tiltRef} delay={delay} className="home-guest-card legends-guest-card">
      {guest.image && (
        <div className="home-guest-photo">
          <img
            src={guest.image}
            alt={alt}
            loading="lazy"
            decoding="async"
            sizes="(max-width: 640px) 100vw, 320px"
          />
        </div>
      )}
      <div className="home-guest-info">
        <h3>{guest.name}</h3>
        {guest.role ? <p className="home-guest-role">{guest.role}</p> : null}
        {(guest.bio || guest.description) ? (
          <p className="home-guest-bio">{guest.bio || guest.description}</p>
        ) : null}
      </div>
    </ScrollReveal>
  );
}

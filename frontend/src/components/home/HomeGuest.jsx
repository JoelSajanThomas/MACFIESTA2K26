import ScrollReveal from "../ScrollReveal";



export default function HomeGuest({ guests = [] }) {

  const guest = guests[0];

  if (!guest) return null;



  return (

    <section className="home-guest section">

      <div className="container">

        <ScrollReveal>

          <h2 className="home-section-title">Guest Profile</h2>

        </ScrollReveal>

        <div className="home-guest-card">

          {guest.image && (

            <ScrollReveal variant="scale" className="home-guest-photo">

              <img src={guest.image} alt={guest.alt || guest.name} loading="lazy" decoding="async" sizes="(max-width: 640px) 100vw, 320px" />

            </ScrollReveal>

          )}

          <ScrollReveal delay={2} className="home-guest-info">

            <h3>{guest.name}</h3>

            <p className="home-guest-role">{guest.role}</p>

            <p className="home-guest-bio">{guest.bio || guest.description}</p>

          </ScrollReveal>

        </div>

      </div>

    </section>

  );

}



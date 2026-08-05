import ScrollReveal from "../ScrollReveal";

import { categoryImages } from "../../utils/assets";



export default function HomeTheme({ theme }) {

  if (!theme) return null;



  const bgImage = theme.image || categoryImages.cultural;



  return (

    <section className="home-theme section">

      <div className="home-theme-bg">

        <ScrollReveal variant="scale" className="home-theme-bg-reveal">

          <img src={bgImage} alt={`${theme.title} fest theme`} loading="lazy" decoding="async" />

        </ScrollReveal>

        <div className="home-theme-overlay" />

      </div>

      <div className="container home-theme-content">

        <ScrollReveal delay={1}>

          <p className="home-theme-eyebrow">Our Fest Theme This Year</p>

          <h2 className="home-theme-title">{theme.title}</h2>

          <p className="home-theme-desc">{theme.description}</p>

        </ScrollReveal>

      </div>

    </section>

  );

}



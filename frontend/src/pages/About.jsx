import { motion } from "framer-motion";

import PageHeader from "../components/PageHeader";

import ScrollReveal from "../components/ScrollReveal";

import { useSiteSettings } from "../hooks/useSiteSettings";

import { PAGE_IMAGES } from "../utils/assets";

import { FEST_THEME, OFFICIAL_SITE } from "../utils/constants";

import { MACFAST_ABOUT, CAMPUS_LIFE_IMAGES } from "../utils/pageContent";



const VALUES = [

  { title: "National Reach", desc: "Students from institutions across India come together at MACFAST." },

  { title: "Every Format", desc: "Solo, duo, trio, squad, and group events — something for every team." },

  { title: "Legends Rise", desc: "Where champions are made and memories last beyond the fest." },

];



export default function About() {

  const settings = useSiteSettings();

  const year = settings?.fest_year || new Date().getFullYear();

  const college = settings?.college_name || "MACFAST";

  const title = settings?.about_title || `Welcome to Macfiesta ${year}`;

  const body = settings?.about_body;

  const heroImage = settings?.about_image_url || PAGE_IMAGES.about;

  const officialSite = settings?.official_website || OFFICIAL_SITE;



  return (

    <>

      <PageHeader

        eyebrow={`Macfiesta ${year}`}

        title="About Macfiesta"

        subtitle={`National level fest of ${college} — where legends rise.`}

        image={heroImage}

      />

      <section className="section page-content">

        <div className="container about-page-grid">

          <ScrollReveal>

            <h2>{title}</h2>

            {body ? (

              body.split(/\n\n+/).map((para) => (

                <p key={para.slice(0, 40)}>{para.trim()}</p>

              ))

            ) : (

              <>

                <p>

                  Macfiesta is the national-level fest of {college}. We expect students from all

                  over the country, representing diverse backgrounds, institutions, and regions.

                </p>

                <p>

                  This year&apos;s theme is <strong>{FEST_THEME}</strong> — a celebration of

                  campus energy, competitions, and culture at MACFAST.

                </p>

              </>

            )}

            {officialSite && (

              <a href={officialSite} target="_blank" rel="noopener noreferrer" className="btn btn-outline">

                Visit Official Site →

              </a>

            )}

          </ScrollReveal>

          <ScrollReveal delay={1}>

            <img

              src={heroImage}

              alt={`${college} campus during festival week`}

              className="about-page-img"

              loading="lazy"

              decoding="async"

              width="800"

              height="533"

            />

          </ScrollReveal>

        </div>



        <div className="container about-macfast-block">

          <ScrollReveal>

            <h2 className="home-section-title">About MACFAST</h2>

            <h3>{MACFAST_ABOUT.welcomeTitle}</h3>

            <p>{MACFAST_ABOUT.welcomeBody}</p>

          </ScrollReveal>

        </div>



        <div className="container about-vision-grid">

          <ScrollReveal className="detail-panel">

            <h3>{MACFAST_ABOUT.visionTitle}</h3>

            <p>{MACFAST_ABOUT.visionBody}</p>

          </ScrollReveal>

          <ScrollReveal className="detail-panel" delay={1}>

            <h3>{MACFAST_ABOUT.missionTitle}</h3>

            <p>{MACFAST_ABOUT.missionBody}</p>

          </ScrollReveal>

        </div>



        <div className="container">

          <ScrollReveal>

            <h2 className="home-section-title">Campus Life</h2>

          </ScrollReveal>

          <div className="campus-life-grid">

            {CAMPUS_LIFE_IMAGES.map((img, i) => (

              <ScrollReveal key={img.title} delay={i % 4} className="campus-life-card">

                <img src={img.src} alt={img.alt} loading="lazy" decoding="async" />

                <span>{img.title}</span>

              </ScrollReveal>

            ))}

          </div>

        </div>



        <div className="container values-grid">

          {VALUES.map((v, i) => (

            <motion.div

              key={v.title}

              className="value-card"

              initial={{ opacity: 0, y: 20 }}

              whileInView={{ opacity: 1, y: 0 }}

              viewport={{ once: true }}

              transition={{ delay: i * 0.1 }}

            >

              <h3>{v.title}</h3>

              <p>{v.desc}</p>

            </motion.div>

          ))}

        </div>

      </section>

    </>

  );

}



import ScrollReveal from "../components/ScrollReveal";
import { FEST_HISTORY } from "../utils/pageContent";
import PageHeader from "../components/PageHeader";
import { PAGE_IMAGES } from "../utils/assets";
import { usePageSeo } from "../hooks/usePageSeo";

export default function History() {
  usePageSeo({
    title: "Macfiesta History",
    description: "The story of Macfiesta — from foundation to Marvel × DC 2026.",
    image: PAGE_IMAGES.about,
  });

  return (
    <>
      <PageHeader
        eyebrow="Our legacy"
        title="MACFIESTA History"
        subtitle="Foundation, growth, Retro Fiesta, and Marvel × DC 2026."
        image={PAGE_IMAGES.results}
      />
      <section className="section page-content history-page">
        <div className="container history-timeline">
          {FEST_HISTORY.map((item, i) => (
            <ScrollReveal key={item.title} delay={i % 4} className="history-timeline-item detail-panel">
              <span className="history-year">{item.year}</span>
              <h2>{item.title}</h2>
              <p>{item.body}</p>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </>
  );
}

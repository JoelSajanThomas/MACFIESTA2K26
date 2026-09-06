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
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Marvel Image Backdrop */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/MARVEL/download (6).jpg"
          alt="History Marvel Backdrop"
          className="w-full h-full object-cover object-center opacity-85 contrast-[1.05] saturate-[1.1] brightness-[0.92]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05050A]/40 via-black/25 to-[#05050A]/85 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(5,5,10,0.6)_100%)] pointer-events-none" />
      </div>

      <div className="relative z-10">
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
      </div>
    </div>
  );
}

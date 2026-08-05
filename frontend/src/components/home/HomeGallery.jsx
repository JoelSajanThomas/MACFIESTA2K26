import { Link } from "react-router-dom";
import ScrollReveal from "../ScrollReveal";
import GalleryGrid from "../GalleryGrid";

export default function HomeGallery({ items }) {
  return (
    <section className="home-gallery section">
      <div className="container">
        <ScrollReveal>
          <h2 className="home-section-title">Gallery Glimpses</h2>
        </ScrollReveal>
        <GalleryGrid items={items} preview limit={6} />
        <div className="home-section-link-wrap">
          <Link to="/gallery" className="home-text-link">View full gallery →</Link>
        </div>
      </div>
    </section>
  );
}

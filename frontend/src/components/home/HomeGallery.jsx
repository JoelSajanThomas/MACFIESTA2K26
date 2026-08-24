import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { RiGalleryLine, RiArrowRightLine } from "react-icons/ri";

const DEFAULT_GALLERY = [
  { src: "/MARVEL/In a city that never sleeps, I find my….png", title: "Opening Ceremony", category: "General" },
  { src: "/MARVEL/4081455907815375.png", title: "Hackathon Arena", category: "Technical" },
  { src: "/MARVEL/3025924746959430.jpg", title: "Gaming Lounge", category: "Gaming" },
  { src: "/MARVEL/Doctor Strange.png", title: "Cultural Pro-Show", category: "Cultural" },
  { src: "/MARVEL/The Spider….jpg", title: "Photography Contest", category: "Arts" },
  { src: "/MARVEL/658651514296997716.png", title: "Management Case Study", category: "Management" },
];

export default function HomeGallery({ items }) {
  const displayItems = (items && items.length > 0)
    ? items.filter((item) => item?.src).slice(0, 6)
    : DEFAULT_GALLERY;

  return (
    <section
      id="gallery"
      style={{
        position: "relative",
        padding: "80px 24px",
        borderTop: "1px solid rgba(123, 47, 190, 0.2)",
        background: "transparent",
        overflow: "hidden",
      }}
      aria-labelledby="gallery-glimpses-title"
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto", position: "relative", zIndex: 10 }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 40px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 18px",
              borderRadius: "50px",
              border: "1px solid rgba(123, 47, 190, 0.3)",
              background: "rgba(123, 47, 190, 0.1)",
              color: "#B55FE6",
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: "16px",
              boxShadow: "0 0 15px rgba(123,47,190,0.2)",
            }}
          >
            <RiGalleryLine />
            <span>GALLERY HIGHLIGHTS</span>
          </div>

          <h2
            id="gallery-glimpses-title"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.4rem)",
              fontWeight: "900",
              textTransform: "uppercase",
              color: "#FFFFFF",
              margin: "0 0 12px",
              fontFamily: "var(--font-excon-black)",
              letterSpacing: "0.02em",
            }}
          >
            Moments from <span style={{ color: "#00D4FF" }}>MacFiesta</span>
          </h2>

          <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.75)", lineHeight: "1.6" }}>
            Explore visual highlights from competitions, stages, esports leagues, and celebratory pro shows.
          </p>
        </div>

        {/* Gallery Image Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {displayItems.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              whileHover={{ y: -6 }}
              style={{
                borderRadius: "16px",
                overflow: "hidden",
                height: "220px",
                position: "relative",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
              }}
            >
              <img
                src={item.src}
                alt={item.title || "Gallery memory"}
                style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(1.05) contrast(1.15)" }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(180deg, transparent 50%, rgba(5, 5, 10, 0.9) 100%)",
                  display: "flex",
                  alignItems: "flex-end",
                  padding: "16px",
                }}
              >
                <span style={{ fontSize: "13px", fontWeight: "800", color: "#FFFFFF", textTransform: "uppercase" }}>
                  {item.title || "MacFiesta Moment"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View Full Gallery Action */}
        <div style={{ textAlign: "center", marginTop: "36px" }}>
          <Link
            to="/gallery"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 28px",
              borderRadius: "50px",
              border: "1px solid rgba(0, 212, 255, 0.4)",
              background: "rgba(0, 212, 255, 0.1)",
              color: "#FFFFFF",
              fontSize: "12px",
              fontWeight: "800",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              textDecoration: "none",
              boxShadow: "0 0 15px rgba(0,212,255,0.2)",
            }}
          >
            <span>View Full Gallery</span>
            <RiArrowRightLine />
          </Link>
        </div>

      </div>
    </section>
  );
}

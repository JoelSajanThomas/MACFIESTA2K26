import { motion } from "framer-motion";
import { RiStarFill, RiChatQuoteLine } from "react-icons/ri";

const TESTIMONIALS = [
  {
    quote: "MacFiesta 2K24 was absolute fire! The gaming arena structure and stage lighting rivaled major esports setups.",
    name: "Adarsh Sen",
    college: "CET Trivandrum",
    rating: 5,
  },
  {
    quote: "Outstanding organizational structure. From registration QR passes to schedule timelines, everything was extremely seamless.",
    name: "Sneha Nair",
    college: "TKM Kollam",
    rating: 5,
  },
  {
    quote: "The concert show was legendary. I have never seen a college fest crowd so packed and energized!",
    name: "Rohan Mathew",
    college: "Sacred Heart Thevara",
    rating: 5,
  },
];

export default function HomeTestimonials() {
  return (
    <section
      id="testimonials"
      style={{
        position: "relative",
        padding: "80px 24px",
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        background: "transparent",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto", position: "relative", zIndex: 10 }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 48px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 18px",
              borderRadius: "50px",
              border: "1px solid rgba(255, 215, 0, 0.3)",
              background: "rgba(255, 215, 0, 0.1)",
              color: "#FFD700",
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: "16px",
              boxShadow: "0 0 15px rgba(255,215,0,0.2)",
            }}
          >
            <RiChatQuoteLine />
            <span>WHAT PARTICIPANTS SAY</span>
          </div>

          <h2
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
            What They <span style={{ color: "#00D4FF" }}>Say</span> &amp; <span style={{ color: "#ED1D24" }}>Reviews</span>
          </h2>

          <div style={{ height: "2px", width: "96px", margin: "0 auto", background: "linear-gradient(90deg, #FFD700, #ED1D24)" }} />
        </div>

        {/* 3 Review Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
          {TESTIMONIALS.map((item, idx) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -6, borderColor: "rgba(0, 212, 255, 0.5)" }}
              style={{
                background: "rgba(10, 14, 26, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "20px",
                padding: "32px 24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "20px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
                position: "relative",
              }}
            >
              {/* Star Rating */}
              <div style={{ display: "flex", gap: "4px", color: "#FFD700", fontSize: "16px" }}>
                {[...Array(item.rating)].map((_, i) => (
                  <RiStarFill key={i} />
                ))}
              </div>

              {/* Quote */}
              <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.85)", lineHeight: "1.7", fontStyle: "italic", margin: 0 }}>
                &ldquo;{item.quote}&rdquo;
              </p>

              {/* Author */}
              <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "14px" }}>
                <strong style={{ display: "block", fontSize: "14px", color: "#FFFFFF", fontWeight: "900", textTransform: "uppercase" }}>
                  {item.name}
                </strong>
                <span style={{ fontSize: "12px", color: "#00D4FF", fontWeight: "700" }}>
                  {item.college}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

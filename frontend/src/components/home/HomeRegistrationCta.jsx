import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { RiCalendarCheckLine, RiPlayLine, RiShieldFlashLine } from "react-icons/ri";

/** Closing registration CTA — grand Legends Cup layout. */
export default function HomeRegistrationCta() {
  return (
    <section
      className="section mf1-reg-cta"
      aria-labelledby="mf1-reg-cta-title"
      style={{
        position: "relative",
        padding: "80px 0",
        overflow: "hidden",
        minHeight: "480px",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Marvel Background Artwork Layer */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/MARVEL/658651514296997716.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.9) contrast(1.2) saturate(1.2)",
          opacity: 0.85,
          zIndex: 0,
        }}
        aria-hidden="true"
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(5,5,10,0.85) 0%, rgba(5,5,10,0.4) 50%, #05050A 100%)",
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "300px",
          borderRadius: "50%",
          background: "rgba(237, 29, 36, 0.2)",
          filter: "blur(120px)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 2, maxWidth: "880px", margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            background: "rgba(10, 14, 26, 0.88)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(0, 212, 255, 0.35)",
            borderRadius: "24px",
            padding: "48px 32px",
            textAlign: "center",
            boxShadow: "0 0 60px rgba(0,0,0,0.9), 0 0 30px rgba(237,29,36,0.2)",
          }}
        >
          {/* Limited slots badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 18px",
              borderRadius: "50px",
              border: "1px solid rgba(240, 193, 75, 0.5)",
              background: "rgba(240, 193, 75, 0.15)",
              color: "#FFD666",
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              marginBottom: "20px",
            }}
          >
            <RiCalendarCheckLine style={{ fontSize: "14px" }} />
            <span>OFFICIAL REGISTRATION SLOTS OPEN</span>
          </div>

          <h2
            id="mf1-reg-cta-title"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.2rem)",
              fontWeight: "900",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              lineHeight: "1.15",
              margin: "0 0 16px",
              fontFamily: "var(--font-excon-black)",
            }}
          >
            Are You Ready <br />
            To Claim Your <span style={{ color: "#FF3B44" }}>Legends</span>{" "}
            <span style={{ color: "#00D4FF" }}>Cup?</span>
          </h2>

          <p
            style={{
              fontSize: "15px",
              color: "rgba(245, 247, 255, 0.85)",
              maxWidth: "580px",
              margin: "0 auto 28px",
              lineHeight: "1.65",
            }}
          >
            Represent your school or college across technical battles, gaming leagues, robotics, and
            cultural stage events. Get your official digital pass now.
          </p>

          {/* Quick stats counter bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "48px",
              padding: "18px 0",
              margin: "0 0 32px",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontSize: "28px", fontWeight: "900", color: "#00D4FF", fontFamily: "var(--font-excon-black)" }}>
                23
              </div>
              <div style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.6)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                Missions
              </div>
            </div>
            <div>
              <div style={{ fontSize: "28px", fontWeight: "900", color: "#FFD666", fontFamily: "var(--font-excon-black)" }}>
                ₹20L+
              </div>
              <div style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.6)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                Prize Pool
              </div>
            </div>
            <div>
              <div style={{ fontSize: "28px", fontWeight: "900", color: "#FF3B44", fontFamily: "var(--font-excon-black)" }}>
                5000+
              </div>
              <div style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.6)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                Agents
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <Link
              to="/register"
              className="mf1-btn mf1-btn--urgency"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 28px",
                fontSize: "13px",
                fontWeight: "700",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                borderRadius: "50px",
                background: "#ED1D24",
                color: "#FFFFFF",
                boxShadow: "0 0 25px rgba(237,29,36,0.6)",
                textDecoration: "none",
              }}
            >
              <span>Register Pass</span>
              <RiPlayLine style={{ fontSize: "16px" }} />
            </Link>

            <Link
              to="/events"
              className="mf1-btn mf1-btn--outline"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 28px",
                fontSize: "13px",
                fontWeight: "700",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                borderRadius: "50px",
                border: "1px solid #00D4FF",
                color: "#FFFFFF",
                background: "rgba(0, 212, 255, 0.12)",
                boxShadow: "0 0 20px rgba(0,212,255,0.3)",
                textDecoration: "none",
              }}
            >
              <RiShieldFlashLine style={{ fontSize: "16px" }} />
              <span>Explore Missions</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

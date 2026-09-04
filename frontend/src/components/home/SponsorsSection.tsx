"use client";

import { useRef, useState } from "react";
import { motion, useInView, useMotionValue, useTransform, useSpring } from "framer-motion";
import { RiShieldFlashLine, RiFlashlightLine, RiStarFill } from "react-icons/ri";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { useFestivalControl } from "@/lib/festivalStore";
import { mediaUrl } from "@/services/api";

const defaultPartners = [
  { name: "Stark Industries", tier: "platinum", logo: "🛡️", tagline: "Technology Partner", isImage: false },
  { name: "Wakanda Vibranium", tier: "platinum", logo: "💠", tagline: "Premium Sponsor", isImage: false },
  { name: "AIM Corporation", tier: "gold", logo: "⚡", tagline: "Gold Sponsor", isImage: false },
  { name: "S.H.I.E.L.D. Corp", tier: "gold", logo: "🏆", tagline: "Strategic Partner", isImage: false },
  { name: "Quantum Realm", tier: "silver", logo: "🌐", tagline: "Silver Sponsor", isImage: false },
  { name: "Nova Prime", tier: "silver", logo: "🚀", tagline: "Community Partner", isImage: false },
];

const tierConfig: Record<string, {
  gradient: string;
  border: string;
  glow: string;
  badge: string;
  stars: number;
  labelColor: string;
  particleColor: string;
  accentRgb: string;
}> = {
  platinum: {
    gradient: "from-arc-cyan/15 via-[#040e1c] to-transparent",
    border: "border-arc-cyan/30",
    glow: "0_0_40px_rgba(0,212,255,0.3),0_0_80px_rgba(0,212,255,0.12)",
    badge: "bg-arc-cyan/15 text-arc-cyan border-arc-cyan/40",
    stars: 3,
    labelColor: "text-arc-cyan",
    particleColor: "bg-arc-cyan",
    accentRgb: "0,212,255",
  },
  gold: {
    gradient: "from-metallic-gold/15 via-[#140e00] to-transparent",
    border: "border-metallic-gold/30",
    glow: "0_0_40px_rgba(212,175,55,0.3),0_0_80px_rgba(212,175,55,0.12)",
    badge: "bg-metallic-gold/15 text-metallic-gold border-metallic-gold/40",
    stars: 2,
    labelColor: "text-metallic-gold",
    particleColor: "bg-metallic-gold",
    accentRgb: "212,175,55",
  },
  silver: {
    gradient: "from-white/8 via-[#0a0a12] to-transparent",
    border: "border-white/15",
    glow: "0_0_30px_rgba(255,255,255,0.08)",
    badge: "bg-white/8 text-white/50 border-white/15",
    stars: 1,
    labelColor: "text-white/50",
    particleColor: "bg-white/40",
    accentRgb: "192,192,192",
  },
};

interface Partner {
  name: string;
  tier: string;
  displayTier?: string;
  logo: string;
  tagline: string;
  isImage?: boolean;
}

interface SponsorCardProps {
  partner: Partner;
  index: number;
}

/* ─── 3D Magnetic Sponsor Card ─── */
function SponsorCard({ partner, index }: SponsorCardProps) {
  const cfg = tierConfig[partner.tier] || tierConfig.silver;
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 200, damping: 20 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), springConfig);
  const glowX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
  const glowY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  }

  function onMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ scale: 1.05, y: -6 }}
      transition={{ duration: 0.25 }}
      className={`relative rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-between gap-3 sm:gap-4 bg-gradient-to-b ${cfg.gradient} border ${cfg.border} backdrop-blur-xl group cursor-pointer overflow-hidden min-h-[190px] sm:min-h-[220px]`}
    >
      {/* Dynamic Cursor Light-Follower */}
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
        style={{
          background: `radial-gradient(120px circle at ${glowX} ${glowY}, rgba(${cfg.accentRgb}, 0.25), transparent 70%)`,
        }}
      />

      {/* Holographic scanning laser line */}
      <motion.div
        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none opacity-0 group-hover:opacity-100"
        animate={{ y: [0, 160, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
      />

      {/* Ambient background glow inside card */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ boxShadow: cfg.glow }}
      />

      {/* Corner Tech Pips */}
      <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 border-t border-l border-white/30" />
      <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 border-t border-r border-white/30" />
      <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 border-b border-l border-white/30" />
      <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 border-b border-r border-white/30" />

      {/* Tier pill */}
      <div
        className={`absolute top-3 right-3 px-2 py-0.5 rounded-full border text-[8px] font-bold uppercase tracking-widest ${cfg.badge}`}
        style={{ transform: "translateZ(15px)" }}
      >
        {partner.displayTier || partner.tier}
      </div>

      {/* Stars */}
      <div className="flex gap-0.5 absolute top-3 left-3" style={{ transform: "translateZ(15px)" }}>
        {Array.from({ length: cfg.stars }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
          >
            <RiStarFill className={`text-[8px] ${cfg.labelColor}`} />
          </motion.div>
        ))}
      </div>

      {/* Logo — floats in 3D space */}
      <motion.div
        className="drop-shadow-[0_0_25px_rgba(255,255,255,0.35)] pt-4 sm:pt-5 pb-1 flex items-center justify-center min-h-[90px] sm:min-h-[105px] w-full"
        style={{ transform: "translateZ(25px)" }}
        animate={{ y: [-3, 3, -3] }}
        transition={{ duration: 3 + index * 0.4, repeat: Infinity, ease: "easeInOut" }}
      >
        {partner.isImage ? (
          <div className="relative w-full max-w-[160px] sm:max-w-[190px] h-20 sm:h-24 p-1.5 sm:p-2 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            <img
              src={partner.logo}
              alt={partner.name}
              className="w-full h-full max-h-full max-w-full object-contain filter drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/logo.png";
              }}
            />
          </div>
        ) : (
          <span className="text-5xl sm:text-6xl">{partner.logo}</span>
        )}
      </motion.div>

      {/* Name & Tagline */}
      <div className="text-center space-y-0.5 sm:space-y-1 w-full" style={{ transform: "translateZ(10px)" }}>
        <span
          className="block text-xs sm:text-sm font-black text-white uppercase tracking-tight leading-tight font-excon-black truncate"
        >
          {partner.name}
        </span>
        <span className={`block text-[8px] sm:text-[9px] uppercase tracking-wider font-excon-bold truncate ${cfg.labelColor}`}>
          {partner.tagline}
        </span>
      </div>

      {/* Bottom glow accent */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(90deg, transparent, rgba(${cfg.accentRgb},0.9), transparent)` }}
        initial={{ scaleX: 0, opacity: 0 }}
        whileHover={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}

export function SponsorsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { sponsors: storeSponsors } = useFestivalControl();

  const activeSponsors = storeSponsors && storeSponsors.length > 0
    ? storeSponsors.filter(s => s.active).map(s => {
        const rawTier = (s.tier || "Partner").trim();
        const lowerTier = rawTier.toLowerCase();
        const normalizedTier = (lowerTier === "title" || lowerTier === "platinum" || lowerTier === "host") 
          ? "platinum" 
          : (lowerTier === "gold" ? "gold" : "silver");
        
        const cleanTierBase = rawTier.replace(/partner/gi, "").trim();
        const tagline = cleanTierBase ? `${cleanTierBase} Partner` : "Official Partner";

        let logoUrl = s.logoUrl;
        if (logoUrl) {
          logoUrl = mediaUrl(logoUrl) || logoUrl;
        }
        if (!logoUrl || (!logoUrl.startsWith("http") && !logoUrl.startsWith("/"))) {
          logoUrl = "/logo.png";
        }

        return {
          name: s.name,
          tier: normalizedTier,
          displayTier: rawTier,
          logo: logoUrl,
          tagline: tagline,
          isImage: true,
        };
      })
    : defaultPartners;

  return (
    <section className="relative bg-transparent section-padding border-t border-arc-cyan/20 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[300px] rounded-full bg-arc-cyan/5 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[300px] rounded-full bg-metallic-gold/5 blur-[140px] pointer-events-none" />

      {/* Cyber grid lines */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none overflow-hidden">
        <div className="h-full w-full bg-[linear-gradient(to_right,#00d4ff10_1px,transparent_1px),linear-gradient(to_bottom,#00d4ff10_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        {/* Animated scan beam */}
        <motion.div
          className="absolute inset-x-0 h-32 bg-gradient-to-b from-transparent via-arc-cyan/20 to-transparent"
          animate={{ y: ["0vh", "100vh"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear", repeatDelay: 4 }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ─── Section Header ─── */}
        <Reveal y={60} duration={0.7} margin="-100px">
          <div className="text-center space-y-4 mb-10 sm:mb-16">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)] font-space"
            >
              <RiShieldFlashLine className="animate-pulse text-metallic-gold" />
              <span>VALUED ALLIANCES &amp; STRATEGIC PARTNERS</span>
            </div>

            <h2
              className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white font-excon-black"
            >
              <span className="shimmer-text">OUR SPONSORS</span>{" "}
              <span className="gradient-text-gold">&amp; ALLIANCES</span>
            </h2>

            {/* Animated expanding divider */}
            <div
              className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-arc-cyan to-metallic-gold to-transparent origin-center"
            />

            <p
              className="text-white/60 text-xs sm:text-sm font-space max-w-md mx-auto leading-relaxed font-normal"
            >
              Powering Earth&apos;s mightiest college festival alongside our incredible partners
            </p>
          </div>
        </Reveal>

        {/* ─── Tier filter badges ─── */}
        <motion.div
          ref={ref}
          className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, staggerChildren: 0.08 }}
        >
          {(["platinum", "gold", "silver"] as const).map((tier, i) => {
            const cfg = tierConfig[tier];
            return (
              <motion.div
                key={tier}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.08 }}
                whileHover={{ scale: 1.08, y: -2 }}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full border text-[9px] sm:text-[10px] font-bold uppercase tracking-widest cursor-default transition-all duration-300 ${cfg.badge} font-space`}
              >
                <RiFlashlightLine />
                {tier} tier
              </motion.div>
            );
          })}
        </motion.div>

        {/* ─── 3D Cards Grid with Staggered Scroll Reveal ─── */}
        <RevealGroup
          stagger={0.1}
          margin="-80px"
          className={`grid grid-cols-2 sm:grid-cols-3 ${
            activeSponsors.length <= 3
              ? "lg:grid-cols-3 max-w-4xl mx-auto"
              : activeSponsors.length <= 4
              ? "lg:grid-cols-4 max-w-5xl mx-auto"
              : "lg:grid-cols-4 xl:grid-cols-6"
          } gap-4 sm:gap-6 mb-12 sm:mb-16`}
        >
          {activeSponsors.map((partner, idx) => (
            <RevealItem key={partner.name}>
              <SponsorCard partner={partner} index={idx} />
            </RevealItem>
          ))}
        </RevealGroup>

        {/* ─── Become a sponsor CTA ─── */}
        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <motion.a
            href="/contact"
            whileHover={{ scale: 1.06, y: -3 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold text-xs font-bold tracking-widest uppercase hover:bg-metallic-gold hover:text-black transition-colors duration-300 shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] font-space group"
          >
            <motion.span
              animate={{ rotate: [0, 15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <RiFlashlightLine />
            </motion.span>
            Become a Partner
          </motion.a>
        </motion.div>

      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { RiShieldFlashLine, RiSparklingLine } from "react-icons/ri";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

const INFINITY_STONES = [
  {
    name: "Space Stone",
    color: "#00D4FF",
    glow: "shadow-[0_0_20px_#00D4FF]",
    domain: "Networking & Cloud Warfare",
    desc: "Control over spatial computing, cloud architecture, and serverless hackathons.",
    image: "/MARVEL/stones/spacestone.png",
  },
  {
    name: "Reality Stone",
    color: "#ED1D24",
    glow: "shadow-[0_0_20px_#ED1D24]",
    domain: "AR/VR & UI/UX Realm",
    desc: "Alter perception through 3D modeling, game design, and immersive digital worlds.",
    image: "/MARVEL/stones/realitystone.png",
  },
  {
    name: "Power Stone",
    color: "#7B2FBE",
    glow: "shadow-[0_0_20px_#7B2FBE]",
    domain: "Esports & Gaming Gauntlet",
    desc: "Raw competitive strength in BGMI, Valorant, FIFA, and console battles.",
    image: "/MARVEL/stones/powerstone.png",
  },
  {
    name: "Mind Stone",
    color: "#FFD700",
    glow: "shadow-[0_0_20px_#FFD700]",
    domain: "AI & Algorithmic Conquest",
    desc: "Unleash machine learning, competitive programming, and neural networking brilliance.",
    image: "/MARVEL/stones/mindstone.png",
  },
  {
    name: "Time Stone",
    color: "#10B981",
    glow: "shadow-[0_0_20px_#10B981]",
    domain: "Speed Coding & Live Debates",
    desc: "Master time-pressured challenges, rapid debugging, and fast-paced quizzes.",
    image: "/MARVEL/stones/timestone.png",
  },
  {
    name: "Soul Stone",
    color: "#FF8C00",
    glow: "shadow-[0_0_20px_#FF8C00]",
    domain: "Cultural Arts & Pro Concert",
    desc: "Infuse your passion into dance, beatboxing, music bands, and dramatic arts.",
    image: "/MARVEL/stones/soulstone.png",
  },
];

export function InfinityChallenge() {
  const [activeStone, setActiveStone] = useState(INFINITY_STONES[0]);

  return (
    <section className="relative bg-transparent py-20 md:py-24 border-t border-arc-cyan/20 overflow-hidden min-h-[580px]">
      {/* Background Infinity Gauntlet Marvel Image — High Opacity & Vivid Contrast */}
      <div className="absolute inset-0 z-0 opacity-75 sm:opacity-85 md:opacity-90 lg:opacity-95 pointer-events-none select-none overflow-hidden transition-opacity duration-700">
        <Image
          src="/MARVEL/4081455907815375.png"
          alt="Infinity Gauntlet Background"
          fill
          priority
          className="object-cover object-top filter brightness-115 contrast-125 saturate-135 drop-shadow-[0_0_50px_rgba(255,215,0,0.4)] scale-[1.02]"
          style={{
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,1) 12%, rgba(0,0,0,1) 88%, rgba(0,0,0,0.3) 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,1) 12%, rgba(0,0,0,1) 88%, rgba(0,0,0,0.3) 100%)",
          }}
        />
      </div>

      {/* Background ambient glow matching active stone (Vivid & Dynamic) */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full blur-[130px] pointer-events-none transition-all duration-700 opacity-40 z-0"
        style={{ background: activeStone.color }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        {/* Section Header */}
        <Reveal y={60} duration={0.7} margin="-100px">
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)] font-space">
              <RiSparklingLine className="animate-spin-slow text-metallic-gold" />
              <span>THE SIX DOMAINS OF VICTORY</span>
            </div>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white font-excon-black">
              <span className="shimmer-text">INFINITY GAUNTLET</span>{" "}
              <span className="gradient-text-gold">CHALLENGE</span>
            </h2>

            {/* Animated expanding divider */}
            <div
              className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-metallic-gold to-arc-cyan to-transparent origin-center"
            />

            <p className="text-xs sm:text-sm text-white/85 font-space max-w-lg mx-auto leading-relaxed font-normal">
              Harness the power of all 6 Infinity Stones by competing across diverse mission categories at MACFIESTA.
            </p>
          </div>
        </Reveal>

        {/* Stone Selectors Grid — Staggered Scroll Reveal (3x2 on mobile, 6x1 on desktop) */}
        <RevealGroup stagger={0.08} margin="-80px" className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
          {INFINITY_STONES.map((stone) => {
            const isSelected = activeStone.name === stone.name;
            return (
              <RevealItem key={stone.name}>
                <motion.button
                  onClick={() => setActiveStone(stone)}
                  whileHover={{ y: -6, scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className={`w-full p-2 sm:p-4 rounded-xl sm:rounded-2xl border flex flex-col items-center gap-1 sm:gap-2.5 transition-all duration-300 cursor-pointer backdrop-blur-md group ${isSelected
                    ? "bg-white/15 border-white text-white scale-105 shadow-2xl"
                    : "bg-black/70 border-white/15 text-white/70 hover:border-white/35 hover:text-white"
                    }`}
                  style={{
                    borderColor: isSelected ? stone.color : undefined,
                    boxShadow: isSelected ? `0 0 25px ${stone.color}50` : undefined,
                  }}
                >
                  {/* Infinity Stone 3D Image with Dynamic Glow */}
                  <div className="relative w-9 h-9 sm:w-14 sm:h-14 flex items-center justify-center my-0.5 sm:my-1">
                    <div
                      className={`absolute inset-0 rounded-full blur-md opacity-40 transition-all duration-300 ${
                        isSelected ? "opacity-90 scale-125" : "group-hover:opacity-70"
                      }`}
                      style={{ background: stone.color }}
                    />
                    <img
                      src={stone.image}
                      alt={stone.name}
                      className={`relative w-8 h-8 sm:w-12 sm:h-12 object-contain transition-all duration-300 ${
                        isSelected ? "scale-110 animate-pulse" : "group-hover:scale-110 opacity-90"
                      }`}
                      style={{
                        filter: `drop-shadow(0 0 10px ${stone.color})`,
                      }}
                      loading="lazy"
                    />
                  </div>
                  <span className="text-[9px] sm:text-xs font-bold font-excon-bold tracking-wider uppercase text-center leading-tight truncate max-w-full">
                    {stone.name}
                  </span>
                </motion.button>
              </RevealItem>
            );
          })}
        </RevealGroup>

        {/* Active Stone Detail Card */}
        <Reveal y={40} duration={0.6} margin="-60px">
          <motion.div
            key={activeStone.name}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="glass-aurora p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-white/25 bg-black/80 backdrop-blur-md max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-4 sm:gap-6 shadow-[0_0_50px_rgba(0,0,0,0.9)]"
            style={{ borderColor: `${activeStone.color}70` }}
          >
            <div
              className="relative w-16 h-16 sm:w-22 sm:h-22 rounded-xl sm:rounded-2xl shrink-0 flex items-center justify-center border-2 border-white/40 bg-white/[0.04] backdrop-blur-md shadow-2xl"
              style={{
                borderColor: `${activeStone.color}80`,
                boxShadow: `0 0 35px ${activeStone.color}50, inset 0 0 20px ${activeStone.color}20`,
              }}
            >
              <div
                className="absolute inset-1 rounded-full blur-md opacity-60"
                style={{ background: activeStone.color }}
              />
              <img
                src={activeStone.image}
                alt={activeStone.name}
                className="relative w-12 h-12 sm:w-16 sm:h-16 object-contain animate-pulse"
                style={{
                  filter: `drop-shadow(0 0 14px ${activeStone.color})`,
                }}
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2 text-center md:text-left">
              <div className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.14em] sm:tracking-[0.16em] font-excon-bold" style={{ color: activeStone.color }}>
                {activeStone.name} • {activeStone.domain}
              </div>
              <h3 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight font-excon-black">
                {activeStone.domain}
              </h3>
              <p className="text-xs sm:text-sm text-white/85 font-excon leading-relaxed font-normal">
                {activeStone.desc}
              </p>
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}

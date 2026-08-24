"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { RiCalendarEventLine, RiFlashlightLine, RiShieldFlashLine, RiTrophyLine } from "react-icons/ri";
import { Reveal } from "@/components/ui/Reveal";

const TIMELINE_STEPS = [
  {
    phase: "PHASE I: RECRUITMENT",
    title: "Mission Directives & Registrations Open",
    date: "August 1, 2026",
    desc: "Agents assemble teams across India. Portal opens for online mission enrollment.",
    icon: RiShieldFlashLine,
    color: "text-arc-cyan",
    accentRgb: "0,212,255",
    glowClass: "shadow-[0_0_20px_rgba(0,212,255,0.5)]",
    borderHover: "group-hover:border-arc-cyan/60 group-hover:shadow-[0_0_30px_rgba(0,212,255,0.2)]",
  },
  {
    phase: "PHASE II: SPOT INFILTRATION",
    title: "Spot Registration & Campus Access",
    date: "September 24, 2026 — 08:00 AM",
    desc: "On-site verification at MACFAST Avengers Command. Badge & QR ID issue.",
    icon: RiFlashlightLine,
    color: "text-marvel-red",
    accentRgb: "237,29,36",
    glowClass: "shadow-[0_0_20px_rgba(237,29,36,0.5)]",
    borderHover: "group-hover:border-marvel-red/60 group-hover:shadow-[0_0_30px_rgba(237,29,36,0.2)]",
  },
  {
    phase: "PHASE III: WARFARE",
    title: "Coding Sprint, Robo Race & Gaming Prelims",
    date: "September 24, 2026 — 10:30 AM",
    desc: "High-intensity battles across technical and gaming arenas.",
    icon: RiCalendarEventLine,
    color: "text-metallic-gold",
    accentRgb: "212,175,55",
    glowClass: "shadow-[0_0_20px_rgba(212,175,55,0.5)]",
    borderHover: "group-hover:border-metallic-gold/60 group-hover:shadow-[0_0_30px_rgba(212,175,55,0.2)]",
  },
  {
    phase: "PHASE IV: GRAND FINALE",
    title: "Hall of Heroes & Pro-Show Concert",
    date: "September 25, 2026 — 06:00 PM",
    desc: "Final victory ceremonies, trophy distribution, and national concert.",
    icon: RiTrophyLine,
    color: "text-vibranium-purple",
    accentRgb: "123,47,190",
    glowClass: "shadow-[0_0_20px_rgba(123,47,190,0.5)]",
    borderHover: "group-hover:border-vibranium-purple/60 group-hover:shadow-[0_0_30px_rgba(123,47,190,0.2)]",
  },
];

export function MarvelTimeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const { scrollYProgress: sectionProgress } = useScroll({ target: sectionRef, offset: ["start 70%", "end 80%"] });

  // Parallax for background image
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const laserBeamHeight = useTransform(sectionProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={sectionRef} className="relative bg-transparent section-padding border-t border-arc-cyan/20 overflow-hidden min-h-[600px]">
      {/* Parallax Background (Soft Watermark) */}
      <motion.div className="absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden" style={{ y: bgY }}>
        <Image
          src="/MARVEL/The Spider….jpg"
          alt="Spider-Man Mission Timeline Background"
          fill
          className="object-cover object-center filter brightness-105 contrast-125 saturate-135 scale-[1.15]"
        />
      </motion.div>
      <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-t from-[#05050A]/80 via-transparent to-[#05050A]/70" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full bg-marvel-red/15 blur-[140px] z-[1] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-14">

        {/* Header */}
        <Reveal y={60} duration={0.7} margin="-100px">
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)] font-space">
              <RiFlashlightLine className="animate-pulse text-metallic-gold" />
              <span>S.H.I.E.L.D. TACTICAL CHRONOLOGY</span>
            </div>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white font-excon-black">
              <span className="shimmer-text">MARVEL MISSION</span>{" "}
              <span className="gradient-text-gold">TIMELINE</span>
            </h2>

            {/* Animated expanding divider */}
            <div
              className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-arc-cyan to-marvel-red to-transparent origin-center"
            />

            <p className="text-xs sm:text-sm text-white/85 font-space max-w-lg mx-auto leading-relaxed font-normal">
              Chronological roadmap of all MACFIESTA festival phases from initialization to the finale.
            </p>
          </div>
        </Reveal>

        {/* 3D Timeline Items */}
        <div className="relative ml-3 sm:ml-6 md:ml-32">
          {/* Vertical base guide track */}
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-white/10" />

          {/* Scroll-driven active laser energy conduit beam */}
          <motion.div
            className="absolute left-0 top-0 w-0.5 bg-gradient-to-b from-arc-cyan via-marvel-red to-metallic-gold shadow-[0_0_12px_#00D4FF]"
            style={{ height: laserBeamHeight }}
          />

          <div className="space-y-6 sm:space-y-8">
            {TIMELINE_STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.phase}
                  initial={{ opacity: 0, x: -60, rotateY: -15 }}
                  whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.7, delay: idx * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="relative pl-6 sm:pl-8 md:pl-12 group"
                  style={{ perspective: "1000px" }}
                >
                  {/* Animated Dot */}
                  <motion.div
                    className={`absolute -left-[15px] sm:-left-[17px] top-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black border-2 border-arc-cyan flex items-center justify-center ${step.color} ${step.glowClass} z-10`}
                    whileHover={{ scale: 1.3, rotate: 360 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    style={{ borderColor: `rgba(${step.accentRgb},0.8)` }}
                  >
                    <Icon className="text-xs sm:text-sm" />
                  </motion.div>

                  {/* Phase connector line */}
                  <div
                    className="absolute -left-[12px] sm:-left-[13px] top-8 h-full w-px opacity-20 group-hover:opacity-60 transition-opacity duration-500"
                    style={{ background: `rgba(${step.accentRgb},1)` }}
                  />

                  {/* 3D Card */}
                  <motion.div
                    whileHover={{ x: 6, rotateY: 2, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 250, damping: 20 }}
                    className={`glass-aurora p-4 sm:p-6 rounded-2xl border border-white/12 space-y-2 max-w-2xl ${step.borderHover} transition-all duration-400`}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* Top accent */}
                    <div
                      className="absolute top-0 left-4 right-4 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                      style={{ background: `linear-gradient(90deg, transparent, rgba(${step.accentRgb},0.8), transparent)` }}
                    />

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-bold tracking-[0.18em] uppercase font-excon-bold ${step.color}`}
                        style={{ transform: "translateZ(5px)" }}
                      >
                        {step.phase}
                      </span>
                      <span
                        className="text-[10px] font-bold text-arc-cyan bg-arc-cyan/15 px-2.5 py-0.5 rounded border border-arc-cyan/30 font-excon-bold tracking-wider"
                        style={{ transform: "translateZ(5px)" }}
                      >
                        {step.date}
                      </span>
                    </div>

                    <h3
                      className="text-lg font-black text-white uppercase tracking-tight group-hover:text-metallic-gold transition-colors duration-300 font-excon-black"
                      style={{ transform: "translateZ(8px)" }}
                    >
                      {step.title}
                    </h3>

                    <p className="text-xs text-white/80 font-excon leading-relaxed font-normal" style={{ transform: "translateZ(4px)" }}>
                      {step.desc}
                    </p>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

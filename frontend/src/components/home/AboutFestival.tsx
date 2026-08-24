"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { RiAwardLine, RiGroupLine, RiFlashlightLine, RiShieldFlashLine } from "react-icons/ri";
import { useFestivalControl } from "@/lib/festivalStore";

/* ─── Counter hook ─── */
function useCounter(target: number, duration = 1800, startCounting: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startCounting) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, startCounting]);

  return count;
}

/* ─── Individual stat card ─── */
function StatCard({
  icon: Icon,
  rawValue,
  suffix,
  label,
  color,
  index,
  inView,
}: {
  icon: React.ComponentType<{ className?: string }>;
  rawValue: number;
  suffix: string;
  label: string;
  color: string;
  index: number;
  inView: boolean;
}) {
  const count = useCounter(rawValue, 1600 + index * 100, inView);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 30 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ scale: 1.04, y: -8 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="glass-aurora p-3.5 sm:p-6 md:p-8 rounded-2xl border border-white/10 text-center flex flex-col items-center justify-center space-y-2.5 sm:space-y-4 shadow-2xl cursor-default hover:border-arc-cyan/40 transition-colors duration-300"
    >
      <div
        className={`p-2.5 sm:p-4 rounded-full bg-white/5 ${color} text-xl sm:text-2xl md:text-3xl border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]`}
      >
        <Icon className="" />
      </div>
      <div className="space-y-1">
        <span
          className="block text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase font-anton tracking-tight"
        >
          {count}
          {suffix}
        </span>
        <span className="block text-[10px] sm:text-xs text-arc-cyan font-bold uppercase tracking-[0.12em] sm:tracking-[0.16em] font-space">
          {label}
        </span>
      </div>
    </motion.div>
  );
}

const stats = [
  { icon: RiAwardLine, rawValue: 26, suffix: "+", label: "Avenger Missions", color: "text-metallic-gold" },
  { icon: RiGroupLine, rawValue: 5000, suffix: "+", label: "Recruited Agents", color: "text-arc-cyan" },
  { icon: RiFlashlightLine, rawValue: 20, suffix: "L+", label: "Bounty Pool", color: "text-marvel-red" },
  { icon: RiShieldFlashLine, rawValue: 100, suffix: "%", label: "MCU Immersion", color: "text-vibranium-purple" },
];

export function AboutFestival() {
  const { settings } = useFestivalControl();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative bg-transparent section-padding border-t border-marvel-red/20 overflow-hidden min-h-[580px]">
      {/* Background Marvel Artwork Accent */}
      <div className="absolute inset-0 z-0 opacity-85 pointer-events-none overflow-hidden">
        <Image
          src="/MARVEL/In a city that never sleeps, I find my….png"
          alt="About Festival Marvel Background"
          fill
          priority
          className="object-cover object-center filter brightness-105 contrast-125 saturate-135"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05050A]/70 via-transparent to-[#05050A]/70 z-[1]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(5,5,10,0.65)_90%)] z-[1]" />
      </div>

      {/* Background glow accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-marvel-red/10 blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-arc-cyan/10 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

          {/* Left Text content — slides in from left */}
          <motion.div
            className="lg:col-span-6 space-y-6"
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)]">
              <RiShieldFlashLine className="animate-pulse text-metallic-gold" />
              <span>STARK INDUSTRIES &amp; WAKANDA TECH BRIEFING</span>
            </div>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white font-excon-black">
              <span className="shimmer-text">WHERE HEROES</span>{" "}
              <span className="gradient-text-gold">ASSEMBLE &amp; DOMINATE</span>
            </h2>

            <p className="text-white/85 leading-relaxed font-space text-base">
              {settings.aboutText}
            </p>

            <p className="text-white/75 leading-relaxed font-space text-sm">
              Over 2 action-packed days, the country&apos;s elite delegates gather inside{" "}
              <span className="text-arc-cyan font-bold">{settings.name}</span> Avengers
              Headquarters to compete for glory, honor, S.H.I.E.L.D. trophies, and massive bounty
              pools.
            </p>

            {/* Decorative horizontal bar */}
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-marvel-red/60 to-transparent" />
              <RiShieldFlashLine className="text-marvel-red/60 text-lg" />
            </div>
          </motion.div>

          {/* Right Stats grid — slides in from right */}
          <motion.div
            ref={ref}
            className="lg:col-span-6 grid grid-cols-2 gap-3 sm:gap-4 md:gap-6"
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {stats.map((stat, idx) => (
              <StatCard
                key={stat.label}
                icon={stat.icon}
                rawValue={stat.rawValue}
                suffix={stat.suffix}
                label={stat.label}
                color={stat.color}
                index={idx}
                inView={inView}
              />
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}

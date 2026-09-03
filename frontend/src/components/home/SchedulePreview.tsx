"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  RiMapPinLine,
  RiTimeLine,
  RiArrowRightLine,
  RiFlashlightLine,
  RiCompass3Line,
  RiSparklingFill,
} from "react-icons/ri";
import { Reveal } from "@/components/ui/Reveal";

const typeColors: Record<string, { bg: string; text: string; border: string; rgb: string; glow: string }> = {
  General:    { bg: "bg-arc-cyan/15",         text: "text-arc-cyan",         border: "border-arc-cyan/40",         rgb: "0,212,255",   glow: "#00D4FF" },
  Gaming:     { bg: "bg-vibranium-purple/15",  text: "text-vibranium-purple", border: "border-vibranium-purple/40", rgb: "123,47,190", glow: "#7B2FBE" },
  Technical:  { bg: "bg-metallic-gold/15",     text: "text-metallic-gold",     border: "border-metallic-gold/40",     rgb: "212,175,55",  glow: "#D4AF37" },
  Management: { bg: "bg-marvel-red/15",         text: "text-marvel-red",      border: "border-marvel-red/40",       rgb: "237,29,36",   glow: "#ED1D24" },
  Cultural:   { bg: "bg-vibranium-purple/15",  text: "text-vibranium-purple", border: "border-vibranium-purple/40", rgb: "123,47,190", glow: "#7B2FBE" },
};

const defaultScheduleData = {
  day1: [
    { time: "10:00 AM", title: "College & School Missions Kickoff", venue: "All Labs & Arenas", type: "Technical" },
    { time: "04:30 PM", title: "Cultural Events Official Opening", venue: "Main Stage Arena", type: "Cultural" },
    { time: "04:45 PM", title: "Grand Welcome Dance & Cultural Contests", venue: "Main Stage Arena", type: "Cultural" },
    { time: "07:00 PM", title: "Food Break & Refreshment Zone", venue: "Food Pavilion", type: "General" },
    { time: "08:00 PM", title: "College Band Live Performance", venue: "Main Stage Arena", type: "Cultural" },
  ],
  day2: [
    { time: "10:00 AM", title: "Semi-Finals & Stark Expo Showcase", venue: "Stark Labs & Grounds", type: "Technical" },
    { time: "03:30 PM", title: "Grand Superhero Fashion Show", venue: "Main Stage Arena", type: "Cultural" },
    { time: "07:00 PM", title: "Food Break & Gala Refreshments", venue: "Food Pavilion", type: "General" },
    { time: "07:30 PM", title: "Grand Band Performance & Concert", venue: "Athletic Grounds", type: "Cultural" },
  ],
};

/* ─── Individual 3D schedule row card ─── */
function ScheduleCard({ slot, idx }: { slot: typeof defaultScheduleData.day1[0]; idx: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const tc = typeColors[slot.type] ?? typeColors.General;

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), { stiffness: 220, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-7, 7]), { stiffness: 220, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50, filter: "blur(6px)", scale: 0.94 }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)", scale: 1 }}
      exit={{ opacity: 0, x: 40, filter: "blur(6px)", scale: 0.94 }}
      transition={{ duration: 0.45, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="relative group"
      style={{ perspective: "1000px" }}
    >
      {/* Dynamic Animated Timeline Node with Pulse Ripple */}
      <div className="absolute -left-[27px] sm:-left-[31px] md:-left-[39px] top-5 flex items-center justify-center z-20">
        {/* Radar ping ring */}
        <motion.div
          animate={{ scale: [1, 2.2, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: idx * 0.3, ease: "easeInOut" }}
          className="absolute w-4 h-4 rounded-full"
          style={{ backgroundColor: `rgba(${tc.rgb}, 0.5)` }}
        />
        {/* Central glowing core */}
        <div
          className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 bg-[#05050A] group-hover:scale-135 transition-transform duration-300 relative z-10"
          style={{
            borderColor: tc.glow,
            boxShadow: `0 0 14px ${tc.glow}`,
          }}
        />
      </div>

      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="glass-aurora relative overflow-hidden p-4 sm:p-5 md:p-6 rounded-2xl border border-white/10 group-hover:border-white/25 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 cursor-default shadow-xl backdrop-blur-md"
      >
        {/* Shimmer laser highlight on hover */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(${tc.rgb}, 0.9), #FFFFFF, rgba(${tc.rgb}, 0.9), transparent)`,
          }}
        />

        {/* Ambient subtle card aura */}
        <div
          className="absolute -inset-1 opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-2xl pointer-events-none blur-xl"
          style={{ backgroundColor: tc.glow }}
        />

        <div className="space-y-2 min-w-0 flex-1 relative z-10" style={{ transform: "translateZ(12px)" }}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-metallic-gold text-xs font-black tracking-wider font-excon-bold bg-metallic-gold/10 px-2.5 py-1 rounded-lg border border-metallic-gold/30">
              <RiTimeLine className="text-arc-cyan text-sm shrink-0 animate-pulse" />
              {slot.time}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-lg text-[9px] uppercase tracking-[0.15em] font-black border font-excon-black shadow-sm ${tc.bg} ${tc.text} ${tc.border}`}
            >
              {slot.type}
            </span>
          </div>

          <h3 className="text-base sm:text-lg md:text-xl font-black text-white uppercase tracking-tight group-hover:text-metallic-gold transition-colors duration-300 font-excon-black truncate">
            {slot.title}
          </h3>
        </div>

        <div
          className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-white/90 bg-white/5 group-hover:bg-white/10 px-3 py-2 rounded-xl border border-white/10 shrink-0 font-excon-bold self-start md:self-center transition-all duration-300 relative z-10"
          style={{ transform: "translateZ(12px)" }}
        >
          <RiMapPinLine className="text-arc-cyan text-sm shrink-0" />
          <span className="truncate">{slot.venue}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function SchedulePreview() {
  const [activeDay, setActiveDay] = useState<"day1" | "day2">("day1");

  return (
    <section className="relative bg-transparent section-padding border-t border-metallic-gold/20 overflow-hidden min-h-[640px]">
      {/* ─── Ambient Translucent Glow (Allows 3D Canvas Scroll Frames to shine through) ─── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        {/* Subtle dual energy aura */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-gradient-to-r from-metallic-gold/10 via-arc-cyan/5 to-marvel-red/10 blur-[130px] rounded-full pointer-events-none" />
      </div>

      {/* ─── Left Hero: Wonder Woman ─── */}
      <div className="absolute -left-8 sm:-left-12 md:-left-18 lg:-left-24 xl:-left-28 bottom-0 top-0 w-full max-w-[320px] sm:max-w-[420px] md:max-w-[500px] lg:max-w-[580px] xl:max-w-[660px] pointer-events-none z-0 overflow-hidden select-none">
        {/* Ambient Golden / Amber Hero Radial Glow (Translucent) */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left_center,rgba(212,175,55,0.22)_0%,rgba(212,175,55,0.05)_50%,transparent_75%)] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="relative w-full h-full"
        >
          <motion.div
            animate={{
              y: [-8, 8, -8],
              rotate: [-0.5, 0.5, -0.5],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative w-full h-full flex items-end justify-start opacity-55 sm:opacity-65 md:opacity-72 lg:opacity-78 hover:opacity-90 transition-opacity duration-500"
          >
            <Image
              src="/MARVEL/wonder women.png"
              alt="Wonder Woman"
              fill
              priority
              className="object-contain object-bottom-left filter drop-shadow-[0_0_40px_rgba(212,175,55,0.4)] brightness-100 contrast-110 scale-[1.12] origin-bottom-left"
              style={{
                maskImage: "linear-gradient(to right, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 98%), linear-gradient(to bottom, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)",
                WebkitMaskImage: "linear-gradient(to right, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 98%), linear-gradient(to bottom, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)",
                maskComposite: "intersect",
                WebkitMaskComposite: "source-in",
              }}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* ─── Right Hero: Black Widow ─── */}
      <div className="absolute -right-8 sm:-right-12 md:-right-18 lg:-right-24 xl:-right-28 bottom-0 top-0 w-full max-w-[320px] sm:max-w-[420px] md:max-w-[500px] lg:max-w-[580px] xl:max-w-[660px] pointer-events-none z-0 overflow-hidden select-none">
        {/* Ambient Crimson / Marvel Red Hero Radial Glow (Translucent) */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right_center,rgba(237,29,36,0.22)_0%,rgba(237,29,36,0.05)_50%,transparent_75%)] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="relative w-full h-full"
        >
          <motion.div
            animate={{
              y: [8, -8, 8],
              rotate: [0.5, -0.5, 0.5],
            }}
            transition={{
              duration: 6.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
            className="relative w-full h-full flex items-end justify-end opacity-55 sm:opacity-65 md:opacity-72 lg:opacity-78 hover:opacity-90 transition-opacity duration-500"
          >
            <Image
              src="/MARVEL/blackwidow.png"
              alt="Black Widow"
              fill
              priority
              className="object-contain object-bottom-right filter drop-shadow-[0_0_40px_rgba(237,29,36,0.4)] brightness-100 contrast-115 scale-[1.12] origin-bottom-right"
              style={{
                maskImage: "linear-gradient(to left, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 98%), linear-gradient(to bottom, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)",
                WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 98%), linear-gradient(to bottom, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)",
                maskComposite: "intersect",
                WebkitMaskComposite: "source-in",
              }}
            />
          </motion.div>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header with reveal animation */}
        <Reveal y={50} duration={0.6} margin="-100px">
          <div className="text-center space-y-4 mb-8 sm:mb-12 max-w-2xl mx-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)] font-space"
            >
              <RiCompass3Line className="animate-spin text-metallic-gold text-sm" style={{ animationDuration: "8s" }} />
              <span>SUPERHERO ARENA & FESTIVAL CHRONOLOGY</span>
            </motion.div>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white font-excon-black">
              <span className="shimmer-text">SCHEDULE</span>{" "}
              <span className="gradient-text-gold">PREVIEW</span>
            </h2>

            {/* Animated glowing expanding divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-[2px] w-36 mx-auto bg-gradient-to-r from-transparent via-arc-cyan to-metallic-gold to-transparent origin-center shadow-[0_0_10px_#00D4FF]"
            />

            {/* ─── Animated Day Toggle with Sliding Active Indicator ─── */}
            <div className="relative flex flex-row justify-center gap-2 p-1.5 rounded-full bg-black/60 border border-white/15 backdrop-blur-xl w-full max-w-sm mx-auto mt-4 shadow-2xl">
              {(["day1", "day2"] as const).map((day) => {
                const isActive = activeDay === day;
                return (
                  <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    className={`relative flex-1 px-4 py-2.5 rounded-full text-xs font-black uppercase tracking-[0.14em] font-space text-center transition-colors duration-300 z-10 cursor-pointer ${
                      isActive ? "text-white" : "text-white/60 hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeScheduleTabPill"
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-marvel-red via-[#FF2D35] to-marvel-red shadow-[0_0_20px_rgba(237,29,36,0.7)] z-[-1]"
                        transition={{ type: "spring", stiffness: 380, damping: 28 }}
                      />
                    )}
                    <span className="flex items-center justify-center gap-1.5">
                      {day === "day1" ? (
                        <>
                          <RiFlashlightLine className="text-sm shrink-0" />
                          <span>DAY 1 • TECH</span>
                        </>
                      ) : (
                        <>
                          <RiSparklingFill className="text-sm shrink-0" />
                          <span>DAY 2 • FINALS</span>
                        </>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>

        {/* ─── Schedule List with Laser Wave Rail ─── */}
        <div className="relative border-l-2 border-arc-cyan/30 ml-3 sm:ml-4 md:ml-6 pl-5 sm:pl-6 md:pl-8 space-y-4 sm:space-y-5">
          {/* Animated Laser Beam pulsing along the rail */}
          <motion.div
            className="absolute -left-[2px] w-[3px] h-24 bg-gradient-to-b from-transparent via-arc-cyan to-transparent shadow-[0_0_12px_#00D4FF]"
            animate={{ top: ["-5%", "95%", "-5%"] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeDay}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-4 sm:space-y-5"
            >
              {defaultScheduleData[activeDay].map((slot, idx) => (
                <ScheduleCard key={`${activeDay}-${idx}`} slot={slot} idx={idx} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ─── CTA Button ─── */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.96 }}>
            <Link
              href="/schedule"
              className="btn-primary group px-8 py-3.5 text-xs tracking-[0.2em] uppercase inline-flex items-center gap-3 shadow-[0_0_30px_rgba(237,29,36,0.6)] hover:shadow-[0_0_40px_rgba(237,29,36,0.9)] font-excon-bold rounded-full transition-all duration-300 border border-marvel-red/50"
            >
              <span className="font-black">View Full Interactive Schedule</span>
              <RiArrowRightLine className="text-base group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

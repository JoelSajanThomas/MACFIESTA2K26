"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { RiStarFill, RiShieldStarLine, RiSparklingLine, RiCalendarEventLine, RiMapPinTimeLine } from "react-icons/ri";
import { Link } from "react-router-dom";
import { useFestivalControl, GuestItem } from "@/lib/festivalStore";

const DEFAULT_CHIEF_GUESTS: GuestItem[] = [
  {
    id: "guest-akhil",
    name: "Akhil Marar",
    role: "Celebrity Chief Guest · Filmmaker & Television Icon",
    description: "Renowned director, motivational speaker, and Bigg Boss Malayalam winner headlining the MacFiesta 2026 Grand Multiverse Inauguration.",
    imageUrl: "/assets/image all/official/guests/guest-akhil-marar.webp",
    category: "Chief Guest",
    badge: "CHIEF GUEST OF HONOR",
    sessionTime: "Grand Inauguration • Main Arena",
    active: true,
    order: 1,
  },
  {
    id: "guest-sayip",
    name: "Sayip OP",
    role: "Star Guest · BGMI Esports Streamer & Eagle Gaming",
    description: "Kerala's premier esports creator and BGMI gaming icon joining MacFiesta 2026 for a high-voltage gaming keynote and live arena showdown.",
    imageUrl: "/assets/image all/official/guests/guest-sayip-op.webp",
    category: "Star Guest",
    badge: "ESPORTS STAR GUEST",
    sessionTime: "Pro-Show Stage • Multiverse Arena",
    active: true,
    order: 2,
  },
];

interface GuestCardProps {
  guest: GuestItem;
  index: number;
}

function GuestCard({ guest, index }: GuestCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 200, damping: 20 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), springConfig);
  const glowX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
  const glowY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function onMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  const isChief = (guest.badge || guest.category || "").toLowerCase().includes("chief");

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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      whileHover={{ y: -8 }}
      className={`relative rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 sm:gap-8 bg-gradient-to-br ${
        isChief
          ? "from-metallic-gold/20 via-[#151004]/90 to-[#090710]/95 border-metallic-gold/40 shadow-[0_0_35px_rgba(212,175,55,0.2)]"
          : "from-arc-cyan/20 via-[#04101e]/90 to-[#090710]/95 border-arc-cyan/40 shadow-[0_0_35px_rgba(0,212,255,0.2)]"
      } border backdrop-blur-2xl group overflow-hidden transition-all duration-300`}
    >
      {/* Dynamic Cursor Spotlight Follower */}
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"
        style={{
          background: `radial-gradient(280px circle at ${glowX} ${glowY}, ${
            isChief ? "rgba(212,175,55,0.25)" : "rgba(0,212,255,0.25)"
          }, transparent 70%)`,
        }}
      />

      {/* Holographic scanning beam */}
      <motion.div
        className={`absolute inset-x-0 h-px bg-gradient-to-r from-transparent ${
          isChief ? "via-metallic-gold/50" : "via-arc-cyan/50"
        } to-transparent pointer-events-none opacity-0 group-hover:opacity-100`}
        animate={{ y: [0, 320, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
      />

      {/* Left: Guest Portrait with Cyber Frame */}
      <div className="relative shrink-0 w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden p-1 bg-gradient-to-b from-white/20 via-white/5 to-transparent border border-white/20 shadow-2xl">
        <div className="w-full h-full rounded-xl overflow-hidden relative bg-black/60">
          <img
            src={guest.imageUrl || "/logo.png"}
            alt={guest.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/logo.png";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <span
            className={`absolute bottom-2 left-2 right-2 text-center text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
              isChief ? "bg-metallic-gold text-black" : "bg-arc-cyan text-black"
            }`}
          >
            VIP PASS
          </span>
        </div>
      </div>

      {/* Right: Guest Info & Details */}
      <div className="flex-1 space-y-3 sm:space-y-4 text-center md:text-left z-10">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider ${
              isChief
                ? "bg-metallic-gold/20 text-metallic-gold border border-metallic-gold/40 shadow-[0_0_12px_rgba(212,175,55,0.3)]"
                : "bg-arc-cyan/20 text-arc-cyan border border-arc-cyan/40 shadow-[0_0_12px_rgba(0,212,255,0.3)]"
            }`}
          >
            <RiShieldStarLine className="text-xs" />
            <span>{guest.badge || (isChief ? "CHIEF GUEST OF HONOR" : "STAR GUEST")}</span>
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white/70 bg-white/5 border border-white/10">
            <RiMapPinTimeLine className="text-[10px] text-metallic-gold" />
            <span>{guest.sessionTime || "Pro-Show Stage • 24–25 Sep"}</span>
          </span>
        </div>

        <div>
          <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-excon-black group-hover:text-metallic-gold transition-colors">
            {guest.name}
          </h3>
          <p
            className={`text-xs sm:text-sm font-bold uppercase tracking-wider mt-1 ${
              isChief ? "text-metallic-gold/90" : "text-arc-cyan/90"
            }`}
          >
            {guest.role}
          </p>
        </div>

        <p className="text-xs sm:text-sm text-white/75 leading-relaxed font-excon max-w-2xl">
          {guest.description || guest.bio}
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
          <Link
            to="/schedule"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider bg-white/10 hover:bg-metallic-gold hover:text-black text-white border border-white/20 transition-all duration-300 shadow-md"
          >
            <RiCalendarEventLine className="text-sm" />
            <span>View Stage Timing</span>
          </Link>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider text-arc-cyan hover:underline"
          >
            <RiSparklingLine className="text-sm" />
            <span>Pro-Show Lineup</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export function ChiefGuestsSection() {
  const { guests: storeGuests } = useFestivalControl();

  const activeGuests: GuestItem[] = (() => {
    const list: GuestItem[] = [...DEFAULT_CHIEF_GUESTS];
    if (storeGuests && storeGuests.length > 0) {
      storeGuests
        .filter((g) => g.active)
        .forEach((g) => {
          const idx = list.findIndex(
            (m) =>
              m.name.toLowerCase().includes(g.name.toLowerCase()) ||
              g.name.toLowerCase().includes(m.name.toLowerCase())
          );
          if (idx >= 0) {
            list[idx] = { ...list[idx], ...g, imageUrl: g.imageUrl || list[idx].imageUrl };
          } else {
            list.push(g);
          }
        });
    }
    return list;
  })();

  return (
    <section className="relative bg-transparent section-padding border-t border-metallic-gold/20 overflow-hidden py-16 sm:py-24">
      {/* Marvel Atmosphere Blending */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[350px] rounded-full bg-metallic-gold/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[300px] rounded-full bg-arc-cyan/10 blur-[140px] pointer-events-none" />

      {/* Cyber Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none overflow-hidden">
        <div className="h-full w-full bg-[linear-gradient(to_right,#d4af3715_1px,transparent_1px),linear-gradient(to_bottom,#d4af3715_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold text-xs font-excon-bold font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)]">
            <RiStarFill className="animate-pulse text-metallic-gold" />
            <span>S.H.I.E.L.D. VIP ALLIANCE · CHIEF GUESTS</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white font-excon-black">
            <span className="shimmer-text">HONORED</span>{" "}
            <span className="gradient-text-gold">CHIEF GUESTS</span>
          </h2>

          <p className="text-white/70 text-xs sm:text-sm font-excon max-w-2xl mx-auto">
            Meet the celebrated dignitaries, cultural luminaries, and industry pioneers headlining MacFiesta 2026.
          </p>
        </div>

        {/* Guests Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {activeGuests.map((guest, index) => (
            <GuestCard key={guest.id || index} guest={guest} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

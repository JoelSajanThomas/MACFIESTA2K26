"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { RiArrowRightLine, RiTrophyLine, RiMapPinLine, RiTimeLine, RiFlashlightLine } from "react-icons/ri";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { Event } from "@/types";

const fallbackFeatured = [
  {
    title: "Avengers: Code Assemble",
    category: "Technical Mission",
    hero: "Iron Man & Avengers",
    power: "Power Rating: 99/100",
    level: "Level: Alpha",
    prize: "₹15,000",
    venue: "Stark Innovation Labs (MCA)",
    time: "Day 1, 10:00 AM",
    image: "/MARVEL/4081455907815375.png",
    heroAvatar: "/MARVEL/4081455907815375.png",
    link: "/events/avengers-code-assemble",
    border: "border-marvel-red/40 hover:border-marvel-red",
    glow: "hover:shadow-[0_0_40px_rgba(237,29,36,0.45)]",
    themeColor: "from-marvel-red/30 to-metallic-gold/10",
    badgeBg: "bg-marvel-red text-white shadow-[0_0_12px_#ED1D24]",
    accentColor: "#ED1D24",
  },
  {
    title: "Battle of Wakanda (BGMI)",
    category: "Gaming Mission",
    hero: "Black Panther",
    power: "Power Rating: 98/100",
    level: "Level: Vibranium",
    prize: "₹7,000",
    venue: "Asgard Esports Lounge",
    time: "Day 1, 10:00 AM",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
    heroAvatar: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop",
    link: "/events/battle-of-wakanda",
    border: "border-vibranium-purple/40 hover:border-vibranium-purple",
    glow: "hover:shadow-[0_0_40px_rgba(123,47,190,0.45)]",
    themeColor: "from-vibranium-purple/30 to-blue-600/10",
    badgeBg: "bg-vibranium-purple text-white shadow-[0_0_12px_#7B2FBE]",
    accentColor: "#7B2FBE",
  },
  {
    title: "Stark Industries: The Pitch",
    category: "Management Mission",
    hero: "Tony Stark",
    power: "Power Rating: 98/100",
    level: "Level: Billionaire",
    prize: "₹15,000",
    venue: "MBA Executive Boardroom",
    time: "Day 1, 10:00 AM",
    image: "/MARVEL/300685712645038155.png",
    heroAvatar: "/MARVEL/300685712645038155.png",
    link: "/events/stark-industries-the-pitch",
    border: "border-metallic-gold/40 hover:border-metallic-gold",
    glow: "hover:shadow-[0_0_40px_rgba(255,215,0,0.45)]",
    themeColor: "from-metallic-gold/30 to-amber-600/10",
    badgeBg: "bg-metallic-gold text-black shadow-[0_0_12px_#FFD700]",
    accentColor: "#D4AF37",
  },
  {
    title: "The Dark Knight: Hunt for the Signal",
    category: "Adventure Mission",
    hero: "The Dark Knight",
    power: "Power Rating: 100/100",
    level: "Level: Detective",
    prize: "₹15,000",
    venue: "Gotham Campus Perimeter",
    time: "Day 1, 10:00 AM",
    image: "/MARVEL/3025924746959430.jpg",
    heroAvatar: "/MARVEL/3025924746959430.jpg",
    link: "/events/the-dark-knight-hunt-for-the-signal",
    border: "border-metallic-gold/40 hover:border-metallic-gold",
    glow: "hover:shadow-[0_0_40px_rgba(255,215,0,0.45)]",
    themeColor: "from-metallic-gold/30 to-black/50",
    badgeBg: "bg-metallic-gold text-black shadow-[0_0_12px_#FFD700]",
    accentColor: "#FFD700",
  },
];

const DEFAULT_DECOR = {
  border: "border-marvel-red/40 hover:border-marvel-red",
  glow: "hover:shadow-[0_0_40px_rgba(237,29,36,0.45)]",
  themeColor: "from-marvel-red/30 to-metallic-gold/10",
  badgeBg: "bg-marvel-red text-white shadow-[0_0_12px_#ED1D24]",
  accentColor: "#ED1D24",
  image: "/MARVEL/4081455907815375.png",
};

const HERO_DECORATIONS: Record<string, { border: string; glow: string; themeColor: string; badgeBg: string; accentColor: string; image: string }> = {
  "avengers-code-assemble": { border: "border-marvel-red/40 hover:border-marvel-red", glow: "hover:shadow-[0_0_40px_rgba(237,29,36,0.45)]", themeColor: "from-marvel-red/30 to-metallic-gold/10", badgeBg: "bg-marvel-red text-white shadow-[0_0_12px_#ED1D24]", accentColor: "#ED1D24", image: "/MARVEL/4081455907815375.png" },
  "battle-of-wakanda": { border: "border-vibranium-purple/40 hover:border-vibranium-purple", glow: "hover:shadow-[0_0_40px_rgba(123,47,190,0.45)]", themeColor: "from-vibranium-purple/30 to-blue-600/10", badgeBg: "bg-vibranium-purple text-white shadow-[0_0_12px_#7B2FBE]", accentColor: "#7B2FBE", image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop" },
  "stark-industries-the-pitch": { border: "border-metallic-gold/40 hover:border-metallic-gold", glow: "hover:shadow-[0_0_40px_rgba(255,215,0,0.45)]", themeColor: "from-metallic-gold/30 to-amber-600/10", badgeBg: "bg-metallic-gold text-black shadow-[0_0_12px_#FFD700]", accentColor: "#D4AF37", image: "/MARVEL/300685712645038155.png" },
  "the-dark-knight-hunt-for-the-signal": { border: "border-metallic-gold/40 hover:border-metallic-gold", glow: "hover:shadow-[0_0_40px_rgba(255,215,0,0.45)]", themeColor: "from-metallic-gold/30 to-black/50", badgeBg: "bg-metallic-gold text-black shadow-[0_0_12px_#FFD700]", accentColor: "#FFD700", image: "/MARVEL/3025924746959430.jpg" },
  "the-flash-code-rush": { border: "border-metallic-gold/40 hover:border-metallic-gold", glow: "hover:shadow-[0_0_40px_rgba(255,215,0,0.45)]", themeColor: "from-metallic-gold/30 to-marvel-red/10", badgeBg: "bg-metallic-gold text-black shadow-[0_0_12px_#FFD700]", accentColor: "#FFD700", image: "/MARVEL/61080138757668761.png" },
};

function TiltCard({ item, idx }: { item: typeof fallbackFeatured[0]; idx: number }) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateZ(8px)`;
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0px)";
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`glass-card rounded-2xl border ${item.border} overflow-hidden transition-all duration-300 ${item.glow} group flex flex-col justify-between h-full bg-[#080B14]/80`}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${item.themeColor} via-black/40 to-transparent`} />
        
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${item.badgeBg} font-excon-black`}>
            {item.category}
          </span>
        </div>

        {/* Hero watermark badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
          <div className="w-4 h-4 rounded-full overflow-hidden relative">
            <Image src={item.heroAvatar} alt={item.hero} fill className="object-cover" />
          </div>
          <span className="text-[10px] font-bold text-white uppercase tracking-wider font-excon-bold">{item.hero}</span>
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <span className="text-[10px] text-white/70 block uppercase font-mono">{item.level}</span>
            <span className="text-xs font-bold text-white font-mono">{item.power}</span>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-white/50 block uppercase font-mono">Prize Pool</span>
            <span className="text-sm font-black text-metallic-gold font-mono">{item.prize}</span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-base font-black text-white uppercase tracking-tight group-hover:text-arc-cyan transition-colors line-clamp-2 font-excon-black">
            {item.title}
          </h3>
          <div className="flex items-center gap-3 mt-2 text-xs text-white/60 font-mono">
            <span className="flex items-center gap-1">
              <RiTimeLine className="text-arc-cyan" /> {item.time}
            </span>
            <span className="flex items-center gap-1 truncate">
              <RiMapPinLine className="text-marvel-red" /> {item.venue}
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
          <Link
            href={item.link}
            className="text-[11px] sm:text-xs font-bold text-arc-cyan hover:text-white transition-colors tracking-wider uppercase flex items-center gap-1 font-excon-bold min-w-0"
          >
            <span className="truncate">Mission Briefing</span>
            <RiArrowRightLine className="group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>
          <Link
            href="/signup"
            className="text-[10px] sm:text-[11px] font-black text-white bg-marvel-red hover:bg-white hover:text-black px-3.5 py-1.5 rounded-full transition-all uppercase tracking-wider shadow-[0_0_12px_#ED1D24] font-excon-black shrink-0 text-center whitespace-nowrap"
          >
            Join Mission
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export function FeaturedEvents() {
  const [dbEvents, setDbEvents] = useState<any[]>([]);

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await api.get("/events/");
        const rawList = Array.isArray(res.data)
          ? res.data
          : res.data?.events || res.data?.results || [];
        if (Array.isArray(rawList) && rawList.length > 0) {
          setDbEvents(rawList);
        }
      } catch {}
    }
    loadEvents();

    const socket = getSocket();
    socket.on("event:updated", (evt: any) => {
      setDbEvents(prev => prev.map(e => (e.id === evt.id || e._id === evt._id) ? evt : e));
    });
    socket.on("event:created", (evt: any) => {
      setDbEvents(prev => [evt, ...prev]);
    });

    return () => {
      socket.off("event:updated");
      socket.off("event:created");
    };
  }, []);

  const cardsToRender = dbEvents.length > 0
    ? dbEvents.slice(0, 4).map((e: any) => {
        const slug = e.slug || String(e.id);
        const decor = HERO_DECORATIONS[slug] || DEFAULT_DECOR;
        const prize = e.prize_pool ? `₹${Number(e.prize_pool).toLocaleString("en-IN")}` : (e.prizePool ? `₹${Number(e.prizePool).toLocaleString("en-IN")}` : "₹15,000");
        const time = e.event_time ? `Day 1, ${e.event_time}` : (e.time || "Day 1, 10:00 AM");
        return {
          title: e.title,
          category: `${e.category || "General"} Mission`,
          hero: slug?.includes("urumi") ? "Thor Mjolnir" : (slug?.includes("pitch") ? "Tony Stark" : "Iron Man"),
          power: "Power Rating: 98/100",
          level: "Level: Alpha",
          prize,
          venue: e.venue || "Campus Arena",
          time,
          image: e.image || e.coverImage || decor.image,
          heroAvatar: decor.image,
          link: `/events/${slug}`,
          border: decor.border,
          glow: decor.glow,
          themeColor: decor.themeColor,
          badgeBg: decor.badgeBg,
          accentColor: decor.accentColor,
        };
      })
    : fallbackFeatured;

  return (
    <section className="relative bg-transparent section-padding border-t border-arc-cyan/10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#05050A]/30 via-transparent to-[#05050A]/40 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] rounded-full bg-marvel-red/5 blur-[130px] pointer-events-none z-0" />
      <div className="max-w-7xl mx-auto relative z-10">
        <Reveal y={60} duration={0.7} margin="-100px">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)] font-space">
                <RiFlashlightLine className="animate-pulse text-metallic-gold" />
                <span>S.H.I.E.L.D. TOP MISSIONS</span>
              </div>
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white font-excon-black">
                <span className="shimmer-text">FEATURED</span>{" "}
                <span className="gradient-text-gold">MISSIONS</span>
              </h2>
              <div className="h-0.5 w-24 bg-gradient-to-r from-metallic-gold to-marvel-red origin-left" />
            </div>

            <div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Link
                  href="/events"
                  className="btn-outline border-arc-cyan/40 text-xs px-6 py-3 flex items-center gap-2 tracking-[0.16em] uppercase hover:bg-arc-cyan/10 text-white font-space shadow-[0_0_15px_rgba(0,212,255,0.2)] hover:shadow-[0_0_30px_rgba(0,212,255,0.5)] transition-shadow duration-300"
                >
                  View All Missions
                  <RiArrowRightLine />
                </Link>
              </motion.div>
            </div>
          </div>
        </Reveal>

        <RevealGroup stagger={0.12} margin="-100px" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cardsToRender.map((item) => (
            <RevealItem key={item.title}>
              <TiltCard item={item} idx={0} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

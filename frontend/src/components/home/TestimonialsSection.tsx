"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  RiDoubleQuotesR,
  RiStarFill,
  RiArrowDownSLine,
  RiChatQuoteLine,
} from "react-icons/ri";
import { Reveal } from "@/components/ui/Reveal";
import { useFestivalControl } from "@/lib/festivalStore";

export interface TestimonialReview {
  id: string;
  name: string;
  college: string;
  role: string;
  rating: number;
  quote: string;
  event: string;
  edition: string;
  verified: boolean;
  avatarColor: string;
}

const REAL_DELEGATE_REVIEWS: TestimonialReview[] = [
  {
    id: "rev-1",
    name: "Adithya Menon",
    college: "CET Trivandrum",
    role: "24H Hackathon Lead",
    rating: 5,
    quote:
      "The 24-hour hackathon was hands down the best organized we've attended this season. Dedicated gigabit fiber, midnight refreshments, and judges who actually grilled our architecture. That cash prize cleared directly to our account without delays!",
    event: "Avengers: Code Assemble",
    edition: "MacFiesta 2K25",
    verified: true,
    avatarColor: "from-cyan-500 to-blue-600",
  },
  {
    id: "rev-2",
    name: "Sneha Elizabeth",
    college: "St. Teresa's College, Ernakulam",
    role: "Synchro Dance Captain",
    rating: 5,
    quote:
      "The acoustic setup and stage lighting at the MACFAST amphitheatre were unbelievable. Our 14-member crew had crystal-clear monitor audio and 3,000+ delegates screaming every beat. Defending our title next year!",
    event: "Step Up: Choreo Night",
    edition: "MacFiesta 2K25",
    verified: true,
    avatarColor: "from-rose-500 to-pink-600",
  },
  {
    id: "rev-3",
    name: "Gautham Krishna",
    college: "TKM College of Engineering, Kollam",
    role: "Valorant LAN Champions",
    rating: 5,
    quote:
      "Most college fests struggle with esports, but MacFiesta's tournament arena had 240Hz monitors, zero latency, and live casting. The hospitality desk arranged clean campus accommodation for our entire squad without hassle.",
    event: "Thor: Valorant LAN",
    edition: "MacFiesta 2K25",
    verified: true,
    avatarColor: "from-purple-500 to-indigo-600",
  },
  {
    id: "rev-4",
    name: "Meera Nambiar",
    college: "Christ University, Bangalore",
    role: "Best Manager Finalist",
    rating: 5,
    quote:
      "Coming all the way from Bangalore, we were amazed by the operational smoothness. The digital QR entry pass took literally 3 seconds at Mission Control, food was great, and the stress rounds were genuinely industry-standard.",
    event: "Wakanda: Best Manager",
    edition: "MacFiesta 2K25",
    verified: true,
    avatarColor: "from-amber-500 to-yellow-600",
  },
  {
    id: "rev-5",
    name: "Kevin George",
    college: "Mar Ivanios College, Trivandrum",
    role: "Battle of the Bands Winner",
    rating: 5,
    quote:
      "The sound engineering on the main stage was world-class. Monster line arrays, crystal-clear in-ear monitors, and an electric crowd that didn't stop screaming until midnight. MacFiesta sets the benchmark for collegiate music battles.",
    event: "Ragnarok: Band War",
    edition: "MacFiesta 2K25",
    verified: true,
    avatarColor: "from-red-500 to-orange-600",
  },
  {
    id: "rev-6",
    name: "Devika R.",
    college: "St. Joseph's College, Devagiri",
    role: "Infinity Protocol Winner",
    rating: 5,
    quote:
      "The campus-wide Marvel Infinity Hunt was pure genius! Cryptic riddles hidden across campus kept dozens of teams sprinting for 4 straight hours. The volunteer coordination and clue validation were incredible.",
    event: "Infinity Stone Protocol",
    edition: "MacFiesta 2K25",
    verified: true,
    avatarColor: "from-emerald-500 to-teal-600",
  },
];

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function TestimonialsSection() {
  const { testimonials: storeTestimonials } = useFestivalControl();
  const [isExpanded, setIsExpanded] = useState(false);

  // Normalize store items or use authentic reviews
  const rawApproved = storeTestimonials?.filter((t) => t.approved) || [];
  const hasStaleDummies = rawApproved.some(
    (t) => t.name === "Priya N." || t.name === "Arun K." || t.name === "Cultural Club"
  );

  const reviews: TestimonialReview[] =
    hasStaleDummies || rawApproved.length === 0
      ? REAL_DELEGATE_REVIEWS
      : rawApproved.map((t, idx) => {
        const fallback = REAL_DELEGATE_REVIEWS[idx % REAL_DELEGATE_REVIEWS.length];
        return {
          id: String(t.id || `rev-${idx}`),
          name: t.name || fallback.name,
          college: t.college || fallback.college,
          role: t.role || fallback.role,
          rating: t.rating || 5,
          quote: t.comment || t.quote || fallback.quote,
          event: fallback.event,
          edition: fallback.edition,
          verified: true,
          avatarColor: fallback.avatarColor,
        };
      });

  // Always show first 3 cards initially
  const initialCards = reviews.slice(0, 3);
  const extraCards = reviews.slice(3);
  const hasMoreThanThree = reviews.length > 3;

  return (
    <section className="relative bg-transparent section-padding border-t border-white/10 overflow-hidden min-h-[540px]">
      {/* Background Hero Artwork Accent */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-transparent">
        {/* Enlarge character with soft liquid edge mask to dissolve all hard boundaries and fade out bottom opacity */}
        <div 
          className="absolute inset-0 flex justify-center items-start pt-2 sm:pt-4 z-[1]"
          style={{
            maskImage: "radial-gradient(ellipse 75% 65% at 50% 35%, black 45%, transparent 95%), linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 30%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.1) 75%, transparent 90%)",
            WebkitMaskImage: "radial-gradient(ellipse 75% 65% at 50% 35%, black 45%, transparent 95%), linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 30%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.1) 75%, transparent 90%)",
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
          }}
        >
          <Image
            src="/MARVEL/download (6).png"
            alt="Delegate Voices & Reviews Hero Character"
            width={1200}
            height={1200}
            priority
            className="w-auto max-w-[95%] sm:max-w-[85%] md:max-w-[780px] lg:max-w-[880px] xl:max-w-[940px] max-h-[95%] object-contain object-top filter brightness-110 contrast-110"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-10">
        {/* Section Header */}
        <Reveal y={50} duration={0.7} margin="-80px">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-metallic-gold/40 bg-black/40 text-metallic-gold text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)] font-space backdrop-blur-sm">
              <RiChatQuoteLine className="animate-pulse text-metallic-gold" />
              <span>DELEGATE VOICES &amp; EXPERIENCES</span>
            </div>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white font-excon-black drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
              <span className="shimmer-text">WHAT THEY</span>{" "}
              <span className="gradient-text-gold">SAY &amp; REVIEWS</span>
            </h2>

            <p className="text-white/85 text-sm sm:text-base font-excon max-w-xl mx-auto drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              Real experiences from verified student delegates, champions, and performers across 23 national challenges.
            </p>

            <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-metallic-gold to-marvel-red to-transparent origin-center" />
          </div>
        </Reveal>

        {/* ─── PRIMARY 3 CARDS GRID ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {initialCards.map((t) => (
            <TestimonialCard key={t.id} review={t} />
          ))}
        </div>

        {/* ─── DROPDOWN EXPANSION (Rendered when > 3 Reviews) ─── */}
        {hasMoreThanThree && (
          <div>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 pt-6 sm:pt-8">
                    {extraCards.map((t) => (
                      <TestimonialCard key={t.id} review={t} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Clean, Professional Dropdown Toggle Button */}
            <div className="flex justify-center pt-8">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="group inline-flex items-center gap-2.5 px-7 py-3 rounded-full bg-black/30 hover:bg-black/50 border border-white/20 hover:border-metallic-gold/60 text-xs sm:text-sm font-bold text-white transition-all duration-300 shadow-xl backdrop-blur-sm cursor-pointer hover:shadow-[0_0_25px_rgba(212,175,55,0.2)]"
                aria-expanded={isExpanded}
              >
                <span>{isExpanded ? "Show Fewer Reviews" : `View More Reviews (${extraCards.length} More)`}</span>
                <RiArrowDownSLine
                  className={`text-metallic-gold text-lg transition-transform duration-300 ${isExpanded ? "rotate-180" : "group-hover:translate-y-0.5"
                    }`}
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function TestimonialCard({ review }: { review: TestimonialReview }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.3 }}
      className="p-6 sm:p-7 rounded-2xl border border-white/30 hover:border-metallic-gold/80 flex flex-col justify-between relative min-h-[290px] group transition-all duration-300 bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-sm shadow-[0_8px_24px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(212,175,55,0.3)]"
    >
      {/* Subtle Quote Watermark */}
      <div className="absolute top-6 right-6 text-white/5 text-5xl pointer-events-none group-hover:text-metallic-gold/15 transition-colors duration-500">
        <RiDoubleQuotesR />
      </div>

      <div className="space-y-4 relative z-10">
        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex gap-1 text-metallic-gold text-sm drop-shadow-[0_0_8px_#FFD700]">
            {Array.from({ length: review.rating }).map((_, i) => (
              <RiStarFill key={i} />
            ))}
          </div>
        </div>

        {/* Quote Content */}
        <p className="text-white/90 leading-relaxed text-sm font-medium italic font-excon pt-1">
          &ldquo;{review.quote}&rdquo;
        </p>
      </div>

      {/* Footer Info */}
      <div className="pt-5 border-t border-white/10 mt-6 relative z-10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-full bg-gradient-to-tr ${review.avatarColor || "from-cyan-500 to-blue-600"
              } flex items-center justify-center text-white text-xs font-black shrink-0 shadow-md border border-white/20`}
          >
            {getInitials(review.name)}
          </div>

          <div className="min-w-0">
            <span className="block font-black text-white text-sm sm:text-base tracking-wide uppercase font-excon-black truncate">
              {review.name}
            </span>
            <span className="block text-[11px] font-bold text-arc-cyan uppercase tracking-wider font-excon-bold truncate">
              {review.college}
            </span>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/50">
            {review.edition || "2K25"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { RiDoubleQuotesR, RiStarFill, RiChatQuoteLine } from "react-icons/ri";
import { Reveal } from "@/components/ui/Reveal";
import { useFestivalControl } from "@/lib/festivalStore";

const fallbackTestimonials = [
  {
    quote: "MacFiesta 2K24 was absolute fire! The gaming arena structure and stage lighting rivaled major esports setups.",
    name: "Adarsh Sen",
    college: "CET Trivandrum",
    rating: 5,
    direction: "left",
  },
  {
    quote: "Outstanding organizational structure. From registration QR passes to schedule timelines, everything was extremely seamless.",
    name: "Sneha Nair",
    college: "TKM Kollam",
    rating: 5,
    direction: "up",
  },
  {
    quote: "The concert show was legendary. I have never seen a college fest crowd so packed and energized!",
    name: "Rohan Mathew",
    college: "Sacred Heart Thevara",
    rating: 5,
    direction: "right",
  },
];

const directionVariant = (dir: string) => ({
  hidden: {
    opacity: 0,
    x: dir === "left" ? -60 : dir === "right" ? 60 : 0,
    y: dir === "up" ? 50 : 0,
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
});

export function TestimonialsSection() {
  const { testimonials: storeTestimonials } = useFestivalControl();

  const approvedList = storeTestimonials?.filter((t) => t.approved) || [];
  const directions = ["left", "up", "right"];
  const testimonials =
    approvedList.length > 0
      ? approvedList.map((t, idx) => ({
        quote:
          t.comment ||
          fallbackTestimonials[idx % fallbackTestimonials.length].quote,
        name: t.name || fallbackTestimonials[idx % fallbackTestimonials.length].name,
        college:
          t.college ||
          fallbackTestimonials[idx % fallbackTestimonials.length].college,
        rating: t.rating || 5,
        direction: directions[idx % directions.length],
      }))
      : fallbackTestimonials;
  return (
    <section className="relative bg-transparent section-padding border-t border-white/10 overflow-hidden min-h-[520px]">
      {/* Background Marvel Artwork Accent */}
      <div className="absolute inset-0 z-0 opacity-85 pointer-events-none overflow-hidden">
        <Image
          src="/MARVEL/300685712645038155.png"
          alt="What They Say Marvel Background"
          fill
          priority
          className="object-cover object-top filter brightness-105 contrast-125 saturate-135"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05050A]/70 via-transparent to-[#05050A]/60 z-[1]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-marvel-red/15 blur-[140px] z-[1]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-12">
        {/* Header */}
        <Reveal y={60} duration={0.7} margin="-100px">
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)] font-space">
              <RiChatQuoteLine className="animate-pulse text-metallic-gold" />
              <span>S.H.I.E.L.D. AGENT BUZZ &amp; REVIEWS</span>
            </div>

            <h2
              className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white font-excon-black"
            >
              <span className="shimmer-text">WHAT THEY</span>{" "}
              <span className="gradient-text-gold">SAY &amp; REVIEWS</span>
            </h2>

            {/* Animated expanding divider */}
            <div
              className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-metallic-gold to-marvel-red to-transparent origin-center"
            />
          </div>
        </Reveal>

        {/* Testimonials Grid — alternating directions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              variants={directionVariant(t.direction)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              whileHover={{ scale: 1.03, y: -4 }}
              transition={{ duration: 0.3 }}
              className="glass-aurora p-5 sm:p-8 rounded-2xl border border-white/15 flex flex-col justify-between relative shadow-2xl h-full min-h-[220px] sm:min-h-[260px] group hover:border-metallic-gold/50 transition-colors duration-300"
            >
              {/* Quote mark */}
              <div className="absolute top-6 right-8 text-white/10 text-5xl pointer-events-none group-hover:text-metallic-gold/25 transition-colors duration-500">
                <RiDoubleQuotesR />
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex gap-1 text-metallic-gold text-sm drop-shadow-[0_0_8px_#FFD700]">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <RiStarFill key={i} />
                  ))}
                </div>
                <p className="text-white/90 leading-relaxed text-sm font-medium italic font-excon">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="pt-6 border-t border-white/15 mt-6 relative z-10">
                <span
                  className="block font-black text-white text-base tracking-wide uppercase font-excon-black"
                >
                  {t.name}
                </span>
                <span className="block text-xs font-bold text-arc-cyan uppercase tracking-wider mt-0.5 font-excon-bold">
                  {t.college}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

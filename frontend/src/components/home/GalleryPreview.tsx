"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { RiArrowRightLine, RiImageLine, RiShieldFlashLine, RiZoomInLine } from "react-icons/ri";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { useGalleryItems } from "@/lib/galleryStore";

const fallbackPhotos = [
  { url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop", title: "DJ Show Energy" },
  { url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop", title: "Acoustic Band Setup" },
  { url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop", title: "Concert Crowds" },
  { url: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=800&auto=format&fit=crop", title: "Awards Stage" },
];

export function GalleryPreview() {
  const sectionRef = useRef<HTMLElement>(null);
  const { items } = useGalleryItems();

  const photos = items && items.length >= 4
    ? items.slice(0, 4).map(i => ({ url: i.url, title: i.title }))
    : fallbackPhotos;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const parallaxYOdd = useTransform(scrollYProgress, [0, 1], [-20, 20]);
  const parallaxYEven = useTransform(scrollYProgress, [0, 1], [20, -20]);

  return (
    <section ref={sectionRef} className="relative bg-transparent section-padding border-t border-vibranium-purple/20 overflow-hidden">
      {/* Ambient Color Blending */}
      <motion.div
        className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full bg-vibranium-purple/10 blur-[130px] pointer-events-none"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-arc-cyan/10 blur-[130px] pointer-events-none"
        animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header — Centered to match Sponsors and Partners */}
        <Reveal y={60} duration={0.7} margin="-100px">
          <div className="text-center space-y-4 mb-10 sm:mb-16">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)] font-space"
            >
              <RiShieldFlashLine className="animate-pulse text-metallic-gold" />
              <span>S.H.I.E.L.D. VISUAL ARCHIVES</span>
            </div>

            <h2
              className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white font-excon-black"
            >
              <span className="shimmer-text">FESTIVAL</span>{" "}
              <span className="gradient-text-gold">GALLERY &amp; VAULT</span>
            </h2>

            {/* Animated expanding divider */}
            <div
              className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-arc-cyan to-metallic-gold to-transparent origin-center"
            />

            <p
              className="text-white/60 text-xs sm:text-sm font-space max-w-md mx-auto leading-relaxed font-normal"
            >
              Captured moments, stage performances, and high-voltage collegiate warfare.
            </p>
          </div>
        </Reveal>

        {/* Photo Grid — Staggered reveal & dynamic 3D scroll parallax depth */}
        <RevealGroup stagger={0.12} margin="-100px" className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {photos.map((photo, idx) => (
            <RevealItem key={idx}>
              <motion.div
                style={{ y: idx % 2 === 0 ? parallaxYEven : parallaxYOdd }}
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative aspect-square md:aspect-[3/4] overflow-hidden rounded-2xl border border-white/8 group shadow-lg cursor-pointer hover:border-arc-cyan/40 transition-colors duration-300"
              >
                <div className="w-full h-full overflow-hidden relative">
                  <Image
                    src={photo.url}
                    alt={photo.title}
                    fill
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  />
                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

                {/* Hover content */}
                <div className="absolute bottom-4 left-4 right-4 z-10 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-between">
                  <span className="text-white text-xs md:text-sm font-bold truncate uppercase tracking-wider font-space">
                    {photo.title}
                  </span>
                  <span className="p-2 rounded-full bg-arc-cyan text-black text-xs shrink-0 shadow-[0_0_12px_#00D4FF]">
                    <RiZoomInLine />
                  </span>
                </div>

                {/* Top right overlay badge */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="p-1.5 rounded-full bg-black/70 text-white/70 text-xs block">
                    <RiImageLine />
                  </span>
                </div>
              </motion.div>
            </RevealItem>
          ))}
        </RevealGroup>

        {/* Bottom Full Gallery CTA */}
        <Reveal y={40} duration={0.6} margin="-50px">
          <div className="flex justify-center mt-8 sm:mt-12">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link
                href="/gallery"
                className="btn-outline text-xs sm:text-sm px-6 sm:px-8 py-3 sm:py-3.5 flex items-center gap-2 tracking-[0.16em] uppercase font-space text-white border-arc-cyan/40 shadow-[0_0_20px_rgba(0,212,255,0.25)] hover:shadow-[0_0_35px_rgba(0,212,255,0.6)] transition-shadow duration-300 whitespace-nowrap rounded-full"
              >
                <span>Explore Full Gallery</span>
                <RiArrowRightLine className="text-arc-cyan shrink-0 text-base" />
              </Link>
            </motion.div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

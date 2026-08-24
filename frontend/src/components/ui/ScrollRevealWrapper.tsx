"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

interface ScrollRevealProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  enable3DTilt?: boolean;
  laserColor?: "cyan" | "red" | "gold" | "purple";
}

const LASER_GRADIENTS = {
  cyan: {
    line: "from-transparent via-[#00D4FF] to-transparent",
    glow: "rgba(0, 212, 255, 0.4)",
    ambient: "rgba(0, 212, 255, 0.08)",
  },
  red: {
    line: "from-transparent via-[#ED1D24] to-transparent",
    glow: "rgba(237, 29, 36, 0.4)",
    ambient: "rgba(237, 29, 36, 0.08)",
  },
  gold: {
    line: "from-transparent via-[#D4AF37] to-transparent",
    glow: "rgba(212, 175, 55, 0.4)",
    ambient: "rgba(212, 175, 55, 0.08)",
  },
  purple: {
    line: "from-transparent via-[#9D4EDD] to-transparent",
    glow: "rgba(157, 78, 221, 0.4)",
    ambient: "rgba(157, 78, 221, 0.08)",
  },
};

export function ScrollRevealWrapper({
  children,
  id,
  className = "",
  enable3DTilt = true,
  laserColor = "cyan",
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll position of this section relative to viewport
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Modern cinematic easing spring (silky smooth, zero jitter)
  const smoothSpring = { stiffness: 85, damping: 24, mass: 0.7, restDelta: 0.0005 };

  // Scroll-driven modern elevation, scale & opacity curves
  const rawScale = useTransform(scrollYProgress, [0, 0.22, 0.85, 1], [0.982, 1, 1, 0.985]);
  const rawOpacity = useTransform(scrollYProgress, [0, 0.18, 0.88, 1], [0.35, 1, 1, 0.4]);
  const rawY = useTransform(scrollYProgress, [0, 0.22], [30, 0]);

  // Laser beam tracer expansion (0 -> 1 as section scrolls into view)
  const rawLaserProgress = useTransform(scrollYProgress, [0, 0.25], [0, 1]);
  const rawGlowOpacity = useTransform(scrollYProgress, [0, 0.2, 0.5, 0.85], [0, 0.6, 0.3, 0]);

  const scale = useSpring(rawScale, smoothSpring);
  const opacity = useSpring(rawOpacity, smoothSpring);
  const y = useSpring(rawY, smoothSpring);
  const laserProgress = useSpring(rawLaserProgress, smoothSpring);
  const glowOpacity = useSpring(rawGlowOpacity, smoothSpring);

  const themeConfig = LASER_GRADIENTS[laserColor] || LASER_GRADIENTS.cyan;

  return (
    <div ref={containerRef} id={id} className={`relative w-full ${className}`}>
      {/* ─── Scroll-Driven Holographic Laser Energy Line ─── */}
      <div className="absolute top-0 left-0 right-0 h-[2px] z-30 pointer-events-none overflow-hidden">
        <motion.div
          className={`h-full w-full bg-gradient-to-r ${themeConfig.line}`}
          style={{
            scaleX: laserProgress,
            transformOrigin: "center",
            boxShadow: `0 0 16px ${themeConfig.glow}`,
          }}
        />
      </div>

      {/* ─── Ambient Section Entrance Spotlight Aura ─── */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 blur-3xl pointer-events-none z-0 rounded-full"
        style={{
          background: `radial-gradient(ellipse at center, ${themeConfig.ambient} 0%, transparent 70%)`,
          opacity: glowOpacity,
        }}
      />

      {/* ─── Smooth Cinematic Section Content Container ─── */}
      <motion.div
        style={
          enable3DTilt
            ? {
                scale,
                opacity,
                y,
                willChange: "transform, opacity",
                transformStyle: "preserve-3d",
              }
            : {
                opacity,
                willChange: "opacity",
              }
        }
        className="relative z-10"
      >
        {children}
      </motion.div>
    </div>
  );
}

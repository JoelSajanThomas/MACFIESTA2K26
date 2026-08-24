"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Lightweight CSS-only animated particle background.
 * Creates floating geometric shapes, energy dots, and subtle hex grid overlay.
 * Performance optimized with will-change and pointer-events: none.
 * Hidden on admin pages.
 */
export function ParticleBackground() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || pathname?.startsWith("/admin")) return null;

  // Deterministic particles to prevent hydration mismatches
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: (i * 31 + 17) % 100,
    top: (i * 43 + 11) % 100,
    size: 1 + ((i * 7) % 3),
    duration: 8 + ((i * 13) % 12),
    delay: ((i * 19) % 8),
    type: i % 5,
  }));

  const hexagons = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    left: (i * 41 + 5) % 90 + 5,
    top: (i * 37 + 15) % 80 + 10,
    size: 40 + ((i * 23) % 60),
    duration: 15 + ((i * 11) % 10),
    delay: i * 2,
    opacity: 0.02 + ((i * 7) % 3) * 0.008,
  }));

  return (
    <>
      {/* Hex grid overlay */}
      <div className="hex-grid-overlay" aria-hidden="true" />

      {/* Floating energy particles */}
      <div
        className="fixed inset-0 pointer-events-none z-[1] overflow-hidden"
        aria-hidden="true"
        style={{ willChange: "auto" }}
      >
        {particles.map((p) => {
          const colors = [
            "rgba(0, 212, 255, 0.4)",   // arc reactor cyan
            "rgba(237, 29, 36, 0.35)",   // marvel red
            "rgba(212, 175, 55, 0.3)",   // metallic gold
            "rgba(123, 47, 190, 0.3)",   // vibranium purple
            "rgba(30, 144, 255, 0.3)",   // neon blue
          ];
          return (
            <div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: colors[p.type],
                animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
                opacity: 0.6,
              }}
            />
          );
        })}

        {/* Floating hexagonal shapes */}
        {hexagons.map((h) => (
          <div
            key={`hex-${h.id}`}
            className="absolute"
            style={{
              left: `${h.left}%`,
              top: `${h.top}%`,
              width: `${h.size}px`,
              height: `${h.size}px`,
              border: "1px solid rgba(0, 212, 255, 0.08)",
              clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              animation: `float ${h.duration}s ease-in-out ${h.delay}s infinite`,
              opacity: h.opacity,
            }}
          />
        ))}
      </div>
    </>
  );
}

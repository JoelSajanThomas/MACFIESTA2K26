"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Custom Marvel Arc Reactor cursor emitting energy trails & shield pulse on hover.
 */
export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isButton, setIsButton] = useState(false);

  useEffect(() => {
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const glow = glowRef.current;
    const core = coreRef.current;
    if (!glow || !core) return;

    glow.style.opacity = "1";
    core.style.opacity = "1";

    let rafId: number | null = null;
    let hoveredState = false;
    let buttonState = false;

    const handleMouseMove = (e: MouseEvent) => {
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          glow.style.left = `${e.clientX}px`;
          glow.style.top = `${e.clientY}px`;
          core.style.left = `${e.clientX}px`;
          core.style.top = `${e.clientY}px`;
          rafId = null;
        });
      }

      const target = e.target as HTMLElement | null;
      if (target) {
        const nextHovered = !!target.closest("a, button, input, [role='button'], .glass-card, .marvel-card");
        const nextButton = !!target.closest("button, .btn-primary, .btn-outline, .marvel-btn");
        
        if (nextHovered !== hoveredState) {
          hoveredState = nextHovered;
          setIsHovered(nextHovered);
        }
        if (nextButton !== buttonState) {
          buttonState = nextButton;
          setIsButton(nextButton);
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <>
      {/* Outer Arc Reactor Aura */}
      <div
        ref={glowRef}
        className="cursor-glow pointer-events-none fixed z-[9998] transition-transform duration-200 ease-out"
        style={{
          opacity: 0,
          transform: `translate(-50%, -50%) scale(${isButton ? 1.4 : isHovered ? 1.15 : 1})`,
        }}
      />

      {/* Mini Arc Reactor Core Cursor */}
      <div
        ref={coreRef}
        className="pointer-events-none fixed z-[9999] hidden sm:flex items-center justify-center transition-transform duration-100 ease-out"
        style={{
          opacity: 0,
          transform: `translate(-50%, -50%) scale(${isButton ? 1.3 : isHovered ? 1.1 : 1})`,
        }}
      >
        <div className={`relative flex items-center justify-center rounded-full transition-all duration-300 ${
          isButton ? "w-7 h-7 border-2 border-marvel-red bg-marvel-red/20 shadow-[0_0_20px_#ED1D24]" :
          isHovered ? "w-6 h-6 border border-arc-cyan bg-arc-cyan/20 shadow-[0_0_15px_#00D4FF]" :
          "w-4 h-4 border border-arc-cyan/60 bg-black/40 shadow-[0_0_10px_#00D4FF]"
        }`}>
          <div className={`rounded-full animate-pulse ${
            isButton ? "w-2.5 h-2.5 bg-marvel-red shadow-[0_0_8px_#ED1D24]" :
            "w-1.5 h-1.5 bg-arc-cyan shadow-[0_0_6px_#00D4FF]"
          }`} />
          <div className="absolute inset-0 rounded-full border border-white/20 animate-spin-slow" />
        </div>
      </div>
    </>
  );
}

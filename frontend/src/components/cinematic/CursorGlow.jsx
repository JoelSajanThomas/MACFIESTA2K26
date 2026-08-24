import { useEffect, useRef, useState } from "react";

/**
 * MACFIESTA1 Arc Reactor cursor — outer aura + spinning core (desktop only).
 */
export default function CursorGlow() {
  const glowRef = useRef(null);
  const coreRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isButton, setIsButton] = useState(false);

  useEffect(() => {
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isTouch || !fine || reduced) return undefined;

    const glow = glowRef.current;
    const core = coreRef.current;
    if (!glow || !core) return undefined;

    glow.style.opacity = "1";
    core.style.opacity = "1";

    let rafId = null;
    let hoveredState = false;
    let buttonState = false;

    const handleMouseMove = (e) => {
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          glow.style.left = `${e.clientX}px`;
          glow.style.top = `${e.clientY}px`;
          core.style.left = `${e.clientX}px`;
          core.style.top = `${e.clientY}px`;
          rafId = null;
        });
      }

      const target = e.target;
      if (!target?.closest) return;
      const nextHovered = !!target.closest(
        "a, button, input, [role='button'], .glass-card, .marvel-card, .mf-glow-btn, .event-card-premium, .mvc-card, .ref-btn, .btn"
      );
      const nextButton = !!target.closest(
        "button, .btn-primary, .btn-outline, .marvel-btn, .mf1-loader__enter"
      );

      if (nextHovered !== hoveredState) {
        hoveredState = nextHovered;
        setIsHovered(nextHovered);
      }
      if (nextButton !== buttonState) {
        buttonState = nextButton;
        setIsButton(nextButton);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const scale = isButton ? 1.4 : isHovered ? 1.15 : 1;
  const coreScale = isButton ? 1.3 : isHovered ? 1.1 : 1;

  return (
    <>
      <div
        ref={glowRef}
        className="mf1-cursor-glow"
        style={{
          opacity: 0,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
        aria-hidden="true"
      />
      <div
        ref={coreRef}
        className="mf1-cursor-core"
        style={{
          opacity: 0,
          transform: `translate(-50%, -50%) scale(${coreScale})`,
        }}
        aria-hidden="true"
      >
        <div
          className={`mf1-cursor-core__ring${isButton ? " is-button" : ""}${isHovered && !isButton ? " is-hover" : ""}`}
        >
          <div className={`mf1-cursor-core__dot${isButton ? " is-button" : ""}`} />
          <div className="mf1-cursor-core__spin" />
        </div>
      </div>
    </>
  );
}

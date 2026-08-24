import { useEffect, useRef } from "react";

/**
 * Pointer-driven parallax for layered cinematic scenes.
 * Uses CSS variables --px / --py on the target element.
 * Disabled for reduced motion / coarse pointers / mobile.
 */
export function usePointerParallax(enabled = true, strength = 12) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || !enabled) return undefined;

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const narrow = window.matchMedia("(max-width: 768px)").matches;
    if (coarse || reduced || narrow) return undefined;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    function onMove(e) {
      const rect = node.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      targetX = Math.max(-1, Math.min(1, nx)) * strength;
      targetY = Math.max(-1, Math.min(1, ny)) * strength;
    }

    function tick() {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      node.style.setProperty("--px", `${currentX.toFixed(2)}px`);
      node.style.setProperty("--py", `${currentY.toFixed(2)}px`);
      raf = requestAnimationFrame(tick);
    }

    function onLeave() {
      targetX = 0;
      targetY = 0;
    }

    node.addEventListener("pointermove", onMove, { passive: true });
    node.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, strength]);

  return ref;
}

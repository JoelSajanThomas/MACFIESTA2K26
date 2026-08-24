import { useEffect, useRef } from "react";
import { useMotionPrefs } from "./useMotionPrefs";

export function useTilt(enabled = true, strength = 6) {
  const ref = useRef(null);
  const prefs = useMotionPrefs();

  useEffect(() => {
    const node = ref.current;
    if (!node || !enabled || prefs.reduced || prefs.mobile || typeof window === "undefined") {
      return undefined;
    }

    if (window.matchMedia("(pointer: coarse)").matches) return undefined;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    function resetSpot() {
      node.style.setProperty("--spot-x", "50%");
      node.style.setProperty("--spot-y", "50%");
      node.style.setProperty("--depth-shift", "0px");
    }

    function onMove(event) {
      const rect = node.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const localX = (event.clientX - rect.left) / rect.width;
      const localY = (event.clientY - rect.top) / rect.height;
      const nx = Math.max(-1, Math.min(1, (localX - 0.5) * 2));
      const ny = Math.max(-1, Math.min(1, (localY - 0.5) * 2));

      targetY = nx * strength;
      targetX = -ny * strength;
      node.style.setProperty("--spot-x", `${(localX * 100).toFixed(2)}%`);
      node.style.setProperty("--spot-y", `${(localY * 100).toFixed(2)}%`);
    }

    function onLeave() {
      targetX = 0;
      targetY = 0;
      resetSpot();
    }

    function tick() {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      node.style.setProperty("--tilt-x", `${currentX.toFixed(2)}deg`);
      node.style.setProperty("--tilt-y", `${currentY.toFixed(2)}deg`);
      node.style.setProperty(
        "--depth-shift",
        `${Math.min(8, (Math.abs(currentX) + Math.abs(currentY)) * 0.22).toFixed(2)}px`
      );

      raf = window.requestAnimationFrame(tick);
    }

    resetSpot();
    node.addEventListener("pointermove", onMove, { passive: true });
    node.addEventListener("pointerleave", onLeave);
    raf = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(raf);
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, prefs.mobile, prefs.reduced, strength]);

  return ref;
}
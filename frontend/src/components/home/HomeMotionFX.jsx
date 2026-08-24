import { useEffect } from "react";
import { useMotionPrefs } from "../../hooks/useMotionPrefs";

/**
 * Home-page 3D / motion boost — soft tilt on sections + depth CSS vars.
 */
export default function HomeMotionFX() {
  const prefs = useMotionPrefs();

  useEffect(() => {
    if (prefs.reduced || prefs.mobile) return undefined;
    if (typeof window === "undefined") return undefined;
    if (window.matchMedia("(pointer: coarse)").matches) return undefined;

    const root = document.querySelector(".home-page");
    if (!root) return undefined;

    root.classList.add("home-page--fx3d");

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    function onMove(e) {
      const rect = root.getBoundingClientRect();
      if (!rect.height) return;
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * 2;
      tx = Math.max(-1, Math.min(1, nx));
      ty = Math.max(-1, Math.min(1, ny));
    }

    function tick() {
      cx += (tx - cx) * 0.05;
      cy += (ty - cy) * 0.05;
      root.style.setProperty("--home-rx", `${(-cy * 1.1).toFixed(3)}deg`);
      root.style.setProperty("--home-ry", `${(cx * 1.4).toFixed(3)}deg`);
      root.style.setProperty("--home-px", `${(cx * 10).toFixed(2)}px`);
      root.style.setProperty("--home-py", `${(cy * 8).toFixed(2)}px`);
      raf = requestAnimationFrame(tick);
    }

    function onLeave() {
      tx = 0;
      ty = 0;
    }

    root.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      root.classList.remove("home-page--fx3d");
      root.style.removeProperty("--home-rx");
      root.style.removeProperty("--home-ry");
      root.style.removeProperty("--home-px");
      root.style.removeProperty("--home-py");
    };
  }, [prefs.mobile, prefs.reduced]);

  return null;
}

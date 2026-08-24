import { useEffect, useRef, useState } from "react";

/** Lightweight count-up for HUD stats. Decorative when not fed live data. */
export default function AnimatedCounter({ value = 0, duration = 900, className = "" }) {
  const [display, setDisplay] = useState(0);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced.current) {
      setDisplay(value);
      return undefined;
    }
    const start = performance.now();
    const from = 0;
    let raf = 0;
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setDisplay(Math.round(from + (value - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span className={className}>{display}</span>;
}

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

function AnimatedNumber({ value, duration = 1.8 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = Number(value) || 0;
    const startTime = performance.now();

    function tick(now) {
      const progress = Math.min((now - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [inView, value, duration]);

  return <span ref={ref}>{display}</span>;
}

export default function StatsCounter({ stats }) {
  const items = [
    { value: stats?.total_events ?? 0, label: "Events", suffix: "+" },
    { value: stats?.total_registrations ?? 0, label: "Participants", suffix: "+" },
    { value: stats?.total_results ?? 0, label: "Results", suffix: "" },
    { value: stats?.total_gallery_images ?? 0, label: "Moments", suffix: "+" },
  ];

  return (
    <div className="stats-counter-grid">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          className="stats-counter-card"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          whileHover={{ y: -6 }}
        >
          <span className="stats-counter-value">
            <AnimatedNumber value={item.value} />
            {item.suffix}
          </span>
          <span className="stats-counter-label">{item.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

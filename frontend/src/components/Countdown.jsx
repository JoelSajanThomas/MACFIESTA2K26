import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FEST_DATE } from "../utils/constants";

function getTimeLeft() {
  const diff = FEST_DATE - new Date();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function Unit({ value, label }) {
  return (
    <motion.div
      className="countdown-unit"
      key={`${label}-${value}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <span className="countdown-value">{String(value).padStart(2, "0")}</span>
      <span className="countdown-label">{label}</span>
    </motion.div>
  );
}

export default function Countdown() {
  const [time, setTime] = useState(getTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="countdown">
      <Unit value={time.days} label="Days" />
      <span className="countdown-sep">:</span>
      <Unit value={time.hours} label="Hours" />
      <span className="countdown-sep">:</span>
      <Unit value={time.minutes} label="Mins" />
      <span className="countdown-sep">:</span>
      <Unit value={time.seconds} label="Secs" />
    </div>
  );
}

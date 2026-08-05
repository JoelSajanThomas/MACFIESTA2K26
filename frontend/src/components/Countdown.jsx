import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FEST_DATE } from "../utils/constants";
import { EASE_PREMIUM, MOTION } from "../utils/animations";

function getTimeLeft(targetMs) {
  if (!Number.isFinite(targetMs)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const diff = targetMs - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function AnimatedValue({ value }) {
  const display = String(value).padStart(2, "0");

  return (
    <span className="countdown-value" aria-hidden="true">
      <span className="countdown-value-track">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={display}
            className="countdown-value-digit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: MOTION.digit, ease: EASE_PREMIUM }}
          >
            {display}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}

function Unit({ value, label }) {
  const display = String(value).padStart(2, "0");

  return (
    <div className="countdown-unit">
      <span className="countdown-unit-glow" aria-hidden="true" />
      <span className="countdown-unit-shine" aria-hidden="true" />
      <AnimatedValue value={value} />
      <span className="sr-only">{display} {label}</span>
      <span className="countdown-label">{label}</span>
    </div>
  );
}

function Separator() {
  return <span className="countdown-sep countdown-sep-animated" aria-hidden="true">:</span>;
}

export default function Countdown({ targetDate, variant = "default", embedded = false }) {
  const targetMs = (() => {
    const raw = targetDate || FEST_DATE;
    const ms = raw instanceof Date ? raw.getTime() : new Date(raw).getTime();
    return Number.isFinite(ms) ? ms : FEST_DATE.getTime();
  })();
  const [time, setTime] = useState(() => getTimeLeft(targetMs));

  useEffect(() => {
    setTime(getTimeLeft(targetMs));
    const id = setInterval(() => setTime(getTimeLeft(targetMs)), 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  return (
    <div className={`countdown-wrap countdown-wrap-${variant}${embedded ? " countdown-embedded" : ""}`}>
      {variant === "hero" && (
        <p className="countdown-eyebrow">Festival begins in</p>
      )}
      <div
        className={`countdown countdown-${variant}`}
        role="timer"
        aria-live="polite"
        aria-label={`${time.days} days, ${time.hours} hours, ${time.minutes} minutes, ${time.seconds} seconds remaining`}
      >
        <Unit value={time.days} label="Days" />
        <Separator />
        <Unit value={time.hours} label="Hours" />
        <Separator />
        <Unit value={time.minutes} label="Mins" />
        <Separator />
        <Unit value={time.seconds} label="Secs" />
      </div>
    </div>
  );
}

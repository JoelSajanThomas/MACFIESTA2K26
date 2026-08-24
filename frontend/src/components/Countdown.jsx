import { useEffect, useState } from "react";
import { FEST_DATE } from "../utils/constants";

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

/**
 * Visual digit layer only. Parent timer owns the accessible announcement.
 * Do not add sr-only / aria text here — that caused "43 / 43 Days / Days" duplication.
 */
function AnimatedValue({ value }) {
  const display = String(value).padStart(2, "0");
  return (
    <span className="countdown-value" aria-hidden="true">
      <span className="countdown-value-track">
        <span className="countdown-value-digit">{display}</span>
      </span>
    </span>
  );
}

function Unit({ value, label }) {
  return (
    <div className="countdown-unit">
      <span className="countdown-unit-glow" aria-hidden="true" />
      <span className="countdown-unit-shine" aria-hidden="true" />
      <AnimatedValue value={value} />
      <span className="countdown-label" aria-hidden="true">
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return (
    <span className="countdown-sep countdown-sep-animated" aria-hidden="true">
      :
    </span>
  );
}

function parseTargetMs(targetDate) {
  let ms = 0;
  if (typeof targetDate === "number") {
    ms = targetDate;
  } else if (targetDate) {
    ms = new Date(targetDate).getTime();
  }
  if (!Number.isFinite(ms)) {
    ms = new Date(FEST_DATE || "2026-09-24T09:00:00").getTime();
  }
  return ms;
}

export default function Countdown({ targetDate, variant = "default", embedded = false }) {
  const targetMs = parseTargetMs(targetDate);
  const [time, setTime] = useState(() => getTimeLeft(targetMs));

  useEffect(() => {
    setTime(getTimeLeft(targetMs));
    const id = setInterval(() => setTime(getTimeLeft(targetMs)), 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  const announcement = `${time.days} days, ${time.hours} hours, ${time.minutes} minutes, ${time.seconds} seconds remaining`;

  return (
    <div className={`countdown-wrap countdown-wrap-${variant}${embedded ? " countdown-embedded" : ""}`}>
      {variant === "hero" && (
        <p className="countdown-eyebrow" aria-hidden="true">
          Festival begins in
        </p>
      )}
      <div
        className={`countdown countdown-${variant}`}
        role="timer"
        aria-live="polite"
        aria-atomic="true"
        aria-label={announcement}
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

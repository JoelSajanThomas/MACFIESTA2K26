"use client";

import { useState, useEffect } from "react";
import { getTimeRemaining } from "@/lib/utils";
import { FESTIVAL_CONFIG } from "@/lib/constants";
import { useFestivalControl } from "@/lib/festivalStore";

/**
 * Animated flip-clock style countdown timer.
 * Each unit (days/hours/minutes/seconds) is displayed in a glassmorphism card.
 */
export function CountdownTimer() {
  const { timeline } = useFestivalControl();
  const [timeLeft, setTimeLeft] = useState({ total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  const targetDate = timeline.festStartDate ? new Date(timeline.festStartDate) : FESTIVAL_CONFIG.festivalDate;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const frameId = requestAnimationFrame(() => {
      setMounted(true);
      setTimeLeft(getTimeRemaining(targetDate));
      timer = setInterval(() => {
        setTimeLeft(getTimeRemaining(targetDate));
      }, 1000);
    });

    return () => {
      cancelAnimationFrame(frameId);
      if (timer) clearInterval(timer);
    };
  }, [timeline.festStartDate]);

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 opacity-0">
        <span className="text-xs uppercase font-bold text-white/40 tracking-widest">Loading Timer...</span>
      </div>
    );
  }

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
      {units.map((unit, i) => (
        <div key={unit.label} className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
          <div className="flex flex-col items-center">
            <div className="glass relative overflow-hidden rounded-xl px-1.5 py-1.5 sm:px-2 sm:py-2 md:px-2.5 md:py-2.5 min-w-[38px] sm:min-w-[48px] md:min-w-[52px] border border-metallic-gold/20">
              {/* Shimmer overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" style={{ backgroundSize: "200% 100%" }} />
              <span
                className="relative z-10 block text-center text-sm sm:text-lg md:text-xl font-black text-metallic-gold tabular-nums font-excon-black"
              >
                {String(unit.value).padStart(2, "0")}
              </span>
            </div>
            <span
              className="mt-1 text-[7px] sm:text-[8px] md:text-[9px] text-white/60 tracking-[0.16em] uppercase font-excon-bold"
            >
              {unit.label}
            </span>
          </div>
          {/* Separator dots */}
          {i < units.length - 1 && (
            <div className="flex flex-col gap-1 pb-3">
              <div className="w-[2.5px] h-[2.5px] sm:w-[3px] sm:h-[3px] rounded-full bg-metallic-gold/60 animate-pulse" />
              <div className="w-[2.5px] h-[2.5px] sm:w-[3px] sm:h-[3px] rounded-full bg-metallic-gold/60 animate-pulse" style={{ animationDelay: "0.3s" }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

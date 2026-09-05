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
    let timer: ReturnType<typeof setInterval>;
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
            <div
              className="relative overflow-hidden rounded-xl px-2 py-2 sm:px-2.5 sm:py-2.5 min-w-[52px] sm:min-w-[58px] md:min-w-[64px] border border-white/20 hover:border-arc-cyan/70 shadow-[0_8px_20px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.2)] group transition-all duration-300 hover:shadow-[0_0_18px_rgba(0,212,255,0.4)]"
              style={{
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                background: "linear-gradient(180deg, rgba(7, 13, 28, 0.6) 0%, rgba(2, 5, 15, 0.45) 100%)",
              }}
            >
              {/* Holographic mid-split seam */}
              <div className="absolute inset-x-0 top-1/2 h-[1px] bg-arc-cyan/35 pointer-events-none z-20" />
              <span className="relative z-10 block text-center text-lg sm:text-xl md:text-2xl font-black font-orbitron tabular-nums tracking-wide text-[#FFD700]">
                {String(unit.value).padStart(2, "0")}
              </span>
            </div>
            <span className="mt-1.5 text-[8.5px] sm:text-[9.5px] md:text-[10px] text-white/90 font-bold tracking-[0.2em] uppercase font-orbitron">
              {unit.label}
            </span>
          </div>
          {/* Marvel vs DC Dual Separator Dots */}
          {i < units.length - 1 && (
            <div className="flex flex-col gap-1.5 pb-3.5 items-center px-0.5">
              <div className="w-[3px] h-[3px] rounded-full bg-marvel-red shadow-[0_0_6px_#ED1D24] animate-pulse" />
              <div
                className="w-[3px] h-[3px] rounded-full bg-arc-cyan shadow-[0_0_6px_#00D4FF] animate-pulse"
                style={{ animationDelay: "0.5s" }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

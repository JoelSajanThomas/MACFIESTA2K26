"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { RiPlayLine, RiCalendarCheckLine, RiShieldFlashLine, RiDashboardLine } from "react-icons/ri";
import { Reveal } from "@/components/ui/Reveal";
import { isLoggedIn, getCurrentUser } from "@/services/api";
import { AUTH_CHANGE_EVENT } from "@/utils/auth";

export function RegistrationCTA() {
  const [userLoggedIn, setUserLoggedIn] = useState(() => isLoggedIn());
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const syncAuth = () => {
      const logged = isLoggedIn();
      setUserLoggedIn(logged);
      if (logged) {
        getCurrentUser()
          .then((res) => setUser(res.data))
          .catch(() => {});
      } else {
        setUser(null);
      }
    };
    syncAuth();
    window.addEventListener(AUTH_CHANGE_EVENT, syncAuth);
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, syncAuth);
  }, []);

  return (
    <section className="relative bg-transparent section-padding overflow-hidden border-t border-white/10 min-h-[480px] flex items-center justify-center">
      {/* Background Marvel Artwork Accent */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-90">
        <Image
          src="/MARVEL/658651514296997716.png"
          alt="Legends Cup Marvel Background"
          fill
          priority
          className="object-cover object-center filter brightness-110 contrast-125 saturate-135"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05050A]/70 via-transparent to-[#05050A]/60 z-[1]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(5,5,10,0.65)_90%)] z-[1]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-marvel-red/20 blur-[140px] z-[1]" />
      </div>

      <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8 px-4">
        {/* Zoom-in glass container */}
        <Reveal y={60} duration={0.7} margin="-100px">
          <div className="glass-aurora border border-white/15 p-6 sm:p-12 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.9)] space-y-8 max-w-4xl mx-auto">
            {/* Limited slots / Agent Access badge */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold tracking-[0.2em] uppercase font-space ${
                userLoggedIn
                  ? "border-arc-cyan/40 bg-arc-cyan/10 text-arc-cyan shadow-[0_0_15px_rgba(0,212,255,0.25)]"
                  : "border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold shadow-[0_0_15px_rgba(212,175,55,0.25)]"
              }`}
            >
              {userLoggedIn ? (
                <>
                  <RiShieldFlashLine className="text-arc-cyan" />
                  <span>AGENT ACCESS ACTIVE • SECURE MISSION CONTROL</span>
                </>
              ) : (
                <>
                  <RiCalendarCheckLine className="animate-bounce text-metallic-gold" />
                  <span>LIMITED REGISTRATION SLOTS REMAINING</span>
                </>
              )}
            </div>

            <div className="space-y-4">
              <h2
                className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight leading-tight font-excon-black"
              >
                <span className="shimmer-text">ARE YOU READY TO CLAIM YOUR</span>{" "}
                <br className="hidden sm:inline" />
                <span className="gradient-text-gold">LEGENDS CUP?</span>
              </h2>

              <p
                className="text-white/85 font-space text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-normal"
              >
                {"Don't miss the chance to represent your college in technical challenges, gaming leagues, and cultural pro shows. Get your unified festival entry pass now."}
              </p>
            </div>

            {/* S.H.I.E.L.D. stats bar */}
            <div
              className="flex flex-wrap justify-center gap-6 sm:gap-8 py-4 border-y border-white/10"
            >
              {[
                { label: "23", desc: "Missions" },
                { label: "₹1,15,000+", desc: "Prize Pool" },
                { label: "5000+", desc: "Agents" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <span
                    className="block text-2xl sm:text-3xl font-black text-arc-cyan glow-text-cyan font-anton"
                  >
                    {stat.label}
                  </span>
                  <span className="block text-xs text-white/60 uppercase tracking-[0.16em] font-space">
                    {stat.desc}
                  </span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div
              className="flex flex-row justify-center items-center gap-2.5 sm:gap-4 pt-2 w-full max-w-[340px] sm:max-w-md mx-auto px-1"
            >
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="flex-1 min-w-0"
              >
                {userLoggedIn ? (
                  <Link
                    href={user?.is_staff || user?.is_superuser ? "/admin" : "/student-dashboard"}
                    className="btn-urgency w-full px-2.5 sm:px-10 py-2.5 sm:py-4 group font-space flex items-center justify-center gap-1.5 sm:gap-2 shadow-[0_0_25px_rgba(0,212,255,0.4)] hover:shadow-[0_0_40px_rgba(0,212,255,0.7)] transition-shadow duration-300 !bg-arc-cyan !text-black"
                  >
                    <RiDashboardLine className="text-base shrink-0" />
                    <span className="relative z-10 font-black tracking-[0.08em] sm:tracking-[0.16em] uppercase text-[10.5px] sm:text-sm truncate">
                      {user?.is_staff || user?.is_superuser ? "Command Console" : "Agent HUD"}
                    </span>
                  </Link>
                ) : (
                  <Link
                    href="/signup"
                    className="btn-urgency w-full px-2.5 sm:px-10 py-2.5 sm:py-4 group font-space flex items-center justify-center gap-1.5 sm:gap-2 shadow-[0_0_25px_rgba(237,29,36,0.5)] hover:shadow-[0_0_40px_rgba(237,29,36,0.8)] transition-shadow duration-300"
                  >
                    <span className="relative z-10 font-bold tracking-[0.08em] sm:tracking-[0.16em] uppercase text-[10.5px] sm:text-sm truncate">
                      Register Pass
                    </span>
                    <RiPlayLine className="group-hover:translate-x-1 transition-transform text-xs sm:text-lg relative z-10 shrink-0" />
                  </Link>
                )}
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="flex-1 min-w-0"
              >
                <Link href="/events" className="btn-outline w-full px-2.5 sm:px-10 py-2.5 sm:py-4 border-arc-cyan text-white hover:bg-arc-cyan/20 font-space flex items-center justify-center gap-1.5 sm:gap-2 shadow-[0_0_20px_rgba(0,212,255,0.25)] hover:shadow-[0_0_35px_rgba(0,212,255,0.6)] transition-shadow duration-300">
                  <RiShieldFlashLine className="text-xs sm:text-base shrink-0" />
                  <span className="font-bold tracking-[0.08em] sm:tracking-[0.16em] uppercase text-[10.5px] sm:text-sm truncate">Explore Events</span>
                </Link>
              </motion.div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

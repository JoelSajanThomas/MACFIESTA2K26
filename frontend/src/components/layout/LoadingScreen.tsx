"use client";

import { useEffect, useState, useRef } from "react";
import { useLoading } from "@/providers/LoadingProvider";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
interface BurstParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  decay: number;
  color: string;
  trail: { x: number; y: number }[];
}

// ─── Gold palette ─────────────────────────────────────────────────────────────
const GOLD = ["#D4AF37", "#F5D76E", "#FFE680", "#C8960C", "#FFC200", "#FFFFFF"];

function spawnBurst(cx: number, cy: number, count: number): BurstParticle[] {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4.5 + 1.2;
    return {
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: Math.random() * 2.5 + 0.8,
      alpha: 1,
      decay: Math.random() * 0.012 + 0.006,
      color: GOLD[Math.floor(Math.random() * GOLD.length)],
      trail: [],
    };
  });
}

// ─── LoadingScreen ────────────────────────────────────────────────────────────
export function LoadingScreen() {
  const [isMounted, setIsMounted]   = useState(false);
  const [phase, setPhase]           = useState<"intro" | "reveal" | "done">("intro");
  const [progress, setProgress]     = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const { markDone } = useLoading();

  const canvasRef     = useRef<HTMLCanvasElement | null>(null);
  const burstRef      = useRef<BurstParticle[]>([]);
  const burstFiredRef = useRef(false);

  // ── Mount ────────────────────────────────────────────────────────────────
  useEffect(() => setIsMounted(true), []);

  // ── Canvas: ambient dust + burst particles ───────────────────────────────
  useEffect(() => {
    if (!isMounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId: number;
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Ambient floating dust
    type Dust = { x: number; y: number; vx: number; vy: number; r: number; a: number; c: string };
    const dust: Dust[] = Array.from({ length: 70 }, () => ({
      x:  Math.random() * window.innerWidth,
      y:  Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -(Math.random() * 0.45 + 0.1),
      r:  Math.random() * 1.4 + 0.3,
      a:  Math.random() * 0.45 + 0.08,
      c:  GOLD[Math.floor(Math.random() * GOLD.length)],
    }));

    const render = () => {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // dust
      ctx.shadowBlur = 8;
      dust.forEach((d) => {
        d.x += d.vx; d.y += d.vy;
        if (d.y < -4) { d.y = h + 4; d.x = Math.random() * w; }
        if (d.x < -4) d.x = w + 4;
        if (d.x > w + 4) d.x = -4;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = d.c;
        ctx.globalAlpha = d.a;
        ctx.shadowColor = d.c;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // burst
      burstRef.current = burstRef.current.filter((p) => p.alpha > 0.01);
      burstRef.current.forEach((p) => {
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 8) p.trail.shift();
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.97; p.vy *= 0.97;
        p.alpha -= p.decay;

        p.trail.forEach((t, i) => {
          ctx.beginPath();
          ctx.arc(t.x, t.y, p.radius * 0.55, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = (i / p.trail.length) * p.alpha * 0.38;
          ctx.fill();
        });
        ctx.globalAlpha = 1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 16;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      });

      rafId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafId);
    };
  }, [isMounted]);

  // ── Sequence: intro → reveal (stays until user clicks) ─────────────────
  useEffect(() => {
    if (!isMounted) return;

    // Brief pause then show logo
    const t1 = setTimeout(() => setPhase("reveal"), 300);

    // Progress bar fills to 99% and holds — never auto-dismisses
    const pInt = setInterval(() => {
      setProgress((p) => {
        if (p >= 99) { clearInterval(pInt); return 99; }
        return Math.min(99, p + Math.floor(Math.random() * 10) + 6);
      });
    }, 80);

    return () => { clearTimeout(t1); clearInterval(pInt); };
  }, [isMounted]);

  // ── Fire burst when logo reveals ─────────────────────────────────────────
  useEffect(() => {
    if (phase !== "reveal" || burstFiredRef.current) return;
    burstFiredRef.current = true;

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    const t1 = setTimeout(() => {
      burstRef.current.push(...spawnBurst(cx, cy, 200));
    }, 380);
    const t2 = setTimeout(() => {
      burstRef.current.push(...spawnBurst(cx, cy, 90));
    }, 950);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [phase]);

  if (!isMounted) return null;

  const isVisible = phase !== "done" && !isDismissed;

  // ── Animation variants ───────────────────────────────────────────────────
  const logoVariants: Record<string, any> = {
    hidden: { opacity: 0, scale: 0.7, y: 24 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.95, ease: [0.16, 1, 0.3, 1] },
    },
  };
  const wordmarkVariants: Record<string, any> = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, delay: 0.38, ease: "easeOut" },
    },
  };
  const lineVariants: Record<string, any> = {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transition: { duration: 0.65, delay: 0.65 },
    },
  };
  const barVariants: Record<string, any> = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: 0.75 },
    },
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="macfiesta-loader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.06,
            filter: "blur(20px)",
            transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
          }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#070608] text-white select-none overflow-hidden"
        >
          {/* Canvas */}
          <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

          {/* Subtle radial gold glow behind logo */}
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              background:
                "radial-gradient(ellipse 55% 50% at 50% 50%, rgba(212,175,55,0.09) 0%, transparent 70%)",
            }}
          />

          {/* ── Main content ───────────────────────────────────────────── */}
          <div className="relative z-10 flex flex-col items-center gap-8 sm:gap-10 px-6">

            {/* Logo */}
            <motion.div
              variants={logoVariants}
              initial="hidden"
              animate={phase === "intro" ? "hidden" : "visible"}
              className="flex flex-col items-center gap-5"
            >
              <div className="relative flex items-center justify-center">
                {/* Pulsing ambient ring */}
                <motion.div
                  animate={{ opacity: [0.25, 0.65, 0.25], scale: [0.94, 1.06, 0.94] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full"
                  style={{
                    background: "radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 70%)",
                  }}
                />

                {/* Logo image */}
                <motion.img
                  src="/logo.png"
                  alt="MACFIESTA"
                  animate={{
                    filter: [
                      "drop-shadow(0 0 18px rgba(212,175,55,0.55))",
                      "drop-shadow(0 0 52px rgba(212,175,55,0.9))",
                      "drop-shadow(0 0 22px rgba(212,175,55,0.6))",
                    ],
                  }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="w-52 sm:w-72 md:w-80 relative z-10 object-contain"
                />
              </div>

              {/* Wordmark */}
              <motion.div
                variants={wordmarkVariants}
                initial="hidden"
                animate={phase === "intro" ? "hidden" : "visible"}
                className="flex flex-col items-center gap-2"
              >
                <span
                  className="text-2xl sm:text-4xl font-black tracking-[0.2em] uppercase font-excon-black"
                  style={{
                    background:
                      "linear-gradient(135deg, #F5D76E 0%, #D4AF37 45%, #FFE680 70%, #C8960C 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    filter: "drop-shadow(0 0 16px rgba(212,175,55,0.6))",
                  }}
                >
                  MACFIESTA 2K26
                </span>

                {/* Gold separator */}
                <motion.div
                  variants={lineVariants}
                  initial="hidden"
                  animate={phase === "intro" ? "hidden" : "visible"}
                  className="h-px w-48 sm:w-64"
                  style={{
                    background: "linear-gradient(90deg, transparent, #D4AF37, transparent)",
                    originX: 0.5,
                  }}
                />

                <span
                  className="text-[10px] sm:text-xs tracking-[0.42em] uppercase text-white/60 font-excon-bold"
                >
                  UNITED TO EXCEL
                </span>
              </motion.div>
            </motion.div>

            {/* Progress + skip */}
            <motion.div
              variants={barVariants}
              initial="hidden"
              animate={phase === "intro" ? "hidden" : "visible"}
              className="w-64 sm:w-80 flex flex-col items-center gap-3"
            >
              {/* Track */}
              <div className="w-full h-[3px] rounded-full bg-white/10 overflow-hidden relative">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, #C8960C, #D4AF37, #FFE680, #D4AF37)",
                    boxShadow: "0 0 12px rgba(212,175,55,0.7)",
                  }}
                  transition={{ ease: "easeOut" }}
                />
                {/* Shimmer sweep */}
                <motion.div
                  animate={{ x: ["-100%", "220%"] }}
                  transition={{ repeat: Infinity, duration: 1.7, ease: "linear" }}
                  className="absolute inset-y-0 w-1/3 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
                  }}
                />
              </div>

              {/* Enter button — only way to proceed */}
              <button
                onClick={() => {
                  setProgress(100);
                  setTimeout(() => { setIsDismissed(true); markDone(); }, 200);
                }}
                className="text-[11px] tracking-[0.3em] uppercase text-white/50 hover:text-[#D4AF37] border border-white/15 hover:border-[#D4AF37]/60 px-5 py-2 rounded-full transition-all duration-300 cursor-pointer mt-1 hover:shadow-[0_0_18px_rgba(212,175,55,0.35)]"
                style={{ fontFamily: "var(--font-orbitron, 'Orbitron', sans-serif)" }}
              >
                ENTER SITE →
              </button>
            </motion.div>
          </div>

          {/* ── Corner bracket decorations ──────────────────────────────── */}
          <div className="absolute top-5 left-5 opacity-30 pointer-events-none">
            <div className="w-9 h-px bg-gradient-to-r from-[#D4AF37] to-transparent" />
            <div className="w-px h-9 bg-gradient-to-b from-[#D4AF37] to-transparent" />
          </div>
          <div className="absolute top-5 right-5 opacity-30 pointer-events-none flex flex-col items-end">
            <div className="w-9 h-px bg-gradient-to-l from-[#D4AF37] to-transparent" />
            <div className="w-px h-9 bg-gradient-to-b from-[#D4AF37] to-transparent self-end" />
          </div>
          <div className="absolute bottom-5 left-5 opacity-30 pointer-events-none flex flex-col-reverse">
            <div className="w-9 h-px bg-gradient-to-r from-[#D4AF37] to-transparent" />
            <div className="w-px h-9 bg-gradient-to-t from-[#D4AF37] to-transparent" />
          </div>
          <div className="absolute bottom-5 right-5 opacity-30 pointer-events-none flex flex-col-reverse items-end">
            <div className="w-9 h-px bg-gradient-to-l from-[#D4AF37] to-transparent" />
            <div className="w-px h-9 bg-gradient-to-t from-[#D4AF37] to-transparent self-end" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

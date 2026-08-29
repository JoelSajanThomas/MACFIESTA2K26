"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiMovie2Line, RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import {
  TOTAL_FRAMES,
  startBackgroundPreload,
  getNearestLoadedFrame,
  subscribeToPreload,
} from "../../utils/framePreloader";

interface Marvel3DScrollCanvasProps {
  initialSequence?: "frames" | "frames2";
  showHud?: boolean;
}

export function Marvel3DScrollCanvas({
  initialSequence = "frames",
  showHud = false,
}: Marvel3DScrollCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [sequence, setSequence] = useState<"frames" | "frames2">(initialSequence);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(1);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hudVisible, setHudVisible] = useState(true);

  // Mouse tilt state
  const mouseTiltRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentFrameRef = useRef(1);
  const targetFrameRef = useRef(1);
  const rafRef = useRef<number | null>(null);
  const isReadyRef = useRef(false);

  // Draw frame to canvas with object-fit: cover and high clarity
  const drawFrame = useCallback(
    (frameIdx: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;

      const imgToDraw = getNearestLoadedFrame(sequence, frameIdx, TOTAL_FRAMES);
      if (!imgToDraw || !imgToDraw.complete || imgToDraw.naturalWidth === 0) return;

      const width = canvas.width;
      const height = canvas.height;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Calculate aspect ratio cover
      const imgWidth = imgToDraw.naturalWidth;
      const imgHeight = imgToDraw.naturalHeight;
      const imgAspect = imgWidth / imgHeight;
      const canvasAspect = width / height;

      let renderWidth = width;
      let renderHeight = height;
      let offsetX = 0;
      let offsetY = 0;

      if (canvasAspect > imgAspect) {
        // Canvas is wider than image
        renderHeight = width / imgAspect;
        offsetY = (height - renderHeight) / 2;
      } else {
        // Canvas is taller than image
        renderWidth = height * imgAspect;
        offsetX = (width - renderWidth) / 2;
      }

      ctx.drawImage(imgToDraw, offsetX, offsetY, renderWidth, renderHeight);
      isReadyRef.current = true;
    },
    [sequence]
  );

  // Initialize and ensure background preload is active
  useEffect(() => {
    startBackgroundPreload(sequence);

    // Initial instant draw
    drawFrame(1);

    // Subscribe to incoming loaded frames to update frame 1 or current frame instantly
    const unsubscribe = subscribeToPreload(() => {
      const target = Math.round(targetFrameRef.current);
      drawFrame(target);
    });

    return () => {
      unsubscribe();
    };
  }, [sequence, drawFrame]);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = window.innerWidth;
      const h = window.innerHeight;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      drawFrame(Math.round(currentFrameRef.current));
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [drawFrame]);

  // Mouse move tilt handler
  useEffect(() => {
    let ticking = false;
    const handleMouseMove = (e: MouseEvent) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const nx = (e.clientX / window.innerWidth - 0.5) * 2;
          const ny = (e.clientY / window.innerHeight - 0.5) * 2;
          mouseTiltRef.current.targetX = nx * 2.5;
          mouseTiltRef.current.targetY = ny * -2.5;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const showHudRef = useRef(showHud);
  useEffect(() => {
    showHudRef.current = showHud;
  }, [showHud]);

  const drawFrameRef = useRef(drawFrame);
  useEffect(() => {
    drawFrameRef.current = drawFrame;
  }, [drawFrame]);

  // Scroll tracking & continuous smooth animation loop
  useEffect(() => {
    let isRunning = true;

    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(1, Math.max(0, scrollY / docHeight)) : 0;

      if (showHudRef.current) {
        setScrollProgress(progress);
      }

      // Map progress [0, 1] across all frames
      const targetIdx = Math.max(1, Math.min(TOTAL_FRAMES, Math.floor(progress * (TOTAL_FRAMES - 1)) + 1));
      targetFrameRef.current = targetIdx;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    // Smooth RAF render loop
    const renderLoop = () => {
      if (!isRunning) return;

      const diff = targetFrameRef.current - currentFrameRef.current;
      if (Math.abs(diff) > 0.005) {
        currentFrameRef.current += diff * 0.32;
        const frameToDraw = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(currentFrameRef.current)));
        if (showHudRef.current) {
          setCurrentFrameIndex(frameToDraw);
        }
        drawFrameRef.current(frameToDraw);
      }

      // Smooth mouse tilt
      const tilt = mouseTiltRef.current;
      const diffTiltX = tilt.targetX - tilt.x;
      const diffTiltY = tilt.targetY - tilt.y;
      if (Math.abs(diffTiltX) > 0.005 || Math.abs(diffTiltY) > 0.005) {
        tilt.x += diffTiltX * 0.08;
        tilt.y += diffTiltY * 0.08;
        if (containerRef.current) {
          containerRef.current.style.transform = `perspective(1200px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale(1.01)`;
        }
      }

      rafRef.current = requestAnimationFrame(renderLoop);
    };

    rafRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const toggleSequence = () => {
    setSequence((prev) => (prev === "frames" ? "frames2" : "frames"));
  };

  return (
    <>
      {/* ─── 3D Fixed Viewport Canvas Container ─── */}
      <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none bg-[#05050A]">
        {/* Animated Perspective Wrapper */}
        <div ref={containerRef} className="relative w-full h-full will-change-transform">
          <canvas
            ref={canvasRef}
            className="w-full h-full block object-cover filter brightness-105 contrast-110 saturate-110"
          />

          {/* Clean Subtle Lighting Vignette — Subject in Center is 100% Bright and Clear */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(5,5,10,0.6)_100%)] pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-[#05050A]/70 via-[#05050A]/20 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#05050A]/70 via-[#05050A]/20 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* ─── Stark S.H.I.E.L.D. Holographic Frame HUD ─── */}
      {showHud && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 pointer-events-auto">
          <AnimatePresence>
            {hudVisible && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="stark-panel px-4 py-2.5 rounded-xl border border-arc-cyan/30 bg-[#05050A]/85 backdrop-blur-xl shadow-[0_0_25px_rgba(0,212,255,0.2)] flex items-center gap-3 font-space text-xs text-white"
              >
                {/* Rotating Arc Reactor Icon */}
                <div className="w-2.5 h-2.5 rounded-full bg-arc-cyan animate-pulse shadow-[0_0_8px_#00D4FF]" />

                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-orbitron font-bold text-arc-cyan tracking-wider text-[10px]">
                      3D TIMELINE
                    </span>
                    <span className="text-[10px] text-white/50">
                      FRAME {String(currentFrameIndex).padStart(3, "0")} / {TOTAL_FRAMES}
                    </span>
                  </div>
                  <div className="w-28 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-arc-cyan to-marvel-red transition-all duration-75"
                      style={{ width: `${Math.round(scrollProgress * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Sequence Switch Button */}
                <button
                  onClick={toggleSequence}
                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-arc-cyan/20 border border-white/10 hover:border-arc-cyan/50 text-[10px] font-bold text-white transition-all flex items-center gap-1 cursor-pointer"
                  title="Switch Marvel 3D Sequence"
                >
                  <RiMovie2Line className="text-arc-cyan" />
                  <span>SEQ {sequence === "frames" ? "1" : "2"}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle HUD visibility button */}
          <button
            onClick={() => setHudVisible((v) => !v)}
            className="p-2 rounded-full bg-[#05050A]/70 hover:bg-[#05050A] border border-white/10 hover:border-arc-cyan/40 text-white/60 hover:text-arc-cyan transition-all text-xs shadow-lg backdrop-blur-md cursor-pointer"
            aria-label="Toggle 3D HUD"
          >
            {hudVisible ? <RiEyeOffLine /> : <RiEyeLine />}
          </button>
        </div>
      )}
    </>
  );
}

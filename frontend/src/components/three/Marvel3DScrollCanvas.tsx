"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiMovie2Line, RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import {
  TOTAL_FRAMES,
  startBackgroundPreload,
  getNearestLoadedFrame,
  getLoadedFrame,
  subscribeToPreload,
  loadSingleFrame,
  prioritizeFramesAround,
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

  const updateCanvasDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Ultra-sharp 4K / Retina buffer sizing
    const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 2), 3);
    const rect = canvas.getBoundingClientRect();
    const w = rect.width > 0 ? rect.width : window.innerWidth * 1.15;
    const h = rect.height > 0 ? rect.height : window.innerHeight * 1.15;
    const targetW = Math.round(w * dpr);
    const targetH = Math.round(h * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }
  }, []);

  // Helper to draw an image onto the canvas with true edge-to-edge object-fit: cover and high-fidelity smoothing
  const renderCover = useCallback(
    (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, img: HTMLImageElement) => {
      const cw = canvas.width;
      const ch = canvas.height;
      if (!cw || !ch) return;

      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;
      if (!iw || !ih) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      const imgAspect = iw / ih;
      const canvasAspect = cw / ch;

      let drawW = cw;
      let drawH = ch;
      let drawX = 0;
      let drawY = 0;

      if (canvasAspect > imgAspect) {
        // Canvas is wider than image aspect ratio -> fit width, crop height top/bottom evenly
        drawW = cw;
        drawH = cw / imgAspect;
        drawY = (ch - drawH) / 2;
        drawX = 0;
      } else {
        // Canvas is taller than image aspect ratio -> fit height, crop width left/right evenly
        drawH = ch;
        drawW = ch * imgAspect;
        drawX = (cw - drawW) / 2;
        drawY = 0;
      }

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    },
    []
  );

  // Draw frame to canvas with discrete nearest-frame rendering (eliminates ghosting/motion blur)
  const drawFrame = useCallback(
    (frameFloat: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (canvas.width === 0 || canvas.height === 0) {
        updateCanvasDimensions();
      }

      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;

      const safeFrame = Math.max(1, Math.min(TOTAL_FRAMES, frameFloat));
      const targetIdx = Math.round(safeFrame);

      // Proactively ensure frames around current position are loading with top priority
      prioritizeFramesAround(sequence, targetIdx, 10);

      const targetImg = getNearestLoadedFrame(sequence, targetIdx, TOTAL_FRAMES);
      if (!targetImg || !targetImg.complete || targetImg.naturalWidth === 0) {
        // If exact/nearest frame is still loading, request it immediately
        loadSingleFrame(sequence, targetIdx, true).then((img) => {
          if (img && img.complete && img.naturalWidth > 0 && canvasRef.current) {
            const currentCtx = canvasRef.current.getContext("2d", { alpha: false });
            if (currentCtx) {
              renderCover(currentCtx, canvasRef.current, img);
              isReadyRef.current = true;
            }
          }
        });
        return;
      }

      // Draw exact frame at 100% crisp sharpness without double-vision blend
      renderCover(ctx, canvas, targetImg);
      isReadyRef.current = true;
    },
    [sequence, updateCanvasDimensions, renderCover]
  );

  // Initialize and ensure background preload is active
  useEffect(() => {
    updateCanvasDimensions();
    startBackgroundPreload(sequence);

    // Initial draw
    drawFrame(1);

    // Subscribe to incoming loaded frames to repaint when frame 1 or target loads
    const unsubscribe = subscribeToPreload(() => {
      const target = Math.round(targetFrameRef.current) || 1;
      drawFrame(target);
    });

    return () => {
      unsubscribe();
    };
  }, [sequence, drawFrame, updateCanvasDimensions]);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      updateCanvasDimensions();
      drawFrame(Math.round(currentFrameRef.current) || 1);
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [drawFrame, updateCanvasDimensions]);

  // Mouse move tilt handler
  useEffect(() => {
    let ticking = false;
    const handleMouseMove = (e: MouseEvent) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const nx = (e.clientX / window.innerWidth - 0.5) * 2;
          const ny = (e.clientY / window.innerHeight - 0.5) * 2;
          mouseTiltRef.current.targetX = nx * 1.5;
          mouseTiltRef.current.targetY = ny * -1.5;
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

      // Map progress [0, 1] continuously across all frames as a float
      const targetIdx = Math.max(1, Math.min(TOTAL_FRAMES, 1 + progress * (TOTAL_FRAMES - 1)));
      targetFrameRef.current = targetIdx;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    // Smooth RAF render loop with low-pass damping filter
    const renderLoop = () => {
      if (!isRunning) return;

      const diff = targetFrameRef.current - currentFrameRef.current;
      if (Math.abs(diff) > 0.001) {
        // High-precision damping filter for silky-smooth responsive 60fps scrolling
        currentFrameRef.current += diff * 0.16;
        const frameToDraw = Math.max(1, Math.min(TOTAL_FRAMES, currentFrameRef.current));
        if (showHudRef.current) {
          setCurrentFrameIndex(Math.round(frameToDraw));
        }
        drawFrameRef.current(frameToDraw);
      }

      // Smooth mouse tilt with overscan safety
      const tilt = mouseTiltRef.current;
      const diffTiltX = tilt.targetX - tilt.x;
      const diffTiltY = tilt.targetY - tilt.y;
      if (Math.abs(diffTiltX) > 0.005 || Math.abs(diffTiltY) > 0.005) {
        tilt.x += diffTiltX * 0.08;
        tilt.y += diffTiltY * 0.08;
        if (containerRef.current) {
          containerRef.current.style.transform = `perspective(1200px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale(1.06)`;
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
    // Single 156-frame Marvel Multiverse sequence active
  };

  return (
    <>
      {/* ─── 3D Fixed Viewport Canvas Container ─── */}
      <div className="fixed inset-0 w-screen h-screen z-0 overflow-hidden pointer-events-none bg-[#05050A]">
        {/* Animated Perspective Wrapper with 108% overscan buffer to guarantee no exposed edges on tilt */}
        <div
          ref={containerRef}
          className="absolute -top-[4%] -bottom-[4%] -left-[4%] -right-[4%] w-[108%] h-[108%] will-change-transform origin-center"
          style={{ transform: "perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1.06)" }}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full block object-cover"
            style={{
              imageRendering: "-webkit-optimize-contrast",
            }}
          />
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

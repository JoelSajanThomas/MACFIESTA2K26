import { useEffect, useRef, useState, useCallback } from "react";

const TOTAL_FRAMES = 156;

export default function Marvel3DScrollCanvas({ initialSequence = "frames", showHud = false }) {
  const canvasRef = useRef(null);
  const [sequence] = useState(initialSequence);
  const [isReady, setIsReady] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const imagesRef = useRef([]);
  const frameRef = useRef(1);
  const targetRef = useRef(1);
  const rafRef = useRef(0);

  const getFramePath = useCallback((seq, index) => {
    const padded = String(index).padStart(3, "0");
    return `/MARVEL/${seq}/ezgif-frame-${padded}.jpg`;
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const images = new Array(TOTAL_FRAMES + 1);
    imagesRef.current = images;
    let cancelled = false;
    let loaded = 0;
    const idleIds = [];
    const timeoutIds = [];

    const mark = () => {
      loaded += 1;
      if (!cancelled && loaded >= 8) setIsReady(true);
    };

    const loadOne = (idx) => {
      if (cancelled) return;
      const img = new Image();
      img.decoding = "async";
      img.onload = mark;
      img.onerror = mark;
      img.src = getFramePath(sequence, idx);
      images[idx] = img;
    };

    if (reduced) {
      loadOne(1);
      setIsReady(true);
      return () => {
        cancelled = true;
      };
    }

    const order = [];
    for (let i = 1; i <= TOTAL_FRAMES; i += 6) order.push(i);
    for (let i = 1; i <= TOTAL_FRAMES; i += 1) {
      if (!order.includes(i)) order.push(i);
    }

    order.forEach((idx, i) => {
      if (i < 30) {
        loadOne(idx);
        return;
      }
      if (typeof requestIdleCallback === "function") {
        idleIds.push(requestIdleCallback(() => loadOne(idx), { timeout: 1200 }));
      } else {
        timeoutIds.push(setTimeout(() => loadOne(idx), 15 + i * 3));
      }
    });

    return () => {
      cancelled = true;
      idleIds.forEach((id) => cancelIdleCallback(id));
      timeoutIds.forEach((id) => clearTimeout(id));
    };
  }, [sequence, getFramePath]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return undefined;

    const nearest = (idx) => {
      const imgs = imagesRef.current;
      let img = imgs[idx];
      if (img && img.complete && img.naturalWidth) return img;
      for (let o = 1; o < TOTAL_FRAMES; o += 1) {
        const a = imgs[idx - o];
        if (a && a.complete && a.naturalWidth) return a;
        const b = imgs[idx + o];
        if (b && b.complete && b.naturalWidth) return b;
      }
      return null;
    };

    const draw = (idx) => {
      const img = nearest(idx);
      if (!img) return;
      const { width, height } = canvas;
      const ia = img.naturalWidth / img.naturalHeight;
      const ca = width / height;
      let dw, dh, dx, dy;
      if (ia > ca) {
        dh = height;
        dw = height * ia;
        dx = (width - dw) / 2;
        dy = 0;
      } else {
        dw = width;
        dh = width / ia;
        dx = 0;
        dy = (height - dh) / 2;
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.fillStyle = "#05050a";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, dx, dy, dw, dh);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      draw(Math.round(frameRef.current));
    };

    const onScroll = () => {
      if (reduced) return;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, window.scrollY / max));
      setScrollProgress(p);
      targetRef.current = 1 + p * (TOTAL_FRAMES - 1);
    };

    const tick = () => {
      const cur = frameRef.current;
      const tgt = targetRef.current;
      const delta = tgt - cur;
      if (Math.abs(delta) > 0.08) {
        frameRef.current = cur + delta * 0.18;
        draw(Math.round(frameRef.current));
      } else if (cur !== tgt) {
        frameRef.current = tgt;
        draw(Math.round(tgt));
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    resize();
    onScroll();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    if (!reduced) rafRef.current = requestAnimationFrame(tick);
    else draw(1);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isReady]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
        background: "#05050a",
      }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          objectFit: "cover",
          filter: "brightness(0.95) contrast(1.05) saturate(1.1)",
        }}
      />
      {/* Cinematic Vignette & Atmospheric Gradients */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(5, 5, 10, 0.75) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(5,5,10,0.5) 0%, rgba(5,5,10,0.15) 30%, rgba(5,5,10,0.7) 85%, #05050a 100%)",
        }}
      />
      {showHud && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            padding: "4px 10px",
            background: "rgba(0,0,0,0.7)",
            border: "1px solid rgba(0,212,255,0.4)",
            borderRadius: "4px",
            fontSize: "10px",
            color: "#00D4FF",
            fontFamily: "monospace",
          }}
        >
          FRAME: {Math.round(1 + scrollProgress * (TOTAL_FRAMES - 1))} / {TOTAL_FRAMES} | SCROLL: {Math.round(scrollProgress * 100)}%
        </div>
      )}
    </div>
  );
}
export { Marvel3DScrollCanvas };

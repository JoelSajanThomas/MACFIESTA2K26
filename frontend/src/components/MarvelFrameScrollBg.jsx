import { useEffect, useRef, useState } from "react";

const TOTAL_FRAMES = 61;

function framePath(index) {
  return `/MARVEL/frames1/frame-${String(index).padStart(3, "0")}.jpg`;
}

/**
 * MACFIESTA1-style scroll-scrubbed Marvel frame backdrop (home only).
 * Loads frames progressively; falls back to nearest loaded frame.
 */
export default function MarvelFrameScrollBg() {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const frameRef = useRef(1);
  const targetRef = useRef(1);
  const rafRef = useRef(0);
  const [ready, setReady] = useState(false);

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
      if (!cancelled && loaded >= 8) setReady(true);
    };

    const loadOne = (idx) => {
      if (cancelled) return;
      const img = new Image();
      img.decoding = "async";
      img.onload = mark;
      img.onerror = mark;
      img.src = framePath(idx);
      images[idx] = img;
    };

    if (reduced) {
      loadOne(1);
      setReady(true);
      return () => {
        cancelled = true;
      };
    }

    const order = [];
    for (let i = 1; i <= TOTAL_FRAMES; i += 8) order.push(i);
    for (let i = 1; i <= TOTAL_FRAMES; i += 1) {
      if (!order.includes(i)) order.push(i);
    }

    order.forEach((idx, i) => {
      if (i < 24) {
        loadOne(idx);
        return;
      }
      if (typeof requestIdleCallback === "function") {
        idleIds.push(requestIdleCallback(() => loadOne(idx), { timeout: 1200 }));
      } else {
        timeoutIds.push(setTimeout(() => loadOne(idx), 20 + i * 4));
      }
    });

    return () => {
      cancelled = true;
      idleIds.forEach((id) => cancelIdleCallback(id));
      timeoutIds.forEach((id) => clearTimeout(id));
    };
  }, []);

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
      let dw;
      let dh;
      let dx;
      let dy;
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
      draw(frameRef.current);
    };

    const onScroll = () => {
      if (reduced) return;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, window.scrollY / max));
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
  }, [ready]);

  return (
    <div className={`mf1-frame-bg${ready ? " is-ready" : ""}`} aria-hidden="true">
      <canvas ref={canvasRef} className="mf1-frame-bg__canvas" />
      <div className="mf1-frame-bg__orbs" />
      <div className="mf1-frame-bg__veil" />
    </div>
  );
}

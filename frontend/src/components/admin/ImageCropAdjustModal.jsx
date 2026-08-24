import { useState, useRef, useEffect, useCallback } from "react";
import {
  RiCropLine,
  RiZoomInLine,
  RiRestartLine,
  RiCheckLine,
  RiCloseLine,
  RiSunLine,
  RiContrastLine,
} from "react-icons/ri";

const ASPECT_RATIOS = [
  { label: "Freeform", value: "free", ratio: null },
  { label: "1:1 Square (Logo / VIP)", value: "1:1", ratio: 1 },
  { label: "16:9 (Hero / Banner)", value: "16:9", ratio: 16 / 9 },
  { label: "4:3 (Cards / Gallery)", value: "4:3", ratio: 4 / 3 },
  { label: "3:4 (Portrait)", value: "3:4", ratio: 3 / 4 },
];

export default function ImageCropAdjustModal({
  isOpen,
  imageSrc,
  fileName = "image.png",
  onClose,
  onApply,
}) {
  const [aspect, setAspect] = useState("free");
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  // Load image
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      resetAdjustments();
    };
    img.src = imageSrc;
  }, [imageSrc]);

  function resetAdjustments() {
    setZoom(1);
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setPan({ x: 0, y: 0 });
    setAspect("free");
  }

  // Draw preview canvas
  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    const containerWidth = canvas.parentElement?.clientWidth || 500;
    const maxCanvasWidth = Math.min(containerWidth - 32, 600);
    const maxCanvasHeight = 360;

    let targetRatio = img.width / img.height;
    const selectedAspect = ASPECT_RATIOS.find((a) => a.value === aspect);
    if (selectedAspect && selectedAspect.ratio) {
      targetRatio = selectedAspect.ratio;
    }

    let drawW = maxCanvasWidth;
    let drawH = drawW / targetRatio;

    if (drawH > maxCanvasHeight) {
      drawH = maxCanvasHeight;
      drawW = drawH * targetRatio;
    }

    canvas.width = drawW;
    canvas.height = drawH;

    ctx.clearRect(0, 0, drawW, drawH);

    // Apply brightness and contrast filter
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

    ctx.save();
    // Center transformations
    ctx.translate(drawW / 2 + pan.x, drawH / 2 + pan.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Compute image placement to fill / fit inside canvas
    const imgAspect = img.width / img.height;
    let renderW;
    let renderH;

    if (imgAspect > targetRatio) {
      renderH = drawH;
      renderW = drawH * imgAspect;
    } else {
      renderW = drawW;
      renderH = drawW / imgAspect;
    }

    ctx.drawImage(img, -renderW / 2, -renderH / 2, renderW, renderH);
    ctx.restore();

    // Reset filter
    ctx.filter = "none";

    // Overlay crop guide grid
    ctx.strokeStyle = "rgba(212, 175, 55, 0.6)";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, drawW - 2, drawH - 2);

    // Rule of thirds lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(drawW / 3, 0);
    ctx.lineTo(drawW / 3, drawH);
    ctx.moveTo((drawW * 2) / 3, 0);
    ctx.lineTo((drawW * 2) / 3, drawH);
    ctx.moveTo(0, drawH / 3);
    ctx.lineTo(drawW, drawH / 3);
    ctx.moveTo(0, (drawH * 2) / 3);
    ctx.lineTo(drawW, (drawH * 2) / 3);
    ctx.stroke();
  }, [aspect, zoom, rotation, brightness, contrast, pan]);

  useEffect(() => {
    if (isOpen) {
      drawPreview();
    }
  }, [isOpen, drawPreview]);

  function handleMouseDown(e) {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }

  function handleMouseMove(e) {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  function handleWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.5), 3.5));
  }

  function handleApply() {
    const img = imgRef.current;
    if (!img) return;

    // Create high-res export canvas
    const exportCanvas = document.createElement("canvas");
    const selectedAspect = ASPECT_RATIOS.find((a) => a.value === aspect);
    const targetRatio = selectedAspect?.ratio || img.width / img.height;

    const exportWidth = Math.min(Math.max(img.width, 1000), 2400);
    const exportHeight = exportWidth / targetRatio;

    exportCanvas.width = exportWidth;
    exportCanvas.height = exportHeight;

    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;

    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    ctx.save();

    // Scale pan coordinates to export resolution
    const currentCanvas = canvasRef.current;
    const scaleFactor = currentCanvas ? exportWidth / currentCanvas.width : 1;

    ctx.translate(exportWidth / 2 + pan.x * scaleFactor, exportHeight / 2 + pan.y * scaleFactor);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    const imgAspect = img.width / img.height;
    let renderW;
    let renderH;

    if (imgAspect > targetRatio) {
      renderH = exportHeight;
      renderW = exportHeight * imgAspect;
    } else {
      renderW = exportWidth;
      renderH = exportWidth / imgAspect;
    }

    ctx.drawImage(img, -renderW / 2, -renderH / 2, renderW, renderH);
    ctx.restore();

    exportCanvas.toBlob(
      (blob) => {
        if (!blob) return;
        const cleanName = fileName.replace(/\.[^/.]+$/, "") + "-adjusted.png";
        const file = new File([blob], cleanName, { type: "image/png" });
        const previewUrl = URL.createObjectURL(file);
        onApply(file, previewUrl);
        onClose();
      },
      "image/png",
      0.92
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0b0c16] border border-metallic-gold/30 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <RiCropLine className="text-metallic-gold text-lg" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider font-excon-black">
              Crop &amp; Adjust Image
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <RiCloseLine className="text-xl" />
          </button>
        </div>

        {/* Canvas Workspace */}
        <div
          className="relative flex-1 bg-[#05060c] flex items-center justify-center p-4 overflow-hidden select-none cursor-move min-h-[300px]"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <canvas ref={canvasRef} className="rounded-xl shadow-2xl max-w-full" />
          <span className="absolute bottom-3 right-4 text-[10px] text-white/40 pointer-events-none uppercase tracking-widest font-mono">
            Drag to pan • Scroll to zoom
          </span>
        </div>

        {/* Adjustments & Controls Panel */}
        <div className="p-5 bg-[#0e101f] border-t border-white/10 space-y-4">
          {/* Aspect Ratio Presets */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider shrink-0 mr-1">
              Aspect:
            </span>
            {ASPECT_RATIOS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setAspect(item.value)}
                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
                  aspect === item.value
                    ? "bg-metallic-gold text-black shadow-md"
                    : "bg-white/5 hover:bg-white/10 text-white/70"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Sliders: Zoom, Brightness, Contrast */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold text-white/70">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <RiZoomInLine className="text-metallic-gold" /> Zoom ({Math.round(zoom * 100)}%)
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-metallic-gold cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <RiSunLine className="text-metallic-gold" /> Brightness ({brightness}%)
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                step="2"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-metallic-gold cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <RiContrastLine className="text-metallic-gold" /> Contrast ({contrast}%)
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                step="2"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full accent-metallic-gold cursor-pointer"
              />
            </div>
          </div>

          {/* Rotate & Reset Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRotation((prev) => (prev - 90) % 360)}
                className="px-2.5 py-1 text-[11px] font-bold uppercase rounded-lg bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
              >
                ↺ -90°
              </button>
              <button
                type="button"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="px-2.5 py-1 text-[11px] font-bold uppercase rounded-lg bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
              >
                ↻ +90°
              </button>
              <button
                type="button"
                onClick={resetAdjustments}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold uppercase rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                <RiRestartLine className="text-xs" /> Reset
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="inline-flex items-center gap-1.5 px-5 py-1.5 text-xs font-black uppercase tracking-wider rounded-xl bg-metallic-gold hover:bg-white text-black font-excon-bold shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all"
              >
                <RiCheckLine className="text-sm" /> Apply &amp; Save Crop
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { isLowEndDevice } from "./deviceCapabilities";

// Global High-Speed Frame Cache & Preload Manager
export const TOTAL_FRAMES = 156;

export function getFramePath(seq = "frames", index: number): string {
  const safeIndex = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(index) || 1));
  const padded = String(safeIndex).padStart(3, "0");
  return `/MARVEL/frames/ezgif-frame-${padded}.jpg`;
}

// In-memory global cache across component mounts/unmounts
const globalFrameCache: Record<string, (HTMLImageElement | null)[]> = {
  frames: new Array(TOTAL_FRAMES + 1).fill(null),
};

const preloadingPromises: Record<string, Promise<void> | null> = {
  frames: null,
};

const listeners: Set<() => void> = new Set();

function notifyListeners() {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch {
      // ignore
    }
  });
}

export function subscribeToPreload(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function getLoadedFrame(seq = "frames", index: number): HTMLImageElement | null {
  const cache = globalFrameCache[seq];
  if (!cache) return null;
  const img = cache[index];
  if (img && img.complete && img.naturalWidth > 0) {
    return img;
  }
  return null;
}

export function getNearestLoadedFrame(
  seq = "frames",
  targetIndex: number,
  totalFrames = TOTAL_FRAMES
): HTMLImageElement | null {
  const cache = globalFrameCache[seq];
  if (!cache) return null;

  const direct = cache[targetIndex];
  if (direct && direct.complete && direct.naturalWidth > 0) {
    return direct;
  }

  // Search outward for nearest loaded frame
  for (let offset = 1; offset < totalFrames; offset++) {
    const prev = cache[targetIndex - offset];
    if (prev && prev.complete && prev.naturalWidth > 0) return prev;
    const next = cache[targetIndex + offset];
    if (next && next.complete && next.naturalWidth > 0) return next;
  }

  return null;
}

export function loadSingleFrame(seq = "frames", idx: number, highPriority = false): Promise<HTMLImageElement> {
  if (!globalFrameCache[seq]) {
    globalFrameCache[seq] = new Array(TOTAL_FRAMES + 1).fill(null);
  }

  const existing = globalFrameCache[seq][idx];
  if (existing && existing.complete && existing.naturalWidth > 0) {
    return Promise.resolve(existing);
  }

  return new Promise((resolve) => {
    const img = new Image();
    if (highPriority && "fetchPriority" in img) {
      (img as any).fetchPriority = "high";
    }
    img.src = getFramePath(seq, idx);

    let finished = false;
    const onFinish = () => {
      if (finished) return;
      finished = true;
      globalFrameCache[seq][idx] = img;
      notifyListeners();
      resolve(img);
    };

    img.onload = onFinish;
    img.onerror = onFinish;

    if (typeof img.decode === "function") {
      img.decode().then(onFinish).catch(onFinish);
    }
  });
}

// Concurrency queue processor
async function processQueue(seq: string, queue: number[], concurrency: number) {
  let index = 0;
  const workers = new Array(concurrency).fill(null).map(async () => {
    while (index < queue.length) {
      const frameIdx = queue[index++];
      if (frameIdx !== undefined) {
        await loadSingleFrame(seq, frameIdx);
      }
    }
  });
  await Promise.all(workers);
}

/**
 * Start background preloading with adaptive device scaling.
 * On low-end/mobile devices: only Frame 1 is loaded (saves 11.7 MB bandwidth & avoids RAM exhaustion).
 * On high-end desktop: keyframes and priority batches are preloaded at gentle concurrency.
 */
export function startBackgroundPreload(seq = "frames"): Promise<void> {
  if (preloadingPromises[seq]) {
    return preloadingPromises[seq]!;
  }

  preloadingPromises[seq] = (async () => {
    // 1. Always load Frame 1 first (hero image)
    await loadSingleFrame(seq, 1, true);

    // If mobile, data-saver, or low-end device: STOP HERE!
    // Do not flood the device with 155 additional images.
    if (isLowEndDevice()) {
      return;
    }

    // 2. Desktop High-End: Priority Keyframes (stride 10 first to cover scroll range lightly)
    const keyframes: number[] = [];
    for (let i = 5; i <= TOTAL_FRAMES; i += 10) {
      keyframes.push(i);
    }
    if (keyframes[keyframes.length - 1] !== TOTAL_FRAMES) {
      keyframes.push(TOTAL_FRAMES);
    }
    await processQueue(seq, keyframes, 3);

    // 3. Hero intro frames (2 to 20) with gentle concurrency
    const heroFrames: number[] = [];
    for (let i = 2; i <= Math.min(20, TOTAL_FRAMES); i++) {
      heroFrames.push(i);
    }
    await processQueue(seq, heroFrames, 3);

    // 4. Fill remaining frames quietly in the background
    const remaining: number[] = [];
    const cache = globalFrameCache[seq];
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      if (!cache || !cache[i] || !cache[i]?.complete) {
        remaining.push(i);
      }
    }
    await processQueue(seq, remaining, 2);
  })();

  return preloadingPromises[seq]!;
}

// Automatically start preloading when this module is evaluated in the browser
if (typeof window !== "undefined") {
  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(() => {
      // Don't auto-load full frame sequence if low-end device
      if (!isLowEndDevice()) {
        startBackgroundPreload("frames");
      } else {
        loadSingleFrame("frames", 1, false);
      }
    });
  } else {
    setTimeout(() => {
      if (!isLowEndDevice()) {
        startBackgroundPreload("frames");
      } else {
        loadSingleFrame("frames", 1, false);
      }
    }, 500);
  }
}

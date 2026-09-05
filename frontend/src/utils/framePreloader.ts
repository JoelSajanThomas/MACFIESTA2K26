// Global High-Speed Frame Cache & Preload Manager
export const TOTAL_FRAMES = 110;

export function getFramePath(seq = "frames", index: number): string {
  const safeIndex = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(index) || 1));
  const padded = String(safeIndex).padStart(3, "0");
  return `/MARVEL/front_frames/frame_${padded}.png`;
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

/**
 * Dynamically prioritize frames around current scrub/scroll position
 */
export function prioritizeFramesAround(seq = "frames", centerIdx: number, radius = 12): void {
  const min = Math.max(1, centerIdx - radius);
  const max = Math.min(TOTAL_FRAMES, centerIdx + radius);
  for (let i = min; i <= max; i++) {
    const cached = globalFrameCache[seq]?.[i];
    if (!cached || !cached.complete) {
      loadSingleFrame(seq, i, true);
    }
  }
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
 * Start aggressive background preloading immediately.
 * Uses high concurrency (18 workers) so all 156 frames load rapidly into memory.
 */
export function startBackgroundPreload(seq = "frames"): Promise<void> {
  if (preloadingPromises[seq]) {
    return preloadingPromises[seq]!;
  }

  preloadingPromises[seq] = (async () => {
    // 1. Load Frame 1 with maximum priority
    await loadSingleFrame(seq, 1, true);

    // 2. Priority Batch: Hero frames (1 to 30)
    const heroFrames: number[] = [];
    for (let i = 2; i <= Math.min(30, TOTAL_FRAMES); i++) {
      heroFrames.push(i);
    }
    await processQueue(seq, heroFrames, 16);

    // 3. Keyframes stride 3 for seamless fast scrub preview
    const keyframes: number[] = [];
    for (let i = 31; i <= TOTAL_FRAMES; i += 3) {
      keyframes.push(i);
    }
    if (keyframes[keyframes.length - 1] !== TOTAL_FRAMES) {
      keyframes.push(TOTAL_FRAMES);
    }
    await processQueue(seq, keyframes, 16);

    // 4. Fill all remaining frames
    const remaining: number[] = [];
    const cache = globalFrameCache[seq];
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      if (!cache || !cache[i] || !cache[i]?.complete) {
        remaining.push(i);
      }
    }
    await processQueue(seq, remaining, 18);
  })();

  return preloadingPromises[seq]!;
}

// Automatically start preloading when this module is evaluated in the browser
if (typeof window !== "undefined") {
  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(() => startBackgroundPreload("frames"));
  } else {
    setTimeout(() => startBackgroundPreload("frames"), 50);
  }
}

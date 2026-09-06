// Global High-Speed Frame Cache & Preload Manager
export const TOTAL_FRAMES = 156;

export function getFramePath(seq = "frames1", index: number): string {
  const safeIndex = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(index) || 1));
  const padded = String(safeIndex).padStart(3, "0");
  return `/MARVEL/frames1/ezgif-frame-${padded}.jpg`;
}

// In-memory global cache across component mounts/unmounts
const globalFrameCache: Record<string, (HTMLImageElement | null)[]> = {
  frames1: new Array(TOTAL_FRAMES + 1).fill(null),
  frames: new Array(TOTAL_FRAMES + 1).fill(null),
};

const preloadingPromises: Record<string, Promise<void> | null> = {
  frames1: null,
  frames: null,
};

const listeners: Set<() => void> = new Set();
let listenerNotificationPending = false;

function notifyListeners() {
  if (listenerNotificationPending) return;
  listenerNotificationPending = true;

  const flush = () => {
    listenerNotificationPending = false;
    listeners.forEach((cb) => {
      try {
        cb();
      } catch {
        // ignore
      }
    });
  };

  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(flush);
  } else {
    setTimeout(flush, 0);
  }
}

export function subscribeToPreload(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function getLoadedFrame(seq = "frames1", index: number): HTMLImageElement | null {
  const cache = globalFrameCache[seq];
  if (!cache) return null;
  const img = cache[index];
  if (img && img.complete && img.naturalWidth > 0) {
    return img;
  }
  return null;
}

export function getNearestLoadedFrame(
  seq = "frames1",
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

export function loadSingleFrame(seq = "frames1", idx: number, highPriority = false): Promise<HTMLImageElement> {
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
export function prioritizeFramesAround(seq = "frames1", centerIdx: number, radius = 12): void {
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
 * Load only the initial viewport frames. Later frames are requested on demand
 * by prioritizeFramesAround as the user scrolls.
 */
export function startBackgroundPreload(seq = "frames1"): Promise<void> {
  if (preloadingPromises[seq]) {
    return preloadingPromises[seq]!;
  }

  preloadingPromises[seq] = (async () => {
    // Load only the first frame on the critical path. The canvas can render
    // immediately while the rest of the sequence waits for browser idle time.
    await loadSingleFrame(seq, 1, true);

    const heroFrames: number[] = [];
    for (let i = 2; i <= Math.min(30, TOTAL_FRAMES); i++) {
      heroFrames.push(i);
    }

    const remainingFrames: number[] = [];
    for (let i = 31; i <= TOTAL_FRAMES; i++) {
      remainingFrames.push(i);
    }

    const runDeferred = () => {
      processQueue(seq, heroFrames, 4).then(() => processQueue(seq, remainingFrames, 2));
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      (window as Window & typeof globalThis & { requestIdleCallback: (cb: () => void, options?: { timeout: number }) => number })
        .requestIdleCallback(runDeferred, { timeout: 2500 });
    } else {
      setTimeout(runDeferred, 1200);
    }
  })();

  return preloadingPromises[seq]!;
}


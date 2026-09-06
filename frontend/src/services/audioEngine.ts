/**
 * Studio-grade Dual-Slot Background Audio Engine for MacFiesta
 * Features:
 * - Equal-power sine/cosine crossfades between songs
 * - Smart highlight / drop trimming
 * - Background preloading
 * - Zero click/pop volume smoothing
 * - Scroll-aware volume fading
 * - Mobile autoplay unlocking
 */

import { DEFAULT_PLAYLIST, loadSongLibrary, SongTrack } from "./songLibrary";

export interface AudioEngineState {
  playlist: SongTrack[];
  currentIndex: number;
  currentTrack: SongTrack | null;
  isPlaying: boolean;
  isTransitioning: boolean;
  highlightMode: boolean;
  currentTime: number;
  duration: number;
  progress: number; // 0 to 1
  volume: number; // 0 to 1
  userMuted: boolean;
}

type StateListener = (state: AudioEngineState) => void;

class AudioEngine {
  private static instance: AudioEngine | null = null;

  private playlist: SongTrack[] = DEFAULT_PLAYLIST;
  private currentIndex: number = 0;
  private isPlaying: boolean = false;
  private isTransitioning: boolean = false;
  private highlightMode: boolean = true;
  private userMuted: boolean = false;

  private baseVolume: number = 0.4;

  // Dual slots for crossfading
  private slotA: HTMLAudioElement;
  private slotB: HTMLAudioElement;
  private activeSlotId: "A" | "B" = "A";

  private crossfadeDuration: number = 3.5; // seconds
  private crossfadeRaf: number | null = null;
  private progressInterval: number | null = null;

  private listeners: Set<StateListener> = new Set();
  private isUnlocked: boolean = false;
  private hasInitialized: boolean = false;
  private libraryLoadStarted: boolean = false;
  private playPromise: Promise<boolean> | null = null;

  private constructor() {
    this.slotA = new Audio();
    this.slotB = new Audio();
    this.setupAudioElement(this.slotA, "A");
    this.setupAudioElement(this.slotB, "B");

    if (typeof window !== "undefined") {
      this.init();
    }
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  private setupAudioElement(audio: HTMLAudioElement, id: "A" | "B") {
    audio.preload = "metadata";
    audio.volume = 0;

    audio.addEventListener("ended", () => {
      if (this.activeSlotId === id && !this.isTransitioning) {
        this.next(true);
      }
    });

    audio.addEventListener("error", (e) => {
      console.debug(`[AudioEngine] Slot ${id} error:`, e);
    });
  }

  private init() {
    if (this.hasInitialized) return;
    this.hasInitialized = true;

    // Mobile & autoplay user interaction unlockers
    const unlockAudio = () => {
      if (this.isUnlocked) return;

      // If we are on homepage and not explicitly muted, auto-start playback
      const isHome = window.location.pathname === "/" || window.location.pathname === "";
      if (isHome && !this.userMuted && !this.isPlaying) {
        this.play().then((started) => {
          if (started) this.isUnlocked = true;
        });
      } else {
        this.isUnlocked = true;
      }
    };

    window.addEventListener("click", unlockAudio, { passive: true });
    window.addEventListener("keydown", unlockAudio, { passive: true });
    window.addEventListener("pointerdown", unlockAudio, { passive: true });

    // Global stop event (e.g. navigation away from home)
    const handleGlobalStop = () => {
      this.pause(false);
    };
    window.addEventListener("macfiesta:stop-hero-audio", handleGlobalStop);

    // Track position & auto-crossfade monitor
    this.startProgressMonitor();
  }

  private getEffectiveVolume(): number {
    if (this.userMuted) return 0;
    return Math.max(0, Math.min(1, this.baseVolume));
  }

  private loadLibraryOnDemand() {
    if (this.libraryLoadStarted) return;
    this.libraryLoadStarted = true;

    loadSongLibrary().then((tracks) => {
      if (tracks && tracks.length > 0) {
        this.playlist = tracks;
        this.emitState();
        if (this.isPlaying) this.preloadNext();
      }
    });
  }

  private getActiveSlot(): HTMLAudioElement {
    return this.activeSlotId === "A" ? this.slotA : this.slotB;
  }

  private getStandbySlot(): HTMLAudioElement {
    return this.activeSlotId === "A" ? this.slotB : this.slotA;
  }

  private startProgressMonitor() {
    if (this.progressInterval) clearInterval(this.progressInterval);

    this.progressInterval = window.setInterval(() => {
      if (!this.isPlaying) return;

      const active = this.getActiveSlot();
      const currentTrack = this.playlist[this.currentIndex];
      if (!currentTrack || isNaN(active.currentTime)) return;

      const cur = active.currentTime;
      const highlight = currentTrack.highlight;

      // Check if we should trigger the highlight mix crossfade
      if (this.highlightMode && highlight && highlight.endTime > 0) {
        const targetEnd = highlight.endTime;
        if (cur >= targetEnd - this.crossfadeDuration && !this.isTransitioning) {
          this.next(true);
        }
      }

      this.emitState();
    }, 250);
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emitState() {
    const state = this.getState();
    this.listeners.forEach((l) => l(state));
  }

  public getState(): AudioEngineState {
    const active = this.getActiveSlot();
    const currentTrack = this.playlist[this.currentIndex] || null;
    const currentTime = active.currentTime || 0;
    let duration = active.duration;

    if (isNaN(duration) || duration <= 0) {
      duration = currentTrack?.duration || 180;
    }

    let progress = 0;
    if (this.highlightMode && currentTrack?.highlight) {
      const h = currentTrack.highlight;
      const span = Math.max(1, h.endTime - h.startTime);
      progress = Math.max(0, Math.min(1, (currentTime - h.startTime) / span));
    } else {
      progress = duration > 0 ? Math.max(0, Math.min(1, currentTime / duration)) : 0;
    }

    return {
      playlist: [...this.playlist],
      currentIndex: this.currentIndex,
      currentTrack,
      isPlaying: this.isPlaying,
      isTransitioning: this.isTransitioning,
      highlightMode: this.highlightMode,
      currentTime,
      duration,
      progress,
      volume: this.getEffectiveVolume(),
      userMuted: this.userMuted,
    };
  }

  /**
   * Starts or resumes playback
   */
  public async play(): Promise<boolean> {
    if (this.playPromise) return this.playPromise;

    this.playPromise = this.playInternal();
    try {
      return await this.playPromise;
    } finally {
      this.playPromise = null;
    }
  }

  private async playInternal(): Promise<boolean> {
    if (typeof window !== "undefined") {
      const isHome = window.location.pathname === "/" || window.location.pathname === "";
      if (!isHome) return false;
    }

    this.userMuted = false;
    this.loadLibraryOnDemand();
    const currentTrack = this.playlist[this.currentIndex];
    if (!currentTrack) return false;

    const active = this.getActiveSlot();

    // If source isn't set yet, configure initial track
    if (!active.src || !active.src.includes(encodeURIComponent(currentTrack.filename))) {
      active.src = currentTrack.url;
      const startAt = this.highlightMode && currentTrack.highlight ? currentTrack.highlight.startTime : 0;
      active.currentTime = startAt;
    }

    const targetVolume = this.getEffectiveVolume();
    active.volume = targetVolume;

    try {
      await active.play();
      this.isUnlocked = true;
      this.isPlaying = true;
      this.emitState();
      this.preloadNext();
      return true;
    } catch (err) {
      // Some mobile WebViews cannot decode the first legacy .m4a.mpeg file.
      // Retry once with the bundled MP3 instead of leaving the HUD inert.
      const mediaError = active.error;
      const unsupported = mediaError?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED;
      const fallbackIndex = this.playlist.findIndex((track) => track.url.endsWith(".mp3"));
      if (unsupported && fallbackIndex >= 0 && fallbackIndex !== this.currentIndex) {
        const fallbackTrack = this.playlist[fallbackIndex];
        this.currentIndex = fallbackIndex;
        active.src = fallbackTrack.url;
        active.currentTime = this.highlightMode && fallbackTrack.highlight
          ? fallbackTrack.highlight.startTime
          : 0;
        try {
          await active.play();
          this.isUnlocked = true;
          this.isPlaying = true;
          this.emitState();
          this.preloadNext();
          return true;
        } catch {
          // Fall through to the normal retry state below.
        }
      }
      console.debug("[AudioEngine] Playback requires another user gesture:", err);
      this.isPlaying = false;
      this.isUnlocked = false;
      this.emitState();
      return false;
    }
  }

  /**
   * Pauses current playback
   */
  public pause(byUser: boolean = true) {
    if (byUser) {
      this.userMuted = true;
    }

    if (this.crossfadeRaf) {
      cancelAnimationFrame(this.crossfadeRaf);
      this.crossfadeRaf = null;
    }

    this.slotA.pause();
    this.slotB.pause();
    this.isPlaying = false;
    this.isTransitioning = false;
    this.emitState();
  }

  public togglePlay() {
    if (this.playPromise) return;
    if (this.isPlaying) {
      this.pause(true);
    } else {
      void this.play();
    }
  }

  /**
   * Smoothly crossfades to a designated track index using equal-power curve
   */
  public async playTrack(index: number, seamless: boolean = true) {
    if (this.playlist.length === 0) return;
    const safeIndex = (index + this.playlist.length) % this.playlist.length;
    const nextTrack = this.playlist[safeIndex];
    if (!nextTrack) return;

    if (this.crossfadeRaf) {
      cancelAnimationFrame(this.crossfadeRaf);
      this.crossfadeRaf = null;
    }

    this.userMuted = false;
    const outgoing = this.getActiveSlot();
    const incoming = this.getStandbySlot();

    // Setup incoming track
    incoming.src = nextTrack.url;
    const startTime = this.highlightMode && nextTrack.highlight ? nextTrack.highlight.startTime : 0;
    incoming.currentTime = startTime;
    incoming.volume = 0;

    try {
      await incoming.play();
    } catch {
      // Browser prevented immediate play without gesture
      return;
    }

    this.currentIndex = safeIndex;
    this.isPlaying = true;

    if (!seamless || outgoing.paused || outgoing.volume <= 0.01) {
      // Direct jump without crossfade
      outgoing.pause();
      outgoing.currentTime = 0;
      outgoing.src = "";
      incoming.volume = this.getEffectiveVolume();
      this.activeSlotId = this.activeSlotId === "A" ? "B" : "A";
      this.isTransitioning = false;
      this.emitState();
      this.preloadNext();
      return;
    }

    // Equal-Power Crossfade execution
    this.isTransitioning = true;
    this.emitState();

    const durationMs = this.crossfadeDuration * 1000;
    const startTimestamp = performance.now();

    const crossfadeStep = (now: number) => {
      const elapsed = now - startTimestamp;
      const t = Math.max(0, Math.min(1, elapsed / durationMs));
      const maxVol = this.getEffectiveVolume();

      // Equal-power curves: cos & sin prevent dip in total volume
      const outVol = Math.cos(t * Math.PI * 0.5) * maxVol;
      const inVol = Math.sin(t * Math.PI * 0.5) * maxVol;

      outgoing.volume = Math.max(0, Math.min(1, outVol));
      incoming.volume = Math.max(0, Math.min(1, inVol));

      if (t < 1) {
        this.crossfadeRaf = requestAnimationFrame(crossfadeStep);
      } else {
        // Complete transition
        outgoing.pause();
        outgoing.currentTime = 0;
        outgoing.src = "";
        incoming.volume = maxVol;

        this.activeSlotId = this.activeSlotId === "A" ? "B" : "A";
        this.isTransitioning = false;
        this.crossfadeRaf = null;
        this.emitState();
        this.preloadNext();
      }
    };

    this.crossfadeRaf = requestAnimationFrame(crossfadeStep);
  }

  public next(seamless: boolean = true) {
    const nextIdx = (this.currentIndex + 1) % this.playlist.length;
    this.playTrack(nextIdx, seamless);
  }

  public prev(seamless: boolean = true) {
    const active = this.getActiveSlot();
    // If playing for more than 4 seconds, restart current track first
    if (active.currentTime > 4) {
      const startAt = this.highlightMode && this.playlist[this.currentIndex]?.highlight
        ? this.playlist[this.currentIndex].highlight.startTime
        : 0;
      active.currentTime = startAt;
      return;
    }
    const prevIdx = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    this.playTrack(prevIdx, seamless);
  }

  public setHighlightMode(enabled: boolean) {
    this.highlightMode = enabled;
    this.emitState();
  }

  public toggleHighlightMode() {
    this.setHighlightMode(!this.highlightMode);
  }

  /**
   * Preloads the upcoming track on the standby element
   */
  private preloadNext() {
    if (this.playlist.length <= 1) return;
    const nextIdx = (this.currentIndex + 1) % this.playlist.length;
    const nextTrack = this.playlist[nextIdx];
    if (!nextTrack) return;

    const standby = this.getStandbySlot();
    if (!this.isTransitioning && (!standby.src || !standby.src.includes(encodeURIComponent(nextTrack.filename)))) {
      standby.src = nextTrack.url;
      standby.preload = "metadata";
      standby.load();
    }
  }

  public stopAll() {
    this.pause(false);
    if (this.crossfadeRaf) cancelAnimationFrame(this.crossfadeRaf);
    this.slotA.pause();
    this.slotA.currentTime = 0;
    this.slotB.pause();
    this.slotB.currentTime = 0;
  }
}

export const audioEngine = AudioEngine.getInstance();

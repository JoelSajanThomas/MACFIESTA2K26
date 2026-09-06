"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiPlayFill,
  RiPauseFill,
  RiSkipBackFill,
  RiSkipForwardFill,
  RiPlayListFill,
  RiCloseLine,
  RiFlashlightFill,
  RiEqualizerFill,
} from "react-icons/ri";
import { useAudioPlayer } from "../../context/AudioPlayerContext";
import { MusicVisualizer } from "../hero/MusicVisualizer";
import { formatTime, SongTrack } from "../../services/songLibrary";

export function AvengersAudioHud() {
  const {
    playlist,
    currentTrack,
    currentIndex,
    isPlaying,
    isTransitioning,
    highlightMode,
    progress,
    currentTime,
    duration,
    togglePlay,
    next,
    prev,
    playTrack,
    toggleHighlightMode,
  } = useAudioPlayer();

  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const playlistRef = useRef<HTMLDivElement | null>(null);

  // Close playlist drawer when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (playlistRef.current && !playlistRef.current.contains(e.target as Node)) {
        setIsPlaylistOpen(false);
      }
    };
    if (isPlaylistOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isPlaylistOpen]);

  const activeTrackNumber = String(currentIndex + 1).padStart(2, "0");
  const totalTrackCount = String(playlist.length).padStart(2, "0");

  const heroBadgeName = currentTrack?.heroBadge
    ? currentTrack.heroBadge.split("•")[0].trim()
    : currentTrack?.theme || "AVENGERS";

  return (
    <div className="w-full pt-2 sm:pt-2.5 border-t border-white/10 relative select-none font-space">
      {/* ─── Top Telemetry & Controls Bar ─── */}
      <div className="flex items-center justify-between gap-1 pb-1 mb-1 border-b border-white/10 text-[8.5px] sm:text-[9px]">
        {/* Left: Status Indicator & Hero Telemetry */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="relative flex h-2 w-2 shrink-0">
            {isPlaying && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-arc-cyan opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 transition-colors duration-300 ${
                isPlaying ? "bg-arc-cyan shadow-[0_0_6px_#00D4FF]" : "bg-white/50"
              }`}
            />
          </span>

          <span className="font-bold text-white tracking-[0.16em] uppercase text-[8.5px] sm:text-[9.5px] truncate">
            HUD
          </span>

          <span className="font-mono font-bold text-arc-cyan text-[8.5px] sm:text-[9.5px] shrink-0">
            {activeTrackNumber}/{totalTrackCount}
          </span>

          {currentTrack && (
            <span
              className="text-[7.5px] px-2 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 border border-marvel-red/60 bg-marvel-red/25 text-[#FF454D]"
            >
              {heroBadgeName}
            </span>
          )}
        </div>

        {/* Right: Mode & Playlist Triggers */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleHighlightMode();
            }}
            className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-0.5 ${
              highlightMode
                ? "bg-marvel-red/35 border-marvel-red text-[#FF3B42] shadow-[0_0_8px_rgba(237,29,36,0.3)]"
                : "bg-black/50 border-white/20 text-white hover:text-arc-cyan hover:border-arc-cyan/60"
            }`}
            title={
              highlightMode
                ? "⚡ Highlight Mix Mode: Playing drops and iconic sections"
                : "Full Track Mode: Playing entire songs"
            }
            aria-label="Toggle Highlight Mix Mode"
          >
            <RiFlashlightFill className="text-[9px]" />
            <span>{highlightMode ? "MIX" : "FULL"}</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsPlaylistOpen((prev) => !prev);
            }}
            className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1 ${
              isPlaylistOpen
                ? "bg-arc-cyan/35 border-arc-cyan text-arc-cyan shadow-[0_0_8px_rgba(0,212,255,0.4)]"
                : "bg-black/50 border-white/20 text-white hover:text-arc-cyan hover:border-arc-cyan/60"
            }`}
            title="Browse all songs"
            aria-label="Toggle Playlist"
          >
            <RiPlayListFill className="text-[9px]" />
            <span>LIST</span>
          </button>
        </div>
      </div>

      {/* ─── Main Deck: Transport, Track Info & Visualizer ─── */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: Transport Buttons (Prev, Play, Next) */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center bg-black/40 border border-white/15 text-white/90 hover:text-arc-cyan hover:border-arc-cyan hover:bg-black/70 active:scale-90 transition-all cursor-pointer focus:outline-none"
            title="Previous Track"
            aria-label="Previous Track"
          >
            <RiSkipBackFill className="text-xs sm:text-sm" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border transition-all duration-300 shadow-md flex items-center justify-center shrink-0 cursor-pointer focus:outline-none ${
              isPlaying
                ? "bg-marvel-red border-marvel-red text-white shadow-[0_0_16px_#ED1D24] hover:scale-105 active:scale-95"
                : "bg-black/60 border-2 border-arc-cyan text-arc-cyan shadow-[0_0_12px_rgba(0,212,255,0.5)] hover:border-[#33e1ff] hover:scale-105 active:scale-95"
            }`}
            title={isPlaying ? "Pause Music" : "Play Music"}
            aria-label={isPlaying ? "Pause theme music" : "Play theme music"}
          >
            {isPlaying ? (
              <RiPauseFill className="text-sm sm:text-base text-white" />
            ) : (
              <RiPlayFill className="text-sm sm:text-base text-arc-cyan ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center bg-black/40 border border-white/15 text-white/90 hover:text-arc-cyan hover:border-arc-cyan hover:bg-black/70 active:scale-90 transition-all cursor-pointer focus:outline-none"
            title="Next Track"
            aria-label="Next Track"
          >
            <RiSkipForwardFill className="text-xs sm:text-sm" />
          </button>
        </div>

        {/* Center: Track Title, Artist & Progress (Spacious & Clean) */}
        <div
          onClick={() => setIsPlaylistOpen((prev) => !prev)}
          className="flex-1 min-w-0 cursor-pointer text-left group/deck px-1"
          title="Click to view full playlist matrix"
        >
          {/* Song Title & Artist */}
          <div className="overflow-hidden w-full">
            <p className="text-[11.5px] sm:text-xs font-bold font-excon-bold truncate text-white group-hover/deck:text-arc-cyan transition-colors">
              {isPlaying ? (
                isTransitioning ? (
                  <span className="text-[#FFD700] flex items-center gap-1 animate-pulse">
                    <RiEqualizerFill className="text-[11px] shrink-0" />
                    <span>CROSSFADING BEATS...</span>
                  </span>
                ) : (
                  <span>
                    <span className="text-white">{currentTrack?.title || "Avengers Anthem"}</span>{" "}
                    <span className="text-arc-cyan font-bold">
                      • {currentTrack?.artist}
                    </span>
                  </span>
                )
              ) : (
                <span className="text-white/90 font-bold tracking-wide">AUDIO MUTED • TAP TO PLAY</span>
              )}
            </p>
          </div>

          {/* Subtitle & Timestamp */}
          <div className="flex items-center justify-between text-[8.5px] font-space text-white/70 font-medium mt-0.5">
            <span className="truncate tracking-wide">
              {isPlaying
                ? highlightMode && currentTrack?.highlight?.description
                  ? currentTrack.highlight.description
                  : currentTrack?.artist || "Marvel Soundtrack"
                : "READY TO LAUNCH"}
            </span>
            {isPlaying && (
              <span className="text-[8.5px] font-mono font-bold text-arc-cyan shrink-0 ml-1">
                {formatTime(currentTime)}
              </span>
            )}
          </div>

          {/* Glowing HUD Progress Bar */}
          <div className="w-full h-[3px] bg-black/60 border border-white/10 rounded-full mt-1 overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-arc-cyan via-[#FFD700] to-marvel-red transition-all duration-300 shadow-[0_0_8px_#00D4FF]"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </div>

        {/* Right: Music Visualizer Equalizer */}
        <div className="shrink-0 flex items-center pl-1">
          <MusicVisualizer isPlaying={isPlaying} bars={8} className="h-5 sm:h-6" />
        </div>
      </div>

      {/* ─── Stark Matrix Playlist Drawer ─── */}
      <AnimatePresence>
        {isPlaylistOpen && (
          <motion.div
            ref={playlistRef}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-full left-0 right-0 mb-2.5 z-50 stark-panel p-3 sm:p-3.5 rounded-xl border border-arc-cyan/40 bg-[#06080E]/95 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.95),0_0_25px_rgba(0,212,255,0.25)] space-y-2"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
              <div className="flex items-center gap-1.5 font-orbitron">
                <span className="w-1.5 h-1.5 rounded-full bg-arc-cyan animate-ping" />
                <h4 className="text-[10px] sm:text-xs font-bold text-arc-cyan tracking-[0.16em] uppercase">
                  STARK AUDIO MATRIX
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleHighlightMode}
                  className={`text-[8.5px] px-2 py-0.5 rounded font-space font-bold uppercase tracking-wider border transition-all flex items-center gap-1 cursor-pointer ${
                    highlightMode
                      ? "bg-marvel-red/20 border-marvel-red text-marvel-red shadow-[0_0_8px_rgba(237,29,36,0.3)]"
                      : "bg-white/5 border-white/20 text-white/60 hover:text-white"
                  }`}
                  title={
                    highlightMode
                      ? "Highlight Mix: Plays drops with seamless crossfades"
                      : "Full Track Mode: Plays entire song"
                  }
                >
                  <RiFlashlightFill className="text-xs" />
                  <span>{highlightMode ? "⚡ MIX MODE" : "FULL TRACKS"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPlaylistOpen(false)}
                  className="text-white/50 hover:text-white transition-colors p-0.5 cursor-pointer"
                  aria-label="Close Playlist Matrix"
                >
                  <RiCloseLine className="text-base" />
                </button>
              </div>
            </div>

            {/* Helper Notice */}
            <div className="flex items-center justify-between text-[8px] text-white/45 font-space px-0.5">
              <span>{playlist.length} TRACKS LOADED • STUDIO CROSSFADE (3.5s)</span>
              <span>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Scrollable Playlist Rows */}
            <div className="max-h-52 sm:max-h-60 overflow-y-auto space-y-1 pr-1 stark-scrollbar">
              {playlist.map((track: SongTrack, idx: number) => {
                const isSelected = idx === currentIndex;
                const trackNum = String(idx + 1).padStart(2, "0");

                return (
                  <button
                    key={track.id || track.filename}
                    type="button"
                    onClick={() => {
                      playTrack(idx);
                      if (window.innerWidth < 640) {
                        setIsPlaylistOpen(false);
                      }
                    }}
                    className={`w-full text-left p-1.5 sm:p-2 rounded-lg border transition-all duration-200 flex items-center justify-between gap-2 cursor-pointer group ${
                      isSelected
                        ? "bg-arc-cyan/15 border-arc-cyan/60 shadow-[0_0_15px_rgba(0,212,255,0.2)]"
                        : "bg-white/[0.02] border-white/5 hover:bg-white/[0.06] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-4 text-center font-mono text-[9.5px] shrink-0">
                        {isSelected && isPlaying ? (
                          <span className="text-arc-cyan font-bold animate-pulse">▶</span>
                        ) : (
                          <span className="text-white/40 group-hover:text-white/80">
                            {trackNum}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 text-left font-space">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p
                            className={`text-[10.5px] sm:text-[11.5px] font-bold truncate ${
                              isSelected
                                ? "text-arc-cyan drop-shadow-[0_0_6px_rgba(0,212,255,0.5)]"
                                : "text-white/90 group-hover:text-white"
                            }`}
                          >
                            {track.title}
                          </p>
                          <span
                            className="text-[7px] px-1 py-0.2 rounded font-bold uppercase tracking-wider shrink-0 border"
                            style={{
                              color: track.accentColor || "#00D4FF",
                              borderColor: `${track.accentColor || "#00D4FF"}44`,
                              backgroundColor: `${track.accentColor || "#00D4FF"}11`,
                            }}
                          >
                            {track.heroBadge ? track.heroBadge.split("•")[0].trim() : track.theme}
                          </span>
                        </div>
                        <p className="text-[8.5px] text-white/50 truncate">
                          {track.artist}
                          {track.highlight?.description && (
                            <span className="text-white/30 ml-1 hidden sm:inline">
                              — {track.highlight.description}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-mono text-[8.5px] text-white/45">
                      {highlightMode && track.highlight ? (
                        <span className="text-metallic-gold/80 font-semibold flex items-center gap-0.5 justify-end">
                          <RiFlashlightFill className="text-[9px]" />
                          {formatTime(track.highlight.startTime)}
                        </span>
                      ) : (
                        <span>{formatTime(track.duration)}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

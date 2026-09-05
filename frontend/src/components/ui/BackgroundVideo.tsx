"use client";

import React, { useEffect, useRef } from "react";

interface BackgroundVideoProps {
  src: string;
  fallbackSrc?: string;
  opacity?: string;
  className?: string;
  gradientOverlay?: boolean;
}

export function BackgroundVideo({
  src = "/MARVEL/Video Project 5.mp4",
  fallbackSrc = "/MARVEL/Video Project 4.mp4",
  opacity = "opacity-75",
  className = "",
  gradientOverlay = true,
}: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPlayback = () => {
      if (document.hidden || reduceMotion.matches) {
        video.pause();
        return;
      }
      video.play().catch(() => {});
    };

    // Robust hardware play trigger
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fallback: retry on first interaction if blocked by strict browser policy
        const handleInteraction = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(() => {});
          }
          window.removeEventListener("touchstart", handleInteraction);
          window.removeEventListener("click", handleInteraction);
          window.removeEventListener("scroll", handleInteraction);
        };
        window.addEventListener("touchstart", handleInteraction, { once: true, passive: true });
        window.addEventListener("click", handleInteraction, { once: true, passive: true });
        window.addEventListener("scroll", handleInteraction, { once: true, passive: true });
      });
    }

    document.addEventListener("visibilitychange", syncPlayback);
    reduceMotion.addEventListener?.("change", syncPlayback);
    syncPlayback();

    return () => {
      document.removeEventListener("visibilitychange", syncPlayback);
      reduceMotion.removeEventListener?.("change", syncPlayback);
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [src]);

  const getMimeType = (url?: string) => {
    if (!url || typeof url !== "string") return "video/mp4";
    const clean = url.split("?")[0].toLowerCase();
    if (clean.endsWith(".webm")) return "video/webm";
    if (clean.endsWith(".ogg") || clean.endsWith(".ogv")) return "video/ogg";
    return "video/mp4";
  };

  return (
    <div className={`absolute inset-0 z-0 overflow-hidden pointer-events-none ${opacity} ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        disablePictureInPicture
        disableRemotePlayback
        className="w-full h-full object-cover object-center"
        style={{
          transform: "translate3d(0, 0, 0)",
          willChange: "transform",
          backfaceVisibility: "hidden",
        }}
      >
        {src && <source src={encodeURI(src)} type={getMimeType(src)} />}
        {fallbackSrc && fallbackSrc !== src && (
          <source src={encodeURI(fallbackSrc)} type={getMimeType(fallbackSrc)} />
        )}
      </video>

      {gradientOverlay && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-[#05050A]/40 via-[#05050A]/50 to-[#05050A]/90 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(5,5,10,0.6)_95%)] pointer-events-none" />
        </>
      )}
    </div>
  );
}

export default BackgroundVideo;

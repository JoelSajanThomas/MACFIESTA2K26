"use client";

import React, { useEffect, useRef, useState } from "react";

interface BackgroundVideoProps {
  src?: string;
  fallbackSrc?: string;
  fallbackImage?: string;
  opacity?: string;
  className?: string;
  gradientOverlay?: boolean;
}

export function BackgroundVideo({
  src = "/MARVEL/Video Project 5.mp4",
  fallbackSrc = "/MARVEL/Video Project 4.mp4",
  fallbackImage = "/MARVEL/download (6).jpg",
  opacity = "opacity-85",
  className = "",
  gradientOverlay = true,
}: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

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
    <div className={`fixed inset-0 z-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Marvel Comic Image Backdrop (Always active as baseline or fallback) */}
      <img
        src={fallbackImage}
        alt="Marvel Cinematic Backdrop"
        className={`w-full h-full object-cover object-center absolute inset-0 contrast-[1.05] saturate-[1.1] brightness-[0.92] ${opacity}`}
      />

      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        disablePictureInPicture
        disableRemotePlayback
        poster={fallbackImage}
        onLoadedData={() => setIsVideoReady(true)}
        onPlaying={() => setIsVideoReady(true)}
        onError={() => setIsVideoReady(false)}
        className={`w-full h-full object-cover object-center transition-opacity duration-700 ${
          isVideoReady ? opacity : "opacity-0 pointer-events-none"
        }`}
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
          <div className="absolute inset-0 bg-gradient-to-b from-[#05050A]/40 via-black/25 to-[#05050A]/85 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(5,5,10,0.7)_100%)] pointer-events-none" />
        </>
      )}
    </div>
  );
}

export default BackgroundVideo;

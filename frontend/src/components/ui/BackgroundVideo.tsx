import React, { useEffect, useRef, useState } from "react";
import { isLowEndDevice } from "../../utils/deviceCapabilities";

interface BackgroundVideoProps {
  src: string;
  fallbackSrc?: string;
  opacity?: string;
  className?: string;
  gradientOverlay?: boolean;
}

const DEFAULT_LOOP = "/assets/image all/ref-ui/cinematic-loop.mp4";

export function BackgroundVideo({
  src,
  fallbackSrc = DEFAULT_LOOP,
  opacity = "opacity-75",
  className = "",
  gradientOverlay = true,
}: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isLow, setIsLow] = useState(false);

  useEffect(() => {
    setIsLow(isLowEndDevice());
  }, []);

  // Map non-existent legacy paths to valid existing cinematic loop
  const resolveSrc = (url: string) => {
    if (!url || url.includes("Video Project")) {
      return DEFAULT_LOOP;
    }
    return url;
  };

  const finalSrc = resolveSrc(src);
  const finalFallback = resolveSrc(fallbackSrc);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;

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
  }, [finalSrc, isLow]);

  const getMimeType = (url: string) => {
    const clean = url.split("?")[0].toLowerCase();
    if (clean.endsWith(".webm")) return "video/webm";
    if (clean.endsWith(".ogg") || clean.endsWith(".ogv")) return "video/ogg";
    return "video/mp4";
  };

  return (
    <div className={`absolute inset-0 z-0 overflow-hidden pointer-events-none ${opacity} ${className}`}>
      {!isLow && (
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
          <source src={encodeURI(finalSrc)} type={getMimeType(finalSrc)} />
          {finalFallback && finalFallback !== finalSrc && (
            <source src={encodeURI(finalFallback)} type={getMimeType(finalFallback)} />
          )}
        </video>
      )}

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

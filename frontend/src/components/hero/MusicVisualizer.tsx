"use client";

/**
 * CSS-based music visualizer bars with festival gradient colors.
 * Purely decorative — creates an animated equalizer effect.
 */
export function MusicVisualizer({ isPlaying = false }: { isPlaying?: boolean }) {
  const bars = 12;

  return (
    <div className="flex items-end gap-[3px] h-8 md:h-12" aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => {
        const delay = `${(i * 0.08).toFixed(2)}s`;
        // Deterministic pseudo-random values based on index to avoid hydration mismatch
        const duration = `${0.8 + ((i * 13) % 9) * 0.08}s`;
        const height = 30 + ((i * 17) % 8) * 8;

        const animationStyle = isPlaying
          ? `visualizer-bar ${duration} ease-in-out ${delay} infinite`
          : "none";
        const heightStyle = isPlaying ? `${height}%` : "15%";

        return (
          <div
            key={i}
            className="w-[3px] md:w-[4px] rounded-full origin-bottom"
            style={{
              height: heightStyle,
              background: `linear-gradient(to top, 
                ${i % 5 === 0 ? "#EAB308" :
                  i % 5 === 1 ? "#7C3AED" :
                    i % 5 === 2 ? "#06B6D4" :
                      i % 5 === 3 ? "#EC4899" : "#F97316"
                },
                transparent
              )`,
              animation: animationStyle,
              opacity: isPlaying ? 0.7 : 0.3,
              transition: "height 0.3s ease, opacity 0.3s ease",
            }}
          />
        );
      })}
    </div>
  );
}

import { isLowEndDevice } from "../../utils/deviceCapabilities";

/**
 * CSS particle + hex-grid atmosphere adapted from MACFIESTA.rar ParticleBackground.
 * Lightweight and adaptively scaled for low-end devices.
 */
export default function ParticleAtmosphere() {
  const isLow = typeof window !== "undefined" && isLowEndDevice();
  const particleCount = isLow ? 8 : 28;
  const hexCount = isLow ? 2 : 6;

  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    left: (i * 31 + 17) % 100,
    top: (i * 43 + 11) % 100,
    size: 1 + ((i * 7) % 3),
    duration: 8 + ((i * 13) % 12),
    delay: (i * 19) % 8,
    type: i % 5,
  }));

  const hexagons = Array.from({ length: hexCount }, (_, i) => ({
    id: i,
    left: (i * 41 + 5) % 90 + 5,
    top: (i * 37 + 15) % 80 + 10,
    size: 40 + ((i * 23) % 60),
    duration: 15 + ((i * 11) % 10),
    delay: i * 2,
    opacity: 0.03 + ((i * 7) % 3) * 0.01,
  }));

  const colors = [
    "rgba(0, 212, 255, 0.45)",
    "rgba(237, 29, 36, 0.4)",
    "rgba(212, 175, 55, 0.35)",
    "rgba(0, 180, 255, 0.35)",
    "rgba(240, 193, 75, 0.3)",
  ];

  return (
    <div className="mf-particle-atmosphere" aria-hidden="true">
      <div className="mf-hex-grid" />
      {particles.map((p) => (
        <span
          key={p.id}
          className="mf-particle"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: colors[p.type],
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      {hexagons.map((h) => (
        <span
          key={`hex-${h.id}`}
          className="mf-hex-shape"
          style={{
            left: `${h.left}%`,
            top: `${h.top}%`,
            width: `${h.size}px`,
            height: `${h.size}px`,
            animationDuration: `${h.duration}s`,
            animationDelay: `${h.delay}s`,
            opacity: h.opacity,
          }}
        />
      ))}
    </div>
  );
}

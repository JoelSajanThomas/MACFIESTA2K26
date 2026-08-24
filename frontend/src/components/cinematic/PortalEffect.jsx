/** Decorative energy portal — CSS/SVG only, aria-hidden. */
export default function PortalEffect({ className = "" }) {
  return (
    <div className={`mf-portal ${className}`.trim()} aria-hidden="true">
      <span className="mf-portal__core" />
      <span className="mf-portal__ring mf-portal__ring--1" />
      <span className="mf-portal__ring mf-portal__ring--2" />
      <span className="mf-portal__ring mf-portal__ring--3" />
      <span className="mf-portal__arc mf-portal__arc--red" />
      <span className="mf-portal__arc mf-portal__arc--cyan" />
      <span className="mf-portal__rays" />
      <span className="mf-portal__pulse" />
      <svg className="mf-portal__svg" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="mfPortalGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.55" />
            <stop offset="45%" stopColor="#ed1d24" stopOpacity="0.25" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="70" fill="url(#mfPortalGlow)" />
        <circle cx="100" cy="100" r="48" fill="none" stroke="rgba(0,212,255,0.45)" strokeWidth="1.2" strokeDasharray="4 6" />
        <circle cx="100" cy="100" r="58" fill="none" stroke="rgba(237,29,36,0.4)" strokeWidth="1" strokeDasharray="2 8" />
      </svg>
    </div>
  );
}

/** Section transition divider — visual only. */
export default function EnergyDivider({ variant = "wave", className = "" }) {
  return (
    <div
      className={`mf-energy-divider mf-energy-divider--${variant} ${className}`.trim()}
      aria-hidden="true"
    >
      <span className="mf-energy-divider__line" />
      <span className="mf-energy-divider__core" />
      <span className="mf-energy-divider__spark mf-energy-divider__spark--a" />
      <span className="mf-energy-divider__spark mf-energy-divider__spark--b" />
    </div>
  );
}

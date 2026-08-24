/** Thin section label for championship UI. */
export default function SectionEyebrow({ children, tone = "cyan", className = "" }) {
  return (
    <span className={`mf-section-eyebrow mf-section-eyebrow--${tone} ${className}`.trim()}>
      {children}
    </span>
  );
}

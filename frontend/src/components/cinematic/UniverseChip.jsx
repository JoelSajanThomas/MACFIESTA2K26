export default function UniverseChip({ universe = "red", children, className = "" }) {
  return (
    <span className={`mf-universe-chip mf-universe-chip--${universe} ${className}`.trim()}>
      {children}
    </span>
  );
}

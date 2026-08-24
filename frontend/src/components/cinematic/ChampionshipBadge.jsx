/** Decorative championship badge. */
export default function ChampionshipBadge({ children, className = "" }) {
  return <span className={`mf-champ-badge ${className}`.trim()}>{children}</span>;
}

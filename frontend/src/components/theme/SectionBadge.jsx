export default function SectionBadge({ children, tone = "gold" }) {
  return <span className={`section-badge section-badge--${tone}`}>{children}</span>;
}

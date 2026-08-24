/** Mission-style event card shell — wraps existing children without API changes. */
export default function MissionCard({ children, className = "", as: Tag = "article", ...rest }) {
  return (
    <Tag className={`mf-mission-card event-card-mission ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
}

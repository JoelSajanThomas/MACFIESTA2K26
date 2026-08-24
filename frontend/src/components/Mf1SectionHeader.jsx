/**
 * Shared MACFIESTA1 section header: cyan badge → split title → accent rule.
 */
export default function Mf1SectionHeader({
  badge,
  badgeFlavor,
  title,
  titleAccent,
  subtitle,
  id,
  align = "center",
}) {
  const titleId = id || undefined;
  return (
    <header className={`mf1-section-header mf1-section-header--${align}`}>
      {badge ? (
        <p className="mf1-section-badge">
          {badge}
          {badgeFlavor ? (
            <span className="mf1-section-badge__flavor" aria-hidden="true">
              {" "}
              · {badgeFlavor}
            </span>
          ) : null}
        </p>
      ) : null}
      <h2 id={titleId} className="mf1-section-title">
        <span className="mf1-shimmer-text">{title}</span>
        {titleAccent ? (
          <>
            {" "}
            <span className="mf1-gradient-text-plasma">{titleAccent}</span>
          </>
        ) : null}
      </h2>
      <div className="mf1-section-divider" aria-hidden="true" />
      {subtitle ? <p className="mf1-section-sub">{subtitle}</p> : null}
    </header>
  );
}

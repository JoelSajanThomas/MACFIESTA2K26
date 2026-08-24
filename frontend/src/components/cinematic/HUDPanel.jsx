/** Decorative HUD glass panel with corner brackets. */
export default function HUDPanel({
  className = "",
  title,
  children,
  tone = "cyan",
  as: Tag = "aside",
  ...rest
}) {
  return (
    <Tag className={`mf-hud-panel mf-hud-panel--${tone} ${className}`.trim()} {...rest}>
      <span className="mf-hud-bracket mf-hud-bracket--tl" aria-hidden="true" />
      <span className="mf-hud-bracket mf-hud-bracket--tr" aria-hidden="true" />
      <span className="mf-hud-bracket mf-hud-bracket--bl" aria-hidden="true" />
      <span className="mf-hud-bracket mf-hud-bracket--br" aria-hidden="true" />
      {title ? <p className="mf-hud-panel__title">{title}</p> : null}
      <div className="mf-hud-panel__body">{children}</div>
    </Tag>
  );
}

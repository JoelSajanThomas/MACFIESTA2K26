import { Link } from "react-router-dom";

/** Premium CTA — uses Link when `to` is set, otherwise button. */
export default function GlowButton({
  to,
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...rest
}) {
  const classes = `mf-glow-btn mf-glow-btn--${variant} ${className}`.trim();
  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        <span>{children}</span>
      </Link>
    );
  }
  return (
    <button type={type} className={classes} {...rest}>
      <span>{children}</span>
    </button>
  );
}

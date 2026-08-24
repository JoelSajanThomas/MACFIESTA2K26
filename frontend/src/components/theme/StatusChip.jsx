import { SUPERHERO_THEME } from "../../theme/superheroTheme";

const TONE_CLASS = {
  warning: "status-chip--warning",
  success: "status-chip--success",
  info: "status-chip--info",
  purple: "status-chip--purple",
  danger: "status-chip--danger",
  gold: "status-chip--gold",
  muted: "status-chip--muted",
};

export default function StatusChip({ status, label, className = "" }) {
  const key = String(status || "").toLowerCase();
  const meta = SUPERHERO_THEME.status[key];
  const tone = meta?.tone || "muted";
  const text = label || meta?.label || status || "—";

  return (
    <span className={`status-chip ${TONE_CLASS[tone] || TONE_CLASS.muted} ${className}`.trim()}>
      {text}
    </span>
  );
}

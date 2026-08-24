import { useLoading } from "../../providers/LoadingProvider";

/**
 * Hides shell content until LoadingScreen is dismissed (MACFIESTA1 PageGate).
 * Admin bypasses the gate entirely (no wrapper) so desk scroll is not trapped.
 */
export default function PageGate({ children, bypass = false }) {
  const { isDone } = useLoading();

  if (bypass) return children;

  const ready = isDone;

  return (
    <div
      className="mf1-page-gate"
      style={{
        visibility: ready ? "visible" : "hidden",
        pointerEvents: ready ? "auto" : "none",
        opacity: ready ? 1 : 0,
        transition: "opacity 0.4s ease 0.1s",
      }}
    >
      {children}
    </div>
  );
}

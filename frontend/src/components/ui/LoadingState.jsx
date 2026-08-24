import MultiverseLoading from "../theme/MultiverseLoading";

/**
 * @param {string} [message]
 * @param {"default"|"multiverse"} [variant] — use multiverse on public pages; keep default for Admin.
 */
export default function LoadingState({ message = "Loading…", variant = "default" }) {
  if (variant === "multiverse") {
    return <MultiverseLoading message={message} />;
  }
  return (
    <div className="ui-state ui-loading" role="status" aria-live="polite">
      <span className="ui-spinner" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}

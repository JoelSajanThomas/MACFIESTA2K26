export default function LoadingState({ message = "Loading…" }) {
  return (
    <div className="ui-state ui-loading" role="status" aria-live="polite">
      <span className="ui-spinner" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}

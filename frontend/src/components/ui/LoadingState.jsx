export default function LoadingState({ message = "Loading…" }) {
  return (
    <div className="ui-state ui-loading" role="status">
      <span className="ui-spinner" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}

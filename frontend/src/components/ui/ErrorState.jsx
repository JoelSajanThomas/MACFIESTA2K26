export default function ErrorState({ message = "Something went wrong.", onRetry }) {
  return (
    <div className="ui-state ui-error" role="alert">
      <span className="ui-state-icon">!</span>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-outline btn-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

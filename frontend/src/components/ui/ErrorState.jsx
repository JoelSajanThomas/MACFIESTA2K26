import { THEMED_ERRORS } from "../../theme/roster";

export default function ErrorState({
  message,
  title = THEMED_ERRORS.api.title,
  onRetry,
}) {
  const text = message || THEMED_ERRORS.api.message;
  return (
    <div className="ui-state ui-error themed-state" role="alert">
      <span className="ui-state-icon">!</span>
      <h3 className="themed-state__title">{title}</h3>
      <p>{text}</p>
      {onRetry && (
        <button type="button" className="btn btn-outline btn-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

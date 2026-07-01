export default function EmptyState({ icon = "📭", title, message, action }) {
  return (
    <div className="ui-state ui-empty">
      {icon && <span className="ui-state-icon large">{icon}</span>}
      {title && <h3>{title}</h3>}
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}

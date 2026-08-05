export default function AdminFormLayout({ title, subtitle, children, onSubmit, submitting, error, success }) {
  return (
    <div className="admin-form-page">
      <div className="admin-form-head">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <form className="admin-form detail-panel" onSubmit={onSubmit} noValidate>
        {children}
        {error && <p className="form-error" role="alert">{error}</p>}
        {success && <p className="form-success" role="status" aria-live="polite">{success}</p>}
        <div className="admin-form-actions">
          <button type="submit" className="btn btn-gold" disabled={submitting}>
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function FormInput({ label, ...props }) {
  return (
    <label className="admin-form-field">
      {label}
      <input {...props} />
    </label>
  );
}

export function FormTextarea({ label, ...props }) {
  return (
    <label className="admin-form-field">
      {label}
      <textarea {...props} />
    </label>
  );
}

export function FormSelect({ label, options, ...props }) {
  return (
    <label className="admin-form-field">
      {label}
      <select {...props}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </label>
  );
}

export function FormCheckbox({ label, ...props }) {
  return (
    <label className="admin-form-checkbox">
      <input type="checkbox" {...props} />
      <span>{label}</span>
    </label>
  );
}

export function ImageUploadPreview({ label, preview, onChange, accept = "image/*" }) {
  return (
    <label className="admin-form-field">
      {label}
      <input type="file" accept={accept} onChange={onChange} />
      {preview && (
        <div className="admin-image-preview">
          <img src={preview} alt="Preview" />
        </div>
      )}
    </label>
  );
}

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

import { useState } from "react";
import ImageCropAdjustModal from "./ImageCropAdjustModal";
import { RiCropLine } from "react-icons/ri";

export function ImageUploadPreview({ label, preview, onChange, accept = "image/*" }) {
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [currentPreview, setCurrentPreview] = useState(preview || "");
  const [originalFileName, setOriginalFileName] = useState("image.png");

  // Keep internal preview in sync with external preview prop
  const activePreview = currentPreview || preview;

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalFileName(file.name);
      const objUrl = URL.createObjectURL(file);
      setCurrentPreview(objUrl);
    }
    if (onChange) onChange(e);
  }

  function handleCropApply(croppedFile, croppedPreviewUrl) {
    setCurrentPreview(croppedPreviewUrl);
    if (onChange) {
      onChange({
        target: {
          files: [croppedFile],
        },
      });
    }
  }

  return (
    <div className="admin-form-field space-y-2">
      <div className="flex items-center justify-between">
        <span>{label}</span>
        {activePreview && (
          <button
            type="button"
            onClick={() => setCropModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black uppercase tracking-wider rounded-lg bg-metallic-gold/20 hover:bg-metallic-gold text-metallic-gold hover:text-black border border-metallic-gold/40 transition-all cursor-pointer shadow-sm"
          >
            <RiCropLine className="text-sm" />
            <span>Crop &amp; Adjust Image</span>
          </button>
        )}
      </div>

      <input type="file" accept={accept} onChange={handleFileChange} />

      {activePreview && (
        <div className="admin-image-preview relative group rounded-xl overflow-hidden border border-white/20 bg-black/40 mt-2">
          <img src={activePreview} alt="Preview" className="max-h-48 object-contain rounded-lg mx-auto" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={() => setCropModalOpen(true)}
              className="px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl bg-metallic-gold text-black shadow-lg hover:scale-105 transition-transform"
            >
              ✂️ Open Crop &amp; Adjust Tool
            </button>
          </div>
        </div>
      )}

      {cropModalOpen && (
        <ImageCropAdjustModal
          isOpen={cropModalOpen}
          imageSrc={activePreview}
          fileName={originalFileName}
          onClose={() => setCropModalOpen(false)}
          onApply={handleCropApply}
        />
      )}
    </div>
  );
}

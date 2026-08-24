import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminFormLayout, {
  FormCheckbox, FormInput, FormSelect, FormTextarea, ImageUploadPreview,
} from "../../../components/admin/AdminFormLayout";
import LoadingState from "../../../components/ui/LoadingState";
import { mediaUrl } from "../../../services/api";
import { parseApiError } from "../../../utils/adminUtils";
import { CMS_RESOURCES } from "./cmsAdminConfig";

export default function AdminCmsForm() {
  const { resource, id } = useParams();
  const config = CMS_RESOURCES[resource];
  const navigate = useNavigate();
  const isEdit = id !== "new";
  const [form, setForm] = useState(config?.empty || {});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!config || !isEdit) return;
    config.api.get(id)
      .then((res) => {
        setForm(res.data);
        const imgField = config.fields.find((f) => f.type === "image");
        if (imgField && res.data[imgField.name]) {
          setImagePreview(mediaUrl(res.data[imgField.name]));
        }
      })
      .catch(() => setError("Could not load item."))
      .finally(() => setLoading(false));
  }, [id, isEdit, config]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    setImageFile(file || null);
    setImagePreview(file ? URL.createObjectURL(file) : imagePreview);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const hasImage = config.fields.some((f) => f.type === "image");
      let payload;
      if (hasImage && imageFile) {
        payload = new FormData();
        const imgField = config.fields.find((f) => f.type === "image");
        Object.entries(form).forEach(([k, v]) => {
          if (v !== null && v !== undefined && k !== imgField?.name && k !== "image" && k !== "logo") {
            payload.append(k, typeof v === "boolean" ? (v ? "true" : "false") : v);
          }
        });
        if (imgField) {
          payload.append(imgField.name, imageFile);
        }
      } else {
        payload = { ...form };
        const imgField = config.fields.find((f) => f.type === "image");
        if (imgField && typeof payload[imgField.name] === "string") {
          delete payload[imgField.name];
        }
      }
      if (isEdit) await config.api.update(id, payload);
      else await config.api.create(payload);
      navigate(config.basePath);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (!config) return <p className="state-msg error">Unknown content type.</p>;
  if (loading) return <LoadingState message="Loading…" />;

  return (
    <>
      <Link to={config.basePath} className="back-link">← Back to {config.title}</Link>
      <AdminFormLayout
        title={isEdit ? `Edit ${config.singular}` : `Add ${config.singular}`}
        onSubmit={handleSubmit}
        submitting={submitting}
        error={error}
      >
        {config.fields.map((field) => {
          if (field.type === "textarea") {
            return <FormTextarea key={field.name} label={field.label} name={field.name} value={form[field.name] || ""} onChange={handleChange} rows={4} required={field.required} />;
          }
          if (field.type === "checkbox") {
            return <FormCheckbox key={field.name} label={field.label} name={field.name} checked={Boolean(form[field.name])} onChange={handleChange} />;
          }
          if (field.type === "select") {
            return <FormSelect key={field.name} label={field.label} name={field.name} value={form[field.name] || ""} onChange={handleChange} options={field.options} required={field.required} />;
          }
          if (field.type === "image") {
            return <ImageUploadPreview key={field.name} label={field.label} preview={imagePreview} onChange={handleImageChange} />;
          }
          return (
            <FormInput
              key={field.name}
              label={field.label}
              name={field.name}
              type={field.type === "number" ? "number" : "text"}
              value={form[field.name] ?? ""}
              onChange={handleChange}
              required={field.required}
            />
          );
        })}
      </AdminFormLayout>
    </>
  );
}

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
  const isEdit = id !== "new" && Boolean(id);
  const [form, setForm] = useState(config?.empty || {});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!config || !isEdit) return;
    setNotFound(false);
    config.api.get(id)
      .then((res) => {
        setForm(res.data);
        const imgField = config.fields.find((f) => f.type === "image");
        if (imgField && res.data[imgField.name]) {
          setImagePreview(mediaUrl(res.data[imgField.name]));
        }
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          setError(parseApiError(err));
        }
      })
      .finally(() => setLoading(false));
  }, [id, isEdit, config]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (error) setError("");
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    setImageFile(file || null);
    setImagePreview(file ? URL.createObjectURL(file) : imagePreview);
    if (error) setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const hasImage = config.fields.some((f) => f.type === "image");
      const imgField = config.fields.find((f) => f.type === "image");
      let payload;
      if (hasImage && imageFile) {
        payload = new FormData();
        config.fields.forEach((f) => {
          if (f.type !== "image") {
            const v = form[f.name];
            if (v !== null && v !== undefined) {
              payload.append(f.name, typeof v === "boolean" ? (v ? "true" : "false") : v);
            }
          }
        });
        if (imgField) {
          payload.append(imgField.name, imageFile);
        }
      } else {
        payload = {};
        config.fields.forEach((f) => {
          if (f.type !== "image") {
            if (form[f.name] !== undefined) {
              payload[f.name] = form[f.name];
            }
          }
        });
      }

      if (isEdit) {
        try {
          await config.api.update(id, payload);
        } catch (err) {
          // If the item was not found on backend (404), seamlessly create it
          if (err.response?.status === 404) {
            await config.api.create(payload);
          } else {
            throw err;
          }
        }
      } else {
        await config.api.create(payload);
      }
      navigate(config.basePath);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (!config) return <p className="state-msg error">Unknown content type.</p>;
  if (loading) return <LoadingState message="Loading…" />;

  if (notFound) {
    return (
      <div className="admin-ops-page">
        <Link to={config.basePath} className="back-link">← Back to {config.title}</Link>
        <div className="admin-ops-header" style={{ marginTop: "1rem" }}>
          <p className="section-eyebrow">Record Status</p>
          <h1>{config.singular} Not Found</h1>
          <p>This {config.singular.toLowerCase()} record does not exist on the server or may have been removed.</p>
          <div className="admin-action-grid" style={{ marginTop: "1.5rem" }}>
            <Link to={`${config.basePath}/new`} className="admin-action-btn admin-action-btn--primary">
              + Create New {config.singular}
            </Link>
            <Link to={config.basePath} className="admin-action-btn">
              View All {config.title}
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

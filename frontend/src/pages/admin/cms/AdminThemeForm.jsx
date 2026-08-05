import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminFormLayout, { FormCheckbox, FormInput, FormTextarea, ImageUploadPreview } from "../../../components/admin/AdminFormLayout";
import LoadingState from "../../../components/ui/LoadingState";
import { createThemeSection, getThemeSections, mediaUrl, updateThemeSection } from "../../../services/api";
import { parseApiError } from "../../../utils/adminUtils";

const EMPTY = { eyebrow: "", title: "", description: "", is_active: true };

export default function AdminThemeForm() {
  const [form, setForm] = useState(EMPTY);
  const [themeId, setThemeId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getThemeSections(true)
      .then((res) => {
        if (res.data.length > 0) {
          const t = res.data[0];
          setThemeId(t.id);
          setForm({ eyebrow: t.eyebrow, title: t.title, description: t.description, is_active: t.is_active });
          if (t.image) setImagePreview(mediaUrl(t.image));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      let payload;
      if (imageFile) {
        payload = new FormData();
        Object.entries(form).forEach(([k, v]) => payload.append(k, typeof v === "boolean" ? (v ? "true" : "false") : v));
        payload.append("image", imageFile);
      } else {
        payload = form;
      }
      if (themeId) await updateThemeSection(themeId, payload);
      else {
        const res = await createThemeSection(payload);
        setThemeId(res.data.id);
      }
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingState message="Loading theme…" />;

  return (
    <>
      <Link to="/admin/content" className="back-link">← Website content</Link>
      <AdminFormLayout title="Theme Section" subtitle="This year's fest theme banner on the homepage" onSubmit={handleSubmit} submitting={submitting} error={error}>
        <FormInput label="Eyebrow" name="eyebrow" value={form.eyebrow} onChange={handleChange} />
        <FormInput label="Title *" name="title" value={form.title} onChange={handleChange} required />
        <FormTextarea label="Description *" name="description" value={form.description} onChange={handleChange} rows={4} required />
        <FormCheckbox label="Active" name="is_active" checked={form.is_active} onChange={handleChange} />
        <ImageUploadPreview label="Theme Image" preview={imagePreview} onChange={(e) => { const f = e.target.files?.[0]; setImageFile(f || null); if (f) setImagePreview(URL.createObjectURL(f)); }} />
      </AdminFormLayout>
    </>
  );
}

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminFormLayout, { FormCheckbox, FormInput, FormTextarea } from "../../components/admin/AdminFormLayout";
import LoadingState from "../../components/ui/LoadingState";
import { createAnnouncement, getAnnouncement, updateAnnouncement } from "../../services/api";
import { parseApiError } from "../../utils/adminUtils";

const EMPTY = { title: "", message: "", is_active: true };

export default function AdminAnnouncementForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id !== "new";
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    getAnnouncement(id)
      .then((res) => setForm({
        title: res.data.title,
        message: res.data.message,
        is_active: res.data.is_active,
      }))
      .catch(() => setError("Could not load announcement."))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (isEdit) await updateAnnouncement(id, form);
      else await createAnnouncement(form);
      navigate("/admin/announcements");
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingState message="Loading…" />;

  return (
    <>
      <Link to="/admin/announcements" className="back-link">← Back to announcements</Link>
      <AdminFormLayout title={isEdit ? "Edit Announcement" : "Add Announcement"} onSubmit={handleSubmit} submitting={submitting} error={error}>
        <FormInput label="Title *" name="title" value={form.title} onChange={handleChange} required />
        <FormTextarea label="Message *" name="message" value={form.message} onChange={handleChange} rows={5} required />
        <FormCheckbox label="Active (visible on site)" name="is_active" checked={form.is_active} onChange={handleChange} />
      </AdminFormLayout>
    </>
  );
}

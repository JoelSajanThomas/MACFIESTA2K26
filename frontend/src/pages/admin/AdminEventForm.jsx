import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminFormLayout, {
  FormCheckbox,
  FormInput,
  FormSelect,
  FormTextarea,
  ImageUploadPreview,
} from "../../components/admin/AdminFormLayout";
import LoadingState from "../../components/ui/LoadingState";
import { createEvent, getEvent, updateEvent, mediaUrl } from "../../services/api";
import { EVENT_CATEGORY_OPTIONS, EVENT_STATUS_OPTIONS, parseApiError, slugify } from "../../utils/adminUtils";

const EMPTY = {
  title: "",
  slug: "",
  category: "general",
  department: "",
  description: "",
  rules: "",
  venue: "",
  event_date: "",
  event_time: "",
  max_participants: 100,
  min_team_size: "",
  max_team_size: "",
  registration_fee: "0",
  registration_deadline: "",
  coordinator_name: "",
  coordinator_phone: "",
  coordinator_email: "",
  status: "upcoming",
  is_registration_open: true,
  waiting_list_enabled: true,
  is_result_published: false,
};

export default function AdminEventForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id !== "new";
  const [form, setForm] = useState(EMPTY);
  const [slugEdited, setSlugEdited] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  const [posterPreview, setPosterPreview] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    getEvent(id)
      .then((res) => {
        const e = res.data;
        setForm({
          title: e.title,
          slug: e.slug,
          category: e.category,
          department: e.department || "",
          description: e.description,
          rules: e.rules || "",
          venue: e.venue,
          event_date: e.event_date,
          event_time: e.event_time?.slice(0, 5) || "",
          max_participants: e.max_participants,
          min_team_size: e.min_team_size ?? "",
          max_team_size: e.max_team_size ?? "",
          registration_fee: String(e.registration_fee),
          registration_deadline: e.registration_deadline ? e.registration_deadline.slice(0, 16) : "",
          coordinator_name: e.coordinator_name || "",
          coordinator_phone: e.coordinator_phone || "",
          coordinator_email: e.coordinator_email || "",
          status: e.status || "upcoming",
          is_registration_open: e.is_registration_open,
          waiting_list_enabled: e.waiting_list_enabled !== false,
          is_result_published: e.is_result_published,
        });
        setPreview(mediaUrl(e.image) || "");
        setBannerPreview(mediaUrl(e.banner_image) || "");
        setPosterPreview(mediaUrl(e.poster_image) || "");
        setSlugEdited(true);
      })
      .catch(() => setError("Could not load event."))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((p) => {
      const next = { ...p, [name]: type === "checkbox" ? checked : value };
      if (name === "title" && !slugEdited) next.slug = slugify(value);
      return next;
    });
  }

  function handleSlugChange(e) {
    setSlugEdited(true);
    setForm((p) => ({ ...p, slug: e.target.value }));
  }

  function handleImage(e, kind) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (kind === "image") {
      setImageFile(file);
      setPreview(url);
    } else if (kind === "banner") {
      setBannerFile(file);
      setBannerPreview(url);
    } else {
      setPosterFile(file);
      setPosterPreview(url);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const hasFiles = imageFile || bannerFile || posterFile;
      const payload = hasFiles ? new FormData() : { ...form };
      const data = {
        ...form,
        min_team_size: form.min_team_size === "" ? null : Number(form.min_team_size),
        max_team_size: form.max_team_size === "" ? null : Number(form.max_team_size),
        registration_deadline: form.registration_deadline || null,
      };
      if (hasFiles) {
        Object.entries(data).forEach(([k, v]) => {
          if (v === null || v === undefined) return;
          if (typeof v === "boolean") payload.append(k, v ? "true" : "false");
          else payload.append(k, v);
        });
        if (imageFile) payload.append("image", imageFile);
        if (bannerFile) payload.append("banner_image", bannerFile);
        if (posterFile) payload.append("poster_image", posterFile);
      } else {
        Object.assign(payload, data);
      }
      if (isEdit) await updateEvent(id, payload);
      else await createEvent(payload);
      navigate("/admin/events");
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingState message="Loading event…" />;

  return (
    <>
      <Link to="/admin/events" className="back-link">← Back to events</Link>
      <AdminFormLayout
        title={isEdit ? "Edit Event" : "Add Event"}
        subtitle="Changes appear on the public Events page immediately after saving."
        onSubmit={handleSubmit}
        submitting={submitting}
        error={error}
      >
        <FormInput label="Title *" name="title" value={form.title} onChange={handleChange} required />
        <FormInput label="Slug *" name="slug" value={form.slug} onChange={handleSlugChange} required />
        <div className="admin-form-row">
          <FormSelect label="Category *" name="category" value={form.category} onChange={handleChange} options={EVENT_CATEGORY_OPTIONS} />
          <FormSelect label="Status" name="status" value={form.status} onChange={handleChange} options={EVENT_STATUS_OPTIONS} />
        </div>
        <FormInput label="Department" name="department" value={form.department} onChange={handleChange} />
        <FormTextarea label="Description *" name="description" value={form.description} onChange={handleChange} rows={4} required />
        <FormTextarea label="Rules" name="rules" value={form.rules} onChange={handleChange} rows={3} />
        <FormInput label="Venue *" name="venue" value={form.venue} onChange={handleChange} required />
        <div className="admin-form-row">
          <FormInput label="Date *" type="date" name="event_date" value={form.event_date} onChange={handleChange} required />
          <FormInput label="Time *" type="time" name="event_time" value={form.event_time} onChange={handleChange} required />
        </div>
        <FormInput label="Registration deadline" type="datetime-local" name="registration_deadline" value={form.registration_deadline} onChange={handleChange} />
        <div className="admin-form-row">
          <FormInput label="Max participants *" type="number" name="max_participants" value={form.max_participants} onChange={handleChange} min={1} required />
          <FormInput label="Registration fee (₹) *" type="number" step="0.01" name="registration_fee" value={form.registration_fee} onChange={handleChange} required />
        </div>
        <div className="admin-form-row">
          <FormInput label="Min team size" type="number" name="min_team_size" value={form.min_team_size} onChange={handleChange} min={1} />
          <FormInput label="Max team size" type="number" name="max_team_size" value={form.max_team_size} onChange={handleChange} min={1} />
        </div>
        <FormInput label="Coordinator name" name="coordinator_name" value={form.coordinator_name} onChange={handleChange} />
        <div className="admin-form-row">
          <FormInput label="Coordinator phone" name="coordinator_phone" value={form.coordinator_phone} onChange={handleChange} />
          <FormInput label="Coordinator email" type="email" name="coordinator_email" value={form.coordinator_email} onChange={handleChange} />
        </div>
        <ImageUploadPreview label="Event image" preview={preview} onChange={(e) => handleImage(e, "image")} />
        <ImageUploadPreview label="Banner image" preview={bannerPreview} onChange={(e) => handleImage(e, "banner")} />
        <ImageUploadPreview label="Poster image" preview={posterPreview} onChange={(e) => handleImage(e, "poster")} />
        <FormCheckbox label="Registration open" name="is_registration_open" checked={form.is_registration_open} onChange={handleChange} />
        <FormCheckbox label="Waiting list enabled when full" name="waiting_list_enabled" checked={form.waiting_list_enabled} onChange={handleChange} />
        <FormCheckbox label="Results published" name="is_result_published" checked={form.is_result_published} onChange={handleChange} />
      </AdminFormLayout>
    </>
  );
}

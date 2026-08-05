import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminFormLayout, { FormInput, FormSelect, FormTextarea, ImageUploadPreview } from "../../components/admin/AdminFormLayout";
import LoadingState from "../../components/ui/LoadingState";
import { createResult, getEvents, getResult, updateResult, mediaUrl } from "../../services/api";
import { POSITION_OPTIONS, parseApiError } from "../../utils/adminUtils";

const EMPTY = {
  event: "",
  participant_name: "",
  college_name: "",
  position: "first",
  remarks: "",
};

export default function AdminResultForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id !== "new";
  const [form, setForm] = useState(EMPTY);
  const [events, setEvents] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      getEvents(),
      isEdit ? getResult(id) : Promise.resolve(null),
    ])
      .then(([eventsRes, resultRes]) => {
        setEvents(eventsRes.data);
        if (resultRes) {
          const r = resultRes.data;
          setForm({
            event: String(r.event),
            participant_name: r.participant_name,
            college_name: r.college_name,
            position: r.position,
            remarks: r.remarks || "",
          });
          if (r.winner_photo) setPhotoPreview(mediaUrl(r.winner_photo));
        }
      })
      .catch(() => setError("Could not load form data."))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = photoFile ? new FormData() : { ...form, event: Number(form.event) };
      if (photoFile) {
        Object.entries({ ...form, event: Number(form.event) }).forEach(([k, v]) => payload.append(k, v));
        payload.append("winner_photo", photoFile);
      }
      if (isEdit) await updateResult(id, payload);
      else await createResult(payload);
      navigate("/admin/results");
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  const eventOptions = [
    { value: "", label: "Select event…" },
    ...events.map((ev) => ({ value: String(ev.id), label: ev.title })),
  ];

  if (loading) return <LoadingState message="Loading…" />;

  return (
    <>
      <Link to="/admin/results" className="back-link">← Back to results</Link>
      <AdminFormLayout
        title={isEdit ? "Edit Result" : "Add Result"}
        onSubmit={handleSubmit}
        submitting={submitting}
        error={error}
      >
        <FormSelect label="Event *" name="event" value={form.event} onChange={handleChange} options={eventOptions} required />
        <FormInput label="Participant name *" name="participant_name" value={form.participant_name} onChange={handleChange} required />
        <FormInput label="College name *" name="college_name" value={form.college_name} onChange={handleChange} required />
        <FormSelect label="Position *" name="position" value={form.position} onChange={handleChange} options={POSITION_OPTIONS} />
        <FormTextarea label="Remarks" name="remarks" value={form.remarks} onChange={handleChange} rows={3} />
        <ImageUploadPreview
          label="Winner photo"
          preview={photoPreview}
          onChange={(e) => {
            const f = e.target.files?.[0];
            setPhotoFile(f || null);
            if (f) setPhotoPreview(URL.createObjectURL(f));
          }}
        />
      </AdminFormLayout>
    </>
  );
}

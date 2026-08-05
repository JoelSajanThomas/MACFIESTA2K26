import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminFormLayout, { FormInput, ImageUploadPreview } from "../../components/admin/AdminFormLayout";
import LoadingState from "../../components/ui/LoadingState";
import { createGalleryImage, getGalleryItem, updateGalleryImage, mediaUrl } from "../../services/api";
import { parseApiError } from "../../utils/adminUtils";

export default function AdminGalleryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id !== "new";
  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    getGalleryItem(id)
      .then((res) => {
        setTitle(res.data.title);
        setPreview(mediaUrl(res.data.image) || "");
      })
      .catch(() => setError("Could not load image."))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function handleImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isEdit && !imageFile) {
      setError("Please select an image to upload.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const payload = new FormData();
      payload.append("title", title);
      if (imageFile) payload.append("image", imageFile);
      if (isEdit) await updateGalleryImage(id, payload);
      else await createGalleryImage(payload);
      navigate("/admin/gallery");
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingState message="Loading…" />;

  return (
    <>
      <Link to="/admin/gallery" className="back-link">← Back to gallery</Link>
      <AdminFormLayout title={isEdit ? "Edit Gallery Image" : "Add Gallery Image"} onSubmit={handleSubmit} submitting={submitting} error={error}>
        <FormInput label="Title *" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <ImageUploadPreview label={isEdit ? "Replace image (optional)" : "Image *"} preview={preview} onChange={handleImage} />
      </AdminFormLayout>
    </>
  );
}

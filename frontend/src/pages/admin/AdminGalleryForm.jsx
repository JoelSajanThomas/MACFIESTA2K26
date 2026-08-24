import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminFormLayout, { FormInput, FormSelect, ImageUploadPreview } from "../../components/admin/AdminFormLayout";
import LoadingState from "../../components/ui/LoadingState";
import { createGalleryImage, getGalleryItem, updateGalleryImage, mediaUrl } from "../../services/api";
import { parseApiError } from "../../utils/adminUtils";
import { addGalleryItem, updateGalleryItem as updateStoreGalleryItem, getGalleryItems } from "../../lib/galleryStore";

const CATEGORY_OPTIONS = [
  { value: "general", label: "General Festival Highlights" },
  { value: "cultural", label: "Cultural & Pro-Show" },
  { value: "technical", label: "Technical Competitions" },
  { value: "gaming", label: "Esports & Gaming" },
  { value: "pro-show", label: "Celebrity & Pro-Shows" },
];

const TYPE_OPTIONS = [
  { value: "image", label: "Image / Photo" },
  { value: "video", label: "Video / Reel (File or Video Link)" },
];

export default function AdminGalleryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id !== "new";

  const [type, setType] = useState("image");
  const [category, setCategory] = useState("general");
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;

    // Try backend API first
    getGalleryItem(id)
      .then((res) => {
        setTitle(res.data.title || "");
        setPreview(mediaUrl(res.data.image) || "");
        setType("image");
      })
      .catch(() => {
        // Fallback to local galleryStore
        const localItems = getGalleryItems();
        const found = localItems.find((i) => String(i.id) === String(id));
        if (found) {
          setTitle(found.title);
          setType(found.type || "image");
          setCategory(found.category || "general");
          if (found.type === "video") {
            setVideoUrl(found.url);
            setPreview(found.thumbnailUrl || "");
          } else {
            setPreview(found.url);
          }
        } else {
          setError("Item not found. You can create a new gallery item below.");
        }
      })
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
    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }
    if (!isEdit && type === "image" && !imageFile && !preview) {
      setError("Please select an image to upload.");
      return;
    }
    if (type === "video" && !videoUrl.trim() && !imageFile) {
      setError("Please enter a video link or upload a video file.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      if (type === "image") {
        const payload = new FormData();
        payload.append("title", title);
        if (imageFile) payload.append("image", imageFile);

        try {
          if (isEdit && !isNaN(Number(id))) {
            await updateGalleryImage(id, payload);
          } else {
            await createGalleryImage(payload);
          }
        } catch (apiErr) {
          // If backend fails, fallback gracefully to frontend galleryStore
          console.warn("Backend API upload fallback:", apiErr);
        }

        // Sync with frontend gallery store
        const imgUrl = preview || (imageFile ? URL.createObjectURL(imageFile) : "");
        if (isEdit) {
          updateStoreGalleryItem({
            id: String(id),
            type: "image",
            title,
            category,
            url: imgUrl,
            date: new Date().toISOString().split("T")[0],
            featured: true,
          });
        } else {
          addGalleryItem({
            type: "image",
            title,
            category,
            url: imgUrl,
            featured: true,
          });
        }
      } else {
        // Video item
        const finalVideoUrl = videoUrl.trim();
        const finalThumbUrl = preview || "";

        if (isEdit) {
          updateStoreGalleryItem({
            id: String(id),
            type: "video",
            title,
            category,
            url: finalVideoUrl,
            thumbnailUrl: finalThumbUrl,
            date: new Date().toISOString().split("T")[0],
            featured: true,
          });
        } else {
          addGalleryItem({
            type: "video",
            title,
            category,
            url: finalVideoUrl,
            thumbnailUrl: finalThumbUrl,
            featured: true,
          });
        }
      }

      navigate("/admin/gallery");
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingState message="Loading gallery item…" />;

  return (
    <>
      <Link to="/admin/gallery" className="back-link">← Back to gallery</Link>
      <AdminFormLayout
        title={isEdit ? "Edit Gallery Media" : "Add Gallery Image / Video"}
        subtitle="Images and videos are published instantly to the S.H.I.E.L.D. Visual Archives."
        onSubmit={handleSubmit}
        submitting={submitting}
        error={error}
      >
        <div className="admin-form-row">
          <FormSelect
            label="Media Type *"
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={TYPE_OPTIONS}
          />
          <FormSelect
            label="Category *"
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={CATEGORY_OPTIONS}
          />
        </div>

        <FormInput
          label="Title *"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Pro-Show Multiverse Night 2K26"
          required
        />

        {type === "video" ? (
          <>
            <FormInput
              label="Video URL / Embed Link *"
              name="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="e.g. https://www.youtube.com/watch?v=... or /MARVEL/Video Project 4.mp4"
              required
            />
            <ImageUploadPreview
              label="Video Cover / Poster Thumbnail (optional)"
              preview={preview}
              onChange={handleImage}
            />
          </>
        ) : (
          <ImageUploadPreview
            label={isEdit ? "Replace image (optional)" : "Upload Image *"}
            preview={preview}
            onChange={handleImage}
          />
        )}
      </AdminFormLayout>
    </>
  );
}

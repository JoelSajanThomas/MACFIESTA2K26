import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminFormLayout, { FormInput, FormTextarea, ImageUploadPreview } from "../../../components/admin/AdminFormLayout";
import LoadingState from "../../../components/ui/LoadingState";
import { createSiteSettings, getSiteSettings, mediaUrl, updateSiteSettings } from "../../../services/api";
import { invalidateSiteSettingsCache } from "../../../hooks/useSiteSettings";
import { parseApiError } from "../../../utils/adminUtils";

const EMPTY = {
  fest_name: "MacFiesta",
  fest_year: 2026,
  tagline: "",
  college_name: "MACFAST",
  hero_title: "",
  hero_subtitle: "",
  hero_description: "",
  fest_date: "",
  venue: "",
  location: "",
  contact_email: "",
  contact_phone: "",
  official_website: "",
  instagram_url: "",
  youtube_url: "",
  facebook_url: "",
  about_title: "",
  about_body: "",
  countdown_datetime: "",
  footer_copyright: "",
  footer_tagline: "",
  terms_body: "",
  privacy_body: "",
};

export default function AdminSiteSettingsForm() {
  const [form, setForm] = useState(EMPTY);
  const [settingsId, setSettingsId] = useState(null);
  const [heroFile, setHeroFile] = useState(null);
  const [aboutFile, setAboutFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [heroPreview, setHeroPreview] = useState(null);
  const [aboutPreview, setAboutPreview] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getSiteSettings()
      .then((res) => {
        if (res.data.length > 0) {
          const s = res.data[0];
          setSettingsId(s.id);
          setForm({
            fest_name: s.fest_name,
            fest_year: s.fest_year,
            tagline: s.tagline,
            college_name: s.college_name,
            hero_title: s.hero_title,
            hero_subtitle: s.hero_subtitle,
            hero_description: s.hero_description,
            fest_date: s.fest_date || "",
            venue: s.venue,
            location: s.location,
            contact_email: s.contact_email,
            contact_phone: s.contact_phone,
            official_website: s.official_website,
            instagram_url: s.instagram_url,
            youtube_url: s.youtube_url,
            facebook_url: s.facebook_url,
            about_title: s.about_title,
            about_body: s.about_body,
            countdown_datetime: s.countdown_datetime ? s.countdown_datetime.slice(0, 16) : "",
            footer_copyright: s.footer_copyright || "",
            footer_tagline: s.footer_tagline || "",
            terms_body: s.terms_body || "",
            privacy_body: s.privacy_body || "",
          });
          if (s.hero_image) setHeroPreview(mediaUrl(s.hero_image));
          if (s.about_image) setAboutPreview(mediaUrl(s.about_image));
          if (s.logo_image) setLogoPreview(mediaUrl(s.logo_image));
        }
      })
      .catch(() => setError("Could not load site settings."))
      .finally(() => setLoading(false));
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: name === "fest_year" ? Number(value) : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const useFormData = heroFile || aboutFile || logoFile;
      let payload;
      if (useFormData) {
        payload = new FormData();
        Object.entries(form).forEach(([k, v]) => payload.append(k, v ?? ""));
        if (heroFile) payload.append("hero_image", heroFile);
        if (aboutFile) payload.append("about_image", aboutFile);
        if (logoFile) payload.append("logo_image", logoFile);
      } else {
        payload = { ...form };
      }
      if (settingsId) await updateSiteSettings(settingsId, payload);
      else {
        const res = await createSiteSettings(payload);
        setSettingsId(res.data.id);
      }
      setSuccess("Site settings saved.");
      invalidateSiteSettingsCache();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingState message="Loading site settings…" />;

  return (
    <>
      <Link to="/admin/content" className="back-link">← Website content</Link>
      <AdminFormLayout title="Site Settings & Branding" subtitle="Hero, about section, contact, and social links" onSubmit={handleSubmit} submitting={submitting} error={error} success={success}>
        <FormInput label="Fest Name *" name="fest_name" value={form.fest_name} onChange={handleChange} required />
        <FormInput label="Fest Year *" name="fest_year" type="number" value={form.fest_year} onChange={handleChange} required />
        <FormInput label="Tagline" name="tagline" value={form.tagline} onChange={handleChange} />
        <FormInput label="College Name" name="college_name" value={form.college_name} onChange={handleChange} />
        <FormInput label="Hero Title" name="hero_title" value={form.hero_title} onChange={handleChange} />
        <FormInput label="Hero Subtitle" name="hero_subtitle" value={form.hero_subtitle} onChange={handleChange} />
        <FormTextarea label="Hero Description" name="hero_description" value={form.hero_description} onChange={handleChange} rows={3} />
        <FormInput label="Fest Date" name="fest_date" type="date" value={form.fest_date} onChange={handleChange} />
        <FormInput label="Countdown target" name="countdown_datetime" type="datetime-local" value={form.countdown_datetime} onChange={handleChange} />
        <FormInput label="Venue" name="venue" value={form.venue} onChange={handleChange} />
        <FormInput label="Location" name="location" value={form.location} onChange={handleChange} />
        <FormInput label="Contact Email" name="contact_email" type="email" value={form.contact_email} onChange={handleChange} />
        <FormInput label="Contact Phone" name="contact_phone" value={form.contact_phone} onChange={handleChange} />
        <FormInput label="Official Website" name="official_website" value={form.official_website} onChange={handleChange} />
        <FormInput label="Instagram URL" name="instagram_url" value={form.instagram_url} onChange={handleChange} />
        <FormInput label="YouTube URL" name="youtube_url" value={form.youtube_url} onChange={handleChange} />
        <FormInput label="Facebook URL" name="facebook_url" value={form.facebook_url} onChange={handleChange} />
        <FormInput label="About Title" name="about_title" value={form.about_title} onChange={handleChange} />
        <FormTextarea label="About Body" name="about_body" value={form.about_body} onChange={handleChange} rows={4} />
        <FormInput label="Footer copyright line" name="footer_copyright" value={form.footer_copyright} onChange={handleChange} />
        <FormInput label="Footer tagline" name="footer_tagline" value={form.footer_tagline} onChange={handleChange} />
        <FormTextarea
          label="Terms & Conditions body"
          name="terms_body"
          value={form.terms_body}
          onChange={handleChange}
          rows={10}
        />
        <FormTextarea
          label="Privacy Policy body"
          name="privacy_body"
          value={form.privacy_body}
          onChange={handleChange}
          rows={10}
        />
        <ImageUploadPreview label="Logo" preview={logoPreview} onChange={(e) => { const f = e.target.files?.[0]; setLogoFile(f || null); if (f) setLogoPreview(URL.createObjectURL(f)); }} />
        <ImageUploadPreview label="Hero Image" preview={heroPreview} onChange={(e) => { const f = e.target.files?.[0]; setHeroFile(f || null); if (f) setHeroPreview(URL.createObjectURL(f)); }} />
        <ImageUploadPreview label="About Image" preview={aboutPreview} onChange={(e) => { const f = e.target.files?.[0]; setAboutFile(f || null); if (f) setAboutPreview(URL.createObjectURL(f)); }} />
      </AdminFormLayout>
    </>
  );
}

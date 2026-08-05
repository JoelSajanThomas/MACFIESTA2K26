import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LoadingState from "../../../components/ui/LoadingState";
import ErrorState from "../../../components/ui/ErrorState";
import { getHomepageSections, updateHomepageSection } from "../../../services/api";

export default function AdminHomepageSectionsList() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

  function load() {
    setLoading(true);
    getHomepageSections(true)
      .then((res) => setSections(res.data.sort((a, b) => a.order - b.order)))
      .catch(() => setError("Could not load homepage sections."))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function handleFieldChange(id, field, value) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  }

  async function saveSection(section) {
    setSavingId(section.id);
    try {
      await updateHomepageSection(section.id, {
        title: section.title,
        subtitle: section.subtitle,
        is_visible: section.is_visible,
        order: Number(section.order),
      });
    } catch {
      setError("Could not save section.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="admin-list-page">
      <div className="admin-list-head">
        <h2>Homepage Sections</h2>
      </div>
      <Link to="/admin/content" className="back-link">← Website content</Link>
      <p className="admin-page-desc">Show or hide homepage sections and customize their headings.</p>

      {loading && <LoadingState message="Loading sections…" />}
      {error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && (
        <div className="cms-sections-list">
          {sections.map((section) => (
            <div key={section.id} className="cms-section-row detail-panel">
              <div className="cms-section-row-head">
                <strong>{section.section_key}</strong>
                <label className="admin-form-checkbox">
                  <input
                    type="checkbox"
                    checked={section.is_visible}
                    onChange={(e) => handleFieldChange(section.id, "is_visible", e.target.checked)}
                  />
                  <span>Visible on homepage</span>
                </label>
              </div>
              <label className="admin-form-field">
                Title
                <input value={section.title || ""} onChange={(e) => handleFieldChange(section.id, "title", e.target.value)} />
              </label>
              <label className="admin-form-field">
                Subtitle
                <input value={section.subtitle || ""} onChange={(e) => handleFieldChange(section.id, "subtitle", e.target.value)} />
              </label>
              <label className="admin-form-field">
                Order
                <input type="number" value={section.order} onChange={(e) => handleFieldChange(section.id, "order", e.target.value)} />
              </label>
              <button type="button" className="btn btn-gold btn-sm" disabled={savingId === section.id} onClick={() => saveSection(section)}>
                {savingId === section.id ? "Saving…" : "Save"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

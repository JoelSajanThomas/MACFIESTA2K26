import { Link } from "react-router-dom";

export default function LaunchAssetReminder() {
  return (
    <div className="admin-launch-reminder detail-panel" role="status">
      <h3>Before official launch</h3>
      <p>
        Upload official logo, hero image, sponsor logos, guest photos, and gallery images.
      </p>
      <div className="admin-launch-reminder-links">
        <Link to="/admin/content/site-settings">Site settings</Link>
        <Link to="/admin/content/sponsors">Sponsors</Link>
        <Link to="/admin/content/guests">Guest profiles</Link>
        <Link to="/admin/gallery">Gallery</Link>
        <Link to="/admin/content/theme">Theme</Link>
      </div>
    </div>
  );
}

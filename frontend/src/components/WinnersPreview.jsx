import { Link } from "react-router-dom";
import PodiumCard from "./results/PodiumCard";

export default function WinnersPreview({ results = [] }) {
  const preview = results.slice(0, 6);

  if (preview.length === 0) {
    return (
      <div className="winners-empty">
        <p>Winners will be announced as competitions conclude.</p>
        <Link to="/results" className="btn btn-outline">Check Results</Link>
      </div>
    );
  }

  return (
    <div className="winners-preview-grid">
      {preview.map((r, i) => (
        <PodiumCard key={r.id} result={r} index={i} compact />
      ))}
      <Link to="/results" className="winners-view-all">
        View all results →
      </Link>
    </div>
  );
}

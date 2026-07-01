import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { sortByPosition } from "../../utils/resultsUtils";
import PodiumCard from "./PodiumCard";

export default function EventWinnersSection({ event, results }) {
  const eventResults = results.filter((r) => r.event === event.id);

  if (!event.is_result_published && eventResults.length === 0) {
    return null;
  }

  if (eventResults.length === 0) {
    return (
      <div className="detail-panel winners-panel">
        <h3>Results</h3>
        <p className="winners-pending-msg">
          Results for this event will be published soon.
        </p>
      </div>
    );
  }

  const sorted = sortByPosition(eventResults);

  return (
    <motion.div
      className="detail-panel winners-panel"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="winners-panel-head">
        <h3>🏆 Winners</h3>
        <Link to="/results" className="winners-panel-link">All results →</Link>
      </div>
      <div className="winners-panel-grid">
        {sorted.map((r, i) => (
          <PodiumCard key={r.id} result={r} index={i} compact />
        ))}
      </div>
    </motion.div>
  );
}

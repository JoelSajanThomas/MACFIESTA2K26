import { motion } from "framer-motion";
import { formatResultDate, sortByPosition } from "../../utils/resultsUtils";
import PodiumCard from "./PodiumCard";

export default function EventResultsGroup({ group, index = 0 }) {
  const sorted = sortByPosition(group.items);
  const podiumWinners = sorted.filter((r) => r.position !== "special");
  const specialMentions = sorted.filter((r) => r.position === "special");

  const podiumOrder = ["second", "first", "third"]
    .map((pos) => podiumWinners.find((r) => r.position === pos))
    .filter(Boolean);

  const remaining = podiumWinners.filter((r) => !podiumOrder.includes(r));

  return (
    <motion.section
      className="results-event-group"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.06, duration: 0.55 }}
    >
      <header className="results-event-header">
        <div>
          <span className="event-cat-tag">{group.category}</span>
          <h2>{group.title}</h2>
        </div>
        <ul className="results-event-meta">
          <li>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {group.venue || "—"}
          </li>
          <li>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            {formatResultDate(group.date)}
          </li>
        </ul>
      </header>

      {podiumOrder.length > 0 && (
        <div className="podium-stage">
          {podiumOrder.map((r, i) => (
            <PodiumCard key={r.id} result={r} index={i} />
          ))}
        </div>
      )}

      {remaining.length > 0 && (
        <div className="podium-row">
          {remaining.map((r, i) => (
            <PodiumCard key={r.id} result={r} index={i} />
          ))}
        </div>
      )}

      {specialMentions.length > 0 && (
        <div className="special-mentions">
          <h3>Special Mentions</h3>
          <div className="podium-row">
            {specialMentions.map((r, i) => (
              <PodiumCard key={r.id} result={r} index={i} compact />
            ))}
          </div>
        </div>
      )}
    </motion.section>
  );
}

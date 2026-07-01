import { motion } from "framer-motion";
import { POSITION_META } from "../../utils/resultsUtils";

export default function PodiumCard({ result, index = 0, compact = false }) {
  const meta = POSITION_META[result.position] || POSITION_META.special;

  return (
    <motion.article
      className={`podium-card-premium ${meta.cls}${compact ? " compact" : ""}${
        result.position === "first" ? " podium-first" : ""
      }`}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      <span className="podium-rank-badge">{meta.label}</span>
      <h4>{result.participant_name}</h4>
      <p className="podium-college">{result.college_name}</p>
      {result.remarks && <p className="podium-remarks">{result.remarks}</p>}
    </motion.article>
  );
}

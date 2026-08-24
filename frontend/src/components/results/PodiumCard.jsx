import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { mediaUrl } from "../../services/api";
import { POSITION_META } from "../../utils/resultsUtils";

export default function PodiumCard({ result, index = 0, compact = false }) {
  const meta = POSITION_META[result.position] || POSITION_META.special;
  const photo = mediaUrl(result.winner_photo);

  return (
    <motion.article
      className={`podium-card-premium hall-frame ${meta.cls}${compact ? " compact" : ""}${
        result.position === "first" ? " podium-first hall-frame--gold" : ""
      }${result.position === "second" ? " hall-frame--silver" : ""}${
        result.position === "third" ? " hall-frame--bronze" : ""
      }`}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <span className="podium-rank-badge">{meta.label}</span>
      {photo && (
        <img src={photo} alt="" className="podium-winner-photo" loading="lazy" decoding="async" />
      )}
      <h4>{result.participant_name}</h4>
      <p className="podium-college">{result.college_name}</p>
      {result.remarks && <p className="podium-remarks">{result.remarks}</p>}
      {result.id && (
        <Link to={`/certificates/${result.id}`} className="btn btn-card btn-sm podium-cert-link">
          Certificate
        </Link>
      )}
    </motion.article>
  );
}

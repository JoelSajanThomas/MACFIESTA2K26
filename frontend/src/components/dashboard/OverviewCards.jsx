import { motion } from "framer-motion";

const CARDS = [
  { key: "total_events", label: "Total Events", icon: "📅" },
  { key: "total_registrations", label: "Total Registrations", icon: "👥" },
  { key: "total_results", label: "Total Results", icon: "🏆" },
  { key: "total_gallery_images", label: "Gallery Photos", icon: "📷" },
];

export default function OverviewCards({ stats }) {
  return (
    <div className="dash-overview-grid">
      {CARDS.map((card, i) => (
        <motion.div
          key={card.key}
          className="dash-stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
        >
          <span className="dash-stat-icon">{card.icon}</span>
          <span className="dash-stat-value">{stats?.[card.key] ?? 0}</span>
          <span className="dash-stat-label">{card.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

import { motion } from "framer-motion";

const PRIMARY = [
  { key: "total_registrations", label: "Total Registrations", icon: "👥" },
  { key: "attended", label: "Attended", icon: "✓" },
  { key: "not_attended", label: "Not Attended", icon: "○" },
  { key: "approval_pending", label: "Pending Approval", icon: "⏳" },
];

const SECONDARY = [
  { key: "total_events", label: "Events", icon: "📅" },
  { key: "total_results", label: "Results", icon: "🏆" },
  { key: "total_gallery_images", label: "Gallery", icon: "📷" },
];

export default function InsightsCards({ stats }) {
  const payment = stats?.payment_summary || {};

  return (
    <>
      <div className="dash-overview-grid">
        {PRIMARY.map((card, i) => (
          <motion.div
            key={card.key}
            className="dash-stat-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <span className="dash-stat-icon">{card.icon}</span>
            <span className="dash-stat-value">{stats?.[card.key] ?? 0}</span>
            <span className="dash-stat-label">{card.label}</span>
          </motion.div>
        ))}
      </div>

      <div className="dash-overview-grid dash-overview-grid-secondary">
        {SECONDARY.map((card, i) => (
          <motion.div
            key={card.key}
            className="dash-stat-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.06 }}
          >
            <span className="dash-stat-icon">{card.icon}</span>
            <span className="dash-stat-value">{stats?.[card.key] ?? 0}</span>
            <span className="dash-stat-label">{card.label}</span>
          </motion.div>
        ))}
      </div>

      <div className="insights-payment-grid">
        <h3 className="insights-subtitle">Payment Summary</h3>
        <div className="insights-payment-cards">
          {["paid", "pending", "failed", "refunded"].map((key) => (
            <div key={key} className="insights-payment-card">
              <span className="insights-payment-value">{payment[key] ?? 0}</span>
              <span className="insights-payment-label">{key}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

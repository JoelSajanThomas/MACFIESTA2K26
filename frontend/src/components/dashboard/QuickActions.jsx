import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { QUICK_ACTIONS } from "./dashboardUtils";

export default function QuickActions() {
  return (
    <div className="dash-actions-grid">
      {QUICK_ACTIONS.map((action, i) => (
        <motion.div
          key={action.title}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
        >
          {action.external ? (
            <a
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              className="dash-action-card"
            >
              <span className="dash-action-icon">{action.icon}</span>
              <strong>{action.title}</strong>
              <p>{action.desc}</p>
            </a>
          ) : (
            <Link to={action.href} className="dash-action-card">
              <span className="dash-action-icon">{action.icon}</span>
              <strong>{action.title}</strong>
              <p>{action.desc}</p>
            </Link>
          )}
        </motion.div>
      ))}
    </div>
  );
}

import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

/**
 * Snappy, high-performance page transition without blocking unmount lag.
 */
export default function PageTransition({ children, disabled = false }) {
  const { pathname } = useLocation();

  if (disabled) return children;

  return (
    <motion.div
      key={pathname}
      className="mf1-page-transition"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}


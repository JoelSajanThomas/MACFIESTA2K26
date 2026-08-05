import { useMemo } from "react";
import { motion } from "framer-motion";
import { useMotionPrefs } from "../hooks/useMotionPrefs";
import {
  buildAdminFade,
  buildFadeUp,
  buildScaleIn,
} from "../utils/animations";

const VARIANT_BUILDERS = {
  default: buildFadeUp,
  scale: buildScaleIn,
  admin: buildAdminFade,
};

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  variant = "default",
}) {
  const prefs = useMotionPrefs();
  const variants = useMemo(
    () => VARIANT_BUILDERS[variant]?.(prefs) ?? buildFadeUp(prefs),
    [prefs, variant],
  );

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      custom={delay}
    >
      {children}
    </motion.div>
  );
}

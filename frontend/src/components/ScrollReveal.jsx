import { forwardRef, useMemo } from "react";
import { motion } from "framer-motion";
import { useMotionPrefs } from "../hooks/useMotionPrefs";
import {
  buildAdminFade,
  buildFadeUp,
  buildScaleIn,
  buildSlideX,
} from "../utils/animations";

const VARIANT_BUILDERS = {
  default: buildFadeUp,
  scale: buildScaleIn,
  admin: buildAdminFade,
  left: (prefs) => buildSlideX(prefs, -1),
  right: (prefs) => buildSlideX(prefs, 1),
};

const ScrollReveal = forwardRef(function ScrollReveal(
  {
    children,
    className = "",
    delay = 0,
    variant = "default",
  },
  ref
) {
  const prefs = useMotionPrefs();
  const variants = useMemo(
    () => VARIANT_BUILDERS[variant]?.(prefs) ?? buildFadeUp(prefs),
    [prefs, variant],
  );

  return (
    <motion.div
      ref={ref}
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
});

export default ScrollReveal;

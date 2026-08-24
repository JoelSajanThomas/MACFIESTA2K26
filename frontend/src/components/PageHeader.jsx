import { useMemo } from "react";
import { motion } from "framer-motion";
import { usePageSeo } from "../hooks/usePageSeo";
import { useMotionPrefs } from "../hooks/useMotionPrefs";
import { buildPageHeaderSequence } from "../utils/animations";

/** MACFIESTA1 page banner — badge + split title + divider. */
export default function PageHeader({
  eyebrow,
  title,
  titleAccent,
  subtitle,
  image,
  seoDescription,
}) {
  const titleId = "page-header-title";
  const prefs = useMotionPrefs();
  const headerMotion = useMemo(() => buildPageHeaderSequence(prefs), [prefs]);

  const titleText = typeof title === "string" ? title : "";
  const parts =
    !titleAccent && titleText.includes(" ")
      ? (() => {
          const i = titleText.lastIndexOf(" ");
          return { lead: titleText.slice(0, i), accent: titleText.slice(i + 1) };
        })()
      : { lead: titleText, accent: titleAccent || "" };

  usePageSeo({
    title: titleAccent ? `${title} ${titleAccent}` : title,
    description: seoDescription || subtitle,
    image: image || undefined,
  });

  return (
    <section
      className="page-header mf-cinematic-header mf1-page-header"
      role="banner"
      aria-labelledby={titleId}
      style={image ? { "--page-header-bg": `url(${image})` } : undefined}
    >
      <div className="page-header-overlay" aria-hidden="true" />
      <div className="mf-page-header-grid" aria-hidden="true" />
      <div className="mf1-page-header__orbs" aria-hidden="true" />
      <motion.div
        className="container page-header-content mf1-page-header__content"
        variants={headerMotion.container}
        initial="hidden"
        animate="visible"
      >
        {eyebrow && (
          <motion.span className="mf1-section-badge" variants={headerMotion.item}>
            {eyebrow}
          </motion.span>
        )}
        <motion.h1 id={titleId} variants={headerMotion.item} className="mf1-page-header__title">
          <span className="shimmer-text">{parts.lead}</span>
          {parts.accent ? (
            <>
              {" "}
              <span className="gradient-text-gold">{parts.accent}</span>
            </>
          ) : null}
        </motion.h1>
        <motion.div className="mf1-section-divider" aria-hidden="true" variants={headerMotion.item} />
        {subtitle && (
          <motion.p variants={headerMotion.item} className="mf1-page-header__sub">
            {subtitle}
          </motion.p>
        )}
      </motion.div>
    </section>
  );
}

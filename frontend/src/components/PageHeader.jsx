import { useMemo } from "react";

import { motion } from "framer-motion";

import { usePageSeo } from "../hooks/usePageSeo";

import { useMotionPrefs } from "../hooks/useMotionPrefs";

import { buildPageHeaderSequence } from "../utils/animations";



export default function PageHeader({ eyebrow, title, subtitle, image, seoDescription }) {

  const titleId = "page-header-title";

  const prefs = useMotionPrefs();

  const headerMotion = useMemo(() => buildPageHeaderSequence(prefs), [prefs]);



  usePageSeo({

    title,

    description: seoDescription || subtitle,

    image: image || undefined,

  });



  return (

    <section

      className="page-header"

      role="banner"

      aria-labelledby={titleId}

      style={image ? { "--page-header-bg": `url(${image})` } : undefined}

    >

      <div className="page-header-overlay" aria-hidden="true" />

      <motion.div

        className="container page-header-content"

        variants={headerMotion.container}

        initial="hidden"

        animate="visible"

      >

        {eyebrow && (

          <motion.span className="section-eyebrow" variants={headerMotion.item}>

            {eyebrow}

          </motion.span>

        )}

        <motion.h1 id={titleId} variants={headerMotion.item}>{title}</motion.h1>

        {subtitle && <motion.p variants={headerMotion.item}>{subtitle}</motion.p>}

      </motion.div>

    </section>

  );

}



/** MacFiesta Pro — shared motion tokens (ms unless noted) */
export const EASE_PREMIUM = [0.22, 1, 0.36, 1];
export const EASE_OUT = [0, 0, 0.2, 1];

export const MOTION = {
  hover: 0.2,
  cardHover: 0.22,
  reveal: 0.55,
  revealMobile: 0.42,
  stagger: 0.09,
  hero: 0.8,
  heroStagger: 0.1,
  modal: 0.22,
  digit: 0.18,
  admin: 0.32,
};

export function getMotionPrefs() {
  if (typeof window === "undefined") {
    return { reduced: false, mobile: false };
  }
  return {
    reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    mobile: window.matchMedia("(max-width: 768px)").matches,
  };
}

export function getRevealTransition(prefs, delayIndex = 0) {
  if (prefs?.reduced) {
    return { duration: 0.01, delay: 0 };
  }
  const duration = prefs?.mobile ? MOTION.revealMobile : MOTION.reveal;
  const stagger = prefs?.mobile ? 0.06 : MOTION.stagger;
  return {
    duration,
    delay: delayIndex * stagger,
    ease: EASE_PREMIUM,
  };
}

export function getRevealOffset(prefs) {
  if (prefs?.reduced) return 0;
  return prefs?.mobile ? 10 : 16;
}

export function buildFadeUp(prefs) {
  const y = getRevealOffset(prefs);
  return {
    hidden: { opacity: 0, y },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: getRevealTransition(prefs, i),
    }),
  };
}

export function buildScaleIn(prefs) {
  const scaleFrom = prefs?.reduced ? 1 : 1.03;
  return {
    hidden: { opacity: 0, scale: scaleFrom },
    visible: (i = 0) => ({
      opacity: 1,
      scale: 1,
      transition: getRevealTransition(prefs, i),
    }),
  };
}

export function buildAdminFade(prefs) {
  if (prefs?.reduced) {
    return {
      hidden: { opacity: 1 },
      visible: { opacity: 1 },
    };
  }
  return {
    hidden: { opacity: 0 },
    visible: (i = 0) => ({
      opacity: 1,
      transition: {
        duration: MOTION.admin,
        delay: i * 0.05,
        ease: EASE_OUT,
      },
    }),
  };
}

export function buildHeroSequence(prefs) {
  if (prefs?.reduced) {
    return {
      container: { visible: { transition: { staggerChildren: 0 } } },
      item: { hidden: { opacity: 1 }, visible: { opacity: 1 } },
    };
  }
  const duration = prefs?.mobile ? 0.65 : MOTION.hero;
  const stagger = prefs?.mobile ? 0.07 : MOTION.heroStagger;
  return {
    container: {
      hidden: {},
      visible: { transition: { staggerChildren: stagger, delayChildren: 0.08 } },
    },
    item: {
      hidden: { opacity: 0, y: prefs?.mobile ? 12 : 18 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration, ease: EASE_PREMIUM },
      },
    },
  };
}

export function buildPageHeaderSequence(prefs) {
  if (prefs?.reduced) {
    return {
      container: { visible: {} },
      item: { hidden: { opacity: 1 }, visible: { opacity: 1 } },
    };
  }
  return {
    container: {
      hidden: {},
      visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
    },
    item: {
      hidden: { opacity: 0, y: prefs?.mobile ? 8 : 12 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: prefs?.mobile ? 0.45 : 0.55,
          ease: EASE_PREMIUM,
        },
      },
    },
  };
}

export const fadeUp = buildFadeUp(getMotionPrefs());
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.55, ease: EASE_PREMIUM } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 1.03 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.55, ease: EASE_PREMIUM },
  },
};

export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: MOTION.stagger } },
};

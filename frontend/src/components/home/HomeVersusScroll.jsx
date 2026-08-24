import { useState } from "react";
import { REF_UI } from "../../utils/assets";
import { BRAND } from "../../utils/brand";
import { useElementScrollProgress } from "../../hooks/useScrollProgress";
import { useMotionPrefs } from "../../hooks/useMotionPrefs";

/**
 * Sticky Marvel vs DC clash — panels collide as the user scrolls.
 */
export default function HomeVersusScroll() {
  const [pinEl, setPinEl] = useState(null);
  const prefs = useMotionPrefs();
  const live = useElementScrollProgress(pinEl);
  const p = prefs.reduced ? 1 : live;

  const marvelX = (1 - p) * -42;
  const dcX = (1 - p) * 42;
  const vsScale = 0.55 + p * 0.45;
  const vsGlow = 0.25 + p * 0.75;
  const copyOpacity = 0.72 + p * 0.28;

  return (
    <section
      ref={setPinEl}
      className="mvd-scroll"
      aria-labelledby="mvd-scroll-title"
    >
      <div className="mvd-scroll__sticky">
        <div className="mvd-scroll__split" aria-hidden="true">
          <div
            className="mvd-scroll__panel mvd-scroll__panel--marvel"
            style={{ transform: `translate3d(${marvelX}%, 0, 0)` }}
          >
            <img src={REF_UI.heroScarletOrbit} alt="" />
            <div className="mvd-scroll__panel-veil" />
            <p className="mvd-scroll__universe">Marvel</p>
          </div>
          <div
            className="mvd-scroll__panel mvd-scroll__panel--dc"
            style={{ transform: `translate3d(${dcX}%, 0, 0)` }}
          >
            <img src={REF_UI.heroCobaltVigil} alt="" />
            <div className="mvd-scroll__panel-veil" />
            <p className="mvd-scroll__universe">DC</p>
          </div>
        </div>

        <div
          className="mvd-scroll__vs"
          style={{
            transform: `translate(-50%, -50%) scale(${vsScale})`,
            opacity: vsGlow,
          }}
          aria-hidden="true"
        >
          VS
        </div>

        <div className="mvd-scroll__copy" style={{ opacity: copyOpacity }}>
          <p className="mvd-scroll__eyebrow">Official fest theme</p>
          <h2 id="mvd-scroll-title" className="mvd-scroll__title">
            {BRAND.festNameUpper} {BRAND.festYear}
          </h2>
          <p className="mvd-scroll__versus-line">
            <span className="mvd-scroll__red">Marvel</span>
            <span className="mvd-scroll__gold"> versus </span>
            <span className="mvd-scroll__blue">DC</span>
          </p>
          <p className="mvd-scroll__tag">{BRAND.altTagline}</p>
          <p className="mvd-scroll__hint">Scroll to clash the universes</p>
        </div>
      </div>
    </section>
  );
}

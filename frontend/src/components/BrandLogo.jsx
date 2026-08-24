import { useState } from "react";
import { Link } from "react-router-dom";
import { BRAND } from "../utils/brand";

const LOGO = BRAND.logo.src;

const VARIANTS = {
  mark: { src: LOGO, showText: false, className: "brand-logo-mark" },
  lockup: { src: LOGO, showText: false, className: "brand-logo-lockup" },
  footer: { src: LOGO, showText: false, className: "brand-logo-footer" },
  default: { src: LOGO, showText: false, className: "" },
};

/**
 * Official MacFiesta crest only — no alternate logos.
 */
export default function BrandLogo({ variant = "default", showText, className = "", onClick }) {
  const [imgError, setImgError] = useState(false);
  const config = VARIANTS[variant] || VARIANTS.default;
  const displayText = showText ?? config.showText;
  const showFallback = imgError || !config.src;

  return (
    <Link
      to="/"
      className={`brand-logo brand-logo--crest ${config.className} ${className}`.trim()}
      aria-label={`${BRAND.festName} home`}
      onClick={onClick}
    >
      {!showFallback && (
        <img
          src={config.src}
          alt={BRAND.logo.alt}
          className="brand-logo-img"
          width={variant === "lockup" || variant === "footer" ? 160 : 62}
          height={variant === "lockup" || variant === "footer" ? 160 : 62}
          loading="eager"
          decoding="async"
          onError={() => setImgError(true)}
        />
      )}
      <span
        className={`brand-logo-fallback${showFallback ? " visible" : ""}`}
        aria-hidden={!showFallback}
      >
        {BRAND.logo.initials}
      </span>
      {displayText && (
        <span className="brand-logo-text">
          {BRAND.logo.text}
          <span className="logo-accent"> {BRAND.year}</span>
        </span>
      )}
    </Link>
  );
}

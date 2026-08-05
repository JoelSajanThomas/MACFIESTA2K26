import { useState } from "react";
import { Link } from "react-router-dom";
import { BRAND } from "../utils/brand";
import { useSiteSettings } from "../hooks/useSiteSettings";

const VARIANTS = {
  mark: { src: BRAND.logo.mark, showText: false, className: "brand-logo-mark" },
  lockup: { src: BRAND.logo.lockup, showText: false, className: "brand-logo-lockup" },
  footer: { src: BRAND.logo.footer, showText: false, className: "brand-logo-footer" },
  default: { src: BRAND.logo.mark, showText: false, className: "" },
};

export default function BrandLogo({ variant = "default", showText, className = "", onClick }) {
  const settings = useSiteSettings();
  const [imgError, setImgError] = useState(false);
  const config = VARIANTS[variant] || VARIANTS.default;
  const displayText = showText ?? config.showText;
  const logoSrc = settings?.logo_image_url || config.src;
  const showFallback = imgError || !logoSrc;

  return (
    <Link
      to="/"
      className={`brand-logo ${config.className} ${className}`.trim()}
      aria-label={`${BRAND.festName} home`}
      onClick={onClick}
    >
      {!showFallback && (
        <img
          src={logoSrc}
          alt={BRAND.logo.alt}
          className="brand-logo-img"
          width={variant === "lockup" ? 220 : 36}
          height={variant === "lockup" ? 44 : 36}
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

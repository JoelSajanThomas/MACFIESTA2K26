import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { BRAND } from "../utils/brand";

const SITE_NAME = "MacFiesta Pro";
const DEFAULT_DESC =
  "MACFAST national inter-college fest — events, registration, schedule, results, gallery, and announcements.";
const DEFAULT_IMAGE = "/logo.png";

function upsertMeta(selector, attr, key, value) {
  if (!value) return;
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function upsertCanonical(href) {
  if (!href) return;
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function removeJsonLd(id) {
  document.getElementById(id)?.remove();
}

export function usePageSeo({
  title,
  description = DEFAULT_DESC,
  image = DEFAULT_IMAGE,
  type = "website",
  jsonLd = null,
  jsonLdId = "page-jsonld",
}) {
  const { pathname } = useLocation();

  const jsonLdKey = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    const pageTitle = title ? `${title} · ${SITE_NAME}` : `${BRAND.festName} ${BRAND.festYear} · ${SITE_NAME}`;
    const origin = window.location.origin;
    const url = `${origin}${pathname}`;
    const resolvedImage = image ?? DEFAULT_IMAGE;
    const imageUrl = resolvedImage.startsWith("http") ? resolvedImage : `${origin}${resolvedImage}`;

    document.title = pageTitle;
    upsertMeta('meta[name="description"]', "name", "description", description);
    upsertMeta('meta[property="og:title"]', "property", "og:title", pageTitle);
    upsertMeta('meta[property="og:description"]', "property", "og:description", description);
    upsertMeta('meta[property="og:type"]', "property", "og:type", type);
    upsertMeta('meta[property="og:url"]', "property", "og:url", url);
    upsertMeta('meta[property="og:image"]', "property", "og:image", imageUrl);
    upsertMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", pageTitle);
    upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    upsertMeta('meta[name="twitter:image"]', "name", "twitter:image", imageUrl);
    upsertCanonical(url);

    removeJsonLd(jsonLdId);
    if (jsonLdKey) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = jsonLdId;
      script.textContent = jsonLdKey;
      document.head.appendChild(script);
    }

    return () => removeJsonLd(jsonLdId);
  }, [title, description, image, type, pathname, jsonLdKey, jsonLdId]);
}

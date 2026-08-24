import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { usePageScrollProgress } from "../hooks/useScrollProgress";

/**
 * Public-only: marks sections as they enter view so CSS can animate them.
 * Admin desks are skipped.
 */
export default function ScrollDirector() {
  const { pathname } = useLocation();
  usePageScrollProgress();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return undefined;
    const root = document.querySelector(".main-content");
    if (!root) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nodes = [...root.querySelectorAll("section")];

    if (reduced) {
      nodes.forEach((n) => n.classList.add("is-scroll-in"));
      return undefined;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-scroll-in");
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -10% 0px" }
    );

    nodes.forEach((node, i) => {
      node.classList.add("mvd-scroll-section");
      const skip =
        i === 0 ||
        node.classList.contains("mf1-hero") ||
        node.classList.contains("ref-hero") ||
        node.classList.contains("page-header") ||
        node.classList.contains("mf1-page-header") ||
        node.classList.contains("mvd-scroll");
      if (skip) node.classList.add("is-scroll-in");
      io.observe(node);
    });

    return () => io.disconnect();
  }, [pathname]);

  return null;
}

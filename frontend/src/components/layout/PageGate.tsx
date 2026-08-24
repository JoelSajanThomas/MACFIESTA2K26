"use client";

import { useLoading } from "@/providers/LoadingProvider";

/**
 * PageGate — hides the page content (Navbar + children + Footer)
 * until the LoadingScreen has fully finished / been dismissed.
 *
 * Uses `visibility: hidden` + `pointer-events: none` so the DOM is
 * still rendered (no hydration mismatch) but completely invisible to
 * the user until `isDone` becomes true.
 */
export function PageGate({ children }: { children: React.ReactNode }) {
  const { isDone } = useLoading();

  return (
    <div
      style={{
        visibility: isDone ? "visible" : "hidden",
        pointerEvents: isDone ? "auto" : "none",
        // Smooth reveal: fade in once the loading screen exits
        opacity: isDone ? 1 : 0,
        transition: "opacity 0.4s ease 0.1s",
      }}
    >
      {children}
    </div>
  );
}

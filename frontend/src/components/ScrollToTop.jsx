import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { resetWindowScroll } from "../utils/scrollReset";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    resetWindowScroll();

    // After mobile menu unlock / layout settle (overflow:hidden removal).
    const frame = requestAnimationFrame(() => {
      resetWindowScroll();
    });

    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}

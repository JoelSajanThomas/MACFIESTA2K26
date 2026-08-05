import { useEffect, useState } from "react";
import { getMotionPrefs } from "../utils/animations";

export function useMotionPrefs() {
  const [prefs, setPrefs] = useState(getMotionPrefs);

  useEffect(() => {
    const reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileMq = window.matchMedia("(max-width: 768px)");

    function update() {
      setPrefs(getMotionPrefs());
    }

    reducedMq.addEventListener("change", update);
    mobileMq.addEventListener("change", update);
    return () => {
      reducedMq.removeEventListener("change", update);
      mobileMq.removeEventListener("change", update);
    };
  }, []);

  return prefs;
}

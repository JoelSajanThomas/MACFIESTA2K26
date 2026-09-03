import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { initCapacitorShell } from "./utils/capacitorShell";

// ─── Security: Suppress all console output in production ───────────────────
// Prevents passwords, tokens, and internal state from leaking via DevTools.
if (import.meta.env.PROD) {
  const noop = () => {};
  [
    "log", "debug", "info", "warn", "error",
    "table", "dir", "dirxml", "trace",
    "group", "groupCollapsed", "groupEnd",
    "time", "timeEnd", "timeLog",
    "count", "countReset", "assert",
  ].forEach((method) => {
    // @ts-ignore
    console[method] = noop;
  });
}

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

initCapacitorShell();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

import { Capacitor } from "@capacitor/core";

const STATUS_BAR_COLOR = "#04040f";

/** Native shell setup: status bar + body classes for safe-area CSS. No-op in browser. */
export async function initCapacitorShell() {
  if (!Capacitor.isNativePlatform()) return;

  const { documentElement: html, body } = document;
  html.classList.add("capacitor-native");
  body.classList.add("capacitor-native");

  const platform = Capacitor.getPlatform();
  if (platform === "android") body.classList.add("capacitor-android");
  if (platform === "ios") body.classList.add("capacitor-ios");

  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setBackgroundColor({ color: STATUS_BAR_COLOR });
    await StatusBar.setStyle({ style: Style.Dark });
    body.classList.add("capacitor-status-inset");
  } catch {
    if (platform === "android") {
      body.classList.add("status-bar-fallback");
    }
  }
}

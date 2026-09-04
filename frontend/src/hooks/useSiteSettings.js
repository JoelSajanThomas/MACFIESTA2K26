import { useEffect, useState } from "react";
import { getSiteSettings } from "../services/api";
import { resolveSiteSettings } from "../utils/cmsUtils";

let cachedSettings = resolveSiteSettings([]);
let loadPromise = null;

export function loadSiteSettings() {
  if (loadPromise) return loadPromise;
  if (!loadPromise) {
    loadPromise = getSiteSettings()
      .then((res) => {
        cachedSettings = resolveSiteSettings(res.data);
        return cachedSettings;
      })
      .catch(() => {
        cachedSettings = resolveSiteSettings([]);
        return cachedSettings;
      });
  }
  return loadPromise;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState(cachedSettings);

  useEffect(() => {
    loadSiteSettings().then(setSettings);
  }, []);

  return settings;
}

export function invalidateSiteSettingsCache() {
  cachedSettings = null;
  loadPromise = null;
}

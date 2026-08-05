import { useEffect, useMemo, useState } from "react";
import Hero from "../components/Hero";
import FestRewind from "../components/FestRewind";
import HomeWelcome from "../components/home/HomeWelcome";
import HomeEventTypes from "../components/home/HomeEventTypes";
import HomeTheme from "../components/home/HomeTheme";
import HomeGuest from "../components/home/HomeGuest";
import HomeSponsors from "../components/home/HomeSponsors";
import HomeGallery from "../components/home/HomeGallery";
import { usePageSeo } from "../hooks/usePageSeo";
import { BRAND } from "../utils/brand";
import { normalizeGalleryItems } from "../utils/galleryUtils";
import {
  resolveSiteSettings,
  resolveEventFormats,
  resolveGuestProfiles,
  resolveThemeSection,
  resolveSponsors,
  resolveHomepageSections,
  isSectionVisible,
  resolveFestRewind,
} from "../utils/cmsUtils";
import {
  getGallery,
  getSiteSettings,
  getEventFormats,
  getGuestProfiles,
  getThemeSections,
  getSponsors,
  getHomepageSections,
  getFestRewindItems,
} from "../services/api";

export default function Home() {
  const [gallery, setGallery] = useState([]);
  const [cmsRaw, setCmsRaw] = useState({});

  useEffect(() => {
    let mounted = true;
    Promise.all([
      getGallery().catch(() => ({ data: [] })),
      getSiteSettings().catch(() => ({ data: [] })),
      getEventFormats().catch(() => ({ data: [] })),
      getGuestProfiles().catch(() => ({ data: [] })),
      getThemeSections().catch(() => ({ data: [] })),
      getSponsors().catch(() => ({ data: [] })),
      getHomepageSections().catch(() => ({ data: [] })),
      getFestRewindItems().catch(() => ({ data: [] })),
    ]).then(([g, site, fmt, guests, theme, sponsors, sections, rewind]) => {
      if (!mounted) return;
      setGallery(g.data);
      setCmsRaw({
        site: site.data,
        formats: fmt.data,
        guests: guests.data,
        theme: theme.data,
        sponsors: sponsors.data,
        sections: sections.data,
        rewind: rewind.data,
      });
    });
    return () => {
      mounted = false;
    };
  }, []);

  const siteSettings = useMemo(() => resolveSiteSettings(cmsRaw.site), [cmsRaw.site]);
  const formats = useMemo(() => resolveEventFormats(cmsRaw.formats), [cmsRaw.formats]);
  const guests = useMemo(() => resolveGuestProfiles(cmsRaw.guests), [cmsRaw.guests]);
  const theme = useMemo(() => resolveThemeSection(cmsRaw.theme), [cmsRaw.theme]);
  const sponsors = useMemo(() => resolveSponsors(cmsRaw.sponsors), [cmsRaw.sponsors]);
  const sectionsMap = useMemo(() => resolveHomepageSections(cmsRaw.sections), [cmsRaw.sections]);
  const rewindItems = useMemo(() => resolveFestRewind(cmsRaw.rewind), [cmsRaw.rewind]);
  const galleryItems = useMemo(
    () => normalizeGalleryItems(gallery, gallery.length === 0),
    [gallery]
  );

  const show = (key, defaultVisible = true) => isSectionVisible(sectionsMap, key, defaultVisible);

  const homeJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Event",
      name: `${siteSettings.fest_name || BRAND.festName} ${siteSettings.fest_year || BRAND.festYear}`,
      description: siteSettings.tagline || BRAND.tagline,
      startDate: siteSettings.fest_date,
      location: {
        "@type": "Place",
        name: siteSettings.venue || BRAND.venue,
        address: siteSettings.location || BRAND.location,
      },
      organizer: {
        "@type": "Organization",
        name: siteSettings.college_name || BRAND.collegeName,
      },
    }),
    [
      siteSettings.fest_name,
      siteSettings.fest_year,
      siteSettings.tagline,
      siteSettings.fest_date,
      siteSettings.venue,
      siteSettings.location,
      siteSettings.college_name,
    ]
  );

  usePageSeo({
    title: `${siteSettings.fest_name || BRAND.festName} ${siteSettings.fest_year || BRAND.festYear}`,
    description: siteSettings.hero_subtitle || siteSettings.tagline || BRAND.tagline,
    image: siteSettings.hero_image_url,
    jsonLd: homeJsonLd,
  });

  return (
    <div className="home-page home-classic">
      {show("hero") && <Hero settings={siteSettings} />}
      {show("about") && <HomeWelcome settings={siteSettings} />}
      {show("formats") && <HomeEventTypes formats={formats} />}
      {show("theme") && <HomeTheme theme={theme} />}
      {show("guests") && <HomeGuest guests={guests} />}
      {show("rewind") && <FestRewind items={rewindItems} />}
      {show("sponsors") && <HomeSponsors sponsors={sponsors} />}
      {show("gallery") && <HomeGallery items={galleryItems} />}
    </div>
  );
}

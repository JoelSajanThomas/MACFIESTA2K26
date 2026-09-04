import { useState, useEffect } from "react";
import { Marvel3DScrollCanvas } from "../components/three/Marvel3DScrollCanvas";
import { HeroSection } from "../components/hero/HeroSection";
import { AboutFestival } from "../components/home/AboutFestival";
import { FeaturedEvents } from "../components/home/FeaturedEvents";
import { InfinityChallenge } from "../components/home/InfinityChallenge";
import { ChiefGuestsSection } from "../components/home/ChiefGuestsSection";
import { MarvelTimeline } from "../components/home/MarvelTimeline";
import { SchedulePreview } from "../components/home/SchedulePreview";
import { SponsorsSection } from "../components/home/SponsorsSection";
import { GalleryPreview } from "../components/home/GalleryPreview";
import { TestimonialsSection } from "../components/home/TestimonialsSection";
import { RegistrationCTA } from "../components/home/RegistrationCTA";
import { ScrollRevealWrapper } from "../components/ui/ScrollRevealWrapper";
import { usePageSeo } from "../hooks/usePageSeo";
import { getHomepageSections } from "../services/api";

export default function Home() {
  usePageSeo({
    title: "MACFiESTA 2026 | MACFAST — National Level Fest",
    description: "MacFiesta 2026 national collegiate festival at MACFAST — Marvel Universe Theme, 24–25 Sep 2026.",
  });

  const [sectionConfigs, setSectionConfigs] = useState({});

  useEffect(() => {
    getHomepageSections()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        const map = {};
        list.forEach((item) => {
          if (item.section_key) {
            map[item.section_key] = item.is_visible;
          }
        });
        setSectionConfigs(map);
      })
      .catch(() => {});
  }, []);

  const isVisible = (key) => {
    return sectionConfigs[key] !== false;
  };

  return (
    <div className="relative w-full bg-transparent overflow-hidden min-h-screen">

      {/* ─── 3D Marvel Frame-by-Frame Scroll Engine Background ─── */}
      <Marvel3DScrollCanvas initialSequence="frames" showHud={false} />

      {/* ─── 01. Hero Section ─── */}
      {isVisible("hero") && (
        <ScrollRevealWrapper id="hero" enable3DTilt={false} laserColor="cyan" className="relative z-10">
          <HeroSection />
        </ScrollRevealWrapper>
      )}

      {/* ─── 02. About Festival Briefing ─── */}
      {isVisible("about") && (
        <ScrollRevealWrapper id="about" laserColor="red">
          <AboutFestival />
        </ScrollRevealWrapper>
      )}

      {/* ─── 03. Featured Missions ─── */}
      {isVisible("events") && (
        <ScrollRevealWrapper id="events" laserColor="cyan">
          <FeaturedEvents />
        </ScrollRevealWrapper>
      )}

      {/* ─── 04. Infinity Gauntlet Challenge ─── */}
      {isVisible("infinity") && (
        <ScrollRevealWrapper id="infinity" laserColor="gold">
          <InfinityChallenge />
        </ScrollRevealWrapper>
      )}

      {/* ─── 05. Marvel Mission Timeline ─── */}
      {isVisible("timeline") && (
        <ScrollRevealWrapper id="timeline" laserColor="purple">
          <MarvelTimeline />
        </ScrollRevealWrapper>
      )}

      {/* ─── 06. Schedule Preview ─── */}
      {isVisible("schedule") && (
        <ScrollRevealWrapper id="schedule" laserColor="gold">
          <SchedulePreview />
        </ScrollRevealWrapper>
      )}

      {/* ─── 07. Sponsors & Alliances ─── */}
      {isVisible("sponsors") && (
        <ScrollRevealWrapper id="sponsors" laserColor="cyan">
          <SponsorsSection />
        </ScrollRevealWrapper>
      )}

      {/* ─── 08. Honored Chief Guests & VIPs (Under Sponsors) ─── */}
      {isVisible("guests") && (
        <ScrollRevealWrapper id="guests" laserColor="gold">
          <ChiefGuestsSection />
        </ScrollRevealWrapper>
      )}

      {/* ─── 09. Gallery Archives ─── */}
      {isVisible("gallery") && (
        <ScrollRevealWrapper id="gallery" laserColor="purple">
          <GalleryPreview />
        </ScrollRevealWrapper>
      )}

      {/* ─── 10. Testimonials & Agent Reviews ─── */}
      {isVisible("testimonials") && (
        <ScrollRevealWrapper id="testimonials" laserColor="gold">
          <TestimonialsSection />
        </ScrollRevealWrapper>
      )}

      {/* ─── 11. Legends Cup Registration CTA ─── */}
      {isVisible("cta") && (
        <ScrollRevealWrapper id="cta" enable3DTilt={false} laserColor="red">
          <RegistrationCTA />
        </ScrollRevealWrapper>
      )}
    </div>
  );
}

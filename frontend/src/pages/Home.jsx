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

export default function Home() {
  usePageSeo({
    title: "MACFiESTA 2026 | MACFAST — National Level Fest",
    description: "MacFiesta 2026 national collegiate festival at MACFAST — Marvel Universe Theme, 24–25 Sep 2026.",
  });


  return (
    <div className="relative w-full bg-transparent overflow-hidden min-h-screen">

      {/* ─── 3D Marvel Frame-by-Frame Scroll Engine Background ─── */}
      <Marvel3DScrollCanvas initialSequence="frames" showHud={false} />

      {/* ─── 01. Hero Section ─── */}
      <ScrollRevealWrapper id="hero" enable3DTilt={false} laserColor="cyan" className="relative z-10">
        <HeroSection />
      </ScrollRevealWrapper>

      {/* ─── 02. About Festival Briefing ─── */}
      <ScrollRevealWrapper id="about" laserColor="red">
        <AboutFestival />
      </ScrollRevealWrapper>

      {/* ─── 03. Featured Missions ─── */}
      <ScrollRevealWrapper id="events" laserColor="cyan">
        <FeaturedEvents />
      </ScrollRevealWrapper>

      {/* ─── 04. Infinity Gauntlet Challenge ─── */}
      <ScrollRevealWrapper id="infinity" laserColor="gold">
        <InfinityChallenge />
      </ScrollRevealWrapper>

      {/* ─── 05. Marvel Mission Timeline ─── */}
      <ScrollRevealWrapper id="timeline" laserColor="purple">
        <MarvelTimeline />
      </ScrollRevealWrapper>

      {/* ─── 06. Schedule Preview ─── */}
      <ScrollRevealWrapper id="schedule" laserColor="gold">
        <SchedulePreview />
      </ScrollRevealWrapper>

      {/* ─── 07. Sponsors & Alliances ─── */}
      <ScrollRevealWrapper id="sponsors" laserColor="cyan">
        <SponsorsSection />
      </ScrollRevealWrapper>

      {/* ─── 08. Honored Chief Guests & VIPs (Under Sponsors) ─── */}
      <ScrollRevealWrapper id="guests" laserColor="gold">
        <ChiefGuestsSection />
      </ScrollRevealWrapper>

      {/* ─── 09. Gallery Archives ─── */}
      <ScrollRevealWrapper id="gallery" laserColor="purple">
        <GalleryPreview />
      </ScrollRevealWrapper>

      {/* ─── 10. Testimonials & Agent Reviews ─── */}
      <ScrollRevealWrapper id="testimonials" laserColor="gold">
        <TestimonialsSection />
      </ScrollRevealWrapper>

      {/* ─── 11. Legends Cup Registration CTA ─── */}
      <ScrollRevealWrapper id="cta" enable3DTilt={false} laserColor="red">
        <RegistrationCTA />
      </ScrollRevealWrapper>
    </div>
  );
}

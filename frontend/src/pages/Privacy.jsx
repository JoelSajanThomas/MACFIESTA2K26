import { Link } from "react-router-dom";
import { RiShieldCheckLine, RiCompass3Line } from "react-icons/ri";
import { usePageSeo } from "../hooks/usePageSeo";
import { useSiteSettings } from "../hooks/useSiteSettings";
import { BRAND } from "../utils/brand";

function DefaultPrivacyContent({ year, brand }) {
  const sections = [
    {
      title: "1. Information We Collect",
      content:
        "When you register for events or access festival systems, we collect participant name, college / school affiliation, email, phone number, and account credentials necessary to administer tournament brackets, registrations, and official pass generation.",
    },
    {
      title: "2. How We Use Information",
      bullets: [
        "To process mission and event registrations and compile official tournament brackets and fest scoreboards.",
        "To communicate critical schedule changes, venue allocations, and online payment clearance updates.",
        "To verify identity at physical security entry gates and maintain authorized arena operations.",
      ],
    },
    {
      title: "3. Data Sharing & Privacy",
      content:
        "We do not sell, rent, or trade participant data. Minimal relevant delegate information is shared strictly with faculty event coordinators and official event judges for legitimate festival competition operations.",
    },
    {
      title: "4. Data Retention & Safeguards",
      content:
        "Registration records and verification tokens are retained securely for institutional accreditation, certificate issuance, and college festival audit requirements.",
    },
    {
      title: "5. Your Privacy Rights",
      content:
        "Participants may contact festival administrators at any time to verify, update, or correct registration records, or raise privacy concerns with the festival committee.",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="p-4 bg-black/40 border border-white/10 rounded-2xl">
        <p className="text-xs text-white/60 font-excon">
          Last updated: {year}. This privacy directive outlines how {brand.festName} and {brand.collegeFullName} securely manage participant information on MacFiesta Pro.
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((sec, idx) => (
          <div key={idx} className="p-6 bg-black/40 border border-white/10 rounded-2xl space-y-3">
            <h3 className="text-base font-bold text-metallic-gold uppercase font-excon-bold tracking-wide">
              {sec.title}
            </h3>
            {sec.content && (
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-excon">
                {sec.content}
              </p>
            )}
            {sec.bullets && (
              <ul className="space-y-2 pt-1">
                {sec.bullets.map((b, bIdx) => (
                  <li key={bIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-white/80 font-excon">
                    <span className="w-1.5 h-1.5 rounded-full bg-arc-cyan shrink-0 mt-2" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

        <div className="p-6 bg-black/40 border border-white/10 rounded-2xl space-y-2">
          <h3 className="text-base font-bold text-metallic-gold uppercase font-excon-bold tracking-wide">
            6. Official Contact Directives
          </h3>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-excon">
            For privacy inquiries or data verification, reach our coordination desk:{" "}
            <a href={`mailto:${brand.contactEmail}`} className="text-arc-cyan hover:underline font-mono">
              {brand.contactEmail}
            </a>
            {" · "}
            <Link to="/contact" className="text-metallic-gold hover:underline font-bold">
              Mission Contact Desk →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function renderCmsBlocks(body) {
  return (
    <div className="space-y-6">
      {body.split(/\n\n+/).map((block, idx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={idx} className="text-base font-bold text-metallic-gold uppercase font-excon-bold tracking-wide pt-4">
              {trimmed.replace(/^##\s+/, "")}
            </h3>
          );
        }
        if (trimmed.startsWith("- ")) {
          const items = trimmed.split("\n").filter((line) => line.startsWith("- "));
          return (
            <ul key={idx} className="space-y-2">
              {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-white/80 font-excon">
                  <span className="w-1.5 h-1.5 rounded-full bg-arc-cyan shrink-0 mt-2" />
                  <span>{item.replace(/^-\s+/, "")}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={idx} className="text-xs sm:text-sm text-white/80 leading-relaxed font-excon">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}

export default function Privacy() {
  usePageSeo({
    title: "Privacy Directive · MacFiesta 2026",
    description: "Official privacy policy and participant data handling directives for MacFiesta 2026.",
  });

  const settings = useSiteSettings();
  const year = settings?.fest_year || BRAND.festYear;
  const cmsPrivacy = settings?.privacy_body?.trim();

  return (
    <div className="bg-[#05050A] min-h-screen pt-28 pb-16 text-white font-excon relative overflow-hidden">
      {/* Background Marvel Image Backdrop */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/MARVEL/Iron Man.jpg"
          alt="Privacy Directive Marvel Backdrop"
          className="w-full h-full object-cover object-center opacity-85 contrast-[1.05] saturate-[1.1] brightness-[0.92]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05050A]/40 via-black/30 to-[#05050A]/90 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(5,5,10,0.6)_100%)] pointer-events-none" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)] font-space">
            <RiShieldCheckLine className="animate-pulse text-metallic-gold" />
            <span>S.H.I.E.L.D. SECURITY &amp; DATA PROTOCOL</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight font-excon-black">
            <span className="shimmer-text">PRIVACY</span>{" "}
            <span className="gradient-text-gold">DIRECTIVE</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/60 font-excon max-w-xl mx-auto">
            How MacFiesta {year} and MACFAST securely manage participant records and digital passes.
          </p>
        </div>

        <div className="marvel-card p-6 sm:p-8 rounded-3xl border border-arc-cyan/30 bg-[#0A0D1A]/95 shadow-2xl">
          {cmsPrivacy ? renderCmsBlocks(cmsPrivacy) : <DefaultPrivacyContent year={year} brand={BRAND} />}
        </div>

        <div className="text-center pt-4">
          <Link to="/" className="text-xs text-arc-cyan font-bold hover:underline inline-flex items-center gap-1.5 font-excon">
            <RiCompass3Line />
            <span>Return to Mission Control</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

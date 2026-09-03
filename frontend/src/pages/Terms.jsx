import { Link } from "react-router-dom";
import { RiFilePaper2Line, RiCompass3Line } from "react-icons/ri";
import { usePageSeo } from "../hooks/usePageSeo";
import { useSiteSettings } from "../hooks/useSiteSettings";
import { BRAND } from "../utils/brand";

function DefaultTermsContent({ year, brand }) {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content:
        `By registering for events, accessing this platform, or participating in MacFiesta ${year}, you agree to these Terms and Conditions. If you do not agree, do not register or participate.`,
    },
    {
      title: "2. Registration & Delegate Protocols",
      bullets: [
        "Registrations must be completed through MacFiesta Pro or official campus registration desks.",
        "Each participant must provide verifiable identity details including college name, phone number, and email.",
        "One registration per person per event unless the tournament format explicitly designates team slots.",
        "Registration is finalized only after successful payment clearance and digital verification pass issuance.",
        "The festival committee reserves the right to close registrations upon arena capacity limits.",
        "False or fraudulent credentials will result in immediate disqualification without refund.",
      ],
    },
    {
      title: "3. Event Participation Directives",
      bullets: [
        "Participants must report to the assigned mission venue 15 minutes before scheduled start times.",
        "Valid physical institution photo ID cards are strictly mandatory across all arenas.",
        "Decisions of event judges and appointed faculty coordinators are final and binding.",
        "Participants must adhere to campus safety guidelines, laboratory safety rules, and code of conduct.",
      ],
    },
    {
      title: "4. Payment & Registration Fees",
      content:
        "Applicable registration pass fees are clearly itemized before checkout. School Day events are waived/free for verified school students with official student identification.",
    },
    {
      title: "5. Arena Code of Conduct",
      bullets: [
        "Respect fellow delegates, volunteers, judges, and institutional campus infrastructure.",
        "Alcohol, smoking, contraband, and hazardous materials are strictly prohibited across the campus.",
        "Harassment, unsporting conduct, or property damage will incur immediate expulsion and disciplinary report.",
      ],
    },
    {
      title: "6. Official Inquiries",
      content:
        `Direct inquiries to fest coordination: ${brand.contactEmail} or visit the campus Mission Control desk.`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="p-4 bg-black/40 border border-white/10 rounded-2xl">
        <p className="text-xs text-white/60 font-excon">
          Last updated: {year}. These terms govern participation in MacFiesta Pro and MacFiesta {year} hosted by {brand.collegeFullName}.
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
            Assistance &amp; Support
          </h3>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-excon">
            Email:{" "}
            <a href={`mailto:${brand.contactEmail}`} className="text-arc-cyan hover:underline font-mono">
              {brand.contactEmail}
            </a>
            {" · "}
            <Link to="/contact" className="text-metallic-gold hover:underline font-bold">
              Contact Desk →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Terms() {
  usePageSeo({
    title: "Terms & Conditions · MacFiesta 2026",
    description: "Official terms and conditions for MacFiesta 2026 participants, teams, and attendees.",
  });

  const settings = useSiteSettings();
  const year = settings?.fest_year || BRAND.festYear;
  const cmsTerms = settings?.terms_body?.trim();

  return (
    <div className="bg-[#05050A] min-h-screen pt-28 pb-16 text-white font-excon relative overflow-hidden">
      {/* Background Marvel Image Backdrop */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/MARVEL/Iron Man.jpg"
          alt="Terms Directive Marvel Backdrop"
          className="w-full h-full object-cover object-center opacity-85 contrast-[1.05] saturate-[1.1] brightness-[0.92]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05050A]/40 via-black/30 to-[#05050A]/90 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(5,5,10,0.6)_100%)] pointer-events-none" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)] font-space">
            <RiFilePaper2Line className="text-metallic-gold" />
            <span>S.H.I.E.L.D. TERMS &amp; CONDITIONS PROTOCOL</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight font-excon-black">
            <span className="shimmer-text">TERMS &amp;</span>{" "}
            <span className="gradient-text-gold">CONDITIONS</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/60 font-excon max-w-xl mx-auto">
            Participation guidelines, delegate code of conduct, and terms for MacFiesta {year}.
          </p>
        </div>

        <div className="marvel-card p-6 sm:p-8 rounded-3xl border border-arc-cyan/30 bg-[#0A0D1A]/95 shadow-2xl">
          {cmsTerms ? (
            <div className="space-y-4">
              {cmsTerms.split(/\n\n+/).map((block, idx) => {
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
          ) : (
            <DefaultTermsContent year={year} brand={BRAND} />
          )}
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

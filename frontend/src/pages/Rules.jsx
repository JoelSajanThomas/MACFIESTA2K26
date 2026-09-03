import { Link } from "react-router-dom";
import { RiShieldFlashLine, RiCompass3Line, RiFileTextLine, RiAlertLine } from "react-icons/ri";
import { usePageSeo } from "../hooks/usePageSeo";

export default function Rules() {
  usePageSeo({
    title: "Festival Rules & Directives · MacFiesta 2026",
    description: "Official code of conduct, common college regulations, and control protocols for MacFiesta 2026.",
  });

  const commonRules = [
    "Participants must carry valid college / school identification and complete registration verification before competing.",
    "Reporting time, venue, team size, eligibility, and event-specific requirements must be followed. Late entry is subject to the Event Head's decision.",
    "Misconduct, harassment, discrimination, intoxication, violence, property damage, cheating, or deliberate disruption can lead to immediate removal and disqualification.",
    "Participants are responsible for personal belongings and devices. Organizers maintain a lost-and-found desk but cannot guarantee recovery.",
    "Event officials may photograph or record activities for documentation and promotion subject to institutional policy.",
    "Any medical, safety, electrical, crowd, or security concern must be reported immediately to the Event Head or faculty coordinator.",
    "Complaints must be submitted only through the team leader / participant to the Event Head within the announced dispute window. Participants must not confront judges directly.",
    "Judges' decisions on evaluation are final. The organizing committee may decide procedural matters not explicitly covered by the rules.",
    "The organizing committee may revise schedules, venues, formats, or rules when required for safety or operational reasons, with equal notice to affected participants.",
  ];

  const controlDocs = [
    "Registration and attendance sheet",
    "Published rule sheet and scoring rubric",
    "Fixture / slot / round schedule",
    "Time and penalty log",
    "Incident and technical-issue log",
    "Judge score sheets",
    "Provisional result sheet and dispute record",
    "Final signed result sheet",
  ];

  return (
    <div className="bg-[#05050A] min-h-screen pt-28 pb-16 text-white font-mono relative overflow-hidden">
      {/* Background Marvel Image Backdrop */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/MARVEL/Iron Man.jpg"
          alt="Rules Protocol Marvel Backdrop"
          className="w-full h-full object-cover object-center opacity-85 contrast-[1.05] saturate-[1.1] brightness-[0.92]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05050A]/40 via-black/25 to-[#05050A]/85 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(5,5,10,0.6)_100%)] pointer-events-none" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)]">
            <RiShieldFlashLine className="animate-pulse text-metallic-gold" />
            <span>S.H.I.E.L.D. PROTOCOL DIRECTIVE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight font-excon-black">
            <span className="shimmer-text">OFFICIAL</span>{" "}
            <span className="gradient-text-gold">RULEBOOK</span>
          </h1>
          <p className="text-xs text-white/60 font-excon">Official Code of Conduct &amp; General Regulations for MACFIESTA 2026.</p>
        </div>

        {/* Common Rules */}
        <div className="marvel-card p-6 sm:p-8 rounded-3xl border border-arc-cyan/30 bg-[#0A0D1A]/95 space-y-4 shadow-2xl">
          <div className="flex items-center gap-2 text-metallic-gold text-xs font-bold uppercase tracking-wider font-excon-bold">
            <RiAlertLine className="text-base" />
            <span>Common Regulations for All Competitions</span>
          </div>

          <div className="space-y-3 text-xs font-excon">
            {commonRules.map((rule, idx) => (
              <div key={idx} className="p-3.5 bg-black/40 border border-white/10 rounded-xl flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-marvel-red/20 text-marvel-red font-bold text-[10px] flex items-center justify-center shrink-0 font-mono mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-white/80 leading-relaxed">{rule}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Control Documents Protocol */}
        <div className="marvel-card p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#0A0D1A]/90 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-arc-cyan text-xs font-bold uppercase tracking-wider font-excon-bold">
            <RiFileTextLine className="text-base" />
            <span>Official Organizing Committee Control Documents</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-excon">
            {controlDocs.map((doc, idx) => (
              <div key={idx} className="p-3 bg-black/30 border border-white/10 rounded-xl flex items-center gap-2.5 text-white/80">
                <span className="text-metallic-gold font-bold font-mono">0{idx + 1}.</span>
                <span>{doc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center pt-4">
          <Link to="/events" className="text-xs text-arc-cyan font-bold hover:underline inline-flex items-center gap-1">
            <RiCompass3Line />
            <span>View All Event Missions &amp; Specific Rules</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

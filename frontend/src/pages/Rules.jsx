import { Link } from "react-router-dom";
import { RiShieldFlashLine, RiCompass3Line } from "react-icons/ri";
import { usePageSeo } from "../hooks/usePageSeo";

export default function Rules() {
  usePageSeo({
    title: "Festival Rules & Directives · MacFiesta 2026",
    description: "Official code of conduct & general festival regulations for MacFiesta 2K26.",
  });

  const rules = [
    "All delegates must carry valid college photo ID cards at all times.",
    "Decisions of judges and festival coordinators are final and binding across all competitions.",
    "Smoking, alcohol, and contraband are strictly prohibited on MACFAST campus premises.",
    "Delegates must report to competition venues at least 15 minutes before scheduled start time.",
    "Damage to campus or venue equipment will result in immediate disqualification and liability.",
  ];

  return (
    <div className="bg-[#05050A] min-h-screen pt-28 pb-16 text-white font-mono relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)]">
            <RiShieldFlashLine className="animate-pulse text-metallic-gold" />
            <span>S.H.I.E.L.D. PROTOCOL DIRECTIVE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight font-excon-black">
            <span className="shimmer-text">PROTOCOL</span>{" "}
            <span className="gradient-text-gold">RULEBOOK</span>
          </h1>
          <p className="text-xs text-white/60 font-excon">Official code of conduct & general festival regulations for MacFiesta 2K26.</p>
        </div>

        <div className="marvel-card p-8 rounded-3xl border border-arc-cyan/30 bg-[#0A0D1A] space-y-4">
          <h2 className="text-sm font-bold text-metallic-gold uppercase tracking-wider font-excon-bold">General Festival Guidelines</h2>
          <div className="space-y-3 text-xs font-excon">
            {rules.map((rule, idx) => (
              <div key={idx} className="p-4 bg-black/40 border border-white/10 rounded-xl flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-marvel-red/20 text-marvel-red font-bold text-xs flex items-center justify-center shrink-0 font-mono">
                  {idx + 1}
                </span>
                <p className="text-white/80 leading-relaxed pt-0.5">{rule}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center pt-4">
          <Link to="/" className="text-xs text-arc-cyan font-bold hover:underline inline-flex items-center gap-1">
            <RiCompass3Line />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

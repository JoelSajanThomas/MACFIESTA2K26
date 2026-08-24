import { motion } from "framer-motion";
import { RiShakeHandsLine, RiShieldFlashLine } from "react-icons/ri";
import { usePageSeo } from "../hooks/usePageSeo";

const SPONSOR_TIERS = [
  { id: "platinum", label: "Platinum Alliances", color: "#E5E4E2" },
  { id: "gold", label: "Gold Champions", color: "#FFD700" },
  { id: "silver", label: "Silver Associates", color: "#C0C0C0" },
  { id: "community", label: "Community & Media Partners", color: "#00D4FF" },
];

const fallbackSponsors = [
  { name: "Apex Tech Labs", tier: "platinum", logo: "🌐", desc: "Digital Infrastructure Partner providing global esports servers." },
  { name: "Zenith Holdings", tier: "platinum", logo: "⚡", desc: "Corporate Venture backing tech hackathon prize structures." },
  { name: "Pinnacle Foods Ltd", tier: "gold", logo: "🍔", desc: "Official catering provider offering multi-cuisine spreads." },
  { name: "Nova Media Group", tier: "gold", logo: "📡", desc: "Streaming partner broadcasting events live globally." },
  { name: "Vanguard Studios", tier: "silver", logo: "🎨", desc: "Official graphics design and stage visual supplier." },
  { name: "Electro Charge", tier: "silver", logo: "🔋", desc: "Providing dynamic power backup and solar arrays." },
  { name: "Community Tech Hub", tier: "community", logo: "🤝", desc: "Local tech network driving volunteer outreach programs." }
];

export default function Sponsors() {
  usePageSeo({
    title: "Sponsors & Strategic Alliances · MacFiesta 2026",
    description: "Collaborating with leading national and regional organizations to power MACFIESTA 2026.",
  });

  return (
    <div className="bg-[#05050A] min-h-screen pt-28 pb-16 font-excon relative overflow-hidden">
      {/* Background Marvel Ambient Blending */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[400px] bg-arc-cyan/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[400px] bg-metallic-gold/15 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)]">
            <RiShieldFlashLine className="animate-pulse text-metallic-gold" />
            <span>VALUED ALLIANCES &amp; STRATEGIC PARTNERS</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white font-excon-black">
            <span className="shimmer-text">OUR SPONSORS &amp;</span>{" "}
            <span className="gradient-text-gold">PARTNERS</span>
          </h1>
          <p className="text-white/70 text-xs sm:text-sm font-excon font-normal">
            Collaborating with leading national and regional organizations to power MACFIESTA 2K26.
          </p>
        </div>

        {/* Tier Lists */}
        {SPONSOR_TIERS.map((tierGroup) => {
          const tierSponsors = fallbackSponsors.filter((s) => s.tier === tierGroup.id);
          if (tierSponsors.length === 0) return null;

          return (
            <div key={tierGroup.id} className="space-y-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                <span className="h-2.5 w-2.5 rounded-full shadow-[0_0_10px_currentColor]" style={{ backgroundColor: tierGroup.color, color: tierGroup.color }} />
                <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-white font-excon-black">
                  {tierGroup.label}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tierSponsors.map((sponsor, idx) => (
                  <motion.div
                    key={sponsor.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className="marvel-card p-6 rounded-2xl border border-white/15 space-y-4 flex flex-col justify-between hover:border-arc-cyan/50 transition-colors duration-300 bg-[#0A0D1A]/90"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-4xl p-3 bg-white/5 rounded-xl border border-white/10 shrink-0">{sponsor.logo}</span>
                      <div>
                        <h3 className="font-black text-white uppercase text-base font-excon-black">
                          {sponsor.name}
                        </h3>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-arc-cyan font-excon-bold">
                          {sponsor.tier} Partner
                        </span>
                      </div>
                    </div>
                    <p className="text-white/60 text-xs leading-relaxed font-excon">
                      {sponsor.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Invite CTA Banner */}
        <div className="marvel-card p-8 rounded-3xl border border-white/10 text-center max-w-3xl mx-auto space-y-6 bg-[#0A0D1A]/90">
          <div className="text-3xl text-metallic-gold p-3 bg-white/5 rounded-full w-fit mx-auto border border-metallic-gold/30">
            <RiShakeHandsLine />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white uppercase tracking-wider font-excon-black">
              Become a Sponsor
            </h3>
            <p className="text-white/60 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed font-excon">
              Exhibit your brand before 5000+ college students, tech leaders, and cultural enthusiasts. Connect with our sponsorship team.
            </p>
          </div>
          <button
            type="button"
            onClick={() => alert("Please send partnership query to info@macfiesta.macfast.org")}
            className="px-8 py-3.5 bg-marvel-red hover:bg-white hover:text-black font-black text-xs uppercase tracking-wider rounded-full transition-all shadow-[0_0_20px_#ED1D24] cursor-pointer"
          >
            <span>Partner With Us</span>
          </button>
        </div>

      </div>
    </div>
  );
}

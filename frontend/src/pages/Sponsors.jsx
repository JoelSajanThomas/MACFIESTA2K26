import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RiShakeHandsLine, RiShieldFlashLine } from "react-icons/ri";
import { usePageSeo } from "../hooks/usePageSeo";
import { getSponsors, mediaUrl } from "../services/api";

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

  const [sponsors, setSponsors] = useState(fallbackSponsors);

  useEffect(() => {
    getSponsors()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data.results || [];
        if (list.length > 0) {
          const mapped = list.map((s) => {
            const rawType = (s.sponsor_type || "").toLowerCase();
            let tier = "community";
            if (rawType.includes("platinum") || rawType.includes("title") || rawType.includes("host")) tier = "platinum";
            else if (rawType.includes("gold")) tier = "gold";
            else if (rawType.includes("silver")) tier = "silver";
            return {
              name: s.name,
              tier,
              logo: s.logo || "🌐",
              desc: s.description || `${s.name} — Proud ${s.sponsor_type} Partner of MacFiesta.`,
              website: s.website,
            };
          });
          setSponsors(mapped);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-[#05050A] min-h-screen pt-28 pb-16 font-excon relative overflow-hidden">
      {/* Background Marvel Image Backdrop */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/MARVEL/download (6).jpg"
          alt="Marvel Comic Backdrop"
          className="w-full h-full object-cover object-center opacity-85 contrast-[1.05] saturate-[1.1] brightness-[0.92]"
        />
        {/* Cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#05050A]/40 via-black/25 to-[#05050A]/85 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(5,5,10,0.6)_100%)] pointer-events-none" />
      </div>

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
          const tierSponsors = sponsors.filter((s) => s.tier === tierGroup.id);
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
                {tierSponsors.map((sponsor, idx) => {
                  const isImage = typeof sponsor.logo === "string" && (sponsor.logo.startsWith("http") || sponsor.logo.startsWith("/"));
                  return (
                    <motion.div
                      key={`${sponsor.name}-${idx}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      className="marvel-card p-6 rounded-2xl border border-white/15 space-y-4 flex flex-col justify-between hover:border-arc-cyan/50 transition-colors duration-300 bg-[#0A0D1A]/90"
                    >
                      <div className="flex items-center gap-4">
                        {isImage ? (
                          <div className="w-14 h-14 p-2 bg-white/5 rounded-xl border border-white/10 shrink-0 flex items-center justify-center">
                            <img src={mediaUrl(sponsor.logo)} alt={sponsor.name} className="max-w-full max-h-full object-contain" />
                          </div>
                        ) : (
                          <span className="text-4xl p-3 bg-white/5 rounded-xl border border-white/10 shrink-0">{sponsor.logo}</span>
                        )}
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
                  );
                })}
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
          <a
            href="mailto:macfiesta@macfast.org?subject=MacFiesta%20Sponsorship%20Inquiry"
            className="px-8 py-3.5 bg-marvel-red hover:bg-white hover:text-black font-black text-xs uppercase tracking-wider rounded-full transition-all shadow-[0_0_20px_#ED1D24] cursor-pointer inline-block"
          >
            <span>Partner With Us</span>
          </a>
        </div>

      </div>
    </div>
  );
}

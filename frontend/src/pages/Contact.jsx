import { useState, useEffect } from "react";
import {
  RiMapPin2Line,
  RiPhoneLine,
  RiMailSendLine,
  RiQuestionLine,
  RiShieldFlashLine,
  RiExternalLinkLine,
  RiStarLine,
  RiUserHeartLine,
} from "react-icons/ri";
import { usePageSeo } from "../hooks/usePageSeo";
import { useSiteSettings } from "../hooks/useSiteSettings";
import { getCoordinatorProfiles, getFAQs, mediaUrl } from "../services/api";

const CORE_TEAM_FALLBACK = [
  { name: "Anu Tiji", role: "Core Team", phone: "+918330065374", display: "+91 83300 65374" },
  { name: "Shibin", role: "Core Team", phone: "+919400715903", display: "+91 94007 15903" },
  { name: "Emil", role: "Core Team", phone: "+917902821846", display: "+91 79028 21846" },
];

const DEPT_HEADS_FALLBACK = [
  { name: "Gokul", role: "Finance Head", phone: "+917559833490", display: "+91 75598 33490" },
  { name: "Dany", role: "Cultural Head", phone: "+918590919670", display: "+91 85909 19670" },
  { name: "Vishnu", role: "Program Head", phone: "+918921960471", display: "+91 89219 60471" },
  { name: "Arjun Santhosh", role: "Event Head", phone: "+918590939674", display: "+91 85909 39674" },
  { name: "Arjun Sudeesh", role: "Publicity & Hospitality Head", phone: "+918086712381", display: "+91 80867 12381" },
  { name: "Albin", role: "Invitation Head", phone: "+916235930968", display: "+91 62359 30968" },
  { name: "Akshai Das", role: "Food Head", phone: "+917593929551", display: "+91 75939 29551" },
];

const FAQS_FALLBACK = [
  { q: "Who is eligible to participate?", a: "All bona fide students with valid college or school ID cards are eligible to register across respective event categories." },
  { q: "Can I register on-spot?", a: "Spot registrations will only be available if event slots remain unfilled. We strongly advise pre-registering online." },
  { q: "Is registration fee refundable?", a: "No, once registration passes or individual event slots are booked, fees are non-refundable." },
  { q: "Will accommodation be provided?", a: "Accommodation can be selected and configured on the festival portal. Nominal hostel tariff applies." },
];

export default function Contact() {
  usePageSeo({
    title: "Contact & FAQ · MacFiesta 2026",
    description: "Reach out to the MacFiesta 2026 organizing team or view frequently answered questions.",
  });

  const settings = useSiteSettings() || {};
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [coordinators, setCoordinators] = useState([]);
  const [faqList, setFaqList] = useState(FAQS_FALLBACK);

  useEffect(() => {
    getCoordinatorProfiles()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        if (list.length > 0) {
          setCoordinators(list.filter((c) => c.is_active !== false));
        }
      })
      .catch(() => {});

    getFAQs()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        if (list.length > 0) {
          setFaqList(list.map((item) => ({ q: item.question, a: item.answer })));
        }
      })
      .catch(() => {});
  }, []);

  const coreTeam = coordinators.filter((c) => c.tier === "core" || c.tier === "faculty");
  const deptHeads = coordinators.filter((c) => c.tier === "dept_head" || c.tier === "event_head");

  const displayCoreTeam = coreTeam.length > 0 ? coreTeam : CORE_TEAM_FALLBACK;
  const displayDeptHeads = deptHeads.length > 0 ? deptHeads : DEPT_HEADS_FALLBACK;

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Thank you for reaching out! Your query has been logged.`);
    setEmail("");
    setMsg("");
  };

  return (
    <div className="bg-[#05050A] min-h-screen pt-28 pb-16 text-white font-excon relative overflow-hidden">
      {/* Background Marvel Spider-Men Multiverse Wallpaper */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/MARVEL/wp14316545-andrew-garfield-tobey-maguire-tom-holland-wallpapers.jpg"
          alt="Spider-Men Multiverse Contact Background"
          className="w-full h-full object-cover object-center opacity-85 contrast-[1.08] saturate-[1.1] brightness-[0.9]"
        />
        {/* Cinematic dark filter overlays */}
        <div className="absolute inset-0 bg-black/15 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05050A]/85 via-black/25 via-25% to-[#05050A]/90 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,5,10,0.6)_100%)] pointer-events-none" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)]">
            <RiShieldFlashLine className="animate-pulse text-metallic-gold" />
            <span>S.H.I.E.L.D. COMMUNICATIONS DESK</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white font-excon-black">
            <span className="shimmer-text">CONTACT</span>{" "}
            <span className="gradient-text-gold">US</span>
          </h1>

          <p className="text-white/80 text-xs sm:text-sm leading-relaxed font-excon font-normal">
            Reach out to our organizing team or browse the list of frequently answered questions.
          </p>
        </div>

        {/* Form and info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="marvel-card p-6 md:p-8 rounded-2xl border border-arc-cyan/25 space-y-6 shadow-2xl bg-[#060814]/92 backdrop-blur-xl">
              <h3 className="text-lg font-black text-white uppercase tracking-tight font-excon-black">
                Send us a message
              </h3>
              
              <div className="space-y-4 font-excon">
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs uppercase font-bold tracking-wider text-white/50 mb-2 font-excon-bold"
                  >
                    Email Address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@college.edu"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-arc-cyan focus:outline-none text-white text-sm placeholder:text-white/30 transition-all font-excon"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs uppercase font-bold tracking-wider text-white/50 mb-2 font-excon-bold"
                  >
                    Your Message
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    placeholder="Write your query here..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-arc-cyan focus:outline-none text-white text-sm placeholder:text-white/30 transition-all font-excon"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-arc-cyan hover:bg-white text-black font-black text-xs uppercase tracking-[0.15em] rounded-xl transition-all duration-300 cursor-pointer shadow-[0_0_15px_#00D4FF] font-excon-black flex items-center justify-center gap-2"
              >
                <RiMailSendLine className="text-base" />
                <span>Send Query</span>
              </button>
            </form>
          </div>

          {/* Info & Map */}
          <div className="lg:col-span-5 space-y-6">
            <div className="marvel-card p-6 md:p-8 rounded-2xl border border-arc-cyan/25 space-y-6 shadow-2xl bg-[#060814]/92 backdrop-blur-xl">
              <h3 className="text-lg font-black text-white uppercase tracking-tight font-excon-black">
                Contact Points
              </h3>

              <div className="space-y-4 text-sm text-white/70 font-excon">
                <div className="flex items-center gap-3">
                  <RiPhoneLine className="text-metallic-gold text-lg shrink-0" />
                  <span>General Helpdesk: <strong className="text-white font-bold font-excon-bold">{settings?.contact_phone || "+91 469 273 0300"}</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <RiMailSendLine className="text-arc-cyan text-lg shrink-0" />
                  <span>Official Email: <a href={`mailto:${settings?.contact_email || "macfiesta@macfast.org"}`} className="text-white font-bold font-excon-bold hover:text-arc-cyan transition-colors">{settings?.contact_email || "macfiesta@macfast.org"}</a></span>
                </div>
                <div className="flex items-center gap-3">
                  <RiMapPin2Line className="text-marvel-red text-lg shrink-0" />
                  <span>MACFAST, Kuttapuzha P.O., Tiruvalla, Kerala 689101</span>
                </div>
                <div className="flex items-center gap-3">
                  <RiExternalLinkLine className="text-white/60 text-lg shrink-0" />
                  <span>Official Website: <a href="https://macfast.org/" target="_blank" rel="noopener noreferrer" className="text-white font-bold font-excon-bold hover:text-arc-cyan transition-colors">macfast.org</a></span>
                </div>
              </div>
            </div>

            {/* Live Google Map Fitted Inside Box */}
            <div className="marvel-card h-48 md:h-56 rounded-2xl border border-arc-cyan/30 overflow-hidden relative shadow-2xl group bg-[#0A0D1A]">
              <iframe
                title="MACFAST Tiruvalla Campus Map"
                src="https://maps.google.com/maps?q=MACFAST%20Tiruvalla%20Kerala&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) contrast(105%)" }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full block"
              />

              {/* Floating External Map Chip */}
              <div className="absolute top-2.5 right-2.5 z-10">
                <a
                  href="https://maps.google.com/?q=MACFAST+Tiruvalla+Kerala"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0A0D1A]/90 backdrop-blur-md border border-white/20 hover:border-metallic-gold text-metallic-gold hover:text-white text-[10px] font-bold uppercase tracking-wider shadow-lg transition-all font-mono"
                >
                  <RiExternalLinkLine />
                  <span>Directions</span>
                </a>
              </div>

              {/* Floating Live Coordinates Tag */}
              <div className="absolute bottom-2.5 left-2.5 z-10 pointer-events-none">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0A0D1A]/90 backdrop-blur-md border border-white/15 text-[10px] text-white/80 font-mono shadow-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>9.3748° N, 76.5658° E</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Organizing Team Directory ── */}
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold text-xs font-bold tracking-[0.2em] uppercase">
              <RiUserHeartLine />
              <span>ORGANIZING COMMITTEE</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight font-excon-black">
              <span className="shimmer-text">MEET THE</span>{" "}
              <span className="gradient-text-gold">TEAM</span>
            </h2>
            <p className="text-white/60 text-xs sm:text-sm font-excon max-w-xl mx-auto">
              Reach out directly to any department head or core team member for queries related to their area.
            </p>
          </div>

          {/* Core Team */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <RiStarLine className="text-metallic-gold text-lg shrink-0" />
              <h3 className="text-sm font-black text-metallic-gold uppercase tracking-widest font-excon-black">Core Team</h3>
              <div className="flex-1 h-px bg-metallic-gold/20" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayCoreTeam.map((m, idx) => (
                <a
                  key={m.phone || m.id || idx}
                  href={`tel:${m.phone || ""}`}
                  className="group marvel-card flex items-center gap-4 p-4 rounded-2xl border border-metallic-gold/25 bg-[#060814]/90 backdrop-blur-md hover:border-metallic-gold/60 hover:bg-metallic-gold/10 transition-all duration-300 shadow-xl cursor-pointer no-underline"
                >
                  {m.photo ? (
                    <img
                      src={mediaUrl(m.photo)}
                      alt={m.name}
                      className="w-11 h-11 rounded-full object-cover border border-metallic-gold/40 shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-metallic-gold via-amber-400 to-amber-600 flex items-center justify-center text-black font-black text-sm shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.35)] group-hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] transition-all">
                      {m.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-white font-black text-sm font-excon-black truncate group-hover:text-metallic-gold transition-colors">{m.name}</p>
                    <p className="text-white/50 text-[10px] font-excon truncate">{m.role}</p>
                    <p className="text-metallic-gold text-xs font-bold mt-0.5 font-mono">{m.display || m.phone}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Department Heads */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <RiShieldFlashLine className="text-arc-cyan text-lg shrink-0" />
              <h3 className="text-sm font-black text-arc-cyan uppercase tracking-widest font-excon-black">Department Heads</h3>
              <div className="flex-1 h-px bg-arc-cyan/20" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayDeptHeads.map((m, idx) => (
                <a
                  key={m.phone || m.id || idx}
                  href={`tel:${m.phone || ""}`}
                  className="group marvel-card flex items-center gap-4 p-4 rounded-2xl border border-arc-cyan/20 bg-[#060814]/90 backdrop-blur-md hover:border-arc-cyan/50 hover:bg-arc-cyan/10 transition-all duration-300 shadow-xl cursor-pointer no-underline"
                >
                  {m.photo ? (
                    <img
                      src={mediaUrl(m.photo)}
                      alt={m.name}
                      className="w-11 h-11 rounded-full object-cover border border-arc-cyan/40 shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-arc-cyan/30 via-blue-500/20 to-purple-600/20 border border-arc-cyan/40 flex items-center justify-center text-arc-cyan font-black text-sm shrink-0 shadow-[0_0_12px_rgba(0,212,255,0.2)] group-hover:shadow-[0_0_20px_rgba(0,212,255,0.45)] transition-all">
                      {m.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-white font-black text-sm font-excon-black truncate group-hover:text-arc-cyan transition-colors">{m.name}</p>
                    <p className="text-white/50 text-[10px] font-excon truncate">{m.role}</p>
                    <p className="text-arc-cyan text-xs font-bold mt-0.5 font-mono">{m.display || m.phone}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-arc-cyan/40 bg-[#060814]/80 backdrop-blur-md text-arc-cyan text-xs font-excon-bold font-bold tracking-[0.2em] uppercase">
              <RiQuestionLine />
              <span>TROUBLESHOOT &amp; FAQS</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight font-excon-black">
              <span className="shimmer-text">FREQUENTLY ASKED</span>{" "}
              <span className="gradient-text-plasma">QUESTIONS</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqList.map((faq, idx) => (
              <div key={idx} className="marvel-card p-6 rounded-2xl border border-arc-cyan/25 hover:border-arc-cyan transition-all space-y-2 shadow-xl bg-[#060814]/92 backdrop-blur-xl">
                <h4 className="font-bold text-white text-base flex items-center gap-2 font-excon-bold">
                  <RiQuestionLine className="text-arc-cyan text-lg shrink-0" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-white/70 text-xs sm:text-sm pl-7 leading-relaxed font-excon">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

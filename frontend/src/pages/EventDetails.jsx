import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  RiContactsLine,
  RiShieldLine,
  RiShieldFlashLine,
  RiRobot2Line,
  RiFlashlightLine,
  RiTeamLine,
  RiCheckboxCircleLine,
  RiCompass3Line,
  RiUserStarLine,
  RiPhoneLine,
  RiUserLine,
  RiShieldUserLine,
  RiExternalLinkLine,
} from "react-icons/ri";
import { getCurrentUser, getEvent, getEvents, isLoggedIn } from "../services/api";
import { ALL_EVENTS } from "../lib/eventsData";
import { BackgroundVideo } from "../components/ui/BackgroundVideo";
import CreateTeamModal from "../components/CreateTeamModal";
import { usePageSeo } from "../hooks/usePageSeo";

export default function EventDetails() {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTeamModal, setShowTeamModal] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) {
      getCurrentUser()
        .then((res) => setCurrentUser(res.data))
        .catch(() => {});
    }
  }, []);

  const loadEvent = useCallback(() => {
    const isNum = /^\d+$/.test(idOrSlug);
    const load = isNum
      ? getEvent(idOrSlug)
      : getEvents().then((res) => {
          const eventsList = Array.isArray(res.data) ? res.data : res.data?.events || [];
          const m = eventsList.find((e) => e.slug === idOrSlug || String(e.id) === String(idOrSlug));
          if (!m) throw new Error("Not found");
          return getEvent(m.id);
        });

    return load
      .then((res) => {
        const d = res.data;
        const local = ALL_EVENTS.find((e) => e.slug === d.slug || String(e._id) === String(d.id));
        const merged = {
          ...local,
          ...d,
          _id: String(d.id),
          title: d.title,
          coverImage: d.image || local?.coverImage || "/MARVEL/4081455907815375.png",
          registrationFee: Number(d.registration_fee) || local?.registrationFee || 0,
          prizePool: d.prize_pool ? Number(d.prize_pool) : (local?.prizePool ?? null),
          venue: d.venue || local?.venue || "Main Campus Auditorium",
          time: d.event_time ? `Day ${d.audience === "school" ? "1" : "2"}, ${d.event_time}` : (local?.time || "10:00 AM onwards"),
          rules: local?.rules && local.rules.length > 0
            ? local.rules
            : Array.isArray(d.rules)
            ? d.rules
            : (typeof d.rules === "string" && d.rules
                ? d.rules
                    .split("\n")
                    .map((r) => r.trim())
                    .filter((r) => /^\d+\.\s+/.test(r))
                    .map((r) => r.replace(/^\d+\.\s*/, ""))
                : [
                    "Valid college / school ID card is mandatory for participation.",
                    "Decision of the event judges and coordinators shall be final.",
                    "Report to the assigned arena 15 minutes before mission start.",
                  ]),
          coordinator: {
            name: (d.coordinator_name || local?.coordinator?.name || "Event In-Charge").replace(/\s*\([^)]*\)\s*/g, " ").trim(),
            phone: d.coordinator_phone || local?.coordinator?.phone || "+91 85909 39674",
            department: local?.coordinator?.department || ((d.coordinator_name || "").match(/\(([^)]+)\)/)?.[1] || ""),
            team: local?.coordinator?.team || [],
          },
          manpower: local?.manpower || [],
          possibleProblems: local?.possibleProblems || [],
          committeeApproach: local?.committeeApproach || "",
          judgingRubric: local?.judgingRubric || "",
          teamSizeText: local?.teamSizeText || (d.min_team_size ? `${d.min_team_size} - ${d.max_team_size || d.min_team_size} members` : "Individual / Team"),
          min_team_size: d.min_team_size || local?.min_team_size || 1,
          max_team_size: d.max_team_size || local?.max_team_size || 1,
          externalRegistrationUrl: local?.externalRegistrationUrl || (local?.slug === "vibe-coding-hackathon" || d?.slug === "vibe-coding-hackathon" ? "https://hackathon.macfast.org/" : undefined),
        };
        setEvent(merged);
        return merged;
      })
      .catch(() => {
        const local = ALL_EVENTS.find((e) => e.slug === idOrSlug || String(e._id) === String(idOrSlug));
        if (local) {
          setEvent(local);
          return local;
        }
        setEvent(null);
      })
      .finally(() => setLoading(false));
  }, [idOrSlug]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  usePageSeo({
    title: event ? `${event.title} · MacFiesta 2026` : "Event Briefing · MacFiesta 2026",
    description: event ? event.description : "MacFiesta 2026 official event briefing.",
  });

  if (loading) {
    return (
      <div className="bg-[#05050A] min-h-screen pt-28 flex items-center justify-center font-mono">
        <div className="text-arc-cyan text-sm font-bold uppercase tracking-widest animate-pulse flex items-center gap-2">
          <RiRobot2Line className="text-xl" />
          <span>J.A.R.V.I.S. Loading Mission Briefing...</span>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="bg-[#05050A] min-h-screen pt-28 flex flex-col items-center justify-center font-mono text-center p-6 space-y-4">
        <h2 className="text-2xl font-black text-marvel-red uppercase font-excon-black">Mission Not Found</h2>
        <p className="text-xs text-white/60 font-excon">The requested mission brief does not exist or has been archived.</p>
        <Link to="/events" className="px-6 py-3 rounded-full bg-marvel-red text-white text-xs font-bold uppercase tracking-wider">
          Return to Mission Directory
        </Link>
      </div>
    );
  }

  const isFree = event.registrationFee === 0;
  const feeDisplay = isFree ? "FREE PASS" : `₹${event.registrationFee}`;
  const isExpo = event.slug === "school-stark-expo";
  const isTeamEvent = (event.max_team_size || 1) > 1;

  const isExternalReg = Boolean(
    event.externalRegistrationUrl ||
    event.slug === "vibe-coding-hackathon" ||
    event.slug === "avengers-code-assemble" ||
    event._id === "clg-1"
  );
  const externalUrl = event.externalRegistrationUrl || "https://hackathon.macfast.org/";

  function handleRegisterClick() {
    if (isExternalReg) {
      window.open(externalUrl, "_blank", "noopener,noreferrer");
      return;
    }
    if (!isLoggedIn()) {
      navigate(`/login?next=/events/${event.slug || event.id}`);
      return;
    }
    navigate(`/checkout?event=${event.slug || event.id}`);
  }

  return (
    <div className="bg-[#05050A] min-h-screen pt-28 pb-16 text-white font-excon relative overflow-hidden">
      {/* Background Marvel Video Loop */}
      <BackgroundVideo
        src="/MARVEL/Video Project 4.mp4"
        fallbackSrc="/MARVEL/Video Project 6.mp4"
        opacity="opacity-75"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">

        {/* Hero Banner Card */}
        <div className="marvel-card rounded-3xl border border-arc-cyan/30 overflow-hidden shadow-2xl relative bg-[#0A0D1A]/95">
          <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-black/60">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D1A] via-black/40 to-transparent z-10" />
            <img
              src={event.coverImage || "/MARVEL/4081455907815375.png"}
              alt={event.title}
              className="w-full h-full object-cover opacity-90"
            />
            
            {/* Audience Badge & Department */}
            <div className="absolute top-6 left-6 z-20 flex flex-wrap gap-2">
              <span className="px-3.5 py-1.5 rounded-full bg-marvel-red/90 text-white font-black text-xs uppercase tracking-widest border border-marvel-red font-excon-black shadow-lg">
                {event.audience === "school" ? "Day 1 · School Event" : "Day 2 · College Event"}
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-arc-cyan font-bold text-xs uppercase tracking-wider border border-arc-cyan/40 font-mono">
                {event.department || event.category}
              </span>
              {isTeamEvent && (
                <span className="px-3.5 py-1.5 rounded-full bg-metallic-gold/90 text-black font-black text-xs uppercase tracking-wider border border-metallic-gold font-mono shadow-md">
                  ★ Squad Mission ({event.teamSizeText})
                </span>
              )}
            </div>

            {/* Title on Hero */}
            <div className="absolute bottom-6 left-6 right-6 z-20 space-y-2">
              <span className="text-[10px] sm:text-xs text-metallic-gold font-bold uppercase tracking-widest font-mono">
                Official Festival Directive · MacFiesta 2026
              </span>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase text-white font-excon-black tracking-tight drop-shadow-md">
                {event.title}
              </h1>
            </div>
          </div>

          {/* Key Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-white/10 bg-black/40 border-t border-white/10 text-center font-excon">
            <div className="p-4 space-y-1">
              <span className="block text-[10px] uppercase font-bold text-white/50 tracking-wider font-excon-bold">Prize Pool / Bounty</span>
              <span className="block text-base sm:text-lg font-black text-metallic-gold font-excon-black">
                {event.prizePool ? `₹${Number(event.prizePool).toLocaleString("en-IN")}` : (isExpo ? "Grand Showcase" : "Certificates & Trophy")}
              </span>
            </div>
            <div className="p-4 space-y-1">
              <span className="block text-[10px] uppercase font-bold text-white/50 tracking-wider font-excon-bold">Registration Pass</span>
              <span className="block text-base sm:text-lg font-black text-arc-cyan font-mono">{feeDisplay}</span>
            </div>
            <div className="p-4 space-y-1">
              <span className="block text-[10px] uppercase font-bold text-white/50 tracking-wider font-excon-bold">Mission Time</span>
              <span className="block text-xs sm:text-sm font-bold text-white font-excon-bold truncate">{event.time}</span>
            </div>
            <div className="p-4 space-y-1">
              <span className="block text-[10px] uppercase font-bold text-white/50 tracking-wider font-excon-bold">Assigned Venue</span>
              <span className="block text-xs sm:text-sm font-bold text-white font-excon-bold truncate">{event.venue}</span>
            </div>
          </div>
        </div>

        {/* Content Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (8 cols): Description, Rules, Judging, Operations, Problems & Solutions */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Mission Overview */}
            <div className="marvel-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4 bg-[#0A0D1A]/90">
              <div className="inline-flex items-center gap-2 text-arc-cyan text-xs font-bold uppercase tracking-wider font-excon-bold">
                <RiFlashlightLine />
                <span>Executive Summary</span>
              </div>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base font-excon font-normal">
                {event.description}
              </p>
              {event.teamSizeText && (
                <div className="pt-2 flex items-center gap-2 text-xs text-metallic-gold font-bold">
                  <RiTeamLine className="text-base" />
                  <span>Team Format: {event.teamSizeText}</span>
                </div>
              )}
            </div>

            {/* Rules & Regulations matching official PDF layout */}
            <div className="marvel-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 bg-[#0A0D1A]/90">
              <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-black uppercase text-marvel-red font-excon-black tracking-wide">
                    Rules &amp; Regulations
                  </h3>
                  {event.subtitle && (
                    <span className="text-xs text-white/50 font-serif italic block mt-0.5">
                      {event.title} | &ldquo;{event.subtitle}&rdquo;
                    </span>
                  )}
                </div>
                <RiShieldLine className="text-metallic-gold text-xl" />
              </div>

              <div className="space-y-3.5 text-xs sm:text-sm font-space leading-relaxed">
                {(event.rules || []).map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-white/90">
                    <span className="font-mono font-bold text-metallic-gold shrink-0 mt-0.5 select-none text-xs">
                      {idx + 1}.
                    </span>
                    <p className="leading-relaxed font-normal text-white/85">
                      {rule.replace(/^\d+\.\s*/, "")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Coordinator & Action Card */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Quick Registration / Join Pass Card */}
            <div className={`marvel-card p-6 rounded-3xl space-y-5 bg-[#0A0D1A]/95 shadow-2xl ${isExternalReg ? "border border-arc-cyan/60" : "border border-metallic-gold/40"}`}>
              <div className="space-y-1">
                <span className={`text-[10px] uppercase font-bold tracking-widest font-excon-bold flex items-center gap-1 ${isExternalReg ? "text-arc-cyan" : "text-metallic-gold"}`}>
                  <span>{isExternalReg ? "⚡ Official Hackathon Portal" : "Fast-Track Pass"}</span>
                </span>
                <h3 className="text-xl font-black text-white uppercase font-excon-black">
                  {isExternalReg ? "Hackathon Registration" : (isTeamEvent ? "Assemble Squad" : "Enroll & Pay Online")}
                </h3>
                <p className="text-xs text-white/60">
                  {isExternalReg
                    ? "Registrations for Avengers: Code Assemble (Vibe Coding Hackathon) are officially hosted directly at hackathon.macfast.org."
                    : (isTeamEvent
                        ? "Create your squad, assign yourself as Captain, invite team members, and track independent payments."
                        : (isFree
                            ? "School students enter free with authorized school identity card."
                            : "Register online via UPI / GPay / QR to secure your verified tournament slot & digital pass."))}
                </p>
              </div>

              {isExternalReg ? (
                <a
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-arc-cyan hover:bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_20px_#00D4FF] font-excon-black cursor-pointer text-center flex items-center justify-center gap-2"
                >
                  <span>Register on Hackathon Portal</span>
                  <RiExternalLinkLine className="text-sm" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={handleRegisterClick}
                  className="w-full py-3.5 bg-metallic-gold hover:bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] font-excon-black cursor-pointer text-center block"
                >
                  {isTeamEvent
                    ? (isFree ? "Claim Free Squad Pass" : `Register Squad & Pay Online · ${feeDisplay}`)
                    : (isFree ? "Claim Free Mission Pass" : `Register & Pay Online · ${feeDisplay}`)}
                </button>
              )}

              <div className="text-[10px] text-white/50 space-y-1.5 pt-2 border-t border-white/10 font-mono">
                <div className="flex justify-between">
                  <span>Format</span>
                  <span className="text-white font-bold">{isTeamEvent ? "Team Event" : "Individual Event"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Registration Fee</span>
                  <span className="text-metallic-gold font-bold">{feeDisplay}</span>
                </div>
                <div className="flex justify-between">
                  <span>Registration Portal</span>
                  <span className="text-arc-cyan font-bold font-mono">
                    {isExternalReg ? "hackathon.macfast.org" : (isFree ? "Free Entry" : "Online UPI / QR Gateway")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Pass Type</span>
                  <span className="text-arc-cyan">Instant Digital Pass &amp; QR</span>
                </div>
              </div>
            </div>

            {/* Official Event In-Charge & Committee Command Card */}
            <div className="marvel-card p-6 rounded-3xl border border-arc-cyan/30 space-y-5 bg-[#0A0D1A]/95 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-arc-cyan/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-arc-cyan text-xs font-bold uppercase tracking-wider font-excon-bold">
                  <RiShieldUserLine className="text-base" />
                  <span>Event In-Charge &amp; Committee</span>
                </div>
                <span className="text-[9px] font-mono uppercase bg-arc-cyan/10 text-arc-cyan px-2 py-0.5 rounded border border-arc-cyan/30 font-bold">
                  Official
                </span>
              </div>

              {/* Lead Coordinator */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider block">
                      Student In-Charge / Lead
                    </span>
                    <h4 className="text-base font-black text-white font-excon-bold">
                      {event.coordinator?.name}
                    </h4>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-arc-cyan/10 border border-arc-cyan/30 flex items-center justify-center text-arc-cyan shrink-0">
                    <RiUserLine size={18} />
                  </div>
                </div>

                {/* Helpline Phone Call Button */}
                {event.coordinator?.phone && (
                  <div className="pt-2 border-t border-white/10">
                    <a
                      href={`tel:${event.coordinator.phone.replace(/[^0-9+]/g, "")}`}
                      className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-arc-cyan/15 hover:bg-arc-cyan text-arc-cyan hover:text-black font-mono font-bold text-xs transition-all border border-arc-cyan/40 hover:shadow-[0_0_20px_#00D4FF]"
                    >
                      <RiPhoneLine size={15} />
                      <span className="tracking-wider">{event.coordinator.phone}</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Full Committee Team Roster (e.g. for Treasure Hunt or Joint In-Charges) */}
              {event.coordinator?.team && event.coordinator.team.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] uppercase font-bold text-metallic-gold tracking-wider flex items-center gap-1">
                    <RiTeamLine />
                    <span>Event Organizing Team ({event.coordinator.team.length} Coordinators)</span>
                  </span>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1 select-scrollbar">
                    {event.coordinator.team.map((member, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 hover:border-white/20 transition-all text-xs"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="block font-bold text-white truncate">{member.name}</span>
                          {member.detail && (
                            <span className="block text-[10px] text-white/50 font-mono">{member.detail}</span>
                          )}
                        </div>
                        {member.phone && (
                          <a
                            href={`tel:${member.phone.replace(/[^0-9+]/g, "")}`}
                            className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-arc-cyan/10 hover:bg-arc-cyan text-arc-cyan hover:text-black font-mono font-bold text-[11px] transition-all border border-arc-cyan/30"
                          >
                            <RiPhoneLine size={11} />
                            <span>Call</span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[10px] text-white/40 leading-relaxed font-mono">
                Contact the event in-charge for reporting times, workstations, rules verification, and mission coordination.
              </p>
            </div>

            {/* Directory Back Link */}
            <div className="text-center pt-2">
              <Link to="/events" className="text-xs text-arc-cyan font-bold hover:underline inline-flex items-center gap-1">
                <RiCompass3Line />
                <span>← Back to All Event Missions</span>
              </Link>
            </div>

          </div>

        </div>

      </div>

      {/* Team Registration Modal */}
      <CreateTeamModal
        isOpen={showTeamModal}
        event={event}
        user={currentUser}
        onClose={() => setShowTeamModal(false)}
        onSuccess={(createdReg) => {
          navigate("/student-dashboard");
        }}
      />
    </div>
  );
}

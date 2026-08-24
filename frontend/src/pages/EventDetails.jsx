import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  RiContactsLine,
  RiShieldLine,
  RiCheckLine,
  RiCloseLine,
  RiShieldCheckLine,
  RiShieldFlashLine,
  RiRobot2Line,
  RiFlashlightLine,
} from "react-icons/ri";
import { getEvent, getEvents } from "../services/api";
import { ALL_EVENTS } from "../lib/eventsData";
import { BackgroundVideo } from "../components/ui/BackgroundVideo";
import { usePageSeo } from "../hooks/usePageSeo";

export default function EventDetails() {
  const { idOrSlug } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

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
          prizePool: d.prize_pool ? Number(d.prize_pool) : (local?.prizePool || 15000),
          venue: d.venue || local?.venue || "Main Campus Auditorium",
          time: d.event_time ? `Day 1, ${d.event_time}` : (local?.time || "10:00 AM onwards"),
          rules: Array.isArray(d.rules) ? d.rules : (typeof d.rules === "string" && d.rules ? d.rules.split("\n") : (local?.rules || [
            "Valid college / school ID card is mandatory for participation.",
            "Decision of the event judges and coordinators shall be final.",
            "Report to the assigned arena 15 minutes before mission start.",
          ])),
          coordinator: {
            name: d.coordinator_name || local?.coordinator?.name || "Prof. Alexander / S.H.I.E.L.D. Staff",
            phone: d.coordinator_phone || local?.coordinator?.phone || "+91 94470 12345",
            email: d.coordinator_email || local?.coordinator?.email || "fest@macfast.org",
          }
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

  const feeDisplay = event.registrationFee === 0 ? "FREE PASS" : `₹${event.registrationFee}`;

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

            {/* Badges Top Left */}
            <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
              <span className="px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-full bg-marvel-red text-white shadow-[0_0_12px_#ED1D24] font-excon-black">
                ⚡ {event.hero || "Avenger Hero"}
              </span>
              <span className="px-3 py-1 text-[10px] font-bold text-arc-cyan bg-black/80 rounded-full border border-arc-cyan/30 uppercase tracking-wider font-mono">
                {event.subtitle || `${event.category} Challenge`}
              </span>
            </div>

            {/* Level Tag Top Right */}
            <div className="absolute top-4 right-4 z-20">
              <span className="px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full bg-metallic-gold/20 text-metallic-gold border border-metallic-gold/40 font-excon-black">
                {event.level || "Level: Alpha"}
              </span>
            </div>

            {/* Title Over Banner */}
            <div className="absolute bottom-6 left-6 right-6 z-20 space-y-2">
              <div className="flex items-center gap-2 text-metallic-gold text-xs font-bold uppercase tracking-wider font-excon-bold">
                <RiShieldFlashLine />
                <span>S.H.I.E.L.D. TACTICAL BRIEFING</span>
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white font-excon-black leading-none">
                {event.title}
              </h1>
            </div>
          </div>

          {/* Key Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-white/10 bg-black/40 border-t border-white/10 text-center font-excon">
            <div className="p-4 space-y-1">
              <span className="block text-[10px] uppercase font-bold text-white/50 tracking-wider font-excon-bold">Bounty Prize Pool</span>
              <span className="block text-base sm:text-lg font-black text-metallic-gold font-excon-black">
                {typeof event.prizePool === "number" ? `₹${event.prizePool.toLocaleString("en-IN")}` : event.prizePool}
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
          
          {/* Left Column (8 cols): Description & Protocol Rules */}
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
            </div>

            {/* Protocol Rules Directives */}
            <div className="marvel-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4 bg-[#0A0D1A]/90">
              <div className="inline-flex items-center gap-2 text-metallic-gold text-xs font-bold uppercase tracking-wider font-excon-bold">
                <RiShieldLine />
                <span>Battle Protocols &amp; Directives</span>
              </div>

              <div className="space-y-3 pt-2">
                {(event.rules || []).map((rule, idx) => (
                  <div key={idx} className="p-3.5 bg-black/40 border border-white/10 rounded-2xl flex items-start gap-3 text-xs sm:text-sm">
                    <span className="w-5 h-5 rounded-full bg-arc-cyan/20 text-arc-cyan font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-mono">
                      {idx + 1}
                    </span>
                    <span className="text-white/80 leading-relaxed font-excon">{rule}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column (4 cols): Coordinator & Action Card */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Quick Registration / Join Pass Card */}
            <div className="marvel-card p-6 rounded-3xl border border-metallic-gold/40 space-y-5 bg-[#0A0D1A]/95 shadow-2xl">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-metallic-gold tracking-widest font-excon-bold">Fast-Track Pass</span>
                <h3 className="text-xl font-black text-white uppercase font-excon-black">Enroll &amp; Pay Online</h3>
                <p className="text-xs text-white/60">
                  {event.registrationFee === 0
                    ? "School students enter free with authorized school pass."
                    : "Register online via UPI / GPay / QR to secure your verified tournament slot & digital pass."}
                </p>
              </div>

              <Link
                to={`/checkout?event=${event.slug || event.id}`}
                className="w-full py-3.5 bg-metallic-gold hover:bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] font-excon-black cursor-pointer text-center block"
              >
                Register &amp; Pay Online · {feeDisplay}
              </Link>

              <div className="text-[10px] text-white/50 space-y-1.5 pt-2 border-t border-white/10 font-mono">
                <div className="flex justify-between">
                  <span>Registration Fee</span>
                  <span className="text-metallic-gold font-bold">{feeDisplay}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Mode</span>
                  <span className="text-emerald-400 font-bold">Online UPI / QR Gateway</span>
                </div>
                <div className="flex justify-between">
                  <span>Pass Type</span>
                  <span className="text-arc-cyan">Instant Digital Pass &amp; QR</span>
                </div>
              </div>
            </div>

            {/* Coordinator Card */}
            <div className="marvel-card p-6 rounded-3xl border border-white/10 space-y-4 bg-[#0A0D1A]/90">
              <div className="flex items-center gap-2 text-metallic-gold text-xs font-bold uppercase tracking-wider font-excon-bold">
                <RiContactsLine />
                <span>Mission Commander</span>
              </div>

              <div className="space-y-2 text-xs font-excon">
                <div>
                  <span className="block text-white/50 text-[10px] uppercase font-bold">Faculty / Student In-Charge</span>
                  <span className="block text-white font-bold text-sm font-excon-bold mt-0.5">{event.coordinator?.name}</span>
                </div>
                <div>
                  <span className="block text-white/50 text-[10px] uppercase font-bold">Helpline</span>
                  <a href={`tel:${event.coordinator?.phone}`} className="text-arc-cyan font-mono hover:underline font-bold">
                    {event.coordinator?.phone}
                  </a>
                </div>
                <div>
                  <span className="block text-white/50 text-[10px] uppercase font-bold">Inquiry Email</span>
                  <a href={`mailto:${event.coordinator?.email}`} className="text-metallic-gold font-mono hover:underline">
                    {event.coordinator?.email}
                  </a>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Quick Registration Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0A0D1A] border border-arc-cyan/40 w-full max-w-md rounded-3xl p-6 sm:p-8 relative space-y-6 shadow-2xl">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setRegSuccess(false);
              }}
              className="absolute top-5 right-5 p-1 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
            >
              <RiCloseLine size={20} />
            </button>

            {!regSuccess ? (
              <div className="space-y-4 font-excon text-center">
                <div className="w-14 h-14 rounded-2xl bg-arc-cyan/20 border border-arc-cyan/40 text-arc-cyan mx-auto flex items-center justify-center text-2xl shadow-[0_0_15px_#00D4FF]">
                  <RiShieldCheckLine />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-white uppercase font-excon-black">Confirm Mission Pass</h3>
                  <p className="text-xs text-white/70">
                    Registering for <strong className="text-white font-excon-bold">{event.title}</strong>
                  </p>
                </div>

                <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/50">Fee Payable at Desk</span>
                    <span className="font-mono text-metallic-gold font-bold">{feeDisplay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Venue</span>
                    <span className="text-white truncate font-medium">{event.venue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Reporting Time</span>
                    <span className="text-arc-cyan font-medium">{event.time}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setRegSuccess(true)}
                  className="w-full py-3.5 bg-marvel-red hover:bg-white hover:text-black text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_20px_#ED1D24] font-excon-black cursor-pointer"
                >
                  Confirm &amp; Log Pass
                </button>
              </div>
            ) : (
              <div className="text-center space-y-4 font-excon">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center text-2xl border border-emerald-500/40 shadow-[0_0_20px_#10B981]">
                  <RiCheckLine />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-white uppercase font-excon-black">Slot Reserved!</h3>
                  <p className="text-xs text-white/70">
                    Show your student ID card at the desk to complete verification and receive your physical pass.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setRegSuccess(false);
                  }}
                  className="w-full py-3 bg-arc-cyan text-black font-black text-xs uppercase tracking-wider rounded-2xl font-excon-black hover:bg-white"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

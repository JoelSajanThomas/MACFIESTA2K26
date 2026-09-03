import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  RiShieldFlashLine,
  RiShieldCheckLine,
  RiQrCodeLine,
  RiPrinterLine,
  RiArrowLeftLine,
  RiCalendarEventLine,
  RiMapPinLine,
  RiTrophyLine,
  RiBuilding4Line,
  RiUserStarLine,
  RiRestaurantLine,
  RiHotelBedLine,
  RiAwardLine,
  RiTeamLine,
  RiGroupLine,
} from "react-icons/ri";
import StatusChip from "../components/theme/StatusChip";
import BrandLogo from "../components/BrandLogo";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import { BackgroundVideo } from "../components/ui/BackgroundVideo";
import { usePageSeo } from "../hooks/usePageSeo";
import { getCertificate, getPublicFestConfig, getRegistrationPass } from "../services/api";
import { applyPublicFestConfig, registrationQrImageUrl } from "../utils/registrationFees";
import { BRAND } from "../utils/brand";
import { LOADING_MESSAGES } from "../theme/roster";

export function ParticipantPass() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  usePageSeo({
    title: data ? `Entry Pass · ${data.registration_number}` : "S.H.I.E.L.D. Hero Pass · MacFiesta",
    description: "Official MacFiesta Avenger Mission Pass & Entry QR Clearance.",
  });

  useEffect(() => {
    let mounted = true;
    getPublicFestConfig()
      .then((res) => {
        if (mounted) applyPublicFestConfig(res.data);
      })
      .catch(() => {});
    getRegistrationPass(id)
      .then((res) => {
        if (mounted) setData(res.data);
      })
      .catch((err) => {
        if (mounted) {
          const msg = err?.response?.data?.detail || "Could not load your participant pass.";
          setError(msg);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="bg-[#05050A] min-h-screen pt-32 pb-16 flex items-center justify-center font-excon">
        <LoadingState message={LOADING_MESSAGES[3]} variant="multiverse" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-[#05050A] min-h-screen pt-32 pb-16 flex items-center justify-center font-excon px-4">
        <div className="max-w-md w-full marvel-card p-8 rounded-3xl border border-metallic-gold/30 bg-[#0A0D1A] text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-metallic-gold/10 border border-metallic-gold/30 text-metallic-gold flex items-center justify-center mx-auto text-3xl">
            <RiShieldFlashLine />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-metallic-gold tracking-widest font-mono block">
              S.H.I.E.L.D. Clearance Status
            </span>
            <h3 className="text-xl font-black uppercase text-white font-excon-black">
              Pass Locked · Verification Required
            </h3>
            <p className="text-xs text-white/70 font-space leading-relaxed">
              {error || "Your official Entry Pass will become active once your registration details and payment proof have been verified and approved by the Organizing Desk."}
            </p>
          </div>
          <Link
            to="/student-dashboard"
            className="inline-flex items-center justify-center gap-2 w-full py-3 bg-metallic-gold hover:bg-white text-black font-black text-xs uppercase tracking-wider rounded-xl font-excon-bold transition-all shadow-lg"
          >
            <RiArrowLeftLine />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const qrPayload = data.registration_number || data.pass_token || "";
  const qr = registrationQrImageUrl(qrPayload, 260);
  const entryStatus = data.entry_qr_status || "PENDING";
  const paymentOk =
    data.payment_status === "paid" ||
    data.payment_status === "waived" ||
    !(Number(data.payment_amount) > 0);

  return (
    <div className="bg-[#05050A] min-h-screen pt-24 pb-28 sm:pb-20 relative overflow-hidden font-excon">
      {/* Marvel Atmosphere Background */}
      <BackgroundVideo
        src="/MARVEL/Video Project 6.mp4"
        fallbackSrc="/MARVEL/Video Project 4.mp4"
        opacity="opacity-45"
      />
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[350px] rounded-full bg-metallic-gold/5 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[600px] h-[350px] rounded-full bg-arc-cyan/5 blur-[160px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        {/* Header Eyebrow */}
        <div className="text-center space-y-3 print-hide">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)] font-space">
            <RiShieldFlashLine className="animate-pulse text-metallic-gold" />
            <span>S.H.I.E.L.D. SECURITY CLEARANCE PASS</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white font-excon-black">
            <span className="shimmer-text">OFFICIAL HERO</span>{" "}
            <span className="gradient-text-gold">ENTRY PASS</span>
          </h1>

          <p className="text-white/70 text-xs sm:text-sm font-space max-w-lg mx-auto">
            Present this authenticated QR pass at the security checkpoint to gain entry to festival arenas.
          </p>
        </div>

        {/* ─── Hero Pass Badge Card (Printable) ─── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="marvel-card p-6 sm:p-10 rounded-3xl border-2 border-metallic-gold/50 bg-[#0A0D1A]/95 shadow-[0_0_60px_rgba(212,175,55,0.2)] backdrop-blur-2xl relative overflow-hidden"
        >
          {/* Top Banner with Brand */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold tracking-widest text-metallic-gold uppercase">
                {BRAND.festFullName} · 2K26
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-excon-black tracking-tight">
                {data.event_title}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-metallic-gold/20 text-metallic-gold border border-metallic-gold/40 text-xs font-mono font-black">
                PASS #{data.registration_number}
              </span>
              <StatusChip status={data.payment_status} />
            </div>
          </div>

          {/* Pass Body: Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-6">
            {/* Left Col (7 cols): Delegate & Mission Intel */}
            <div className="md:col-span-7 space-y-6">
              {/* Participant Identity */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                <span className="text-[10px] uppercase font-bold text-metallic-gold tracking-widest font-mono flex items-center gap-1.5">
                  <RiUserStarLine /> Verified Delegate / Operative
                </span>
                <div className="text-xl font-black text-white font-excon-bold">
                  {data.participant_name}
                </div>
                <div className="text-xs text-white/70 font-space flex items-center gap-1.5">
                  <RiBuilding4Line className="text-white/40" />
                  <span>{data.college_name}</span>
                </div>
                {data.team_name && (
                  <div className="pt-2 text-xs text-arc-cyan font-space">
                    <strong>Squad / Team:</strong> {data.team_name}
                  </div>
                )}
              </div>

              {/* Event Schedule & Location */}
              <div className="grid grid-cols-2 gap-3 text-xs font-space">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-white/40 font-mono flex items-center gap-1">
                    <RiCalendarEventLine className="text-metallic-gold" /> Date
                  </span>
                  <span className="text-white font-bold">{data.event_date || "Fest Day"}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-white/40 font-mono flex items-center gap-1">
                    <RiMapPinLine className="text-metallic-gold" /> Venue
                  </span>
                  <span className="text-white font-bold truncate block">{data.event_venue || "MACFAST Campus"}</span>
                </div>
              </div>

              {/* Addons Status (Food / Accom) */}
              {(data.needs_accommodation || (data.food_preference && data.food_preference !== "none")) && (
                <div className="flex flex-wrap gap-2 pt-1 text-xs">
                  {data.food_preference && data.food_preference !== "none" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-metallic-gold/10 text-metallic-gold border border-metallic-gold/30 font-space font-bold uppercase text-[11px]">
                      <RiRestaurantLine /> Meal: {data.food_preference}
                    </span>
                  )}
                  {data.needs_accommodation && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-arc-cyan/10 text-arc-cyan border border-arc-cyan/30 font-space font-bold uppercase text-[11px]">
                      <RiHotelBedLine /> Campus Hostel Reserved
                    </span>
                  )}
                </div>
              )}

              {/* Unified Squad Members Roster (All members included under this ONE pass) */}
              {Array.isArray(data.team_members) && data.team_members.length > 0 && (
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2.5">
                  <span className="text-[10px] uppercase font-bold text-arc-cyan tracking-widest font-mono flex items-center gap-1.5">
                    <RiTeamLine /> Squad Operatives Covered Under This Pass (1 QR For All)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-metallic-gold/10 border border-metallic-gold/30 text-metallic-gold flex items-center justify-between">
                      <span className="font-bold">★ {data.participant_name}</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-metallic-gold text-black font-black">Captain</span>
                    </div>
                    {data.team_members
                      .filter((m) => m.invitation_status !== "declined")
                      .map((m, idx) => (
                        <div
                          key={m.id || idx}
                          className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-white/90 flex items-center justify-between"
                        >
                          <span className="truncate">#{idx + 2} {m.name}</span>
                          <span className="text-[9px] text-arc-cyan uppercase px-1.5 py-0.5 rounded bg-arc-cyan/10 border border-arc-cyan/30 font-bold">
                            Member
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Gate Clearance Telemetry */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-white/50">ENTRY GATE CLEARANCE:</span>
                <span className={`font-bold uppercase ${paymentOk ? "text-emerald-400" : "text-amber-400"}`}>
                  {entryStatus}
                </span>
              </div>
            </div>

            {/* Right Col (5 cols): Entry QR Code */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-3xl bg-black/50 border border-metallic-gold/30 text-center space-y-3 shadow-inner">
              <div className="p-3 bg-white rounded-2xl shadow-[0_0_30px_rgba(212,175,55,0.35)] border-2 border-metallic-gold inline-block">
                <img
                  src={qr}
                  alt={`Entry Pass QR for ${data.registration_number}`}
                  width={200}
                  height={200}
                  className={`w-[180px] h-[180px] sm:w-[200px] sm:h-[200px] object-contain rounded-lg ${
                    paymentOk ? "opacity-100" : "opacity-60"
                  }`}
                />
              </div>
              <span className="text-[10px] uppercase font-bold text-metallic-gold tracking-widest font-mono block">
                {paymentOk ? "UNIFIED SQUAD & ENTRY QR" : "PAYMENT PENDING / PROVISIONAL"}
              </span>
              <p className="text-[11px] text-white/50 font-space max-w-xs leading-tight">
                Scan once at entry checkpoint for full squad check-in and all delegate badges.
              </p>
            </div>
          </div>

          {/* Action Bar (Print / Back) */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/10 print-hide">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 py-4 bg-metallic-gold hover:bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_25px_rgba(212,175,55,0.4)] font-excon-black cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <RiPrinterLine className="text-base" />
              <span>Print / Download Official Pass</span>
            </button>
            <Link
              to="/student-dashboard"
              className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition-all border border-white/20 font-excon-bold inline-flex items-center justify-center gap-2 text-center"
            >
              <RiArrowLeftLine />
              <span>Back to Agent Dashboard</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function CertificatePage() {
  const { resultId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  usePageSeo({
    title: "Certificate of Achievement · MacFiesta 2026",
    description: "Official MacFiesta Certificate of Achievement and Participant Honour.",
  });

  useEffect(() => {
    let mounted = true;
    getCertificate(resultId)
      .then((res) => {
        if (mounted) setData(res.data);
      })
      .catch(() => {
        if (mounted) setError("Certificate not available.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [resultId]);

  if (loading) {
    return (
      <div className="bg-[#05050A] min-h-screen pt-32 pb-16 flex items-center justify-center font-excon">
        <LoadingState message="Loading certificate…" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-[#05050A] min-h-screen pt-32 pb-16 flex items-center justify-center font-excon px-4">
        <div className="max-w-md w-full">
          <ErrorState message={error || "Certificate not found"} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#05050A] min-h-screen pt-28 pb-20 relative overflow-hidden font-excon">
      <BackgroundVideo
        src="/MARVEL/Video Project 6.mp4"
        fallbackSrc="/MARVEL/Video Project 4.mp4"
        opacity="opacity-40"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        <div className="text-center space-y-3 print-hide">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)] font-space">
            <RiAwardLine className="text-metallic-gold" />
            <span>HONOUR OF EXCELLENCE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white font-excon-black">
            <span className="shimmer-text">CERTIFICATE OF</span>{" "}
            <span className="gradient-text-gold">ACHIEVEMENT</span>
          </h1>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="marvel-card p-8 sm:p-12 rounded-3xl border-2 border-metallic-gold/50 bg-[#0A0D1A]/95 text-center space-y-6 shadow-2xl backdrop-blur-2xl"
        >
          <span className="text-xs font-mono font-bold tracking-widest text-metallic-gold uppercase">
            {data.fest_name || BRAND.festFullName}
          </span>
          <p className="text-xs text-white/60 uppercase tracking-widest font-space">
            This is proudly presented to
          </p>
          <h2 className="text-3xl sm:text-4xl font-black uppercase text-white font-excon-black shimmer-text">
            {data.participant_name}
          </h2>
          <p className="text-sm text-white/80 font-space">{data.college_name}</p>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 max-w-lg mx-auto text-sm font-space">
            for securing <strong className="text-metallic-gold font-mono">{data.position}</strong> in{" "}
            <strong className="text-white font-excon-bold">{data.event_title}</strong>
          </div>
          {data.remarks && <p className="text-xs text-white/60 italic font-space">{data.remarks}</p>}
          <p className="text-xs font-mono text-white/40">Issued: {data.issued_at || "Fest 2K26"}</p>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/10 print-hide">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 py-4 bg-metallic-gold hover:bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_25px_rgba(212,175,55,0.4)] font-excon-black cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <RiPrinterLine />
              <span>Print Certificate</span>
            </button>
            <Link
              to="/results"
              className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition-all border border-white/20 font-excon-bold inline-flex items-center justify-center gap-2"
            >
              <span>Back to Results</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

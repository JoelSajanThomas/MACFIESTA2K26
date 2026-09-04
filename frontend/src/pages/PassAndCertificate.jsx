import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import {
  RiShieldFlashLine,
  RiPrinterLine,
  RiArrowLeftLine,
  RiAwardLine,
  RiTeamLine,
  RiDownload2Line,
  RiFilePdfLine,
} from "react-icons/ri";
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
  const [downloading, setDownloading] = useState(false);
  const [qrBase64, setQrBase64] = useState("");
  const ticketRef = useRef(null);

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

  useEffect(() => {
    if (!data) return;
    const qrPayload = data.registration_number || data.pass_token || "";
    const rawQr = registrationQrImageUrl(qrPayload, 300);
    // Convert QR to Base64 so html2canvas never encounters CORS canvas tainting
    fetch(rawQr)
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => setQrBase64(reader.result);
        reader.readAsDataURL(blob);
      })
      .catch(() => {
        setQrBase64(rawQr);
      });
  }, [data]);

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
  const qr = qrBase64 || registrationQrImageUrl(qrPayload, 260);
  const paymentOk =
    data.payment_status === "paid" ||
    data.payment_status === "waived" ||
    !(Number(data.payment_amount) > 0);

  async function generateCanvas() {
    if (!ticketRef.current) return null;
    return await html2canvas(ticketRef.current, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
    });
  }

  async function downloadTicketImage() {
    if (downloading) return;
    setDownloading(true);
    try {
      const canvas = await generateCanvas();
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = `macfiesta-pass-${data.registration_number || "entry"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Could not download ticket image:", err);
      window.print();
    } finally {
      setDownloading(false);
    }
  }

  async function downloadTicketPdf() {
    if (downloading) return;
    setDownloading(true);
    try {
      const canvas = await generateCanvas();
      if (!canvas) return;
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pdfWidth = 175;
      const pdfHeight = (1024 / 727) * pdfWidth;
      const x = (210 - pdfWidth) / 2;
      const y = (297 - pdfHeight) / 2;
      pdf.addImage(imgData, "PNG", x, y, pdfWidth, pdfHeight, undefined, "FAST");
      pdf.save(`macfiesta-pass-${data.registration_number || "entry"}.pdf`);
    } catch (err) {
      console.error("Could not download ticket PDF:", err);
      window.print();
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="bg-[#060408] min-h-screen pt-20 pb-28 sm:pb-20 relative overflow-hidden font-excon">
      {/* Ambient Backdrop Synced Directly with the Superhero Ticket Artwork */}
      <div
        className="fixed inset-0 bg-cover bg-center pointer-events-none filter blur-[55px] scale-110 opacity-35 transition-opacity duration-700"
        style={{
          backgroundImage: "url('/pass-ticket-bg.jpg')",
          backgroundPosition: "center 35%",
        }}
      />

      {/* Halftone Comic Dot Pattern Overlay matching the Vintage Comic Ticket */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: "radial-gradient(rgba(212, 175, 55, 0.3) 1.2px, transparent 1.2px)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* Deep Comic Vignette and Warm Atmospheric Glows matching the Ticket Palette */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#080509]/90 via-[#0B0710]/75 to-[#050307]/95 pointer-events-none" />
      <div className="fixed -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-[#e63946]/18 blur-[140px] pointer-events-none" />
      <div className="fixed top-1/3 -left-32 w-[550px] h-[550px] rounded-full bg-[#d4af37]/14 blur-[160px] pointer-events-none" />
      <div className="fixed bottom-10 -right-32 w-[550px] h-[550px] rounded-full bg-[#e63946]/14 blur-[160px] pointer-events-none" />

      {/* Print Specific CSS to Center Official Pass Ticket on Print */}
      <style>{`
        @media print {
          body, html {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .print-hide {
            display: none !important;
          }
          #official-pass-ticket {
            width: 175mm !important;
            height: 246mm !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 space-y-6">
        {/* Header Eyebrow */}
        <div className="text-center space-y-2 print-hide">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-metallic-gold/50 bg-[#d4af37]/15 text-[#ffd700] text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_20px_rgba(212,175,55,0.3)] font-space">
            <RiShieldFlashLine className="animate-pulse text-[#ffd700]" />
            <span>S.H.I.E.L.D. SECURITY CLEARANCE PASS</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white font-excon-black">
            <span className="shimmer-text">OFFICIAL HERO</span>{" "}
            <span className="bg-gradient-to-r from-[#ffd700] via-[#f59e0b] to-[#e63946] bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(212,175,55,0.4)]">
              ENTRY TICKET
            </span>
          </h1>

          <p className="text-white/80 text-xs font-space max-w-md mx-auto">
            Present or download this authenticated QR pass for entry clearance at festival arenas.
          </p>
        </div>

        {/* ─── Superhero Official Downloadable Ticket ─── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center"
        >
          <div
            ref={ticketRef}
            id="official-pass-ticket"
            className="relative w-full max-w-[500px] aspect-[727/1024] rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_50px_rgba(230,57,70,0.25),0_0_80px_rgba(212,175,55,0.2)] border-2 border-metallic-gold/50 hover:border-metallic-gold/80 transition-all duration-300 overflow-hidden select-none"
            style={{
              backgroundImage: "url('/pass-ticket-bg.jpg')",
              backgroundSize: "100% 100%",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* Middle Container for Pass Details: Completely transparent directly on the poster parchment */}
            <div
              className="absolute flex flex-col items-center justify-between text-center box-border"
              style={{
                top: "19%",
                bottom: "22%",
                left: "17%",
                right: "17%",
                padding: "4px 8px",
              }}
            >
              {/* Completely Transparent Pass Details */}
              <div className="w-full h-full bg-transparent flex flex-col items-center justify-between text-center overflow-hidden">
                {/* 1. Header & Pass Badge */}
                <div className="w-full space-y-1">
                  <div className="inline-flex items-center justify-center gap-1.5 text-[8.5px] sm:text-[10px] font-mono font-black tracking-widest text-[#8B0000] uppercase">
                    <RiShieldFlashLine className="text-[#8B0000] text-xs" />
                    <span>MACFIESTA 2026 · OFFICIAL PASS</span>
                  </div>
                  <h2 className="text-xs sm:text-sm md:text-base font-black uppercase text-[#0A0D1A] font-excon-black tracking-tight leading-tight line-clamp-2">
                    {data.event_title}
                  </h2>
                  <div className="flex items-center justify-center gap-2 pt-0.5">
                    <span className="text-[8px] sm:text-[9.5px] font-mono font-black px-2 py-0.5 rounded-md bg-[#0A0D1A] text-[#FFD700] shadow-sm">
                      PASS #{data.registration_number}
                    </span>
                    <span
                      className={`text-[8px] sm:text-[9.5px] font-mono font-black px-2 py-0.5 rounded-md shadow-sm ${
                        paymentOk
                          ? "bg-emerald-700 text-white"
                          : "bg-amber-600 text-white"
                      }`}
                    >
                      {paymentOk ? "APPROVED" : "PENDING"}
                    </span>
                  </div>
                </div>

                {/* 2. Delegate Details */}
                <div className="w-full py-0.5 space-y-0.5">
                  <div className="text-[7.5px] sm:text-[8.5px] uppercase tracking-widest text-[#8B0000] font-mono font-black">
                    OPERATIVE / DELEGATE
                  </div>
                  <div className="text-sm sm:text-base md:text-lg font-black uppercase text-[#0A0D1A] font-excon-black tracking-tight line-clamp-1">
                    {data.participant_name}
                  </div>
                  <div className="text-[9px] sm:text-[10.5px] text-[#334155] font-space font-bold truncate max-w-[92%] mx-auto">
                    {data.college_name}
                  </div>
                  {data.team_name && (
                    <div className="text-[8.5px] sm:text-[9.5px] font-mono text-[#0284c7] font-black truncate">
                      ⚡ SQUAD: {data.team_name}
                    </div>
                  )}
                </div>

                {/* 3. Schedule, Venue & Addons */}
                <div className="w-full text-[8.5px] sm:text-[9.5px] font-mono text-[#1E293B] font-bold space-y-0.5">
                  <div className="flex items-center justify-center gap-2">
                    <span>📅 {data.event_date || "Fest Day"}</span>
                    <span>•</span>
                    <span className="truncate max-w-[130px]">📍 {data.event_venue || "MACFAST Campus"}</span>
                  </div>
                  {(data.needs_accommodation || (data.food_preference && data.food_preference !== "none")) && (
                    <div className="flex items-center justify-center gap-1.5 pt-0.5">
                      {data.food_preference && data.food_preference !== "none" && (
                        <span className="px-2 py-0.5 rounded-full bg-[#0A0D1A]/10 text-[#0A0D1A] border border-[#0A0D1A]/30 text-[8px] sm:text-[8.5px] font-bold">
                          🍽 {data.food_preference}
                        </span>
                      )}
                      {data.needs_accommodation && (
                        <span className="px-2 py-0.5 rounded-full bg-sky-700/15 text-sky-900 border border-sky-700/40 text-[8px] sm:text-[8.5px] font-bold">
                          🛏 HOSTEL
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* 4. Entry QR Code */}
                <div className="flex flex-col items-center justify-center pt-0.5">
                  <div className="p-1.5 sm:p-2 bg-white rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.25)] border-2 border-[#0A0D1A] inline-block">
                    <img
                      src={qr}
                      alt={`Entry QR for ${data.registration_number}`}
                      crossOrigin="anonymous"
                      className="w-[72px] h-[72px] sm:w-[92px] sm:h-[92px] object-contain rounded"
                    />
                  </div>
                  <span className="text-[7.5px] sm:text-[9px] uppercase font-mono font-black tracking-widest text-[#0A0D1A] mt-1">
                    SCAN FOR ENTRY CHECKPOINT
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar (Download Image, Download PDF, Print) */}
          <div className="w-full max-w-[500px] flex flex-col sm:flex-row gap-3 pt-6 print-hide">
            <button
              type="button"
              onClick={downloadTicketImage}
              disabled={downloading}
              className="flex-1 py-3.5 px-4 bg-gradient-to-r from-[#d4af37] via-[#ffd700] to-[#f59e0b] hover:brightness-110 text-[#0A0D1A] font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_30px_rgba(212,175,55,0.45)] hover:shadow-[0_0_40px_rgba(212,175,55,0.7)] font-excon-black cursor-pointer inline-flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <RiDownload2Line className="text-base text-[#0A0D1A]" />
              <span>{downloading ? "Generating…" : "Download Pass (PNG)"}</span>
            </button>
            <button
              type="button"
              onClick={downloadTicketPdf}
              disabled={downloading}
              className="flex-1 py-3.5 px-4 bg-[#0A0D1A]/90 hover:bg-[#0A0D1A] text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition-all border border-metallic-gold/50 hover:border-metallic-gold font-excon-bold inline-flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.15)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <RiFilePdfLine className="text-base text-metallic-gold" />
              <span>Download PDF</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="py-3.5 px-4 bg-white/5 hover:bg-white/15 text-white/90 hover:text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all border border-white/15 hover:border-white/30 font-excon-bold inline-flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              title="Print pass"
            >
              <RiPrinterLine />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>

          {/* Squad Roster Breakdown (if team registration) */}
          {Array.isArray(data.team_members) && data.team_members.length > 0 && (
            <div className="w-full max-w-[500px] mt-6 p-4 rounded-2xl bg-[#0A0D1A]/95 border border-metallic-gold/30 space-y-2.5 print-hide">
              <span className="text-[10px] uppercase font-bold text-arc-cyan tracking-widest font-mono flex items-center gap-1.5">
                <RiTeamLine /> Squad Operatives Covered Under This Pass
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded-xl bg-metallic-gold/10 border border-metallic-gold/30 text-metallic-gold flex items-center justify-between">
                  <span className="font-bold truncate">★ {data.participant_name}</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-metallic-gold text-black font-black">Captain</span>
                </div>
                {data.team_members
                  .filter((m) => m.invitation_status !== "declined")
                  .map((m, idx) => (
                    <div
                      key={m.id || idx}
                      className="p-2 rounded-xl bg-black/40 border border-white/10 text-white/90 flex items-center justify-between"
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

          <div className="w-full max-w-[500px] pt-4 print-hide text-center">
            <Link
              to="/student-dashboard"
              className="inline-flex items-center justify-center gap-2 text-xs text-white/70 hover:text-white font-space py-2 transition-colors"
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

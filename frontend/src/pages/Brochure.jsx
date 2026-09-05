import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  RiFileDownloadLine,
  RiShieldFlashLine,
  RiCompass3Line,
  RiExternalLinkLine,
  RiUploadCloud2Line,
  RiSettings3Line,
} from "react-icons/ri";
import { usePageSeo } from "../hooks/usePageSeo";
import { useSiteSettings } from "../hooks/useSiteSettings";
import { mediaUrl, isLoggedIn, getCurrentUser } from "../services/api";

export default function Brochure() {
  usePageSeo({
    title: "Official Brochure · MacFiesta 2026",
    description: "Download the comprehensive national festival brochure featuring event details, cash prize breakdowns, rules, schedules, and MACFAST campus map.",
  });

  const navigate = useNavigate();
  const settings = useSiteSettings() || {};
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (isLoggedIn()) {
      getCurrentUser()
        .then((res) => setCurrentUser(res.data))
        .catch(() => setCurrentUser(null));
    }
  }, []);

  const isStaff = Boolean(currentUser?.is_staff || currentUser?.is_superuser);

  const hasConfiguredBrochure = Boolean(settings.brochure_file || settings.brochure_url);
  const brochureTarget = settings.brochure_file
    ? mediaUrl(settings.brochure_file)
    : settings.brochure_url || (hasConfiguredBrochure ? "/brochure.pdf" : null);

  const handleDownload = () => {
    if (!brochureTarget) {
      if (isStaff) {
        if (window.confirm("No official brochure has been uploaded yet. Would you like to go to the Admin portal to upload one now?")) {
          navigate("/admin/brochure");
          return;
        }
      }
      alert("Brochure file is currently being updated by the organizing committee. Please check back shortly!");
      return;
    }
    window.open(brochureTarget, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="bg-[#05050A] min-h-screen pt-28 pb-16 text-white font-mono relative overflow-hidden">
      {/* Background Marvel Image Backdrop */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/MARVEL/strange.jpg"
          alt="Brochure Marvel Backdrop"
          className="w-full h-full object-cover object-center opacity-85 contrast-[1.05] saturate-[1.1] brightness-[0.92]"
        />
        {/* Subtle cinematic gradient to preserve brochure download card readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#05050A]/40 via-black/25 to-[#05050A]/85 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(5,5,10,0.6)_100%)] pointer-events-none" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)]">
          <RiShieldFlashLine className="animate-pulse text-metallic-gold" />
          <span>OFFICIAL FESTIVAL DIRECTIVE • 2K26</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight font-excon-black">
          <span className="shimmer-text">MACFIESTA PRO</span>{" "}
          <span className="gradient-text-gold">OFFICIAL BROCHURE</span>
        </h1>

        <p className="text-sm text-white/70 max-w-xl mx-auto font-excon">
          Download the comprehensive national festival brochure featuring event details, cash prize breakdowns, rules, schedules, and MACFAST campus map.
        </p>

        <div className="p-8 marvel-card rounded-3xl border border-arc-cyan/30 bg-[#0A0D1A] space-y-6 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-marvel-red to-rose-700 mx-auto flex items-center justify-center text-white text-3xl shadow-[0_0_20px_#ED1D24]">
            📄
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white uppercase font-excon-bold">
              {settings?.event_name || "MacFiesta 2K26"} Directive
            </h2>
            <p className="text-xs text-white/50">
              Official Print &amp; Digital Edition • Verified by Committee
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownload}
            className="w-full py-3.5 px-8 text-xs font-bold uppercase inline-flex items-center justify-center gap-2 shadow-[0_0_25px_#ED1D24] bg-marvel-red hover:bg-white hover:text-black transition-all rounded-full cursor-pointer group"
          >
            <RiFileDownloadLine className="text-lg group-hover:scale-110 transition-transform" />
            <span>Download Official Brochure PDF</span>
            <RiExternalLinkLine className="text-xs opacity-60" />
          </button>

          {isStaff && (
            <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-2">
              <Link
                to="/admin/brochure"
                className="text-[11px] font-bold text-metallic-gold hover:text-white uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors py-1 px-3 rounded-lg bg-metallic-gold/10 border border-metallic-gold/30 hover:bg-metallic-gold/20"
              >
                <RiUploadCloud2Line className="text-sm" />
                <span>Admin: Upload / Change Brochure PDF</span>
              </Link>
            </div>
          )}
        </div>

        <div className="pt-4">
          <Link to="/" className="text-xs text-arc-cyan font-bold hover:underline inline-flex items-center gap-1">
            <RiCompass3Line />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

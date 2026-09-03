import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiShieldFlashLine,
  RiMailLine,
  RiArrowRightLine,
  RiLockLine,
  RiCheckDoubleLine,
} from "react-icons/ri";
import { requestPasswordReset } from "../services/api";
import { BackgroundVideo } from "../components/ui/BackgroundVideo";
import { usePageSeo } from "../hooks/usePageSeo";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseApiError(err) {
  const data = err?.response?.data;
  if (!data) return "Could not initiate password recovery protocol. Please try again.";
  if (typeof data === "string") return data;
  if (data.detail) return Array.isArray(data.detail) ? data.detail[0] : String(data.detail);
  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const val = data[firstKey];
    return Array.isArray(val) ? val[0] : String(val);
  }
  return "Could not initiate password recovery protocol. Please try again.";
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notRegistered, setNotRegistered] = useState(false);
  const [success, setSuccess] = useState(false);

  usePageSeo({
    title: "Account Recovery · MacFiesta 2026",
    description: "Transmit a secure 6-digit one-time access passcode to recover your MacFiesta account.",
  });

  async function handleSubmit(e) {
    e.preventDefault();
    const cleaned = email.trim().toLowerCase();
    if (!EMAIL_RE.test(cleaned)) {
      setError("Please provide a valid operative email address.");
      return;
    }
    setLoading(true);
    setError("");
    setNotRegistered(false);
    try {
      await requestPasswordReset(cleaned);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/reset-password?email=${encodeURIComponent(cleaned)}`);
      }, 1200);
    } catch (err) {
      setError(parseApiError(err));
      if (err?.response?.data?.not_registered || err?.response?.status === 404) {
        setNotRegistered(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#05050A] min-h-screen pt-28 pb-16 flex items-center justify-center font-excon relative overflow-hidden">
      {/* Background Video Loop */}
      <BackgroundVideo
        src="/MARVEL/Video Project 6.mp4"
        fallbackSrc="/MARVEL/Video Project 4.mp4"
        opacity="opacity-75"
      />

      <div className="max-w-md w-full mx-auto px-4 relative z-10">
        <div className="marvel-card p-6 sm:p-8 rounded-3xl border border-arc-cyan/40 bg-[#0A0D1A]/95 shadow-2xl relative space-y-6">
          
          {/* Top S.H.I.E.L.D. Badge */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-arc-cyan/30 bg-arc-cyan/10 text-arc-cyan text-[10px] font-bold uppercase tracking-widest font-mono">
              <RiShieldFlashLine />
              <span>S.H.I.E.L.D. RECOVERY PROTOCOL</span>
            </div>
            <span className="text-[10px] font-black text-metallic-gold uppercase tracking-wider font-excon-black">
              Level 10 Clearance
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-excon-black">
              Recover Access Key
            </h2>
            <p className="text-xs text-white/60 font-excon">
              Enter your registered operative email. We will transmit a 6-digit OTP code to verify and restore your access.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3.5 bg-marvel-red/20 border border-marvel-red/40 text-marvel-red text-xs rounded-xl font-mono text-center space-y-2"
              >
                <p>{error}</p>
                {notRegistered && (
                  <div className="pt-1">
                    <Link
                      to={`/register?email=${encodeURIComponent(email)}`}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-marvel-red hover:bg-white text-white hover:text-black font-bold uppercase tracking-wider text-[11px] rounded-xl transition-all shadow-[0_0_12px_#ED1D24] font-excon-bold"
                    >
                      <span>Register New Account →</span>
                    </Link>
                  </div>
                )}
              </motion.div>
            )}

            {success && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl font-mono text-center flex items-center justify-center gap-2"
              >
                <RiCheckDoubleLine className="text-base text-emerald-400" />
                <span>OTP Transmitted! Redirecting to verification terminal...</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4 font-excon">
            <div>
              <label
                htmlFor="forgot-email"
                className="block text-[10px] uppercase font-bold tracking-wider text-white/50 mb-1.5 font-excon-bold"
              >
                Registered Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                  <RiMailLine size={16} />
                </div>
                <input
                  id="forgot-email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                    setNotRegistered(false);
                  }}
                  autoComplete="email"
                  required
                  placeholder="agent@avengers.hq"
                  disabled={loading || success}
                  className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:border-arc-cyan focus:ring-1 focus:ring-arc-cyan transition-all font-mono placeholder:text-white/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3.5 bg-metallic-gold hover:bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.7)] font-excon-black flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>TRANSMITTING OTP...</span>
                </>
              ) : (
                <>
                  <span>TRANSMIT 6-DIGIT OTP</span>
                  <RiArrowRightLine size={14} />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60">
            <div className="flex items-center gap-1.5">
              <RiLockLine className="text-arc-cyan" />
              <span>Remembered password?</span>
            </div>
            <Link
              to="/login"
              className="text-arc-cyan hover:text-white font-bold tracking-wider uppercase font-excon-bold transition-colors"
            >
              Back to Login →
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

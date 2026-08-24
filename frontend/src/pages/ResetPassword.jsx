import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiShieldFlashLine,
  RiMailLine,
  RiKey2Line,
  RiLockLine,
  RiEyeLine,
  RiEyeOffLine,
  RiCheckDoubleLine,
  RiArrowRightLine,
} from "react-icons/ri";
import { confirmPasswordReset } from "../services/api";
import { BackgroundVideo } from "../components/ui/BackgroundVideo";
import { usePageSeo } from "../hooks/usePageSeo";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_RE = /^\d{6}$/;

function parseApiError(err) {
  const data = err?.response?.data;
  if (!data) return "Could not reset password. Please verify your OTP and try again.";
  if (typeof data === "string") return data;
  if (data.detail) return Array.isArray(data.detail) ? data.detail[0] : String(data.detail);
  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const val = data[firstKey];
    return Array.isArray(val) ? val[0] : String(val);
  }
  return "Could not reset password. Please verify your OTP and try again.";
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromQuery = useMemo(() => searchParams.get("email") || "", [searchParams]);
  const uid = useMemo(() => searchParams.get("uid") || "", [searchParams]);
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const legacyLink = Boolean(uid && token);

  const [email, setEmail] = useState(emailFromQuery);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  usePageSeo({
    title: "Verify OTP & Reset Password · MacFiesta 2026",
    description: "Verify your one-time code and set a new secure passcode for your MacFiesta account.",
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (legacyLink) {
        await confirmPasswordReset({
          uid,
          token,
          password,
          password_confirm: passwordConfirm,
        });
      } else {
        const cleanedEmail = email.trim().toLowerCase();
        if (!EMAIL_RE.test(cleanedEmail)) {
          setError("Enter a valid email address.");
          setLoading(false);
          return;
        }
        if (!OTP_RE.test(otp.trim())) {
          setError("OTP must be exactly 6 numeric digits.");
          setLoading(false);
          return;
        }
        await confirmPasswordReset({
          email: cleanedEmail,
          otp: otp.trim(),
          password,
          password_confirm: passwordConfirm,
        });
      }
      setDone(true);
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#05050A] min-h-screen pt-28 pb-16 flex items-center justify-center font-excon relative overflow-hidden">
      {/* Background Video Loop */}
      <BackgroundVideo
        src="/MARVEL/Video Project 4.mp4"
        fallbackSrc="/MARVEL/Video Project 6.mp4"
        opacity="opacity-75"
      />

      <div className="max-w-md w-full mx-auto px-4 relative z-10">
        <div className="marvel-card p-6 sm:p-8 rounded-3xl border border-arc-cyan/40 bg-[#0A0D1A]/95 shadow-2xl relative space-y-6">
          
          {/* Top Badge */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-arc-cyan/30 bg-arc-cyan/10 text-arc-cyan text-[10px] font-bold uppercase tracking-widest font-mono">
              <RiShieldFlashLine />
              <span>S.H.I.E.L.D. PASSCODE RESET</span>
            </div>
            <span className="text-[10px] font-black text-metallic-gold uppercase tracking-wider font-excon-black">
              Terminal Alpha
            </span>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-excon-black">
              Set New Password
            </h2>
            <p className="text-xs text-white/60 font-excon">
              {legacyLink
                ? "Choose a new secure password for your MacFiesta account."
                : "Enter the 6-digit OTP from your email, then choose a new password."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3 bg-marvel-red/20 border border-marvel-red/40 text-marvel-red text-xs rounded-xl font-mono text-center"
              >
                {error}
              </motion.div>
            )}

            {done && (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl font-mono text-center flex items-center justify-center gap-2"
              >
                <RiCheckDoubleLine className="text-base text-emerald-400" />
                <span>Password updated successfully! Redirecting to login...</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4 font-excon">
            {!legacyLink && (
              <>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-white/50 mb-1.5 font-excon-bold">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                      <RiMailLine size={16} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      autoComplete="email"
                      required
                      placeholder="agent@avengers.hq"
                      disabled={loading || done}
                      className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:border-arc-cyan focus:ring-1 focus:ring-arc-cyan transition-all font-mono placeholder:text-white/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-white/50 mb-1.5 font-excon-bold">
                    6-Digit OTP Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-metallic-gold">
                      <RiKey2Line size={16} />
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="\d{6}"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                        setError("");
                      }}
                      autoComplete="one-time-code"
                      required
                      placeholder="• • • • • •"
                      disabled={loading || done}
                      className="w-full pl-10 pr-4 py-3 bg-black/40 border border-metallic-gold/30 rounded-2xl text-metallic-gold text-lg tracking-[0.4em] font-black focus:outline-none focus:border-metallic-gold focus:ring-1 focus:ring-metallic-gold transition-all font-mono placeholder:text-white/20 placeholder:tracking-normal placeholder:text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-white/50 mb-1.5 font-excon-bold">
                New Passcode (Min. 8 characters)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                  <RiLockLine size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  placeholder="••••••••••••"
                  disabled={loading || done}
                  className="w-full pl-10 pr-10 py-3 bg-black/40 border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:border-arc-cyan focus:ring-1 focus:ring-arc-cyan transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/40 hover:text-white transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-white/50 mb-1.5 font-excon-bold">
                Confirm New Passcode
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                  <RiLockLine size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordConfirm}
                  onChange={(e) => {
                    setPasswordConfirm(e.target.value);
                    setError("");
                  }}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  placeholder="••••••••••••"
                  disabled={loading || done}
                  className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:border-arc-cyan focus:ring-1 focus:ring-arc-cyan transition-all font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || done}
              className="w-full py-3.5 bg-metallic-gold hover:bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.7)] font-excon-black flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>UPDATING PASSCODE...</span>
                </>
              ) : (
                <>
                  <span>CONFIRM &amp; UPDATE PASSWORD</span>
                  <RiArrowRightLine size={14} />
                </>
              )}
            </button>
          </form>

          {/* Footer Nav */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
            <Link
              to="/forgot-password"
              className="text-white/60 hover:text-white transition-colors"
            >
              Need new OTP?
            </Link>
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

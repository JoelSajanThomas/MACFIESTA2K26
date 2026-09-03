import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  RiShieldFlashLine,
  RiLockLine,
  RiMailLine,
  RiEyeLine,
  RiEyeOffLine,
} from "react-icons/ri";
import { login, getCurrentUser, storeAuthTokens } from "../services/api";
import { notifyAuthChange } from "../utils/auth";
import { defaultAdminPath, volunteerHomePath } from "../utils/committeeAccess";
import { BackgroundVideo } from "../components/ui/BackgroundVideo";
import { usePageSeo } from "../hooks/usePageSeo";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = useMemo(() => searchParams.get("next") || "", [searchParams]);

  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  usePageSeo({
    title: "Agent Sign In · MacFiesta 2026",
    description: "Sign in to access your S.H.I.E.L.D. agent tournament dashboard and passes.",
  });

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await login({
        username: form.username.trim(),
        password: form.password,
      });
      storeAuthTokens(res.data);
      notifyAuthChange();

      let user;
      try {
        const userRes = await getCurrentUser();
        user = userRes.data;
      } catch {
        setError("Signed in, but could not load your profile. Please refresh and try again.");
        return;
      }

      if (user.is_active === false) {
        setError("This account is inactive. Contact MacFiesta administration.");
        return;
      }

      if (nextPath.startsWith("/")) {
        navigate(nextPath);
      } else if (user.must_change_password) {
        navigate("/change-password");
      } else if (user.is_staff || user.is_superuser) {
        const committee = user.is_superuser ? "core" : user.committee;
        if (committee && committee !== "core") {
          navigate(volunteerHomePath(committee, user.modules || []));
        } else {
          navigate(defaultAdminPath(user.modules || [], "core"));
        }
      } else {
        navigate("/student-dashboard");
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 429) {
        setError("Too many login attempts. Please wait a minute and try again.");
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const registerHref = nextPath ? `/register?next=${encodeURIComponent(nextPath)}` : "/register";

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

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-arc-cyan/30 bg-arc-cyan/10 text-arc-cyan text-[10px] font-bold uppercase tracking-widest font-mono">
              <RiShieldFlashLine />
              <span>S.H.I.E.L.D. SECURE LOGIN</span>
            </div>
            <span className="text-[10px] font-black text-metallic-gold uppercase tracking-wider font-excon-black">
              Delegate Portal
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-excon-black">
              Sign In to Command
            </h2>
            <p className="text-xs text-white/60 font-excon">
              Enter your credentials to manage your mission passes and certificates.
            </p>
          </div>

          {nextPath && nextPath.includes("checkout") && (
            <div className="p-3.5 bg-metallic-gold/10 border border-metallic-gold/30 rounded-2xl text-[11px] text-white/80 space-y-1 font-space">
              <div className="flex items-center gap-1.5 text-metallic-gold font-bold uppercase tracking-wider text-[10px] font-excon-bold">
                <RiLockLine />
                <span>Participant Clearance Required</span>
              </div>
              <p className="leading-relaxed">
                Event registration and online payment are exclusively for registered participants. Please sign in or create an account below to complete your pass.
              </p>
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-marvel-red/20 border border-marvel-red/40 text-marvel-red text-xs rounded-xl font-mono text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 font-excon">
            <div>
              <label
                htmlFor="login-username"
                className="block text-[10px] uppercase font-bold tracking-wider text-white/50 mb-1.5 font-excon-bold"
              >
                Email Address or Username
              </label>
              <div className="relative">
                <RiMailLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm" />
                <input
                  id="login-username"
                  type="text"
                  name="username"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-arc-cyan focus:outline-none text-white text-xs font-excon"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-[10px] uppercase font-bold tracking-wider text-white/50 mb-1.5 font-excon-bold"
              >
                Password
              </label>
              <div className="relative">
                <RiLockLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-arc-cyan focus:outline-none text-white text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  {showPassword ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-arc-cyan hover:bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_20px_#00D4FF] font-excon-black cursor-pointer mt-2"
            >
              {loading ? "Authenticating Clearance..." : "Authorize Access"}
            </button>
          </form>

          {/* Switch to Register */}
          <div className="text-center pt-2 border-t border-white/10 space-y-1">
            <p className="text-xs text-white/60 font-excon">
              Need a new Agent clearance?{" "}
              <Link to={registerHref} className="text-arc-cyan hover:text-white font-bold font-excon-bold">
                Create Account
              </Link>
            </p>
            <p className="text-[11px] text-white/40 font-excon">
              <Link to="/forgot-password" className="hover:text-white transition-colors">
                Forgot password?
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

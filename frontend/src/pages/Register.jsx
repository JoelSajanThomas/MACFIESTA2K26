import { useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  RiShieldFlashLine,
  RiLockLine,
  RiMailLine,
  RiUserLine,
  RiSmartphoneLine,
  RiBuilding4Line,
  RiEyeLine,
  RiEyeOffLine,
} from "react-icons/ri";
import { registerAccount, getCurrentUser, storeAuthTokens } from "../services/api";
import { notifyAuthChange } from "../utils/auth";
import { saveParticipantProfile } from "../utils/participantProfile";
import { BackgroundVideo } from "../components/ui/BackgroundVideo";
import { usePageSeo } from "../hooks/usePageSeo";

function parseApiError(err) {
  const data = err?.response?.data;
  if (!data) return "Could not create your account. Please check your credentials.";
  if (typeof data === "string") return data;
  if (data.detail) return Array.isArray(data.detail) ? data.detail[0] : String(data.detail);
  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const val = data[firstKey];
    const msg = Array.isArray(val) ? val[0] : String(val);
    return `${firstKey.replace(/_/g, " ")}: ${msg}`;
  }
  return "Could not create your account. Please try again.";
}

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = useMemo(() => searchParams.get("next") || "", [searchParams]);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    college_name: "",
    password: "",
    password_confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  usePageSeo({
    title: "Agent Registration · MacFiesta 2026",
    description: "Create your S.H.I.E.L.D. agent account to register for competitions and access your tournament badge.",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrorMsg("");
  }

  function handleNextStep(e) {
    e.preventDefault();
    setErrorMsg("");

    if (step === 1) {
      if (!form.full_name.trim()) {
        setErrorMsg("Please enter your full name.");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email.trim())) {
        setErrorMsg("Please enter a valid email address.");
        return;
      }
      const digits = form.phone.replace(/\D/g, "");
      if (digits.length < 10) {
        setErrorMsg("Please enter a valid 10-digit mobile number.");
        return;
      }
      setStep(2);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.college_name.trim()) {
      setErrorMsg("Please enter your College or School name.");
      return;
    }
    if (form.password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }
    if (form.password !== form.password_confirm) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const payload = {
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        college_name: form.college_name.trim(),
        password: form.password,
        password_confirm: form.password_confirm,
      };

      const res = await registerAccount(payload);
      if (res.data?.access) {
        storeAuthTokens(res.data);
        saveParticipantProfile({
          full_name: payload.full_name,
          college_name: payload.college_name,
          phone: payload.phone,
          email: payload.email,
        });
        notifyAuthChange();

        let user = res.data.user;
        if (!user) {
          try {
            const userRes = await getCurrentUser();
            user = userRes.data;
          } catch {
            // Ignore failure fetching user info
          }
        }

        if (nextPath.startsWith("/")) {
          navigate(nextPath);
        } else if (user?.is_staff || user?.is_superuser) {
          navigate("/admin/insights");
        } else {
          navigate("/student-dashboard");
        }
      } else {
        navigate("/login?registered=1");
      }
    } catch (err) {
      setErrorMsg(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }

  const loginHref = nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login";

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
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-arc-cyan/30 bg-arc-cyan/10 text-arc-cyan text-[10px] font-bold uppercase tracking-widest font-mono">
              <RiShieldFlashLine />
              <span>S.H.I.E.L.D. RECRUITMENT</span>
            </div>
            <span className="text-[10px] font-black text-metallic-gold uppercase tracking-wider font-excon-black">
              Phase {step} of 2
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-excon-black">
              {step === 1 ? "Agent Registration" : "Clearance & Security"}
            </h2>
            <p className="text-xs text-white/60 font-excon">
              {step === 1
                ? "Register your delegate profile for MacFiesta 2026."
                : "Assign your institution and access password."}
            </p>
          </div>

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-marvel-red/20 border border-marvel-red/40 text-marvel-red text-xs rounded-xl font-mono text-center"
            >
              {errorMsg}
            </motion.div>
          )}

          {step === 1 ? (
            <form onSubmit={handleNextStep} className="space-y-4 font-excon">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-white/50 mb-1.5 font-excon-bold">
                  Full Name (As on ID Card)
                </label>
                <div className="relative">
                  <RiUserLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm" />
                  <input
                    type="text"
                    name="full_name"
                    required
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="Tony Stark"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-arc-cyan focus:outline-none text-white text-xs font-excon"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-white/50 mb-1.5 font-excon-bold">
                  Email Address
                </label>
                <div className="relative">
                  <RiMailLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="tony@starkindustries.com"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-arc-cyan focus:outline-none text-white text-xs font-excon"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-white/50 mb-1.5 font-excon-bold">
                  Mobile Number (WhatsApp)
                </label>
                <div className="relative">
                  <RiSmartphoneLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-arc-cyan focus:outline-none text-white text-xs font-excon font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-arc-cyan hover:bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_20px_#00D4FF] font-excon-black cursor-pointer mt-2"
              >
                Proceed to Security Clearance →
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 font-excon">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-white/50 mb-1.5 font-excon-bold">
                  College or School Name
                </label>
                <div className="relative">
                  <RiBuilding4Line className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm" />
                  <input
                    type="text"
                    name="college_name"
                    required
                    value={form.college_name}
                    onChange={handleChange}
                    placeholder="MACFAST / St. Thomas Higher Secondary"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-arc-cyan focus:outline-none text-white text-xs font-excon"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-white/50 mb-1.5 font-excon-bold">
                  Password (Min 8 Characters)
                </label>
                <div className="relative">
                  <RiLockLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    minLength={8}
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

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-white/50 mb-1.5 font-excon-bold">
                  Confirm Password
                </label>
                <div className="relative">
                  <RiLockLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password_confirm"
                    required
                    minLength={8}
                    value={form.password_confirm}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-arc-cyan focus:outline-none text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-colors font-excon-bold"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 bg-marvel-red hover:bg-white hover:text-black text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_20px_#ED1D24] font-excon-black cursor-pointer"
                >
                  {loading ? "Authorizing Clearance..." : "Complete Registration"}
                </button>
              </div>
            </form>
          )}

          {/* Switch to Login */}
          <div className="text-center pt-2 border-t border-white/10">
            <p className="text-xs text-white/60 font-excon">
              Already have an Agent Clearance?{" "}
              <Link to={loginHref} className="text-arc-cyan hover:text-white font-bold font-excon-bold">
                Sign In
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

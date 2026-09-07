import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  RiShieldFlashLine,
  RiLockLine,
  RiMailLine,
  RiUserLine,
  RiSmartphoneLine,
  RiEyeLine,
  RiEyeOffLine,
} from "react-icons/ri";
import { registerAccount, getCurrentUser, storeAuthTokens, isLoggedIn } from "../services/api";
import { notifyAuthChange } from "../utils/auth";
import { saveParticipantProfile } from "../utils/participantProfile";
import { BackgroundVideo } from "../components/ui/BackgroundVideo";
import { usePageSeo } from "../hooks/usePageSeo";
import { useFestivalControl } from "../lib/festivalStore";
import CollegeSchoolPicker from "../components/CollegeSchoolPicker";

function parseApiError(err) {
  const data = err?.response?.data;
  if (!data) return "Could not create your account. Please check your network connection and credentials.";
  if (typeof data === "string") return data;
  if (data.detail) return Array.isArray(data.detail) ? data.detail[0] : String(data.detail);
  if (typeof data === "object") {
    const messages = [];
    for (const [key, val] of Object.entries(data)) {
      const fieldName = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      if (Array.isArray(val)) {
        messages.push(`${fieldName}: ${val.join(", ")}`);
      } else if (typeof val === "string") {
        messages.push(`${fieldName}: ${val}`);
      } else if (typeof val === "object" && val !== null) {
        messages.push(`${fieldName}: ${JSON.stringify(val)}`);
      }
    }
    if (messages.length > 0) return messages.join(" | ");
  }
  return "Could not create your account. Please check your details and try again.";
}

/** Validates Indian mobile numbers (strictly 10 digits starting with 6-9, or +91 prefix) */
function validatePhone(raw) {
  const stripped = (raw || "").replace(/\s+/g, "");
  const digits = stripped.replace(/\D/g, "");
  if (!digits) return "Mobile number is required.";
  if (digits.length === 12 && digits.startsWith("91")) {
    const num = digits.slice(2);
    if (!/^[6-9]/.test(num)) return "Mobile number must start with 6, 7, 8, or 9.";
    return null;
  }
  if (digits.length > 10) {
    return "Mobile number cannot exceed 10 digits.";
  }
  if (digits.length < 10) {
    return `Mobile number must be 10 digits (${digits.length}/10 entered).`;
  }
  if (!/^[6-9]/.test(digits)) {
    return "Mobile number must start with 6, 7, 8, or 9.";
  }
  return null;
}

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = useMemo(() => searchParams.get("next") || "", [searchParams]);

  useEffect(() => {
    if (isLoggedIn()) {
      navigate(nextPath || "/student-dashboard", { replace: true });
    }
  }, [navigate, nextPath]);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    gender: "male",
    college_name: "",
    password: "",
    password_confirm: "",
  });
  const [phoneError, setPhoneError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { settings } = useFestivalControl();
  const registrationOpen = settings?.registrationOpen ?? true;

  usePageSeo({
    title: "Agent Registration · MacFiesta 2026",
    description: "Create your S.H.I.E.L.D. agent account to register for competitions and access your tournament badge.",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "phone") {
      // Strictly allow only digits and cap at exactly 10 digits
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
      setForm((prev) => ({ ...prev, phone: digitsOnly }));
      setErrorMsg("");
      if (digitsOnly.length > 0) {
        setPhoneError(validatePhone(digitsOnly) || "");
      } else {
        setPhoneError("");
      }
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrorMsg("");
  }

  function handleNextStep(e) {
    e.preventDefault();
    if (!registrationOpen) {
      setErrorMsg("Registrations are currently closed. New accounts cannot be created.");
      return;
    }
    setErrorMsg("");

    const name = form.full_name.trim();
    if (!name || name.length < 2) {
      setErrorMsg("Please enter your full name (at least 2 characters).");
      return;
    }
    const email = form.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setErrorMsg("Please enter a valid email address (e.g. name@domain.com).");
      return;
    }
    const phoneErr = validatePhone(form.phone);
    if (phoneErr) {
      setPhoneError(phoneErr);
      setErrorMsg(phoneErr);
      return;
    }
    setPhoneError("");
    setStep(2);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!registrationOpen) {
      setErrorMsg("Registrations are currently closed. New accounts cannot be created.");
      return;
    }
    setErrorMsg("");

    // Full pre-flight validation across all fields
    const name = form.full_name.trim();
    if (!name || name.length < 2) {
      setStep(1);
      setErrorMsg("Please enter your full name.");
      return;
    }
    const email = form.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setStep(1);
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    const phoneErr2 = validatePhone(form.phone);
    if (phoneErr2) {
      setStep(1);
      setPhoneError(phoneErr2);
      setErrorMsg(phoneErr2);
      return;
    }
    const college = form.college_name.trim();
    if (!college || college.length < 2) {
      setErrorMsg("Please enter your College or School name (at least 2 characters).");
      return;
    }
    if (form.password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }
    if (form.password !== form.password_confirm) {
      setErrorMsg("Passwords do not match. Please verify your confirm password field.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const pwd = form.password;
    const pwdConfirm = form.password_confirm;
    setForm((prev) => ({ ...prev, password: "", password_confirm: "" }));

    try {
      const payload = {
        full_name: name,
        email: email,
        phone: form.phone.trim(),
        gender: form.gender || "male",
        college_name: college,
        password: pwd,
        password_confirm: pwdConfirm,
      };

      const res = await registerAccount(payload);
      if (res.data?.access) {
        storeAuthTokens(res.data);
        saveParticipantProfile({
          full_name: payload.full_name,
          college_name: payload.college_name,
          phone: payload.phone,
          email: payload.email,
          gender: form.gender || "male",
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
          {!registrationOpen ? (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 text-3xl shadow-[0_0_25px_rgba(244,63,94,0.25)]">
                <RiLockLine />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase tracking-widest font-mono">
                  REGISTRATION STATUS: CLOSED
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-white font-excon-black">
                  Registrations Are Closed
                </h2>
                <p className="text-xs text-white/70 leading-relaxed max-w-sm mx-auto font-excon">
                  New delegate account registrations have concluded for MacFiesta 2026. If you already have an existing agent account, you can sign in below to manage your mission passes and certificates.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <Link
                  to={loginHref}
                  className="w-full py-3.5 bg-arc-cyan hover:bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_20px_#00D4FF] font-excon-black flex items-center justify-center gap-2"
                >
                  <RiUserLine className="text-sm" />
                  <span>Agent Login</span>
                </Link>

                <Link
                  to="/events"
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all font-excon flex items-center justify-center"
                >
                  Explore Missions &amp; Schedule
                </Link>
              </div>
            </div>
          ) : (
            <>
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
                    <label
                      htmlFor="reg-fullname"
                      className="block text-[10px] uppercase font-bold tracking-wider text-white/50 mb-1.5 font-excon-bold"
                    >
                      Full Name (As on ID Card)
                    </label>
                    <div className="relative">
                      <RiUserLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm" />
                      <input
                        id="reg-fullname"
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
                    <label
                      htmlFor="reg-email"
                      className="block text-[10px] uppercase font-bold tracking-wider text-white/50 mb-1.5 font-excon-bold"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <RiMailLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm" />
                      <input
                        id="reg-email"
                        type="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="tony@starkindustries.com"
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-arc-cyan focus:outline-none text-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="reg-phone"
                        className="block text-[10px] uppercase font-bold tracking-wider text-white/50 font-excon-bold"
                      >
                        Mobile Number
                      </label>
                      <span className="text-[10px] font-mono text-white/40">
                        {form.phone.length}/10 digits
                      </span>
                    </div>
                    <div className="relative">
                      <RiSmartphoneLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm" />
                      <input
                        id="reg-phone"
                        type="tel"
                        name="phone"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={10}
                        required
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="9876543210"
                        className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-xl focus:outline-none text-white text-xs font-mono tracking-wider transition-colors ${
                          phoneError ? "border-marvel-red focus:border-marvel-red" : "border-white/10 focus:border-arc-cyan"
                        }`}
                      />
                    </div>
                    {phoneError && (
                      <p className="text-[11px] text-marvel-red mt-1 font-mono">{phoneError}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="reg-gender"
                      className="block text-[10px] uppercase font-bold tracking-wider text-white/50 mb-1.5 font-excon-bold"
                    >
                      Gender
                    </label>
                    <select
                      id="reg-gender"
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#0A0D1A] border border-white/10 rounded-xl focus:border-arc-cyan focus:outline-none text-white text-xs font-excon cursor-pointer"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-arc-cyan hover:bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_20px_#00D4FF] font-excon-black cursor-pointer mt-2"
                  >
                    Proceed to Security Setup →
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 font-excon">
                  <CollegeSchoolPicker
                    value={form.college_name}
                    onChange={(val) => {
                      setForm((prev) => ({ ...prev, college_name: val }));
                      setErrorMsg("");
                    }}
                    label="School / College / Institution"
                    required
                    placeholder="Search or type your institution name..."
                  />

                  <div>
                    <label
                      htmlFor="reg-password"
                      className="block text-[10px] uppercase font-bold tracking-wider text-white/50 mb-1.5 font-excon-bold"
                    >
                      Access Password (Min. 8 characters)
                    </label>
                    <div className="relative">
                      <RiLockLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm" />
                      <input
                        id="reg-password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        required
                        minLength={8}
                        value={form.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-arc-cyan focus:outline-none text-white text-xs font-mono select-none"
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
                    <label
                      htmlFor="reg-confirm-password"
                      className="block text-[10px] uppercase font-bold tracking-wider text-white/50 mb-1.5 font-excon-bold"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <RiLockLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm" />
                      <input
                        id="reg-confirm-password"
                        type={showPassword ? "text" : "password"}
                        name="password_confirm"
                        required
                        value={form.password_confirm}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-arc-cyan focus:outline-none text-white text-xs font-mono select-none"
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

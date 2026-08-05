import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import PageHeader from "../components/PageHeader";
import { confirmPasswordReset } from "../services/api";
import { PAGE_IMAGES } from "../utils/assets";
import { EASE_PREMIUM, MOTION } from "../utils/animations";

function parseApiError(err) {
  const data = err?.response?.data;
  if (!data) return "Could not reset password. Please try again.";
  if (typeof data === "string") return data;
  if (data.detail) return Array.isArray(data.detail) ? data.detail[0] : String(data.detail);
  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const val = data[firstKey];
    return Array.isArray(val) ? val[0] : String(val);
  }
  return "Could not reset password. Please try again.";
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const uid = useMemo(() => searchParams.get("uid") || "", [searchParams]);
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const linkValid = Boolean(uid && token);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await confirmPasswordReset({
        uid,
        token,
        password,
        password_confirm: passwordConfirm,
      });
      setDone(true);
      setTimeout(() => navigate("/login"), 1600);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Reset Password"
        subtitle="Choose a new password for your MacFiesta Pro account."
        seoDescription="Set a new MacFiesta Pro password."
        image={PAGE_IMAGES.login}
      />
      <section className="section page-content">
        <div className="container narrow">
          {!linkValid ? (
            <div className="login-form-premium detail-panel">
              <p className="form-error" role="alert">
                This reset link is incomplete. Request a new one from Forgot Password.
              </p>
              <Link to="/forgot-password" className="btn btn-gold btn-full">
                Forgot Password
              </Link>
            </div>
          ) : done ? (
            <motion.div
              className="login-form-premium detail-panel"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="form-success">Password updated. Redirecting to login…</p>
              <Link to="/login" className="btn btn-gold btn-full">
                Login now
              </Link>
            </motion.div>
          ) : (
            <motion.form
              className="login-form-premium detail-panel"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: MOTION.reveal, ease: EASE_PREMIUM }}
            >
              <label>
                New password
                <div className="password-field">
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
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>
              <label>
                Confirm new password
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
                  disabled={loading}
                />
              </label>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.p key={error} className="form-error" role="alert">
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <button type="submit" className="btn btn-gold btn-full" disabled={loading}>
                {loading ? "Updating…" : "Update Password"}
              </button>
            </motion.form>
          )}
        </div>
      </section>
    </>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import PageHeader from "../components/PageHeader";
import { requestPasswordReset } from "../services/api";
import { PAGE_IMAGES } from "../utils/assets";
import { EASE_PREMIUM, MOTION } from "../utils/animations";

function parseApiError(err) {
  const data = err?.response?.data;
  if (!data) return "Could not start password reset. Please try again.";
  if (typeof data === "string") return data;
  if (data.detail) return Array.isArray(data.detail) ? data.detail[0] : String(data.detail);
  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const val = data[firstKey];
    return Array.isArray(val) ? val[0] : String(val);
  }
  return "Could not start password reset. Please try again.";
}

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [debugPath, setDebugPath] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await requestPasswordReset(email.trim());
      setDone(true);
      setDebugPath(res.data?.debug_reset_path || "");
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
        title="Forgot Password"
        subtitle="Enter the email on your account. We’ll send reset instructions when email is configured, or the fest desk can reset it in Django admin."
        seoDescription="Reset your MacFiesta Pro account password."
        image={PAGE_IMAGES.login}
      />
      <section className="section page-content">
        <div className="container narrow">
          {done ? (
            <motion.div
              className="login-form-premium detail-panel"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3>Check your email</h3>
              <p>
                If an account exists for that address, reset instructions were sent. You can also ask the
                fest desk / admin to reset your password.
              </p>
              {debugPath && (
                <p className="form-success">
                  Dev reset link: <Link to={debugPath}>Continue reset</Link>
                </p>
              )}
              <Link to="/login" className="btn btn-gold btn-full">
                Back to Login
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
                Email
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  autoComplete="email"
                  required
                  disabled={loading}
                />
              </label>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.p
                    key={error}
                    className="form-error"
                    role="alert"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <button type="submit" className="btn btn-gold btn-full" disabled={loading}>
                {loading ? "Sending…" : "Send Reset Link"}
              </button>
              <p className="auth-switch-text">
                Remembered it? <Link to="/login">Login</Link>
              </p>
            </motion.form>
          )}
        </div>
      </section>
    </>
  );
}

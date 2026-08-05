import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import PageHeader from "../components/PageHeader";
import { getCurrentUser, registerAccount, storeAuthTokens } from "../services/api";
import { PAGE_IMAGES } from "../utils/assets";
import { notifyAuthChange } from "../utils/auth";
import { EASE_PREMIUM, MOTION } from "../utils/animations";

function parseApiError(err) {
  const data = err?.response?.data;
  if (!data) return "Could not create your account. Please try again.";
  if (typeof data === "string") return data;
  if (data.detail) return Array.isArray(data.detail) ? data.detail[0] : String(data.detail);
  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const val = data[firstKey];
    return Array.isArray(val) ? val[0] : String(val);
  }
  return "Could not create your account. Please try again.";
}

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = useMemo(() => searchParams.get("next") || "", [searchParams]);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await registerAccount(form);
      storeAuthTokens(res.data);
      notifyAuthChange();

      let user = res.data.user;
      if (!user) {
        const userRes = await getCurrentUser();
        user = userRes.data;
      }

      if (nextPath.startsWith("/")) {
        navigate(nextPath);
      } else if (user?.is_staff || user?.is_superuser) {
        navigate("/admin/insights");
      } else {
        navigate("/events");
      }
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }

  const loginHref = nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login";

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Create Account"
        subtitle="Create a participant account to register for MacFiesta events."
        seoDescription="Create a MacFiesta Pro account to register for events."
        image={PAGE_IMAGES.login}
      />
      <section className="section page-content">
        <div className="container narrow">
          <motion.form
            className="login-form-premium detail-panel"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: MOTION.reveal, ease: EASE_PREMIUM }}
          >
            <label>
              Username
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
                minLength={3}
                required
                disabled={loading}
              />
            </label>
            <label>
              Email
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
                disabled={loading}
              />
            </label>
            <label>
              Password
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
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
              Confirm password
              <input
                type={showPassword ? "text" : "password"}
                name="password_confirm"
                value={form.password_confirm}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={8}
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
                  transition={{ duration: 0.22, ease: EASE_PREMIUM }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button type="submit" className="btn btn-gold btn-full" disabled={loading}>
              {loading ? "Creating account…" : "Create Account"}
            </button>

            <p className="auth-switch-text">
              Already have an account? <Link to={loginHref}>Login</Link>
            </p>
          </motion.form>
        </div>
      </section>
    </>
  );
}

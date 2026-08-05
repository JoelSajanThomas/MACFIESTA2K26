import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import PageHeader from "../components/PageHeader";
import { login, getCurrentUser, storeAuthTokens } from "../services/api";
import { PAGE_IMAGES } from "../utils/assets";
import { notifyAuthChange } from "../utils/auth";
import { EASE_PREMIUM, MOTION } from "../utils/animations";
import { defaultAdminPath } from "../utils/committeeAccess";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = useMemo(() => searchParams.get("next") || "", [searchParams]);

  const [form, setForm] = useState({ username: "", password: "" });
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
      const res = await login(form);
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

      if (nextPath.startsWith("/")) {
        navigate(nextPath);
      } else if (user.must_change_password) {
        navigate("/change-password");
      } else if (user.is_staff || user.is_superuser) {
        navigate(defaultAdminPath(user.modules));
      } else {
        navigate("/student-dashboard");
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 429) {
        setError("Too many login attempts. Please wait a minute and try again.");
      } else {
        setError("Invalid username or password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const registerHref = nextPath ? `/register?next=${encodeURIComponent(nextPath)}` : "/register";

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Login"
        subtitle="Sign in to register for events or access your coordinator dashboard."
        seoDescription="Sign in to register for MacFiesta events or access your coordinator dashboard."
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
                  autoComplete="current-password"
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
            <p className="auth-switch-text auth-forgot-row">
              <Link to="/forgot-password">Forgot Password?</Link>
            </p>
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
              {loading ? "Signing in…" : "Sign In"}
            </button>
            <p className="auth-switch-text">
              New here? <Link to={registerHref}>Create Account</Link>
            </p>
          </motion.form>
        </div>
      </section>
    </>
  );
}

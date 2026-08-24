import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import PageHeader from "../components/PageHeader";
import { login, getCurrentUser, storeAuthTokens } from "../services/api";
import { PAGE_IMAGES } from "../utils/assets";
import { logout, notifyAuthChange } from "../utils/auth";
import { EASE_PREMIUM, MOTION } from "../utils/animations";
import { defaultAdminPath } from "../utils/committeeAccess";
import { deskUsername, getDeskBySlug } from "../utils/deskCommittees";

/**
 * Branded login for one committee desk.
 * Rejects staff accounts that belong to a different committee.
 */
export default function CommitteeLogin() {
  const { committeeSlug } = useParams();
  const desk = useMemo(() => getDeskBySlug(committeeSlug), [committeeSlug]);
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!desk) return;
    setForm({ username: deskUsername(desk.slug), password: "" });
    setError("");
  }, [desk]);

  if (!desk) {
    return <Navigate to="/desks" replace />;
  }

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
        logout();
        setError("Signed in, but could not load your desk profile. Try again.");
        return;
      }

      if (!(user.is_staff || user.is_superuser)) {
        logout();
        setError("This login is for committee desks only. Use the main Sign In for students.");
        return;
      }

      if (user.committee && user.committee !== desk.slug && !user.is_superuser) {
        logout();
        setError(
          `This account belongs to the ${user.committee_label || user.committee} desk. Open that desk’s login instead.`
        );
        return;
      }

      if (user.must_change_password) {
        navigate("/change-password");
        return;
      }

      navigate(defaultAdminPath(user.modules, user.is_superuser ? "core" : user.committee));
    } catch (err) {
      const status = err?.response?.status;
      if (status === 429) {
        setError("Too many login attempts. Please wait a minute and try again.");
      } else {
        setError("Invalid username or password for this desk.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow={`${desk.label} Desk`}
        title={`${desk.label} Login`}
        subtitle={`${desk.blurb} Modules: ${desk.modulesHint}.`}
        seoDescription={`MacFiesta ${desk.label} committee desk login.`}
        image={PAGE_IMAGES.login}
      />
      <section className="section page-content auth-page desk-login-page">
        <div className="container narrow">
          <motion.form
            className="login-form-premium detail-panel auth-card"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: MOTION.reveal, ease: EASE_PREMIUM }}
          >
            <p className="desk-login-hint">
              Expected username: <code>{deskUsername(desk.slug)}</code>
            </p>
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
              {loading ? "Signing in…" : `Enter ${desk.label} Desk`}
            </button>
            <p className="auth-switch-text">
              <Link to="/desks">All committee desks</Link>
              {" · "}
              <Link to="/login">Student / general sign in</Link>
            </p>
          </motion.form>
        </div>
      </section>
    </>
  );
}

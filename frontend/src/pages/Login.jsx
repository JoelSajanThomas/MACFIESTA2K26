import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageHeader from "../components/PageHeader";
import { login, getCurrentUser } from "../services/api";
import { notifyAuthChange } from "../utils/auth";

export default function Login() {
  const navigate = useNavigate();
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
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      notifyAuthChange();

      let user;
      try {
        const userRes = await getCurrentUser();
        user = userRes.data;
      } catch {
        setError("Signed in, but could not load your profile. Please refresh and try again.");
        return;
      }

      if (user.is_staff || user.is_superuser) {
        navigate("/admin-dashboard");
      } else {
        navigate("/student-dashboard");
      }
    } catch {
      setError("Invalid username or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Login"
        subtitle="Sign in to register for events or access your coordinator dashboard."
        image="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920&q=80"
      />
      <section className="section page-content">
        <div className="container narrow">
          <motion.form
            className="login-form-premium detail-panel"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn btn-gold btn-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </motion.form>
        </div>
      </section>
    </>
  );
}

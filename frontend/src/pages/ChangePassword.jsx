import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageHeader from "../components/PageHeader";
import { changePassword, getCurrentUser, isLoggedIn } from "../services/api";
import { PAGE_IMAGES } from "../utils/assets";
import { defaultAdminPath, volunteerHomePath } from "../utils/committeeAccess";
import { EASE_PREMIUM, MOTION } from "../utils/animations";

function parseApiError(err) {
  const data = err?.response?.data;
  if (!data) return "Could not update password.";
  if (typeof data === "string") return data;
  if (data.detail) return Array.isArray(data.detail) ? data.detail[0] : String(data.detail);
  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const val = data[firstKey];
    return Array.isArray(val) ? val[0] : String(val);
  }
  return "Could not update password.";
}

export default function ChangePassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    current_password: "",
    password: "",
    password_confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isLoggedIn()) {
    return (
      <div className="container narrow page-content">
        <p>Login required.</p>
        <Link to="/login" className="btn btn-gold">Sign In</Link>
      </div>
    );
  }

  function handleChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const payload = { ...form };
    setForm({ current_password: "", password: "", password_confirm: "" });
    try {
      await changePassword(payload);
      const userRes = await getCurrentUser();
      const user = userRes.data;
      if (user.is_staff || user.is_superuser) {
        const committee = user.is_superuser ? "core" : user.committee;
        if (committee && committee !== "core") {
          navigate(volunteerHomePath(committee, user.modules || []));
        } else {
          navigate(defaultAdminPath(user.modules || [], committee));
        }
      } else {
        navigate("/student-dashboard");
      }
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Security"
        title="Change Password"
        subtitle="Update your password before using the coordinator tools."
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
            <p className="registration-fee-note">
              Seeded committee accounts must set a new password on first login.
            </p>
            <label>
              Current password
              <input
                type="password"
                name="current_password"
                value={form.current_password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
            </label>
            <label>
              New password
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </label>
            <label>
              Confirm new password
              <input
                type="password"
                name="password_confirm"
                value={form.password_confirm}
                onChange={handleChange}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="btn btn-gold btn-full" disabled={loading}>
              {loading ? "Saving…" : "Update password"}
            </button>
          </motion.form>
        </div>
      </section>
    </>
  );
}

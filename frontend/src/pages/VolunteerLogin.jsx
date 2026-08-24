import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, getCurrentUser, storeAuthTokens } from "../services/api";
import { logout, notifyAuthChange } from "../utils/auth";
import { defaultAdminPath, volunteerHomePath } from "../utils/committeeAccess";
import "../styles/volunteer-login.css";

/**
 * Single staff/volunteer login — JWT + StaffProfile committee RBAC.
 * One page for all desks; role from backend decides the dashboard.
 */
export default function VolunteerLogin() {
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
      storeAuthTokens(res.data);
      notifyAuthChange();

      let user;
      try {
        const userRes = await getCurrentUser();
        user = userRes.data;
      } catch {
        logout();
        setError("Signed in, but could not load your profile. Try again.");
        return;
      }

      if (user.is_active === false) {
        logout();
        setError("This account is inactive. Contact MacFiesta administration.");
        return;
      }

      if (!(user.is_staff || user.is_superuser)) {
        logout();
        setError("This login is for staff and volunteers only. Students use Student Login.");
        return;
      }

      if (user.must_change_password) {
        navigate("/change-password", { replace: true });
        return;
      }

      const committee = user.is_superuser ? "core" : user.committee;
      if (!committee) {
        logout();
        setError("No committee is assigned to this account. Ask Core Admin to assign a desk.");
        return;
      }

      if (committee === "core" || user.is_superuser) {
        navigate(defaultAdminPath(user.modules || [], "core"), { replace: true });
        return;
      }

      navigate(volunteerHomePath(committee, user.modules || []), { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      if (status === 429) {
        setError("Too many login attempts. Please wait a minute and try again.");
      } else {
        setError("Invalid username/email or password.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="volunteer-login-page">
      <div className="volunteer-login-card">
        <p className="volunteer-login-brand">MacFiesta</p>
        <h1>Staff Login</h1>
        <p className="volunteer-login-sub">Sign in with your staff or volunteer account</p>

        <form onSubmit={handleSubmit} noValidate>
          <label>
            Username or Email
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              required
              disabled={loading}
              placeholder="username or email"
            />
          </label>
          <label>
            Password
            <div className="volunteer-login-password">
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
                className="volunteer-login-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          {error ? (
            <p className="volunteer-login-error" role="alert">
              {error}
            </p>
          ) : null}

          <button type="submit" className="volunteer-login-submit" disabled={loading}>
            {loading ? "Signing in…" : "SIGN IN"}
          </button>
        </form>

        <p className="volunteer-login-note">
          Accounts are created by the MacFiesta administration. Your desk tools open automatically after sign-in.
        </p>
        <p className="volunteer-login-links">
          <Link to="/login">Student Login</Link>
        </p>
      </div>
    </div>
  );
}

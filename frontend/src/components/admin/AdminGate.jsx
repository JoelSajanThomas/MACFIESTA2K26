import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import LoadingState from "../ui/LoadingState";
import { getCurrentUser, isLoggedIn } from "../../services/api";
import { isUnauthorized, logout } from "../../utils/auth";

export default function AdminGate({ children }) {
  const [state, setState] = useState("checking");
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      setState("guest");
      return;
    }
    getCurrentUser()
      .then((res) => {
        if (!res.data.is_staff && !res.data.is_superuser) {
          setState("denied");
          return;
        }
        if (res.data.is_active === false) {
          setState("denied");
          return;
        }
        if (res.data.must_change_password) {
          setState("password");
          return;
        }
        setUser(res.data);
        setState("ready");
      })
      .catch((err) => {
        if (isUnauthorized(err)) logout();
        setState("guest");
      });
  }, []);

  if (state === "checking") {
    return (
      <div className="admin-gate container">
        <LoadingState message="Verifying admin access…" />
      </div>
    );
  }

  if (state === "password") {
    return <Navigate to="/change-password" replace />;
  }

  if (state === "guest") {
    return (
      <div className="admin-gate container">
        <div className="dash-gate-card">
          <h1>Staff login required</h1>
          <p>Sign in with your staff or volunteer account. Students use the same Sign In page.</p>
          <div className="admin-ops-actions">
            <Link to="/login" className="btn btn-gold">Sign In</Link>
          </div>
        </div>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="admin-gate container">
        <div className="dash-gate-card denied">
          <h1>Access denied</h1>
          <p>This area is only for MacFiesta staff and committee desks.</p>
          <Link to="/" className="btn btn-outline">Back to Home</Link>
        </div>
      </div>
    );
  }

  return typeof children === "function" ? children(user) : children;
}

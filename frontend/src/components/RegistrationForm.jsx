import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import LoadingState from "../components/ui/LoadingState";
import {
  createRegistration,
  getMyRegistrations,
  isLoggedIn,
} from "../services/api";

const EMPTY_FORM = {
  participant_name: "",
  college_name: "",
  email: "",
  phone: "",
};

function parseApiError(err) {
  const data = err.response?.data;
  if (!data) return "Registration failed. Please try again.";

  if (typeof data === "string") return data;
  if (data.detail) return data.detail;

  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const val = data[firstKey];
    return Array.isArray(val) ? val[0] : String(val);
  }

  return "Registration failed. Please try again.";
}

export default function RegistrationForm({ event, onSuccess }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [checking, setChecking] = useState(loggedIn);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const authed = isLoggedIn();
    setLoggedIn(authed);

    if (!authed) {
      setChecking(false);
      return;
    }

    getMyRegistrations()
      .then((res) => {
        const found = res.data.some((r) => r.event === event.id);
        setAlreadyRegistered(found);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [event.id]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await createRegistration({
        event: event.id,
        ...form,
      });
      setSuccess(true);
      setAlreadyRegistered(true);
      onSuccess?.();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (!event.is_registration_open) {
    return (
      <div className="registration-panel detail-panel closed-panel">
        <h3>Registration</h3>
        <p className="registration-closed-msg">
          Registration is closed for this event.
        </p>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <motion.div
        className="registration-panel detail-panel login-prompt-panel"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3>Register for this Event</h3>
        <p className="login-prompt-text">
          Please login to register for this event.
        </p>
        <Link to="/login" className="btn btn-gold btn-full">
          Login
        </Link>
      </motion.div>
    );
  }

  if (checking) {
    return (
      <div className="registration-panel detail-panel">
        <LoadingState message="Checking registration status…" />
      </div>
    );
  }

  if (success || alreadyRegistered) {
    return (
      <motion.div
        className="registration-panel detail-panel success-panel"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="registration-success-icon">✓</div>
        <h3>{success ? "Registration Successful!" : "You're Registered"}</h3>
        <p>
          {success
            ? `You're registered for ${event.title}. We'll see you at ${event.venue || "the venue"}.`
            : `You have already registered for ${event.title}.`}
        </p>
        {success && (
          <p className="form-success">Your spot is confirmed. Payment status will update shortly.</p>
        )}
      </motion.div>
    );
  }

  const spotsLeft = event.max_participants - (event.participant_count || 0);

  if (spotsLeft <= 0) {
    return (
      <div className="registration-panel detail-panel closed-panel">
        <h3>Registration</h3>
        <p className="registration-closed-msg">This event is full.</p>
      </div>
    );
  }

  return (
    <motion.form
      className="registration-panel detail-panel registration-form"
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3>Register for this Event</h3>
      <p className="registration-fee-note">
        Registration fee: <strong>₹{event.registration_fee}</strong>
        {" · "}
        <span>{spotsLeft} spots left</span>
      </p>

      <label>
        Participant name
        <input
          type="text"
          name="participant_name"
          value={form.participant_name}
          onChange={handleChange}
          placeholder="Full name"
          required
        />
      </label>

      <label>
        College name
        <input
          type="text"
          name="college_name"
          value={form.college_name}
          onChange={handleChange}
          placeholder="Your college"
          required
        />
      </label>

      <label>
        Email
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@college.edu"
          required
        />
      </label>

      <label>
        Phone
        <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="+91 98765 43210"
          required
        />
      </label>

      {error && <p className="form-error" role="alert">{error}</p>}

      <button type="submit" className="btn btn-gold btn-full" disabled={submitting || alreadyRegistered}>
        {submitting ? "Submitting…" : alreadyRegistered ? "Already Registered" : "Submit Registration"}
      </button>
    </motion.form>
  );
}

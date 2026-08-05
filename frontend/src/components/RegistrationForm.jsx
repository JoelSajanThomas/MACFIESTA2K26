import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import LoadingState from "../components/ui/LoadingState";
import {
  createRegistration,
  getMyRegistrations,
  isLoggedIn,
} from "../services/api";

const EMPTY_FORM = {
  registration_type: "individual",
  team_name: "",
  participant_name: "",
  college_name: "",
  email: "",
  phone: "",
  food_preference: "none",
  food_notes: "",
  needs_accommodation: false,
  accommodation_count: "",
  accommodation_notes: "",
  needs_transport: false,
  transport_note: "",
  team_members: [{ name: "", phone: "", email: "", college_name: "" }],
};

function parseApiError(err) {
  const data = err.response?.data;
  if (!data) return "Registration failed. Please try again.";

  if (typeof data === "string") return data;
  if (data.detail) return Array.isArray(data.detail) ? data.detail[0] : String(data.detail);

  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const val = data[firstKey];
    return Array.isArray(val) ? val[0] : String(val);
  }

  return "Registration failed. Please try again.";
}

function registrationQrUrl(registrationNumber) {
  const payload = encodeURIComponent(String(registrationNumber || ""));
  return `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${payload}`;
}

export default function RegistrationForm({ event, onSuccess }) {
  const location = useLocation();
  const nextParam = encodeURIComponent(location.pathname + location.search);

  const [form, setForm] = useState(EMPTY_FORM);
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [existingReg, setExistingReg] = useState(null);
  const [checking, setChecking] = useState(loggedIn);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [waitingList, setWaitingList] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const authed = isLoggedIn();
    setLoggedIn(authed);

    if (!authed) {
      setChecking(false);
      return undefined;
    }

    getMyRegistrations()
      .then((res) => {
        if (!mounted) return;
        const match = res.data.find(
          (r) => r.event === event.id && r.approval_status !== "cancelled"
        );
        setAlreadyRegistered(Boolean(match));
        setExistingReg(match || null);
        if (match?.registration_number) {
          setRegistrationNumber(match.registration_number);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setChecking(false);
      });

    return () => {
      mounted = false;
    };
  }, [event.id]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setError("");
  }

  function handleMemberChange(index, field, value) {
    setForm((prev) => {
      const team_members = [...prev.team_members];
      team_members[index] = { ...team_members[index], [field]: value };
      return { ...prev, team_members };
    });
    setError("");
  }

  function addMember() {
    setForm((prev) => ({
      ...prev,
      team_members: [...prev.team_members, { name: "", phone: "", email: "", college_name: "" }],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const payload = {
        event: event.id,
        registration_type: form.registration_type,
        team_name: form.team_name,
        participant_name: form.participant_name,
        college_name: form.college_name,
        email: form.email,
        phone: form.phone,
        food_preference: form.food_preference,
        food_notes: form.food_notes,
        needs_accommodation: form.needs_accommodation,
        accommodation_count: form.needs_accommodation && form.accommodation_count
          ? Number(form.accommodation_count)
          : null,
        accommodation_notes: form.accommodation_notes,
        needs_transport: form.needs_transport,
        transport_note: form.transport_note,
      };
      if (form.registration_type === "team") {
        payload.team_members = form.team_members.filter((m) => (m.name || "").trim());
      }
      const res = await createRegistration(payload);
      setWaitingList(Boolean(res.data?.is_waiting_list));
      setRegistrationNumber(res.data?.registration_number || "");
      setExistingReg(res.data || null);
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
        <p className="registration-closed-msg">Registration is closed for this event.</p>
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
          You need a MacFiesta Pro account to register. Sign in if you already have one, or create a free
          participant account to continue.
        </p>
        <div className="auth-cta-stack">
          <Link to={`/login?next=${nextParam}`} className="btn btn-gold btn-full">
            Login
          </Link>
          <Link to={`/register?next=${nextParam}`} className="btn btn-outline btn-full">
            Create Account
          </Link>
        </div>
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
    const regNo = registrationNumber || existingReg?.registration_number || "";
    const onWait = success ? waitingList : Boolean(existingReg?.is_waiting_list);

    return (
      <motion.div
        className="registration-panel detail-panel success-panel"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="registration-success-icon" aria-hidden="true">
          ✓
        </div>
        <h3>{success ? "Registration Successful!" : "You're Registered"}</h3>
        <p>
          {success
            ? onWait
              ? `You're on the waiting list for ${event.title}. We'll update you if a spot opens.`
              : `You're registered for ${event.title}. Venue: ${event.venue || "TBA"}.`
            : `You have already registered for ${event.title}.`}
        </p>

        {regNo && (
          <div className="registration-confirm-card">
            <p className="registration-number-label">Registration number</p>
            <p className="registration-number-value">{regNo}</p>
            {success && (
              <img
                className="registration-qr"
                src={registrationQrUrl(regNo)}
                alt={`QR code for ${regNo}`}
                width={160}
                height={160}
              />
            )}
            <p className="registration-next-steps">
              Save this number for desk verification. Check payment and event updates on your dashboard.
            </p>
          </div>
        )}

        {success && !onWait && (
          <p className="form-success">
            Spot confirmed. Fee (if any) is collected / verified at the fest desk — status shows on your
            dashboard.
          </p>
        )}

        <div className="auth-cta-stack">
          <Link to="/student-dashboard" className="btn btn-gold btn-full">
            Open My Dashboard
          </Link>
          {existingReg?.id && (
            <Link to={`/pass/${existingReg.id}`} className="btn btn-outline btn-full">
              Open Digital Pass
            </Link>
          )}
          <Link to="/events" className="btn btn-outline btn-full">
            Browse more events
          </Link>
        </div>
      </motion.div>
    );
  }

  const spotsLeft = event.max_participants - (event.participant_count || 0);
  const isFull = spotsLeft <= 0;
  const canJoinWaitingList = isFull && event.waiting_list_enabled;

  if (isFull && !canJoinWaitingList) {
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
        <span>
          {canJoinWaitingList ? "Event full — join waiting list" : `${spotsLeft} spots left`}
        </span>
      </p>

      <label>
        Registration type
        <select name="registration_type" value={form.registration_type} onChange={handleChange}>
          <option value="individual">Individual</option>
          <option value="team">Team</option>
        </select>
      </label>

      {form.registration_type === "team" && (
        <>
          <label>
            Team name
            <input
              type="text"
              name="team_name"
              value={form.team_name}
              onChange={handleChange}
              placeholder="Team name"
              required
            />
          </label>
          <div className="team-members-block">
            <p className="registration-fee-note">Additional team members (optional — you are the leader)</p>
            {form.team_members.map((m, idx) => (
              <div key={idx} className="team-member-row">
                <input
                  type="text"
                  placeholder="Member name"
                  value={m.name}
                  onChange={(e) => handleMemberChange(idx, "name", e.target.value)}
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={m.phone}
                  onChange={(e) => handleMemberChange(idx, "phone", e.target.value)}
                />
              </div>
            ))}
            <button type="button" className="btn btn-outline btn-sm" onClick={addMember}>
              Add member
            </button>
          </div>
        </>
      )}

      <label>
        Participant / team leader name
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

      <label>
        Food preference
        <select name="food_preference" value={form.food_preference} onChange={handleChange}>
          <option value="none">No preference</option>
          <option value="veg">Vegetarian</option>
          <option value="non_veg">Non-vegetarian</option>
          <option value="jain">Jain</option>
        </select>
      </label>

      {form.food_preference !== "none" && (
        <label>
          Food notes (optional)
          <input
            type="text"
            name="food_notes"
            value={form.food_notes}
            onChange={handleChange}
            placeholder="Allergies or other notes for Food Committee"
          />
        </label>
      )}

      <label className="checkbox-row">
        <input
          type="checkbox"
          name="needs_accommodation"
          checked={form.needs_accommodation}
          onChange={handleChange}
        />
        Need accommodation assistance (request only — allocated offline)
      </label>

      {form.needs_accommodation && (
        <>
          <label>
            Number of people
            <input
              type="number"
              name="accommodation_count"
              min="1"
              max="20"
              value={form.accommodation_count}
              onChange={handleChange}
              placeholder="1"
              required
            />
          </label>
          <label>
            Accommodation notes
            <input
              type="text"
              name="accommodation_notes"
              value={form.accommodation_notes}
              onChange={handleChange}
              placeholder="Gender / dates / special request"
            />
          </label>
        </>
      )}

      <label className="checkbox-row">
        <input
          type="checkbox"
          name="needs_transport"
          checked={form.needs_transport}
          onChange={handleChange}
        />
        Need transport assistance (request only — arranged offline)
      </label>

      {form.needs_transport && (
        <label>
          Transport note
          <input
            type="text"
            name="transport_note"
            value={form.transport_note}
            onChange={handleChange}
            placeholder="Pickup point / timing preference"
          />
        </label>
      )}

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="btn btn-gold btn-full" disabled={submitting || alreadyRegistered}>
        {submitting
          ? "Submitting…"
          : canJoinWaitingList
            ? "Join Waiting List"
            : alreadyRegistered
              ? "Already Registered"
              : "Submit Registration"}
      </button>
    </motion.form>
  );
}

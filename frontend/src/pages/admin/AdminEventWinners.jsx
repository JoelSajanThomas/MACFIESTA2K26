import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import {
  createResult,
  deleteResult,
  getAdminRegistrations,
  getEvent,
  getResults,
  updateEvent,
  updateResult,
} from "../../services/api";

const PLACES = [
  { key: "first", label: "1st Place" },
  { key: "second", label: "2nd Place" },
  { key: "third", label: "3rd Place" },
];

function resultState(event, results) {
  if (event?.is_result_published) return "PUBLISHED";
  if (results.length > 0) return "DRAFT";
  return "RESULT NOT ENTERED";
}

/**
 * Set 1st/2nd/3rd winners for an event from registered participants/teams.
 */
export default function AdminEventWinners() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [regs, setRegs] = useState([]);
  const [results, setResults] = useState([]);
  const [picks, setPicks] = useState({ first: "", second: "", third: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(null);

  function load() {
    setLoading(true);
    setError("");
    Promise.all([getEvent(id), getAdminRegistrations(), getResults()])
      .then(([evRes, regRes, resRes]) => {
        const ev = evRes.data;
        setEvent(ev);
        const allRegs = Array.isArray(regRes.data) ? regRes.data : regRes.data?.results || [];
        const eventRegs = allRegs.filter(
          (r) => String(r.event) === String(id) && r.approval_status !== "cancelled"
        );
        setRegs(eventRegs);
        const allResults = Array.isArray(resRes.data) ? resRes.data : resRes.data?.results || [];
        const eventResults = allResults.filter((r) => String(r.event) === String(id));
        setResults(eventResults);
        const next = { first: "", second: "", third: "" };
        eventResults.forEach((r) => {
          if (PLACES.some((p) => p.key === r.position)) {
            const match = eventRegs.find(
              (reg) =>
                reg.participant_name === r.participant_name &&
                reg.college_name === r.college_name
            );
            next[r.position] = match ? String(match.id) : `manual:${r.participant_name}|${r.college_name}`;
          }
        });
        setPicks(next);
      })
      .catch(() => setError("Could not load winners form."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when event id changes
  }, [id]);

  const options = useMemo(
    () =>
      regs.map((r) => ({
        value: String(r.id),
        label:
          r.registration_type === "team" && r.team_name
            ? `${r.team_name} (captain: ${r.participant_name}) — ${r.college_name}`
            : `${r.participant_name} — ${r.college_name}`,
        reg: r,
      })),
    [regs]
  );

  function onPick(place, value) {
    setPicks((prev) => ({ ...prev, [place]: value }));
  }

  function duplicateWarning() {
    const values = Object.values(picks).filter(Boolean);
    return new Set(values).size !== values.length;
  }

  async function saveDraft() {
    if (duplicateWarning()) {
      setError("The same participant/team cannot occupy multiple places.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      for (const place of PLACES) {
        const value = picks[place.key];
        const existing = results.find((r) => r.position === place.key);
        if (!value) {
          if (existing) await deleteResult(existing.id);
          continue;
        }
        let participant_name;
        let college_name;
        if (value.startsWith("manual:")) {
          const raw = value.slice(7);
          const [name, college] = raw.split("|");
          participant_name = name;
          college_name = college;
        } else {
          const reg = regs.find((r) => String(r.id) === value);
          if (!reg) continue;
          participant_name =
            reg.registration_type === "team" && reg.team_name
              ? `${reg.team_name} (${reg.participant_name})`
              : reg.participant_name;
          college_name = reg.college_name;
        }
        const payload = {
          event: Number(id),
          position: place.key,
          participant_name,
          college_name,
          remarks: "",
        };
        if (existing) await updateResult(existing.id, payload);
        else await createResult(payload);
      }
      await load();
    } catch {
      setError("Could not save winners. Check that you have Results permission.");
    } finally {
      setBusy(false);
    }
  }

  async function applyPublish(publish) {
    setBusy(true);
    try {
      await updateEvent(id, { is_result_published: publish });
      setEvent((e) => ({ ...e, is_result_published: publish }));
      setConfirmPublish(null);
    } catch {
      setError("Could not update publish state.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <LoadingState message="Loading winners…" />;
  if (error && !event) return <ErrorState message={error} onRetry={load} />;
  if (!event) return <EmptyState title="Event not found" message="This event could not be loaded." />;

  const state = resultState(event, results);

  return (
    <div className="admin-ops-page admin-event-winners">
      <Link to={`/admin/events/${id}/participants`} className="back-link">← Back to participants</Link>
      <header className="admin-ops-header">
        <p className="section-eyebrow">Event Operations</p>
        <h1>Set winners — {event.title}</h1>
        <p>
          Select registered participants or teams. Saving creates a draft; publish separately when ready.
        </p>
        <p className="admin-result-state" aria-label={`Result state: ${state}`}>
          State: <strong>{state}</strong>
        </p>
      </header>

      {error && <ErrorState message={error} />}

      {regs.length === 0 && (
        <EmptyState
          title="No participants registered for this event"
          message="Winners can still be entered manually after registrations exist, or via Manage Results."
        />
      )}

      <div className="admin-winners-form">
        {PLACES.map((place) => (
          <label key={place.key} className="admin-winners-field">
            {place.label}
            <select
              value={picks[place.key]}
              onChange={(e) => onPick(place.key, e.target.value)}
            >
              <option value="">— Not set —</option>
              {options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  disabled={
                    Boolean(opt.value) &&
                    Object.entries(picks).some(
                      ([k, v]) => k !== place.key && v === opt.value
                    )
                  }
                >
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <div className="admin-ops-actions">
        <button type="button" className="btn btn-gold" disabled={busy} onClick={saveDraft}>
          {busy ? "Saving…" : "Save draft"}
        </button>
        {!event.is_result_published ? (
          <button
            type="button"
            className="btn btn-outline"
            disabled={busy || results.length === 0}
            onClick={() => setConfirmPublish(true)}
          >
            Publish results
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-outline"
            disabled={busy}
            onClick={() => setConfirmPublish(false)}
          >
            Unpublish results
          </button>
        )}
        <Link to="/admin/results" className="btn btn-outline">
          Manage all results
        </Link>
      </div>

      <ConfirmDialog
        open={confirmPublish !== null}
        title={confirmPublish ? "Publish results?" : "Unpublish results?"}
        message={
          confirmPublish
            ? "Published winners become visible on the public Results page."
            : "Winners will be hidden from the public site until published again."
        }
        confirmLabel={confirmPublish ? "Publish" : "Unpublish"}
        danger={!confirmPublish}
        busy={busy}
        onCancel={() => setConfirmPublish(null)}
        onConfirm={() => applyPublish(Boolean(confirmPublish))}
      />
    </div>
  );
}

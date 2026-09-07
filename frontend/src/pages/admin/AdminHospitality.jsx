import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AdminTableToolbar from "../../components/admin/AdminTableToolbar";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import StatusChip from "../../components/theme/StatusChip";
import { getAdminRegistrations, getHostels, updateAdminRegistration, getAdminAccommodationBookings, approveAccommodationBooking, rejectAccommodationBooking, updateAdminAccommodationBooking } from "../../services/api";
import { exportCsv, exportExcel } from "../../utils/adminUtils";

const VALID_TABS = new Set(["requests", "stay", "boys", "girls", "food"]);

const FOOD_LABEL = {
  none: "—",
  veg: "Vegetarian",
  non_veg: "Non-Veg",
  jain: "Jain",
};

const GENDER_LABEL = {
  male: "Male",
  female: "Female",
  other: "Other",
  unspecified: "—",
};

const STAY_STATUS = [
  { value: "pending", label: "Pending" },
  { value: "allocated", label: "Allocated" },
  { value: "checked_in", label: "Checked in" },
  { value: "checked_out", label: "Checked out" },
];

const STANDARD_HOSTEL_OPTIONS = [
  { value: "St. Thomas Mens Hostel", label: "St. Thomas Mens Hostel (Boys)", gender: "male" },
  { value: "St. Teresa Ladies Hostel", label: "St. Teresa Ladies Hostel (Girls)", gender: "female" },
];

function downloadHostelList(label, rows) {
  const generated = new Date().toLocaleString();
  const table = [
    ["MACFIESTA 2026", "Accommodation List", label, `Generated: ${generated}`],
    [],
    ["Reg #", "Name", "Institution", "Phone", "Food Preference", "Hostel", "Room", "Status", "Notes"],
    ...rows.map((r) => [
      r.registration_number || "",
      r.participant_name || "",
      r.college_name || "",
      r.phone || "",
      FOOD_LABEL[r.food_preference] || r.food_preference || "",
      r.accommodation_hostel || "",
      r.accommodation_room || "",
      r.accommodation_status || "",
      r.accommodation_notes || "",
    ]),
  ];
  const slug = label.toLowerCase().replace(/\s+/g, "-");
  exportCsv(`macfiesta-2026-${slug}.csv`, table);
  exportExcel(`macfiesta-2026-${slug}.xls`, table);
}

/**
 * Hospitality desk — accommodation, hostel lists, food requirements.
 */
export default function AdminHospitality() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rows, setRows] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const tabParam = searchParams.get("tab");
  const tab = VALID_TABS.has(tabParam) ? tabParam : "requests";
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("all");
  const [stayStatus, setStayStatus] = useState("all");
  const [hostelFilter, setHostelFilter] = useState("all");
  const [foodPref, setFoodPref] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({});
  const [customHostelMode, setCustomHostelMode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [roomDrafts, setRoomDrafts] = useState({});
  const [actionBusy, setActionBusy] = useState(null);

  function setTab(next) {
    const nextParams = new URLSearchParams(searchParams);
    if (next === "requests") nextParams.delete("tab");
    else nextParams.set("tab", next);
    setSearchParams(nextParams, { replace: true });
  }

  function load() {
    setLoading(true);
    setError("");
    Promise.all([
      getAdminRegistrations(),
      getHostels().catch(() => ({ data: [] })),
      getAdminAccommodationBookings().catch(() => ({ data: [] })),
    ])
      .then(([regRes, hostelRes, bookingRes]) => {
        setRows(Array.isArray(regRes.data) ? regRes.data : regRes.data?.results || []);
        const apiHostels = Array.isArray(hostelRes.data) ? hostelRes.data : hostelRes.data?.results || [];
        if (apiHostels.length > 0) {
          setHostels(apiHostels);
        }
        setBookings(Array.isArray(bookingRes.data) ? bookingRes.data : bookingRes.data?.results || []);
      })
      .catch(() => setError("Could not load hospitality data."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const active = useMemo(
    () => rows.filter((r) => r.approval_status !== "cancelled"),
    [rows]
  );
  const stayRows = useMemo(() => active.filter((r) => r.needs_accommodation), [active]);
  const foodRows = useMemo(
    () => active.filter((r) => r.food_preference && r.food_preference !== "none"),
    [active]
  );

  const boysList = useMemo(() => {
    return stayRows.filter((r) => {
      const h = (r.accommodation_hostel || "").toLowerCase();
      const isGirlsHostel = h.includes("girl") || h.includes("lad") || h.includes("teresa") || h.includes("alphonsa");
      if (isGirlsHostel) return false;
      const isBoysHostel = h.includes("boy") || h.includes("men") || h.includes("thomas");
      return r.gender === "male" || isBoysHostel;
    });
  }, [stayRows]);

  const girlsList = useMemo(() => {
    return stayRows.filter((r) => {
      const h = (r.accommodation_hostel || "").toLowerCase();
      const isBoysHostel = h.includes("boy") || h.includes("men") || h.includes("thomas");
      if (isBoysHostel) return false;
      const isGirlsHostel = h.includes("girl") || h.includes("lad") || h.includes("teresa") || h.includes("alphonsa");
      return r.gender === "female" || isGirlsHostel;
    });
  }, [stayRows]);

  const summary = useMemo(() => {
    const pendingCheckout = bookings.filter((b) => b.status === "pending").length;
    return {
      stay: stayRows.length,
      boys: boysList.length,
      girls: girlsList.length,
      food: foodRows.length,
      allocated: stayRows.filter((r) =>
        ["allocated", "checked_in"].includes(r.accommodation_status)
      ).length,
      pending: stayRows.filter((r) => r.accommodation_status === "pending" || r.accommodation_status === "none").length,
      veg: foodRows.filter((r) => r.food_preference === "veg").length,
      nonVeg: foodRows.filter((r) => r.food_preference === "non_veg").length,
      jain: foodRows.filter((r) => r.food_preference === "jain").length,
      checkoutRequests: bookings.length,
      checkoutPending: pendingCheckout,
    };
  }, [stayRows, foodRows, boysList, girlsList, bookings]);

  const filteredBookings = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bookings.filter((b) => {
      if (gender !== "all" && b.gender !== gender) return false;
      if (stayStatus !== "all" && b.status !== stayStatus) return false;
      if (!q) return true;
      return [b.booking_id, b.full_name, b.college, b.phone, b.hostel_name, b.email].some((v) =>
        String(v || "").toLowerCase().includes(q)
      );
    });
  }, [bookings, search, gender, stayStatus]);

  const filteredStay = useMemo(() => {
    const q = search.trim().toLowerCase();
    return stayRows.filter((r) => {
      if (gender !== "all" && r.gender !== gender) return false;
      if (stayStatus !== "all" && r.accommodation_status !== stayStatus) return false;
      if (hostelFilter !== "all") {
        const h = (r.accommodation_hostel || "").toLowerCase();
        if (hostelFilter === "boys") {
          const isBoys = h.includes("boy") || h.includes("men") || h.includes("thomas");
          if (!isBoys) return false;
        } else if (hostelFilter === "girls") {
          const isGirls = h.includes("girl") || h.includes("lad") || h.includes("teresa") || h.includes("alphonsa");
          if (!isGirls) return false;
        } else if (hostelFilter === "unallocated") {
          if (r.accommodation_hostel) return false;
        }
      }
      if (foodPref !== "all" && r.food_preference !== foodPref) return false;
      if (!q) return true;
      return [r.registration_number, r.participant_name, r.college_name, r.phone, r.accommodation_hostel].some((v) =>
        String(v || "").toLowerCase().includes(q)
      );
    });
  }, [stayRows, search, gender, stayStatus, hostelFilter, foodPref]);

  const filteredFood = useMemo(() => {
    const q = search.trim().toLowerCase();
    return foodRows.filter((r) => {
      if (gender !== "all" && r.gender !== gender) return false;
      if (foodPref !== "all" && r.food_preference !== foodPref) return false;
      if (!q) return true;
      return [r.registration_number, r.participant_name, r.college_name].some((v) =>
        String(v || "").toLowerCase().includes(q)
      );
    });
  }, [foodRows, search, gender, foodPref]);

  function startEdit(r) {
    setEditingId(r.id);
    const existing = r.accommodation_hostel || "";
    const isKnown = STANDARD_HOSTEL_OPTIONS.some((o) => o.value === existing);
    setCustomHostelMode(Boolean(existing && !isKnown));
    setDraft({
      accommodation_status: r.accommodation_status === "none" ? "pending" : r.accommodation_status,
      accommodation_hostel: existing,
      accommodation_room: r.accommodation_room || "",
      accommodation_notes: r.accommodation_notes || "",
      gender: r.gender || "unspecified",
    });
  }

  async function saveEdit() {
    if (!editingId) return;
    setBusy(true);
    try {
      const res = await updateAdminRegistration(editingId, draft);
      setRows((prev) => prev.map((r) => (r.id === editingId ? { ...r, ...res.data } : r)));
      setEditingId(null);
    } catch {
      setError("Could not update accommodation record.");
    } finally {
      setBusy(false);
    }
  }

  async function approveStayRequest(booking) {
    setActionBusy(booking.id);
    setError("");
    try {
      const res = await approveAccommodationBooking(booking.id, {
        allocated_room: (roomDrafts[booking.id] || "").trim(),
      });
      setBookings((prev) => prev.map((b) => (b.id === booking.id ? res.data : b)));
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not allocate this booking.");
    } finally {
      setActionBusy(null);
    }
  }

  async function markCheckedIn(booking) {
    setActionBusy(booking.id);
    setError("");
    try {
      const res = await updateAdminAccommodationBooking(booking.id, { status: "checked_in" });
      setBookings((prev) => prev.map((b) => (b.id === booking.id ? { ...b, ...res.data } : b)));
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not mark check-in.");
    } finally {
      setActionBusy(null);
    }
  }

  async function rejectStayRequest(booking) {
    const reason = window.prompt("Optional note for the student (leave blank to decline without a note):", "") ?? null;
    if (reason === null) return;
    setActionBusy(booking.id);
    setError("");
    try {
      const res = await rejectAccommodationBooking(booking.id, { admin_notes: reason.trim() });
      setBookings((prev) => prev.map((b) => (b.id === booking.id ? res.data : b)));
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not cancel this booking.");
    } finally {
      setActionBusy(null);
    }
  }

  return (
    <div className="admin-ops-page admin-hospitality-page">
      <header className="admin-ops-header">
        <p className="section-eyebrow">Hospitality</p>
        <h1>Hospitality Operations</h1>
        <p>Hospitality marks room allocation and check-in for student hostel bookings. Each hostel closes after 50 beds.</p>
      </header>

      <div className="admin-kpi-grid">
        <article className="admin-kpi-card"><strong>{summary.checkoutPending}</strong><span>Pending room allocation</span></article>
        <article className="admin-kpi-card"><strong>{summary.checkoutRequests}</strong><span>Hostel bookings</span></article>
        <article className="admin-kpi-card"><strong>{summary.stay}</strong><span>Event stay flags</span></article>
        <article className="admin-kpi-card"><strong>{summary.food}</strong><span>Food requests</span></article>
        <article className="admin-kpi-card"><strong>{summary.allocated}</strong><span>Allocated / checked in</span></article>
        <article className="admin-kpi-card"><strong>{summary.pending}</strong><span>Event stay pending</span></article>
      </div>

      <div className="admin-ops-tabs" role="tablist" aria-label="Hospitality views">
        {[
          { id: "requests", label: "Stay bookings" },
          { id: "stay", label: "Event accommodation" },
          { id: "boys", label: "Boys Hostel List" },
          { id: "girls", label: "Girls Hostel List" },
          { id: "food", label: "Food Requirements" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`admin-ops-tab${tab === t.id ? " active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {(tab === "stay" || tab === "food" || tab === "requests") && (
        <AdminTableToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Name, reference, institution…">
          <select className="admin-select" value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="all">All genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="unspecified">Unspecified</option>
          </select>
          {(tab === "stay" || tab === "requests") && (
            <>
              <select className="admin-select" value={stayStatus} onChange={(e) => setStayStatus(e.target.value)}>
                <option value="all">All statuses</option>
                {STAY_STATUS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
                {tab === "requests" && <option value="confirmed">Confirmed</option>}
                {tab === "requests" && <option value="cancelled">Cancelled</option>}
              </select>
              {tab === "stay" && (
              <select className="admin-select" value={hostelFilter} onChange={(e) => setHostelFilter(e.target.value)}>
                <option value="all">All hostels</option>
                <option value="boys">Boys Hostel</option>
                <option value="girls">Girls Hostel</option>
                <option value="unallocated">Unallocated / Not set</option>
              </select>
              )}
            </>
          )}
          {tab !== "requests" && (
          <select className="admin-select" value={foodPref} onChange={(e) => setFoodPref(e.target.value)}>
            <option value="all">All food prefs</option>
            <option value="veg">Vegetarian</option>
            <option value="non_veg">Non-Veg</option>
            <option value="jain">Jain</option>
          </select>
          )}
        </AdminTableToolbar>
      )}

      {loading && <LoadingState message="Loading hospitality data…" />}
      {error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && tab === "requests" && (
        <>
          {filteredBookings.length === 0 ? (
            <EmptyState title="No hostel bookings" message="Students who book at /checkout?accommodation=true appear here so hospitality can allocate rooms and mark check-in." />
          ) : (
            <div className="admin-table-wrap">
              <table className="dash-table admin-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Name</th>
                    <th>Institution</th>
                    <th>Phone</th>
                    <th>Hostel</th>
                    <th>Dates</th>
                    <th>Heads</th>
                    <th>Stay</th>
                    <th>Payment</th>
                    <th>Room</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b) => (
                    <tr key={b.id}>
                      <td><strong>{b.booking_id}</strong></td>
                      <td>
                        <strong>{b.full_name}</strong>
                        <div className="muted-line">{b.email || ""}</div>
                      </td>
                      <td>{b.college || "—"}</td>
                      <td>{b.phone || "—"}</td>
                      <td>{b.hostel_name || b.allocated_hostel || "—"}</td>
                      <td>{b.check_in_date} → {b.check_out_date}</td>
                      <td>{b.persons_count ?? 1}</td>
                      <td><StatusChip status={b.status || "pending"} /></td>
                      <td><StatusChip status={b.payment_status || "pending"} /></td>
                      <td>
                        {b.status === "pending" ? (
                          <input
                            className="admin-select"
                            placeholder="Room (optional)"
                            value={roomDrafts[b.id] || ""}
                            onChange={(e) => setRoomDrafts((prev) => ({ ...prev, [b.id]: e.target.value }))}
                          />
                        ) : (
                          b.allocated_room || "—"
                        )}
                      </td>
                      <td>
                        {b.status === "pending" ? (
                          <div className="admin-row-actions" style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                            <button
                              type="button"
                              className="btn btn-gold btn-sm"
                              disabled={actionBusy === b.id}
                              onClick={() => approveStayRequest(b)}
                            >
                              {actionBusy === b.id ? "Saving…" : "Allocate room"}
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              disabled={actionBusy === b.id}
                              onClick={() => rejectStayRequest(b)}
                            >
                              Cancel booking
                            </button>
                          </div>
                        ) : b.status === "allocated" || b.status === "confirmed" ? (
                          <button
                            type="button"
                            className="btn btn-gold btn-sm"
                            disabled={actionBusy === b.id}
                            onClick={() => markCheckedIn(b)}
                          >
                            {actionBusy === b.id ? "Saving…" : "Mark check-in"}
                          </button>
                        ) : (
                          <span className="muted-line">{b.admin_notes || "—"}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {!loading && !error && tab === "stay" && (
        <>
          {filteredStay.length === 0 ? (
            <EmptyState title="No accommodation requests" message="No students currently require accommodation for this filter." />
          ) : (
            <div className="admin-table-wrap">
              <table className="dash-table admin-table">
                <thead>
                  <tr>
                    <th>Reg #</th>
                    <th>Name</th>
                    <th>Institution</th>
                    <th>Gender</th>
                    <th>Phone</th>
                    <th>Persons</th>
                    <th>Food</th>
                    <th>Status</th>
                    <th>Room</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStay.map((r) => (
                    <tr key={r.id}>
                      <td>{r.registration_number || "—"}</td>
                      <td><strong>{r.participant_name}</strong></td>
                      <td>{r.college_name}</td>
                      <td>{GENDER_LABEL[r.gender] || r.gender || "—"}</td>
                      <td>{r.phone || "—"}</td>
                      <td>{r.accommodation_count ?? 1}</td>
                      <td>{FOOD_LABEL[r.food_preference] || "—"}</td>
                      <td><StatusChip status={r.accommodation_status || "pending"} /></td>
                      <td>
                        {[r.accommodation_hostel, r.accommodation_room].filter(Boolean).join(" · ") || "—"}
                      </td>
                      <td>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => startEdit(r)}>
                          Allocate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {!loading && !error && tab === "boys" && (
        <HostelPanel
          title="Boys Hostel List"
          rows={boysList}
          onExport={() => downloadHostelList("Boys Hostel", boysList)}
          onAllocate={startEdit}
        />
      )}

      {!loading && !error && tab === "girls" && (
        <HostelPanel
          title="Girls Hostel List"
          rows={girlsList}
          onExport={() => downloadHostelList("Girls Hostel", girlsList)}
          onAllocate={startEdit}
        />
      )}

      {!loading && !error && tab === "food" && (
        <>
          <div className="admin-kpi-grid admin-kpi-grid--compact">
            <article className="admin-kpi-card"><strong>{summary.food}</strong><span>Total food requests</span></article>
            <article className="admin-kpi-card"><strong>{summary.veg}</strong><span>Vegetarian</span></article>
            <article className="admin-kpi-card"><strong>{summary.nonVeg}</strong><span>Non-Vegetarian</span></article>
            <article className="admin-kpi-card"><strong>{summary.jain}</strong><span>Jain</span></article>
          </div>
          {filteredFood.length === 0 ? (
            <EmptyState title="No food requests" message="No food preferences recorded for this filter." />
          ) : (
            <div className="admin-table-wrap">
              <table className="dash-table admin-table">
                <thead>
                  <tr>
                    <th>Reg #</th>
                    <th>Name</th>
                    <th>Institution</th>
                    <th>Gender</th>
                    <th>Food Preference</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFood.map((r) => (
                    <tr key={r.id}>
                      <td>{r.registration_number || "—"}</td>
                      <td>{r.participant_name}</td>
                      <td>{r.college_name}</td>
                      <td>{GENDER_LABEL[r.gender] || "—"}</td>
                      <td>{FOOD_LABEL[r.food_preference]}</td>
                      <td>{r.food_notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="muted-line">
            Full attendance/food exports are also available on the <Link to="/admin/reports">Reports</Link> page.
          </p>
        </>
      )}

      {editingId && (
        <div className="admin-drawer-backdrop" role="presentation" onClick={() => setEditingId(null)}>
          <aside className="admin-drawer" role="dialog" aria-label="Allocate accommodation" onClick={(e) => e.stopPropagation()}>
            <header className="admin-drawer-head">
              <h2>Allocate / check in</h2>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditingId(null)}>Close</button>
            </header>
            <div className="admin-drawer-body admin-form-grid">
              <label>
                Gender
                <select
                  value={draft.gender}
                  onChange={(e) => setDraft((d) => ({ ...d, gender: e.target.value }))}
                >
                  <option value="unspecified">Unspecified</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label>
                Status
                <select
                  value={draft.accommodation_status}
                  onChange={(e) => setDraft((d) => ({ ...d, accommodation_status: e.target.value }))}
                >
                  {STAY_STATUS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </label>
              <label>
                Hostel
                <select
                  value={
                    customHostelMode
                      ? "__custom__"
                      : draft.accommodation_hostel || ""
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "__custom__") {
                      setCustomHostelMode(true);
                      setDraft((d) => ({ ...d, accommodation_hostel: "" }));
                    } else {
                      setCustomHostelMode(false);
                      setDraft((d) => {
                        const next = { ...d, accommodation_hostel: val };
                        // Auto-align gender if unspecified
                        if (val === "Boys Hostel" || val.includes("Mens") || val.includes("Thomas")) {
                          if (!d.gender || d.gender === "unspecified") next.gender = "male";
                        } else if (val === "Girls Hostel" || val.includes("Ladies") || val.includes("Teresa") || val.includes("Alphonsa")) {
                          if (!d.gender || d.gender === "unspecified") next.gender = "female";
                        }
                        if (val && (!d.accommodation_status || d.accommodation_status === "pending")) {
                          next.accommodation_status = "allocated";
                        }
                        return next;
                      });
                    }
                  }}
                >
                  <option value="">— Select Hostel —</option>
                  <optgroup label="Official Campus Hostels">
                    {hostels.length > 0 ? (
                      hostels.map((h) => {
                        const displayName = h.name.includes("(") ? h.name : `${h.name} (${h.gender === "male" ? "Boys" : "Girls"})`;
                        return (
                          <option key={h.id || h.name} value={displayName}>
                            {displayName}
                          </option>
                        );
                      })
                    ) : (
                      STANDARD_HOSTEL_OPTIONS.map((h) => (
                        <option key={h.value} value={h.value}>
                          {h.label}
                        </option>
                      ))
                    )}
                  </optgroup>
                  {draft.accommodation_hostel &&
                    !STANDARD_HOSTEL_OPTIONS.some((o) => o.value === draft.accommodation_hostel) &&
                    !hostels.some((h) => h.name === draft.accommodation_hostel || `${h.name} (${h.gender === "male" ? "Boys" : "Girls"})` === draft.accommodation_hostel) &&
                    !customHostelMode && (
                      <option value={draft.accommodation_hostel}>
                        {draft.accommodation_hostel} (Current)
                      </option>
                    )}
                  <option value="__custom__">Other / Custom Hostel…</option>
                </select>
                {customHostelMode && (
                  <input
                    style={{ marginTop: "0.35rem" }}
                    value={draft.accommodation_hostel}
                    onChange={(e) => setDraft((d) => ({ ...d, accommodation_hostel: e.target.value }))}
                    placeholder="Enter hostel name"
                    autoFocus
                  />
                )}
              </label>
              <label>
                Room
                <input
                  value={draft.accommodation_room}
                  onChange={(e) => setDraft((d) => ({ ...d, accommodation_room: e.target.value }))}
                  placeholder="Room number"
                />
              </label>
              <label className="span-2">
                Notes
                <input
                  value={draft.accommodation_notes}
                  onChange={(e) => setDraft((d) => ({ ...d, accommodation_notes: e.target.value }))}
                />
              </label>
            </div>
            <footer className="admin-drawer-actions">
              <button type="button" className="btn btn-gold" disabled={busy} onClick={saveEdit}>
                {busy ? "Saving…" : "Save allocation"}
              </button>
            </footer>
          </aside>
        </div>
      )}
    </div>
  );
}

function HostelPanel({ title, rows, onExport, onAllocate }) {
  if (rows.length === 0) {
    return <EmptyState title={`No ${title.toLowerCase()} entries`} message="Only students requiring accommodation and marked with this gender appear here." />;
  }
  return (
    <div>
      <div className="admin-list-head">
        <h2>{title}</h2>
        <button type="button" className="btn btn-gold btn-sm" onClick={onExport}>
          Download CSV / Excel
        </button>
      </div>
      <div className="admin-table-wrap">
        <table className="dash-table admin-table">
          <thead>
            <tr>
              <th>Reg #</th>
              <th>Name</th>
              <th>Institution</th>
              <th>Phone</th>
              <th>Food</th>
              <th>Allocation</th>
              <th>Notes</th>
              {onAllocate && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.registration_number || "—"}</td>
                <td>{r.participant_name}</td>
                <td>{r.college_name}</td>
                <td>{r.phone || "—"}</td>
                <td>{FOOD_LABEL[r.food_preference] || "—"}</td>
                <td>
                  {[r.accommodation_hostel, r.accommodation_room, r.accommodation_status]
                    .filter(Boolean)
                    .join(" · ") || "Pending"}
                </td>
                <td>{r.accommodation_notes || "—"}</td>
                {onAllocate && (
                  <td>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => onAllocate(r)}>
                      Allocate
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

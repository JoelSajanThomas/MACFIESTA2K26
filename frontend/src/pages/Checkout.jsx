import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCheckboxCircleFill,
  RiCheckboxBlankCircleLine,
  RiSearchLine,
  RiCloseLine,
  RiAddLine,
  RiShieldCheckLine,
  RiShieldFlashLine,
  RiHotelBedLine,
  RiRestaurantLine,
  RiInformationLine,
  RiTrophyLine,
  RiQrCodeLine,
  RiTeamLine,
  RiUserStarLine,
  RiGroupLine,
} from "react-icons/ri";
import PaymentProofPanel from "../components/PaymentProofPanel";
import LoadingState from "../components/ui/LoadingState";
import CollegeSchoolPicker from "../components/CollegeSchoolPicker";
import { BackgroundVideo } from "../components/ui/BackgroundVideo";
import { usePageSeo } from "../hooks/usePageSeo";
import {
  MACFIESTA_PAYMENT,
  REGISTRATION_ADDONS,
  applyPublicFestConfig,
} from "../utils/registrationFees";
import {
  clearCart,
  getCartEventIds,
  toggleCartEvent,
  removeCartEvent,
} from "../utils/eventCart";
import { formatRegistrationFee } from "../utils/festDays";
import { loadParticipantProfile } from "../utils/participantProfile";
import {
  createRegistrationBatch,
  getCurrentUser,
  getEvents,
  getPublicFestConfig,
  isLoggedIn,
} from "../services/api";

/** Validates Indian mobile numbers (strictly 10 digits starting with 6-9, or +91 prefix) */
function validatePhone(raw) {
  const stripped = (raw || "").replace(/\s+/g, "");
  const digits = stripped.replace(/\D/g, "");
  if (!digits) return "Mobile number is required.";
  if (digits.length === 12 && digits.startsWith("91")) {
    const num = digits.slice(2);
    if (!/^[6-9]/.test(num)) return "Mobile number must start with 6, 7, 8, or 9.";
    return null;
  }
  if (digits.length > 10) {
    return "Mobile number cannot exceed 10 digits.";
  }
  if (digits.length < 10) {
    return `Mobile number must be 10 digits (${digits.length}/10 entered).`;
  }
  if (!/^[6-9]/.test(digits)) {
    return "Mobile number must start with 6, 7, 8, or 9.";
  }
  return null;
}

function money(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [cartIds, setCartIds] = useState(() => getCartEventIds());
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const [addons, setAddons] = useState(() => ({ ...REGISTRATION_ADDONS }));
  const [payment, setPayment] = useState(() => ({ ...MACFIESTA_PAYMENT }));
  const [showEventPicker, setShowEventPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState("all"); // 'all' | 'college' | 'school'
  const [formatFilter, setFormatFilter] = useState("all"); // 'all' | 'solo' | 'squad'

  const saved = loadParticipantProfile();
  const [form, setForm] = useState({
    registration_type: "individual", // 'individual' | 'team'
    team_name: "",
    department: "",
    register_number: "",
    college_name: saved?.college_name || "",
    phone: saved?.phone || "",
    gender: saved?.gender || "male",
    food_breakfast: false,
    food_lunch: false,
    food_dinner: false,
    food_diet_type: "veg", // 'veg' | 'non_veg'
    food_notes: "",
    needs_accommodation: false,
    accommodation_count: "1",
    accommodation_notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [result, setResult] = useState(null);

  usePageSeo({
    title: "Mission Registration & Payment · MacFiesta 2026",
    description: "Complete your online registration, configure hospitality, and verify tournament entry passes.",
  });

  const pathname = location.pathname;
  const search = location.search;

  useEffect(() => {
    if (!isLoggedIn()) {
      const target = `${pathname}${search}`;
      navigate(`/login?next=${encodeURIComponent(target)}`, { replace: true });
      return undefined;
    }
    let mounted = true;
    Promise.all([getEvents(), getCurrentUser(), getPublicFestConfig().catch(() => null)])
      .then(([ev, user, cfg]) => {
        if (!mounted) return;
        const eventList = ev.data || [];
        setEvents(eventList);
        setAccount(user.data);

        // Pre-select event from URL if present
        const preselectSlug = searchParams.get("event");
        if (preselectSlug && eventList.length > 0) {
          const match = eventList.find(
            (e) => e.slug === preselectSlug || String(e.id) === preselectSlug
          );
          if (match && !getCartEventIds().includes(Number(match.id))) {
            const updated = toggleCartEvent(match.id);
            setCartIds(updated);
          }
        }

        // Auto-configure accommodation if routed from Accommodation page
        const accomParam = searchParams.get("accommodation");
        const hostelParam = searchParams.get("hostel");

        if (cfg?.data) {
          applyPublicFestConfig(cfg.data);
          setAddons({ ...REGISTRATION_ADDONS });
          setPayment({ ...MACFIESTA_PAYMENT });
        }
        const profile = loadParticipantProfile();
        setForm((prev) => ({
          ...prev,
          college_name: prev.college_name || profile?.college_name || "",
          phone: prev.phone || profile?.phone || user.data?.phone || "",
          needs_accommodation: accomParam === "true" ? true : prev.needs_accommodation,
          accommodation_notes: hostelParam
            ? `Preferred Hostel: ${hostelParam}`
            : prev.accommodation_notes,
        }));
      })
      .catch(() => setError("Could not load checkout data."))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [navigate, searchParams, pathname, search]);

  function handleToggleEvent(id) {
    const updated = toggleCartEvent(id);
    setCartIds(updated);
  }

  function handleRemoveEvent(id) {
    const updated = removeCartEvent(id);
    setCartIds(updated);
  }

  // Selected events
  const selected = useMemo(
    () => events.filter((e) => cartIds.includes(Number(e.id))),
    [events, cartIds]
  );

  // Check selected events: separate solo and squad lists
  const squadEvents = useMemo(
    () =>
      selected.filter(
        (ev) =>
          ev.type === "squad" ||
          (ev.max_team_size && ev.max_team_size > 1) ||
          (ev.maxTeamSize && ev.maxTeamSize > 1)
      ),
    [selected]
  );
  const soloEvents = useMemo(
    () =>
      selected.filter(
        (ev) =>
          !(
            ev.type === "squad" ||
            (ev.max_team_size && ev.max_team_size > 1) ||
            (ev.maxTeamSize && ev.maxTeamSize > 1)
          )
      ),
    [selected]
  );
  const hasSquadEvents = squadEvents.length > 0;
  const hasSoloEvents = soloEvents.length > 0;

  // Available categories
  const categories = useMemo(() => {
    const set = new Set(events.map((e) => e.category || "General").filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [events]);

  // Filtered event list for the inline picker
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const isSquad = Boolean(
        ev.type === "squad" ||
        (ev.max_team_size && ev.max_team_size > 1) ||
        (ev.maxTeamSize && ev.maxTeamSize > 1)
      );
      const matchFormat =
        formatFilter === "all" ||
        (formatFilter === "squad" ? isSquad : !isSquad);
      const matchScope =
        scopeFilter === "all" ||
        (ev.audience || "").toLowerCase() === scopeFilter.toLowerCase();
      const matchCat =
        categoryFilter === "all" ||
        (ev.category || "General").toLowerCase() === categoryFilter.toLowerCase();
      const matchQuery =
        !searchQuery ||
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ev.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ev.department || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchFormat && matchScope && matchCat && matchQuery;
    });
  }, [events, formatFilter, scopeFilter, categoryFilter, searchQuery]);

  const feeBreakdown = useMemo(() => {
    const eventTotal = selected.reduce((s, e) => s + (Number(e.registration_fee) || 0), 0);
    const soloTotal = soloEvents.reduce((s, e) => s + (Number(e.registration_fee) || 0), 0);
    const squadTotal = squadEvents.reduce((s, e) => s + (Number(e.registration_fee) || 0), 0);
    const stayCount = Math.max(1, Number(form.accommodation_count) || 1);
    const accommodation = form.needs_accommodation
      ? (addons.accommodationPerPerson || 350) * stayCount
      : 0;
    const breakfast = form.needs_accommodation && form.food_breakfast
      ? (addons.breakfast || 50) * stayCount
      : 0;
    const lunch = form.needs_accommodation && form.food_lunch
      ? (addons.lunch || 70) * stayCount
      : 0;
    const dinner = form.needs_accommodation && form.food_dinner
      ? (addons.dinner || 50) * stayCount
      : 0;
    const foodTotal = breakfast + lunch + dinner;
    return {
      eventTotal,
      soloTotal,
      squadTotal,
      breakfast,
      lunch,
      dinner,
      food: foodTotal,
      accommodation,
      stayCount,
      total: eventTotal + foodTotal + accommodation,
    };
  }, [selected, soloEvents, squadEvents, form, addons]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
      setForm((prev) => ({ ...prev, phone: digitsOnly }));
      if (digitsOnly.length > 0) {
        setPhoneError(validatePhone(digitsOnly) || "");
      } else {
        setPhoneError("");
      }
      return;
    }
    if (name === "needs_accommodation") {
      setForm((prev) => ({
        ...prev,
        needs_accommodation: checked,
        // Reset meals when unchecking accommodation
        ...(checked ? {} : { food_breakfast: false, food_lunch: false, food_dinner: false }),
      }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!selected.length) {
      setError("Please select at least one mission / event from the list to register.");
      return;
    }
    const college = (form.college_name || "").trim();
    if (!college || college.length < 2) {
      setError("Please select or enter your College / School name.");
      return;
    }
    const phone = (form.phone || "").trim();
    const phoneErr = validatePhone(phone);
    if (phoneErr) {
      setPhoneError(phoneErr);
      setError(phoneErr);
      return;
    }
    setPhoneError("");

    setSubmitting(true);
    try {
      const isTeam = form.registration_type === "team" || hasSquadEvents;
      const teamName = isTeam ? (form.team_name || `${account?.full_name || account?.username || "Squad"}'s Team`).trim() : "";

      const selectedMeals = [];
      if (form.food_breakfast) selectedMeals.push("breakfast");
      if (form.food_lunch) selectedMeals.push("lunch");
      if (form.food_dinner) selectedMeals.push("dinner");
      const foodPreferencePayload = selectedMeals.length > 0 ? selectedMeals.join("+") : "none";

      const res = await createRegistrationBatch({
        events: selected.map((ev) => ev.id),
        registration_type: isTeam ? "team" : "individual",
        team_name: teamName,
        department: form.department || "",
        register_number: form.register_number || "",
        participant_name: account?.full_name || account?.username || "",
        email: account?.email || "",
        college_name: college,
        phone: phone,
        gender: form.gender || "male",
        food_preference: foodPreferencePayload,
        food_notes: form.food_notes
          ? `${form.food_diet_type.toUpperCase()} | ${form.food_notes}`
          : form.food_diet_type.toUpperCase(),
        needs_accommodation: form.needs_accommodation,
        accommodation_count: form.needs_accommodation
          ? Number(form.accommodation_count) || 1
          : null,
        accommodation_notes: form.accommodation_notes,
        needs_transport: false,
        transport_note: "",
      });
      saveParticipantProfile({
        full_name: account?.full_name || account?.username || "",
        college_name: college,
        phone: phone,
        email: account?.email || "",
        gender: form.gender || "male",
      });
      clearCart();
      setCartIds([]);
      setResult(res.data);
    } catch (err) {
      const data = err?.response?.data;
      let msg = "Registration checkout failed. Please review your details.";
      if (typeof data === "string") {
        msg = data;
      } else if (data && typeof data === "object") {
        if (data.detail) {
          msg = Array.isArray(data.detail) ? data.detail[0] : String(data.detail);
        } else {
          const parts = [];
          for (const [k, v] of Object.entries(data)) {
            const field = k.replace(/_/g, " ");
            const valMsg = Array.isArray(v) ? v[0] : typeof v === "string" ? v : JSON.stringify(v);
            parts.push(`${field}: ${valMsg}`);
          }
          if (parts.length > 0) msg = parts.join(" | ");
        }
      }
      setError(typeof msg === "string" ? msg : "Registration checkout failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-[#05050A] min-h-screen pt-32 pb-16 flex items-center justify-center font-excon">
        <LoadingState message="Initializing S.H.I.E.L.D. Mission Checkout…" />
      </div>
    );
  }

  if (result) {
    return (
      <div className="bg-[#05050A] min-h-screen pt-28 pb-16 relative overflow-hidden font-excon">
        <BackgroundVideo
          src="/MARVEL/Video Project 6.mp4"
          fallbackSrc="/MARVEL/Video Project 4.mp4"
          opacity="opacity-60"
        />

        <div className="max-w-4xl mx-auto px-4 relative z-10 space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)]">
              <RiShieldFlashLine className="animate-pulse text-metallic-gold" />
              <span>S.H.I.E.L.D. SECURE PAYMENT GATEWAY</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white font-excon-black">
              <span className="shimmer-text">PAYMENT</span>{" "}
              <span className="gradient-text-gold">VERIFICATION</span>
            </h1>
            <p className="text-white/70 text-xs sm:text-sm font-space max-w-lg mx-auto">
              Scan the UPI QR code below with any UPI app (GPay, PhonePe, Paytm) to complete your pass verification.
            </p>
          </div>

          <div className="marvel-card p-6 sm:p-8 rounded-3xl border border-metallic-gold/40 bg-[#0A0D1A]/95 shadow-2xl space-y-6">
            <PaymentProofPanel
              registrations={result.registrations}
              paymentAmountTotal={result.payment_amount_total}
              eventFeeTotal={result.event_fee_total}
              accommodationFeeTotal={result.accommodation_fee_total}
              foodFeeTotal={result.food_fee_total}
              hospitalityTotal={result.hospitality_total}
              payment={payment}
              onUpdated={(regs) =>
                setResult((prev) => ({
                  ...prev,
                  registrations: Array.isArray(regs) ? regs : prev.registrations,
                }))
              }
            />
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/10">
              <Link
                to="/student-dashboard"
                className="w-full sm:flex-1 py-3.5 bg-metallic-gold hover:bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] font-excon-black text-center"
              >
                Open My Agent Dashboard
              </Link>
              <Link
                to="/events"
                className="w-full sm:flex-1 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition-all border border-white/20 text-center"
              >
                Browse More Missions
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#05050A] min-h-screen pt-24 pb-36 sm:pb-24 relative overflow-hidden font-excon">
      {/* Marvel Atmosphere Background */}
      <BackgroundVideo
        src="/MARVEL/Video Project 6.mp4"
        fallbackSrc="/MARVEL/Video Project 4.mp4"
        opacity="opacity-45"
      />
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[350px] rounded-full bg-metallic-gold/5 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[600px] h-[350px] rounded-full bg-arc-cyan/5 blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        {/* ─── Hero Section Header ─── */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold text-[10px] sm:text-xs font-bold tracking-[0.15em] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)] font-space">
            <RiShieldFlashLine className="animate-pulse text-metallic-gold" />
            <span className="hidden sm:inline">S.H.I.E.L.D. COMMAND PROTOCOL · SECURE CHECKOUT</span>
            <span className="sm:hidden">SECURE CHECKOUT</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white font-excon-black">
            <span className="shimmer-text">EVENT REGISTRATION</span>{" "}
            <span className="gradient-text-gold">&amp; PAYMENT</span>
          </h1>

          {/* Animated expanding divider */}
          <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-metallic-gold to-transparent origin-center" />

          <p className="text-white/70 text-xs sm:text-sm font-space max-w-xl mx-auto leading-relaxed">
            Confirm your registered missions, configure hostel &amp; meal options, and pay securely via online UPI to claim your entry pass.
          </p>
        </div>

        {/* ─── Main 2-Column Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ─── Left Column: Registration Details (First on mobile & desktop) ─── */}
          <form
            id="checkout-form"
            className="order-1 lg:order-1 lg:col-span-7 marvel-card p-4 sm:p-7 rounded-3xl border border-white/15 bg-[#0A0D1A]/95 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl space-y-5"
            onSubmit={handleSubmit}
          >
            {/* Delegate Status Banner */}
            <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-metallic-gold/20 border border-metallic-gold/40 text-metallic-gold flex items-center justify-center font-bold shrink-0">
                  <RiShieldCheckLine size={16} />
                </div>
                <div className="truncate pr-2">
                  <span className="block text-[10px] uppercase font-bold text-white/50">Authenticated Delegate</span>
                  <span className="block text-white font-black font-excon-bold truncate">
                    {account?.full_name || account?.email || account?.username}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] text-white/50 block font-mono">Running Total</span>
                <span className="text-xs sm:text-sm font-black text-metallic-gold font-mono glow-text-gold">
                  {money(feeBreakdown.total)}
                </span>
              </div>
            </div>

            {/* ─── Selected Events Block with Inline Multi-Select ─── */}
            <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-metallic-gold/30 shadow-inner">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-metallic-gold flex items-center gap-2 font-excon-black">
                  <RiTrophyLine className="text-sm" />
                  <span>Enrolled Missions ({selected.length})</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowEventPicker(!showEventPicker)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-metallic-gold/15 hover:bg-metallic-gold text-metallic-gold hover:text-black border border-metallic-gold/40 transition-all cursor-pointer shadow-sm font-excon-bold"
                >
                  <RiAddLine className="text-sm" />
                  <span>{showEventPicker ? "Done Selecting" : "+ Select / Add Events"}</span>
                </button>
              </div>

              {/* Selected Event Badges / Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {selected.length === 0 ? (
                  <div className="w-full text-center py-4 text-white/50 text-xs italic bg-black/40 rounded-xl border border-white/5 font-space">
                    No missions selected yet. Click <strong className="text-metallic-gold">&quot;+ Select / Add Events&quot;</strong> above to choose events.
                  </div>
                ) : (
                  selected.map((ev) => (
                    <motion.span
                      key={ev.id}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-metallic-gold/15 text-white border border-metallic-gold/40 shadow-sm"
                    >
                      <span className="truncate max-w-[180px] sm:max-w-[240px] font-excon-bold">
                        {ev.title}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${
                          Boolean(
                            ev.type === "squad" ||
                            (ev.max_team_size && ev.max_team_size > 1) ||
                            (ev.maxTeamSize && ev.maxTeamSize > 1)
                          )
                            ? "bg-arc-cyan/20 text-arc-cyan border border-arc-cyan/40"
                            : "bg-white/10 text-white/70 border border-white/20"
                        }`}
                      >
                        {Boolean(
                          ev.type === "squad" ||
                          (ev.max_team_size && ev.max_team_size > 1) ||
                          (ev.maxTeamSize && ev.maxTeamSize > 1)
                        )
                          ? "Squad"
                          : "Solo"}
                      </span>
                      <span className="font-mono text-metallic-gold font-bold text-[11px]">
                        ({formatRegistrationFee(ev)})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEvent(ev.id)}
                        className="text-white/40 hover:text-red-400 p-0.5 rounded transition-colors"
                        title="Remove event"
                      >
                        <RiCloseLine className="text-sm" />
                      </button>
                    </motion.span>
                  ))
                )}
              </div>

              {/* Inline Multi-Select Accordion / Dropdown */}
              <AnimatePresence>
                {showEventPicker && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden pt-3 border-t border-white/10 space-y-3"
                  >
                    {/* Filter Tabs: Scope (College vs School) & Format (Solo vs Team) */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                      {/* Scope Tabs */}
                      <div className="flex items-center gap-1 p-1 rounded-xl bg-black/50 border border-white/10 text-xs font-mono overflow-x-auto select-scrollbar">
                        {[
                          { id: "all", label: "All Scopes" },
                          { id: "college", label: "🎓 College (Day 2)" },
                          { id: "school", label: "🎒 School (Day 1)" },
                        ].map((tab) => {
                          const active = scopeFilter === tab.id;
                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setScopeFilter(tab.id)}
                              className={`flex-1 sm:flex-none px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                                active
                                  ? "bg-metallic-gold text-black shadow-md font-excon-bold"
                                  : "text-white/60 hover:text-white"
                              }`}
                            >
                              {tab.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Format Tabs: Solo vs Squad */}
                      <div className="flex items-center gap-1 p-1 rounded-xl bg-black/50 border border-arc-cyan/30 text-xs font-mono overflow-x-auto select-scrollbar">
                        {[
                          { id: "all", label: "All Formats" },
                          { id: "solo", label: "👤 Solo" },
                          { id: "squad", label: "👥 Squad / Team" },
                        ].map((tab) => {
                          const active = formatFilter === tab.id;
                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setFormatFilter(tab.id)}
                              className={`flex-1 sm:flex-none px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                                active
                                  ? "bg-arc-cyan text-black shadow-md font-excon-bold"
                                  : "text-white/60 hover:text-white"
                              }`}
                            >
                              {tab.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Search & Category filter */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-xs pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Filter missions by name…"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-black/60 border border-white/15 rounded-xl text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-metallic-gold"
                        />
                      </div>
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none cursor-pointer uppercase font-mono"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c} className="bg-[#0b0c16]">
                            {c.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Checkbox Items List */}
                    <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 divide-y divide-white/5">
                      {filteredEvents.map((ev) => {
                        const isChecked = cartIds.includes(Number(ev.id));
                        return (
                          <div
                            key={ev.id}
                            onClick={() => handleToggleEvent(ev.id)}
                            className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all select-none ${
                              isChecked
                                ? "bg-metallic-gold/20 border border-metallic-gold/50 text-white"
                                : "hover:bg-white/5 text-white/70"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                              {isChecked ? (
                                <RiCheckboxCircleFill className="text-metallic-gold text-lg shrink-0" />
                              ) : (
                                <RiCheckboxBlankCircleLine className="text-white/30 text-lg shrink-0" />
                              )}
                              <div className="truncate">
                                <p className="text-xs font-black text-white uppercase tracking-tight truncate font-excon-black">
                                  {ev.title}
                                </p>
                                <div className="flex items-center gap-1.5 pt-0.5">
                                  <span
                                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                                      ev.audience === "school"
                                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                        : "bg-metallic-gold/20 text-metallic-gold border border-metallic-gold/30"
                                    }`}
                                  >
                                    {ev.audience === "school" ? "School" : "College"}
                                  </span>
                                  <span
                                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                                      Boolean(ev.type === "squad" || (ev.max_team_size && ev.max_team_size > 1) || (ev.maxTeamSize && ev.maxTeamSize > 1))
                                        ? "bg-arc-cyan/20 text-arc-cyan border border-arc-cyan/40"
                                        : "bg-white/10 text-white/70 border border-white/20"
                                    }`}
                                  >
                                    {Boolean(ev.type === "squad" || (ev.max_team_size && ev.max_team_size > 1) || (ev.maxTeamSize && ev.maxTeamSize > 1))
                                      ? `👥 Squad (${ev.max_team_size || ev.maxTeamSize || 4}P)`
                                      : "👤 Solo"}
                                  </span>
                                  <span className="text-[10px] text-white/50 uppercase font-mono">
                                    {ev.category || "Mission"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <span className="font-mono text-xs font-bold text-metallic-gold shrink-0">
                              {formatRegistrationFee(ev)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Registration Format: Solo vs Squad & Team Details */}
            <div className="space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <RiTeamLine className="text-metallic-gold text-base shrink-0" />
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-white font-excon-black block sm:inline">
                      Registration Format
                    </span>
                    <span className="text-[10px] text-white/50 font-space sm:ml-2">
                      {hasSquadEvents && hasSoloEvents
                        ? `Combined Order: ${soloEvents.length} Solo + ${squadEvents.length} Squad`
                        : hasSquadEvents
                        ? "Squad Mission (You are Captain)"
                        : "Register solo or as Team Captain"}
                    </span>
                  </div>
                </div>

                {hasSquadEvents && hasSoloEvents ? (
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-metallic-gold/15 text-metallic-gold border border-metallic-gold/30 text-xs font-mono font-bold">
                    <span>⚡ SOLO + SQUAD ORDER</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/50 border border-white/10 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, registration_type: "individual" }))}
                      disabled={hasSquadEvents}
                      className={`px-4 py-1.5 rounded-lg font-bold uppercase transition-all cursor-pointer ${
                        form.registration_type === "individual" && !hasSquadEvents
                          ? "bg-white/20 text-white font-excon-bold"
                          : "text-white/50 hover:text-white"
                      } ${hasSquadEvents ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      Solo
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, registration_type: "team" }))}
                      className={`px-4 py-1.5 rounded-lg font-bold uppercase transition-all cursor-pointer ${
                        form.registration_type === "team" || hasSquadEvents
                          ? "bg-metallic-gold text-black shadow-md font-excon-bold"
                          : "text-white/50 hover:text-white"
                      }`}
                    >
                      Squad / Team
                    </button>
                  </div>
                )}
              </div>

              {/* Clean Team Name Input when Squad / Team is selected */}
              {(form.registration_type === "team" || hasSquadEvents) && (
                <div className="pt-2 border-t border-white/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-white/50 mb-1 font-excon-bold">
                      Team / Squad Name (Captain) *
                    </label>
                    {hasSquadEvents && hasSoloEvents && (
                      <span className="text-[10px] text-arc-cyan font-mono">
                        Applies to squad mission ({squadEvents.length})
                      </span>
                    )}
                  </div>
                  <input
                    name="team_name"
                    type="text"
                    value={form.team_name}
                    onChange={handleChange}
                    placeholder="e.g. Cyber Strikers, Avengers Alpha"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-metallic-gold text-white text-xs font-mono"
                  />
                </div>
              )}
            </div>

            {/* Delegate Details */}
            <div className="space-y-4">
              <CollegeSchoolPicker
                label="College / School / Institution *"
                placeholder="Search your college or school name in Kerala..."
                name="college_name"
                value={form.college_name}
                onChange={(college_name) => setForm((prev) => ({ ...prev, college_name }))}
                required
                disabled={submitting}
              />


              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-white/50 mb-1.5 font-excon-bold">
                  Phone / WhatsApp Contact *
                </label>
                <input
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  maxLength={10}
                  placeholder="9876543210"
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl focus:outline-none text-white text-xs font-mono transition-colors ${
                    phoneError
                      ? "border-rose-500 focus:border-rose-400"
                      : "border-white/10 focus:border-metallic-gold"
                  }`}
                />
                {phoneError && (
                  <p className="text-[11px] text-rose-400 mt-1 font-mono">{phoneError}</p>
                )}
                {!phoneError && form.phone && form.phone.length === 10 && (
                  <p className="text-[11px] text-emerald-400 mt-1 font-mono">✓ Valid 10-digit mobile number</p>
                )}
              </div>

              {/* Gender Selection */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-white/50 mb-1.5 font-excon-bold">
                  Gender *
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: "male", label: "Male", symbol: "♂" },
                    { id: "female", label: "Female", symbol: "♀" },
                    { id: "others", label: "Others", symbol: "⚧" },
                  ].map((opt) => {
                    const isSelected = (form.gender || "male") === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, gender: opt.id }))}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all font-excon-bold cursor-pointer ${
                          isSelected
                            ? "bg-metallic-gold text-black border-metallic-gold shadow-[0_0_15px_rgba(212,175,55,0.4)] ring-1 ring-metallic-gold"
                            : "bg-white/5 text-white/70 border-white/10 hover:border-white/30 hover:text-white"
                        }`}
                      >
                        <span className="text-sm font-black">{opt.symbol}</span>
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Add-ons Section */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 font-excon-black">
                <RiHotelBedLine className="text-metallic-gold" />
                <span>Hostel &amp; Accommodation Services</span>
              </h4>

              {/* Stay Without Food (Hostel / Accommodation) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                <label className="flex items-center justify-between cursor-pointer select-none">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="needs_accommodation"
                      checked={form.needs_accommodation}
                      onChange={handleChange}
                      className="w-4 h-4 accent-metallic-gold rounded cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 font-excon-bold">
                        <RiHotelBedLine className="text-arc-cyan text-base" />
                        Stay Without Food (1 Day)
                      </span>
                      <span className="text-[10px] text-white/50 block font-space">
                        Select accommodation to unlock optional food &amp; dining passes
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-arc-cyan shrink-0">
                    +{money(addons.accommodationPerPerson || 350)} / head
                  </span>
                </label>

                {/* Accommodation Details & Optional Food Selection */}
                <AnimatePresence>
                  {form.needs_accommodation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-3 border-t border-white/10 space-y-4"
                    >
                      {/* Number of Delegates */}
                      <label className="block space-y-1 text-xs text-white/70 font-space">
                        <span className="font-bold text-white text-[11px]">Number of Delegates (Stay):</span>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          name="accommodation_count"
                          value={form.accommodation_count}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-metallic-gold"
                        />
                      </label>

                      {/* Daily Meals Selection — Accessible only when accommodation is checked */}
                      <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-3">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <div>
                            <span className="text-[11px] uppercase font-bold text-metallic-gold flex items-center gap-1.5 font-excon-bold">
                              <RiRestaurantLine />
                              <span>Add Daily Meals (Per Person)</span>
                            </span>
                            <span className="text-[10px] text-white/40 font-space">
                              Optional catering for staying delegates
                            </span>
                          </div>
                          <div className="flex items-center gap-2.5 text-xs">
                            <label className="flex items-center gap-1 cursor-pointer text-white/80 select-none">
                              <input
                                type="radio"
                                name="food_diet_type"
                                value="veg"
                                checked={form.food_diet_type === "veg"}
                                onChange={handleChange}
                                className="accent-metallic-gold cursor-pointer"
                              />
                              <span className="text-[11px] font-bold text-emerald-400 font-mono">Veg</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer text-white/80 select-none">
                              <input
                                type="radio"
                                name="food_diet_type"
                                value="non_veg"
                                checked={form.food_diet_type === "non_veg"}
                                onChange={handleChange}
                                className="accent-metallic-gold cursor-pointer"
                              />
                              <span className="text-[11px] font-bold text-rose-400 font-mono">Non-Veg</span>
                            </label>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                          {/* Breakfast */}
                          <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                            form.food_breakfast
                              ? "bg-metallic-gold/20 border-metallic-gold/60 text-white"
                              : "bg-white/[0.02] border-white/10 text-white/70 hover:bg-white/5"
                          }`}>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                name="food_breakfast"
                                checked={form.food_breakfast}
                                onChange={handleChange}
                                className="w-3.5 h-3.5 accent-metallic-gold rounded"
                              />
                              <span className="text-xs font-bold uppercase font-excon-bold">Breakfast</span>
                            </div>
                            <span className="font-mono text-xs font-bold text-metallic-gold">
                              +{money(addons.breakfast || 50)}
                            </span>
                          </label>

                          {/* Lunch */}
                          <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                            form.food_lunch
                              ? "bg-metallic-gold/20 border-metallic-gold/60 text-white"
                              : "bg-white/[0.02] border-white/10 text-white/70 hover:bg-white/5"
                          }`}>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                name="food_lunch"
                                checked={form.food_lunch}
                                onChange={handleChange}
                                className="w-3.5 h-3.5 accent-metallic-gold rounded"
                              />
                              <span className="text-xs font-bold uppercase font-excon-bold">Lunch</span>
                            </div>
                            <span className="font-mono text-xs font-bold text-metallic-gold">
                              +{money(addons.lunch || 70)}
                            </span>
                          </label>

                          {/* Dinner */}
                          <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                            form.food_dinner
                              ? "bg-metallic-gold/20 border-metallic-gold/60 text-white"
                              : "bg-white/[0.02] border-white/10 text-white/70 hover:bg-white/5"
                          }`}>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                name="food_dinner"
                                checked={form.food_dinner}
                                onChange={handleChange}
                                className="w-3.5 h-3.5 accent-metallic-gold rounded"
                              />
                              <span className="text-xs font-bold uppercase font-excon-bold">Dinner</span>
                            </div>
                            <span className="font-mono text-xs font-bold text-metallic-gold">
                              +{money(addons.dinner || 50)}
                            </span>
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 font-mono">
                <RiInformationLine className="shrink-0 text-base" />
                <span>{error}</span>
              </div>
            )}
          </form>

          {/* ─── Right Column: Order Summary & Payment (Second on mobile, sticky on desktop) ─── */}
          <aside className="order-2 lg:order-2 lg:col-span-5 marvel-card p-4 sm:p-6 rounded-3xl border border-metallic-gold/40 bg-[#0A0D1A]/95 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl space-y-5 lg:sticky lg:top-24">
            <div className="border-b border-white/10 pb-3 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-metallic-gold tracking-widest font-mono">
                  SUMMARY
                </span>
                <h3 className="text-lg font-black text-white uppercase tracking-tight font-excon-black">
                  Order Breakdown
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-metallic-gold/15 text-metallic-gold border border-metallic-gold/30">
                {selected.length} {selected.length === 1 ? "Mission" : "Missions"}
              </span>
            </div>

            {/* Selected Events List */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 select-scrollbar">
              {selected.length === 0 ? (
                <p className="text-white/40 text-xs italic text-center py-4 font-space">
                  No missions selected yet.
                </p>
              ) : (
                selected.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs"
                  >
                    <div className="truncate pr-2">
                      <p className="font-black text-white uppercase tracking-tight truncate font-excon-black text-[11px]">
                        {ev.title}
                      </p>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${
                            Boolean(
                              ev.type === "squad" ||
                              (ev.max_team_size && ev.max_team_size > 1) ||
                              (ev.maxTeamSize && ev.maxTeamSize > 1)
                            )
                              ? "bg-arc-cyan/20 text-arc-cyan border border-arc-cyan/30"
                              : "bg-white/10 text-white/70 border border-white/20"
                          }`}
                        >
                          {Boolean(
                            ev.type === "squad" ||
                            (ev.max_team_size && ev.max_team_size > 1) ||
                            (ev.maxTeamSize && ev.maxTeamSize > 1)
                          )
                            ? "👥 Squad"
                            : "👤 Solo"}
                        </span>
                        <span className="text-[10px] text-white/50 uppercase font-mono">
                          {ev.category || "Mission"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-bold text-metallic-gold text-xs">
                        {formatRegistrationFee(ev)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEvent(ev.id)}
                        className="text-white/40 hover:text-red-400 p-0.5 rounded transition-colors"
                        title="Remove from batch"
                      >
                        <RiCloseLine className="text-sm" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Fee Breakdown Table */}
            <table className="w-full text-xs" aria-label="Fee Breakdown">
              <tbody className="divide-y divide-white/10">
                {hasSoloEvents && hasSquadEvents ? (
                  <>
                    <tr>
                      <th scope="row" className="py-2 text-white/70 font-normal text-left font-space">
                        Solo Missions ({soloEvents.length})
                      </th>
                      <td className="py-2 text-right font-mono font-bold text-white">
                        {money(feeBreakdown.soloTotal)}
                      </td>
                    </tr>
                    <tr>
                      <th scope="row" className="py-2 text-white/70 font-normal text-left font-space">
                        Squad Missions ({squadEvents.length})
                      </th>
                      <td className="py-2 text-right font-mono font-bold text-white">
                        {money(feeBreakdown.squadTotal)}
                      </td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <th scope="row" className="py-2 text-white/70 font-normal text-left font-space">
                      Missions Subtotal ({selected.length})
                    </th>
                    <td className="py-2 text-right font-mono font-bold text-white">
                      {money(feeBreakdown.eventTotal)}
                    </td>
                  </tr>
                )}
                {form.food_breakfast && (
                  <tr>
                    <th scope="row" className="py-2 text-white/70 font-normal text-left font-space">
                      Breakfast ({form.food_diet_type.toUpperCase()})
                    </th>
                    <td className="py-2 text-right font-mono text-white/90">
                      {money(feeBreakdown.breakfast)}
                    </td>
                  </tr>
                )}
                {form.food_lunch && (
                  <tr>
                    <th scope="row" className="py-2 text-white/70 font-normal text-left font-space">
                      Lunch ({form.food_diet_type.toUpperCase()})
                    </th>
                    <td className="py-2 text-right font-mono text-white/90">
                      {money(feeBreakdown.lunch)}
                    </td>
                  </tr>
                )}
                {form.food_dinner && (
                  <tr>
                    <th scope="row" className="py-2 text-white/70 font-normal text-left font-space">
                      Dinner ({form.food_diet_type.toUpperCase()})
                    </th>
                    <td className="py-2 text-right font-mono text-white/90">
                      {money(feeBreakdown.dinner)}
                    </td>
                  </tr>
                )}
                <tr>
                  <th scope="row" className="py-2 text-white/70 font-normal text-left font-space">
                    Stay {form.needs_accommodation ? `(${feeBreakdown.stayCount} ${feeBreakdown.stayCount === 1 ? "Person" : "Persons"})` : ""}
                  </th>
                  <td className="py-2 text-right font-mono text-white/90">
                    {feeBreakdown.accommodation ? money(feeBreakdown.accommodation) : "—"}
                  </td>
                </tr>
                <tr className="border-t-2 border-metallic-gold/40">
                  <th scope="row" className="py-3 text-sm font-black uppercase text-white font-excon-black text-left">
                    Total Amount
                  </th>
                  <td className="py-3 text-right">
                    <strong className="text-2xl font-black text-metallic-gold font-mono glow-text-gold">
                      {money(feeBreakdown.total)}
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Security Guarantee */}
            <div className="p-3 rounded-2xl bg-metallic-gold/10 border border-metallic-gold/20 text-xs text-white/80 space-y-1 font-space">
              <div className="flex items-center gap-2 text-metallic-gold font-bold font-excon-bold uppercase text-[11px]">
                <RiQrCodeLine />
                <span>Instant Digital Pass Unlock</span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                Your unified pass QR is generated instantly upon submitting payment verification.
              </p>
            </div>

            {/* Submit Button & Payment Trigger */}
            <div className="pt-2 space-y-3">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 font-mono">
                  <RiInformationLine className="shrink-0 text-base" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                form="checkout-form"
                className="w-full py-4 bg-metallic-gold hover:bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_25px_rgba(212,175,55,0.4)] font-excon-black cursor-pointer text-center"
                disabled={submitting || !selected.length}
              >
                {submitting
                  ? "Processing Registration…"
                  : `Confirm & Pay Online · ${money(feeBreakdown.total)}`}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

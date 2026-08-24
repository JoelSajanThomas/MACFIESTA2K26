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

function money(n) {
  return `₹${Number(n || 0).toLocaleString("en-IN")}`;
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

  const saved = loadParticipantProfile();
  const [form, setForm] = useState({
    college_name: saved?.college_name || "",
    phone: saved?.phone || "",
    food_preference: "none",
    food_notes: "",
    needs_accommodation: false,
    accommodation_count: "1",
    accommodation_notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
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

  // Available categories
  const categories = useMemo(() => {
    const set = new Set(events.map((e) => e.category || "General").filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [events]);

  // Filtered event list for the inline picker
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchCat =
        categoryFilter === "all" ||
        (ev.category || "General").toLowerCase() === categoryFilter.toLowerCase();
      const matchQuery =
        !searchQuery ||
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ev.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ev.department || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [events, categoryFilter, searchQuery]);

  const feeBreakdown = useMemo(() => {
    const eventTotal = selected.reduce((s, e) => s + (Number(e.registration_fee) || 0), 0);
    const food = form.food_preference !== "none" ? addons.foodPackage : 0;
    const stayCount = Math.max(1, Number(form.accommodation_count) || 1);
    const accommodation = form.needs_accommodation
      ? addons.accommodationPerPerson * stayCount
      : 0;
    return {
      eventTotal,
      food,
      accommodation,
      total: eventTotal + food + accommodation,
    };
  }, [selected, form, addons]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selected.length) {
      setError("Please select at least one mission / event to register.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await createRegistrationBatch({
        events: selected.map((ev) => ev.id),
        college_name: form.college_name,
        phone: form.phone,
        food_preference: form.food_preference,
        food_notes: form.food_notes,
        needs_accommodation: form.needs_accommodation,
        accommodation_count: form.needs_accommodation
          ? Number(form.accommodation_count) || 1
          : null,
        accommodation_notes: form.accommodation_notes,
        needs_transport: false,
        transport_note: "",
      });
      clearCart();
      setCartIds([]);
      setResult(res.data);
    } catch (err) {
      const data = err?.response?.data;
      const msg =
        data?.events?.[0] ||
        data?.phone?.[0] ||
        data?.college_name?.[0] ||
        data?.detail ||
        "Registration checkout failed. Please review your details.";
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
    <div className="bg-[#05050A] min-h-screen pt-28 pb-20 relative overflow-hidden font-excon">
      {/* Marvel Atmosphere Background */}
      <BackgroundVideo
        src="/MARVEL/Video Project 6.mp4"
        fallbackSrc="/MARVEL/Video Project 4.mp4"
        opacity="opacity-45"
      />
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[350px] rounded-full bg-metallic-gold/5 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[600px] h-[350px] rounded-full bg-arc-cyan/5 blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        {/* ─── Hero Section Header ─── */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)] font-space">
            <RiShieldFlashLine className="animate-pulse text-metallic-gold" />
            <span>S.H.I.E.L.D. COMMAND PROTOCOL · SECURE CHECKOUT</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white font-excon-black">
            <span className="shimmer-text">EVENT REGISTRATION</span>{" "}
            <br className="hidden sm:inline" />
            <span className="gradient-text-gold">&amp; PAYMENT</span>
          </h1>

          {/* Animated expanding divider */}
          <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-metallic-gold to-transparent origin-center" />

          <p className="text-white/70 text-xs sm:text-sm font-space max-w-xl mx-auto leading-relaxed">
            Confirm your registered missions, configure hostel &amp; meal options, and pay securely via online UPI to claim your entry pass.
          </p>
        </div>

        {/* ─── Main 2-Column Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ─── Left Column (7 cols): Registration Form ─── */}
          <form
            className="lg:col-span-7 marvel-card p-6 sm:p-8 rounded-3xl border border-white/15 bg-[#0A0D1A]/95 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl space-y-6"
            onSubmit={handleSubmit}
          >
            {/* Delegate Status Banner */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-metallic-gold/20 border border-metallic-gold/40 text-metallic-gold flex items-center justify-center font-bold">
                  <RiShieldCheckLine size={16} />
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-white/50">Authenticated Delegate</span>
                  <span className="block text-white font-black font-excon-bold">
                    {account?.full_name || account?.email || account?.username}
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase font-mono">
                Verified
              </span>
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
                                <span className="text-[10px] text-white/50 uppercase font-mono">
                                  {ev.category || "Mission"}
                                </span>
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

            {/* Delegate Details */}
            <div className="space-y-4">
              <CollegeSchoolPicker
                label="College / Institution *"
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
                  value={form.phone}
                  onChange={handleChange}
                  required
                  maxLength={20}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-metallic-gold focus:outline-none text-white text-xs font-mono"
                />
              </div>
            </div>

            {/* Add-ons Section */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 font-excon-black">
                <RiRestaurantLine className="text-metallic-gold" />
                <span>Hospitality &amp; Meal Options</span>
              </h4>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-white/50 mb-1.5 font-excon-bold">
                  Festival Food Package
                </label>
                <select
                  name="food_preference"
                  value={form.food_preference}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#0d1020] border border-white/15 rounded-xl focus:border-metallic-gold focus:outline-none text-white text-xs font-excon cursor-pointer"
                >
                  <option value="none" className="bg-[#0d1020] text-white py-2">No Food Package (₹0)</option>
                  <option value="veg" className="bg-[#0d1020] text-white py-2">Vegetarian (+{money(addons.foodPackage)})</option>
                  <option value="non_veg" className="bg-[#0d1020] text-white py-2">Non-Vegetarian (+{money(addons.foodPackage)})</option>
                </select>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="needs_accommodation"
                    checked={form.needs_accommodation}
                    onChange={handleChange}
                    className="w-4 h-4 accent-metallic-gold rounded"
                  />
                  <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 font-excon-bold">
                    <RiHotelBedLine className="text-arc-cyan" />
                    Hostel &amp; Accommodation (+{money(addons.accommodationPerPerson)} / person)
                  </span>
                </label>

                {form.needs_accommodation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="pt-2"
                  >
                    <label className="block space-y-1 text-xs text-white/70 font-space">
                      <span>Number of Delegates:</span>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        name="accommodation_count"
                        value={form.accommodation_count}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-sm text-white font-mono"
                      />
                    </label>
                  </motion.div>
                )}
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 font-mono">
                <RiInformationLine className="shrink-0 text-base" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-metallic-gold hover:bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_25px_rgba(212,175,55,0.4)] font-excon-black cursor-pointer"
              disabled={submitting || !selected.length}
            >
              {submitting
                ? "Processing Registration…"
                : `Confirm & Pay Online · ${money(feeBreakdown.total)}`}
            </button>
          </form>

          {/* ─── Right Column (5 cols): Order Summary Card ─── */}
          <aside className="lg:col-span-5 marvel-card p-6 sm:p-8 rounded-3xl border border-metallic-gold/40 bg-[#0A0D1A]/95 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl space-y-6 sticky top-24">
            <div className="border-b border-white/10 pb-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-metallic-gold tracking-widest font-mono">
                  SUMMARY
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-tight font-excon-black">
                  Order Breakdown
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-metallic-gold/15 text-metallic-gold border border-metallic-gold/30">
                {selected.length} {selected.length === 1 ? "Mission" : "Missions"}
              </span>
            </div>

            {/* Selected Events List */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {selected.length === 0 ? (
                <p className="text-white/40 text-xs italic text-center py-6 font-space">
                  No missions selected yet.
                </p>
              ) : (
                selected.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-xs"
                  >
                    <div className="truncate pr-2">
                      <p className="font-black text-white uppercase tracking-tight truncate font-excon-black">
                        {ev.title}
                      </p>
                      <p className="text-[10px] text-white/50 uppercase font-mono">
                        {ev.category || "Mission"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="font-mono font-bold text-metallic-gold">
                        {formatRegistrationFee(ev)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEvent(ev.id)}
                        className="text-white/40 hover:text-red-400 p-1 rounded transition-colors"
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
                <tr>
                  <th scope="row" className="py-2.5 text-white/70 font-normal text-left font-space">
                    Missions Subtotal ({selected.length})
                  </th>
                  <td className="py-2.5 text-right font-mono font-bold text-white">
                    {money(feeBreakdown.eventTotal)}
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="py-2.5 text-white/70 font-normal text-left font-space">
                    Meal Package
                  </th>
                  <td className="py-2.5 text-right font-mono text-white/90">
                    {feeBreakdown.food ? money(feeBreakdown.food) : "—"}
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="py-2.5 text-white/70 font-normal text-left font-space">
                    Hostel &amp; Accommodation
                  </th>
                  <td className="py-2.5 text-right font-mono text-white/90">
                    {feeBreakdown.accommodation ? money(feeBreakdown.accommodation) : "—"}
                  </td>
                </tr>
                <tr className="border-t-2 border-metallic-gold/40">
                  <th
                    scope="row"
                    className="py-3.5 text-sm font-black uppercase text-white font-excon-black text-left"
                  >
                    Total Amount
                  </th>
                  <td className="py-3.5 text-right">
                    <strong className="text-2xl font-black text-metallic-gold font-mono glow-text-gold">
                      {money(feeBreakdown.total)}
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Security Guarantee */}
            <div className="p-4 rounded-2xl bg-metallic-gold/10 border border-metallic-gold/20 text-xs text-white/80 space-y-1.5 font-space">
              <div className="flex items-center gap-2 text-metallic-gold font-bold font-excon-bold uppercase text-[11px]">
                <RiQrCodeLine />
                <span>Instant Digital Pass Unlock</span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                Your unified pass with entry QR code is generated instantly upon submitting online transaction verification.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiShieldFlashLine,
  RiUserStarLine,
  RiTeamLine,
  RiCheckLine,
  RiCloseLine,
  RiAlertLine,
  RiLockLine,
  RiCheckboxCircleLine,
  RiArrowRightLine,
  RiArrowLeftLine,
  RiDeleteBinLine,
  RiSearchLine,
  RiHotelBedLine,
  RiUploadCloud2Line,
  RiSparklingLine,
  RiMapPinLine,
  RiUserLine,
  RiGraduationCapLine,
  RiBuilding4Line,
  RiRestaurantLine,
  RiAddLine,
  RiTicketLine,
  RiExternalLinkLine,
} from "react-icons/ri";
import LoadingState from "../components/ui/LoadingState";
import CollegeSchoolPicker from "../components/CollegeSchoolPicker";
import { BackgroundVideo } from "../components/ui/BackgroundVideo";
import { usePageSeo } from "../hooks/usePageSeo";
import { loadParticipantProfile, saveParticipantProfile } from "../utils/participantProfile";
import { ALL_EVENTS } from "../lib/eventsData";
import { MACFIESTA_PAYMENT, buildUpiPayLink } from "../utils/registrationFees";
import {
  getEvents,
  getCurrentUser,
  isLoggedIn,
  createRegistrationBatch,
  submitRegistrationPaymentBatch,
  getHostels,
  createAccommodationBooking,
} from "../services/api";

const SOLO_EVENT_SLUGS = new Set([
  "coding-challenge",
  "efootball",
  "photography",
  "reels-competition",
  "school-ai-image-creation",
  "school-photography",
  "school-spot-dance",
  "school-debate-extempore",
]);

function isSchoolEvent(event) {
  if (!event) return false;
  if (event.audience === "school" || event.scope === "school") return true;
  if (event.audience === "college" || event.scope === "college") return false;
  const slug = String(event.slug || "").toLowerCase();
  const title = String(event.title || "").toLowerCase();
  const dept = String(event.department || "").toLowerCase();
  const cat = String(event.category || "").toLowerCase();
  return (
    slug.startsWith("school-") ||
    slug.includes("school") ||
    title.includes("school") ||
    dept.includes("school") ||
    cat === "school"
  );
}

function isSoloEvent(event) {
  if (!event) return false;
  if (event.slug && SOLO_EVENT_SLUGS.has(event.slug)) return true;
  const maxS = event.max_team_size != null 
    ? Number(event.max_team_size) 
    : (event.maxTeamSize != null ? Number(event.maxTeamSize) : null);
  if (maxS != null && maxS <= 1) return true;
  if (event.type === "solo" || event.type === "individual") {
    if (maxS == null || maxS <= 1) return true;
  }
  return false;
}

function normalizeEvent(e) {
  if (!e) return null;
  const isSchool = isSchoolEvent(e);
  const isSolo = isSoloEvent(e);
  const minSize = e.min_team_size != null ? Number(e.min_team_size) : (e.minTeamSize != null ? Number(e.minTeamSize) : 1);
  const maxSize = e.max_team_size != null ? Number(e.max_team_size) : (e.maxTeamSize != null ? Number(e.maxTeamSize) : (isSolo ? 1 : Math.max(minSize, 1)));
  const fee = e.registration_fee != null ? Number(e.registration_fee) : Number(e.registrationFee || 0);

  return {
    ...e,
    id: e.id || e._id || e.slug,
    _id: e._id || e.id || e.slug,
    slug: e.slug || "",
    title: e.title || "",
    scope: isSchool ? "school" : "college",
    audience: isSchool ? "school" : "college",
    type: isSolo ? "solo" : "squad",
    min_team_size: minSize,
    max_team_size: maxSize,
    registration_fee: fee,
    registrationFee: fee,
  };
}

function validatePhone(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return "Mobile number is required.";
  if (digits.length === 12 && digits.startsWith("91")) {
    const num = digits.slice(2);
    if (!/^[6-9]/.test(num)) return "Mobile number must start with 6, 7, 8, or 9.";
    return null;
  }
  if (digits.length > 10) return "Mobile number cannot exceed 10 digits.";
  if (digits.length < 10) return `Mobile number must be exactly 10 digits (${digits.length}/10).`;
  if (!/^[6-9]/.test(digits)) return "Mobile number must start with 6, 7, 8, or 9.";
  return null;
}

const ACC_STEPS = [
  { num: 1, label: "HOSTEL & DATES" },
  { num: 2, label: "DELEGATE INFO" },
  { num: 3, label: "PAYMENT" },
  { num: 4, label: "CONFIRMED" },
];

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isAccQuery = searchParams.get("accommodation") === "true" || !!searchParams.get("hostel");
  const [checkoutMode, setCheckoutMode] = useState(isAccQuery ? "accommodation" : "event");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState(() => (ALL_EVENTS || []).map(normalizeEvent));
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [squadsData, setSquadsData] = useState({});
  const [batchResult, setBatchResult] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [account, setAccount] = useState(null);

  // Accommodation State
  const [hostels, setHostels] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [accStep, setAccStep] = useState(1);
  const [accGenderFilter, setAccGenderFilter] = useState("all");
  const savedProfile = loadParticipantProfile();
  const [accForm, setAccForm] = useState({
    hostel_id: "",
    full_name: savedProfile?.name || "",
    email: "",
    phone: savedProfile?.phone || "",
    college: savedProfile?.college_name || "",
    gender: savedProfile?.gender || "male",
    persons_count: 1,
    check_in_date: "2026-09-24",
    check_out_date: "2026-09-26",
    include_breakfast: false,
    include_lunch: false,
    include_dinner: false,
    special_requests: "",
    txn: "",
    proof: null,
  });
  const [accProofPreview, setAccProofPreview] = useState(null);
  const [accBookingResult, setAccBookingResult] = useState(null);
  const [accSubmitting, setAccSubmitting] = useState(false);

  // Search and Division filter in Step 1
  const [searchQuery, setSearchQuery] = useState("");
  const [audienceFilter, setAudienceFilter] = useState("all"); // 'all' | 'college' | 'school' | 'solo' | 'squad'

  // Step 2: Team Creation Form / Solo Participant Form
  const [teamForm, setTeamForm] = useState({
    team_name: "",
    participant_name: savedProfile?.name || "",
    college_name: savedProfile?.college_name || "",
    phone: savedProfile?.phone || "",
    gender: savedProfile?.gender || "male",
  });

  // Active Team Registration object returned by backend (legacy single or primary)
  const [registration, setRegistration] = useState(null);

  // Step 5: Payment Form
  const [paymentForm, setPaymentForm] = useState({
    txn: "",
    proof: null,
  });

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  usePageSeo({
    title: checkoutMode === "accommodation"
      ? "Hostel Accommodation Booking · MacFiesta 2026"
      : "Event Registration & Squad Management · MacFiesta 2026",
    description: "Official S.H.I.E.L.D. tournament registration and festival accommodation booking console.",
  });

  // Initial Load with resilient fallbacks
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`, { replace: true });
      return;
    }

    const pEvents = getEvents()
      .then((res) => {
        const raw = Array.isArray(res?.data)
          ? res.data
          : res?.data?.results || res?.data?.events || [];
        if (raw.length > 0) return raw.map(normalizeEvent);
        return (ALL_EVENTS || []).map(normalizeEvent);
      })
      .catch(() => (ALL_EVENTS || []).map(normalizeEvent));

    const pUser = getCurrentUser()
      .then((res) => res?.data || null)
      .catch(() => null);

    const pHostels = getHostels()
      .then((res) => (Array.isArray(res?.data) ? res.data : []))
      .catch(() => []);

    Promise.all([pEvents, pUser, pHostels])
      .then(([evList, user, hList]) => {
        const finalEvents = Array.isArray(evList) && evList.length > 0 ? evList : (ALL_EVENTS || []).map(normalizeEvent);
        setEvents(finalEvents);
        setAccount(user);
        setHostels(hList);

        const uName = user?.full_name || user?.username || "";

        // Prefill teamForm with user account details
        setTeamForm((prev) => ({
          ...prev,
          participant_name: prev.participant_name || uName,
          college_name: user?.college_name || prev.college_name,
          phone: user?.phone || prev.phone,
          gender: user?.gender || prev.gender,
        }));

        // Prefill accForm with user account details
        setAccForm((prev) => ({
          ...prev,
          full_name: prev.full_name || uName,
          email: prev.email || user?.email || "",
          phone: prev.phone || user?.phone || "",
          college: prev.college || user?.college_name || "",
          gender: user?.gender === "female" ? "female" : "male",
        }));

        // Pre-select matching hostel
        const hostelParam = searchParams.get("hostel");
        if (hList.length > 0) {
          let matched = null;
          if (hostelParam) {
            matched = hList.find(
              (h) => h.name.toLowerCase() === hostelParam.toLowerCase() || String(h.id) === hostelParam
            );
          }
          if (!matched) {
            matched = hList[0];
          }
          setSelectedHostel(matched);
          setAccForm((prev) => ({ ...prev, hostel_id: matched.id }));
        }

        // Check if event was passed via URL query
        const eventParam = searchParams.get("event");
        if (eventParam && finalEvents.length > 0) {
          const match = finalEvents.find(
            (e) => String(e.id) === eventParam || String(e._id) === eventParam || e.slug === eventParam
          );
          if (match) {
            setSelectedEvents([match]);
            const isMatchSolo = isSoloEvent(match);
            if (!isMatchSolo) {
              setSquadsData({
                [match.id]: {
                  team_name: "",
                  members: [],
                  newMember: {
                    name: "",
                    email: "",
                    phone: "",
                    college_name: user?.college_name || "",
                    department: "",
                    register_number: "",
                    gender: "male",
                  },
                },
              });
            }
            setTeamForm((prev) => ({
              ...prev,
              participant_name: prev.participant_name || uName,
              team_name: isMatchSolo ? (prev.participant_name || uName || "Solo Participant") : prev.team_name,
            }));
            setStep(2);
            setCheckoutMode("event");
          }
        }
      })
      .catch(() => {
        // Safe fallback - events already initialized to normalized ALL_EVENTS
      })
      .finally(() => setLoading(false));
  }, [location.pathname, location.search, navigate, searchParams]);

  // Multi-event derived limits & categories
  const soloSelected = useMemo(() => selectedEvents.filter((e) => isSoloEvent(e)), [selectedEvents]);
  const squadSelected = useMemo(() => selectedEvents.filter((e) => !isSoloEvent(e)), [selectedEvents]);
  const hasSquadEvents = squadSelected.length > 0;
  const hasSoloEvents = soloSelected.length > 0;
  const isOnlySolo = selectedEvents.length > 0 && !hasSquadEvents;


  // Total fees across all selected events
  const totalFee = useMemo(() => {
    return selectedEvents.reduce((sum, ev) => sum + (Number(ev.registration_fee) || 0), 0);
  }, [selectedEvents]);

  // Audience Division Counts
  const collegeCount = useMemo(() => events.filter((e) => !isSchoolEvent(e)).length, [events]);
  const schoolCount = useMemo(() => events.filter((e) => isSchoolEvent(e)).length, [events]);
  const soloCount = useMemo(() => events.filter((e) => isSoloEvent(e)).length, [events]);
  const squadCount = useMemo(() => events.filter((e) => !isSoloEvent(e)).length, [events]);

  // Stepper Bar dynamic steps:
  // If only solo events: MISSIONS -> PARTICIPANT -> REVIEW -> PAYMENT -> PASSES (Squad step is skipped!)
  // If squad events exist: MISSIONS -> PARTICIPANT -> SQUADS -> REVIEW -> PAYMENT -> PASSES
  const eventSteps = useMemo(() => {
    if (isOnlySolo) {
      return [
        { num: 1, label: "MISSIONS" },
        { num: 2, label: "PARTICIPANT" },
        { num: 4, label: "REVIEW" },
        { num: 5, label: "PAYMENT" },
        { num: 6, label: "PASSES" },
      ];
    }
    return [
      { num: 1, label: "MISSIONS" },
      { num: 2, label: "PARTICIPANT" },
      { num: 3, label: "SQUADS" },
      { num: 4, label: "REVIEW" },
      { num: 5, label: "PAYMENT" },
      { num: 6, label: "PASSES" },
    ];
  }, [isOnlySolo]);

  // Filtered Events for Step 1 (Search + College vs School + Solo vs Squad filter)
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const isSchool = isSchoolEvent(e);
      const isEventSolo = isSoloEvent(e);
      if (audienceFilter === "college" && isSchool) return false;
      if (audienceFilter === "school" && !isSchool) return false;
      if (audienceFilter === "solo" && !isEventSolo) return false;
      if (audienceFilter === "squad" && isEventSolo) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          e.title?.toLowerCase().includes(q) ||
          e.category?.toLowerCase().includes(q) ||
          e.department?.toLowerCase().includes(q) ||
          e.slug?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [events, audienceFilter, searchQuery]);

  function handleToggleEvent(ev) {
    setSelectedEvents((prev) => {
      const exists = prev.some((e) => String(e.id) === String(ev.id));
      let next;
      if (exists) {
        next = prev.filter((e) => String(e.id) !== String(ev.id));
      } else {
        next = [...prev, ev];
      }

      if (!exists && !isSoloEvent(ev)) {
        setSquadsData((sPrev) => {
          if (sPrev[ev.id]) return sPrev;
          return {
            ...sPrev,
            [ev.id]: {
              team_name: "",
              members: [],
              newMember: {
                name: "",
                email: "",
                phone: "",
                college_name: teamForm.college_name || "",
                department: "",
                register_number: "",
                gender: "male",
              },
            },
          };
        });
      }
      return next;
    });
  }

  // Accommodation Calculations
  const accNights = useMemo(() => {
    if (!accForm.check_in_date || !accForm.check_out_date) return 2;
    const d1 = new Date(accForm.check_in_date);
    const d2 = new Date(accForm.check_out_date);
    const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [accForm.check_in_date, accForm.check_out_date]);

  const accTariff = Number(selectedHostel?.tariff_per_night || 350);
  const accHeadcount = Math.max(1, Number(accForm.persons_count || 1));
  const accMealDailyPerHead =
    (accForm.include_breakfast ? 50 : 0) +
    (accForm.include_lunch ? 70 : 0) +
    (accForm.include_dinner ? 50 : 0);
  const accDailyRatePerHead = accTariff + accMealDailyPerHead;
  const accTotalStayAmount = accTariff * accHeadcount * accNights;
  const accTotalMealAmount = accMealDailyPerHead * accHeadcount * accNights;
  const accTotalAmount = accDailyRatePerHead * accHeadcount * accNights;

  const mealPlanSummary = useMemo(() => {
    const selected = [];
    if (accForm.include_breakfast) selected.push("Breakfast (₹50)");
    if (accForm.include_lunch) selected.push("Lunch (₹70)");
    if (accForm.include_dinner) selected.push("Dinner (₹50)");
    if (selected.length === 3) return "All Meals (₹170/day/head)";
    if (selected.length === 0) return "Stay Only (Without Food)";
    return selected.join(", ") + ` (+₹${accMealDailyPerHead}/day/head)`;
  }, [accForm.include_breakfast, accForm.include_lunch, accForm.include_dinner, accMealDailyPerHead]);

  const filteredHostels = useMemo(() => {
    if (accGenderFilter === "all") return hostels;
    return hostels.filter((h) => h.gender === accGenderFilter || h.gender === "all");
  }, [hostels, accGenderFilter]);

  async function handleAccSubmit(e, isQuickConfirm = false) {
    if (e) e.preventDefault();
    if (!selectedHostel) {
      setError("Please select a hostel.");
      return;
    }
    if (!accForm.full_name.trim()) {
      setError("Delegate full name is required.");
      return;
    }
    const phoneErr = validatePhone(accForm.phone);
    if (phoneErr) {
      setError(phoneErr);
      return;
    }
    if (!isQuickConfirm && !accForm.txn.trim() && !accForm.proof) {
      setError("Please enter your UPI Transaction Reference / UTR or upload payment proof.");
      return;
    }

    setAccSubmitting(true);
    setError("");

    try {
      const fd = new FormData();
      fd.append("hostel", selectedHostel.id);
      fd.append("full_name", accForm.full_name.trim());
      fd.append("email", accForm.email.trim());
      fd.append("phone", accForm.phone.trim());
      fd.append("college", accForm.college.trim() || "MACFAST Campus");
      fd.append("gender", accForm.gender);
      fd.append("persons_count", accForm.persons_count);
      fd.append("check_in_date", accForm.check_in_date);
      fd.append("check_out_date", accForm.check_out_date);
      fd.append("include_breakfast", accForm.include_breakfast ? "true" : "false");
      fd.append("include_lunch", accForm.include_lunch ? "true" : "false");
      fd.append("include_dinner", accForm.include_dinner ? "true" : "false");
      fd.append("special_requests", accForm.special_requests.trim());
      fd.append("payment_amount", String(accTotalAmount.toFixed(2)));
      fd.append("payment_status", isQuickConfirm ? "confirmed" : "pending");
      fd.append("payment_method", "upi_qr");
      fd.append(
        "payment_transaction_id",
        accForm.txn.trim() || (isQuickConfirm ? `HST-AUTO-${Date.now().toString().slice(-6)}` : "")
      );
      if (accForm.proof) {
        fd.append("payment_proof", accForm.proof);
      }

      const res = await createAccommodationBooking(fd);
      setAccBookingResult(res.data);
      setAccStep(4);
      setSuccessMsg(`Accommodation booking ${res.data.booking_id} reserved successfully!`);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      const d = err?.response?.data;
      const msg =
        typeof d === "string"
          ? d
          : d?.detail ||
            d?.hostel ||
            d?.phone ||
            d?.check_out_date ||
            "Failed to submit hostel booking. Please try again.";
      setError(String(msg));
    } finally {
      setAccSubmitting(false);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // TOURNAMENT MULTI-EVENT REGISTRATION HANDLERS
  // ─────────────────────────────────────────────────────────────

  // Step 1: Proceed to participant details
  function handleProceedFromStep1() {
    if (selectedEvents.length === 0) {
      setError("Please select at least one mission to continue.");
      return;
    }
    setError("");
    setStep(2);
  }

  // Step 2: Save Participant & Decide Routing (Bypass Step 3 for pure solo)
  function handleSaveParticipant(e) {
    if (e) e.preventDefault();
    if (selectedEvents.length === 0) {
      setError("Please select at least one tournament mission first.");
      setStep(1);
      return;
    }

    const pName = (teamForm.participant_name || account?.full_name || account?.username || "").trim();
    if (!pName) {
      setError("Participant Legal Full Name is required.");
      return;
    }
    if (!teamForm.college_name.trim()) {
      setError("College / School / Institution name is required.");
      return;
    }
    const phoneErr = validatePhone(teamForm.phone);
    if (phoneErr) {
      setError(phoneErr);
      return;
    }

    saveParticipantProfile({
      name: pName,
      college_name: teamForm.college_name.trim(),
      phone: teamForm.phone.trim(),
      gender: teamForm.gender,
    });

    setError("");

    // SOLO EVENT FLOW: If only solo events selected, completely bypass Step 3 (Squads)!
    if (isOnlySolo) {
      setSuccessMsg("Solo participant details verified! Proceeding directly to Review.");
      setTimeout(() => setSuccessMsg(""), 3000);
      setStep(4);
    } else {
      setSuccessMsg("Participant & Captain details saved! Proceeding to Squad Configuration.");
      setTimeout(() => setSuccessMsg(""), 3000);
      setStep(3);
    }
  }

  // Step 3 Helpers: Squad Team Name & Teammates Management
  function handleSquadNameChange(eventId, name) {
    setSquadsData((prev) => ({
      ...prev,
      [eventId]: {
        ...(prev[eventId] || { members: [] }),
        team_name: name,
      },
    }));
  }

  function handleSquadMemberFieldChange(eventId, field, value) {
    setSquadsData((prev) => {
      const sq = prev[eventId] || { team_name: "", members: [], newMember: {} };
      return {
        ...prev,
        [eventId]: {
          ...sq,
          newMember: {
            ...(sq.newMember || {}),
            [field]: value,
          },
        },
      };
    });
  }

  function handleAddSquadMember(eventId) {
    const ev = events.find((e) => String(e.id) === String(eventId));
    const sq = squadsData[eventId] || { team_name: "", members: [] };
    const m = sq.newMember || {};
    if (!m.name?.trim()) {
      setError("Teammate name is required.");
      return;
    }
    if (!m.email?.trim()) {
      setError("Teammate email is required.");
      return;
    }
    const phoneErr = validatePhone(m.phone);
    if (phoneErr) {
      setError(phoneErr);
      return;
    }

    const maxS = ev?.max_team_size || 4;
    const currentCount = 1 + (sq.members?.length || 0);
    if (currentCount >= maxS) {
      setError(`Squad has reached maximum capacity of ${maxS} members (including Captain).`);
      return;
    }

    setSquadsData((prev) => {
      const currentSq = prev[eventId] || { team_name: "", members: [] };
      return {
        ...prev,
        [eventId]: {
          ...currentSq,
          members: [
            ...(currentSq.members || []),
            {
              name: m.name.trim(),
              email: m.email.trim(),
              phone: m.phone.trim(),
              college_name: (m.college_name || teamForm.college_name || "").trim(),
              department: (m.department || "").trim(),
              register_number: (m.register_number || "").trim(),
              gender: m.gender || "male",
            },
          ],
          newMember: {
            name: "",
            email: "",
            phone: "",
            college_name: teamForm.college_name || "",
            department: "",
            register_number: "",
            gender: "male",
          },
        },
      };
    });
    setError("");
    setSuccessMsg(`${m.name.trim()} added to ${ev?.title || "squad"}!`);
    setTimeout(() => setSuccessMsg(""), 2500);
  }

  function handleRemoveSquadMember(eventId, memberIndex) {
    setSquadsData((prev) => {
      const sq = prev[eventId] || { team_name: "", members: [] };
      const updated = sq.members.filter((_, idx) => idx !== memberIndex);
      return {
        ...prev,
        [eventId]: {
          ...sq,
          members: updated,
        },
      };
    });
  }

  // Step 3: Validate all squad requirements before review
  function handleProceedToReview() {
    for (const ev of squadSelected) {
      const sq = squadsData[ev.id] || { team_name: "", members: [] };
      const minS = ev.min_team_size || 1;
      const maxS = ev.max_team_size || 99;
      const total = 1 + (sq.members?.length || 0);

      if (minS > 1 && !sq.team_name?.trim()) {
        setError(`Please provide a Team / Squad Name for mission "${ev.title}".`);
        return;
      }
      if (total < minS) {
        setError(
          `Squad mission "${ev.title}" requires at least ${minS} members (including Captain). Current: ${total}. Please add ${minS - total} more teammate(s).`
        );
        return;
      }
      if (total > maxS) {
        setError(`Squad mission "${ev.title}" cannot exceed ${maxS} members (including Captain). Current: ${total}.`);
        return;
      }
    }
    setError("");
    setStep(4);
  }

  // Step 4: Create Batch Registration on Backend
  async function handleCreateBatchRegistration() {
    if (selectedEvents.length === 0) {
      setError("No tournament missions selected.");
      setStep(1);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const eventIds = selectedEvents.map((e) => e.id);
      const payload = {
        events: eventIds,
        participant_name: teamForm.participant_name.trim(),
        college_name: teamForm.college_name.trim(),
        phone: teamForm.phone.trim(),
        email: account?.email || "",
        department: "",
        register_number: "",
        gender: teamForm.gender,
        needs_accommodation: false,
        squads_by_event: {},
      };

      for (const ev of squadSelected) {
        const sq = squadsData[ev.id] || { team_name: "", members: [] };
        payload.squads_by_event[String(ev.id)] = {
          team_name: sq.team_name?.trim() || `${teamForm.participant_name}'s Team`,
          members: (sq.members || []).map((m) => ({
            name: m.name,
            email: m.email,
            phone: m.phone,
            college_name: m.college_name || teamForm.college_name,
            department: m.department || "",
            register_number: m.register_number || "",
            gender: m.gender || "male",
          })),
        };
      }

      const res = await createRegistrationBatch(payload);
      setBatchResult(res.data);
      const createdRegs = res.data.registrations || [];
      setRegistrations(createdRegs);
      if (createdRegs.length > 0) {
        setRegistration(createdRegs[0]);
      }

      setSuccessMsg("Tournament reservations confirmed! Proceeding to Payment.");
      setTimeout(() => setSuccessMsg(""), 3000);
      setStep(5);
    } catch (err) {
      const d = err?.response?.data;
      const msg =
        d?.detail ||
        d?.team_name ||
        d?.team_members ||
        d?.events ||
        d?.participant_name ||
        (typeof d === "string" ? d : "Failed to create tournament registration.");
      setError(String(msg));
    } finally {
      setSubmitting(false);
    }
  }

  // Step 5: Submit Batch Payment Proof
  async function handleSubmitBatchPayment(e) {
    if (e) e.preventDefault();
    const batchId = batchResult?.payment_batch_id || registration?.payment_batch_id;
    if (!batchId) {
      setError("No active payment batch ID found. Please review and try again.");
      return;
    }
    if (!paymentForm.txn.trim()) {
      setError("UPI Transaction Reference / UTR ID is required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await submitRegistrationPaymentBatch({
        payment_batch_id: batchId,
        payment_transaction_id: paymentForm.txn.trim(),
        payment_proof: paymentForm.proof,
        payment_method: "upi_qr",
      });
      const updated = res.data.registrations || registrations;
      setRegistrations(updated);
      if (updated.length > 0) setRegistration(updated[0]);
      setSuccessMsg("Payment proof submitted! Verifying credentials...");
      setStep(6);
    } catch (err) {
      const d = err?.response?.data;
      const msg = d?.detail || d?.payment_transaction_id || d?.payment_proof || "Failed to submit payment.";
      setError(String(msg));
    } finally {
      setSubmitting(false);
    }
  }

  // Step 5: Instant Direct Confirmation Simulator / Free Pass Activation
  async function handleBatchDirectConfirm() {
    const batchId = batchResult?.payment_batch_id || registration?.payment_batch_id;
    if (!batchId) {
      setError("No active payment batch ID found.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await submitRegistrationPaymentBatch({
        payment_batch_id: batchId,
        payment_transaction_id: paymentForm.txn.trim() || `UPI-BATCH-${Date.now().toString().slice(-6)}`,
        auto_confirm: true,
        status: "paid",
      });
      const updated = res.data.registrations || registrations;
      setRegistrations(updated);
      if (updated.length > 0) setRegistration(updated[0]);
      setSuccessMsg("Registrations verified and confirmed!");
      setStep(6);
    } catch (err) {
      const d = err?.response?.data;
      const msg = d?.detail || "Failed to confirm payment.";
      setError(String(msg));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-[#05050A] min-h-screen pt-28 flex items-center justify-center font-mono">
        <LoadingState message="Initializing Tournament Registration Console..." />
      </div>
    );
  }

  return (
    <div className="bg-[#05050A] min-h-screen text-white pt-24 pb-20 px-4 sm:px-6 relative overflow-hidden font-excon">
      <BackgroundVideo />

      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        {/* Mode Switcher Tabs */}
        <div className="flex justify-center">
          <div className="inline-flex bg-black/60 p-1.5 rounded-full border border-white/15 backdrop-blur-xl shadow-2xl">
            <button
              type="button"
              onClick={() => {
                setCheckoutMode("event");
                setError("");
              }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all font-excon-black ${
                checkoutMode === "event"
                  ? "bg-metallic-gold text-black shadow-[0_0_20px_rgba(212,175,55,0.5)]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <RiShieldFlashLine />
              <span>Tournament Registration</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCheckoutMode("accommodation");
                setError("");
              }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all font-excon-black ${
                checkoutMode === "accommodation"
                  ? "bg-arc-cyan text-black shadow-[0_0_20px_rgba(0,212,255,0.5)]"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <RiHotelBedLine />
              <span>Hostel Accommodation</span>
            </button>
          </div>
        </div>

        {/* Dynamic Header Title */}
        {checkoutMode === "accommodation" ? (
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-arc-cyan/15 text-arc-cyan border border-arc-cyan/40 text-xs font-black uppercase tracking-widest font-mono">
              <RiHotelBedLine />
              <span>S.H.I.E.L.D. HOSPITALITY &amp; QUARTERS PROTOCOL</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase text-white font-excon-black tracking-tight">
              Hostel Accommodation Booking
            </h1>
            <p className="text-xs sm:text-sm text-white/60 max-w-xl mx-auto font-mono">
              Select Quarters → Delegate Info → UPI Payment &amp; Proof → Bed Confirmed
            </p>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-metallic-gold/15 text-metallic-gold border border-metallic-gold/40 text-xs font-black uppercase tracking-widest font-mono">
              <RiShieldFlashLine />
              <span>S.H.I.E.L.D. EVENT REGISTRATION PROTOCOL</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase text-white font-excon-black tracking-tight">
              {isOnlySolo
                ? "Solo Event Registration"
                : hasSquadEvents && hasSoloEvents
                ? "Multi-Event Registration (Solo + Squad)"
                : "Tournament Registration"}
            </h1>
            <p className="text-xs sm:text-sm text-white/60 max-w-xl mx-auto font-mono">
              {isOnlySolo
                ? "Select Missions → Participant Details → Review Compliance → Payment → Passes Confirmed"
                : hasSquadEvents && hasSoloEvents
                ? "Select Missions → Participant Details → Configure Squads → Review & Verify → Payment"
                : "Select Missions → Captain Details → Assemble Squads → Validate Minimum Members → Payment"}
            </p>
          </div>
        )}

        {/* Stepper Bar */}
        {checkoutMode === "accommodation" ? (
          <div className="p-3 sm:p-4 rounded-2xl bg-[#0A0D1A]/90 border border-white/10 shadow-xl backdrop-blur-md">
            <div className="grid grid-cols-4 gap-1 sm:gap-2">
              {ACC_STEPS.map((s) => {
                const isActive = accStep === s.num;
                const isDone = accStep > s.num;
                return (
                  <div
                    key={s.num}
                    className={`flex flex-col items-center text-center p-2 rounded-xl transition-all ${
                      isActive
                        ? "bg-arc-cyan/20 border border-arc-cyan/60 text-arc-cyan"
                        : isDone
                        ? "bg-white/[0.04] text-emerald-400 border border-emerald-500/30"
                        : "text-white/40 border border-transparent"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black font-mono mb-1 ${
                        isActive
                          ? "bg-arc-cyan text-black shadow-[0_0_10px_#00D4FF]"
                          : isDone
                          ? "bg-emerald-400 text-black"
                          : "bg-white/10 text-white/50"
                      }`}
                    >
                      {isDone ? <RiCheckLine /> : s.num}
                    </div>
                    <span className="text-[9px] sm:text-[11px] font-black tracking-wider uppercase font-mono truncate w-full">
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-3 sm:p-4 rounded-2xl bg-[#0A0D1A]/90 border border-white/10 shadow-xl backdrop-blur-md">
            <div className={`grid ${eventSteps.length === 5 ? "grid-cols-5" : "grid-cols-6"} gap-1 sm:gap-2`}>
              {eventSteps.map((s, idx) => {
                const isActive = step === s.num;
                const isDone = step > s.num;
                return (
                  <div
                    key={s.num}
                    className={`flex flex-col items-center text-center p-2 rounded-xl transition-all ${
                      isActive
                        ? "bg-metallic-gold/20 border border-metallic-gold/60 text-metallic-gold"
                        : isDone
                        ? "bg-white/[0.04] text-arc-cyan border border-arc-cyan/30"
                        : "text-white/40 border border-transparent"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black font-mono mb-1 ${
                        isActive
                          ? "bg-metallic-gold text-black shadow-[0_0_10px_#D4AF37]"
                          : isDone
                          ? "bg-arc-cyan text-black"
                          : "bg-white/10 text-white/50"
                      }`}
                    >
                      {isDone ? <RiCheckLine /> : idx + 1}
                    </div>
                    <span className="text-[9px] sm:text-[11px] font-black tracking-wider uppercase font-mono truncate w-full">
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Notification / Error Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs sm:text-sm flex items-center justify-between font-mono shadow-lg"
            >
              <div className="flex items-center gap-2">
                <RiAlertLine className="text-base shrink-0" />
                <span>{error}</span>
              </div>
              <button type="button" onClick={() => setError("")} className="text-white/60 hover:text-white p-1">
                <RiCloseLine className="text-base" />
              </button>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm flex items-center justify-between font-mono shadow-lg"
            >
              <div className="flex items-center gap-2">
                <RiCheckboxCircleLine className="text-base shrink-0" />
                <span>{successMsg}</span>
              </div>
              <button type="button" onClick={() => setSuccessMsg("")} className="text-white/60 hover:text-white p-1">
                <RiCloseLine className="text-base" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* ACCOMMODATION CHECKOUT FLOW                                  */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {checkoutMode === "accommodation" && (
          <div className="space-y-6">
            {/* Step 1: Hostel & Dates */}
            {accStep === 1 && (
              <div className="marvel-card p-6 sm:p-8 rounded-3xl border border-white/15 bg-[#0A0D1A]/95 shadow-2xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-arc-cyan tracking-widest font-mono block">
                      STEP 1 OF 4: QUARTERS &amp; DATES
                    </span>
                    <h2 className="text-2xl font-black uppercase text-white font-excon-black">
                      Select Hostel Wing &amp; Stay Dates
                    </h2>
                  </div>

                  {/* Gender Filter for Hostels */}
                  <div className="flex bg-black/50 p-1 rounded-full border border-white/10 shrink-0">
                    <button
                      type="button"
                      onClick={() => setAccGenderFilter("all")}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase transition-all ${
                        accGenderFilter === "all" ? "bg-white/20 text-white" : "text-white/50 hover:text-white"
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccGenderFilter("male")}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase transition-all ${
                        accGenderFilter === "male" ? "bg-arc-cyan text-black" : "text-white/50 hover:text-white"
                      }`}
                    >
                      Boys
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccGenderFilter("female")}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase transition-all ${
                        accGenderFilter === "female" ? "bg-metallic-gold text-black" : "text-white/50 hover:text-white"
                      }`}
                    >
                      Girls
                    </button>
                  </div>
                </div>

                {/* Hostels Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {filteredHostels.map((h) => {
                    const isSelected = selectedHostel?.id === h.id;
                    return (
                      <div
                        key={h.id}
                        onClick={() => {
                          setSelectedHostel(h);
                          setAccForm((prev) => ({ ...prev, hostel_id: h.id }));
                        }}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                          isSelected
                            ? "border-arc-cyan bg-arc-cyan/10 shadow-[0_0_25px_rgba(0,212,255,0.25)] ring-2 ring-arc-cyan"
                            : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                h.gender === "female"
                                  ? "bg-metallic-gold/20 text-metallic-gold border-metallic-gold/40"
                                  : "bg-arc-cyan/20 text-arc-cyan border-arc-cyan/40"
                              }`}
                            >
                              {h.gender === "female" ? "Ladies Hostel" : "Mens Hostel"}
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400 font-bold">
                              {h.available_beds} beds free
                            </span>
                          </div>

                          <h3 className="text-lg font-black text-white font-excon-black leading-tight">
                            {h.name}
                          </h3>
                          <p className="text-[11px] text-white/60 flex items-center gap-1 font-mono">
                            <RiMapPinLine className="text-marvel-red shrink-0" />
                            <span>{h.location} ({h.distance})</span>
                          </p>
                        </div>

                        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] uppercase text-white/50 block font-mono">Tariff</span>
                            <span className="text-sm font-black text-metallic-gold font-mono">
                              ₹{Number(h.tariff_per_night || 350)} / night
                            </span>
                          </div>
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isSelected ? "bg-arc-cyan text-black" : "border border-white/20 text-transparent"
                            }`}
                          >
                            ✓
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Stay Dates & Delegates Count */}
                <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-white/80 font-mono">
                    Configure Stay Schedule &amp; Headcount
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1.5 font-mono">
                        Check-In Date
                      </label>
                      <input
                        type="date"
                        value={accForm.check_in_date}
                        onChange={(e) => setAccForm((prev) => ({ ...prev, check_in_date: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-arc-cyan font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1.5 font-mono">
                        Check-Out Date
                      </label>
                      <input
                        type="date"
                        value={accForm.check_out_date}
                        min={accForm.check_in_date}
                        onChange={(e) => setAccForm((prev) => ({ ...prev, check_out_date: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-arc-cyan font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-white/60 mb-1.5 font-mono">
                        Number of Delegates
                      </label>
                      <div className="flex items-center bg-white/5 border border-white/15 rounded-xl overflow-hidden">
                        <button
                          type="button"
                          onClick={() =>
                            setAccForm((prev) => ({ ...prev, persons_count: Math.max(1, (prev.persons_count || 1) - 1) }))
                          }
                          className="px-3.5 py-2.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors font-black text-sm"
                        >
                          -
                        </button>
                        <span className="flex-1 text-center text-xs font-bold text-white font-mono">
                          {accForm.persons_count} Person{accForm.persons_count > 1 ? "s" : ""}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setAccForm((prev) => ({ ...prev, persons_count: Math.min(20, (prev.persons_count || 1) + 1) }))
                          }
                          className="px-3.5 py-2.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors font-black text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Meal Plan Add-on Options */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-black/30 border border-white/10 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-black uppercase text-white font-mono">
                          <RiRestaurantLine className="text-metallic-gold text-sm" />
                          <span>Official Mess Dining Plan (Optional Add-ons)</span>
                        </div>
                        <p className="text-[11px] text-white/60 font-mono">
                          Ratified festival meal rates: Breakfast ₹50 · Lunch ₹70 · Dinner ₹50
                        </p>
                      </div>

                      {/* Quick Select Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setAccForm((prev) => ({
                              ...prev,
                              include_breakfast: true,
                              include_lunch: true,
                              include_dinner: true,
                            }))
                          }
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-metallic-gold/20 hover:bg-metallic-gold/30 text-metallic-gold border border-metallic-gold/40 font-mono transition-colors cursor-pointer"
                        >
                          + All Meals (₹170/day)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setAccForm((prev) => ({
                              ...prev,
                              include_breakfast: false,
                              include_lunch: false,
                              include_dinner: false,
                            }))
                          }
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 font-mono transition-colors cursor-pointer"
                        >
                          Stay Only
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                      {/* Breakfast Option */}
                      <label
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          accForm.include_breakfast
                            ? "bg-metallic-gold/15 border-metallic-gold text-white shadow-[0_0_15px_rgba(255,215,0,0.15)]"
                            : "bg-white/[0.02] border-white/10 text-white/70 hover:bg-white/[0.05]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={accForm.include_breakfast}
                            onChange={(e) =>
                              setAccForm((prev) => ({ ...prev, include_breakfast: e.target.checked }))
                            }
                            className="w-4 h-4 accent-metallic-gold rounded"
                          />
                          <div>
                            <span className="font-bold text-xs block font-mono">Breakfast</span>
                            <span className="text-[10px] text-white/50 block font-mono">Morning Mess</span>
                          </div>
                        </div>
                        <span className="text-xs font-black text-metallic-gold font-mono">+₹50/day</span>
                      </label>

                      {/* Lunch Option */}
                      <label
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          accForm.include_lunch
                            ? "bg-marvel-red/15 border-marvel-red text-white shadow-[0_0_15px_rgba(237,29,36,0.15)]"
                            : "bg-white/[0.02] border-white/10 text-white/70 hover:bg-white/[0.05]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={accForm.include_lunch}
                            onChange={(e) =>
                              setAccForm((prev) => ({ ...prev, include_lunch: e.target.checked }))
                            }
                            className="w-4 h-4 accent-marvel-red rounded"
                          />
                          <div>
                            <span className="font-bold text-xs block font-mono">Lunch</span>
                            <span className="text-[10px] text-white/50 block font-mono">Afternoon Buffet</span>
                          </div>
                        </div>
                        <span className="text-xs font-black text-marvel-red font-mono">+₹70/day</span>
                      </label>

                      {/* Dinner Option */}
                      <label
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          accForm.include_dinner
                            ? "bg-purple-500/15 border-purple-400 text-white shadow-[0_0_15px_rgba(192,132,252,0.15)]"
                            : "bg-white/[0.02] border-white/10 text-white/70 hover:bg-white/[0.05]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={accForm.include_dinner}
                            onChange={(e) =>
                              setAccForm((prev) => ({ ...prev, include_dinner: e.target.checked }))
                            }
                            className="w-4 h-4 accent-purple-400 rounded"
                          />
                          <div>
                            <span className="font-bold text-xs block font-mono">Dinner</span>
                            <span className="text-[10px] text-white/50 block font-mono">Evening Mess</span>
                          </div>
                        </div>
                        <span className="text-xs font-black text-purple-400 font-mono">+₹50/day</span>
                      </label>
                    </div>
                  </div>

                  {/* Live Calculation Banner */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-arc-cyan/15 via-black/40 to-metallic-gold/15 border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
                    <div className="text-white/75 space-y-1">
                      <div>
                        Duration: <strong className="text-white">{accNights} Night{accNights > 1 ? "s" : ""}</strong> · <strong className="text-white">{accHeadcount} Delegate{accHeadcount > 1 ? "s" : ""}</strong> ({accForm.check_in_date} to {accForm.check_out_date})
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px]">
                        <span>Room Stay: <strong className="text-arc-cyan">₹{accTariff}/day/head</strong> (₹{accTotalStayAmount.toFixed(2)})</span>
                        <span>•</span>
                        <span>Meals: <strong className="text-metallic-gold">{accMealDailyPerHead > 0 ? `+₹${accMealDailyPerHead}/day/head` : "Without Food"}</strong> {accMealDailyPerHead > 0 ? `(₹${accTotalMealAmount.toFixed(2)})` : ""}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-white/50 block uppercase">Total Accommodation Due</span>
                      <span className="text-xl font-black text-metallic-gold font-excon-black">
                        ₹{accTotalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Proceed Button */}
                <div className="flex justify-end pt-4 border-t border-white/10">
                  <button
                    type="button"
                    disabled={!selectedHostel}
                    onClick={() => {
                      if (!selectedHostel) {
                        setError("Please choose a hostel wing.");
                        return;
                      }
                      setError("");
                      setAccStep(2);
                    }}
                    className="w-full sm:w-auto px-8 py-3.5 bg-arc-cyan hover:bg-white text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:shadow-[0_0_30px_rgba(0,212,255,0.7)] font-excon-black flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>Continue to Delegate Info</span>
                    <RiArrowRightLine />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Delegate Info */}
            {accStep === 2 && (
              <div className="marvel-card p-6 sm:p-8 rounded-3xl border border-white/15 bg-[#0A0D1A]/95 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-arc-cyan tracking-widest font-mono block">
                      STEP 2 OF 4: RESIDENT PARTICIPANT
                    </span>
                    <h2 className="text-2xl font-black uppercase text-white font-excon-black">
                      Delegate Information
                    </h2>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-white/50 block font-mono">SELECTED QUARTERS</span>
                    <span className="text-xs font-bold text-metallic-gold font-mono">{selectedHostel?.name}</span>
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!accForm.full_name.trim()) {
                      setError("Full name is required.");
                      return;
                    }
                    const phoneErr = validatePhone(accForm.phone);
                    if (phoneErr) {
                      setError(phoneErr);
                      return;
                    }
                    if (!accForm.college.trim()) {
                      setError("College / institution is required.");
                      return;
                    }
                    setError("");
                    setAccStep(3);
                  }}
                  className="space-y-4 font-mono text-xs"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-white/60 mb-1.5">
                        Full Name <span className="text-marvel-red">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={accForm.full_name}
                        onChange={(e) => setAccForm((prev) => ({ ...prev, full_name: e.target.value }))}
                        placeholder="Delegate / Representative Name"
                        className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-arc-cyan"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-white/60 mb-1.5">
                        Contact Mobile (10 Digits) <span className="text-marvel-red">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={accForm.phone}
                        onChange={(e) => setAccForm((prev) => ({ ...prev, phone: e.target.value }))}
                        placeholder="9876543210"
                        className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-arc-cyan"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-white/60 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={accForm.email}
                        onChange={(e) => setAccForm((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="delegate@institution.edu"
                        className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-arc-cyan"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-white/60 mb-1.5">
                        Gender Preference
                      </label>
                      <select
                        value={accForm.gender}
                        onChange={(e) => setAccForm((prev) => ({ ...prev, gender: e.target.value }))}
                        className="w-full px-4 py-3 bg-[#0A0D1A] border border-white/15 rounded-xl text-white focus:outline-none focus:border-arc-cyan"
                      >
                        <option value="male">Male (Mens Wing)</option>
                        <option value="female">Female (Ladies Wing)</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-white/60 mb-1.5">
                      College / Institution Name <span className="text-marvel-red">*</span>
                    </label>
                    <CollegeSchoolPicker
                      value={accForm.college}
                      onChange={(val) => setAccForm((prev) => ({ ...prev, college: val }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-white/60 mb-1.5">
                      Special Requests / Roommate Preferences (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={accForm.special_requests}
                      onChange={(e) => setAccForm((prev) => ({ ...prev, special_requests: e.target.value }))}
                      placeholder="e.g. Ground floor preference, room sharing with college team, early morning arrival..."
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-arc-cyan"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setAccStep(1);
                      }}
                      className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-xs uppercase rounded-xl transition-all font-mono"
                    >
                      ← Back to Quarters
                    </button>

                    <button
                      type="submit"
                      className="px-8 py-3.5 bg-arc-cyan hover:bg-white text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(0,212,255,0.4)] font-excon-black flex items-center gap-2 cursor-pointer"
                    >
                      <span>Proceed to Payment</span>
                      <RiArrowRightLine />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 3: UPI Payment */}
            {accStep === 3 && (
              <div className="marvel-card p-6 sm:p-8 rounded-3xl border border-white/15 bg-[#0A0D1A]/95 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-arc-cyan tracking-widest font-mono block">
                      STEP 3 OF 4: OFFICIAL PAYMENT
                    </span>
                    <h2 className="text-2xl font-black uppercase text-white font-excon-black">
                      Accommodation UPI Payment
                    </h2>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-white/50 block font-mono">TOTAL PAYABLE</span>
                    <span className="text-xl font-black text-metallic-gold font-excon-black">
                      ₹{accTotalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Booking Summary Strip */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
                  <div>
                    <span className="text-white/40 block text-[10px] uppercase">Quarters</span>
                    <strong className="text-white truncate block">{selectedHostel?.name}</strong>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px] uppercase">Duration</span>
                    <strong className="text-arc-cyan">{accNights} Nights</strong>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px] uppercase">Delegates</span>
                    <strong className="text-white">{accForm.persons_count} Head(s)</strong>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px] uppercase">Dining Plan</span>
                    <strong className="text-metallic-gold truncate block">{mealPlanSummary}</strong>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px] uppercase">Resident</span>
                    <strong className="text-white truncate block">{accForm.full_name}</strong>
                  </div>
                </div>

                {/* UPI QR Code Display */}
                <div className="p-6 rounded-3xl bg-black/60 border border-arc-cyan/30 text-center space-y-4 shadow-xl max-w-md mx-auto">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-arc-cyan uppercase tracking-widest font-bold">
                      S.H.I.E.L.D. QUARTERS QR
                    </span>
                    <h3 className="text-lg font-black text-white uppercase font-excon-black">
                      Scan to Pay ₹{accTotalAmount.toFixed(2)}
                    </h3>
                  </div>

                  <div className="p-3 bg-white rounded-2xl shadow-[0_0_25px_rgba(0,212,255,0.25)] border-2 border-arc-cyan/40 inline-block">
                    <img
                      src="/hostel-payment-qr.jpg"
                      alt="Hostel Payment QR"
                      onError={(e) => {
                        e.currentTarget.src = "/images/payment-qr.png";
                      }}
                      className="w-48 h-48 sm:w-56 sm:h-56 object-contain block mx-auto"
                    />
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-mono text-left space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-white/50">Beneficiary:</span>
                      <span className="text-white font-bold">ST ALPHONSA HOSTEL</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/50">UPI ID:</span>
                      <span className="text-arc-cyan font-bold">stalphonsahostel@iob</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/50">Amount Due:</span>
                      <span className="text-metallic-gold font-black">₹{accTotalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-white/50 font-mono">
                    Scan via Google Pay, PhonePe, Paytm, BHIM, or any UPI banking app.
                  </p>

                  <a
                    href={`upi://pay?pa=stalphonsahostel@iob&pn=ST%20ALPHONSA%20HOSTEL&am=${accTotalAmount.toFixed(2)}&cu=INR&tn=MacFiesta%20Hostel`}
                    className="w-full py-3.5 px-4 bg-arc-cyan hover:bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_20px_rgba(0,212,255,0.35)] font-excon-black inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Open UPI / GPay App (₹{accTotalAmount.toLocaleString("en-IN")})</span>
                    <RiExternalLinkLine className="text-sm" />
                  </a>
                </div>

                {/* Verification Inputs */}
                <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4 max-w-md mx-auto font-mono text-xs">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-white/60 mb-1.5">
                      UPI UTR / Transaction ID (12 Digits)
                    </label>
                    <input
                      type="text"
                      value={accForm.txn}
                      onChange={(e) => setAccForm((prev) => ({ ...prev, txn: e.target.value }))}
                      placeholder="e.g. 629102938475"
                      className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-arc-cyan font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-white/60 mb-1.5">
                      Upload Payment Screenshot / Receipt (Optional if UTR provided)
                    </label>
                    <label className="flex flex-col items-center justify-center p-4 border border-dashed border-white/20 hover:border-arc-cyan rounded-xl bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer transition-all">
                      <RiUploadCloud2Line className="text-2xl text-arc-cyan mb-1" />
                      <span className="text-white/70 text-[11px]">
                        {accForm.proof ? accForm.proof.name : "Click to browse payment screenshot"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setAccForm((prev) => ({ ...prev, proof: file }));
                            setAccProofPreview(URL.createObjectURL(file));
                          }
                        }}
                        className="hidden"
                      />
                    </label>

                    {accProofPreview && (
                      <div className="mt-2 text-center">
                        <img
                          src={accProofPreview}
                          alt="Payment Screenshot Preview"
                          className="max-h-32 mx-auto rounded-lg border border-arc-cyan/40"
                        />
                      </div>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      disabled={accSubmitting}
                      onClick={(e) => handleAccSubmit(e, false)}
                      className="w-full py-3.5 bg-arc-cyan hover:bg-white text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(0,212,255,0.4)] font-excon-black flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <RiLockLine />
                      <span>{accSubmitting ? "Submitting Reservation..." : "Submit Reservation & Payment"}</span>
                    </button>

                    <button
                      type="button"
                      disabled={accSubmitting}
                      onClick={(e) => handleAccSubmit(e, true)}
                      className="w-full py-2.5 bg-metallic-gold/15 hover:bg-metallic-gold/30 border border-metallic-gold/40 text-metallic-gold font-black text-[11px] uppercase tracking-wider rounded-xl transition-all font-excon-black flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RiSparklingLine />
                      <span>⚡ Instant Confirm &amp; Lock Bed</span>
                    </button>
                  </div>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setAccStep(2)}
                      className="text-white/50 hover:text-white text-[11px] font-mono transition-colors"
                    >
                      ← Edit Delegate Information
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Confirmed */}
            {accStep === 4 && (
              <div className="marvel-card p-6 sm:p-8 rounded-3xl border border-arc-cyan/50 bg-[#0A0D1A]/95 shadow-[0_0_50px_rgba(0,212,255,0.2)] space-y-6 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center text-3xl mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  <RiCheckboxCircleLine />
                </div>

                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase font-mono">
                    ACCOMMODATION ALLOCATION CONFIRMED
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-excon-black">
                    Hostel Bed Reserved!
                  </h2>
                  <p className="text-xs text-white/60 font-mono">
                    Your on-campus festival stay has been logged into the hospitality system.
                  </p>
                </div>

                {/* Dossier Card */}
                <div className="p-5 rounded-2xl bg-black/40 border border-white/10 text-left font-mono text-xs space-y-2.5 max-w-lg mx-auto">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/50">Booking Reference:</span>
                    <span className="font-bold text-arc-cyan">{accBookingResult?.booking_id || "HST-2026-CONFIRMED"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/50">Hostel Wing:</span>
                    <span className="font-bold text-white">{accBookingResult?.hostel_name || selectedHostel?.name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/50">Dates:</span>
                    <span className="font-bold text-white">
                      {accForm.check_in_date} → {accForm.check_out_date} ({accNights} Nights)
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/50">Resident / Delegate:</span>
                    <span className="font-bold text-metallic-gold">{accBookingResult?.full_name || accForm.full_name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/50">Delegates Count:</span>
                    <span className="font-bold text-white">{accBookingResult?.persons_count || accForm.persons_count} Person(s)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/50">Institution:</span>
                    <span className="font-bold text-white">{accBookingResult?.college || accForm.college}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/50">Dining / Meal Plan:</span>
                    <span className="font-bold text-metallic-gold">{mealPlanSummary}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/50">Total Amount:</span>
                    <span className="font-bold text-white">₹{Number(accBookingResult?.payment_amount || accTotalAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/50">Status:</span>
                    <span className="font-bold text-emerald-400 uppercase">
                      {accBookingResult?.status === "confirmed" ? "Confirmed Allocation" : "Pending Allocation"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-white/50">Warden Support:</span>
                    <span className="font-bold text-white/90">
                      {selectedHostel?.warden_name} ({selectedHostel?.warden_phone})
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-white/10">
                  <Link
                    to="/student-dashboard"
                    className="w-full sm:w-auto px-6 py-3.5 bg-arc-cyan hover:bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_20px_#00D4FF] font-excon-black text-center"
                  >
                    Go to Student Dashboard
                  </Link>
                  <Link
                    to="/accommodation"
                    className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all font-excon-black text-center"
                  >
                    View Quarters Guidelines
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setAccStep(1);
                      setAccBookingResult(null);
                    }}
                    className="w-full sm:w-auto px-6 py-3.5 bg-metallic-gold hover:bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all font-excon-black text-center"
                  >
                    Book Another Room
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* TOURNAMENT EVENT REGISTRATION FLOW                           */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {checkoutMode === "event" && (
        <>
        {/* ───────────────────────────────────────────────────────────── */}
        {/* STEP 1: MULTI-MISSION SELECTION & CART                        */}
        {/* ───────────────────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="marvel-card p-6 sm:p-8 rounded-3xl border border-white/15 bg-[#0A0D1A]/95 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-metallic-gold tracking-widest font-mono block">
                  STEP 1 OF {eventSteps.length}
                </span>
                <h2 className="text-2xl font-black uppercase text-white font-excon-black">
                  Select Festival Missions
                </h2>
                <p className="text-xs text-white/60 font-mono">
                  Select one or multiple missions. Combine solo individual entries and squad challenges into one checkout session.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-metallic-gold font-bold block">
                  {selectedEvents.length} Selected
                </span>
                <span className="text-[10px] font-mono text-white/40">
                  {events.length} Missions Open
                </span>
              </div>
            </div>

            {/* Division & Category Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-black/40 border border-white/10">
              <button
                type="button"
                onClick={() => setAudienceFilter("all")}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase font-mono tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  audienceFilter === "all"
                    ? "bg-white/20 text-white border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                    : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <RiShieldFlashLine className="text-sm" />
                <span>All ({events.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setAudienceFilter("college")}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase font-mono tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  audienceFilter === "college"
                    ? "bg-arc-cyan/20 text-arc-cyan border border-arc-cyan/50 shadow-[0_0_15px_rgba(0,212,255,0.25)]"
                    : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <RiGraduationCapLine className="text-sm" />
                <span>🎓 College ({collegeCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setAudienceFilter("school")}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase font-mono tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  audienceFilter === "school"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                    : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <RiBuilding4Line className="text-sm" />
                <span>🎒 School ({schoolCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setAudienceFilter("solo")}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase font-mono tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  audienceFilter === "solo"
                    ? "bg-metallic-gold/20 text-metallic-gold border border-metallic-gold/50 shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                    : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <RiUserLine className="text-sm" />
                <span>👤 Solo ({soloCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setAudienceFilter("squad")}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase font-mono tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  audienceFilter === "squad"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.25)]"
                    : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <RiTeamLine className="text-sm" />
                <span>👥 Squads ({squadCount})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-base" />
              <input
                type="text"
                placeholder="Search by mission title, category, or division..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-white placeholder-white/40 text-xs sm:text-sm focus:border-metallic-gold outline-none font-mono"
              />
            </div>

            {/* Event Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[460px] overflow-y-auto select-scrollbar pr-1">
              {filteredEvents.map((ev) => {
                const isSelected = selectedEvents.some((e) => String(e.id) === String(ev.id));
                const minS = ev.min_team_size || 1;
                const maxS = ev.max_team_size || 1;
                const isEvSolo = isSoloEvent(ev);
                const isEvSchool = isSchoolEvent(ev);
                const fee = Number(ev.registration_fee) === 0 ? "FREE" : `₹${ev.registration_fee}`;

                return (
                  <div
                    key={ev.id}
                    onClick={() => handleToggleEvent(ev)}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? "bg-metallic-gold/15 border-metallic-gold shadow-[0_0_20px_rgba(212,175,55,0.25)] ring-1 ring-metallic-gold/60"
                        : "bg-white/[0.02] border-white/10 hover:border-white/25 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* Scope / Audience Badge */}
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] uppercase font-black font-mono border ${
                              isEvSchool
                                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                : "bg-arc-cyan/15 text-arc-cyan border-arc-cyan/30"
                            }`}
                          >
                            {isEvSchool ? "🎒 School Day" : "🎓 College Day"}
                          </span>

                          {/* Format Badge */}
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold font-mono border ${
                              isEvSolo
                                ? "bg-metallic-gold/15 text-metallic-gold border-metallic-gold/30"
                                : "bg-purple-500/15 text-purple-300 border-purple-500/30"
                            }`}
                          >
                            {isEvSolo ? "Solo Event" : `Squad (${minS}-${maxS})`}
                          </span>

                          <span className="px-2 py-0.5 rounded bg-white/10 text-white/70 text-[9px] uppercase font-bold font-mono">
                            {ev.category || "General"}
                          </span>
                        </div>
                        <span className="text-xs font-black font-mono text-metallic-gold">{fee}</span>
                      </div>

                      <h4 className="text-base font-black text-white font-excon-bold leading-snug">
                        {ev.title}
                      </h4>
                      <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
                        {ev.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] font-mono text-white/60">
                      <span className="flex items-center gap-1.5">
                        {isEvSolo ? (
                          <>
                            <RiUserLine className="text-metallic-gold text-xs" />
                            <span className="text-metallic-gold font-bold">Solo Event (1 Participant)</span>
                          </>
                        ) : (
                          <>
                            <RiTeamLine className="text-arc-cyan text-xs" />
                            <span>Squad: {minS} - {maxS} Members</span>
                          </>
                        )}
                      </span>
                      <div className="flex items-center gap-1.5 font-bold">
                        {isSelected ? (
                          <span className="text-metallic-gold flex items-center gap-1">
                            <RiCheckboxCircleLine className="text-sm" />
                            <span>Selected</span>
                          </span>
                        ) : (
                          <span className="text-white/40 flex items-center gap-1 hover:text-white">
                            <RiAddLine className="text-sm" />
                            <span>Add</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredEvents.length === 0 && (
                <div className="col-span-full p-8 rounded-2xl bg-white/[0.02] border border-white/10 text-center font-mono space-y-2">
                  <p className="text-xs text-white/50">
                    No missions found matching "{searchQuery}" with current filters.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setAudienceFilter("all");
                    }}
                    className="text-xs text-arc-cyan hover:underline font-bold uppercase tracking-wider"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>

            {/* Sticky Cart Summary Bar */}
            {selectedEvents.length > 0 && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-metallic-gold/15 via-[#11162B] to-[#0A0D1A] border border-metallic-gold/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="space-y-0.5 text-center sm:text-left font-mono">
                  <span className="text-xs uppercase font-bold text-metallic-gold tracking-wider block">
                    {selectedEvents.length} Mission{selectedEvents.length > 1 ? "s" : ""} Selected
                  </span>
                  <span className="text-xs text-white/70">
                    {soloSelected.length} Solo Event{soloSelected.length === 1 ? "" : "s"} · {squadSelected.length} Squad Mission{squadSelected.length === 1 ? "" : "s"}
                  </span>
                  <span className="text-sm font-black text-white ml-2 font-mono">
                    · Total Fee: {totalFee === 0 ? "FREE" : `₹${totalFee.toFixed(2)}`}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleProceedFromStep1}
                  className="w-full sm:w-auto px-7 py-3.5 bg-metallic-gold hover:bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg font-excon-black cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <span>
                    {isOnlySolo
                      ? "Continue to Solo Details"
                      : hasSquadEvents && hasSoloEvents
                      ? "Continue to Participant & Squad Setup"
                      : "Continue to Squad Setup"}
                  </span>
                  <RiArrowRightLine className="text-sm" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* STEP 2: PARTICIPANT & CAPTAIN CREDENTIALS                     */}
        {/* ───────────────────────────────────────────────────────────── */}
        {step === 2 && (
          <form
            onSubmit={handleSaveParticipant}
            className="marvel-card p-6 sm:p-8 rounded-3xl border border-white/15 bg-[#0A0D1A]/95 shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-metallic-gold tracking-widest font-mono block">
                  STEP 2 OF {eventSteps.length}: {isOnlySolo ? "PARTICIPANT CREDENTIALS" : "PARTICIPANT & CAPTAIN DETAILS"}
                </span>
                <h2 className="text-2xl font-black uppercase text-white font-excon-black">
                  {isOnlySolo
                    ? "Solo Participant Registration"
                    : hasSquadEvents && hasSoloEvents
                    ? "Participant & Team Captain Credentials"
                    : "Team Captain & Registrant Details"}
                </h2>
                <p className="text-xs text-white/60 font-mono">
                  {isOnlySolo
                    ? "Register directly as an individual participant. Since all selected missions are Solo events, no squad or teammate setup is required."
                    : "Enter your official registration credentials. You are automatically and immutably assigned as Team Captain for any selected squad missions."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-arc-cyan font-bold hover:underline font-mono inline-flex items-center gap-1"
              >
                <RiArrowLeftLine />
                <span>Change Missions</span>
              </button>
            </div>

            {/* Designated Captain / Solo Participant Pre-Population Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-metallic-gold/15 to-[#11162B] border border-metallic-gold/40 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-metallic-gold text-black flex items-center justify-center text-xl font-black shrink-0 shadow-lg">
                {isOnlySolo ? <RiUserLine /> : <RiUserStarLine />}
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-metallic-gold tracking-widest font-mono block">
                  {isOnlySolo ? "SOLO PARTICIPANT (YOU)" : "DESIGNATED TEAM CAPTAIN (YOU)"}
                </span>
                <h4 className="text-base font-black text-white uppercase font-excon-black">
                  {teamForm.participant_name || account?.full_name || account?.username || (isOnlySolo ? "Solo Participant" : "Squad Commander")}
                </h4>
                <p className="text-xs text-white/60 font-mono">
                  {account?.email} · {isOnlySolo ? "Direct Individual Entry & Official Contact" : "Assigned immutably as Squad Leader for all team events"}
                </p>
              </div>
            </div>

            {/* Registration Details Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  Participant Full Legal Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full legal name for the event certificate & pass"
                  value={teamForm.participant_name}
                  onChange={(e) =>
                    setTeamForm({
                      ...teamForm,
                      participant_name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-white placeholder-white/30 text-sm focus:border-metallic-gold outline-none font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  Contact Mobile Number (10 Digits) <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  value={teamForm.phone}
                  onChange={(e) => setTeamForm({ ...teamForm, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-white placeholder-white/30 text-sm focus:border-metallic-gold outline-none font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  College / School / Institution <span className="text-red-400">*</span>
                </label>
                <CollegeSchoolPicker
                  value={teamForm.college_name}
                  onChange={(val) => setTeamForm({ ...teamForm, college_name: val })}
                  placeholder="Enter college, school or university"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  Gender Preference
                </label>
                <select
                  value={teamForm.gender}
                  onChange={(e) => setTeamForm({ ...teamForm, gender: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#0A0D1A] border border-white/15 text-white text-sm focus:border-metallic-gold outline-none font-mono"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other / Prefer not to say</option>
                </select>
              </div>
            </div>

            {/* Step 2 Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold uppercase font-mono"
              >
                ← Back to Missions
              </button>
              <button
                type="submit"
                className="px-6 py-3.5 bg-metallic-gold hover:bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg font-excon-black cursor-pointer inline-flex items-center gap-2"
              >
                <span>
                  {isOnlySolo
                    ? "Confirm Solo Details & Review"
                    : "Save Credentials & Assemble Squads"}
                </span>
                <RiArrowRightLine className="text-sm" />
              </button>
            </div>
          </form>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* STEP 3: ASSEMBLE SQUADS & TEAMMATES (SQUAD MISSIONS ONLY)     */}
        {/* ───────────────────────────────────────────────────────────── */}
        {step === 3 && hasSquadEvents && (
          <div className="marvel-card p-6 sm:p-8 rounded-3xl border border-white/15 bg-[#0A0D1A]/95 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-metallic-gold tracking-widest font-mono block">
                  STEP 3 OF {eventSteps.length}: SQUAD CONFIGURATION
                </span>
                <h2 className="text-2xl font-black uppercase text-white font-excon-black">
                  Assemble Squad Teams &amp; Teammates
                </h2>
                <p className="text-xs text-white/60 font-mono">
                  Configure team names and add required teammates for each squad challenge. You are automatically the Captain.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-arc-cyan font-bold hover:underline font-mono inline-flex items-center gap-1"
              >
                <RiArrowLeftLine />
                <span>Edit Captain Details</span>
              </button>
            </div>

            {/* Informational banner for Solo Missions in mixed checkout */}
            {hasSoloEvents && (
              <div className="p-4 rounded-2xl bg-metallic-gold/10 border border-metallic-gold/40 flex items-center justify-between gap-3 font-mono text-xs">
                <div className="flex items-center gap-2.5 text-metallic-gold">
                  <RiUserLine className="text-lg shrink-0" />
                  <div>
                    <strong className="block text-white">
                      {soloSelected.length} Solo Mission{soloSelected.length > 1 ? "s" : ""} Auto-Configured:
                    </strong>
                    <span className="text-white/70">
                      {soloSelected.map((s) => s.title).join(", ")} — Registered individually for {teamForm.participant_name}. No team or teammates needed.
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase text-[10px] shrink-0">
                  ✓ Solo Ready
                </span>
              </div>
            )}

            {/* Squad Missions Accordion / Cards List */}
            <div className="space-y-6">
              {squadSelected.map((ev) => {
                const sq = squadsData[ev.id] || { team_name: "", members: [], newMember: {} };
                const members = sq.members || [];
                const totalCount = 1 + members.length;
                const minS = ev.min_team_size || 1;
                const maxS = ev.max_team_size || 99;
                const isSquadReady = totalCount >= minS && totalCount <= maxS;
                const isAtMax = totalCount >= maxS;
                const newM = sq.newMember || {};

                return (
                  <div
                    key={ev.id}
                    className="p-5 sm:p-6 rounded-2xl bg-black/40 border border-white/10 space-y-5"
                  >
                    {/* Mission Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40">
                            Squad Mission
                          </span>
                          <span className="text-xs font-mono text-white/50">
                            Min: {minS} · Max: {maxS} Members (inc. Captain)
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-white font-excon-bold">
                          {ev.title}
                        </h3>
                      </div>

                      {/* Ready Badge */}
                      <div>
                        {isSquadReady ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold flex items-center gap-1.5">
                            <RiCheckboxCircleLine />
                            <span>Squad Ready ({totalCount}/{maxS})</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold flex items-center gap-1.5">
                            <RiAlertLine />
                            <span>Needs {minS - totalCount} more member(s)</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Team Name Input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center justify-between">
                        <span>
                          Team / Squad Name {minS > 1 ? <span className="text-red-400">*</span> : <span className="text-white/40">(Optional)</span>}
                        </span>
                        <span className="text-[10px] text-white/40">Official squad moniker</span>
                      </label>
                      <input
                        type="text"
                        placeholder={`e.g. ${ev.title.split(":")[0]} Alpha`}
                        value={sq.team_name || ""}
                        onChange={(e) => handleSquadNameChange(ev.id, e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-white/30 text-xs focus:border-metallic-gold outline-none font-mono"
                      />
                    </div>

                    {/* Captain Card */}
                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-metallic-gold/15 to-[#0A0D1A] border border-metallic-gold/30 flex items-center justify-between gap-3 text-xs font-mono">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-metallic-gold text-black flex items-center justify-center font-bold shrink-0">
                          <RiUserStarLine />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-white block truncate">
                            {teamForm.participant_name || "Captain"} (You)
                          </span>
                          <span className="text-[10px] text-white/60 block truncate">
                            {account?.email} · {teamForm.phone} · {teamForm.college_name}
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-md bg-metallic-gold text-black font-black text-[9px] uppercase font-mono shrink-0">
                        ★ CAPTAIN / OWNER
                      </span>
                    </div>

                    {/* Added Teammates List */}
                    {members.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-white/70 uppercase font-mono block">
                          Added Teammates ({members.length})
                        </span>
                        {members.map((m, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3 text-xs font-mono"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-arc-cyan/15 text-arc-cyan flex items-center justify-center font-bold text-[11px] shrink-0">
                                {idx + 2}
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-white block truncate">{m.name}</span>
                                <span className="text-[10px] text-white/60 block truncate">
                                  {m.email} · {m.phone} · {m.college_name}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveSquadMember(ev.id, idx)}
                              className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors shrink-0"
                              title="Remove teammate"
                            >
                              <RiDeleteBinLine className="text-sm" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Teammate Sub-form */}
                    {!isAtMax ? (
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3 font-mono">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-arc-cyan uppercase flex items-center gap-1.5">
                            <RiTeamLine />
                            <span>Add Squad Member #{totalCount + 1}</span>
                          </span>
                          <span className="text-[10px] text-white/40">
                            {maxS - totalCount} slot(s) remaining
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                          <div>
                            <input
                              type="text"
                              placeholder="Full Name *"
                              value={newM.name || ""}
                              onChange={(e) => handleSquadMemberFieldChange(ev.id, "name", e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white placeholder-white/30 text-xs focus:border-arc-cyan outline-none"
                            />
                          </div>
                          <div>
                            <input
                              type="email"
                              placeholder="Email Address *"
                              value={newM.email || ""}
                              onChange={(e) => handleSquadMemberFieldChange(ev.id, "email", e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white placeholder-white/30 text-xs focus:border-arc-cyan outline-none"
                            />
                          </div>
                          <div>
                            <input
                              type="tel"
                              maxLength={10}
                              placeholder="10-Digit Mobile *"
                              value={newM.phone || ""}
                              onChange={(e) => handleSquadMemberFieldChange(ev.id, "phone", e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white placeholder-white/30 text-xs focus:border-arc-cyan outline-none"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <input
                              type="text"
                              placeholder="College / School Name"
                              value={newM.college_name !== undefined ? newM.college_name : teamForm.college_name}
                              onChange={(e) => handleSquadMemberFieldChange(ev.id, "college_name", e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white placeholder-white/30 text-xs focus:border-arc-cyan outline-none"
                            />
                          </div>
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleAddSquadMember(ev.id)}
                              className="w-full px-4 py-2 rounded-lg bg-arc-cyan/20 hover:bg-arc-cyan text-arc-cyan hover:text-black font-black text-xs uppercase tracking-wider font-mono border border-arc-cyan/40 transition-all cursor-pointer text-center"
                            >
                              + Add Teammate
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 text-center font-mono text-xs text-white/50">
                        Squad for "{ev.title}" has reached maximum capacity of {maxS} members.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Step 3 Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold uppercase font-mono"
              >
                ← Back to Details
              </button>
              <button
                type="button"
                onClick={handleProceedToReview}
                className="px-6 py-3.5 bg-metallic-gold hover:bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg font-excon-black cursor-pointer inline-flex items-center gap-2"
              >
                <span>Proceed to Order Review</span>
                <RiArrowRightLine className="text-sm" />
              </button>
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* STEP 4: ORDER REVIEW & COMPLIANCE VERIFICATION                */}
        {/* ───────────────────────────────────────────────────────────── */}
        {step === 4 && (
          <div className="marvel-card p-6 sm:p-8 rounded-3xl border border-white/15 bg-[#0A0D1A]/95 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-metallic-gold tracking-widest font-mono block">
                  STEP 4 OF {eventSteps.length}: COMPLIANCE REVIEW
                </span>
                <h2 className="text-2xl font-black uppercase text-white font-excon-black">
                  Order Review &amp; Verification
                </h2>
                <p className="text-xs text-white/60 font-mono">
                  Inspect your itemized registration breakdown before proceeding to official payment.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(isOnlySolo ? 2 : 3)}
                className="text-xs text-arc-cyan font-bold hover:underline font-mono inline-flex items-center gap-1"
              >
                <RiArrowLeftLine />
                <span>{isOnlySolo ? "Edit Details" : "Edit Squads"}</span>
              </button>
            </div>

            {/* Itemized Missions Breakdown Card */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3 font-mono text-xs">
              <span className="text-xs font-bold text-white uppercase tracking-wider block border-b border-white/10 pb-2">
                Selected Missions ({selectedEvents.length} Total)
              </span>

              {/* Solo Events Listing */}
              {soloSelected.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3.5 rounded-xl bg-metallic-gold/10 border border-metallic-gold/30 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <span className="font-black text-metallic-gold block text-sm">
                      ✓ Solo: {ev.title}
                    </span>
                    <span className="text-[11px] text-white/70 block">
                      Individual Registration Completed · {teamForm.participant_name} ({teamForm.college_name})
                    </span>
                  </div>
                  <span className="font-black font-mono text-white text-sm shrink-0">
                    {Number(ev.registration_fee) === 0 ? "FREE" : `₹${ev.registration_fee}`}
                  </span>
                </div>
              ))}

              {/* Squad Events Listing */}
              {squadSelected.map((ev) => {
                const sq = squadsData[ev.id] || { team_name: "", members: [] };
                const total = 1 + (sq.members?.length || 0);
                const squadName = sq.team_name?.trim() || `${teamForm.participant_name}'s Team`;

                return (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-xl bg-arc-cyan/10 border border-arc-cyan/30 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <span className="font-black text-arc-cyan block text-sm">
                        ✓ Squad: {ev.title}
                      </span>
                      <span className="text-[11px] text-white/70 block">
                        Squad '{squadName}' Ready ({total} Members: {teamForm.participant_name} (C){sq.members?.length > 0 ? `, ${sq.members.map((m) => m.name).join(", ")}` : ""})
                      </span>
                    </div>
                    <span className="font-black font-mono text-white text-sm shrink-0">
                      {Number(ev.registration_fee) === 0 ? "FREE" : `₹${ev.registration_fee}`}
                    </span>
                  </div>
                );
              })}

              {/* Fee Total Strip */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-white/60">Total Registration Due</span>
                <span className="text-2xl font-black text-metallic-gold font-excon-black">
                  {totalFee === 0 ? "FREE PASS" : `₹${totalFee.toFixed(2)}`}
                </span>
              </div>
            </div>

            {/* Registrant Dossier Card */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div>
                <span className="text-white/40 block text-[10px] uppercase">Participant / Captain</span>
                <span className="font-bold text-white truncate block">{teamForm.participant_name}</span>
              </div>
              <div>
                <span className="text-white/40 block text-[10px] uppercase">Mobile Number</span>
                <span className="font-bold text-white block">{teamForm.phone}</span>
              </div>
              <div>
                <span className="text-white/40 block text-[10px] uppercase">Institution</span>
                <span className="font-bold text-white truncate block">{teamForm.college_name}</span>
              </div>
            </div>

            {/* Step 4 Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setStep(isOnlySolo ? 2 : 3)}
                className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold uppercase font-mono"
              >
                {isOnlySolo ? "← Back to Participant Details" : "← Back to Squad Setup"}
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleCreateBatchRegistration}
                className="px-6 py-3.5 bg-metallic-gold hover:bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg font-excon-black cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
              >
                <span>{submitting ? "Reserving Missions..." : "Proceed to Payment Gateway"}</span>
                <RiArrowRightLine className="text-sm" />
              </button>
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* STEP 5: UNIFIED PAYMENT CONSOLE                               */}
        {/* ───────────────────────────────────────────────────────────── */}
        {step === 5 && (
          <div className="marvel-card p-6 sm:p-8 rounded-3xl border border-white/15 bg-[#0A0D1A]/95 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-metallic-gold tracking-widest font-mono block">
                  STEP 5 OF {eventSteps.length}: UNIFIED PAYMENT
                </span>
                <h2 className="text-2xl font-black uppercase text-white font-excon-black">
                  Tournament Payment Gateway
                </h2>
                <p className="text-xs text-white/60 font-mono">
                  Single payment transaction covering all {selectedEvents.length} selected festival missions.
                </p>
              </div>
              <span className="text-xs font-mono text-metallic-gold font-bold">
                Batch: {batchResult?.payment_batch_id || "PB-PENDING"}
              </span>
            </div>

            {/* Total Due Strip */}
            <div className="p-5 rounded-2xl bg-black/40 border border-metallic-gold/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-white/50 block">
                  Total Fee Payable (Batch)
                </span>
                <h3 className="text-2xl font-black text-metallic-gold">
                  {totalFee === 0 ? "FREE ENTRY" : `₹${totalFee.toFixed(2)}`}
                </h3>
                <p className="text-xs text-white/60">
                  Covers {soloSelected.length} Solo Event{soloSelected.length === 1 ? "" : "s"} &amp; {squadSelected.length} Squad Challenge{squadSelected.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="text-xs text-white/60 space-y-0.5 sm:text-right">
                <span className="block text-white font-bold">MACFAST Official UPI Gateway</span>
                <span className="block text-arc-cyan">macfast12230qr@fbl</span>
              </div>
            </div>

            {/* Free Pass Direct Activation */}
            {totalFee === 0 ? (
              <div className="p-6 rounded-2xl bg-metallic-gold/10 border border-metallic-gold/30 text-center space-y-4 font-mono">
                <p className="text-xs text-white/80">
                  All selected tournament missions have no entry fees. Click below to activate verified registration passes immediately.
                </p>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleBatchDirectConfirm}
                  className="px-6 py-3.5 bg-metallic-gold hover:bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg font-excon-black cursor-pointer"
                >
                  {submitting ? "Activating Passes..." : "Confirm Free Tournament Entry"}
                </button>
              </div>
            ) : (
              /* Paid Batch: UPI Submission & Instant Simulation */
              <form onSubmit={handleSubmitBatchPayment} className="space-y-5 font-mono">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* UPI QR Box */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col items-center justify-center text-center space-y-2">
                    <div className="w-36 h-36 rounded-xl bg-white p-2 flex items-center justify-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=upi://pay?pa=macfast12230qr@fbl%26pn=MACFAST%26am=${totalFee.toFixed(2)}%26cu=INR`}
                        alt="Payment QR"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-[11px] text-white/60">Scan with GPay / PhonePe / Paytm</span>
                    <span className="text-[10px] text-metallic-gold font-bold">UPI ID: macfast12230qr@fbl</span>
                    <a
                      href={buildUpiPayLink(MACFIESTA_PAYMENT, {
                        amount: totalFee,
                        note: `MacFiesta batch ${batchResult?.payment_batch_id || "payment"}`,
                      })}
                      className="w-full py-3.5 px-4 bg-metallic-gold hover:bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.35)] font-excon-black inline-flex items-center justify-center gap-2 cursor-pointer mt-1"
                    >
                      <span>Open UPI / GPay App (₹{Number(totalFee || 0).toLocaleString("en-IN")})</span>
                      <RiExternalLinkLine className="text-sm" />
                    </a>
                  </div>

                  {/* Payment Inputs */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-white uppercase">
                        UPI Transaction / UTR Ref ID <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 123456789012"
                        value={paymentForm.txn}
                        onChange={(e) => setPaymentForm({ ...paymentForm, txn: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white placeholder-white/30 text-xs focus:border-metallic-gold outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-white uppercase">
                        Payment Screenshot Proof (Optional)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPaymentForm({ ...paymentForm, proof: e.target.files[0] })}
                        className="w-full text-xs text-white/60 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20"
                      />
                    </div>

                    <div className="pt-2 space-y-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 bg-metallic-gold hover:bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg font-excon-black cursor-pointer disabled:opacity-50 text-center block"
                      >
                        {submitting ? "Submitting Payment..." : "Submit Payment & Lock All Registrations"}
                      </button>

                      {/* Direct Test Payment Simulator Button */}
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={handleBatchDirectConfirm}
                        className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black font-black text-[11px] uppercase tracking-wider rounded-xl transition-all border border-emerald-500/40 text-center block cursor-pointer"
                      >
                        ⚡ Instant Test Payment (Direct Verification)
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* STEP 6: CONFIRMED DOSSIER & DIGITAL PASSES                    */}
        {/* ───────────────────────────────────────────────────────────── */}
        {step === 6 && (
          <div className="marvel-card p-6 sm:p-8 rounded-3xl border border-metallic-gold/50 bg-[#0A0D1A]/95 shadow-[0_0_50px_rgba(212,175,55,0.2)] space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center text-3xl mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <RiCheckboxCircleLine />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase font-mono">
                REGISTRATION CONFIRMED &amp; LOCKED
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-excon-black">
                Tournament Registration Complete!
              </h2>
              <p className="text-xs text-white/60 font-mono">
                Official festival credentials and tournament passes generated for MacFiesta 2026.
              </p>
            </div>

            {/* Passes Grid */}
            <div className="space-y-3 max-w-2xl mx-auto text-left font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
                <span className="text-white/50">Batch Reference:</span>
                <span className="font-bold text-arc-cyan">
                  {batchResult?.payment_reference || batchResult?.payment_batch_id || registration?.payment_batch_id || "MCF26-BATCH"}
                </span>
              </div>

              {registrations.map((reg) => {
                const isRegSolo = reg.registration_type === "individual";
                return (
                  <div
                    key={reg.id}
                    className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${
                            isRegSolo
                              ? "bg-metallic-gold/15 text-metallic-gold border-metallic-gold/30"
                              : "bg-arc-cyan/15 text-arc-cyan border-arc-cyan/30"
                          }`}
                        >
                          {isRegSolo ? "Solo Mission" : `Squad: ${reg.team_name}`}
                        </span>
                        <span className="text-[10px] text-white/50">
                          {reg.event?.title || "MacFiesta Mission"}
                        </span>
                      </div>
                      <span className="font-bold text-white block">
                        Pass #{reg.registration_number} · {reg.participant_name}
                      </span>
                    </div>

                    <Link
                      to={`/pass/${reg.id}`}
                      className="px-4 py-2 bg-arc-cyan hover:bg-white text-black font-black text-[11px] uppercase tracking-wider rounded-xl transition-all shadow-md font-excon-black text-center shrink-0 flex items-center justify-center gap-1.5"
                    >
                      <RiTicketLine />
                      <span>View Pass</span>
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-white/10">
              <Link
                to="/student-dashboard"
                className="w-full sm:w-auto px-6 py-3.5 bg-metallic-gold hover:bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg font-excon-black text-center"
              >
                Go to Student Dashboard
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSelectedEvents([]);
                  setBatchResult(null);
                  setRegistrations([]);
                  setStep(1);
                }}
                className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all font-excon-black text-center"
              >
                Register More Missions
              </button>
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}

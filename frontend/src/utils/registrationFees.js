/**
 * Registration add-on fees + payment display.
 * Prefer live values from GET /api/public/config/ (backend/.env).
 * Fall back to VITE_* from frontend/.env when the API is unavailable.
 */

function envNum(name, fallback) {
  const raw = import.meta.env[name];
  if (raw === undefined || raw === null || String(raw).trim() === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function envStr(name, fallback = "") {
  const raw = import.meta.env[name];
  if (raw === undefined || raw === null) return fallback;
  return String(raw);
}

/** Defaults from frontend/.env (VITE_*); overwritten when public config loads. */
export const REGISTRATION_ADDONS = {
  foodPackage: envNum("VITE_FEE_FOOD_PACKAGE", 170),          // Breakfast+Lunch+Dinner = 50+70+50
  accommodationPerPerson: envNum("VITE_FEE_ACCOMMODATION", 350), // Stay without food per head/night
  transportAssist: envNum("VITE_FEE_TRANSPORT", 100),
  breakfast: envNum("VITE_FEE_BREAKFAST", 50),
  lunch: envNum("VITE_FEE_LUNCH", 70),
  dinner: envNum("VITE_FEE_DINNER", 50),
};

export const MACFIESTA_PAYMENT = {
  accountName: envStr(
    "VITE_PAYMENT_ACCOUNT_NAME",
    "MANAGER MAR ATHANASIOS COLLEGE FOR ADVANCED STUDIES TIRUVALLA"
  ),
  instructions: envStr(
    "VITE_PAYMENT_INSTRUCTIONS",
    "Pay the registration amount to the official MacFiesta account. Keep your UPI transaction reference / UTR for verification."
  ),
  upiId: envStr("VITE_PAYMENT_UPI_ID", "macfast12230qr@fbl"),
  hostelAccountName: envStr("VITE_HOSTEL_PAYMENT_ACCOUNT_NAME", "ST ALPHONSA HOSTEL"),
  hostelUpiId: envStr("VITE_HOSTEL_PAYMENT_UPI_ID", "stalphonsahostel@iob"),
  bankName: envStr("VITE_PAYMENT_BANK_NAME", ""),
  accountNumber: envStr("VITE_PAYMENT_ACCOUNT_NUMBER", ""),
  ifsc: envStr("VITE_PAYMENT_IFSC", ""),
  qrImageUrl: envStr("VITE_PAYMENT_QR_IMAGE_URL", "/event-payment-qr.jpg"),
  hostelQrImageUrl: envStr("VITE_HOSTEL_PAYMENT_QR_IMAGE_URL", "/hostel-payment-qr.jpg"),
};

export const QR_IMAGE_API_URL = envStr(
  "VITE_QR_API_URL",
  "https://api.qrserver.com/v1/create-qr-code/"
).replace(/\/?$/, "/");

const QR_IMAGE_API_URL_STATE = { url: QR_IMAGE_API_URL };

/** Apply payload from GET /api/public/config/ onto the shared objects. */
export function applyPublicFestConfig(config) {
  if (!config || typeof config !== "object") return;

  const fees = config.fees || {};
  if (fees.food_package != null) {
    REGISTRATION_ADDONS.foodPackage = Number(fees.food_package) || REGISTRATION_ADDONS.foodPackage;
  }
  if (fees.breakfast != null) {
    REGISTRATION_ADDONS.breakfast = Number(fees.breakfast) || REGISTRATION_ADDONS.breakfast;
  }
  if (fees.lunch != null) {
    REGISTRATION_ADDONS.lunch = Number(fees.lunch) || REGISTRATION_ADDONS.lunch;
  }
  if (fees.dinner != null) {
    REGISTRATION_ADDONS.dinner = Number(fees.dinner) || REGISTRATION_ADDONS.dinner;
  }
  if (fees.accommodation_per_person != null) {
    REGISTRATION_ADDONS.accommodationPerPerson =
      Number(fees.accommodation_per_person) || REGISTRATION_ADDONS.accommodationPerPerson;
  }
  if (fees.transport_assist != null) {
    REGISTRATION_ADDONS.transportAssist =
      Number(fees.transport_assist) || REGISTRATION_ADDONS.transportAssist;
  }

  const pay = config.payment || {};
  if (pay.account_name) MACFIESTA_PAYMENT.accountName = pay.account_name;
  if (pay.instructions) MACFIESTA_PAYMENT.instructions = pay.instructions;
  if (pay.upi_id != null) MACFIESTA_PAYMENT.upiId = pay.upi_id;
  if (pay.hostel_account_name) MACFIESTA_PAYMENT.hostelAccountName = pay.hostel_account_name;
  if (pay.hostel_upi_id != null) MACFIESTA_PAYMENT.hostelUpiId = pay.hostel_upi_id;
  if (pay.bank_name != null) MACFIESTA_PAYMENT.bankName = pay.bank_name;
  if (pay.account_number != null) MACFIESTA_PAYMENT.accountNumber = pay.account_number;
  if (pay.ifsc != null) MACFIESTA_PAYMENT.ifsc = pay.ifsc;
  if (pay.qr_image_url != null) MACFIESTA_PAYMENT.qrImageUrl = pay.qr_image_url;
  if (pay.hostel_qr_image_url != null) MACFIESTA_PAYMENT.hostelQrImageUrl = pay.hostel_qr_image_url;

  if (config.qr_image_api_url) {
    QR_IMAGE_API_URL_STATE.url = String(config.qr_image_api_url).replace(/\/?$/, "/");
  }
}

export function registrationQrImageUrl(data, size = 180) {
  const base = QR_IMAGE_API_URL_STATE.url || QR_IMAGE_API_URL;
  const payload = encodeURIComponent(String(data || ""));
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}size=${size}x${size}&margin=8&data=${payload}`;
}

/**
 * Build UPI deep-link so GPay/PhonePe can pre-fill amount.
 * @param {object} payment
 * @param {{ amount?: number, note?: string }} [opts]
 */
export function buildUpiPayLink(payment = MACFIESTA_PAYMENT, opts = {}) {
  const pa = (payment.upiId || "").trim();
  if (!pa) return "";
  const params = new URLSearchParams();
  params.set("pa", pa);
  params.set("pn", (payment.accountName || "MacFiesta").slice(0, 50));
  params.set("cu", "INR");
  const amount = Number(opts.amount);
  if (Number.isFinite(amount) && amount > 0) {
    params.set("am", amount.toFixed(2));
  }
  if (opts.note) params.set("tn", String(opts.note).slice(0, 80));
  return `upi://pay?${params.toString()}`;
}

/**
 * Official fest event payment QR.
 * Uses official event payment QR image.
 */
export function paymentQrImageUrl(payment = MACFIESTA_PAYMENT, size = 220, opts = {}) {
  const configured = (payment.qrImageUrl || "").trim();
  if (configured) return configured;

  const upiLink = buildUpiPayLink(payment, opts);
  if (upiLink) return registrationQrImageUrl(upiLink, size);
  return "/event-payment-qr.jpg";
}

/**
 * Dedicated hostel & accommodation payment QR.
 */
export function hostelPaymentQrImageUrl(payment = MACFIESTA_PAYMENT) {
  const configured = (payment.hostelQrImageUrl || "").trim();
  if (configured) return configured;
  return "/hostel-payment-qr.jpg";
}

/** Amount-locked QR (delegates cleanly to official QR). */
export function paymentAmountQrImageUrl(payment = MACFIESTA_PAYMENT, amount, note = "", size = 220) {
  return paymentQrImageUrl(payment, size, { amount, note });
}

export function computeRegistrationTotal({
  eventFee = 0,
  foodPreference = "none",
  needsAccommodation = false,
  accommodationCount = 1,
} = {}) {
  const event = Number(eventFee) || 0;
  const food = foodPreference && foodPreference !== "none" ? REGISTRATION_ADDONS.foodPackage : 0;
  const stayCount = Math.max(1, Number(accommodationCount) || 1);
  const accommodation = needsAccommodation
    ? REGISTRATION_ADDONS.accommodationPerPerson * stayCount
    : 0;
  const total = event + food + accommodation;
  return { event, food, accommodation, transport: 0, total };
}

/**
 * Calculate separated fees for a list of registrations (or a single registration),
 * syncing cleanly with the Checkout Payment breakdown.
 *
 * @param {Array|object} registrations
 * @param {object} [addons]
 * @returns {{
 *   eventFeeTotal: number,
 *   accommodationFeeTotal: number,
 *   foodFeeTotal: number,
 *   hospitalityTotal: number,
 *   paymentAmountTotal: number,
 *   hasAccommodation: boolean,
 * }}
 */
export function calculateBatchFees(registrations = [], addons = REGISTRATION_ADDONS) {
  const regs = Array.isArray(registrations) ? registrations : (registrations ? [registrations] : []);
  if (!regs.length) {
    return {
      eventFeeTotal: 0,
      accommodationFeeTotal: 0,
      foodFeeTotal: 0,
      hospitalityTotal: 0,
      paymentAmountTotal: 0,
      hasAccommodation: false,
    };
  }

  let eventFeeTotal = 0;
  let accommodationFeeTotal = 0;
  let foodFeeTotal = 0;
  let paymentAmountTotal = 0;
  let hasAccommodation = false;

  for (const r of regs) {
    const pAmount = Number(r.payment_amount);
    if (Number.isFinite(pAmount)) {
      paymentAmountTotal += pAmount;
    }

    // Event fee
    let evFee = null;
    if (r.event_fee != null && r.event_fee !== "") {
      evFee = Number(r.event_fee);
    } else if (r.eventData?.registration_fee != null) {
      evFee = Number(r.eventData.registration_fee);
    } else if (r.event && typeof r.event === "object" && r.event.registration_fee != null) {
      evFee = Number(r.event.registration_fee);
    }
    if (Number.isFinite(evFee)) {
      eventFeeTotal += evFee;
    }

    // Accommodation & food fee
    if (r.needs_accommodation) {
      hasAccommodation = true;
      const count = Math.max(1, Number(r.accommodation_count) || 1);

      if (r.accommodation_fee != null && r.accommodation_fee !== "") {
        accommodationFeeTotal += Number(r.accommodation_fee) || 0;
      } else {
        accommodationFeeTotal += (addons.accommodationPerPerson || 350) * count;
      }

      if (r.food_fee != null && r.food_fee !== "") {
        foodFeeTotal += Number(r.food_fee) || 0;
      } else if (r.food_preference && r.food_preference !== "none") {
        const pref = String(r.food_preference).toLowerCase();
        if (["full", "all", "veg", "non_veg", "jain", "package"].includes(pref)) {
          foodFeeTotal += (addons.foodPackage || 170) * count;
        } else {
          const meals = pref.replace(/[+;]/g, ",").split(",").map((m) => m.trim());
          let mTotal = 0;
          if (meals.includes("breakfast") || meals.includes("bf")) mTotal += (addons.breakfast || 50);
          if (meals.includes("lunch") || meals.includes("ln")) mTotal += (addons.lunch || 70);
          if (meals.includes("dinner") || meals.includes("dn")) mTotal += (addons.dinner || 50);
          foodFeeTotal += (mTotal > 0 ? mTotal : (addons.foodPackage || 170)) * count;
        }
      }
    }
  }

  const hospitalityTotal = accommodationFeeTotal + foodFeeTotal;

  // Fallback reconciliations:
  // If paymentAmountTotal was not saved on DB records, sum event + hospitality
  if (paymentAmountTotal <= 0 && (eventFeeTotal > 0 || hospitalityTotal > 0)) {
    paymentAmountTotal = eventFeeTotal + hospitalityTotal;
  }
  // If eventFeeTotal is 0 but paymentAmountTotal > hospitalityTotal, eventFee is the difference
  if (eventFeeTotal <= 0 && paymentAmountTotal > hospitalityTotal) {
    eventFeeTotal = Math.max(0, paymentAmountTotal - hospitalityTotal);
  }

  return {
    eventFeeTotal,
    accommodationFeeTotal,
    foodFeeTotal,
    hospitalityTotal,
    paymentAmountTotal,
    hasAccommodation,
  };
}

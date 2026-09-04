import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  RiHotelBedLine,
  RiMenLine,
  RiWomenLine,
  RiShieldUserLine,
  RiPhoneFill,
  RiMapPinLine,
  RiCheckLine,
  RiInformationLine,
  RiSearch2Line,
  RiCalendarCheckLine,
  RiShieldFlashLine,
  RiArrowRightLine,
  RiLockLine,
  RiQrCodeLine,
  RiCloseLine,
} from "react-icons/ri";
import { usePageSeo } from "../hooks/usePageSeo";
import { getHostels } from "../services/api";

const defaultHostelsData = [
  // MALE ACCOMMODATION
  {
    id: "st-thomas",
    name: "St. Thomas Mens Hostel",
    gender: "male",
    type: "Campus Mens Hostel",
    location: "MACFAST Main Campus Block A",
    distance: "2 min walk to Fest Arena",
    roomTypes: ["4-Sharing Dormitory", "Twin Sharing Rooms"],
    tariff: "₹350 / night (stay without food)",
    amenities: ["Free Wi-Fi", "24/7 Security & CCTV", "Hot Water", "Filter Drinking Water", "Power Backup", "Mess Breakfast Included"],
    wardenName: "Prof. Alexander Varghese",
    wardenPhone: "+91 94470 12345",
    availability: "Available",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    description: "Spacious on-campus mens hostel equipped with study tables, high-speed Wi-Fi, and round-the-clock fest security."
  },

  // FEMALE ACCOMMODATION
  {
    id: "st-teresa",
    name: "St. Teresa Ladies Hostel",
    gender: "female",
    type: "Campus Ladies Hostel",
    location: "Campus Block C (Secured Ladies Wing)",
    distance: "2 min walk to Fest Arena",
    roomTypes: ["Twin Sharing", "Triple Sharing Rooms"],
    tariff: "₹350 / night (stay without food)",
    amenities: ["Female Warden & 24/7 Security Guard", "CCTV Surveillance", "Free Wi-Fi", "Hot Water", "First Aid Desk", "Mess Breakfast Included"],
    wardenName: "Sr. Grace Mary",
    wardenPhone: "+91 94463 67890",
    availability: "Available",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    description: "Exclusive secure ladies hostel inside MACFAST campus with female wardens, biometric entry, and clean dining facilities."
  },
  {
    id: "st-alphonsa",
    name: "St. Alphonsa Ladies Hostel",
    gender: "female",
    type: "Campus Annex Ladies Hostel",
    location: "South Gate Residency Wing",
    distance: "3 min walk to Fest Arena",
    roomTypes: ["4-Sharing Spacious Rooms", "Dormitory Hall"],
    tariff: "₹350 / night (stay without food)",
    amenities: ["Female Warden On-Duty", "Hot Water", "Free Wi-Fi", "Common Lounge", "Mess Meals", "Emergency Support"],
    wardenName: "Ms. Anitha John",
    wardenPhone: "+91 98472 11223",
    availability: "Available",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    description: "Comfortable and safe ladies hostel featuring attached washrooms, cozy beds, and dedicated festival support staff."
  }
];

export default function Accommodation() {
  usePageSeo({
    title: "Festival Accommodation · MacFiesta 2026",
    description: "Verified on-campus hostels and quarters for delegates and participants.",
  });

  const [hostelsList, setHostelsList] = useState(defaultHostelsData);
  const [selectedGender, setSelectedGender] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    getHostels()
      .then((res) => {
        if (!mounted) return;
        if (Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.map((h) => ({
            id: h.id,
            name: h.name,
            gender: h.gender,
            type: h.hostel_type,
            location: h.location,
            distance: h.distance,
            roomTypes: h.room_types ? h.room_types.split(", ") : ["Dormitory", "Twin Sharing"],
            tariff: `₹${Number(h.tariff_per_night || 350)} / night (stay without food)`,
            amenities: h.amenities_list || (h.amenities ? h.amenities.split(", ") : []),
            wardenName: h.warden_name,
            wardenPhone: h.warden_phone,
            availability: h.available_beds > 0 ? "Available" : "Full",
            badgeColor: h.available_beds > 0 ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-red-500/20 text-red-400 border-red-500/30",
            description: h.description,
          }));
          setHostelsList(mapped);
        }
      })
      .catch(() => {
        // Fallback to default
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filteredHostels = hostelsList.filter(hostel => {
    const matchGender = selectedGender === "all" || hostel.gender === selectedGender || hostel.gender === "all";
    const matchSearch = hostel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hostel.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hostel.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchGender && matchSearch;
  });

  return (
    <div className="bg-[#05050A] min-h-screen pt-28 pb-16 text-white font-excon relative overflow-hidden">
      {/* Background Marvel Image Backdrop */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/MARVEL/wolverine.jpg"
          alt="Accommodation Quarters Backdrop"
          className="w-full h-full object-cover object-center opacity-85 contrast-[1.05] saturate-[1.1] brightness-[0.92]"
        />
        {/* Subtle cinematic gradient to preserve cards readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#05050A]/40 via-black/25 to-[#05050A]/85 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(5,5,10,0.6)_100%)] pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12 relative z-10">

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)]">
            <RiShieldFlashLine className="animate-pulse text-metallic-gold" />
            <span>S.H.I.E.L.D. HOSPITALITY &amp; QUARTERS</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white font-excon-black">
            <span className="shimmer-text">FESTIVAL</span>{" "}
            <span className="gradient-text-gold">ACCOMMODATION</span>
          </h1>

          <p className="text-white/80 text-xs sm:text-sm font-excon font-normal">
            Safe, hygienic on-campus hostel residency options for delegates, participants, and faculty advisors.
          </p>
        </div>

        {/* Mandatory Policy Banner — Reservation Available Only At Checkout */}
        <div className="glass-aurora p-5 sm:p-7 rounded-3xl border border-metallic-gold/40 bg-gradient-to-r from-metallic-gold/15 via-black/70 to-arc-cyan/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-[0_0_35px_rgba(212,175,55,0.2)]">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-metallic-gold/20 text-metallic-gold rounded-2xl text-2xl sm:text-3xl border border-metallic-gold/40 shrink-0 shadow-[0_0_15px_rgba(255,215,0,0.3)]">
              <RiHotelBedLine />
            </div>
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-metallic-gold/20 text-metallic-gold text-[10px] font-black uppercase tracking-wider border border-metallic-gold/30">
                <RiLockLine />
                <span>OFFICIAL RESERVATION POLICY</span>
              </div>
              <h3 className="font-black text-white uppercase tracking-wider font-excon-black text-base sm:text-xl">
                Accommodation Is Reserved Strictly During Checkout
              </h3>
              <p className="text-white/75 font-mono text-xs sm:text-sm leading-relaxed max-w-2xl">
                To guarantee confirmed bed allocation and seamless delegate pass verification, hostel accommodation bookings can only be requested and finalized together with your event registrations during <strong>Checkout</strong>.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 font-excon-bold cursor-pointer"
            >
              <RiQrCodeLine className="text-base text-arc-cyan" />
              <span>Hostel Payment QR</span>
            </button>
            <Link
              to="/checkout?accommodation=true"
              className="px-6 py-3.5 bg-metallic-gold hover:bg-white text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,215,0,0.4)] font-excon-black group"
            >
              <RiCalendarCheckLine className="text-base" />
              <span>Book At Checkout</span>
              <RiArrowRightLine className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Filter Controls Panel */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Gender Filter Buttons */}
          <div className="flex bg-black/40 p-1.5 rounded-full border border-white/15 backdrop-blur-xl w-full md:w-auto shadow-lg">
            <button
              type="button"
              onClick={() => setSelectedGender("all")}
              className={`flex-1 md:flex-none px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all font-excon-bold ${selectedGender === "all"
                ? "bg-marvel-red text-white shadow-[0_0_15px_#ED1D24]"
                : "text-white/60 hover:text-white"
                }`}
            >
              All Quarters
            </button>

            <button
              type="button"
              onClick={() => setSelectedGender("male")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all font-excon-bold ${selectedGender === "male"
                ? "bg-arc-cyan text-black shadow-[0_0_15px_#00D4FF]"
                : "text-white/60 hover:text-white"
                }`}
            >
              <RiMenLine />
              <span>Mens Hostels</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedGender("female")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all font-excon-bold ${selectedGender === "female"
                ? "bg-metallic-gold text-black shadow-[0_0_15px_#FFD700]"
                : "text-white/60 hover:text-white"
                }`}
            >
              <RiWomenLine />
              <span>Ladies Hostels</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <RiSearch2Line className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50 text-base" />
            <input
              type="text"
              placeholder="Search hostel names, blocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/[0.06] border border-white/15 rounded-full text-xs text-white placeholder-white/40 focus:outline-none focus:border-arc-cyan transition-colors font-excon backdrop-blur-xl"
            />
          </div>
        </div>

        {/* Hostels List Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredHostels.map((hostel) => (
            <div
              key={hostel.id}
              className="group rounded-3xl border border-white/15 hover:border-arc-cyan/60 transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-[0_10px_35px_rgba(0,0,0,0.5)] hover:shadow-[0_0_35px_rgba(0,212,255,0.25)] bg-white/[0.04] hover:bg-white/[0.07] backdrop-blur-xl ring-1 ring-white/10 font-excon"
            >
              <div className="space-y-4">

                {/* Header with Gender Icon and Availability */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-base border ${hostel.gender === "male"
                      ? "bg-arc-cyan/15 text-arc-cyan border-arc-cyan/30 shadow-[0_0_10px_rgba(0,212,255,0.2)]"
                      : "bg-metallic-gold/15 text-metallic-gold border-metallic-gold/30 shadow-[0_0_10px_rgba(255,215,0,0.2)]"
                      }`}>
                      {hostel.gender === "male" ? <RiMenLine /> : <RiWomenLine />}
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-white/60 font-excon-bold">
                      {hostel.type}
                    </span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border font-excon-black backdrop-blur-sm ${hostel.badgeColor}`}>
                    {hostel.availability}
                  </span>
                </div>

                {/* Name and Tariff */}
                <div>
                  <h3 className="text-xl font-black text-white group-hover:text-arc-cyan transition-colors uppercase tracking-tight font-excon-black drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                    {hostel.name}
                  </h3>
                  <p className="text-xs text-white/70 flex items-center gap-1 mt-1 font-medium">
                    <RiMapPinLine className="text-marvel-red shrink-0" />
                    <span>{hostel.location} ({hostel.distance})</span>
                  </p>
                </div>

                {/* Tariff Highlight Badge */}
                <div className="p-3 bg-black/25 border border-white/10 rounded-2xl flex items-center justify-between backdrop-blur-sm shadow-inner">
                  <span className="text-[11px] text-white/60 uppercase font-bold tracking-wider font-excon-bold">
                    Tariff / Person
                  </span>
                  <span className="text-base font-black text-metallic-gold font-excon-black drop-shadow-[0_0_10px_rgba(255,215,0,0.3)]">
                    {hostel.tariff}
                  </span>
                </div>

                <p className="text-xs text-white/80 leading-relaxed font-normal">
                  {hostel.description}
                </p>

                {/* Amenities List */}
                <div className="space-y-2">
                  <span className="block text-[10px] text-white/50 uppercase font-bold tracking-widest font-excon-bold">
                    Key Facilities
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] text-white/80">
                    {hostel.amenities.map((amenity, i) => (
                      <div key={i} className="flex items-center gap-1.5 truncate">
                        <RiCheckLine className="text-arc-cyan shrink-0 text-xs" />
                        <span className="truncate">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Warden In-Charge */}
                <div className="pt-2.5 border-t border-white/10 text-xs text-white/70 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <RiShieldUserLine className="text-metallic-gold shrink-0" />
                    <span>Warden: <strong className="text-white font-excon-bold">{hostel.wardenName}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons — Direct to Checkout */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to={`/checkout?accommodation=true&hostel=${encodeURIComponent(hostel.name)}`}
                  className="w-full py-2.5 bg-arc-cyan hover:bg-white text-black font-black text-[11px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,212,255,0.4)] hover:shadow-[0_0_25px_rgba(0,212,255,0.7)] font-excon-black text-center"
                >
                  <RiHotelBedLine className="text-sm" />
                  <span>Reserve In Checkout</span>
                </Link>

                <a
                  href={`tel:${hostel.wardenPhone}`}
                  className="w-full py-2.5 bg-black/30 hover:bg-black/50 border border-white/15 hover:border-white/40 text-white font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 font-excon-bold backdrop-blur-sm"
                >
                  <RiPhoneFill className="text-sm text-marvel-red" />
                  <span>Call Warden</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Stay Guidelines */}
        <div className="glass-aurora p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
          <h4 className="text-base font-black uppercase text-white font-excon-black flex items-center gap-2">
            <RiInformationLine className="text-arc-cyan text-lg" />
            <span>Important Stay Guidelines &amp; Policies</span>
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-white/70 font-mono">
            <li className="flex items-start gap-2">
              <span className="text-metallic-gold">★</span>
              <span>Check-in opens at <strong>7:00 AM on 24 September 2026</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-metallic-gold">★</span>
              <span>College ID card &amp; Fest Registration Pass are mandatory at hostel gate.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-metallic-gold">★</span>
              <span>Hostel bed allocations are non-transferable and subject to campus code of conduct.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-metallic-gold">★</span>
              <span>Nominal stay charges are finalized directly during event checkout.</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Hostel Payment QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0A0D1A] border-2 border-arc-cyan/40 w-full max-w-sm rounded-3xl p-6 relative space-y-5 shadow-2xl text-center font-excon">
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <RiCloseLine size={20} />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-arc-cyan uppercase tracking-widest font-bold">
                S.H.I.E.L.D. QUARTERS PAYMENT
              </span>
              <h3 className="text-xl font-black text-white uppercase font-excon-black">
                Hostel Payment QR
              </h3>
              <p className="text-xs text-white/70">
                Official UPI QR for delegate hostel &amp; accommodation stay.
              </p>
            </div>

            <div className="p-3 bg-white rounded-2xl shadow-[0_0_25px_rgba(0,212,255,0.25)] border-2 border-arc-cyan/40 inline-block">
              <img
                src="/hostel-payment-qr.jpg"
                alt="Hostel & Accommodation Payment QR"
                className="w-56 h-56 object-contain block mx-auto"
              />
            </div>

            <div className="p-3 rounded-2xl bg-black/50 border border-white/10 text-xs text-left font-space space-y-1">
              <div className="flex justify-between items-start gap-2">
                <span className="text-white/50 shrink-0">Beneficiary:</span>
                <span className="text-white font-bold text-right">ST ALPHONSA HOSTEL</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-white/50">UPI ID:</span>
                <span className="text-arc-cyan font-mono font-bold">stalphonsahostel@iob</span>
              </div>
            </div>

            <p className="text-[11px] text-white/60 font-space leading-relaxed">
              Scan with Google Pay, PhonePe, Paytm, or any BHIM UPI app. Keep your transaction reference / screenshot for hostel gate check-in.
            </p>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-3 bg-arc-cyan hover:bg-white text-black font-black text-xs uppercase tracking-wider rounded-xl font-excon-black transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

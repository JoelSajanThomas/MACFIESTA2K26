"use client";

import { useState } from "react";
import {
  RiQrCodeLine,
  RiCheckDoubleLine,
  RiPieChartLine,
  RiCoupon3Line,
  RiUserHeartLine,
  RiStore2Line,
} from "react-icons/ri";

interface FoodCouponRecord {
  id: string;
  counter: "veg" | "non-veg";
  delegateName: string;
  ticketPass: string;
  mealType: "Breakfast" | "Lunch" | "Dinner";
  status: "REDEEMED" | "AVAILABLE";
  redeemedTime?: string;
}

export function FoodManagement() {
  const [activeCounter, setActiveCounter] = useState<"veg" | "non-veg">("veg");
  const [activeMeal, setActiveMeal] = useState<"Breakfast" | "Lunch" | "Dinner">("Lunch");
  const [scanCode, setScanCode] = useState("");
  const [lastRedeemed, setLastRedeemed] = useState<any>(null);

  const [coupons, setCoupons] = useState<FoodCouponRecord[]>([
    { id: "fc-1", counter: "veg", delegateName: "Rahul Varma", ticketPass: "MF-2K26-PASS-101", mealType: "Lunch", status: "REDEEMED", redeemedTime: "12:45 PM" },
    { id: "fc-2", counter: "non-veg", delegateName: "Ananya Sharma", ticketPass: "MF-2K26-PASS-102", mealType: "Lunch", status: "AVAILABLE" },
    { id: "fc-3", counter: "veg", delegateName: "Dr. Thomas V.", ticketPass: "MF-2K26-PASS-103", mealType: "Lunch", status: "REDEEMED", redeemedTime: "01:10 PM" },
    { id: "fc-4", counter: "non-veg", delegateName: "Mathew Joseph", ticketPass: "MF-2K26-PASS-104", mealType: "Dinner", status: "AVAILABLE" },
  ]);

  const handleVerifyCoupon = () => {
    if (!scanCode.trim()) return;
    setLastRedeemed({
      code: scanCode.toUpperCase(),
      delegate: "Verified Delegate User",
      counter: activeCounter.toUpperCase(),
      meal: activeMeal,
      status: "VALID & REDEEMED",
      time: new Date().toLocaleTimeString(),
    });
    setScanCode("");
  };

  const filteredCoupons = coupons.filter(
    (c) => c.counter === activeCounter && c.mealType === activeMeal
  );

  return (
    <div className="space-y-6 select-none">
      {/* Top Banner & Dual Counter Switcher */}
      <div className="glass p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <RiCoupon3Line className="text-festival-gold text-lg" />
            <span>Food & Catering Counter Management</span>
          </h2>
          <p className="text-xs text-white/40">Separate QR scanning counters for Vegetarian & Non-Vegetarian delegate meal passes</p>
        </div>

        {/* Counter Selection */}
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveCounter("veg")}
            className={`px-4 py-2 rounded-lg font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeCounter === "veg"
                ? "bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            🥗 Vegetarian Counter
          </button>
          <button
            onClick={() => setActiveCounter("non-veg")}
            className={`px-4 py-2 rounded-lg font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeCounter === "non-veg"
                ? "bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            🍗 Non-Vegetarian Counter
          </button>
        </div>
      </div>

      {/* Meal Selection Bar */}
      <div className="flex items-center justify-between glass p-3 rounded-2xl border border-white/10 text-xs">
        <div className="flex items-center gap-2">
          {(["Breakfast", "Lunch", "Dinner"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setActiveMeal(m)}
              className={`px-4 py-1.5 rounded-xl font-extrabold uppercase text-[10px] tracking-wider cursor-pointer ${
                activeMeal === m ? "bg-festival-gold text-festival-dark" : "bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              {m} Meal
            </button>
          ))}
        </div>
        <span className="text-[10px] font-bold text-white/40 uppercase font-mono">
          Counter Active: {activeCounter.toUpperCase()} ({activeMeal.toUpperCase()})
        </span>
      </div>

      {/* QR Coupon Scanner Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">
            Scan & Validate Meal Pass QR Code
          </h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={scanCode}
              onChange={(e) => setScanCode(e.target.value)}
              placeholder="Scan or enter Pass Code (e.g. MF-2K26-PASS-101)"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-festival-gold font-mono uppercase"
            />
            <button
              onClick={handleVerifyCoupon}
              className="btn-primary text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer font-bold shrink-0"
            >
              <RiQrCodeLine size={16} /> Redeem Meal
            </button>
          </div>

          {lastRedeemed && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1">
              <div className="flex items-center justify-between text-emerald-400 font-extrabold">
                <span className="flex items-center gap-1">
                  <RiCheckDoubleLine size={16} /> {lastRedeemed.status}
                </span>
                <span className="font-mono text-[10px]">{lastRedeemed.time}</span>
              </div>
              <p className="text-white font-bold">{lastRedeemed.delegate}</p>
              <p className="text-white/60">{lastRedeemed.counter} COUNTER • {lastRedeemed.meal}</p>
            </div>
          )}
        </div>

        {/* Catering Vendor Telemetry */}
        <div className="glass p-6 rounded-2xl border border-white/10 space-y-4 flex flex-col justify-between text-xs">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2 flex items-center gap-2">
              <RiStore2Line className="text-festival-gold" /> Catering Vendor Status
            </h3>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                <span className="text-white/60">Vendor Name</span>
                <span className="font-bold text-white">MACFAST Central Dining</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                <span className="text-white/60">Total Meals Prepared</span>
                <span className="font-bold text-emerald-400">1,200 Plates</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                <span className="text-white/60">Redeemed Coupons</span>
                <span className="font-bold text-cyan-400">640 Plates (53.3%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

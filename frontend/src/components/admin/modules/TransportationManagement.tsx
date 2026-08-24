"use client";

import { useState } from "react";
import {
  RiBus2Line,
  RiMapPinLine,
  RiPhoneLine,
  RiUserHeartLine,
  RiAddLine,
  RiCheckLine,
  RiDeleteBinLine,
} from "react-icons/ri";

export function TransportationManagement() {
  const [activeTab, setActiveTab] = useState<"buses" | "routes" | "passengers">("buses");

  const [buses, setBuses] = useState([
    {
      id: "bus-1",
      vehicleNo: "KL-27-E-4090",
      driverName: "Soman Pillai",
      driverPhone: "+91 94470 12345",
      route: "Tiruvalla Railway Station ⇄ MACFAST Campus",
      capacity: 40,
      assignedPass: 32,
      status: "ON ROUTE",
    },
    {
      id: "bus-2",
      vehicleNo: "KL-03-AB-1122",
      driverName: "Varghese K.",
      driverPhone: "+91 94470 67890",
      route: "KSRTC Bus Stand ⇄ MACFAST Campus",
      capacity: 35,
      assignedPass: 28,
      status: "STANDBY",
    },
  ]);

  const [routes, setRoutes] = useState([
    { id: "rt-1", name: "Tiruvalla Railway Station Express", pickup: "Platform 1 Foyer", drop: "Main Gate MACFAST", freq: "Every 20 mins" },
    { id: "rt-2", name: "Chengannur Railway Station Shuttle", pickup: "Main Entry Exit", drop: "Main Gate MACFAST", freq: "Every 45 mins" },
  ]);

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="glass p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <RiBus2Line className="text-festival-gold text-lg" />
            <span>Transportation Fleet & Shuttle Management</span>
          </h2>
          <p className="text-xs text-white/40">Manage shuttle buses, driver contacts, pickup/drop locations, and passenger manifests</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
          {[
            { id: "buses", label: "Bus Fleet" },
            { id: "routes", label: "Pickup Routes" },
            { id: "passengers", label: "Passenger Roster" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3.5 py-1.5 rounded-lg font-bold uppercase text-[10px] tracking-wider cursor-pointer ${
                activeTab === t.id ? "bg-festival-gold text-festival-dark" : "bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Buses Fleet View */}
      {activeTab === "buses" && (
        <div className="glass p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Assigned Shuttle Bus Fleet & Drivers
            </h3>
            <button
              onClick={() => {
                const reg = prompt("Vehicle Registration # (e.g. KL-27-E-1000):");
                const driver = prompt("Driver Name:");
                if (reg && driver) {
                  setBuses([
                    ...buses,
                    {
                      id: `bus-${Date.now()}`,
                      vehicleNo: reg,
                      driverName: driver,
                      driverPhone: "+91 98000 00000",
                      route: "Tiruvalla Local Shuttle",
                      capacity: 35,
                      assignedPass: 0,
                      status: "STANDBY",
                    },
                  ]);
                }
              }}
              className="btn-primary text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-xl cursor-pointer"
            >
              <RiAddLine size={16} /> Add Vehicle
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {buses.map((b) => (
              <div key={b.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-festival-gold uppercase bg-festival-gold/10 px-2 py-0.5 rounded border border-festival-gold/30">
                    {b.vehicleNo}
                  </span>
                  <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                    b.status === "ON ROUTE" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse" : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  }`}>
                    {b.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-white font-bold">{b.route}</p>
                  <p className="text-white/60 flex items-center gap-1">
                    <RiPhoneLine size={12} className="text-emerald-400" /> Driver: {b.driverName} ({b.driverPhone})
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                  <span className="text-white/40">Occupancy: {b.assignedPass} / {b.capacity} Passengers</span>
                  <button
                    onClick={() => setBuses(buses.filter((item) => item.id !== b.id))}
                    className="text-rose-400 hover:text-rose-300 cursor-pointer"
                  >
                    <RiDeleteBinLine size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Routes View */}
      {activeTab === "routes" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {routes.map((r) => (
            <div key={r.id} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <h4 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                <RiMapPinLine className="text-festival-gold" /> {r.name}
              </h4>
              <p className="text-white/60">Pickup: {r.pickup}</p>
              <p className="text-white/60">Drop: {r.drop}</p>
              <span className="text-[9px] font-mono text-cyan-400 font-bold">Frequency: {r.freq}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

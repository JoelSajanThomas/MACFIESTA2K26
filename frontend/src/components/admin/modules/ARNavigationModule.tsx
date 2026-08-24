"use client";

import { useState } from "react";
import { DataTable, Column } from "../shared/DataTable";
import {
  RiCompass3Line,
  RiAddLine,
  RiDeleteBinLine,
  RiMapPinRangeLine,
  RiBuilding2Line,
} from "react-icons/ri";

interface ARLocationRecord {
  _id: string;
  building: string;
  floor: string;
  room: string;
  type: string;
}

interface ARNavigationModuleProps {
  arLocations: ARLocationRecord[];
  onAddLocation: (data: { building: string; floor: string; room: string; type: string }) => void;
  onDeleteLocation: (id: string) => void;
  onRefresh?: () => void;
}

export function ARNavigationModule({
  arLocations,
  onAddLocation,
  onDeleteLocation,
  onRefresh,
}: ARNavigationModuleProps) {
  const [building, setBuilding] = useState("Main Academic Block");
  const [floor, setFloor] = useState("Ground Floor");
  const [room, setRoom] = useState("");
  const [type, setType] = useState("POI");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!room) return;
    onAddLocation({ building, floor, room, type });
    setRoom("");
  };

  const columns: Column<ARLocationRecord>[] = [
    {
      key: "building",
      header: "Building / Campus Zone",
      render: (row) => (
        <div className="flex items-center gap-2">
          <RiBuilding2Line className="text-festival-gold text-base" />
          <span className="font-bold text-white text-xs">{row.building}</span>
        </div>
      ),
    },
    {
      key: "floor",
      header: "Floor Level",
      render: (row) => <span className="text-xs text-white/80">{row.floor}</span>,
    },
    {
      key: "room",
      header: "Room / Event Hall",
      render: (row) => (
        <span className="font-bold text-festival-gold text-xs">{row.room}</span>
      ),
    },
    {
      key: "type",
      header: "AR Anchor Type",
      render: (row) => (
        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          {row.type}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
            <RiCompass3Line className="text-festival-gold" />
            <span>Augmented Reality (AR) Wayfinding & POI Manager</span>
          </h3>
          <p className="text-xs text-white/40">Configure camera anchor points and spatial coordinates for mobile AR festival guidance</p>
        </div>
      </div>

      {/* Add AR Point Form */}
      <form onSubmit={handleSubmit} className="glass p-6 rounded-2xl border border-white/10 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-[10px] uppercase font-bold text-white/40 mb-1.5">Building Block</label>
          <input
            type="text"
            required
            value={building}
            onChange={(e) => setBuilding(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:border-festival-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase font-bold text-white/40 mb-1.5">Floor Level</label>
          <input
            type="text"
            required
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:border-festival-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase font-bold text-white/40 mb-1.5">Room / Destination</label>
          <input
            type="text"
            required
            placeholder="Main Stage, Seminar Hall 2..."
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:border-festival-gold focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-[10px] uppercase font-bold text-white/40 mb-1.5">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/10 rounded-xl text-white text-xs font-semibold focus:border-festival-gold focus:outline-none"
            >
              <option value="POI">Point of Interest</option>
              <option value="Anchor">Capacitor Waypoint</option>
            </select>
          </div>
          <button type="submit" className="btn-primary text-xs px-4 h-[42px] shrink-0 cursor-pointer shadow-lg flex items-center justify-center">
            <RiAddLine size={18} />
          </button>
        </div>
      </form>

      {/* AR POI Data Table */}
      <DataTable
        title="Configured AR Waypoint Anchors"
        columns={columns}
        data={arLocations}
        searchKey="room"
        searchPlaceholder="Search POI room, building, or type..."
        onRefresh={onRefresh}
        exportFileName="macfiesta_ar_waypoints"
        actions={(row) => (
          <button
            onClick={() => onDeleteLocation(row._id)}
            className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs cursor-pointer ml-auto block"
            title="Delete Waypoint"
          >
            <RiDeleteBinLine size={14} />
          </button>
        )}
      />
    </div>
  );
}

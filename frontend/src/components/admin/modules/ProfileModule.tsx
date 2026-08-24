"use client";

import { useState } from "react";
import {
  RiUser3Line,
  RiShieldLine,
  RiHistoryLine,
  RiEditLine,
  RiSaveLine,
  RiEyeLine,
  RiEyeOffLine,
  RiCheckLine,
  RiKeyLine,
} from "react-icons/ri";

const ACTIVITY_LOG = [
  { action: "Approved registration #R-1042", time: "10 min ago", type: "success" },
  { action: "Published results for Battle of Bands", time: "45 min ago", type: "success" },
  { action: "Sent emergency announcement", time: "1h ago", type: "warning" },
  { action: "Deleted duplicate registration #R-0987", time: "2h ago", type: "danger" },
  { action: "Updated festival schedule – Day 2", time: "3h ago", type: "info" },
  { action: "Exported finance report (PDF)", time: "5h ago", type: "info" },
];

export function ProfileModule() {
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("Administrator");
  const [email, setEmail] = useState("admin@macfast.org");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setEditMode(false);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-lg font-black text-white tracking-tight">My Profile</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Manage your account, security, and activity</p>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-3">
          <RiUser3Line size={15} className="text-[#F5B301]" />
          <h2 className="text-[12px] font-extrabold text-white uppercase tracking-wider">Account Details</h2>
          {saved && (
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold ml-auto">
              <RiCheckLine size={13} /> Saved
            </span>
          )}
        </div>

        <div className="p-6 space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F5B301] to-amber-600 flex items-center justify-center text-zinc-950 font-black text-xl shadow-xl shadow-amber-500/20">
              A
            </div>
            <div>
              <p className="text-[15px] font-black text-white">{name}</p>
              <p className="text-[12px] text-zinc-400 mt-0.5">{email}</p>
              <span className="inline-block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#F5B301]/15 text-[#F5B301] border border-[#F5B301]/25">
                Super Admin
              </span>
            </div>
            <button
              onClick={() => setEditMode(!editMode)}
              className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-semibold transition-all cursor-pointer"
            >
              <RiEditLine size={14} /> {editMode ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Full Name", value: name, setter: setName },
              { label: "Email Address", value: email, setter: setEmail },
              { label: "Phone Number", value: phone, setter: setPhone },
            ].map(({ label, value, setter }) => (
              <div key={label}>
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1.5">{label}</label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  disabled={!editMode}
                  className={`w-full px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all focus:outline-none ${
                    editMode
                      ? "bg-zinc-800 border border-zinc-700 text-white focus:border-[#F5B301]/50 focus:ring-1 focus:ring-[#F5B301]/20"
                      : "bg-zinc-900/50 border border-zinc-800 text-zinc-300 cursor-default"
                  }`}
                />
              </div>
            ))}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1.5">Role</label>
              <div className="px-3 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800 text-[13px] font-semibold text-[#F5B301]">
                Super Admin
              </div>
            </div>
          </div>

          {editMode && (
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F5B301] hover:bg-amber-300 text-zinc-950 font-bold text-[13px] transition-all cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <RiSaveLine size={15} /> Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Security */}
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-3">
          <RiShieldLine size={15} className="text-[#F5B301]" />
          <h2 className="text-[12px] font-extrabold text-white uppercase tracking-wider">Security</h2>
        </div>
        <div className="p-6 space-y-4">
          {/* Change Password */}
          <div className="space-y-3">
            <p className="text-[12px] font-semibold text-zinc-300 flex items-center gap-2">
              <RiKeyLine size={14} className="text-[#F5B301]" /> Change Password
            </p>
            {["Current Password", "New Password", "Confirm New Password"].map((label) => (
              <div key={label} className="relative">
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1.5">{label}</label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 pr-10 rounded-xl bg-zinc-800 border border-zinc-700 text-[13px] text-white focus:outline-none focus:border-[#F5B301]/50"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[calc(50%+10px)] -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  {showPassword ? <RiEyeOffLine size={15} /> : <RiEyeLine size={15} />}
                </button>
              </div>
            ))}
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-semibold transition-all cursor-pointer">
              Update Password
            </button>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-3">
          <RiHistoryLine size={15} className="text-[#F5B301]" />
          <h2 className="text-[12px] font-extrabold text-white uppercase tracking-wider">Recent Activity</h2>
        </div>
        <div className="divide-y divide-zinc-800/60">
          {ACTIVITY_LOG.map((log, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-3">
              <div className={`w-2 h-2 rounded-full shrink-0 ${
                log.type === "success" ? "bg-emerald-400"
                : log.type === "warning" ? "bg-amber-400"
                : log.type === "danger" ? "bg-red-400"
                : "bg-blue-400"
              }`} />
              <p className="flex-1 text-[12px] text-zinc-300 font-medium">{log.action}</p>
              <span className="text-[10px] text-zinc-600 font-mono shrink-0">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

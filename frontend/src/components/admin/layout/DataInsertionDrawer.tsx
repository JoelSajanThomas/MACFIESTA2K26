"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCloseLine,
  RiAddLine,
  RiCheckLine,
  RiCalendarEventLine,
  RiUserAddLine,
  RiUserHeartLine,
  RiTrophyLine,
  RiMegaphoneLine,
  RiHotelBedLine,
  RiRefund2Line,
} from "react-icons/ri";

export type InsertionType =
  | "create-event"
  | "register-participant"
  | "add-volunteer"
  | "publish-result"
  | "send-announcement"
  | "allocate-hostel"
  | "issue-refund"
  | null;

interface DataInsertionDrawerProps {
  isOpen: boolean;
  type: InsertionType;
  onClose: () => void;
  onSubmitSuccess?: (msg: string) => void;
}

export function DataInsertionDrawer({
  isOpen,
  type,
  onClose,
  onSubmitSuccess,
}: DataInsertionDrawerProps) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleInputChange = (field: string, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      const labels: Record<string, string> = {
        "create-event": `✓ Event "${formData.eventTitle || "New Event"}" created successfully!`,
        "register-participant": `✓ Participant "${formData.fullName || "New Participant"}" registered! QR Pass sent.`,
        "add-volunteer": `✓ Volunteer "${formData.volunteerName || "Volunteer"}" assigned to shift.`,
        "publish-result": `✓ Event result published successfully!`,
        "send-announcement": `✓ Announcement broadcasted instantly.`,
        "allocate-hostel": `✓ Room "${formData.roomNumber || "101"}" allocated.`,
        "issue-refund": `✓ Refund of ₹${formData.refundAmount || "0"} processed.`,
      };

      onSubmitSuccess?.(labels[type || ""] || "✓ Data inserted successfully!");
      setFormData({});
      onClose();
    }, 600);
  };

  const getHeader = () => {
    switch (type) {
      case "create-event":
        return { title: "Create New Event", icon: RiCalendarEventLine, color: "text-amber-400" };
      case "register-participant":
        return { title: "Spot / New Registration", icon: RiUserAddLine, color: "text-emerald-400" };
      case "add-volunteer":
        return { title: "Assign New Volunteer", icon: RiUserHeartLine, color: "text-pink-400" };
      case "publish-result":
        return { title: "Publish Event Result", icon: RiTrophyLine, color: "text-purple-400" };
      case "send-announcement":
        return { title: "Broadcast Announcement", icon: RiMegaphoneLine, color: "text-cyan-400" };
      case "allocate-hostel":
        return { title: "Allocate Hostel Room", icon: RiHotelBedLine, color: "text-rose-400" };
      case "issue-refund":
        return { title: "Process Refund Request", icon: RiRefund2Line, color: "text-orange-400" };
      default:
        return { title: "Insert Data", icon: RiAddLine, color: "text-amber-400" };
    }
  };

  const header = getHeader();
  const HeaderIcon = header.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Slide-over Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="w-screen max-w-md bg-[#111113] border-l border-white/[0.08] shadow-2xl flex flex-col z-10"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/[0.06] flex items-center justify-between bg-[#0c0c0e]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                    <HeaderIcon size={18} className={header.color} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">{header.title}</h2>
                    <p className="text-[10px] text-zinc-500">Insert data into MacFiesta Pro ERP</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
                >
                  <RiCloseLine size={18} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4 text-[12px]">
                {/* CREATE EVENT */}
                {type === "create-event" && (
                  <>
                    <div>
                      <label className="block text-zinc-400 font-medium mb-1">Event Title *</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. CodeStorm Hackathon"
                        onChange={(e) => handleInputChange("eventTitle", e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/40"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-zinc-400 font-medium mb-1">Category</label>
                        <select
                          onChange={(e) => handleInputChange("category", e.target.value)}
                          className="w-full bg-[#141417] border border-white/[0.06] rounded-lg px-3 py-2 text-white focus:outline-none"
                        >
                          <option value="technical">Technical</option>
                          <option value="cultural">Cultural</option>
                          <option value="gaming">Gaming</option>
                          <option value="sports">Sports</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-zinc-400 font-medium mb-1">Venue</label>
                        <input
                          type="text"
                          placeholder="Main Auditorium"
                          onChange={(e) => handleInputChange("venue", e.target.value)}
                          className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-white focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-zinc-400 font-medium mb-1">Prize Pool (₹)</label>
                        <input
                          type="number"
                          placeholder="25000"
                          onChange={(e) => handleInputChange("prizePool", e.target.value)}
                          className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 font-medium mb-1">Total Seats</label>
                        <input
                          type="number"
                          placeholder="50"
                          onChange={(e) => handleInputChange("totalSeats", e.target.value)}
                          className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* REGISTER PARTICIPANT */}
                {type === "register-participant" && (
                  <>
                    <div>
                      <label className="block text-zinc-400 font-medium mb-1">Full Name *</label>
                      <input
                        required
                        type="text"
                        placeholder="John Doe"
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 font-medium mb-1">Email Address (for QR Pass) *</label>
                      <input
                        required
                        type="email"
                        placeholder="john@college.edu"
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-white focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-zinc-400 font-medium mb-1">College Name</label>
                        <input
                          type="text"
                          placeholder="MACFAST"
                          onChange={(e) => handleInputChange("college", e.target.value)}
                          className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 font-medium mb-1">Payment Method</label>
                        <select
                          onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
                          className="w-full bg-[#141417] border border-white/[0.06] rounded-lg px-3 py-2 text-white focus:outline-none"
                        >
                          <option value="upi">UPI / Online</option>
                          <option value="cash">Spot Cash</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* ADD VOLUNTEER */}
                {type === "add-volunteer" && (
                  <>
                    <div>
                      <label className="block text-zinc-400 font-medium mb-1">Volunteer Name *</label>
                      <input
                        required
                        type="text"
                        placeholder="Alex Morgan"
                        onChange={(e) => handleInputChange("volunteerName", e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-white focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-zinc-400 font-medium mb-1">Department</label>
                        <input
                          type="text"
                          placeholder="Computer Applications"
                          onChange={(e) => handleInputChange("dept", e.target.value)}
                          className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 font-medium mb-1">Shift</label>
                        <select
                          onChange={(e) => handleInputChange("shift", e.target.value)}
                          className="w-full bg-[#141417] border border-white/[0.06] rounded-lg px-3 py-2 text-white focus:outline-none"
                        >
                          <option value="morning">Morning (9 AM - 1 PM)</option>
                          <option value="afternoon">Afternoon (1 PM - 5 PM)</option>
                          <option value="evening">Evening (5 PM - 9 PM)</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* PUBLISH RESULT */}
                {type === "publish-result" && (
                  <>
                    <div>
                      <label className="block text-zinc-400 font-medium mb-1">Select Event</label>
                      <input
                        type="text"
                        placeholder="e.g. Valorant Championship"
                        onChange={(e) => handleInputChange("resultEvent", e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 font-medium mb-1">1st Place Winner</label>
                      <input
                        type="text"
                        placeholder="Team CyberKnights (MACFAST)"
                        onChange={(e) => handleInputChange("firstWinner", e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-white focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-zinc-400 font-medium mb-1">2nd Place</label>
                        <input
                          type="text"
                          placeholder="Team Alpha"
                          onChange={(e) => handleInputChange("secondWinner", e.target.value)}
                          className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 font-medium mb-1">3rd Place</label>
                        <input
                          type="text"
                          placeholder="Team Beta"
                          onChange={(e) => handleInputChange("thirdWinner", e.target.value)}
                          className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* BROADCAST ANNOUNCEMENT */}
                {type === "send-announcement" && (
                  <>
                    <div>
                      <label className="block text-zinc-400 font-medium mb-1">Announcement Title *</label>
                      <input
                        required
                        type="text"
                        placeholder="Schedule Change for Gaming Round 2"
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 font-medium mb-1">Message Content *</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Type notification text..."
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-white focus:outline-none resize-none"
                      />
                    </div>
                  </>
                )}

                {/* ALLOCATE HOSTEL */}
                {type === "allocate-hostel" && (
                  <>
                    <div>
                      <label className="block text-zinc-400 font-medium mb-1">Participant Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        onChange={(e) => handleInputChange("hostelUser", e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-white focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-zinc-400 font-medium mb-1">Hostel Block</label>
                        <select
                          onChange={(e) => handleInputChange("hostelType", e.target.value)}
                          className="w-full bg-[#141417] border border-white/[0.06] rounded-lg px-3 py-2 text-white focus:outline-none"
                        >
                          <option value="male">Male Hostel</option>
                          <option value="female">Female Hostel</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-zinc-400 font-medium mb-1">Room Number</label>
                        <input
                          type="text"
                          placeholder="204"
                          onChange={(e) => handleInputChange("roomNumber", e.target.value)}
                          className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* ISSUE REFUND */}
                {type === "issue-refund" && (
                  <>
                    <div>
                      <label className="block text-zinc-400 font-medium mb-1">Participant / Registration ID</label>
                      <input
                        type="text"
                        placeholder="REG-2026-9812"
                        onChange={(e) => handleInputChange("regId", e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 font-medium mb-1">Refund Amount (₹)</label>
                      <input
                        type="number"
                        placeholder="500"
                        onChange={(e) => handleInputChange("refundAmount", e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-white focus:outline-none"
                      />
                    </div>
                  </>
                )}

                {/* Form Footer Controls */}
                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#09090b] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-amber-500/20"
                  >
                    {submitting ? (
                      <span>Saving...</span>
                    ) : (
                      <>
                        <RiCheckLine size={16} />
                        <span>Save & Insert Data</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

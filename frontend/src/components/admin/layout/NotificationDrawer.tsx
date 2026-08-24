"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiCloseLine,
  RiNotification4Line,
  RiInformationLine,
  RiPulseLine,
  RiCheckDoubleLine,
  RiDeleteBin7Line,
  RiUserSharedLine,
  RiMoneyDollarCircleLine,
  RiServerLine,
} from "react-icons/ri";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  auditLogs?: any[];
}

export function NotificationDrawer({
  isOpen,
  onClose,
  auditLogs = [],
}: NotificationDrawerProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "registrations" | "finance" | "system">("all");
  const [cleared, setCleared] = useState(false);

  const defaultNotifications = [
    { id: "1", type: "system", title: "DB Sync Active", message: "Production MongoDB connected. High-availability cluster online.", time: "10 mins ago", unread: true },
    { id: "2", type: "registrations", title: "New Squad Registration", message: "Team 'CyberKnights' registered for Gaming Arena.", time: "25 mins ago", unread: true },
    { id: "3", type: "finance", title: "Payment Verified", message: "₹2,500 registration fee confirmed via UPI.", time: "42 mins ago", unread: false },
    { id: "4", type: "system", title: "2FA Verification", message: "Admin login authenticated with TOTP verification.", time: "1 hour ago", unread: false },
  ];

  const logNotifications = auditLogs.map((log, idx) => ({
    id: log._id || `log-${idx}`,
    type: "system",
    title: log.action || "Admin Audit Log",
    message: log.details || log.message || log.action || "Administrative action executed.",
    time: log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : "Recent",
    unread: idx < 2,
  }));

  const allNotifications = cleared ? [] : [...logNotifications, ...defaultNotifications];

  const filteredNotifications = allNotifications.filter((item) => {
    if (activeFilter === "all") return true;
    return item.type === activeFilter;
  });

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
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-screen max-w-md bg-zinc-950 border-l border-white/10 shadow-2xl flex flex-col z-10"
            >
              {/* Header */}
              <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between bg-zinc-900/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                    <RiNotification4Line size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white uppercase tracking-wider">
                      System Notifications
                    </h2>
                    <p className="text-[10px] text-zinc-400 font-semibold uppercase">
                      Live Telemetry & Audit Stream
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <RiCloseLine size={20} />
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="p-3 border-b border-white/5 bg-zinc-900/40 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                {[
                  { key: "all", label: "All Alerts" },
                  { key: "registrations", label: "Registrations" },
                  { key: "finance", label: "Finance" },
                  { key: "system", label: "System" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveFilter(tab.key as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      activeFilter === tab.key
                        ? "bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20"
                        : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Notification List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10">
                <div className="flex items-center justify-between text-xs text-zinc-400 pb-1">
                  <span className="uppercase tracking-widest font-bold text-[10px]">Recent Activity Stream</span>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                    <RiPulseLine className="animate-pulse" /> Live Socket
                  </span>
                </div>

                {filteredNotifications.length === 0 ? (
                  <div className="py-16 text-center text-zinc-500 text-xs font-medium">
                    No active notifications in this category.
                  </div>
                ) : (
                  filteredNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3.5 rounded-2xl border transition-all space-y-1 ${
                        notif.unread
                          ? "bg-amber-500/10 border-amber-500/30 text-white"
                          : "bg-white/5 border-white/10 text-zinc-300 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-400 flex items-center gap-1.5">
                          {notif.type === "registrations" && <RiUserSharedLine size={14} className="text-emerald-400" />}
                          {notif.type === "finance" && <RiMoneyDollarCircleLine size={14} className="text-purple-400" />}
                          {notif.type === "system" && <RiServerLine size={14} className="text-amber-400" />}
                          <span>{notif.title}</span>
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">{notif.time}</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10 bg-zinc-950 flex gap-2">
                <button
                  onClick={() => setCleared(true)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-zinc-300 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RiDeleteBin7Line size={16} />
                  <span>Clear All Alerts</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

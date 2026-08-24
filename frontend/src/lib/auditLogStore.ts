"use client";

import { useState, useEffect } from "react";

export interface SystemAuditLog {
  id: string;
  role: "VOLUNTEER" | "JUDGE" | "PARTICIPANT" | "ADMIN";
  userName: string;
  userCode: string;
  email: string;
  action: string;
  timestamp: string; // Exact Date, Time & Seconds
  exactTime: string; // ISO / High precision local time string
  ipAddress: string;
  status: "SUCCESS" | "FAILED" | "WARNING";
}

function formatExactTimestamp(date = new Date()): { full: string; exact: string } {
  const pad = (n: number) => String(n).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());

  const hours24 = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  // 12 hour format
  let hours12 = date.getHours();
  const ampm = hours12 >= 12 ? "PM" : "AM";
  hours12 = hours12 % 12 || 12;
  const hours12Str = pad(hours12);

  const full = `${year}-${month}-${day} @ ${hours24}:${minutes}:${seconds} (${hours12Str}:${minutes}:${seconds} ${ampm})`;
  const exact = `${year}-${month}-${day} ${hours24}:${minutes}:${seconds}`;

  return { full, exact };
}

const DEFAULT_AUDIT_LOGS: SystemAuditLog[] = [
  {
    id: "log-101",
    role: "VOLUNTEER",
    userName: "Kiran Kumar",
    userCode: "VOL-101",
    email: "kiran.vol@macfast.org",
    action: "Volunteer Duty Check-In & Auth Login",
    timestamp: "2026-08-07 @ 08:30:15 (08:30:15 AM)",
    exactTime: "2026-08-07 08:30:15",
    ipAddress: "192.168.1.104",
    status: "SUCCESS",
  },
  {
    id: "log-102",
    role: "JUDGE",
    userName: "Dr. Vikram Sethi",
    userCode: "JDG-201",
    email: "vikram.sethi@tcs.com",
    action: "Executive Jury Portal Scorecard Authentication",
    timestamp: "2026-08-07 @ 09:15:42 (09:15:42 AM)",
    exactTime: "2026-08-07 09:15:42",
    ipAddress: "192.168.1.188",
    status: "SUCCESS",
  },
  {
    id: "log-103",
    role: "PARTICIPANT",
    userName: "Rohan Varghese",
    userCode: "DELE-9021",
    email: "rohan@cet.ac.in",
    action: "Participant Portal QR Pass Access",
    timestamp: "2026-08-07 @ 10:05:00 (10:05:00 AM)",
    exactTime: "2026-08-07 10:05:00",
    ipAddress: "172.16.4.12",
    status: "SUCCESS",
  },
  {
    id: "log-104",
    role: "ADMIN",
    userName: "Super Admin Command HQ",
    userCode: "ADMIN-01",
    email: "admin@macfast.org",
    action: "Super Admin Command Console Session",
    timestamp: "2026-08-07 @ 11:20:10 (11:20:10 AM)",
    exactTime: "2026-08-07 11:20:10",
    ipAddress: "10.0.0.1",
    status: "SUCCESS",
  },
];

let listeners: Array<() => void> = [];
let syncChannel: BroadcastChannel | null = null;

if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    syncChannel = new BroadcastChannel("macfiesta_audit_sync");
    syncChannel.onmessage = () => notifyListeners();
  } catch {}
}

function notifyListeners() {
  listeners.forEach((l) => l());
  if (syncChannel) {
    try {
      syncChannel.postMessage("updated");
    } catch {}
  }
}

export function getAuditLogsList(): SystemAuditLog[] {
  if (typeof window === "undefined") return DEFAULT_AUDIT_LOGS;
  try {
    const saved = localStorage.getItem("macfiesta_audit_logs");
    return saved ? JSON.parse(saved) : DEFAULT_AUDIT_LOGS;
  } catch {
    return DEFAULT_AUDIT_LOGS;
  }
}

export function saveAuditLogsList(logs: SystemAuditLog[]) {
  try {
    localStorage.setItem("macfiesta_audit_logs", JSON.stringify(logs));
  } catch {}
  notifyListeners();
  return logs;
}

export function recordUserLogin(
  role: SystemAuditLog["role"],
  userName: string,
  userCode: string,
  email: string,
  action: string,
  status: SystemAuditLog["status"] = "SUCCESS"
) {
  const { full, exact } = formatExactTimestamp(new Date());

  const newLog: SystemAuditLog = {
    id: `log-${Date.now()}`,
    role,
    userName: userName || "User",
    userCode: userCode || "CODE-00",
    email: email || "unknown@macfast.org",
    action: action || "User Login Session",
    timestamp: full,
    exactTime: exact,
    ipAddress: "192.168.1." + Math.floor(Math.random() * 200 + 10),
    status,
  };

  const currentLogs = getAuditLogsList();
  const updated = [newLog, ...currentLogs.slice(0, 100)];
  saveAuditLogsList(updated);
  return newLog;
}

export function useAuditLogs() {
  const [logs, setLogs] = useState<SystemAuditLog[]>(DEFAULT_AUDIT_LOGS);

  const refreshAll = () => {
    setLogs(getAuditLogsList());
  };

  useEffect(() => {
    refreshAll();
    const handleChange = () => refreshAll();
    listeners.push(handleChange);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "macfiesta_audit_logs") refreshAll();
    };
    if (typeof window !== "undefined") window.addEventListener("storage", handleStorage);

    return () => {
      listeners = listeners.filter((l) => l !== handleChange);
      if (typeof window !== "undefined") window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return {
    logs,
    recordUserLogin,
    refreshAll,
  };
}

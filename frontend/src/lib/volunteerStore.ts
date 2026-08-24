"use client";

import { useState, useEffect } from "react";

// ── 1. Volunteer Role-Based Permissions ──────────────────────────────
export interface VolunteerPermissions {
  canVerifyRegistrations: boolean;
  canMarkAttendance: boolean;
  canUpdateTaskProgress: boolean;
  canAccessChecklist: boolean;
  canReportIssues: boolean;
  canDownloadFiles: boolean;
  canUploadProof: boolean;
  canUpdateVenueStatus: boolean;
}

export interface VolunteerUser {
  id: string;
  volunteerCode: string; // e.g. VOL-101
  name: string;
  email: string;
  phone: string;
  department: string;
  assignedEventId?: string;
  assignedEventName?: string;
  assignedVenue: string;
  shiftHours: string;
  profilePhoto?: string;
  permissions: VolunteerPermissions;
  status: "CHECKED_IN" | "OFF_DUTY";
}

// ── 2. Volunteer Task & Checklist ─────────────────────────────────────
export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface VolunteerTask {
  id: string;
  volunteerId: string;
  title: string;
  description: string;
  eventId?: string;
  eventName?: string;
  deadline: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "PENDING" | "STARTED" | "COMPLETED";
  notes?: string;
  proofImageUrl?: string;
  checklist: ChecklistItem[];
  createdAt: string;
}

// ── 3. Duty Attendance Record ─────────────────────────────────────────
export interface DutyAttendanceRecord {
  id: string;
  volunteerId: string;
  volunteerCode: string;
  volunteerName: string;
  department: string;
  venue: string;
  clockInTime: string;
  clockOutTime: string;
  totalHours: string;
  status: "CHECKED_IN" | "OFF_DUTY" | "LATE_ARRIVAL";
  timestamp: string;
}

// ── 4. Reported Issues & Emergencies ──────────────────────────────────
export interface VolunteerIssueReport {
  id: string;
  volunteerId: string;
  volunteerName: string;
  category: "TECHNICAL" | "VENUE" | "MEDICAL" | "EMERGENCY" | "REGISTRATION";
  location: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  timestamp: string;
}

// ── 5. Venue Live Operational Status ──────────────────────────────────
export interface EventVenueLiveStatus {
  eventId: string;
  eventName: string;
  venueName: string;
  seatingStatus: "SEATS_AVAILABLE" | "NEAR_FULL" | "HOUSEFULL";
  regDeskStatus: "DESK_OPEN" | "BUSY" | "CLOSED";
  stageReadiness: "READY" | "SOUND_CHECK" | "DELAYED";
  liveQueueCount: number;
  attendanceCount: number;
  foodDistribution: "NOT_STARTED" | "SERVED" | "FINISHED";
  volunteerNotes: string;
  lastUpdated: string;
}

// ── 6. Shared Resource Files ──────────────────────────────────────────
export interface SharedVolunteerFile {
  id: string;
  title: string;
  category: "Rulebook" | "Venue Map" | "Duty Roster" | "ID Pass" | "Briefing Note";
  fileUrl: string;
  fileSize: string;
  uploadedAt: string;
}

// ── DEFAULT INITIAL SEED DATA ─────────────────────────────────────────
const DEFAULT_VOLUNTEERS: VolunteerUser[] = [
  {
    id: "v-101",
    volunteerCode: "VOL-101",
    name: "Kiran Kumar",
    email: "kiran.vol@macfast.org",
    phone: "+91 98470 12001",
    department: "Computer Applications (MCA)",
    assignedEventId: "ev-1",
    assignedEventName: "Byte & Code Hackathon",
    assignedVenue: "Lab 3 & Auditorium",
    shiftHours: "Morning Shift (08:30 AM - 02:00 PM)",
    status: "CHECKED_IN",
    permissions: {
      canVerifyRegistrations: true,
      canMarkAttendance: true,
      canUpdateTaskProgress: true,
      canAccessChecklist: true,
      canReportIssues: true,
      canDownloadFiles: true,
      canUploadProof: true,
      canUpdateVenueStatus: true,
    },
  },
  {
    id: "v-102",
    volunteerCode: "VOL-102",
    name: "Sneha Roy",
    email: "sneha.vol@macfast.org",
    phone: "+91 98470 12002",
    department: "Management Studies (MBA)",
    assignedEventId: "ev-2",
    assignedEventName: "Thor Gaming Arena (Valorant)",
    assignedVenue: "Seminar Hall B",
    shiftHours: "Full Day (09:00 AM - 05:30 PM)",
    status: "OFF_DUTY",
    permissions: {
      canVerifyRegistrations: true,
      canMarkAttendance: true,
      canUpdateTaskProgress: true,
      canAccessChecklist: true,
      canReportIssues: true,
      canDownloadFiles: true,
      canUploadProof: true,
      canUpdateVenueStatus: false,
    },
  },
];

const DEFAULT_ATTENDANCE: DutyAttendanceRecord[] = [
  {
    id: "att-101",
    volunteerId: "v-101",
    volunteerCode: "VOL-101",
    volunteerName: "Kiran Kumar",
    department: "Computer Applications (MCA)",
    venue: "Lab 3 & Auditorium",
    clockInTime: "2026-08-07 @ 08:30:15 (08:30:15 AM)",
    clockOutTime: "Active On-Duty",
    totalHours: "5 hrs 15 mins (Ongoing)",
    status: "CHECKED_IN",
    timestamp: "2026-08-07 @ 08:30:15 (08:30:15 AM)",
  },
  {
    id: "att-102",
    volunteerId: "v-102",
    volunteerCode: "VOL-102",
    volunteerName: "Sneha Roy",
    department: "Management Studies (MBA)",
    venue: "Seminar Hall B",
    clockInTime: "2026-08-07 @ 09:00:00 (09:00:00 AM)",
    clockOutTime: "2026-08-07 @ 13:30:00 (01:30:00 PM)",
    totalHours: "4 hrs 30 mins",
    status: "OFF_DUTY",
    timestamp: "2026-08-07 @ 09:00:00 (09:00:00 AM)",
  },
];

const DEFAULT_TASKS: VolunteerTask[] = [
  {
    id: "tsk-1",
    volunteerId: "v-101",
    title: "Verify QR Passes at Lab 3 Gate",
    description: "Scan incoming hackathon participants' QR passes and issue verified wristbands.",
    eventId: "ev-1",
    eventName: "Byte & Code Hackathon",
    deadline: "10:30 AM",
    priority: "HIGH",
    status: "STARTED",
    checklist: [
      { id: "ck-1", text: "Check scanner battery & connection", completed: true },
      { id: "ck-2", text: "Arrange wristband kits at Desk A", completed: true },
      { id: "ck-3", text: "Verify college ID cards of delegates", completed: false },
    ],
    createdAt: "2026-08-07 08:30",
  },
  {
    id: "tsk-2",
    volunteerId: "v-101",
    title: "Stage Projector & Sound Inspection",
    description: "Verify HDMI connections, mics, and clickers for hackathon presentations.",
    eventId: "ev-1",
    eventName: "Byte & Code Hackathon",
    deadline: "11:45 AM",
    priority: "MEDIUM",
    status: "PENDING",
    checklist: [
      { id: "ck-4", text: "Connect primary HDMI cord", completed: false },
      { id: "ck-5", text: "Test podium microphone levels", completed: false },
    ],
    createdAt: "2026-08-07 09:00",
  },
];

const DEFAULT_LIVE_STATUS: EventVenueLiveStatus[] = [
  {
    eventId: "ev-1",
    eventName: "Byte & Code Hackathon",
    venueName: "Lab 3 & Auditorium",
    seatingStatus: "SEATS_AVAILABLE",
    regDeskStatus: "DESK_OPEN",
    stageReadiness: "READY",
    liveQueueCount: 14,
    attendanceCount: 88,
    foodDistribution: "NOT_STARTED",
    volunteerNotes: "All 18 teams checked in cleanly. Wi-Fi SSID MacFiesta_VIP active.",
    lastUpdated: "2026-08-07 10:15",
  },
];

const DEFAULT_SHARED_FILES: SharedVolunteerFile[] = [
  { id: "fl-1", title: "MacFiesta Official Rulebook 2K26", category: "Rulebook", fileUrl: "#", fileSize: "2.4 MB", uploadedAt: "2026-08-01" },
  { id: "fl-2", title: "MACFAST Campus Venue Map & Emergency Exits", category: "Venue Map", fileUrl: "#", fileSize: "4.1 MB", uploadedAt: "2026-08-02" },
  { id: "fl-3", title: "Hackathon Volunteer Duty Roster", category: "Duty Roster", fileUrl: "#", fileSize: "1.2 MB", uploadedAt: "2026-08-05" },
];

const DEFAULT_ISSUES: VolunteerIssueReport[] = [
  {
    id: "iss-1",
    volunteerId: "v-101",
    volunteerName: "Kiran Kumar",
    category: "TECHNICAL",
    location: "Lab 3 Desk B",
    description: "Port 4 switch lost power. IT team requested to inspect surge breaker.",
    status: "OPEN",
    timestamp: "2026-08-07 10:05",
  },
];

// ── BROADCAST SYNC CHANNEL ───────────────────────────────────────────
let listeners: Array<() => void> = [];
let syncChannel: BroadcastChannel | null = null;

if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    syncChannel = new BroadcastChannel("macfiesta_volunteer_sync");
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

function formatExactTime(d = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours24 = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());

  let h12 = d.getHours();
  const ampm = h12 >= 12 ? "PM" : "AM";
  h12 = h12 % 12 || 12;
  const h12Str = pad(h12);

  return `${year}-${month}-${day} @ ${hours24}:${minutes}:${seconds} (${h12Str}:${minutes}:${seconds} ${ampm})`;
}

// ── GETTERS AND SETTERS ──────────────────────────────────────────────
export function getVolunteersList(): VolunteerUser[] {
  if (typeof window === "undefined") return DEFAULT_VOLUNTEERS;
  try {
    const saved = localStorage.getItem("macfiesta_volunteers_list");
    return saved ? JSON.parse(saved) : DEFAULT_VOLUNTEERS;
  } catch {
    return DEFAULT_VOLUNTEERS;
  }
}

export function saveVolunteersList(list: VolunteerUser[]) {
  try {
    localStorage.setItem("macfiesta_volunteers_list", JSON.stringify(list));
  } catch {}
  notifyListeners();
  return list;
}

export function getAttendanceLogs(): DutyAttendanceRecord[] {
  if (typeof window === "undefined") return DEFAULT_ATTENDANCE;
  try {
    const saved = localStorage.getItem("macfiesta_volunteer_attendance");
    return saved ? JSON.parse(saved) : DEFAULT_ATTENDANCE;
  } catch {
    return DEFAULT_ATTENDANCE;
  }
}

export function saveAttendanceLogs(logs: DutyAttendanceRecord[]) {
  try {
    localStorage.setItem("macfiesta_volunteer_attendance", JSON.stringify(logs));
  } catch {}
  notifyListeners();
  return logs;
}

export function getVolunteerTasks(): VolunteerTask[] {
  if (typeof window === "undefined") return DEFAULT_TASKS;
  try {
    const saved = localStorage.getItem("macfiesta_volunteer_tasks");
    return saved ? JSON.parse(saved) : DEFAULT_TASKS;
  } catch {
    return DEFAULT_TASKS;
  }
}

export function saveVolunteerTasks(tasks: VolunteerTask[]) {
  try {
    localStorage.setItem("macfiesta_volunteer_tasks", JSON.stringify(tasks));
  } catch {}
  notifyListeners();
  return tasks;
}

export function getVenueStatusList(): EventVenueLiveStatus[] {
  if (typeof window === "undefined") return DEFAULT_LIVE_STATUS;
  try {
    const saved = localStorage.getItem("macfiesta_venue_status");
    return saved ? JSON.parse(saved) : DEFAULT_LIVE_STATUS;
  } catch {
    return DEFAULT_LIVE_STATUS;
  }
}

export function saveVenueStatusList(status: EventVenueLiveStatus[]) {
  try {
    localStorage.setItem("macfiesta_venue_status", JSON.stringify(status));
  } catch {}
  notifyListeners();
  return status;
}

export function getVolunteerIssues(): VolunteerIssueReport[] {
  if (typeof window === "undefined") return DEFAULT_ISSUES;
  try {
    const saved = localStorage.getItem("macfiesta_volunteer_issues");
    return saved ? JSON.parse(saved) : DEFAULT_ISSUES;
  } catch {
    return DEFAULT_ISSUES;
  }
}

export function saveVolunteerIssues(issues: VolunteerIssueReport[]) {
  try {
    localStorage.setItem("macfiesta_volunteer_issues", JSON.stringify(issues));
  } catch {}
  notifyListeners();
  return issues;
}

export function getSharedFiles(): SharedVolunteerFile[] {
  if (typeof window === "undefined") return DEFAULT_SHARED_FILES;
  try {
    const saved = localStorage.getItem("macfiesta_shared_files");
    return saved ? JSON.parse(saved) : DEFAULT_SHARED_FILES;
  } catch {
    return DEFAULT_SHARED_FILES;
  }
}

// ── CLOCK DUTY SYNC FUNCTION ─────────────────────────────────────────
export function toggleVolunteerClockDuty(volId: string) {
  const currentVolunteers = getVolunteersList();
  const currentAttendance = getAttendanceLogs();
  const target = currentVolunteers.find((v) => v.id === volId);

  if (!target) return;

  const nextStatus: "CHECKED_IN" | "OFF_DUTY" = target.status === "CHECKED_IN" ? "OFF_DUTY" : "CHECKED_IN";

  // 1. Update volunteer list status
  const updatedVolList = currentVolunteers.map((v) => (v.id === volId ? { ...v, status: nextStatus } : v));
  saveVolunteersList(updatedVolList);

  // 2. Update or create attendance record with exact timestamp
  const nowStr = formatExactTime(new Date());
  const existingIndex = currentAttendance.findIndex((a) => a.volunteerId === volId && a.clockOutTime === "Active On-Duty");

  let updatedAttendance: DutyAttendanceRecord[];

  if (nextStatus === "CHECKED_IN") {
    // New Clock-In
    const newRecord: DutyAttendanceRecord = {
      id: `att-${Date.now()}`,
      volunteerId: target.id,
      volunteerCode: target.volunteerCode,
      volunteerName: target.name,
      department: target.department,
      venue: target.assignedVenue,
      clockInTime: nowStr,
      clockOutTime: "Active On-Duty",
      totalHours: "Ongoing Shift",
      status: "CHECKED_IN",
      timestamp: nowStr,
    };
    updatedAttendance = [newRecord, ...currentAttendance];
  } else {
    // Clock-Out
    if (existingIndex >= 0) {
      updatedAttendance = currentAttendance.map((a, idx) => {
        if (idx === existingIndex) {
          return {
            ...a,
            clockOutTime: nowStr,
            totalHours: "Shift Completed",
            status: "OFF_DUTY",
          };
        }
        return a;
      });
    } else {
      const newRecord: DutyAttendanceRecord = {
        id: `att-${Date.now()}`,
        volunteerId: target.id,
        volunteerCode: target.volunteerCode,
        volunteerName: target.name,
        department: target.department,
        venue: target.assignedVenue,
        clockInTime: nowStr,
        clockOutTime: nowStr,
        totalHours: "Shift Completed",
        status: "OFF_DUTY",
        timestamp: nowStr,
      };
      updatedAttendance = [newRecord, ...currentAttendance];
    }
  }

  saveAttendanceLogs(updatedAttendance);
}

// ── REACT HOOK FOR VOLUNTEERS ─────────────────────────────────────────
export function useVolunteerControl(volunteerId = "v-101") {
  const [volunteers, setVolunteers] = useState<VolunteerUser[]>(DEFAULT_VOLUNTEERS);
  const [tasks, setTasks] = useState<VolunteerTask[]>(DEFAULT_TASKS);
  const [venueStatusList, setVenueStatusList] = useState<EventVenueLiveStatus[]>(DEFAULT_LIVE_STATUS);
  const [issues, setIssues] = useState<VolunteerIssueReport[]>(DEFAULT_ISSUES);
  const [attendanceLogs, setAttendanceLogs] = useState<DutyAttendanceRecord[]>(DEFAULT_ATTENDANCE);
  const [sharedFiles] = useState<SharedVolunteerFile[]>(DEFAULT_SHARED_FILES);

  const refreshAll = () => {
    setVolunteers(getVolunteersList());
    setTasks(getVolunteerTasks());
    setVenueStatusList(getVenueStatusList());
    setIssues(getVolunteerIssues());
    setAttendanceLogs(getAttendanceLogs());
  };

  useEffect(() => {
    refreshAll();
    const handleChange = () => refreshAll();
    listeners.push(handleChange);

    const handleStorage = (e: StorageEvent) => {
      if (e.key && e.key.startsWith("macfiesta_volunteer_")) refreshAll();
    };
    if (typeof window !== "undefined") window.addEventListener("storage", handleStorage);

    return () => {
      listeners = listeners.filter((l) => l !== handleChange);
      if (typeof window !== "undefined") window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const currentVolunteer = volunteers.find((v) => v.id === volunteerId) || volunteers[0];
  const assignedTasks = tasks.filter((t) => t.volunteerId === volunteerId);
  const currentVenueStatus = venueStatusList.find((v) => v.eventId === currentVolunteer?.assignedEventId) || venueStatusList[0];

  const updateTaskStatus = (taskId: string, status: "PENDING" | "STARTED" | "COMPLETED", notes?: string, proofUrl?: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status,
          notes: notes !== undefined ? notes : t.notes,
          proofImageUrl: proofUrl !== undefined ? proofUrl : t.proofImageUrl,
        };
      }
      return t;
    });
    saveVolunteerTasks(updated);
  };

  const toggleChecklistItem = (taskId: string, itemId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const nextChecklist = t.checklist.map((c) => (c.id === itemId ? { ...c, completed: !c.completed } : c));
        return { ...t, checklist: nextChecklist };
      }
      return t;
    });
    saveVolunteerTasks(updated);
  };

  const updateVenueOperationalStatus = (eventId: string, partial: Partial<EventVenueLiveStatus>) => {
    const updated = venueStatusList.map((vs) => {
      if (vs.eventId === eventId) {
        return { ...vs, ...partial, lastUpdated: new Date().toLocaleString() };
      }
      return vs;
    });
    saveVenueStatusList(updated);
  };

  const reportNewIssue = (category: VolunteerIssueReport["category"], location: string, description: string) => {
    const newReport: VolunteerIssueReport = {
      id: `iss-${Date.now()}`,
      volunteerId: currentVolunteer.id,
      volunteerName: currentVolunteer.name,
      category,
      location,
      description,
      status: "OPEN",
      timestamp: new Date().toLocaleString(),
    };
    const updated = [newReport, ...issues];
    saveVolunteerIssues(updated);
  };

  const toggleClockDuty = () => {
    if (currentVolunteer) {
      toggleVolunteerClockDuty(currentVolunteer.id);
    }
  };

  return {
    volunteers,
    currentVolunteer,
    assignedTasks,
    currentVenueStatus,
    issues,
    attendanceLogs,
    sharedFiles,

    updateTaskStatus,
    toggleChecklistItem,
    updateVenueOperationalStatus,
    reportNewIssue,
    toggleClockDuty,

    saveVolunteersList,
    saveVolunteerTasks,
  };
}

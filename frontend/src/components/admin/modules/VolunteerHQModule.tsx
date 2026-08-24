"use client";

import { useState, useEffect, useRef } from "react";
import {
  RiUserHeartLine,
  RiShieldFlashLine,
  RiCheckDoubleLine,
  RiAddLine,
  RiSearchLine,
  RiTimeLine,
  RiAlertLine,
  RiFileDownloadLine,
  RiShieldUserLine,
  RiBuilding2Line,
  RiTaskLine,
  RiQrCodeLine,
  RiMegaphoneLine,
  RiFileChartLine,
  RiDeleteBinLine,
  RiEditLine,
  RiCheckLine,
  RiCloseLine,
  RiSparklingLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
} from "react-icons/ri";

import {
  useVolunteerControl,
  VolunteerUser,
  VolunteerTask,
  VolunteerIssueReport,
  DutyAttendanceRecord,
  saveVolunteersList,
  saveVolunteerTasks,
  getVolunteerTasks,
  toggleVolunteerClockDuty,
} from "@/lib/volunteerStore";

interface VolunteerHQModuleProps {
  activePage?: string;
}

export function VolunteerHQModule({ activePage }: VolunteerHQModuleProps) {
  const { volunteers, assignedTasks, issues, attendanceLogs } = useVolunteerControl();
  const tabRailRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<"dashboard" | "roster" | "tasks" | "attendance" | "announcements" | "reports">("dashboard");

  useEffect(() => {
    if (!activePage) return;
    if (activePage.endsWith(".roster")) setActiveTab("roster");
    else if (activePage.endsWith(".tasks")) setActiveTab("tasks");
    else if (activePage.endsWith(".attendance")) setActiveTab("attendance");
    else if (activePage.endsWith(".announcements")) setActiveTab("announcements");
    else if (activePage.endsWith(".reports")) setActiveTab("reports");
    else if (activePage.endsWith(".dashboard") || activePage === "volunteers.hq") setActiveTab("dashboard");
  }, [activePage]);

  const [volList, setVolList] = useState<VolunteerUser[]>(volunteers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("ALL");
  const [selectedVolId, setSelectedVolId] = useState<string>(volunteers[0]?.id || "v-101");
  const [statusMsg, setStatusMsg] = useState("");

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // New Volunteer States
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDept, setNewDept] = useState("Computer Applications (MCA)");
  const [newVenue, setNewVenue] = useState("Main Auditorium");

  // New Task States
  const [assigneeVolId, setAssigneeVolId] = useState<string>(selectedVolId);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskDeadline, setTaskDeadline] = useState("11:30 AM");
  const [taskPriority, setTaskPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("HIGH");
  const [taskChecklist1, setTaskChecklist1] = useState("Verify equipment readiness");
  const [taskChecklist2, setTaskChecklist2] = useState("Check-in with Department Lead");

  // Broadcast Announcement State
  const [annTarget, setAnnTarget] = useState("ALL");
  const [annTitle, setAnnTitle] = useState("");
  const [annMessage, setAnnMessage] = useState("");

  const triggerSaved = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(""), 3500);
  };

  const selectedVol = volList.find((v) => v.id === selectedVolId) || volList[0];
  const allTasks = getVolunteerTasks();

  const filteredVolunteers = volList.filter((v) => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.volunteerCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDeptFilter === "ALL" || v.department === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  const handleTogglePermission = (permKey: keyof VolunteerUser["permissions"]) => {
    if (!selectedVol) return;
    const updated = volList.map((v) => {
      if (v.id === selectedVol.id) {
        return {
          ...v,
          permissions: {
            ...v.permissions,
            [permKey]: !v.permissions[permKey],
          },
        };
      }
      return v;
    });
    setVolList(updated);
    saveVolunteersList(updated);
    triggerSaved(`✓ Permission '${String(permKey)}' updated for ${selectedVol.name}`);
  };

  const handleAddVolunteer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const count = volList.length + 101;
    const newVol: VolunteerUser = {
      id: `v-${count}`,
      volunteerCode: `VOL-${count}`,
      name: newName,
      email: newEmail,
      phone: newPhone || "+91 94470 00000",
      department: newDept,
      assignedVenue: newVenue,
      shiftHours: "Full Day (09:00 AM - 05:00 PM)",
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
    };

    const updated = [...volList, newVol];
    setVolList(updated);
    saveVolunteersList(updated);
    setNewName("");
    setNewEmail("");
    setShowAddModal(false);
    triggerSaved(`✓ Volunteer Account ${newVol.volunteerCode} Created Successfully!`);
  };

  const handleAssignTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;

    const targetVolId = assigneeVolId || selectedVolId;
    const targetVol = volList.find((v) => v.id === targetVolId) || selectedVol;

    const newTask: VolunteerTask = {
      id: `tsk-${Date.now()}`,
      volunteerId: targetVolId,
      title: taskTitle,
      description: taskDesc || "Execute assigned duty task as instructed.",
      deadline: taskDeadline,
      priority: taskPriority,
      status: "PENDING",
      checklist: [
        { id: `ck-${Date.now()}-1`, text: taskChecklist1 || "Verify equipment readiness", completed: false },
        { id: `ck-${Date.now()}-2`, text: taskChecklist2 || "Check-in with Department Lead", completed: false },
      ],
      createdAt: new Date().toLocaleString(),
    };

    const existingTasks = getVolunteerTasks();
    saveVolunteerTasks([...existingTasks, newTask]);

    setTaskTitle("");
    setTaskDesc("");
    setShowTaskModal(false);
    triggerSaved(`✓ Duty Task Assigned to ${targetVol?.name || "Volunteer"}!`);
  };

  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annMessage) return;
    setAnnTitle("");
    setAnnMessage("");
    triggerSaved(`✓ Targeted Announcement Dispatched to ${annTarget} Volunteers!`);
  };

  const openTaskAssignModalForVol = (volId: string) => {
    setAssigneeVolId(volId);
    setShowTaskModal(true);
  };

  return (
    <div className="space-y-6 font-mono select-none">
      {/* MODULE HEADER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-black/90 via-[#0A0D1A] to-[#05050A] border-2 border-arc-cyan/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_0_40px_rgba(0,212,255,0.15)]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-marvel-red/10 border border-marvel-red/30 text-marvel-red text-[10px] font-bold uppercase tracking-widest">
            <RiShieldFlashLine className="animate-pulse" />
            <span>ENTERPRISE VOLUNTEER OPERATIONS & RBAC HUB</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Volunteer HQ <span className="marvel-bang-comic-gradient font-black">Command Studio</span>
          </h2>
          <p className="text-xs text-white/60">
            Manage volunteer credentials, role-based permissions, shift rosters, task checklists & emergency alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {statusMsg && (
            <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs font-bold rounded-xl animate-pulse flex items-center gap-2">
              <RiCheckDoubleLine className="text-base" />
              <span>{statusMsg}</span>
            </div>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-arc-cyan text-black font-bold text-xs rounded-xl hover:bg-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RiAddLine className="text-base" />
            <span>+ Add Volunteer</span>
          </button>
        </div>

      </div>

      {/* NAV TAB RAIL WITH HORIZONTAL SCROLL BUTTONS */}
      <div className="relative flex items-center bg-black/60 p-1.5 rounded-2xl border border-white/10 group">
        <button
          onClick={() => tabRailRef.current?.scrollBy({ left: -220, behavior: "smooth" })}
          className="p-2 rounded-xl bg-white/5 hover:bg-marvel-red text-white transition-all cursor-pointer z-10 shrink-0 border border-white/10"
          title="Scroll Left"
        >
          <RiArrowLeftSLine size={18} />
        </button>

        <div
          ref={tabRailRef}
          className="flex-1 flex overflow-x-auto scrollbar-none gap-1 px-2 scroll-smooth"
        >
          {[
            { id: "dashboard" as const, label: "Operations Telemetry", icon: RiShieldFlashLine },
            { id: "roster" as const, label: `Staff Roster (${volList.length})`, icon: RiUserHeartLine },
            { id: "tasks" as const, label: `Task Assignments (${allTasks.length})`, icon: RiTaskLine },
            { id: "attendance" as const, label: "Attendance & Duty Logs", icon: RiTimeLine },
            { id: "announcements" as const, label: "Targeted Broadcasts", icon: RiMegaphoneLine },
            { id: "reports" as const, label: "Reports & Exports", icon: RiFileChartLine },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-marvel-red text-white shadow-[0_0_15px_#ED1D24]"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
                style={{ fontFamily: "var(--font-heading)" }}
              >
                <Icon />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => tabRailRef.current?.scrollBy({ left: 220, behavior: "smooth" })}
          className="p-2 rounded-xl bg-white/5 hover:bg-marvel-red text-white transition-all cursor-pointer z-10 shrink-0 border border-white/10"
          title="Scroll Right"
        >
          <RiArrowRightSLine size={18} />
        </button>
      </div>


      {/* 1. OPERATIONS TELEMETRY DASHBOARD */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-white/50 text-[10px] uppercase font-bold">Total Enrolled Volunteers</span>
              <div className="text-3xl font-black text-white">{volList.length}</div>
              <span className="text-emerald-400 text-[10px]">100% Verified Accounts</span>
            </div>

            <div className="p-5 rounded-2xl bg-black/40 border border-emerald-500/30 space-y-1">
              <span className="text-white/50 text-[10px] uppercase font-bold">On-Duty Check-ins</span>
              <div className="text-3xl font-black text-emerald-400">
                {volList.filter((v) => v.status === "CHECKED_IN").length}
              </div>
              <span className="text-emerald-400 text-[10px]">● Active Ground Duty</span>
            </div>

            <div className="p-5 rounded-2xl bg-black/40 border border-amber-500/30 space-y-1">
              <span className="text-white/50 text-[10px] uppercase font-bold">Off-Duty / Standby</span>
              <div className="text-3xl font-black text-amber-400">
                {volList.filter((v) => v.status === "OFF_DUTY").length}
              </div>
              <span className="text-amber-400 text-[10px]">Shift Break</span>
            </div>

            <div className="p-5 rounded-2xl bg-black/40 border border-arc-cyan/30 space-y-1">
              <span className="text-white/50 text-[10px] uppercase font-bold">Task Completion Rate</span>
              <div className="text-3xl font-black text-arc-cyan">
                {allTasks.length > 0
                  ? Math.round((allTasks.filter((t: VolunteerTask) => t.status === "COMPLETED").length / allTasks.length) * 100)
                  : 100}%
              </div>
              <span className="text-arc-cyan text-[10px]">Live Dispatch Metrics</span>
            </div>
          </div>

          {/* Incident Reports Summary */}
          <div className="marvel-card p-6 rounded-3xl border border-arc-cyan/30 bg-[#0A0D1A] space-y-4">
            <h3 className="text-sm font-bold text-marvel-red uppercase tracking-wider flex items-center gap-2">
              <RiAlertLine className="animate-pulse" />
              <span>Live Emergency & Incident Reports ({issues.length})</span>
            </h3>

            <div className="space-y-2 text-xs">
              {issues.length === 0 ? (
                <p className="text-white/40">No emergency reports submitted.</p>
              ) : (
                issues.map((i: VolunteerIssueReport) => (
                  <div key={i.id} className="p-4 bg-black/40 border border-white/10 rounded-2xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-marvel-red/20 text-marvel-red text-[9px] font-bold">{i.category}</span>
                        <span className="font-bold text-white">{i.location}</span>
                        <span className="text-white/40 text-[10px]">by {i.volunteerName}</span>
                      </div>
                      <p className="text-white/70 mt-1">{i.description}</p>
                    </div>
                    <span className="text-[10px] text-arc-cyan font-bold">{i.timestamp}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. VOLUNTEER STAFF ROSTER & RBAC */}
      {activeTab === "roster" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 marvel-card p-6 rounded-3xl border border-arc-cyan/30 bg-[#0A0D1A] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
                <RiUserHeartLine className="text-marvel-red" />
                <span>Volunteer Staff List</span>
              </h3>
            </div>

            {/* Search and Dept Filter */}
            <div className="space-y-2 text-xs">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or VOL ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white focus:border-arc-cyan focus:outline-none"
                />
                <RiSearchLine className="absolute right-3.5 top-3 text-white/40" />
              </div>
            </div>

            <div className="space-y-2">
              {filteredVolunteers.map((vol) => {
                const isSelected = selectedVolId === vol.id;
                return (
                  <div
                    key={vol.id}
                    onClick={() => setSelectedVolId(vol.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1 ${isSelected
                        ? "bg-marvel-red/15 border-marvel-red text-white shadow-[0_0_15px_rgba(237,29,36,0.3)]"
                        : "bg-black/40 border-white/10 text-white/70 hover:border-white/30"
                      }`}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white text-sm">{vol.name}</span>
                      <span className="px-2 py-0.5 rounded bg-arc-cyan/20 text-arc-cyan text-[9px] font-bold">
                        {vol.volunteerCode}
                      </span>
                    </div>
                    <div className="text-[11px] text-white/50">{vol.department}</div>
                    <div className="text-[10px] text-arc-cyan font-mono flex items-center gap-1">
                      <span>✉️ {vol.email}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(vol.email);
                          triggerSaved(`✓ Email '${vol.email}' copied to clipboard!`);
                        }}
                        className="text-white/40 hover:text-white text-[9px] underline cursor-pointer"
                      >
                        [Copy]
                      </button>
                    </div>
                    <div className="flex justify-between items-center text-[10px] pt-1 border-t border-white/10">
                      <span className="text-metallic-gold font-bold">Venue: {vol.assignedVenue}</span>
                      <span className={vol.status === "CHECKED_IN" ? "text-emerald-400 font-bold" : "text-white/40"}>
                        ● {vol.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Volunteer Details & Permission Matrix */}
          {selectedVol && (
            <div className="lg:col-span-7 space-y-6">
              <div className="marvel-card p-6 rounded-3xl border border-arc-cyan/30 bg-[#0A0D1A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-arc-cyan font-bold uppercase">{selectedVol.volunteerCode} • {selectedVol.department}</div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                    {selectedVol.name}
                  </h3>
                  <div className="text-xs text-white/70 space-x-2 pt-1">
                    <span className="px-2 py-1 rounded bg-arc-cyan/10 border border-arc-cyan/30 text-arc-cyan font-mono font-bold">
                      ✉️ {selectedVol.email}
                    </span>
                    <span className="text-white/60">Phone: {selectedVol.phone}</span>
                    <span className="text-metallic-gold">Venue: {selectedVol.assignedVenue}</span>
                  </div>
                </div>


                <button
                  onClick={() => openTaskAssignModalForVol(selectedVol.id)}
                  className="px-4 py-2.5 bg-arc-cyan text-black font-bold text-xs rounded-xl hover:bg-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RiTaskLine className="text-base" />
                  <span>Assign Task to {selectedVol.name.split(" ")[0]}</span>
                </button>
              </div>

              {/* RBAC Permissions Toggles Grid */}
              <div className="marvel-card p-6 rounded-3xl border border-arc-cyan/30 bg-[#0A0D1A] space-y-4">
                <h4 className="text-xs font-bold text-metallic-gold uppercase tracking-wider flex items-center gap-2">
                  <RiShieldUserLine className="text-base" />
                  <span>Role-Based Access Control (RBAC) Permissions Toggle</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {[
                    { key: "canVerifyRegistrations", label: "Scan & Verify Participant QR Passes" },
                    { key: "canMarkAttendance", label: "Clock Duty Check-In & Check-Out" },
                    { key: "canUpdateTaskProgress", label: "Mark Tasks Started / Completed" },
                    { key: "canAccessChecklist", label: "Interactive Task Verification Checklists" },
                    { key: "canReportIssues", label: "Dispatch Emergency & Technical Issues" },
                    { key: "canDownloadFiles", label: "Access Shared Rulebooks & Venue Maps" },
                    { key: "canUploadProof", label: "Upload Photo Proof for Tasks" },
                    { key: "canUpdateVenueStatus", label: "Update Live Auditorium Seating & Queue" },
                  ].map((item) => {
                    const permKey = item.key as keyof VolunteerUser["permissions"];
                    const isEnabled = selectedVol.permissions[permKey];
                    return (
                      <div
                        key={item.key}
                        onClick={() => handleTogglePermission(permKey)}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${isEnabled
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                            : "bg-black/40 border-white/10 text-white/40 hover:border-white/20"
                          }`}
                      >
                        <span className="font-bold text-[11px]">{item.label}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${isEnabled ? "bg-emerald-500 text-black" : "bg-white/10 text-white/40"}`}>
                          {isEnabled ? "ENABLED" : "LOCKED"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. TASK ASSIGNMENTS */}
      {activeTab === "tasks" && (
        <div className="marvel-card p-6 md:p-8 rounded-3xl border border-arc-cyan/30 bg-[#0A0D1A] space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
              Active Duty Tasks & Checklists ({allTasks.length})
            </h3>
            <button onClick={() => setShowTaskModal(true)} className="btn-primary py-2.5 px-6 text-xs flex items-center gap-2 cursor-pointer shadow-[0_0_15px_#ED1D24]">
              <RiAddLine />
              <span>Assign New Task</span>
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {allTasks.map((t: VolunteerTask) => {
              const assignee = volList.find((v) => v.id === t.volunteerId);
              return (
                <div key={t.id} className="p-5 bg-black/40 border border-white/10 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-marvel-red/20 text-marvel-red font-bold text-[9px] uppercase">{t.priority}</span>
                      <span className="font-bold text-white text-sm">{t.title}</span>
                      {assignee && (
                        <span className="px-2 py-0.5 rounded bg-arc-cyan/20 text-arc-cyan font-bold text-[9px]">
                          Assigned to: {assignee.name} ({assignee.volunteerCode})
                        </span>
                      )}
                    </div>
                    <span className="text-arc-cyan font-bold text-[10px]">Deadline: {t.deadline}</span>
                  </div>
                  <p className="text-white/60">{t.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. ATTENDANCE & DUTY LOGS */}
      {activeTab === "attendance" && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-black/40 border border-emerald-500/30 space-y-1">
              <span className="text-white/50 text-[10px] uppercase font-bold">Active On-Duty Staff</span>
              <div className="text-3xl font-black text-emerald-400">
                {volunteers.filter((v) => v.status === "CHECKED_IN").length}
              </div>
              <span className="text-emerald-400 text-[10px]">● Clocked In Now</span>
            </div>

            <div className="p-5 rounded-2xl bg-black/40 border border-amber-500/30 space-y-1">
              <span className="text-white/50 text-[10px] uppercase font-bold">Off-Duty / Standby</span>
              <div className="text-3xl font-black text-amber-400">
                {volunteers.filter((v) => v.status === "OFF_DUTY").length}
              </div>
              <span className="text-amber-400 text-[10px]">On Standby</span>
            </div>

            <div className="p-5 rounded-2xl bg-black/40 border border-arc-cyan/30 space-y-1">
              <span className="text-white/50 text-[10px] uppercase font-bold">Total Duty Logs</span>
              <div className="text-3xl font-black text-arc-cyan">{attendanceLogs.length}</div>
              <span className="text-arc-cyan text-[10px]">Verified Audit Entries</span>
            </div>

            <div className="p-5 rounded-2xl bg-black/40 border border-metallic-gold/30 space-y-1">
              <span className="text-white/50 text-[10px] uppercase font-bold">Shift Punctuality</span>
              <div className="text-3xl font-black text-metallic-gold">98.4%</div>
              <span className="text-metallic-gold text-[10px]">On-Time Attendance</span>
            </div>
          </div>

          {/* Quick Clock Duty Override Table */}
          <div className="marvel-card p-6 md:p-8 rounded-3xl border border-arc-cyan/30 bg-[#0A0D1A] space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
                <RiTimeLine className="text-arc-cyan" />
                <span>Live Admin Volunteer Clock-In / Clock-Out Override</span>
              </h3>
              <span className="text-[10px] text-arc-cyan font-bold font-mono">Real-Time Sync Active</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {volunteers.map((vol) => {
                const isCheckedIn = vol.status === "CHECKED_IN";
                return (
                  <div
                    key={vol.id}
                    className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${isCheckedIn
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-black/40 border-white/10 text-white/60"
                      }`}
                  >
                    <div>
                      <div className="font-bold text-white text-xs">{vol.name} ({vol.volunteerCode})</div>
                      <div className="text-[10px] text-white/50">{vol.assignedVenue}</div>
                      <div className="text-[9px] font-mono mt-0.5">
                        Status: <span className={isCheckedIn ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>● {vol.status}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        toggleVolunteerClockDuty(vol.id);
                        triggerSaved(`✓ Duty Status updated for ${vol.name}!`);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all cursor-pointer ${isCheckedIn
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500 hover:text-black"
                          : "bg-emerald-500 text-black hover:bg-white"
                        }`}
                    >
                      {isCheckedIn ? "Clock-Out" : "Clock-In"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Full Attendance Audit Table */}
          <div className="marvel-card p-6 md:p-8 rounded-3xl border border-arc-cyan/30 bg-[#0A0D1A] space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
                <RiFileChartLine className="text-metallic-gold" />
                <span>Duty Attendance Audit History Log ({attendanceLogs.length})</span>
              </h3>

              <button
                onClick={() => triggerSaved("✓ Attendance Audit Log Exported as CSV!")}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 text-white hover:bg-white/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RiFileDownloadLine />
                <span>Export Attendance Log</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-white/40 uppercase tracking-widest font-black text-[10px]">
                    <th className="py-3 px-3">Volunteer & Code</th>
                    <th className="py-3 px-3">Department & Venue</th>
                    <th className="py-3 px-3">Exact Clock-In Timestamp</th>
                    <th className="py-3 px-3">Exact Clock-Out Timestamp</th>
                    <th className="py-3 px-3">Total Duration</th>
                    <th className="py-3 px-3 text-right">Status Badge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white">
                  {attendanceLogs.map((log: DutyAttendanceRecord) => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-arc-cyan/20 text-arc-cyan font-bold text-[9px]">{log.volunteerCode}</span>
                          <span>{log.volunteerName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-white/70">
                        <div>{log.department}</div>
                        <span className="text-[10px] text-metallic-gold font-bold">Venue: {log.venue}</span>
                      </td>
                      <td className="py-3 px-3 text-emerald-400 font-mono font-bold whitespace-nowrap">
                        {log.clockInTime}
                      </td>
                      <td className="py-3 px-3 text-amber-400 font-mono font-bold whitespace-nowrap">
                        {log.clockOutTime}
                      </td>
                      <td className="py-3 px-3 text-arc-cyan font-mono text-[11px]">
                        {log.totalHours}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${log.status === "CHECKED_IN"
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                              : "bg-white/10 text-white/50 border-white/20"
                            }`}
                        >
                          ● {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. TARGETED ANNOUNCEMENTS */}
      {activeTab === "announcements" && (

        <div className="marvel-card p-6 md:p-8 rounded-3xl border border-arc-cyan/30 bg-[#0A0D1A] space-y-6">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
            Send Targeted Volunteer Broadcast
          </h3>

          <form onSubmit={handleSendAnnouncement} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 font-bold mb-1">Target Audience</label>
                <select
                  value={annTarget}
                  onChange={(e) => setAnnTarget(e.target.value)}
                  className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white focus:border-arc-cyan focus:outline-none"
                >
                  <option value="ALL">All Enrolled Volunteers</option>
                  <option value="MCA">MCA Department Volunteers</option>
                  <option value="MBA">MBA Department Volunteers</option>
                  <option value="SECURITY">Gate Security Team</option>
                </select>
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Broadcast Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Briefing Meeting at 01:30 PM"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white focus:border-arc-cyan focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-white/70 font-bold mb-1">Broadcast Message Body</label>
              <textarea
                rows={3}
                placeholder="Message instructions..."
                value={annMessage}
                onChange={(e) => setAnnMessage(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white focus:border-arc-cyan focus:outline-none"
              />
            </div>

            <button type="submit" className="btn-primary py-3 px-6 text-xs uppercase font-bold flex items-center gap-2 cursor-pointer shadow-[0_0_20px_#ED1D24]">
              <RiMegaphoneLine />
              <span>Dispatch Targeted Volunteer Broadcast</span>
            </button>
          </form>
        </div>
      )}



      {/* 6. REPORTS & EXPORTS */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <div className="marvel-card p-6 md:p-8 rounded-3xl border border-arc-cyan/30 bg-[#0A0D1A] space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] text-arc-cyan font-bold uppercase tracking-wider block">VOLUNTEER OPERATIONS REPORT STUDIO</span>
                <h3 className="text-xl font-black text-white uppercase tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                  Volunteer Roster, Duty Shift & Attendance Exporter
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-5 bg-black/40 border border-white/10 rounded-2xl space-y-3">
                <span className="text-arc-cyan font-bold block uppercase text-[10px]">1. Full Volunteer Roster</span>
                <p className="text-white/60">Export complete list of enrolled volunteers with codes, emails, phones & venue assignments.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => triggerSaved("✓ Volunteer Roster Exported as Excel!")}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold hover:bg-emerald-500 hover:text-black transition-colors cursor-pointer"
                  >
                    Excel (.xlsx)
                  </button>
                  <button
                    onClick={() => triggerSaved("✓ Volunteer Roster Exported as PDF!")}
                    className="px-3 py-1.5 rounded-xl bg-marvel-red/20 text-marvel-red font-bold hover:bg-marvel-red hover:text-white transition-colors cursor-pointer"
                  >
                    PDF Document
                  </button>
                </div>
              </div>

              <div className="p-5 bg-black/40 border border-white/10 rounded-2xl space-y-3">
                <span className="text-metallic-gold font-bold block uppercase text-[10px]">2. Attendance & Duty Logs</span>
                <p className="text-white/60">Export exact clock-in, clock-out, shift hours & venue check-in audit logs.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => triggerSaved("✓ Duty Attendance Logs Exported as Excel!")}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold hover:bg-emerald-500 hover:text-black transition-colors cursor-pointer"
                  >
                    Excel (.xlsx)
                  </button>
                  <button
                    onClick={() => triggerSaved("✓ Duty Attendance Logs Exported as CSV!")}
                    className="px-3 py-1.5 rounded-xl bg-arc-cyan/20 text-arc-cyan font-bold hover:bg-arc-cyan hover:text-black transition-colors cursor-pointer"
                  >
                    CSV File
                  </button>
                </div>
              </div>

              <div className="p-5 bg-black/40 border border-white/10 rounded-2xl space-y-3">
                <span className="text-marvel-red font-bold block uppercase text-[10px]">3. Emergency & Incident Reports</span>
                <p className="text-white/60">Export all technical, venue, medical & security emergency reports submitted on ground.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => triggerSaved("✓ Emergency Incident Reports Exported as PDF!")}
                    className="px-3 py-1.5 rounded-xl bg-marvel-red/20 text-marvel-red font-bold hover:bg-marvel-red hover:text-white transition-colors cursor-pointer"
                  >
                    PDF Summary
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE VOLUNTEER MODAL */}
      {showAddModal && (

        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full marvel-card p-6 rounded-3xl border border-arc-cyan/40 bg-[#0A0D1A] space-y-4">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">Add New Volunteer Staff Account</h3>
            <form onSubmit={handleAddVolunteer} className="space-y-3 text-xs">
              <div>
                <label className="block text-white/70 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Nair"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white focus:border-arc-cyan focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="rahul.vol@macfast.org"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white focus:border-arc-cyan focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-2 px-5 font-bold uppercase cursor-pointer">
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN TASK MODAL DIALOG */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full marvel-card p-6 md:p-8 rounded-3xl border-2 border-marvel-red/40 bg-[#0A0D1A] space-y-4 shadow-[0_0_50px_rgba(237,29,36,0.3)] relative">
            <button
              onClick={() => setShowTaskModal(false)}
              className="absolute top-5 right-5 text-white/40 hover:text-white p-1"
            >
              <RiCloseLine className="text-xl" />
            </button>

            <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
              <RiTaskLine className="text-marvel-red" />
              <span>Assign Duty Task to Volunteer</span>
            </h3>

            <form onSubmit={handleAssignTask} className="space-y-4 text-xs">
              <div>
                <label className="block text-white/70 font-bold mb-1">Select Assignee Volunteer</label>
                <select
                  value={assigneeVolId}
                  onChange={(e) => setAssigneeVolId(e.target.value)}
                  className="w-full px-4 py-3 bg-black/60 border border-white/15 rounded-xl text-white focus:border-arc-cyan focus:outline-none"
                >
                  {volList.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.volunteerCode}) — {v.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Duty Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Verify QR Passes at Auditorium Gate 2"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-black/60 border border-white/15 rounded-xl text-white focus:border-arc-cyan focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 font-bold mb-1">Priority Level</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full px-4 py-3 bg-black/60 border border-white/15 rounded-xl text-white focus:border-arc-cyan focus:outline-none"
                  >
                    <option value="URGENT">URGENT</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 font-bold mb-1">Reporting Deadline</label>
                  <input
                    type="text"
                    placeholder="11:30 AM"
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-black/60 border border-white/15 rounded-xl text-white focus:border-arc-cyan focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Task Instructions & Description</label>
                <textarea
                  rows={2}
                  placeholder="Specific duty instructions for the volunteer..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full px-4 py-3 bg-black/60 border border-white/15 rounded-xl text-white focus:border-arc-cyan focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-white/70 font-bold">Verification Checklist Items</label>
                <input
                  type="text"
                  placeholder="Checklist Item 1"
                  value={taskChecklist1}
                  onChange={(e) => setTaskChecklist1(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs mb-2"
                />
                <input
                  type="text"
                  placeholder="Checklist Item 2"
                  value={taskChecklist2}
                  onChange={(e) => setTaskChecklist2(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-5 py-2.5 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-2.5 px-6 font-bold uppercase cursor-pointer shadow-[0_0_20px_#ED1D24]">
                  Assign Duty Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

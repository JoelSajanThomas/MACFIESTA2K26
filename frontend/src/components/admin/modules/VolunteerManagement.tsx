"use client";

import { useState } from "react";
import {
  RiUserHeartLine,
  RiShieldUserLine,
  RiCheckDoubleLine,
  RiPhoneLine,
  RiTimeLine,
  RiAddLine,
  RiTaskLine,
  RiCloseLine,
} from "react-icons/ri";
import {
  useVolunteerControl,
  VolunteerUser,
  VolunteerTask,
  saveVolunteersList,
  saveVolunteerTasks,
  getVolunteerTasks,
} from "@/lib/volunteerStore";

export function VolunteerManagement() {
  const { volunteers, assignedTasks, updateTaskStatus } = useVolunteerControl();

  const [volList, setVolList] = useState<VolunteerUser[]>(volunteers);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // New Volunteer States
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDept, setNewDept] = useState("Computer Applications (MCA)");
  const [newVenue, setNewVenue] = useState("Main Auditorium");

  // New Task States
  const [assigneeVolId, setAssigneeVolId] = useState<string>(volunteers[0]?.id || "v-101");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskDeadline, setTaskDeadline] = useState("11:30 AM");
  const [taskPriority, setTaskPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("HIGH");
  const [statusMsg, setStatusMsg] = useState("");

  const triggerToast = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(""), 3500);
  };

  const allTasks = getVolunteerTasks();

  const handleAddVolunteer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const count = volList.length + 101;
    const newVol: VolunteerUser = {
      id: `v-${count}`,
      volunteerCode: `VOL-${count}`,
      name: newName,
      email: newEmail,
      phone: newPhone || "+91 98470 00000",
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
    triggerToast(`✓ Volunteer ${newVol.name} Registered!`);
  };

  const handleAssignTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;

    const targetVol = volList.find((v) => v.id === assigneeVolId) || volList[0];

    const newTask: VolunteerTask = {
      id: `tsk-${Date.now()}`,
      volunteerId: assigneeVolId,
      title: taskTitle,
      description: taskDesc || "Execute assigned duty task as instructed.",
      deadline: taskDeadline,
      priority: taskPriority,
      status: "PENDING",
      checklist: [
        { id: `ck-${Date.now()}-1`, text: "Verify equipment readiness", completed: false },
        { id: `ck-${Date.now()}-2`, text: "Check-in with Department Lead", completed: false },
      ],
      createdAt: new Date().toLocaleString(),
    };

    const existingTasks = getVolunteerTasks();
    saveVolunteerTasks([...existingTasks, newTask]);

    setTaskTitle("");
    setTaskDesc("");
    setShowTaskModal(false);
    triggerToast(`✓ Duty Task Assigned to ${targetVol?.name || "Volunteer"}!`);
  };

  const toggleCheckIn = (id: string) => {
    const updated = volList.map((v) => {
      if (v.id === id) {
        const next = v.status === "CHECKED_IN" ? "OFF_DUTY" : "CHECKED_IN";
        return { ...v, status: next as "CHECKED_IN" | "OFF_DUTY" };
      }
      return v;
    });
    setVolList(updated);
    saveVolunteersList(updated);
  };

  return (
    <div className="space-y-6 select-none font-mono">
      {/* Toast Alert */}
      {statusMsg && (
        <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs font-bold rounded-xl animate-pulse flex items-center gap-2">
          <RiCheckDoubleLine className="text-base" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="glass p-5 rounded-3xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
            <RiUserHeartLine className="text-marvel-red text-xl" />
            <span>Volunteer Staff Roster & Duty Dispatch</span>
          </h2>
          <p className="text-xs text-white/50">Assign volunteer tasks, toggle role-based access & track live check-ins</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-arc-cyan text-black font-bold text-xs rounded-xl hover:bg-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RiAddLine size={16} /> + Register Volunteer
          </button>
        </div>

      </div>

      {/* Volunteers Table */}
      <div className="glass p-6 rounded-3xl border border-white/10 space-y-4 bg-[#0A0D1A]">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Active Volunteer Staff Roster ({volList.length})
          </h3>
          <span className="text-[10px] font-bold text-emerald-400">
            {volList.filter((v) => v.status === "CHECKED_IN").length} Checked-In On Duty
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/40 uppercase tracking-widest font-black text-[10px]">
                <th className="py-3 px-3">Volunteer Code & Name</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Shift Hours</th>
                <th className="py-3 px-3">Assigned Venue</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white">
              {volList.map((vol) => (
                <tr key={vol.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-arc-cyan/20 text-arc-cyan font-bold text-[9px]">{vol.volunteerCode}</span>
                      <p className="font-extrabold text-white text-sm">{vol.name}</p>
                    </div>
                    <span className="text-[10px] text-white/40">{vol.phone} • {vol.email}</span>
                  </td>
                  <td className="py-3 px-3 text-arc-cyan font-bold">{vol.department}</td>
                  <td className="py-3 px-3 font-mono text-metallic-gold">{vol.shiftHours}</td>
                  <td className="py-3 px-3 font-semibold text-white/90">{vol.assignedVenue}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                        vol.status === "CHECKED_IN"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      ● {vol.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right space-x-2">
                    <button
                      onClick={() => {
                        setAssigneeVolId(vol.id);
                        setShowTaskModal(true);
                      }}
                      className="px-3 py-1 rounded-lg bg-marvel-red/20 border border-marvel-red/40 hover:bg-marvel-red text-white text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      Assign Task
                    </button>

                    <button
                      onClick={() => toggleCheckIn(vol.id)}
                      className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-[11px] font-bold cursor-pointer"
                    >
                      {vol.status === "CHECKED_IN" ? "Check-Out" : "Check-In"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE VOLUNTEER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full marvel-card p-6 rounded-3xl border border-arc-cyan/40 bg-[#0A0D1A] space-y-4">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">Register Volunteer Staff</h3>
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

      {/* ASSIGN TASK MODAL */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full marvel-card p-6 rounded-3xl border-2 border-marvel-red/40 bg-[#0A0D1A] space-y-4 relative shadow-[0_0_50px_rgba(237,29,36,0.3)]">
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
                <label className="block text-white/70 font-bold mb-1">Task Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Task instructions..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full px-4 py-3 bg-black/60 border border-white/15 rounded-xl text-white focus:border-arc-cyan focus:outline-none"
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

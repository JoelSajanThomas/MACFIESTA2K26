import { useEffect } from "react";
import {
  RiTeamLine,
  RiUserStarLine,
  RiUserLine,
  RiCheckLine,
  RiCloseLine,
  RiPhoneLine,
  RiMailLine,
  RiBuilding4Line,
  RiGraduationCapLine,
  RiShieldCheckLine,
  RiAlertLine,
} from "react-icons/ri";

const APPROVAL_OPTIONS = [
  { value: "approved", label: "Approve Squad", color: "bg-emerald-600 hover:bg-emerald-500 text-white", border: "border-emerald-500/50" },
  { value: "pending", label: "Set Pending", color: "bg-amber-600 hover:bg-amber-500 text-white", border: "border-amber-500/50" },
  { value: "rejected", label: "Reject Squad", color: "bg-rose-700 hover:bg-rose-600 text-white", border: "border-rose-500/50" },
  { value: "cancelled", label: "Cancel Squad", color: "bg-slate-700 hover:bg-slate-600 text-white", border: "border-slate-500/50" },
];

export default function SquadMembersDetailModal({
  isOpen,
  onClose,
  registration,
  onStatusUpdate,
  isUpdating = false,
}) {
  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && !isUpdating) {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, isUpdating, onClose]);

  if (!isOpen || !registration) return null;

  const teamMembers = registration.team_members || [];
  const totalMembersCount = 1 + teamMembers.length; // Captain + Teammates
  const minSize = registration.min_team_size || 1;
  const maxSize = registration.max_team_size || Math.max(minSize, totalMembersCount);

  const isBelowMin = totalMembersCount < minSize;
  const isAboveMax = totalMembersCount > maxSize;
  const isSizeCompliant = !isBelowMin && !isAboveMax;

  const isGateVerified = Boolean(
    registration.verification_attendance_marked || registration.attendance_marked
  );
  const isEventAttended = Boolean(registration.event_attendance_marked);

  const approvalStatus = registration.approval_status || "pending";
  const paymentStatus = registration.payment_status || "pending";

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="squad-detail-title"
      onClick={isUpdating ? undefined : onClose}
    >
      <div
        className="relative w-full max-w-4xl my-auto bg-[#0B0F19] border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Accent Glow */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-purple-500 to-cyan-400" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-start justify-between gap-4 bg-white/[0.02]">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/20 to-purple-600/20 border border-amber-400/40 flex items-center justify-center text-amber-400 flex-shrink-0 shadow-inner">
              <RiTeamLine className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/15 text-amber-300 border border-amber-400/30">
                  Squad Event Approval
                </span>
                <span className="text-xs text-white/50 font-mono">
                  Reg #{registration.registration_number || registration.id}
                </span>
              </div>
              <h2
                id="squad-detail-title"
                className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2"
              >
                {registration.team_name || `${registration.participant_name}'s Squad`}
              </h2>
              <p className="text-xs sm:text-sm text-white/60 font-medium">
                Mission: <strong className="text-white">{registration.event_title}</strong>
                {registration.college_name ? ` · ${registration.college_name}` : ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isUpdating}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors flex-shrink-0"
            title="Close modal (Esc)"
          >
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* Capacity & Compliance Status Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <div>
              <span className="block text-[11px] text-white/50 uppercase tracking-wider font-semibold">
                Squad Capacity
              </span>
              <div className="mt-1 font-bold text-white text-sm flex items-center gap-1.5">
                <span>{totalMembersCount} Total Members</span>
              </div>
              <span className="text-[10px] text-white/40">
                1 Captain + {teamMembers.length} {teamMembers.length === 1 ? "Teammate" : "Teammates"}
              </span>
            </div>

            <div>
              <span className="block text-[11px] text-white/50 uppercase tracking-wider font-semibold">
                Event Team Size Limit
              </span>
              <div className="mt-1 font-bold text-white text-sm">
                Min {minSize} · Max {maxSize}
              </div>
              <span
                className={`inline-block mt-0.5 text-[10px] font-bold ${
                  isSizeCompliant ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {isSizeCompliant
                  ? "✓ Size Requirement Met"
                  : isBelowMin
                  ? `⚠️ Needs ${minSize - totalMembersCount} more`
                  : `⚠️ Exceeds max by ${totalMembersCount - maxSize}`}
              </span>
            </div>

            <div>
              <span className="block text-[11px] text-white/50 uppercase tracking-wider font-semibold">
                Payment Status
              </span>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                    paymentStatus === "paid" || paymentStatus === "waived"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : paymentStatus === "failed" || paymentStatus === "rejected"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  }`}
                >
                  {paymentStatus}
                </span>
              </div>
              <span className="text-[10px] text-white/40 block mt-0.5">
                Fee: {registration.payment_amount ? `₹${registration.payment_amount}` : "Free"}
              </span>
            </div>

            <div>
              <span className="block text-[11px] text-white/50 uppercase tracking-wider font-semibold">
                Approval Status
              </span>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                    approvalStatus === "approved"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : approvalStatus === "rejected" || approvalStatus === "cancelled"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  }`}
                >
                  {approvalStatus}
                </span>
              </div>
              <span className="text-[10px] text-white/40 block mt-0.5">
                {approvalStatus === "approved" ? "Verified for entry" : "Pending admin review"}
              </span>
            </div>
          </div>

          {/* SQUAD APPROVAL ACTION DECK */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-emerald-500/10 border border-amber-500/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <RiShieldCheckLine className="w-4 h-4" />
                  Squad Approval Actions
                </h3>
                <p className="text-[11px] text-white/60">
                  Inspect the captain and teammate details below, then choose an approval action:
                </p>
              </div>

              {isUpdating && (
                <div className="text-xs text-amber-300 font-bold animate-pulse flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                  Updating Squad Status…
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {APPROVAL_OPTIONS.map((opt) => {
                const isActive = approvalStatus === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={isUpdating || isActive}
                    onClick={() => onStatusUpdate && onStatusUpdate(registration, "approval_status", opt.value)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 border ${
                      isActive
                        ? `${opt.color} ${opt.border} ring-2 ring-white/30 cursor-default opacity-100 font-black`
                        : "bg-white/5 hover:bg-white/15 border-white/15 text-white/80 hover:text-white"
                    }`}
                  >
                    {isActive ? <RiCheckLine className="w-3.5 h-3.5 text-white" /> : null}
                    {opt.label}
                    {isActive ? " (Current)" : ""}
                  </button>
                );
              })}
            </div>

            {/* Attendance & Verification Quick Toggles */}
            <div className="mt-3.5 pt-3 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs">
              <span className="text-white/50 text-[11px] uppercase tracking-wider font-semibold">
                Gate & Event Checks:
              </span>
              <label className="inline-flex items-center gap-2 cursor-pointer text-white/80 hover:text-white">
                <input
                  type="checkbox"
                  checked={isGateVerified}
                  disabled={isUpdating}
                  onChange={(e) =>
                    onStatusUpdate &&
                    onStatusUpdate(registration, "verification_attendance_marked", e.target.checked)
                  }
                  className="rounded border-white/20 bg-black/40 text-amber-400 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span>Gate Check-In {isGateVerified ? "(Verified)" : "(Pending)"}</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer text-white/80 hover:text-white">
                <input
                  type="checkbox"
                  checked={isEventAttended}
                  disabled={isUpdating}
                  onChange={(e) =>
                    onStatusUpdate &&
                    onStatusUpdate(registration, "event_attendance_marked", e.target.checked)
                  }
                  className="rounded border-white/20 bg-black/40 text-amber-400 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span>Event Arena Attendance {isEventAttended ? "(Present)" : "(Pending)"}</span>
              </label>
            </div>
          </div>

          {/* CAPTAIN DETAILS CARD */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <RiUserStarLine className="w-4 h-4" />
                Team Captain (Primary Registrant)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Captain
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/[0.04] border border-amber-500/30 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-base font-black text-white">
                    {registration.participant_name}
                  </h4>
                  <p className="text-xs text-white/60 flex items-center gap-2 flex-wrap mt-0.5">
                    {registration.college_name && (
                      <span className="flex items-center gap-1">
                        <RiBuilding4Line className="w-3.5 h-3.5 text-amber-400" />
                        {registration.college_name}
                      </span>
                    )}
                    {registration.department && (
                      <span className="flex items-center gap-1">
                        <RiGraduationCapLine className="w-3.5 h-3.5 text-amber-400" />
                        {registration.department}
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {registration.gender && (
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-white/70 text-[10px] uppercase font-bold">
                      {registration.gender}
                    </span>
                  )}
                  {registration.register_number && (
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-white/70 text-[10px] font-mono font-bold">
                      Roll/Reg: {registration.register_number}
                    </span>
                  )}
                </div>
              </div>

              {/* Captain Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
                {registration.phone && (
                  <a
                    href={`tel:${registration.phone}`}
                    className="flex items-center gap-2 text-white/80 hover:text-amber-300 transition-colors p-2 rounded-xl bg-white/[0.03] border border-white/5"
                  >
                    <RiPhoneLine className="w-4 h-4 text-amber-400" />
                    <span>{registration.phone}</span>
                  </a>
                )}
                {registration.email && (
                  <a
                    href={`mailto:${registration.email}`}
                    className="flex items-center gap-2 text-white/80 hover:text-amber-300 transition-colors p-2 rounded-xl bg-white/[0.03] border border-white/5"
                  >
                    <RiMailLine className="w-4 h-4 text-amber-400" />
                    <span className="truncate">{registration.email}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* TEAMMATES LIST */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <RiUserLine className="w-4 h-4" />
                Squad Teammates ({teamMembers.length})
              </h3>
              <span className="text-[11px] text-white/50">
                {teamMembers.length === 0
                  ? "No additional teammates registered"
                  : `${teamMembers.length} additional ${teamMembers.length === 1 ? "member" : "members"}`}
              </span>
            </div>

            {teamMembers.length === 0 ? (
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-center text-white/50">
                <RiAlertLine className="w-6 h-6 mx-auto mb-1 text-white/30" />
                <p className="font-semibold text-xs text-white/70">No Teammate Records Found</p>
                <p className="text-[11px] mt-0.5">
                  Only the captain is currently registered for this squad.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {teamMembers.map((member, idx) => (
                  <div
                    key={member.id || idx}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-purple-500/40 transition-colors space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">
                          Teammate #{idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-white">{member.name}</h4>
                      </div>
                      <div className="flex items-center gap-1">
                        {member.gender && member.gender !== "unspecified" && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold bg-white/10 text-white/70">
                            {member.gender}
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {member.role || "Member"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-[11px] text-white/60">
                      {member.college_name && (
                        <div className="flex items-center gap-1.5">
                          <RiBuilding4Line className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                          <span className="truncate">{member.college_name}</span>
                        </div>
                      )}
                      {member.department && (
                        <div className="flex items-center gap-1.5">
                          <RiGraduationCapLine className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                          <span className="truncate">{member.department}</span>
                        </div>
                      )}
                      {member.register_number && (
                        <div className="text-[10px] font-mono text-white/50">
                          Roll/Reg: <strong className="text-white/80">{member.register_number}</strong>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-white/5 space-y-1 text-[11px]">
                      {member.phone && (
                        <a
                          href={`tel:${member.phone}`}
                          className="flex items-center gap-1.5 text-white/80 hover:text-purple-300 transition-colors truncate"
                        >
                          <RiPhoneLine className="w-3 h-3 text-purple-400 flex-shrink-0" />
                          <span>{member.phone}</span>
                        </a>
                      )}
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="flex items-center gap-1.5 text-white/80 hover:text-purple-300 transition-colors truncate"
                        >
                          <RiMailLine className="w-3 h-3 text-purple-400 flex-shrink-0" />
                          <span className="truncate">{member.email}</span>
                        </a>
                      )}
                    </div>

                    {/* Member Attendance / Status Badges */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                      <span className="text-white/40">Status:</span>
                      <div className="flex items-center gap-1">
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold ${
                            member.verification_attendance_marked || member.attendance_marked
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-white/5 text-white/40"
                          }`}
                        >
                          {member.verification_attendance_marked || member.attendance_marked
                            ? "Gate Verified"
                            : "Gate Pending"}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold ${
                            member.event_attendance_marked
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-white/5 text-white/40"
                          }`}
                        >
                          {member.event_attendance_marked ? "Arena Present" : "Arena Pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-white/[0.02] flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs text-white/50">
            Current Status: <strong className="text-white capitalize">{approvalStatus}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isUpdating}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all ml-auto cursor-pointer"
          >
            Done / Close
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiShieldCheckLine,
  RiTeamLine,
  RiUserAddLine,
  RiMailLine,
  RiPhoneLine,
  RiBuildingLine,
  RiQrCodeLine,
  RiCloseLine,
  RiCheckLine,
  RiAlertLine,
  RiDeleteBin7Line,
  RiUserStarLine,
  RiWhatsappLine,
  RiFileCopyLine,
} from "react-icons/ri";
import StatusChip from "./theme/StatusChip";
import PaymentProofPanel from "./PaymentProofPanel";
import { registrationQrImageUrl, calculateBatchFees } from "../utils/registrationFees";
import {
  inviteTeamMember,
  removeTeamMember,
} from "../services/api";

export default function TeamDashboardCard({
  registration,
  allRegistrations = [],
  currentUser,
  payment,
  onRefresh,
  onCancel,
  isCancelling = false,
}) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    phone: "",
    college_name: registration.college_name || "",
    department: registration.department || "",
    register_number: "",
    gender: "unspecified",
  });
  const [inviting, setInviting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Captain permission check: Only captain or staff can pay for team/members
  const isCaptain = Boolean(
    registration.is_captain ??
    (currentUser && (currentUser.id === registration.user || currentUser.email === registration.email || currentUser.is_staff))
  );

  // Master team QR modal state
  const [showTeamQrModal, setShowTeamQrModal] = useState(false);
  const [selectedMemberQr, setSelectedMemberQr] = useState(null);
  // Captain payment panel
  const [showCaptainPayPanel, setShowCaptainPayPanel] = useState(false);

  const batchRegs = registration.payment_batch_id && Array.isArray(allRegistrations) && allRegistrations.length
    ? allRegistrations.filter((r) => r.payment_batch_id === registration.payment_batch_id)
    : [registration];
  const batchFees = calculateBatchFees(batchRegs);

  const maxMembers = registration.max_team_size || registration.eventData?.max_team_size || 4;
  const minMembers = registration.min_team_size || registration.eventData?.min_team_size || 2;
  const members = registration.team_members || [];

  // Team capacity and payment calculation
  const totalJoinedCount = 1 + members.filter((m) => m.invitation_status === "accepted").length;
  const totalSlotsCount = 1 + members.length;
  const progressPercent = Math.min(100, Math.round((totalJoinedCount / maxMembers) * 100));

  // Single payment model: Captain's verified payment clears the entire team
  const captainPaid = registration.payment_status === "paid" || registration.payment_status === "waived";
  const isTeamFull = totalJoinedCount >= minMembers;
  const isAllPaid = captainPaid;
  const isLocked = Boolean(registration.is_locked || registration.is_team_locked || captainPaid);
  const canModifyTeam = isCaptain && !isLocked && registration.approval_status !== "cancelled";

  // Generate shareable squad invite URL & text
  const inviteLink = `${window.location.origin}/student-dashboard`;
  const eventTitle = registration.event_title || registration.eventData?.title || "MacFiesta 2026";
  const shareMessage = `🔥 Join my squad *Team ${registration.team_name}* for *${eventTitle}* at MacFiesta 2026!\n\n👉 Login to your account at ${inviteLink} to accept the squad invitation. Let's assemble and dominate! ⚡`;

  function handleCopyInviteLink() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${shareMessage}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  }

  function handleShareWhatsApp() {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, "_blank");
  }

  async function handleSendInvite(e) {
    e.preventDefault();
    setInviting(true);
    setActionError("");
    setActionSuccess("");
    try {
      await inviteTeamMember(registration.id, inviteForm);
      setActionSuccess(`Invitation sent to ${inviteForm.name} (${inviteForm.email})! Share the invite link on WhatsApp.`);
      setShowInviteModal(false);
      setInviteForm({
        name: "",
        email: "",
        phone: "",
        college_name: registration.college_name || "",
        department: registration.department || "",
        register_number: "",
        gender: "unspecified",
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      const data = err?.response?.data;
      const msg = data?.detail || data?.email || (typeof data === "string" ? data : "Failed to invite member.");
      setActionError(String(msg));
    } finally {
      setInviting(false);
    }
  }

  async function handleRemoveMember(memberId) {
    if (!window.confirm("Are you sure you want to remove this team member?")) return;
    try {
      await removeTeamMember(registration.id, memberId);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err?.response?.data?.detail || "Could not remove member.");
    }
  }

  // Placeholder empty slots
  const emptySlotsCount = Math.max(0, maxMembers - 1 - members.length);
  const emptySlots = Array.from({ length: emptySlotsCount }, (_, idx) => idx + 1);

  return (
    <div className="marvel-card p-6 sm:p-8 rounded-3xl border border-metallic-gold/30 bg-[#0A0D1A]/95 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl space-y-8">
      {/* ─── Top Bar: Team Overview & Progress ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-metallic-gold/15 text-metallic-gold border border-metallic-gold/40 text-[10px] font-black uppercase tracking-wider font-space">
              TEAM REGISTRATION · SQUAD
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-white/5 text-white/70 border border-white/10 text-[10px] font-mono">
              Reg #{registration.registration_number}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-excon-black tracking-tight">
            Team {registration.team_name || "Avengers Assemble"}
          </h2>
          <p className="text-xs text-white/60 font-space">
            Mission: <strong className="text-metallic-gold">{registration.event_title || registration.eventData?.title}</strong>
          </p>
          {!isCaptain && (
            <p className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-300 font-space">
              <RiCheckLine className="shrink-0" />
              You are registered for this team event. No approval is required.
            </p>
          )}
        </div>

        {/* Progress & Lock Status Badge */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/10">
          <div className="space-y-1.5 min-w-[160px]">
            <div className="flex justify-between text-[11px] font-mono font-bold">
              <span className="text-white/60">Squad Strength</span>
              <span className="text-metallic-gold font-black">
                {totalJoinedCount} / {maxMembers} ({progressPercent}%)
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-black/60 border border-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-metallic-gold to-arc-cyan transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {registration.approval_status === "cancelled" ? (
              <span className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 text-[11px] font-black uppercase font-mono flex items-center gap-1.5">
                <RiAlertLine />
                <span>Squad Registration Cancelled</span>
              </span>
            ) : isTeamFull && isAllPaid ? (
              <>
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-black uppercase font-mono flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <RiShieldCheckLine />
                  <span>Approved &amp; Confirmed</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowTeamQrModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-arc-cyan/20 hover:bg-arc-cyan text-arc-cyan hover:text-black border border-arc-cyan/40 text-[11px] font-black uppercase transition-all flex items-center gap-1 font-excon-bold cursor-pointer"
                >
                  <RiQrCodeLine />
                  <span>Team Pass</span>
                </button>
              </>
            ) : registration.payment_status === "initiated" ? (
              <span className="px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[11px] font-black uppercase font-mono flex items-center gap-1.5">
                <RiShieldCheckLine />
                <span>Payment Initiated</span>
              </span>
            ) : !isTeamFull ? (
              <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-black uppercase font-mono flex items-center gap-1.5">
                <RiAlertLine />
                <span>Squad Forming ({totalJoinedCount}/{minMembers} Min)</span>
              </span>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-black uppercase font-mono flex items-center gap-1.5">
                <RiAlertLine />
                <span>Ready for Payment</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-between font-mono">
          <span>{actionError}</span>
          <button type="button" onClick={() => setActionError("")} className="text-white/60">
            <RiCloseLine />
          </button>
        </div>
      )}

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between font-mono">
          <span>{actionSuccess}</span>
          <button type="button" onClick={() => setActionSuccess("")} className="text-white/60">
            <RiCloseLine />
          </button>
        </div>
      )}

      {/* ─── Pinned Captain Card ─── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-black tracking-widest text-metallic-gold flex items-center gap-2 font-mono">
            <RiUserStarLine className="text-base" />
            <span>COMMANDING OFFICER · TEAM CAPTAIN (PINNED)</span>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-metallic-gold/20 text-metallic-gold border border-metallic-gold/40 text-[10px] font-black uppercase font-mono">
            CAPTAIN LOCK
          </span>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-metallic-gold/10 via-[#11162B] to-[#0A0D1A] border-2 border-metallic-gold/50 shadow-[0_0_30px_rgba(212,175,55,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-metallic-gold/20 border-2 border-metallic-gold flex items-center justify-center text-metallic-gold text-2xl font-black shrink-0 shadow-lg">
              <RiUserStarLine />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-black text-white uppercase font-excon-black">
                  {registration.participant_name}
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-metallic-gold text-black text-[9px] font-black uppercase font-mono">
                  ★ CAPTAIN
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/70 font-mono">
                <span className="flex items-center gap-1">
                  <RiBuildingLine className="text-metallic-gold" />
                  {registration.college_name}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 text-xs text-white/50 font-mono">
                <span className="flex items-center gap-1">
                  <RiMailLine /> {registration.email}
                </span>
                <span className="flex items-center gap-1">
                  <RiPhoneLine /> {registration.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Captain Status */}
          <div className="flex flex-wrap items-center gap-3 self-end md:self-center">
            <div className="text-right space-y-1">
              <span className="block text-[10px] uppercase font-bold text-white/40 font-mono">Captain Status</span>
              <div className="flex items-center gap-1.5">
                <StatusChip status={registration.payment_status} />
                {registration.attendance_marked && <StatusChip status="verified" label="Checked-In" />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Separate Payment Summary Breakdown Strip */}
      {isCaptain && !captainPaid && Number(batchFees.paymentAmountTotal || registration.payment_amount) > 0 && registration.approval_status !== "cancelled" && (
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-metallic-gold/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-white/60">
              Squad Mission Fee: <strong className="text-metallic-gold font-bold">₹{batchFees.eventFeeTotal.toLocaleString("en-IN")}</strong>
            </span>
            {batchFees.hasAccommodation && (
              <span className="text-white/60">
                Stay &amp; Food: <strong className="text-arc-cyan font-bold">₹{batchFees.hospitalityTotal.toLocaleString("en-IN")}</strong>
              </span>
            )}
          </div>
          <div className="text-white/70">
            Total Payable: <strong className="text-metallic-gold text-sm font-black">₹{batchFees.paymentAmountTotal.toLocaleString("en-IN")}</strong>
          </div>
        </div>
      )}

      {/* ─── Captain Action Buttons (mirrors solo registration UI) ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* View Team Pass — when approved & paid */}
        {captainPaid && registration.approval_status !== "cancelled" && (
          <button
            type="button"
            onClick={() => setShowTeamQrModal(true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-metallic-gold hover:bg-white text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] font-excon-black inline-flex items-center justify-center gap-2 cursor-pointer text-center"
          >
            <RiQrCodeLine className="text-sm" />
            <span>View Team Pass</span>
          </button>
        )}

        {/* Pay / Upload Proof — Captain only, unpaid */}
        {isCaptain && !captainPaid && Number(registration.payment_amount) > 0 && registration.approval_status !== "cancelled" && (
          !isTeamFull ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <button
                type="button"
                disabled
                className="w-full sm:w-auto px-4 py-2.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold text-xs uppercase tracking-wider rounded-xl cursor-not-allowed text-center opacity-70 font-mono inline-flex items-center justify-center gap-1.5"
                title={`Add at least ${minMembers - totalJoinedCount} more member(s) to unlock payment`}
              >
                <RiAlertLine />
                <span>Payment Locked (Min {minMembers} Members Required)</span>
              </button>
              <span className="text-[11px] text-amber-400/90 font-mono">
                Need {minMembers - totalJoinedCount} more member(s) to enable payment
              </span>
            </div>
          ) : (
            <button
              type="button"
              className="w-full sm:w-auto px-4 py-2.5 bg-metallic-gold/15 hover:bg-metallic-gold/30 text-metallic-gold border border-metallic-gold/40 font-bold text-xs uppercase tracking-wider rounded-xl transition-all font-excon-bold cursor-pointer text-center"
              onClick={() => setShowCaptainPayPanel((v) => !v)}
            >
              {showCaptainPayPanel ? "Hide Payment Details" : "💳 Pay / Upload Proof"}
            </button>
          )
        )}

        {/* Non-Captain Notice */}
        {!isCaptain && !captainPaid && registration.approval_status !== "cancelled" && (
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 text-xs text-white/70 font-mono flex items-center gap-2">
            <RiShieldCheckLine className="text-arc-cyan shrink-0" />
            <span>Payment is managed and completed exclusively by Team Captain ({registration.participant_name}).</span>
          </div>
        )}

        {/* Cancel Squad Registration — Captain only, before attendance, unpaid/unlocked */}
        {isCaptain && !registration.attendance_marked && !isLocked && registration.approval_status !== "cancelled" && (
          <button
            type="button"
            className="w-full sm:w-auto px-3.5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-xs uppercase tracking-wider rounded-xl transition-all font-excon-bold sm:ml-auto cursor-pointer text-center"
            disabled={isCancelling}
            onClick={() => onCancel && onCancel(registration)}
          >
            {isCancelling ? "Cancelling…" : "Cancel Reg"}
          </button>
        )}
      </div>

      {/* ─── Expandable Captain Payment Panel (same as solo) ─── */}
      {showCaptainPayPanel && isCaptain && !captainPaid && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="pt-4 border-t border-white/10"
        >
          <PaymentProofPanel
            registration={registration}
            registrations={batchRegs}
            paymentAmountTotal={batchFees.paymentAmountTotal}
            eventFeeTotal={batchFees.eventFeeTotal}
            accommodationFeeTotal={batchFees.accommodationFeeTotal}
            foodFeeTotal={batchFees.foodFeeTotal}
            hospitalityTotal={batchFees.hospitalityTotal}
            payment={payment}
            onUpdated={() => {
              setShowCaptainPayPanel(false);
              if (onRefresh) onRefresh();
            }}
          />
        </motion.div>
      )}

      {/* ─── Team Members Section (Member 1, Member 2, ...) ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-black tracking-widest text-arc-cyan flex items-center gap-2 font-mono">
            <RiTeamLine className="text-base" />
            <span>SQUAD ROSTER &amp; MEMBER SLOTS ({members.length + 1} / {maxMembers})</span>
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/40 text-xs font-black uppercase tracking-wider transition-all font-mono cursor-pointer shadow-md"
              title="Share squad invitation on WhatsApp"
            >
              <RiWhatsappLine className="text-sm text-emerald-400" />
              <span>WhatsApp Invite</span>
            </button>

            <button
              type="button"
              onClick={handleCopyInviteLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all font-mono cursor-pointer"
              title="Copy squad invitation link"
            >
              {copiedLink ? <RiCheckLine className="text-emerald-400" /> : <RiFileCopyLine />}
              <span>{copiedLink ? "Link Copied!" : "Copy Link"}</span>
            </button>

            {canModifyTeam && totalSlotsCount < maxMembers && (
              <button
                type="button"
                onClick={() => setShowInviteModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-metallic-gold hover:bg-white text-black text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] font-excon-bold cursor-pointer"
              >
                <RiUserAddLine />
                <span>+ Direct Invite</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((member, idx) => {
            const isAccepted = member.invitation_status === "accepted";
            const isPaid =
              member.payment_status === "paid" ||
              member.payment_status === "waived" ||
              captainPaid;

            return (
              <div
                key={member.id}
                className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all space-y-4 relative flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-arc-cyan/10 border border-arc-cyan/30 text-arc-cyan flex items-center justify-center font-black text-sm">
                        M{idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-black text-white uppercase font-excon-bold">
                            {member.name}
                          </h5>
                          <span className="text-[10px] text-white/40 font-mono">
                            Slot #{idx + 2}
                          </span>
                        </div>
                        <span className="text-xs text-white/60 font-mono block truncate max-w-[200px]">
                          {member.email}
                        </span>
                      </div>
                    </div>

                    {canModifyTeam && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-white/30 hover:text-red-400 p-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Remove Member"
                      >
                        <RiDeleteBin7Line className="text-base" />
                      </button>
                    )}
                  </div>

                  {/* Member Details */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono p-3 rounded-xl bg-black/40 border border-white/5">
                    <div>
                      <span className="text-white/40 block">Phone:</span>
                      <span className="text-white">{member.phone || "—"}</span>
                    </div>
                    <div>
                      <span className="text-white/40 block">College:</span>
                      <span className="text-white truncate block">{member.college_name || "—"}</span>
                    </div>
                  </div>

                  {/* Dual Verification Tags & Invitation State */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {member.invitation_status === "pending" ? (
                      <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-bold font-mono">
                        Invitation Pending
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold font-mono">
                        Joined Team
                      </span>
                    )}

                    <StatusChip status={member.payment_status} label={`Pay: ${member.payment_status}`} />

                    {member.finance_status === "verified" && (
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 text-[10px] font-mono font-bold">
                        Finance Verified
                      </span>
                    )}
                    {member.organizer_status === "verified" && (
                      <span className="px-2 py-0.5 rounded-lg bg-arc-cyan/15 text-arc-cyan text-[10px] font-mono font-bold">
                        Organizer Approved
                      </span>
                    )}
                  </div>
                </div>

                {/* Member Card Footer Actions */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  {isPaid ? (
                    <button
                      type="button"
                      onClick={() => setSelectedMemberQr(member)}
                      className="text-xs text-arc-cyan hover:underline flex items-center gap-1 font-mono font-bold cursor-pointer"
                    >
                      <RiQrCodeLine />
                      <span>Member Pass</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-amber-400 font-mono font-bold flex items-center gap-1">
                      <RiAlertLine />
                      <span>Pass Locked (Unpaid)</span>
                    </span>
                  )}

                  {!isPaid && isAccepted && !isCaptain && (
                    <span className="text-[10px] text-white/40 font-mono italic">
                      Captain must pay for team
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Empty Slot Placeholders */}
          {emptySlots.map((slotNum) => (
            <div
              key={`empty-${slotNum}`}
              onClick={() => {
                if (canModifyTeam) setShowInviteModal(true);
              }}
              className={`p-6 rounded-2xl border-2 border-dashed ${
                canModifyTeam
                  ? "border-white/15 hover:border-metallic-gold/40 bg-white/[0.01] hover:bg-white/[0.03] cursor-pointer group"
                  : "border-white/10 bg-white/[0.005] opacity-50 cursor-not-allowed"
              } transition-all flex flex-col items-center justify-center text-center gap-3 min-h-[180px]`}
            >
              <div
                className={`w-10 h-10 rounded-xl ${
                  canModifyTeam
                    ? "bg-white/5 group-hover:bg-metallic-gold/20 text-white/40 group-hover:text-metallic-gold"
                    : "bg-white/5 text-white/20"
                } flex items-center justify-center text-lg transition-colors`}
              >
                <RiUserAddLine />
              </div>
              <div className="space-y-1">
                <span
                  className={`text-xs font-black uppercase ${
                    canModifyTeam ? "text-white/70 group-hover:text-white" : "text-white/40"
                  } font-excon-bold`}
                >
                  Empty Slot #{members.length + 1 + slotNum}
                </span>
                <p className="text-[11px] text-white/40 font-mono">
                  {isLocked
                    ? "Squad roster is locked"
                    : canModifyTeam
                    ? "Click to invite participant to squad"
                    : "Only Captain can invite members"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Add Member / Invitation Modal ─── */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="marvel-card max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-metallic-gold/40 bg-[#0A0D1A] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 text-metallic-gold font-black uppercase text-sm font-excon-black">
                  <RiUserAddLine className="text-lg" />
                  <span>Invite Squad Member</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="text-white/40 hover:text-white p-1"
                >
                  <RiCloseLine className="text-xl" />
                </button>
              </div>

              {/* Quick WhatsApp / Share Link Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-arc-cyan/10 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-emerald-400 font-mono flex items-center gap-1.5">
                    <RiWhatsappLine className="text-base text-emerald-400" />
                    <span>Invite via WhatsApp or Link</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyInviteLink}
                    className="text-[11px] text-metallic-gold hover:text-white font-mono flex items-center gap-1 cursor-pointer"
                  >
                    {copiedLink ? <RiCheckLine className="text-emerald-400" /> : <RiFileCopyLine />}
                    <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
                  </button>
                </div>
                <p className="text-xs text-white/70 font-space leading-relaxed">
                  Share this invitation directly with your teammate. They can register/login to accept and submit their member pass.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 font-excon-black cursor-pointer shadow-lg"
                  >
                    <RiWhatsappLine className="text-sm" />
                    <span>Share on WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyInviteLink}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold font-mono cursor-pointer"
                  >
                    {copiedLink ? "✓ Copied" : "Copy Message"}
                  </button>
                </div>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink mx-4 text-[10px] uppercase font-mono text-white/40 font-bold">OR Add Teammate Details</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              {/* Invite Form */}
              <form onSubmit={handleSendInvite} className="space-y-4 font-space text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-white/50 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                    placeholder="e.g. Tony Stark"
                    className="w-full px-3.5 py-2 bg-black/60 border border-white/15 rounded-xl text-white focus:outline-none focus:border-metallic-gold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-white/50 mb-1">
                    Email Address (Login ID) *
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    placeholder="student@example.com"
                    className="w-full px-3.5 py-2 bg-black/60 border border-white/15 rounded-xl text-white focus:outline-none focus:border-metallic-gold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-white/50 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={inviteForm.phone}
                    onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                    placeholder="10-digit mobile"
                    className="w-full px-3.5 py-2 bg-black/60 border border-white/15 rounded-xl text-white focus:outline-none focus:border-metallic-gold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-white/50 mb-1">
                    College / Institution
                  </label>
                  <input
                    type="text"
                    value={inviteForm.college_name}
                    onChange={(e) => setInviteForm({ ...inviteForm, college_name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-black/60 border border-white/15 rounded-xl text-white focus:outline-none focus:border-metallic-gold"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviting}
                    className="px-6 py-2 rounded-xl bg-metallic-gold hover:bg-white text-black text-xs font-black uppercase tracking-wider font-excon-black shadow-lg cursor-pointer"
                  >
                    {inviting ? "Sending Invite…" : "Send Squad Invitation"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Master Team QR Modal ─── */}
      <AnimatePresence>
        {showTeamQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="marvel-card max-w-md w-full p-6 sm:p-8 rounded-3xl border border-metallic-gold/50 bg-[#0A0D1A] shadow-2xl text-center space-y-5"
            >
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-metallic-gold tracking-widest font-mono">
                  S.H.I.E.L.D. SQUAD MASTER PASS
                </span>
                <h3 className="text-xl font-black uppercase text-white font-excon-black">
                  Team {registration.team_name}
                </h3>
                <p className="text-xs text-white/60 font-mono">
                  Captain: {registration.participant_name} · Reg #{registration.registration_number}
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl inline-block shadow-2xl border-4 border-metallic-gold">
                <img
                  src={registrationQrImageUrl(registration.registration_number, 220)}
                  alt="Team Master Pass QR"
                  className="w-48 h-48 object-contain"
                />
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono text-left space-y-1">
                <div className="flex justify-between">
                  <span className="text-white/40">Squad Status:</span>
                  <span className="text-metallic-gold font-bold">
                    {totalJoinedCount} / {maxMembers} Members Joined
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Fee Clearance:</span>
                  <span className={isAllPaid ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                    {isAllPaid ? "Team Fee Verified ✓" : "Pending Captain Payment"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowTeamQrModal(false)}
                className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase rounded-xl font-excon-bold"
              >
                Close Pass
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Individual Member QR Modal ─── */}
      <AnimatePresence>
        {selectedMemberQr && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="marvel-card max-w-sm w-full p-6 rounded-3xl border border-arc-cyan/50 bg-[#0A0D1A] shadow-2xl text-center space-y-4"
            >
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-arc-cyan tracking-widest font-mono">
                  MEMBER CLEARANCE PASS
                </span>
                <h3 className="text-lg font-black uppercase text-white font-excon-black">
                  {selectedMemberQr.name}
                </h3>
                <p className="text-xs text-white/60 font-mono">
                  Team: {registration.team_name} · Code: {selectedMemberQr.qr_pass_code}
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl inline-block shadow-xl border-2 border-arc-cyan">
                <img
                  src={registrationQrImageUrl(registration.registration_number, 200)}
                  alt="Team Squad QR Pass"
                  className="w-44 h-44 object-contain"
                />
              </div>

              <button
                type="button"
                onClick={() => setSelectedMemberQr(null)}
                className="w-full py-2 bg-white/10 text-white text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

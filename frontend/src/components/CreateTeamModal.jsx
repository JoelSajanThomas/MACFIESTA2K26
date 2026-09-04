import { useState } from "react";
import { motion } from "framer-motion";
import {
  RiShieldFlashLine,
  RiUserStarLine,
  RiCloseLine,
} from "react-icons/ri";
import CollegeSchoolPicker from "./CollegeSchoolPicker";
import { createTeamRegistration } from "../services/api";

export default function CreateTeamModal({ event, user, isOpen, onClose, onSuccess }) {
  const [teamName, setTeamName] = useState("");
  const [collegeName, setCollegeName] = useState(user?.college_name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !event) return null;

  const maxTeamSize = event.max_team_size || event.maxTeamSize || 4;
  const minTeamSize = event.min_team_size || event.minTeamSize || 2;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!teamName.trim()) {
      setError("Team name is required.");
      return;
    }
    if (!collegeName.trim()) {
      setError("College / Institution name is required.");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const res = await createTeamRegistration({
        event_id: event.id,
        team_name: teamName.trim(),
        college_name: collegeName.trim(),
        phone: phone.trim(),
      });
      if (onSuccess) {
        onSuccess(res.data);
      }
      onClose();
    } catch (err) {
      const data = err?.response?.data;
      const msg = data?.detail || data?.team_name || (typeof data === "string" ? data : "Failed to create team.");
      setError(String(msg));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-excon">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="marvel-card max-w-xl w-full p-6 sm:p-8 rounded-3xl border border-metallic-gold/50 bg-[#0A0D1A] shadow-[0_0_60px_rgba(212,175,55,0.25)] space-y-6 max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-metallic-gold/15 text-metallic-gold border border-metallic-gold/40 text-[10px] font-black uppercase tracking-wider font-mono">
              <RiShieldFlashLine />
              <span>STEP 1 · ASSEMBLE SQUAD</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black uppercase text-white font-excon-black">
              Create Team for {event.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/40 hover:text-white p-1.5 rounded-xl hover:bg-white/5 transition-colors"
          >
            <RiCloseLine className="text-xl" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
            {error}
          </div>
        )}

        {/* Pinned Captain Pre-Population Banner */}
        <div className="p-4 rounded-2xl bg-metallic-gold/10 border border-metallic-gold/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-metallic-gold/20 border border-metallic-gold text-metallic-gold flex items-center justify-center text-lg font-bold shrink-0">
              <RiUserStarLine />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-white/50 block font-mono">
                Designated Team Captain (You)
              </span>
              <span className="text-sm font-black text-white uppercase font-excon-bold block">
                {user?.full_name || user?.username || user?.email}
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-metallic-gold text-black text-[10px] font-black uppercase font-mono shadow-sm">
            ★ CAPTAIN
          </span>
        </div>

        {/* Squad Config Details */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs font-mono">
          <div>
            <span className="text-white/40 block">Team Size:</span>
            <span className="text-metallic-gold font-bold">
              {minTeamSize === maxTeamSize ? `${maxTeamSize} Members` : `${minTeamSize}–${maxTeamSize} Members`}
            </span>
          </div>
          <div>
            <span className="text-white/40 block">Entry Pass Fee:</span>
            <span className="text-arc-cyan font-bold">
              ₹{Number(event.registration_fee || event.registrationFee || 0).toLocaleString("en-IN")} / Person
            </span>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-space">
          <div>
            <label className="block text-[10px] uppercase font-bold text-white/50 mb-1 font-mono">
              Team Name *
            </label>
            <input
              type="text"
              required
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Marvel Strikers, Cyber Avengers"
              className="w-full px-4 py-3 bg-black/60 border border-white/15 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-metallic-gold font-excon-bold"
            />
          </div>

          <CollegeSchoolPicker
            label="College / School / Institution *"
            placeholder="Search your college or school name in Kerala..."
            name="college_name"
            value={collegeName}
            onChange={(name) => setCollegeName(name)}
            required
            disabled={submitting}
          />



          <div>
            <label className="block text-[10px] uppercase font-bold text-white/50 mb-1 font-mono">
              Captain WhatsApp / Contact Number *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
              className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-metallic-gold font-mono"
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-metallic-gold hover:bg-white text-black font-black text-xs uppercase tracking-widest font-excon-black shadow-[0_0_20px_rgba(212,175,55,0.4)] cursor-pointer"
            >
              {submitting ? "Creating Team…" : "Create Team & Open Workspace →"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

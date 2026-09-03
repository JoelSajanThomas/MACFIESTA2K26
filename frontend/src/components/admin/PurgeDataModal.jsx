import { useState } from "react";
import {
  RiDeleteBin7Line,
  RiCloseLine,
  RiLockPasswordLine,
  RiAlertFill,
  RiEyeLine,
  RiEyeOffLine,
  RiCheckDoubleLine,
  RiShieldFlashLine,
} from "react-icons/ri";
import { purgeAllRegisteredData } from "../../services/api";

export default function PurgeDataModal({ open, onClose, onSuccess }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successInfo, setSuccessInfo] = useState(null);

  if (!open) return null;

  const handleClose = () => {
    if (loading) return;
    setPassword("");
    setError("");
    setSuccessInfo(null);
    onClose();
  };

  const handlePurge = async (e) => {
    e.preventDefault();
    if (!password) {
      setError("Please enter your admin password to proceed.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await purgeAllRegisteredData(password);
      
      // Clear frontend cached cart / drafts
      try {
        localStorage.removeItem("macfiesta_event_cart_v1");
        localStorage.removeItem("registration_draft_v1");
        localStorage.removeItem("checkout_data_v1");
      } catch {
        // ignore storage errors
      }

      setSuccessInfo(res.data);
      if (onSuccess) {
        onSuccess(res.data);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Verification failed. Please check your password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="purge-modal-title"
    >
      <div className="relative w-full max-w-lg bg-[#070913] border border-rose-500/40 rounded-3xl shadow-[0_0_50px_rgba(244,63,94,0.25)] overflow-hidden font-excon">
        
        {/* Top Header Ambient Light */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-600 via-marvel-red to-rose-600" />
        
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Header Row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-2xl text-rose-400 shrink-0 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                <RiDeleteBin7Line />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase tracking-widest font-mono mb-1">
                  <RiShieldFlashLine />
                  <span>DANGER PROTOCOL</span>
                </div>
                <h2
                  id="purge-modal-title"
                  className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-excon-black"
                >
                  Clear Registered Data
                </h2>
              </div>
            </div>

            {!successInfo && (
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <RiCloseLine size={22} />
              </button>
            )}
          </div>

          {/* Success State */}
          {successInfo ? (
            <div className="space-y-6 py-2">
              <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-400 text-xs space-y-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <div className="flex items-center gap-2 font-black uppercase font-excon-black text-sm">
                  <RiCheckDoubleLine className="text-base" />
                  <span>Data Purge Complete</span>
                </div>
                <p className="text-white/80 leading-relaxed font-excon">
                  {successInfo.message || "All registered user records have been wiped clean."}
                </p>
                {successInfo.deleted && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-500/20 text-white/70 font-mono text-[11px]">
                    <div>Participants: <strong className="text-emerald-400">{successInfo.deleted.participants ?? 0}</strong></div>
                    <div>Registrations: <strong className="text-emerald-400">{successInfo.deleted.registrations ?? 0}</strong></div>
                    <div>Team Members: <strong className="text-emerald-400">{successInfo.deleted.team_members ?? 0}</strong></div>
                    <div>Hostel Bookings: <strong className="text-emerald-400">{successInfo.deleted.bookings ?? 0}</strong></div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3 bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-colors font-excon-black cursor-pointer shadow-lg"
              >
                Done
              </button>
            </div>
          ) : (
            /* Warning & Password Confirmation Form */
            <form onSubmit={handlePurge} className="space-y-5">
              
              <div className="p-4 bg-rose-950/40 border border-rose-500/30 rounded-2xl text-xs space-y-2 text-white/80">
                <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-wider text-[11px]">
                  <RiAlertFill className="text-sm" />
                  <span>Irreversible Destruction Notice</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-white/70 text-[11px] leading-relaxed">
                  <li>Permanently deletes <strong>all registered participant user accounts</strong>.</li>
                  <li>Wipes all <strong>event registrations, passes, and team member records</strong>.</li>
                  <li>Clears all <strong>hostel accommodation bookings and allocations</strong>.</li>
                  <li>Staff / Volunteer accounts and Festival events remain untouched.</li>
                </ul>
              </div>

              {error && (
                <div className="p-3.5 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-400 text-xs font-bold animate-shake flex items-center gap-2">
                  <RiAlertFill className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="admin-purge-password"
                  className="block text-xs font-black uppercase tracking-wider text-white/80 font-excon-bold"
                >
                  Confirm Admin Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                    <RiLockPasswordLine />
                  </div>
                  <input
                    id="admin-purge-password"
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your administrator password"
                    className="w-full pl-10 pr-12 py-3 bg-black/50 border border-white/15 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl text-white text-sm placeholder:text-white/30 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                  </button>
                </div>
                <p className="text-[10px] text-white/40">
                  You must confirm your account credentials to execute this operation.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl border border-white/15 text-white/70 hover:text-white hover:bg-white/5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !password}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-marvel-red hover:from-rose-500 hover:to-red-600 disabled:opacity-50 text-white text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(237,29,36,0.4)] flex items-center gap-2 cursor-pointer font-excon-black"
                >
                  {loading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying &amp; Purging...</span>
                    </>
                  ) : (
                    <>
                      <RiDeleteBin7Line />
                      <span>Verify &amp; Wipe All Data</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
}

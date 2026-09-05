import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  RiBookOpenLine,
  RiUploadCloud2Line,
  RiFilePdfLine,
  RiExternalLinkLine,
  RiCheckDoubleLine,
  RiDeleteBin7Line,
  RiRefreshLine,
  RiInformationLine,
  RiDownload2Line,
  RiEyeLine,
  RiShieldCheckLine,
} from "react-icons/ri";
import {
  getSiteSettings,
  updateSiteSettings,
  createSiteSettings,
  mediaUrl,
} from "../../services/api";
import { invalidateSiteSettingsCache } from "../../hooks/useSiteSettings";

export default function AdminBrochure() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [currentUrl, setCurrentUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [inputUrl, setInputUrl] = useState("");
  const [localPreviewUrl, setLocalPreviewUrl] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadSettings();
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, []);

  async function loadSettings() {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await getSiteSettings();
      const list = Array.isArray(res.data) ? res.data : (res.data?.results || [res.data]);
      const s = list[0] || {};
      if (s.id) setSettingsId(s.id);
      setCurrentFile(s.brochure_file || null);
      setCurrentUrl(s.brochure_url || "");
      setInputUrl(s.brochure_url || "");
    } catch (err) {
      setErrorMsg("Failed to load brochure settings. Please refresh.");
    } finally {
      setLoading(false);
    }
  }

  const activeBrochureTarget = localPreviewUrl
    ? localPreviewUrl
    : currentFile
    ? mediaUrl(currentFile)
    : currentUrl || null;

  function handleFileChange(file) {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMsg("Please select a valid PDF file (.pdf).");
      return;
    }
    // Limit to 40 MB
    if (file.size > 40 * 1024 * 1024) {
      setErrorMsg("File is too large. Please select a PDF smaller than 40 MB.");
      return;
    }

    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
    }
    const preview = URL.createObjectURL(file);
    setLocalPreviewUrl(preview);
    setSelectedFile(file);
    setErrorMsg("");
    setStatusMsg(`Selected "${file.name}" (${(file.size / (1024 * 1024)).toFixed(2)} MB). Click "Save & Publish Brochure" to upload.`);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  }

  async function handleSave(e) {
    if (e) e.preventDefault();
    if (!selectedFile && !inputUrl.trim() && !currentFile && !currentUrl) {
      setErrorMsg("Please upload a PDF file or provide an external brochure URL.");
      return;
    }

    setSaving(true);
    setErrorMsg("");
    setStatusMsg("");

    try {
      const payload = new FormData();
      if (selectedFile) {
        payload.append("brochure_file", selectedFile);
      }
      payload.append("brochure_url", inputUrl.trim());

      let res;
      if (settingsId) {
        res = await updateSiteSettings(settingsId, payload);
      } else {
        res = await createSiteSettings(payload);
      }

      const updated = res.data;
      if (updated?.id) setSettingsId(updated.id);
      setCurrentFile(updated?.brochure_file || null);
      setCurrentUrl(updated?.brochure_url || "");
      setSelectedFile(null);
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
        setLocalPreviewUrl(null);
      }

      invalidateSiteSettingsCache();
      setStatusMsg("Brochure successfully published! The public download directive is now live.");
      setTimeout(() => setStatusMsg(""), 6000);
    } catch (err) {
      const msg = err?.response?.data?.brochure_file?.[0] ||
        err?.response?.data?.brochure_url?.[0] ||
        err?.response?.data?.detail ||
        "Failed to save brochure. Please check the network and try again.";
      setErrorMsg(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    if (!window.confirm("Are you sure you want to remove the current brochure? Visitors to /brochure will see that the brochure is being updated.")) {
      return;
    }

    setSaving(true);
    setErrorMsg("");
    setStatusMsg("");

    try {
      const payload = new FormData();
      payload.append("brochure_url", "");
      // Sending empty string or clearing brochure_file
      if (settingsId) {
        const res = await updateSiteSettings(settingsId, {
          brochure_url: "",
          brochure_file: null,
        });
        setCurrentFile(res.data?.brochure_file || null);
        setCurrentUrl(res.data?.brochure_url || "");
      }
      setSelectedFile(null);
      setInputUrl("");
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
        setLocalPreviewUrl(null);
      }
      invalidateSiteSettingsCache();
      setStatusMsg("Brochure removed. The public page now indicates an update is in progress.");
    } catch (err) {
      setErrorMsg("Failed to remove brochure. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Notifications */}
      {statusMsg && (
        <div className="px-4 py-3 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-pulse">
          <RiCheckDoubleLine className="text-lg shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="px-4 py-3 bg-rose-500/20 border border-rose-500/50 text-rose-400 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
          <RiInformationLine className="text-lg shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-metallic-gold/30 bg-metallic-gold/10 text-metallic-gold text-xs font-bold uppercase tracking-widest mb-2">
            <RiBookOpenLine />
            <span>COMMAND OS • BROCHURE DOSSIER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider font-excon-black">
            Official Festival Brochure
          </h1>
          <p className="text-white/60 text-xs mt-1">
            Upload the official PDF directive or provide a cloud link. Instant synchronization with the public brochure download directive.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/brochure"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-action-btn admin-action-btn--secondary inline-flex items-center gap-1.5 text-xs"
            title="Open public brochure directive page"
          >
            <RiEyeLine />
            <span>View Public Page</span>
            <RiExternalLinkLine className="opacity-70 text-[10px]" />
          </Link>

          {activeBrochureTarget && (
            <a
              href={activeBrochureTarget}
              target="_blank"
              rel="noopener noreferrer"
              download="MacFiesta_Official_Brochure.pdf"
              className="admin-action-btn admin-action-btn--primary inline-flex items-center gap-1.5 text-xs"
              title="Test download current brochure"
            >
              <RiDownload2Line />
              <span>Download PDF</span>
            </a>
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-white/50 text-xs">
          <RiRefreshLine className="animate-spin text-2xl mx-auto mb-2 text-metallic-gold" />
          Loading brochure configuration...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Upload Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Live Status Card */}
            <div className="admin-ops-card p-5 rounded-2xl border border-white/10 bg-[#0B1120]/80 backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold text-white/70 uppercase tracking-wider flex items-center gap-1.5">
                  <RiShieldCheckLine className="text-metallic-gold" />
                  Active Live Status
                </span>
                {activeBrochureTarget ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                    Live & Online
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-500/20 border border-amber-500/40 text-amber-400">
                    Not Configured
                  </span>
                )}
              </div>

              {activeBrochureTarget ? (
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2 bg-black/40 p-3 rounded-xl border border-white/5 break-all">
                    <RiFilePdfLine className="text-rose-400 text-xl shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-white truncate">
                        {selectedFile
                          ? selectedFile.name
                          : currentFile
                          ? currentFile.split("/").pop()
                          : "Cloud Directive Link"}
                      </div>
                      <div className="text-[11px] text-white/50 truncate mt-0.5">
                        {activeBrochureTarget}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-white/40">
                      Source: {currentFile ? "Server File Upload" : currentUrl ? "External Cloud URL" : "Local Preview"}
                    </span>
                    <button
                      type="button"
                      onClick={handleRemove}
                      disabled={saving}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold transition-colors disabled:opacity-50"
                    >
                      <RiDeleteBin7Line />
                      <span>Remove Brochure</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-white/50 leading-relaxed">
                  No brochure file or external URL is currently configured. Visitors clicking "Download Official Brochure PDF" will see a notification that the committee is updating the file.
                </p>
              )}
            </div>

            {/* Upload Box */}
            <form onSubmit={handleSave} className="admin-ops-card p-6 rounded-2xl border border-white/10 bg-[#0B1120]/80 backdrop-blur-md shadow-xl space-y-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <RiUploadCloud2Line className="text-arc-cyan text-lg" />
                Upload Official PDF File
              </h2>

              {/* Drag & Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragOver
                    ? "border-metallic-gold bg-metallic-gold/10 scale-[1.01]"
                    : selectedFile
                    ? "border-emerald-500/50 bg-emerald-500/5"
                    : "border-white/20 hover:border-white/40 bg-black/30"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
                  }}
                />

                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-metallic-gold/10 border border-metallic-gold/30 flex items-center justify-center text-metallic-gold text-2xl">
                  {selectedFile ? <RiFilePdfLine className="text-emerald-400" /> : <RiUploadCloud2Line />}
                </div>

                {selectedFile ? (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-emerald-400">
                      File Ready to Upload: {selectedFile.name}
                    </p>
                    <p className="text-[11px] text-white/50">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Click or drag another file to replace
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">
                      Click to choose a PDF or drag and drop here
                    </p>
                    <p className="text-[11px] text-white/50">
                      Standard PDF documents up to 40 MB
                    </p>
                  </div>
                )}
              </div>

              {/* External Cloud URL Fallback */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <label className="text-xs font-bold text-white/80 block">
                  OR External Cloud Directive URL (Google Drive / Dropbox / CDN)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-arc-cyan transition-colors"
                />
                <p className="text-[11px] text-white/40">
                  If an external URL is set and no direct file is uploaded, the download button will point directly to this link.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                {(selectedFile || inputUrl !== currentUrl) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setInputUrl(currentUrl || "");
                      if (localPreviewUrl) {
                        URL.revokeObjectURL(localPreviewUrl);
                        setLocalPreviewUrl(null);
                      }
                    }}
                    disabled={saving}
                    className="admin-action-btn admin-action-btn--secondary text-xs"
                  >
                    Discard Changes
                  </button>
                )}

                <button
                  type="submit"
                  disabled={saving || (!selectedFile && inputUrl === currentUrl)}
                  className="admin-action-btn admin-action-btn--primary text-xs flex items-center gap-2"
                >
                  {saving && <RiRefreshLine className="animate-spin text-sm" />}
                  <span>{saving ? "Publishing Brochure..." : "Save & Publish Brochure"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* PDF Preview Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="admin-ops-card p-5 rounded-2xl border border-white/10 bg-[#0B1120]/80 backdrop-blur-md shadow-xl flex flex-col h-[520px]">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <RiEyeLine className="text-arc-cyan" />
                  Brochure Document Preview
                </span>
                {activeBrochureTarget && (
                  <a
                    href={activeBrochureTarget}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-arc-cyan hover:underline flex items-center gap-1"
                  >
                    <span>Full Screen</span>
                    <RiExternalLinkLine />
                  </a>
                )}
              </div>

              <div className="flex-1 rounded-xl overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center relative">
                {activeBrochureTarget ? (
                  <iframe
                    src={activeBrochureTarget}
                    title="Brochure Document Preview"
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div className="p-6 text-center text-white/40 space-y-2">
                    <RiFilePdfLine className="text-4xl mx-auto text-white/20" />
                    <p className="text-xs font-semibold text-white/60">No Document Loaded</p>
                    <p className="text-[11px] text-white/40 max-w-xs mx-auto">
                      Select or upload a PDF on the left to see an instant interactive preview here.
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-3 text-[11px] text-white/40 flex items-center justify-between">
                <span>Format: PDF Directive</span>
                <span>Responsive Viewport</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const PROFILE_KEY = "mf_participant_profile";

/** Persist college / phone from signup so checkout can prefill. */
export function saveParticipantProfile(profile) {
  try {
    const next = {
      full_name: String(profile?.full_name || "").trim(),
      college_name: String(profile?.college_name || "").trim(),
      phone: String(profile?.phone || "").trim(),
      email: String(profile?.email || "").trim(),
      gender: String(profile?.gender || "male").trim(),
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota / private mode */
  }
}

export function loadParticipantProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return null;
    return {
      full_name: String(data.full_name || "").trim(),
      college_name: String(data.college_name || "").trim(),
      phone: String(data.phone || "").trim(),
      email: String(data.email || "").trim(),
      gender: String(data.gender || "male").trim(),
    };
  } catch {
    return null;
  }
}

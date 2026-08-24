"use client";

import { useState, useEffect } from "react";

// ── 1. Judge Roles & RBAC Permissions ──────────────────────────────
export interface JudgePermissions {
  canEditSubmittedScores: boolean;
  canSaveDrafts: boolean;
  canUploadComments: boolean;
  canViewOtherJudgesScores: boolean;
  canPublishResults: boolean;
}

export interface JudgeUser {
  id: string;
  judgeCode: string; // e.g. JDG-201
  name: string;
  photoUrl?: string;
  designation: string;
  organization: string;
  email: string;
  phone: string;
  assignedEventId: string;
  assignedEventName: string;
  category: string;
  permissions: JudgePermissions;
  status: "ACTIVE" | "COMPLETED" | "STANDBY";
}

// ── 2. Rubric & Evaluation Criteria ─────────────────────────────────
export interface RubricCriterion {
  id: string;
  name: string;
  maxPoints: number;
  weightPercent: number; // e.g. 30%
}

// ── 3. Team / Participant Roster ──────────────────────────────────────
export interface TeamParticipant {
  id: string;
  teamCode: string;
  teamName: string;
  collegeName: string;
  leadName: string;
  eventId: string;
  presentationSlot: string;
  projectTitle?: string;
}

// ── 4. Team Scorecard Entry ──────────────────────────────────────────
export interface TeamScoreEntry {
  id: string;
  judgeId: string;
  teamId: string;
  criteriaScores: Record<string, number>; // criterionId -> score
  totalScore: number;
  comments: string;
  status: "DRAFT" | "SUBMITTED";
  submittedAt: string;
}

// ── 5. Jury Broadcast Announcements ──────────────────────────────────
export interface JuryBroadcastMessage {
  id: string;
  targetAudience: string;
  urgency: "NORMAL" | "HIGH" | "URGENT" | "CRITICAL";
  title: string;
  message: string;
  timestamp: string;
  sender: string;
}

// ── DEFAULT INITIAL SEED DATA ─────────────────────────────────────────
const DEFAULT_JUDGES: JudgeUser[] = [
  {
    id: "jdg-1",
    judgeCode: "JDG-201",
    name: "Dr. Vikram Sethi",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    designation: "VP of Artificial Intelligence",
    organization: "TCS Research Labs",
    email: "vikram.sethi@tcs.com",
    phone: "+91 98470 33001",
    assignedEventId: "ev-1",
    assignedEventName: "Byte & Code Hackathon",
    category: "Software & AI",
    status: "ACTIVE",
    permissions: {
      canEditSubmittedScores: true,
      canSaveDrafts: true,
      canUploadComments: true,
      canViewOtherJudgesScores: true,
      canPublishResults: false,
    },
  },
  {
    id: "jdg-2",
    judgeCode: "JDG-202",
    name: "Meera Nair",
    photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
    designation: "Choreographer & Film Director",
    organization: "Kerala Film Academy",
    email: "meera.nair@keralafilm.org",
    phone: "+91 98470 33002",
    assignedEventId: "ev-4",
    assignedEventName: "Choreo Dance & Pro Show",
    category: "Cultural & Arts",
    status: "ACTIVE",
    permissions: {
      canEditSubmittedScores: true,
      canSaveDrafts: true,
      canUploadComments: true,
      canViewOtherJudgesScores: true,
      canPublishResults: true,
    },
  },
];

const DEFAULT_RUBRIC: RubricCriterion[] = [
  { id: "cr-1", name: "Technical Complexity & Architecture", maxPoints: 30, weightPercent: 30 },
  { id: "cr-2", name: "Innovation & Problem Solving", maxPoints: 30, weightPercent: 30 },
  { id: "cr-3", name: "UI/UX & Interactive Design", maxPoints: 20, weightPercent: 20 },
  { id: "cr-4", name: "Q&A Defense & Presentation", maxPoints: 20, weightPercent: 20 },
];

const DEFAULT_TEAMS: TeamParticipant[] = [];

const DEFAULT_SCORES: TeamScoreEntry[] = [];

const DEFAULT_BROADCASTS: JuryBroadcastMessage[] = [];

// ── BROADCAST CHANNEL SYNC ──────────────────────────────────────────
let listeners: Array<() => void> = [];
let syncChannel: BroadcastChannel | null = null;

if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    syncChannel = new BroadcastChannel("macfiesta_judge_sync");
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

// ── GETTERS AND SETTERS ──────────────────────────────────────────────
export function getJudgesList(): JudgeUser[] {
  if (typeof window === "undefined") return DEFAULT_JUDGES;
  try {
    const saved = localStorage.getItem("macfiesta_judges_list");
    return saved ? JSON.parse(saved) : DEFAULT_JUDGES;
  } catch {
    return DEFAULT_JUDGES;
  }
}

export function saveJudgesList(list: JudgeUser[]) {
  try {
    localStorage.setItem("macfiesta_judges_list", JSON.stringify(list));
  } catch {}
  notifyListeners();
  return list;
}

export function getRubricList(): RubricCriterion[] {
  if (typeof window === "undefined") return DEFAULT_RUBRIC;
  try {
    const saved = localStorage.getItem("macfiesta_judge_rubric");
    return saved ? JSON.parse(saved) : DEFAULT_RUBRIC;
  } catch {
    return DEFAULT_RUBRIC;
  }
}

export function saveRubricList(list: RubricCriterion[]) {
  try {
    localStorage.setItem("macfiesta_judge_rubric", JSON.stringify(list));
  } catch {}
  notifyListeners();
  return list;
}

export function getTeamsList(): TeamParticipant[] {
  if (typeof window === "undefined") return DEFAULT_TEAMS;
  try {
    const saved = localStorage.getItem("macfiesta_judge_teams");
    return saved ? JSON.parse(saved) : DEFAULT_TEAMS;
  } catch {
    return DEFAULT_TEAMS;
  }
}

export function saveTeamsList(list: TeamParticipant[]) {
  try {
    localStorage.setItem("macfiesta_judge_teams", JSON.stringify(list));
  } catch {}
  notifyListeners();
  return list;
}

export function getJudgeScores(): TeamScoreEntry[] {
  if (typeof window === "undefined") return DEFAULT_SCORES;
  try {
    const saved = localStorage.getItem("macfiesta_judge_scores");
    return saved ? JSON.parse(saved) : DEFAULT_SCORES;
  } catch {
    return DEFAULT_SCORES;
  }
}

export function saveJudgeScores(scores: TeamScoreEntry[]) {
  try {
    localStorage.setItem("macfiesta_judge_scores", JSON.stringify(scores));
  } catch {}
  notifyListeners();
  return scores;
}

export function getJuryBroadcasts(): JuryBroadcastMessage[] {
  if (typeof window === "undefined") return DEFAULT_BROADCASTS;
  try {
    const saved = localStorage.getItem("macfiesta_jury_broadcasts");
    return saved ? JSON.parse(saved) : DEFAULT_BROADCASTS;
  } catch {
    return DEFAULT_BROADCASTS;
  }
}

export function saveJuryBroadcasts(broadcasts: JuryBroadcastMessage[]) {
  try {
    localStorage.setItem("macfiesta_jury_broadcasts", JSON.stringify(broadcasts));
  } catch {}
  notifyListeners();
  return broadcasts;
}

// ── REACT HOOK FOR JUDGES ─────────────────────────────────────────────
export function useJudgeControl(judgeId = "jdg-1") {
  const [judges, setJudges] = useState<JudgeUser[]>(DEFAULT_JUDGES);
  const [rubric, setRubric] = useState<RubricCriterion[]>(DEFAULT_RUBRIC);
  const [teams, setTeams] = useState<TeamParticipant[]>(DEFAULT_TEAMS);
  const [scores, setScores] = useState<TeamScoreEntry[]>(DEFAULT_SCORES);
  const [broadcasts, setBroadcasts] = useState<JuryBroadcastMessage[]>(DEFAULT_BROADCASTS);

  const refreshAll = () => {
    setJudges(getJudgesList());
    setRubric(getRubricList());
    setTeams(getTeamsList());
    setScores(getJudgeScores());
    setBroadcasts(getJuryBroadcasts());
  };

  useEffect(() => {
    refreshAll();
    const handleChange = () => refreshAll();
    listeners.push(handleChange);

    const handleStorage = (e: StorageEvent) => {
      if (e.key && e.key.startsWith("macfiesta_judge_")) refreshAll();
    };
    if (typeof window !== "undefined") window.addEventListener("storage", handleStorage);

    return () => {
      listeners = listeners.filter((l) => l !== handleChange);
      if (typeof window !== "undefined") window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const currentJudge = judges.find((j) => j.id === judgeId) || judges[0];
  const assignedTeams = teams.filter((t) => !currentJudge?.assignedEventId || t.eventId === currentJudge.assignedEventId);
  const myScores = scores.filter((s) => s.judgeId === judgeId);

  const saveScoreEntry = (teamId: string, criteriaScores: Record<string, number>, comments: string, status: "DRAFT" | "SUBMITTED") => {
    let total = 0;
    rubric.forEach((c) => {
      const val = criteriaScores[c.id] || 0;
      total += val;
    });

    const existingIdx = scores.findIndex((s) => s.judgeId === judgeId && s.teamId === teamId);
    const newEntry: TeamScoreEntry = {
      id: existingIdx >= 0 ? scores[existingIdx].id : `sc-${Date.now()}`,
      judgeId,
      teamId,
      criteriaScores,
      totalScore: total,
      comments,
      status,
      submittedAt: new Date().toLocaleString(),
    };

    let updated: TeamScoreEntry[];
    if (existingIdx >= 0) {
      updated = scores.map((s, idx) => (idx === existingIdx ? newEntry : s));
    } else {
      updated = [...scores, newEntry];
    }

    saveJudgeScores(updated);
  };

  return {
    judges,
    currentJudge,
    rubric,
    teams: assignedTeams,
    assignedTeams,
    scores,
    myScores,
    broadcasts,

    saveScoreEntry,
    submitScoreEntry: (teamId: string, criteriaScores: Record<string, number>, comments: string) =>
      saveScoreEntry(teamId, criteriaScores, comments, "SUBMITTED"),
    saveRubricList,
    saveJudgesList,
    saveJuryBroadcasts,
  };
}


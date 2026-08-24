"use client";

import { useState, useEffect, useRef } from "react";
import {
  RiScales3Line,
  RiShieldFlashLine,
  RiCheckDoubleLine,
  RiAddLine,
  RiSearchLine,
  RiAwardLine,
  RiTrophyLine,
  RiFileTextLine,
  RiStarLine,
  RiDeleteBinLine,
  RiEditLine,
  RiMegaphoneLine,
  RiShieldUserLine,
  RiSaveLine,
  RiSparklingLine,
  RiFileChartLine,
  RiAlertLine,
  RiTimeLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
} from "react-icons/ri";

import {
  useJudgeControl,
  JuryBroadcastMessage,
  getJuryBroadcasts,
  saveJuryBroadcasts,
} from "@/lib/judgeStore";

export interface JudgePermission {
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
  photoUrl: string;
  designation: string;
  organization: string;
  email: string;
  phone: string;
  assignedEventId: string;
  assignedEventName: string;
  category: string;
  permissions: JudgePermission;
  status: "ACTIVE" | "PENDING_REVIEW" | "SUSPENDED";
}

export interface ScoreCriterion {
  id: string;
  eventId: string;
  name: string;
  maxPoints: number;
  weightPercent: number;
}

export interface WinnerSelection {
  id: string;
  eventId: string;
  eventName: string;
  firstPlaceTeam: string;
  firstPlaceScore: number;
  secondPlaceTeam: string;
  secondPlaceScore: number;
  thirdPlaceTeam: string;
  thirdPlaceScore: number;
  status: "DRAFT" | "APPROVED" | "PUBLISHED";
}

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

const DEFAULT_CRITERIA: ScoreCriterion[] = [
  { id: "cr-1", eventId: "ev-1", name: "Technical Complexity & Architecture", maxPoints: 30, weightPercent: 30 },
  { id: "cr-2", eventId: "ev-1", name: "Innovation & Original Problem Solving", maxPoints: 30, weightPercent: 30 },
  { id: "cr-3", eventId: "ev-1", name: "UI/UX & Interactive Design", maxPoints: 20, weightPercent: 20 },
  { id: "cr-4", eventId: "ev-1", name: "Q&A Defense & Presentation", maxPoints: 20, weightPercent: 20 },
];

const DEFAULT_WINNERS: WinnerSelection[] = [
  {
    id: "win-1",
    eventId: "ev-1",
    eventName: "Byte & Code Hackathon",
    firstPlaceTeam: "Neural Ninjas (CET Trivandrum)",
    firstPlaceScore: 94.5,
    secondPlaceTeam: "Code Warriors (St. Joseph's Pala)",
    secondPlaceScore: 91.0,
    thirdPlaceTeam: "Cyber Knights (MACFAST)",
    thirdPlaceScore: 88.5,
    status: "APPROVED",
  },
];

interface JudgeCommandModuleProps {
  activePage?: string;
}

export function JudgeCommandModule({ activePage }: JudgeCommandModuleProps) {
  const { broadcasts, saveJuryBroadcasts } = useJudgeControl();
  const tabRailRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<"dashboard" | "roster" | "builder" | "results" | "announcements">("dashboard");

  useEffect(() => {
    if (!activePage) return;
    if (activePage.endsWith(".roster")) setActiveTab("roster");
    else if (activePage.endsWith(".builder")) setActiveTab("builder");
    else if (activePage.endsWith(".results")) setActiveTab("results");
    else if (activePage.endsWith(".announcements")) setActiveTab("announcements");
    else if (activePage.endsWith(".dashboard") || activePage === "judges.command") setActiveTab("dashboard");
  }, [activePage]);

  const [judges, setJudges] = useState<JudgeUser[]>(DEFAULT_JUDGES);
  const [criteria, setCriteria] = useState<ScoreCriterion[]>(DEFAULT_CRITERIA);
  const [winners, setWinners] = useState<WinnerSelection[]>(DEFAULT_WINNERS);
  const [selectedJudgeId, setSelectedJudgeId] = useState<string>(DEFAULT_JUDGES[0].id);
  const [statusMsg, setStatusMsg] = useState("");

  // Modals & Forms
  const [showAddJudgeModal, setShowAddJudgeModal] = useState(false);
  const [newJudgeName, setNewJudgeName] = useState("");
  const [newJudgeOrg, setNewJudgeOrg] = useState("");
  const [newJudgeEmail, setNewJudgeEmail] = useState("");
  const [newJudgeEvent, setNewJudgeEvent] = useState("Byte & Code Hackathon");

  // New Score Criterion State
  const [newCritName, setNewCritName] = useState("");
  const [newCritPoints, setNewCritPoints] = useState(25);

  // Jury Broadcast States
  const [juryAnnTarget, setJuryAnnTarget] = useState("All Jury Members");
  const [juryAnnUrgency, setJuryAnnUrgency] = useState<"NORMAL" | "HIGH" | "URGENT" | "CRITICAL">("URGENT");
  const [juryAnnTitle, setJuryAnnTitle] = useState("");
  const [juryAnnMessage, setJuryAnnMessage] = useState("");

  const triggerSaved = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(""), 3500);
  };

  const selectedJudge = judges.find((j) => j.id === selectedJudgeId) || judges[0];

  const handleToggleJudgePermission = (permKey: keyof JudgePermission) => {
    if (!selectedJudge) return;
    const updated = judges.map((j) => {
      if (j.id === selectedJudge.id) {
        return {
          ...j,
          permissions: {
            ...j.permissions,
            [permKey]: !j.permissions[permKey],
          },
        };
      }
      return j;
    });
    setJudges(updated);
    triggerSaved(`✓ Judge Permission '${permKey}' updated for ${selectedJudge.name}`);
  };

  const handleAddJudge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJudgeName || !newJudgeEmail) return;

    const count = judges.length + 201;
    const newJudge: JudgeUser = {
      id: `jdg-${count}`,
      judgeCode: `JDG-${count}`,
      name: newJudgeName,
      photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      designation: "External Industry Evaluator",
      organization: newJudgeOrg || "Industry Lead",
      email: newJudgeEmail,
      phone: "+91 98470 00000",
      assignedEventId: "ev-1",
      assignedEventName: newJudgeEvent,
      category: "General Jury",
      status: "ACTIVE",
      permissions: {
        canEditSubmittedScores: true,
        canSaveDrafts: true,
        canUploadComments: true,
        canViewOtherJudgesScores: true,
        canPublishResults: false,
      },
    };

    setJudges([...judges, newJudge]);
    setNewJudgeName("");
    setNewJudgeEmail("");
    setShowAddJudgeModal(false);
    triggerSaved(`✓ Judge ${newJudge.name} (${newJudge.judgeCode}) Emplaced!`);
  };

  const handleAddCriterion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCritName) return;

    const newCrit: ScoreCriterion = {
      id: `cr-${Date.now()}`,
      eventId: "ev-1",
      name: newCritName,
      maxPoints: Number(newCritPoints),
      weightPercent: Number(newCritPoints),
    };

    setCriteria([...criteria, newCrit]);
    setNewCritName("");
    triggerSaved(`✓ Rubric Criterion '${newCrit.name}' Added!`);
  };

  const handlePublishWinner = (id: string) => {
    setWinners((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: "PUBLISHED" as const } : w))
    );
    triggerSaved("✓ Winner Scorecard Officially Approved & Published Live!");
  };

  const handleSendJuryBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!juryAnnTitle || !juryAnnMessage) return;

    const pad = (n: number) => String(n).padStart(2, "0");
    const d = new Date();
    const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const timeStr = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });

    const newBc: JuryBroadcastMessage = {
      id: `bc-${Date.now()}`,
      targetAudience: juryAnnTarget,
      urgency: juryAnnUrgency,
      title: juryAnnTitle,
      message: juryAnnMessage,
      timestamp: `${dateStr} @ ${timeStr}`,
      sender: "Super Admin Command HQ",
    };

    const current = getJuryBroadcasts();
    saveJuryBroadcasts([newBc, ...current]);
    setJuryAnnTitle("");
    setJuryAnnMessage("");
    triggerSaved(`✓ Jury Broadcast '${newBc.title}' Dispatched to ${juryAnnTarget}!`);
  };

  return (
    <div className="space-y-6 font-mono select-none">
      {/* MODULE HEADER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-black/90 via-[#0A0D1A] to-[#05050A] border-2 border-metallic-gold/40 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_0_40px_rgba(212,175,55,0.15)]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-metallic-gold/15 border border-metallic-gold/40 text-metallic-gold text-[10px] font-bold uppercase tracking-widest">
            <RiScales3Line className="animate-pulse" />
            <span>EXECUTIVE JURY COMMAND & SCORECARD HUB</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Judge Command <span className="marvel-bang-comic-gradient font-black">Studio</span>
          </h2>
          <p className="text-xs text-white/60">
            Control jury credentials, score sheet rubrics, winner tie-breakers & official scorecard publishing.
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
            onClick={() => setShowAddJudgeModal(true)}
            className="px-4 py-2.5 bg-metallic-gold text-black font-bold text-xs rounded-xl hover:bg-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-[0_0_20px_rgba(212,175,55,0.4)]"
          >
            <RiAddLine className="text-base" />
            <span>+ Emplace Judge</span>
          </button>
        </div>
      </div>

      {/* TAB NAVIGATION RAIL WITH HORIZONTAL SCROLL BUTTONS */}
      <div className="relative flex items-center bg-black/60 p-1.5 rounded-2xl border border-white/10 group">
        <button
          onClick={() => tabRailRef.current?.scrollBy({ left: -220, behavior: "smooth" })}
          className="p-2 rounded-xl bg-white/5 hover:bg-metallic-gold hover:text-black text-white transition-all cursor-pointer z-10 shrink-0 border border-white/10"
          title="Scroll Left"
        >
          <RiArrowLeftSLine size={18} />
        </button>

        <div
          ref={tabRailRef}
          className="flex-1 flex overflow-x-auto scrollbar-none gap-1 px-2 scroll-smooth"
        >
          {[
            { id: "dashboard", label: "Judging Telemetry", icon: RiScales3Line },
            { id: "roster", label: `Judge Directory (${judges.length})`, icon: RiAwardLine },
            { id: "builder", label: "Score Sheet Builder", icon: RiFileTextLine },
            { id: "results", label: "Winner Scorecards & Tie-Breakers", icon: RiTrophyLine },
            { id: "announcements", label: `Jury Broadcasts (${broadcasts.length})`, icon: RiMegaphoneLine },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
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
          className="p-2 rounded-xl bg-white/5 hover:bg-metallic-gold hover:text-black text-white transition-all cursor-pointer z-10 shrink-0 border border-white/10"
          title="Scroll Right"
        >
          <RiArrowRightSLine size={18} />
        </button>
      </div>


      {/* 1. DASHBOARD TELEMETRY */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-white/50 text-[10px] uppercase font-bold">Total Emplaced Judges</span>
              <div className="text-3xl font-black text-white">{judges.length}</div>
              <span className="text-emerald-400 text-[10px]">100% Industry Experts</span>
            </div>

            <div className="p-5 rounded-2xl bg-black/40 border border-metallic-gold/30 space-y-1">
              <span className="text-white/50 text-[10px] uppercase font-bold">Active Evaluation Sessions</span>
              <div className="text-3xl font-black text-metallic-gold">
                {judges.filter((j) => j.status === "ACTIVE").length}
              </div>
              <span className="text-metallic-gold text-[10px]">● Live Scoring</span>
            </div>

            <div className="p-5 rounded-2xl bg-black/40 border border-arc-cyan/30 space-y-1">
              <span className="text-white/50 text-[10px] uppercase font-bold">Submitted Scorecards</span>
              <div className="text-3xl font-black text-arc-cyan">18 / 23</div>
              <span className="text-arc-cyan text-[10px]">69% Completed</span>
            </div>

            <div className="p-5 rounded-2xl bg-black/40 border border-emerald-500/30 space-y-1">
              <span className="text-white/50 text-[10px] uppercase font-bold">Approved Results</span>
              <div className="text-3xl font-black text-emerald-400">{winners.length}</div>
              <span className="text-emerald-400 text-[10px]">Verified Scorecards</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {judges.map((j) => (
              <div key={j.id} className="marvel-card p-6 rounded-3xl border border-arc-cyan/30 bg-[#0A0D1A] space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-metallic-gold/20 border border-metallic-gold/40 flex items-center justify-center font-bold text-metallic-gold text-lg">
                    ⚖️
                  </div>
                  <div>
                    <span className="text-[10px] text-arc-cyan font-bold uppercase">{j.judgeCode} • {j.category}</span>
                    <h3 className="text-base font-bold text-white uppercase">{j.name}</h3>
                    <p className="text-xs text-white/60">{j.designation} at {j.organization}</p>
                    <p className="text-[10px] text-metallic-gold font-mono">✉️ {j.email}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs">
                  <span className="text-metallic-gold font-bold">Assigned Event: {j.assignedEventName}</span>
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">ACTIVE JURY</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. JUDGE ROSTER & PERMISSIONS */}
      {activeTab === "roster" && selectedJudge && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 marvel-card p-6 rounded-3xl border border-arc-cyan/30 bg-[#0A0D1A] space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
              <RiAwardLine className="text-metallic-gold" />
              <span>Judge Roster</span>
            </h3>

            <div className="space-y-2">
              {judges.map((j) => {
                const isSelected = selectedJudgeId === j.id;
                return (
                  <div
                    key={j.id}
                    onClick={() => setSelectedJudgeId(j.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1 ${isSelected
                        ? "bg-metallic-gold/15 border-metallic-gold text-white shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                        : "bg-black/40 border-white/10 text-white/70 hover:border-white/30"
                      }`}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white text-sm">{j.name}</span>
                      <span className="px-2 py-0.5 rounded bg-metallic-gold/20 text-metallic-gold text-[9px] font-bold">
                        {j.judgeCode}
                      </span>
                    </div>
                    <div className="text-[11px] text-white/50">{j.organization}</div>
                    <div className="text-[10px] text-metallic-gold font-mono flex items-center gap-1">
                      <span>✉️ {j.email}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(j.email);
                          triggerSaved(`✓ Judge Email '${j.email}' copied to clipboard!`);
                        }}
                        className="text-white/40 hover:text-white text-[9px] underline cursor-pointer"
                      >
                        [Copy]
                      </button>
                    </div>
                    <div className="text-[10px] text-arc-cyan font-bold">Assigned: {j.assignedEventName}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="marvel-card p-6 rounded-3xl border border-arc-cyan/30 bg-[#0A0D1A] space-y-2">
              <div className="text-xs text-metallic-gold font-bold uppercase">{selectedJudge.judgeCode} • {selectedJudge.category}</div>
              <h3 className="text-xl font-black text-white uppercase" style={{ fontFamily: "var(--font-heading)" }}>{selectedJudge.name}</h3>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="px-2.5 py-1 rounded-xl bg-metallic-gold/15 border border-metallic-gold/40 text-metallic-gold font-mono font-bold text-xs">
                  ✉️ Email: {selectedJudge.email}
                </span>
                <span className="text-xs text-white/60">{selectedJudge.designation} ({selectedJudge.organization})</span>
              </div>
            </div>

            {/* Permissions */}
            <div className="marvel-card p-6 rounded-3xl border border-arc-cyan/30 bg-[#0A0D1A] space-y-4">
              <h4 className="text-xs font-bold text-metallic-gold uppercase tracking-wider flex items-center gap-2">
                <RiShieldUserLine />
                <span>Judge Permissions Controls</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { key: "canEditSubmittedScores", label: "Edit Submitted Scorecards" },
                  { key: "canSaveDrafts", label: "Save Scoring Drafts" },
                  { key: "canUploadComments", label: "Attach Mandatory Feedback & Comments" },
                  { key: "canViewOtherJudgesScores", label: "View Co-Judges' Score Tally" },
                  { key: "canPublishResults", label: "Directly Publish Winner Scorecards" },
                ].map((item) => {
                  const permKey = item.key as keyof JudgePermission;
                  const isEnabled = selectedJudge.permissions[permKey];
                  return (
                    <div
                      key={item.key}
                      onClick={() => handleToggleJudgePermission(permKey)}
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
        </div>
      )}

      {/* 3. SCORE SHEET BUILDER */}
      {activeTab === "builder" && (
        <div className="marvel-card p-6 md:p-8 rounded-3xl border border-arc-cyan/30 bg-[#0A0D1A] space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
                Score Sheet Rubric Builder
              </h3>
              <p className="text-xs text-white/60">Configure rubric criteria points and weighting for hackathons and competitions.</p>
            </div>
          </div>

          <form onSubmit={handleAddCriterion} className="p-4 bg-black/40 border border-white/10 rounded-2xl space-y-3 text-xs">
            <h4 className="font-bold text-metallic-gold uppercase">Add Custom Evaluation Criterion</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Criterion Name (e.g. Code Architecture)"
                value={newCritName}
                onChange={(e) => setNewCritName(e.target.value)}
                required
                className="sm:col-span-2 px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white focus:border-arc-cyan focus:outline-none"
              />
              <input
                type="number"
                placeholder="Max Points"
                value={newCritPoints}
                onChange={(e) => setNewCritPoints(Number(e.target.value))}
                required
                className="px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white focus:border-arc-cyan focus:outline-none"
              />
            </div>
            <button type="submit" className="btn-primary py-2 px-5 font-bold uppercase cursor-pointer">
              + Add Criterion to Rubric
            </button>
          </form>

          <div className="space-y-3 text-xs">
            {criteria.map((c) => (
              <div key={c.id} className="p-4 bg-black/40 border border-white/10 rounded-2xl flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-white text-sm">{c.name}</h5>
                  <span className="text-white/50 text-[11px]">Weight: {c.weightPercent}% of Total Score</span>
                </div>
                <span className="px-3 py-1 bg-metallic-gold/20 text-metallic-gold font-bold rounded-xl border border-metallic-gold/40">
                  Max: {c.maxPoints} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. WINNER SCORECARDS & RESULTS */}
      {activeTab === "results" && (
        <div className="marvel-card p-6 md:p-8 rounded-3xl border border-arc-cyan/30 bg-[#0A0D1A] space-y-6">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>
            Winner Scorecards & Tie-Breaker Approval
          </h3>

          <div className="space-y-4 text-xs">
            {winners.map((w) => (
              <div key={w.id} className="p-6 bg-black/40 border border-metallic-gold/30 rounded-3xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] text-arc-cyan font-bold uppercase">OFFICIAL JURY VERDICT</span>
                    <h4 className="text-base font-bold text-white uppercase">{w.eventName}</h4>
                  </div>

                  {w.status === "PUBLISHED" ? (
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl border border-emerald-500/40">
                      OFFICIALLY PUBLISHED LIVE
                    </span>
                  ) : (
                    <button
                      onClick={() => handlePublishWinner(w.id)}
                      className="px-4 py-2 bg-metallic-gold text-black font-bold text-xs rounded-xl hover:bg-white transition-colors cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.5)]"
                    >
                      Approve & Publish Winners
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-metallic-gold/10 border border-metallic-gold/40 rounded-2xl">
                    <span className="text-[10px] text-metallic-gold font-bold uppercase block">🥇 1st Place Winner</span>
                    <span className="font-bold text-white text-sm block">{w.firstPlaceTeam}</span>
                    <span className="text-xs text-metallic-gold font-bold">Score: {w.firstPlaceScore} pts</span>
                  </div>

                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <span className="text-[10px] text-white/50 font-bold uppercase block">🥈 2nd Place Runner-Up</span>
                    <span className="font-bold text-white text-sm block">{w.secondPlaceTeam}</span>
                    <span className="text-xs text-white/70 font-bold">Score: {w.secondPlaceScore} pts</span>
                  </div>

                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <span className="text-[10px] text-amber-600 font-bold uppercase block">🥉 3rd Place Runner-Up</span>
                    <span className="font-bold text-white text-sm block">{w.thirdPlaceTeam}</span>
                    <span className="text-xs text-amber-600 font-bold">Score: {w.thirdPlaceScore} pts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. JURY BROADCASTS DISPATCH STUDIO */}
      {activeTab === "announcements" && (
        <div className="space-y-6">
          <div className="marvel-card p-6 md:p-8 rounded-3xl border border-metallic-gold/30 bg-[#0A0D1A] space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] text-metallic-gold font-bold uppercase tracking-wider block">REAL-TIME JURY DISPATCH STUDIO</span>
                <h3 className="text-xl font-black text-white uppercase tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                  Send Targeted Jury Broadcast
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-metallic-gold/20 border border-metallic-gold/40 text-metallic-gold text-xs font-bold font-mono">
                ⚡ BroadcastChannel Sync Active
              </span>
            </div>

            <form onSubmit={handleSendJuryBroadcast} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 font-bold mb-1">Target Jury Audience</label>
                  <select
                    value={juryAnnTarget}
                    onChange={(e) => setJuryAnnTarget(e.target.value)}
                    className="w-full px-4 py-3 bg-black/60 border border-white/15 rounded-xl text-white focus:border-metallic-gold focus:outline-none"
                  >
                    <option value="All Jury Members">All Emplaced Jury Members</option>
                    <option value="Software & AI Jury">Software & AI Hackathon Jury</option>
                    <option value="Cultural & Arts Jury">Cultural & Arts Jury</option>
                    <option value="Gaming & Esports Jury">Esports & Gaming Jury</option>
                    <option value="Executive Head Judges">Executive Head Judges Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 font-bold mb-1">Urgency Level</label>
                  <select
                    value={juryAnnUrgency}
                    onChange={(e) => setJuryAnnUrgency(e.target.value as any)}
                    className="w-full px-4 py-3 bg-black/60 border border-white/15 rounded-xl text-white focus:border-metallic-gold focus:outline-none"
                  >
                    <option value="NORMAL">NORMAL BRIEFING</option>
                    <option value="HIGH">HIGH ALERT</option>
                    <option value="URGENT">URGENT DEADLINE EXTENSION</option>
                    <option value="CRITICAL">CRITICAL TIE-BREAKER VERDICT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Broadcast Headline & Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Round 2 Evaluation Scorecard Deadline Extended by 15 Mins"
                  value={juryAnnTitle}
                  onChange={(e) => setJuryAnnTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-black/60 border border-white/15 rounded-xl text-white focus:border-metallic-gold focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Detailed Broadcast Message Body</label>
                <textarea
                  rows={3}
                  placeholder="Enter specific instructions or scoring guidelines for jury members..."
                  value={juryAnnMessage}
                  onChange={(e) => setJuryAnnMessage(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-black/60 border border-white/15 rounded-xl text-white focus:border-metallic-gold focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-metallic-gold text-black font-extrabold text-xs uppercase rounded-xl hover:bg-white transition-all cursor-pointer flex items-center gap-2 shadow-[0_0_25px_rgba(212,175,55,0.4)]"
              >
                <RiMegaphoneLine className="text-base" />
                <span>Dispatch Targeted Jury Broadcast</span>
              </button>
            </form>
          </div>

          {/* Broadcast History Log */}
          <div className="marvel-card p-6 md:p-8 rounded-3xl border border-metallic-gold/30 bg-[#0A0D1A] space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
                <RiTimeLine className="text-metallic-gold" />
                <span>Sent Jury Broadcast History & Delivery Status ({broadcasts.length})</span>
              </h3>
              <span className="text-[10px] text-emerald-400 font-bold font-mono">100% Delivery Verified</span>
            </div>

            <div className="space-y-3 text-xs">
              {broadcasts.map((bc: JuryBroadcastMessage) => (
                <div key={bc.id} className="p-5 bg-black/40 border border-white/10 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-metallic-gold/20 text-metallic-gold font-bold text-[9px] uppercase">
                        {bc.urgency}
                      </span>
                      <span className="font-bold text-white text-sm">{bc.title}</span>
                      <span className="px-2 py-0.5 rounded bg-arc-cyan/20 text-arc-cyan font-bold text-[9px]">
                        Target: {bc.targetAudience}
                      </span>
                    </div>
                    <span className="text-metallic-gold font-mono font-bold text-[10px]">{bc.timestamp}</span>
                  </div>

                  <p className="text-white/70">{bc.message}</p>

                  <div className="flex justify-between items-center text-[10px] text-white/40 border-t border-white/10 pt-2">
                    <span>Dispatched by: {bc.sender || "Super Admin Command HQ"}</span>
                    <span className="text-emerald-400 font-bold">● Active on Judge Dashboards</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CREATE JUDGE MODAL */}
      {showAddJudgeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full marvel-card p-6 rounded-3xl border border-arc-cyan/40 bg-[#0A0D1A] space-y-4">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">Emplace New Judge Account</h3>
            <form onSubmit={handleAddJudge} className="space-y-3 text-xs">
              <div>
                <label className="block text-white/70 font-bold mb-1">Judge Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Vikram Sethi"
                  value={newJudgeName}
                  onChange={(e) => setNewJudgeName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white focus:border-arc-cyan focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Organization / Affiliation</label>
                <input
                  type="text"
                  placeholder="e.g. TCS Innovation Labs"
                  value={newJudgeOrg}
                  onChange={(e) => setNewJudgeOrg(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white focus:border-arc-cyan focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="vikram@tcs.com"
                  value={newJudgeEmail}
                  onChange={(e) => setNewJudgeEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-white focus:border-arc-cyan focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddJudgeModal(false)}
                  className="px-4 py-2 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-2 px-5 font-bold uppercase cursor-pointer">
                  Emplace Judge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

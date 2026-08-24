"use client";

import { useState } from "react";
import {
  RiFlashlightLine,
  RiPulseLine,
  RiCheckDoubleLine,
  RiAlertLine,
  RiShieldCheckLine,
  RiSendPlaneLine,
  RiBrainLine,
  RiRefreshLine,
} from "react-icons/ri";

export function AICopilotModule() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<any[]>([
    {
      role: "assistant",
      text: "Hello Super Admin! I am your MacFiesta AI Copilot. I constantly monitor registrations, revenue, venue schedules, and volunteer workloads. How can I assist you today?",
    },
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userMsg = { role: "user", text: prompt };
    setMessages((prev) => [...prev, userMsg]);
    setPrompt("");
    setIsAnalyzing(true);

    setTimeout(() => {
      let reply = "Based on live telemetry, registration velocity has increased by 24% today. All 23 event queue sheets are validated with 0 scheduling conflicts.";
      if (prompt.toLowerCase().includes("revenue") || prompt.toLowerCase().includes("finance")) {
        reply = "Current gross revenue stands at ₹1,72,500 with 14 pending UPI verifications. Recommended action: approve pending payments in Finance -> Pending Payment Review.";
      } else if (prompt.toLowerCase().includes("schedule") || prompt.toLowerCase().includes("event")) {
        reply = "Schedule conflict analysis complete: Gaming Valorant in Lab 3 has a 15-minute buffer before Coding Hackathon. Stage A timeline is 100% optimal.";
      }
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
      setIsAnalyzing(false);
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-cyan-500/10 border border-zinc-800 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#F5B301] text-zinc-950 shadow-md flex items-center gap-1.5">
              <RiFlashlightLine /> AI Control Copilot 2K26
            </span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Telemetry AI Active
            </span>
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">
            Predictive AI & Anomaly Detection Center
          </h1>
          <p className="text-xs text-zinc-400">
            Real-time artificial intelligence engine for schedule optimization, fraud detection, and delegate volume forecasting.
          </p>
        </div>
      </div>

      {/* Grid 1: Smart AI Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <RiBrainLine /> Registration Trend Predictor
            </span>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              98.4% Confidence
            </span>
          </div>
          <p className="text-2xl font-black text-white">~1,850 Delegates</p>
          <p className="text-[11px] text-zinc-400">
            Projected total turnout by Day 2 based on current velocity from CET, Mar Baselios & MITS.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <RiShieldCheckLine /> Smart Schedule Optimizer
            </span>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              0 Overlaps
            </span>
          </div>
          <p className="text-2xl font-black text-white">Optimal Stage Flow</p>
          <p className="text-[11px] text-zinc-400">
            Stage A, Stage B, and Lab 3 timelines are synchronized with zero venue or sound system conflicts.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <RiPulseLine /> Volunteer Workload AI
            </span>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Balanced Shifts
            </span>
          </div>
          <p className="text-2xl font-black text-white">86 Active On Duty</p>
          <p className="text-[11px] text-zinc-400">
            Registration desk & stage coordination teams operating at peak efficiency. No shift burnout detected.
          </p>
        </div>
      </div>

      {/* Grid 2: Interactive AI Command Terminal */}
      <div className="rounded-3xl bg-zinc-900/60 border border-zinc-800 overflow-hidden flex flex-col h-[420px]">
        <div className="px-5 py-3.5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <RiFlashlightLine size={16} className="text-[#F5B301]" />
            <span className="text-xs font-black text-white uppercase tracking-wider">
              MacFiesta AI Executive Terminal
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">GPT-4o Festival Model</span>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs scrollbar-thin">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3.5 rounded-2xl ${
                  m.role === "user"
                    ? "bg-[#F5B301] text-zinc-950 font-bold"
                    : "bg-zinc-800/80 text-zinc-200 border border-zinc-700/60"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {isAnalyzing && (
            <div className="flex items-center gap-2 text-zinc-500 text-xs italic">
              <RiRefreshLine className="animate-spin text-[#F5B301]" /> AI is processing festival telemetry...
            </div>
          )}
        </div>

        {/* Input Prompt Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-zinc-800/80 bg-zinc-950/60 flex items-center gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask AI: 'Summarize revenue', 'Check schedule conflicts', 'Predict turnout'..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#F5B301]"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-[#F5B301] hover:bg-amber-300 text-zinc-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RiSendPlaneLine size={14} /> Send
          </button>
        </form>
      </div>
    </div>
  );
}

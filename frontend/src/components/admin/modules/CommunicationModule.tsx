"use client";

import { useState } from "react";
import {
  RiNotification4Line,
  RiSendPlaneLine,
  RiMailSendLine,
  RiWhatsappLine,
  RiMessage3Line,
  RiCheckDoubleLine,
} from "react-icons/ri";

interface CommunicationModuleProps {
  onSendAnnouncement?: (title: string, message: string, type: string) => void;
  announcements: any[];
}

export function CommunicationModule({
  onSendAnnouncement,
  announcements,
}: CommunicationModuleProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [channel, setChannel] = useState<"announcement" | "email" | "whatsapp" | "sms">("announcement");
  const [targetAudience, setTargetAudience] = useState("all");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    if (onSendAnnouncement) {
      onSendAnnouncement(title, message, channel);
    }
    setTitle("");
    setMessage("");
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="glass p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
            <RiNotification4Line className="text-festival-gold" />
            <span>Emergency Broadcast & Communication Hub</span>
          </h3>
          <p className="text-xs text-white/40">Dispatch real-time web announcements, email campaigns, and SMS broadcasts to delegates</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Composer Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 glass p-6 rounded-2xl border border-white/10 space-y-5">
          <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest border-b border-white/10 pb-3" style={{ fontFamily: "var(--font-heading)" }}>
            Message Dispatch Composer
          </h4>

          {/* Broadcast Channels */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-white/40 mb-2">Broadcast Channel</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: "announcement", label: "Web Alert", icon: RiNotification4Line },
                { id: "email", label: "Email Campaign", icon: RiMailSendLine },
                { id: "whatsapp", label: "WhatsApp", icon: RiWhatsappLine },
                { id: "sms", label: "SMS Broadcast", icon: RiMessage3Line },
              ].map((ch) => {
                const Icon = ch.icon;
                const isSelected = channel === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setChannel(ch.id as any)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      isSelected
                        ? "bg-festival-gold text-festival-dark border-festival-gold shadow-md"
                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon size={16} />
                    <span className="truncate">{ch.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-white/40 mb-1.5">Target Audience</label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/10 rounded-xl text-white text-xs font-semibold focus:border-festival-gold focus:outline-none"
            >
              <option value="all">All Registered Delegates & Attendees</option>
              <option value="checked_in">Checked-In Gate Delegates Only</option>
              <option value="volunteers">Event Volunteers & Student Coordinators</option>
              <option value="faculty">Faculty & Staff Committee</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-white/40 mb-1.5">Broadcast Subject / Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Grand Valedictory Venue Shift..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-white/40 focus:border-festival-gold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-white/40 mb-1.5">Message Content</label>
            <textarea
              required
              rows={4}
              placeholder="Write broadcast message content..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder-white/40 focus:border-festival-gold focus:outline-none"
            />
          </div>

          <button type="submit" className="w-full btn-primary text-xs py-3 flex items-center justify-center gap-2 cursor-pointer shadow-xl">
            <RiSendPlaneLine size={16} />
            <span>Dispatch Broadcast Message</span>
          </button>
        </form>

        {/* History / Dispatched Feed */}
        <div className="lg:col-span-5 glass p-6 rounded-2xl border border-white/10 space-y-4">
          <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest border-b border-white/10 pb-3" style={{ fontFamily: "var(--font-heading)" }}>
            Recent Dispatched Broadcasts
          </h4>

          <div className="space-y-3 max-h-[380px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
            {announcements.length === 0 ? (
              <div className="p-8 text-center text-white/40 text-xs font-semibold uppercase tracking-widest">
                No announcements dispatched yet
              </div>
            ) : (
              announcements.map((ann, i) => (
                <div key={ann._id || i} className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-festival-gold">{ann.title}</span>
                    <span className="text-[9px] text-white/40 font-mono">
                      {ann.createdAt ? new Date(ann.createdAt).toLocaleTimeString() : "Just now"}
                    </span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">{ann.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

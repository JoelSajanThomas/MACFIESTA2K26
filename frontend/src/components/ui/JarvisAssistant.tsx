"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiRobot2Line,
  RiCloseLine,
  RiSendPlaneLine,
  RiDragMove2Line,
  RiFlashlightLine,
} from "react-icons/ri";

interface Message {
  id: string;
  sender: "jarvis" | "user";
  text: string;
  timestamp: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    sender: "jarvis",
    text: "Greetings, Agent. I am J.A.R.V.I.S., your tactical AI assistant at Avengers Headquarters. How may I assist your mission today?",
    timestamp: "10:00 AM",
  },
];

const PRESET_QUERIES = [
  { label: "🎯 Mission Events", query: "What events are available?" },
  { label: "⏰ Fest Schedule", query: "Show me the schedule" },
  { label: "📍 Campus Map", query: "Where is MACFAST located?" },
  { label: "🏆 Prize Pool", query: "What is the total prize pool?" },
  { label: "🛡️ Avenger Quote", query: "Give me a motivation quote" },
];

const MARVEL_RESPONSES: Record<string, string> = {
  events: `MACFIESTA 2K26 hosts 26 high-level missions across General, Technical, Cultural, Gaming, and Sports categories! Key missions include Code Wars, Robo Race, BGMI Championship, Beat Boxing, and Pro-Show Concert.`,
  schedule: `S.H.I.E.L.D. Mission Timeline:\n• Day 1 (Sept 24): Registration, Inauguration, Coding Sprint, Gaming Prelims.\n• Day 2 (Sept 25): Cultural Battle, Finals, Grand Award Ceremony & Pro Show!`,
  location: `MACFAST (Mar Athanasios College for Advanced Studies) is located in Tiruvalla, Pathanamthitta, Kerala. Coordinates verified, Agent.`,
  prize: `The total prize pool across all 26 missions exceeds ₹2,000,000 along with S.H.I.E.L.D. Certificates and Avenger Trophies!`,
  quote: `"Part of the journey is the end." — Tony Stark\n"I can do this all day." — Captain America\n"Whatever it takes." — The Avengers`,
};

export function JarvisAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const isDraggingRef = useRef(false);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      let replyText = "Understood, Agent. Systems analyzing query... All festival protocols are fully operational.";
      const lower = text.toLowerCase();

      if (lower.includes("event") || lower.includes("mission") || lower.includes("contest")) {
        replyText = MARVEL_RESPONSES.events;
      } else if (lower.includes("schedule") || lower.includes("time") || lower.includes("date")) {
        replyText = MARVEL_RESPONSES.schedule;
      } else if (lower.includes("where") || lower.includes("location") || lower.includes("macfast") || lower.includes("campus")) {
        replyText = MARVEL_RESPONSES.location;
      } else if (lower.includes("prize") || lower.includes("reward") || lower.includes("money")) {
        replyText = MARVEL_RESPONSES.prize;
      } else if (lower.includes("quote") || lower.includes("motto") || lower.includes("avenger")) {
        replyText = MARVEL_RESPONSES.quote;
      } else if (lower.includes("hi") || lower.includes("hello") || lower.includes("jarvis")) {
        replyText = `Systems online. How can I facilitate your victory today at MACFIESTA 2K26?`;
      }

      const jarvisMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "jarvis",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, jarvisMsg]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <>
      {/* Global Boundary Constraint for Full-Screen Dragging */}
      <div
        ref={constraintsRef}
        className="fixed inset-0 pointer-events-none z-[9990] overflow-hidden"
        aria-hidden="true"
      />

      {/* Floating Draggable Arc Reactor Bot Button */}
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={() => {
          isDraggingRef.current = true;
        }}
        onDragEnd={() => {
          setTimeout(() => {
            isDraggingRef.current = false;
          }, 120);
        }}
        whileDrag={{ scale: 1.15, cursor: "grabbing" }}
        className="fixed bottom-6 right-6 z-[9992] pointer-events-auto touch-none select-none cursor-grab active:cursor-grabbing"
      >
        <button
          onClick={() => {
            if (!isDraggingRef.current) {
              setIsOpen((prev) => !prev);
            }
          }}
          suppressHydrationWarning={true}
          className="relative w-14 h-14 rounded-full bg-[#05050A] border-2 border-arc-cyan flex items-center justify-center text-arc-cyan shadow-[0_0_25px_rgba(0,212,255,0.45),0_0_10px_rgba(237,29,36,0.3)] hover:shadow-[0_0_40px_rgba(0,212,255,0.8)] transition-all duration-300 group"
          aria-label="Toggle and Move J.A.R.V.I.S. AI Assistant"
        >
          {/* Animated Spinning Arc Ring */}
          <div className="absolute inset-0 rounded-full border border-marvel-red/50 animate-spin-slow pointer-events-none" />
          
          {/* Inner Robot Icon */}
          <RiRobot2Line className="text-2xl group-hover:rotate-12 transition-transform duration-300 drop-shadow-[0_0_8px_#00D4FF]" />
          
          {/* Pulse Status Beacon */}
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-arc-cyan animate-pulse shadow-[0_0_10px_#00D4FF]" />

          {/* Drag Handle Tooltip Badge on Hover */}
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-black/80 border border-arc-cyan/40 px-2 py-0.5 rounded text-[8px] font-bold text-arc-cyan uppercase tracking-widest whitespace-nowrap shadow-lg">
            Drag Anywhere
          </div>
        </button>
      </motion.div>

      {/* Draggable J.A.R.V.I.S. Tactical HUD Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            drag
            dragConstraints={constraintsRef}
            dragElastic={0.08}
            dragMomentum={false}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-24 right-4 sm:right-8 z-[9995] w-[92vw] sm:w-[420px] max-h-[620px] h-[78vh] glass-strong rounded-2xl border border-arc-cyan/40 shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_30px_rgba(0,212,255,0.25)] flex flex-col overflow-hidden pointer-events-auto"
          >
            {/* Draggable Stark HUD Header */}
            <div className="p-3.5 sm:p-4 border-b border-arc-cyan/25 bg-black/60 flex items-center justify-between cursor-grab active:cursor-grabbing select-none">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-arc-cyan/15 border border-arc-cyan/50 flex items-center justify-center text-arc-cyan shadow-[0_0_15px_rgba(0,212,255,0.35)] shrink-0">
                  <RiRobot2Line className="text-lg" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-widest uppercase flex items-center gap-2 font-excon-bold">
                    J.A.R.V.I.S. <span className="text-[9px] px-1.5 py-0.5 rounded bg-arc-cyan/20 text-arc-cyan border border-arc-cyan/40 font-mono font-bold">ONLINE</span>
                  </h3>
                  <p className="text-[9px] sm:text-[10px] text-white/50 font-excon flex items-center gap-1">
                    <RiFlashlightLine className="text-arc-cyan text-xs" /> Stark Industries AI Command
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Drag Grip Indicator */}
                <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-arc-cyan/70 text-[9px] font-bold tracking-wider uppercase">
                  <RiDragMove2Line className="text-xs" />
                  <span>Move</span>
                </div>

                <button
                  type="button"
                  suppressHydrationWarning={true}
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 sm:p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Close J.A.R.V.I.S."
                >
                  <RiCloseLine className="text-xl" />
                </button>
              </div>
            </div>

            {/* Quick Queries Bar */}
            <div className="p-2 bg-white/5 border-b border-white/5 flex gap-1.5 overflow-x-auto select-scrollbar">
              {PRESET_QUERIES.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  suppressHydrationWarning={true}
                  onClick={() => handleSend(q.query)}
                  className="px-3 py-1 text-[10px] font-bold tracking-wider text-white/75 hover:text-arc-cyan bg-white/5 hover:bg-arc-cyan/10 border border-white/10 hover:border-arc-cyan/30 rounded-full whitespace-nowrap transition-all font-excon-bold cursor-pointer"
                >
                  {q.label}
                </button>
              ))}
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3 font-mono text-xs select-scrollbar">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-xl whitespace-pre-wrap leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-marvel-red/25 border border-marvel-red/50 text-white rounded-br-none shadow-[0_0_15px_rgba(237,29,36,0.15)]"
                        : "bg-arc-cyan/10 border border-arc-cyan/30 text-arc-cyan/95 rounded-bl-none shadow-[0_0_15px_rgba(0,212,255,0.1)]"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-white/30 mt-1 px-1">{msg.timestamp}</span>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 p-3 rounded-xl bg-arc-cyan/10 border border-arc-cyan/20 w-fit text-arc-cyan text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-arc-cyan animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-arc-cyan animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-arc-cyan animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-2 text-[10px] tracking-widest uppercase font-excon-bold">Jarvis analyzing...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-3 border-t border-white/10 bg-black/60 flex gap-2 items-center">
              <input
                type="text"
                suppressHydrationWarning={true}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask Jarvis anything about MacFiesta..."
                className="flex-1 px-3.5 sm:px-4 py-2.5 bg-white/5 border border-arc-cyan/25 rounded-xl text-white text-xs focus:outline-none focus:border-arc-cyan transition-all placeholder:text-white/30 font-excon"
              />
              <button
                type="button"
                suppressHydrationWarning={true}
                onClick={() => handleSend()}
                className="p-2.5 rounded-xl bg-arc-cyan text-black hover:bg-white font-bold transition-all shadow-[0_0_15px_rgba(0,212,255,0.4)] cursor-pointer shrink-0"
                aria-label="Send Message"
              >
                <RiSendPlaneLine className="text-base" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


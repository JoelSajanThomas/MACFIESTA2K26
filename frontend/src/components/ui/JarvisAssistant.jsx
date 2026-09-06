import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiRobot2Line,
  RiCloseLine,
  RiSendPlaneLine,
  RiDragMove2Line,
  RiFlashlightLine,
} from "react-icons/ri";

const INITIAL_MESSAGES = [
  {
    id: "1",
    sender: "jarvis",
    text: "Greetings, Agent. I am J.A.R.V.I.S., your tactical AI assistant at Avengers Headquarters. How may I assist your mission today?",
    timestamp: "10:00 AM",
  },
];

const PRESET_QUERIES = [
  { label: "🎯 Mission Events", query: "What events are available?" },
  { label: "📅 Fest Schedule", query: "Show me the schedule" },
  { label: "📍 Campus Map", query: "Where is MACFAST located?" },
  { label: "🏆 Prize Pool", query: "What is the total prize pool?" },
  { label: "⚡ Avenger Quote", query: "Give me a motivation quote" },
];

const MARVEL_RESPONSES = {
  events: `MACFIESTA 2026 hosts 23 official missions across General, Technical, Arts, Management, and Sports categories! Key missions include Vibe Coding Hackathon, Stark Industries Shark Tank, BGMI Battle of Wakanda, Spider-Verse Photography, and STARK EXPO!`,
  schedule: `S.H.I.E.L.D. Mission Timeline:\n• Day 1 (Sept 24): School Day Missions, Stark Expo, Treasure Hunt & Science showcases.\n• Day 2 (Sept 25): College Day Arena, Coding Sprints, Cultural Battles & Pro Show!`,
  location: `MACFAST (Mar Athanasios College for Advanced Studies) is located in Thiruvalla, Pathanamthitta, Kerala. Coordinates locked, Agent.`,
  prize: `The total prize pool across all missions is officially announced with individual prizes up to ₹15,000 per flagship event along with S.H.I.E.L.D. Certificates and Champion Trophies!`,
  quote: `"Part of the journey is the end." — Tony Stark\n"I can do this all day." — Captain America\n"Whatever it takes." — The Avengers`,
};

export default function JarvisAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const constraintsRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = useCallback(
    (textToSend) => {
      const text = (textToSend || inputValue).trim();
      if (!text) return;

      const userMsg = {
        id: `${Date.now()}-${Math.random()}`,
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
          replyText = "Systems online. How can I facilitate your victory today at MACFIESTA 2026?";
        }

        const jarvisMsg = {
          id: (Date.now() + 1).toString(),
          sender: "jarvis",
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages((prev) => [...prev, jarvisMsg]);
        setIsTyping(false);
      }, 700);
    },
    [inputValue]
  );

  return (
    <>
      <style>{`
        @media print {
          .jarvis-assistant, [data-jarvis-bot], [data-html2canvas-ignore] {
            display: none !important;
            visibility: hidden !important;
          }
        }
      `}</style>
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[9990] print-hide" data-html2canvas-ignore="true" />

      {/* Floating Tactical Orb Button */}
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragMomentum={false}
        data-jarvis-bot="true"
        data-html2canvas-ignore="true"
        className="hidden sm:block fixed sm:bottom-6 sm:right-6 z-[9994] pointer-events-auto print-hide jarvis-assistant"
      >
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          style={{
            position: "relative",
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "#05050A",
            border: "2px solid #00D4FF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#00D4FF",
            boxShadow: "0 0 25px rgba(0,212,255,0.45), 0 0 10px rgba(237,29,36,0.3)",
            cursor: "pointer",
          }}
          aria-label="Toggle J.A.R.V.I.S. AI Assistant"
        >
          {/* Animated Spinning Arc Ring */}
          <div
            style={{
              position: "absolute",
              inset: "-3px",
              borderRadius: "50%",
              border: "1.5px dashed rgba(237,29,36,0.6)",
              pointerEvents: "none",
              animation: "spin 12s linear infinite",
            }}
          />

          {/* Inner Robot Icon */}
          <RiRobot2Line style={{ fontSize: "24px", filter: "drop-shadow(0 0 8px #00D4FF)" }} />

          {/* Pulse Status Beacon */}
          <span
            style={{
              position: "absolute",
              top: "-2px",
              right: "-2px",
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: "#00D4FF",
              boxShadow: "0 0 10px #00D4FF",
            }}
          />
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
            data-jarvis-bot="true"
            data-html2canvas-ignore="true"
            className="print-hide jarvis-assistant"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{
              position: "fixed",
              bottom: "clamp(90px, 20vh, 110px)",
              right: "16px",
              zIndex: 9995,
              width: "min(92vw, 400px)",
              maxHeight: "min(580px, calc(100dvh - 180px))",
              height: "72vh",
              background: "rgba(10, 14, 26, 0.94)",
              backdropFilter: "blur(20px)",
              borderRadius: "16px",
              border: "1px solid rgba(0, 212, 255, 0.4)",
              boxShadow: "0 0 50px rgba(0,0,0,0.9), 0 0 30px rgba(0,212,255,0.25)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              pointerEvents: "auto",
            }}
          >
            {/* Draggable Stark HUD Header */}
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid rgba(0, 212, 255, 0.25)",
                background: "rgba(0,0,0,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "grab",
                userSelect: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "rgba(0, 212, 255, 0.15)",
                    border: "1px solid rgba(0, 212, 255, 0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#00D4FF",
                    boxShadow: "0 0 15px rgba(0,212,255,0.35)",
                    flexShrink: 0,
                  }}
                >
                  <RiRobot2Line style={{ fontSize: "18px" }} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      color: "#FFFFFF",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontFamily: "var(--font-excon-bold)",
                    }}
                  >
                    J.A.R.V.I.S.{" "}
                    <span
                      style={{
                        fontSize: "9px",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: "rgba(0, 212, 255, 0.2)",
                        color: "#00D4FF",
                        border: "1px solid rgba(0, 212, 255, 0.4)",
                        fontFamily: "monospace",
                        fontWeight: "700",
                      }}
                    >
                      ONLINE
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "rgba(255, 255, 255, 0.5)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <RiFlashlightLine style={{ color: "#00D4FF" }} /> Stark Tactical AI Command
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "rgba(0, 212, 255, 0.7)",
                    fontSize: "9px",
                    fontWeight: "700",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  <RiDragMove2Line />
                  <span>Move</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: "6px",
                    borderRadius: "6px",
                    color: "rgba(255, 255, 255, 0.6)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                  aria-label="Close J.A.R.V.I.S."
                >
                  <RiCloseLine style={{ fontSize: "20px" }} />
                </button>
              </div>
            </div>

            {/* Quick Queries Bar */}
            <div
              style={{
                padding: "8px 12px",
                background: "rgba(255, 255, 255, 0.04)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                display: "flex",
                gap: "6px",
                overflowX: "auto",
              }}
            >
              {PRESET_QUERIES.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => handleSend(q.query)}
                  style={{
                    padding: "4px 10px",
                    fontSize: "10px",
                    fontWeight: "700",
                    letterSpacing: "0.06em",
                    color: "rgba(255, 255, 255, 0.8)",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "50px",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {q.label}
                </button>
              ))}
            </div>

            {/* Messages Area */}
            <div
              style={{
                flex: 1,
                padding: "14px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                fontSize: "12px",
                lineHeight: "1.6",
              }}
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "85%",
                      padding: "10px 14px",
                      borderRadius: "12px",
                      whiteSpace: "pre-wrap",
                      ...(msg.sender === "user"
                        ? {
                            background: "rgba(237, 29, 36, 0.25)",
                            border: "1px solid rgba(237, 29, 36, 0.5)",
                            color: "#FFFFFF",
                            borderBottomRightRadius: "2px",
                            boxShadow: "0 0 15px rgba(237,29,36,0.15)",
                          }
                        : {
                            background: "rgba(0, 212, 255, 0.1)",
                            border: "1px solid rgba(0, 212, 255, 0.3)",
                            color: "rgba(240, 248, 255, 0.95)",
                            borderBottomLeftRadius: "2px",
                            boxShadow: "0 0 15px rgba(0,212,255,0.1)",
                          }),
                    }}
                  >
                    {msg.text}
                  </div>
                  <span
                    style={{
                      fontSize: "9px",
                      color: "rgba(255, 255, 255, 0.35)",
                      marginTop: "3px",
                      padding: "0 4px",
                    }}
                  >
                    {msg.timestamp}
                  </span>
                </motion.div>
              ))}

              {isTyping && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "10px 14px",
                    borderRadius: "12px",
                    background: "rgba(0, 212, 255, 0.1)",
                    border: "1px solid rgba(0, 212, 255, 0.2)",
                    width: "fit-content",
                    color: "#00D4FF",
                    fontSize: "11px",
                  }}
                >
                  <span style={{ animation: "pulse 1s infinite" }}>●</span>
                  <span style={{ animation: "pulse 1s infinite 0.2s" }}>●</span>
                  <span style={{ animation: "pulse 1s infinite 0.4s" }}>●</span>
                  <span style={{ marginLeft: "6px", letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "10px", fontWeight: "700" }}>
                    Jarvis analyzing...
                  </span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Footer */}
            <div
              style={{
                padding: "12px",
                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                background: "rgba(0,0,0,0.6)",
                display: "flex",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask Jarvis anything about MacFiesta..."
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(0, 212, 255, 0.25)",
                  borderRadius: "10px",
                  color: "#FFFFFF",
                  fontSize: "12px",
                  outline: "none",
                }}
              />
              <button
                type="button"
                onClick={() => handleSend()}
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: "#00D4FF",
                  border: "none",
                  color: "#05050A",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 15px rgba(0,212,255,0.4)",
                }}
                aria-label="Send Message"
              >
                <RiSendPlaneLine style={{ fontSize: "16px" }} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

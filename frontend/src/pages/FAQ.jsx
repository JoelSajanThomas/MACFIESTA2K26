import { Link } from "react-router-dom";
import { RiQuestionAnswerLine, RiCompass3Line } from "react-icons/ri";
import { usePageSeo } from "../hooks/usePageSeo";

const faqs = [
  { id: "1", category: "Eligibility", question: "Who is eligible to participate in MacFiesta 2026?", answer: "All students currently enrolled in verified collegiate programs or schools with valid photo identification cards can participate across respective events." },
  { id: "2", category: "Registration", question: "How do I register for events?", answer: "You can create an agent account online, select your missions, and complete desk registration upon arrival at the MACFAST campus." },
  { id: "3", category: "Prizes", question: "What is the total cash prize pool?", answer: "The overall festival cash bounty pool exceeds ₹20,00,000 across 23 official college and school competitions." },
  { id: "4", category: "Hospitality", question: "Is food and accommodation provided?", answer: "Accommodation is provided in campus hostels at nominal rates. Multi-cuisine food stalls and mess meals are available." }
];

export default function FAQ() {
  usePageSeo({
    title: "Knowledge Base & FAQ · MacFiesta 2026",
    description: "Find answers regarding eligibility, hospitality, registrations, and prize claims.",
  });

  return (
    <div className="bg-[#05050A] min-h-screen pt-28 pb-16 text-white font-mono relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)]">
            <RiQuestionAnswerLine className="text-metallic-gold" />
            <span>JARVIS KNOWLEDGE BASE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight font-excon-black">
            <span className="shimmer-text">FREQUENTLY ASKED</span>{" "}
            <span className="gradient-text-gold">QUESTIONS</span>
          </h1>
          <p className="text-xs text-white/60 font-excon">Find answers regarding eligibility, hospitality, registrations, and prize claims.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((f) => (
            <div key={f.id} className="marvel-card p-6 rounded-2xl border border-white/10 space-y-2 bg-[#0A0D1A]">
              <span className="text-[10px] font-bold text-arc-cyan uppercase tracking-widest">{f.category}</span>
              <h3 className="text-base font-bold text-white uppercase font-excon-bold">{f.question}</h3>
              <p className="text-xs text-white/70 leading-relaxed font-excon">{f.answer}</p>
            </div>
          ))}
        </div>

        <div className="text-center pt-4">
          <Link to="/" className="text-xs text-arc-cyan font-bold hover:underline inline-flex items-center gap-1">
            <RiCompass3Line />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

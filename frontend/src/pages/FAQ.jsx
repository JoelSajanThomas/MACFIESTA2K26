
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RiQuestionAnswerLine, RiCompass3Line } from "react-icons/ri";
import { usePageSeo } from "../hooks/usePageSeo";
import { getFAQs } from "../services/api";

const fallbackFaqs = [
  { id: "1", category: "Eligibility", question: "Who is eligible to participate in MacFiesta 2026?", answer: "All students currently enrolled in verified collegiate programs or schools with valid photo identification cards can participate across respective events." },
  { id: "2", category: "Registration", question: "How do I register for events?", answer: "You can create an agent account online, select your missions, and complete desk registration upon arrival at the MACFAST campus." },
  { id: "3", category: "Prizes", question: "What is the total cash prize pool?", answer: "The overall festival cash bounty pool exceeds ₹1,15,000+ across 23 official college and school competitions." },
  { id: "4", category: "Hospitality", question: "Is food and accommodation provided?", answer: "Campus hostel accommodation is provided at ₹350/day (stay without food). Daily mess meals are available optionally at ₹50 for breakfast, ₹70 for lunch, and ₹50 for dinner (₹170/day for all 3 meals)." }
];

export default function FAQ() {
  usePageSeo({
    title: "Knowledge Base & FAQ · MacFiesta 2026",
    description: "Find answers regarding eligibility, hospitality, registrations, and prize claims.",
  });

  const [faqList, setFaqList] = useState(fallbackFaqs);

  useEffect(() => {
    getFAQs()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data.results || [];
        if (list.length > 0) {
          setFaqList(
            list.map((f, i) => ({
              id: String(f.id || i),
              category: f.category || "General",
              question: f.question,
              answer: f.answer,
            }))
          );
        }
      })
      .catch(() => { });
  }, []);

  return (
    <div className="bg-[#05050A] min-h-screen pt-28 pb-16 text-white font-mono relative overflow-hidden">
      {/* Background Marvel Image Backdrop */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/MARVEL/wonder_woman.jpg"
          alt="FAQ Knowledge Base Backdrop"
          className="w-full h-full object-cover object-center opacity-85 contrast-[1.05] saturate-[1.1] brightness-[0.92]"
        />
        {/* Subtle cinematic gradient to preserve FAQ card readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#05050A]/40 via-black/25 to-[#05050A]/85 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(5,5,10,0.6)_100%)] pointer-events-none" />
      </div>

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
          {faqList.map((f) => (
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

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RiRocketLine, RiEyeLine, RiHistoryLine, RiTeamLine, RiShieldFlashLine } from "react-icons/ri";
import { usePageSeo } from "../hooks/usePageSeo";
import { getCoordinatorProfiles, mediaUrl } from "../services/api";

const milestones = [
  { year: "2015", event: "MacFiesta is born as a tech fest for department of Computer Applications." },
  { year: "2018", event: "Expands into cultural events, drawing over 1000 participants regional level." },
  { year: "2022", event: "Relaunched as a premium national multi-fest across all departments." },
  { year: "2026", event: "Introducing esports arena, premium Web3 tech challenges, and grand pro-show concert." },
];

const leadershipList = [
  { name: "Dr. Cherian P. George", role: "Principal / Chief Patron", dept: "College Admin" },
  { name: "Prof. Varghese Abraham", role: "General Coordinator", dept: "Computer Applications" },
  { name: "Prof. Ligo Koshy", role: "Cultural Event Head", dept: "Management Studies" },
  { name: "Ashwin Kumar", role: "Student Coordinator", dept: "MCA Dept" },
  { name: "Aria Sebastian", role: "Student Coordinator", dept: "MBA Dept" },
];

export default function About() {
  usePageSeo({
    title: "About MACFIESTA · MACFAST",
    description: "Learn about MacFiesta 2026, our vision, history, and organizing leadership.",
  });

  const [coordinators, setCoordinators] = useState([]);

  useEffect(() => {
    getCoordinatorProfiles()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        if (list.length > 0) {
          setCoordinators(list.filter((c) => c.is_active !== false));
        }
      })
      .catch(() => {});
  }, []);

  const displayLeaders = coordinators.length > 0
    ? coordinators.map((c) => ({
        name: c.name,
        role: c.role || c.tier,
        dept: c.department || "MACFAST",
        photo: c.photo,
      }))
    : leadershipList;

  return (
    <div className="bg-[#05050A] min-h-screen pt-28 pb-16 text-white font-excon relative overflow-hidden">
      {/* Background Marvel Image Backdrop */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/MARVEL/download (6).jpg"
          alt="Marvel Comic Backdrop"
          className="w-full h-full object-cover object-center opacity-85 contrast-[1.05] saturate-[1.1] brightness-[0.92]"
        />
        {/* Cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#05050A]/40 via-black/25 to-[#05050A]/85 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(5,5,10,0.6)_100%)] pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        
        {/* Banner Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)]">
            <RiShieldFlashLine className="animate-pulse text-metallic-gold" />
            <span>S.H.I.E.L.D. ACADEMY DOSSIER</span>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white font-excon-black"
          >
            <span className="shimmer-text">ABOUT</span>{" "}
            <span className="gradient-text-gold">MACFIESTA 2026</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-white/80 text-xs sm:text-sm leading-relaxed font-excon font-normal"
          >
            The national multi-fest representing the academic and cultural excellence of Mar Athanasios College for Advanced Studies Tiruvalla (MACFAST).
          </motion.p>
        </div>

        {/* Vision & Mission Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="marvel-card p-8 rounded-2xl border border-arc-cyan/20 hover:border-arc-cyan transition-all space-y-4 relative shadow-xl"
          >
            <div className="text-arc-cyan text-3xl p-3 bg-arc-cyan/10 rounded-2xl w-fit border border-arc-cyan/30">
              <RiRocketLine />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight font-excon-black">
              Our Vision
            </h3>
            <p className="text-white/70 leading-relaxed text-xs sm:text-sm font-excon">
              To build a national-level benchmark platform that empowers higher education students to exhibit, test, and master creative, logical, managerial, and technological skills.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="marvel-card p-8 rounded-2xl border border-arc-cyan/20 hover:border-arc-cyan transition-all space-y-4 relative shadow-xl"
          >
            <div className="text-metallic-gold text-3xl p-3 bg-metallic-gold/10 rounded-2xl w-fit border border-metallic-gold/30">
              <RiEyeLine />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight font-excon-black">
              Our Objectives
            </h3>
            <p className="text-white/70 leading-relaxed text-xs sm:text-sm font-excon">
              Foster intercollegiate teamwork, drive innovation in engineering and design, and create unforgettable cultural experiences that inspire unity and dedication.
            </p>
          </motion.div>
        </div>

        {/* Timeline history */}
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold text-xs font-excon-bold font-bold tracking-[0.2em] uppercase">
              <RiHistoryLine />
              <span>THE JOURNEY</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight font-excon-black">
              <span className="shimmer-text">OUR</span>{" "}
              <span className="gradient-text-plasma">HISTORY</span>
            </h2>
          </div>

          <div className="relative border-l border-white/10 max-w-3xl mx-auto pl-6 md:pl-8 space-y-6">
            {milestones.map((m, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="relative group"
              >
                <div className="absolute -left-[31px] md:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 border-arc-cyan bg-[#05050A] group-hover:bg-arc-cyan transition-colors shadow-[0_0_10px_#00D4FF]" />
                <div className="glass p-5 rounded-2xl border border-arc-cyan/20 hover:border-arc-cyan transition-colors">
                  <span className="block text-sm font-black text-metallic-gold uppercase font-excon-black">
                    {m.year}
                  </span>
                  <p className="text-white/70 text-xs sm:text-sm mt-1 font-excon">
                    {m.event}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Organizers & Core Team */}
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-arc-cyan/40 bg-arc-cyan/10 text-arc-cyan text-xs font-excon-bold font-bold tracking-[0.2em] uppercase">
              <RiTeamLine />
              <span>LEADERSHIP</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight font-excon-black">
              <span className="shimmer-text">ORGANIZING</span>{" "}
              <span className="gradient-text-plasma">COMMITTEE</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayLeaders.map((member, idx) => (
              <motion.div
                key={member.name + idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="marvel-card p-6 rounded-2xl border border-arc-cyan/20 hover:border-arc-cyan transition-all text-center flex flex-col justify-between shadow-xl"
              >
                {member.photo ? (
                  <img
                    src={mediaUrl(member.photo)}
                    alt={member.name}
                    className="w-16 h-16 rounded-2xl mx-auto mb-4 object-cover border border-arc-cyan/40 shadow-[0_0_15px_rgba(0,212,255,0.25)]"
                  />
                ) : (
                  <div className="text-arc-cyan text-4xl mx-auto mb-4 p-3 bg-arc-cyan/10 rounded-2xl w-fit border border-arc-cyan/30">
                    <RiTeamLine />
                  </div>
                )}
                <div className="space-y-1">
                  <span className="block text-sm font-black text-white uppercase tracking-tight font-excon-black">
                    {member.name}
                  </span>
                  <span className="block text-xs text-metallic-gold font-bold uppercase tracking-wider font-excon-bold">
                    {member.role}
                  </span>
                  <span className="block text-[10px] text-white/50 font-medium font-excon">
                    {member.dept}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

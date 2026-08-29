import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiBaseStationLine, RiTrophyLine } from "react-icons/ri";
import { usePageSeo } from "../hooks/usePageSeo";
import { getResults } from "../services/api";

export default function Scoreboard() {
  const [scores, setScores] = useState([]);
  const [activeScoreIdx, setActiveScoreIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  usePageSeo({
    title: "Live Radar Scoreboard · MacFiesta 2026",
    description: "Real-time power levels, leaderboard rankings, and arena scores updated live.",
  });

  useEffect(() => {
    getResults()
      .then((res) => {
        const rawResults = Array.isArray(res.data)
          ? res.data
          : res.data?.results || [];

        if (Array.isArray(rawResults) && rawResults.length > 0) {
          const mapped = rawResults.map((r, idx) => ({
            _id: `res-${r.id || idx}`,
            isLive: Boolean(r.is_live ?? true),
            eventId: {
              title: r.event_title || r.event?.title || "Championship Event",
              venue: r.venue || r.event?.venue || "Main Auditorium",
            },
            teams: [
              ...(r.winner_name ? [{ rank: 1, name: r.winner_name, college: r.winner_college || "MACFAST", score: r.winner_score || 950 }] : []),
              ...(r.runner_name ? [{ rank: 2, name: r.runner_name, college: r.runner_college || "College", score: r.runner_score || 880 }] : []),
              ...(r.second_runner_name ? [{ rank: 3, name: r.second_runner_name, college: r.second_runner_college || "College", score: r.second_runner_score || 820 }] : []),
            ],
          })).filter(s => s.teams.length > 0);

          if (mapped.length > 0) {
            setScores(mapped);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const activeScoreboard = scores[activeScoreIdx] || null;

  return (
    <div className="bg-[#05050A] min-h-screen pt-28 pb-16 text-white font-mono relative overflow-hidden">
      {/* Background Marvel Image Backdrop */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/MARVEL/batman.jpg"
          alt="Scoreboard Backdrop"
          className="w-full h-full object-cover object-center opacity-85 contrast-[1.05] saturate-[1.1] brightness-[0.92]"
        />
        {/* Subtle cinematic gradient to preserve scoreboard readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#05050A]/40 via-black/25 to-[#05050A]/85 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(5,5,10,0.6)_100%)] pointer-events-none" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">

        {/* Header */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-metallic-gold/40 bg-metallic-gold/10 text-metallic-gold text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)]"
          >
            <RiBaseStationLine className="animate-pulse text-sm text-metallic-gold" />
            <span>S.H.I.E.L.D. LIVE RADAR SCOREBOARD</span>
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white font-excon-black">
            <span className="shimmer-text">LIVE</span>{" "}
            <span className="gradient-text-gold">SCOREBOARD</span>
          </h1>
          <p className="text-white/80 text-xs sm:text-sm font-excon font-normal">
            Real-time power levels, leaderboard rankings, and arena scores updated live.
          </p>
        </div>

        {loading ? (
          <div className="text-center text-arc-cyan uppercase font-bold text-xs tracking-[0.2em] py-10 animate-pulse font-excon-bold">
            Connecting to S.H.I.E.L.D. Satellite Feed...
          </div>
        ) : scores.length === 0 ? (
          <div className="marvel-card p-12 rounded-3xl border border-white/10 text-center text-white/50 text-sm font-excon">
            No active mission scoreboards broadcast currently.
          </div>
        ) : (
          <>
            {/* Tab toggler */}
            <div className="flex flex-wrap justify-center gap-3">
              {scores.map((score, idx) => {
                const event = score.eventId || {};
                return (
                  <button
                    key={score._id}
                    onClick={() => setActiveScoreIdx(idx)}
                    className={`px-5 py-2.5 rounded-full border text-xs font-black uppercase tracking-[0.16em] transition-all cursor-pointer font-excon-bold ${
                      activeScoreIdx === idx
                        ? "bg-marvel-red text-white border-marvel-red shadow-[0_0_18px_#ED1D24]"
                        : "bg-white/5 text-white/70 border-white/10 hover:text-white"
                    }`}
                  >
                    <span>{event.title || "Arena Mission"}</span>
                  </button>
                );
              })}
            </div>

            {/* Score Table */}
            <AnimatePresence mode="wait">
              {activeScoreboard && (
                <motion.div
                  key={activeScoreboard._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="marvel-card rounded-2xl border border-arc-cyan/30 overflow-hidden shadow-2xl space-y-4"
                >
                  {/* Status header */}
                  <div className="p-5 bg-black/60 border-b border-white/10 flex items-center justify-between">
                    <div>
                      <span className="block text-white/40 text-[10px] uppercase font-bold tracking-wider">
                        Current Mission Sector
                      </span>
                      <span className="block font-bold text-white text-sm">
                        {activeScoreboard.eventId?.venue || "Main Auditorium"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${activeScoreboard.isLive ? "bg-marvel-red animate-pulse" : "bg-white/20"}`} />
                      <span className="text-[10px] uppercase font-bold tracking-widest text-arc-cyan">
                        {activeScoreboard.isLive ? "S.H.I.E.L.D. Live Sync" : "Official Final Scores"}
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-white/5 text-[10px] uppercase font-bold tracking-widest text-white/40 border-b border-white/10" style={{ fontFamily: "var(--font-heading)" }}>
                        <tr>
                          <th className="py-4 px-6">Rank</th>
                          <th className="py-4 px-6">Agent / Squad</th>
                          <th className="py-4 px-6">Representing Institution</th>
                          <th className="py-4 px-6 text-right">Power Score Points</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {activeScoreboard.teams && activeScoreboard.teams.length > 0 ? (
                          [...activeScoreboard.teams]
                            .sort((a, b) => a.rank - b.rank)
                            .map((row, index) => (
                              <tr key={index} className="group hover:bg-white/5 transition-colors">
                                <td className="py-4 px-6 font-bold">
                                  <div className="flex items-center gap-2">
                                    {row.rank <= 3 ? (
                                      <span className={`p-1.5 rounded-full ${
                                        row.rank === 1 ? "bg-metallic-gold text-black shadow-[0_0_10px_#FFD700]" :
                                        row.rank === 2 ? "bg-white/30 text-white" : "bg-marvel-red/40 text-marvel-red"
                                      }`}>
                                        <RiTrophyLine />
                                      </span>
                                    ) : null}
                                    <span>#{row.rank}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-6 font-bold text-white group-hover:text-arc-cyan transition-colors">
                                  {row.name}
                                </td>
                                <td className="py-4 px-6 text-white/60">
                                  {row.college}
                                </td>
                                <td className="py-4 px-6 text-right font-bold text-metallic-gold text-base">
                                  {row.score} PTS
                                </td>
                              </tr>
                            ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-white/30 text-xs">
                              Standings data compiling in S.H.I.E.L.D. data center...
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

      </div>
    </div>
  );
}

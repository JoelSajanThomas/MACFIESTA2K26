import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  RiShieldFlashLine,
  RiCompass3Line,
  RiAlertLine,
  RiCheckDoubleLine,
  RiToolsLine,
  RiSuitcaseLine,
  RiLightbulbFlashLine,
  RiSchoolLine,
  RiBuilding4Line,
} from "react-icons/ri";
import { usePageSeo } from "../hooks/usePageSeo";
import { getFestivalRules } from "../services/api";

export default function Rules() {
  usePageSeo({
    title: "Official Rulebook & Committee Operations · MacFiesta 2026",
    description: "Official rules, regulations, event kits, materials, and innovation expo directives for MacFiesta 2026.",
  });

  const [activeTab, setActiveTab] = useState("school-rules");
  const [dbRules, setDbRules] = useState([]);

  useEffect(() => {
    getFestivalRules()
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        setDbRules(list.filter((r) => r.is_active !== false));
      })
      .catch((err) => {
        console.warn("Could not load dynamic festival rules:", err?.message || err);
      });
  }, []);

  // PDF Document 1: Page 2 General Rules for All School Events
  const schoolParticipantRules = [
    "Students must carry a valid school ID card.",
    "Participation is limited to the specified class or age group.",
    "A student must not participate in events that overlap in time.",
    "Registration must be completed before the event.",
    "Participants must report to the venue 15–20 minutes before their event.",
    "Late entry may be rejected or allowed only at the discretion of the Event Coordinator.",
    "An entry cannot be changed after the registration deadline unless the committee permits it.",
    "Participants must follow instructions from coordinators, volunteers, judges, and faculty.",
  ];

  const schoolFairnessRules = [
    "Judges' decisions are final.",
    "No outside help is allowed unless explicitly permitted.",
    "Plagiarism, copied material, cheating, or manipulation will result in disqualification.",
    "Friends, teachers, or other participants must not interfere with judging.",
    "Every event must have a written scoring system before it begins.",
  ];

  const schoolDisciplineRules = [
    "Abusive, offensive, dangerous, or inappropriate content is prohibited.",
    "College property and event equipment must not be damaged.",
    "Running in restricted areas is not permitted.",
    "For outdoor events, weather and safety decisions rest with the faculty or Event Coordinator.",
    "The committee may stop or modify an event if a safety issue arises.",
  ];

  const collegeBaselineRules = [
    "Participants must carry valid College / University ID cards and institutional bonafide letters.",
    "UG and PG students across registered departments are eligible according to event matrices.",
    "Cross-college teams are permitted only where specified in event guidelines.",
    "Reporting time to the MACFAST Main Auditorium / Arena is 30 minutes prior to scheduled slots.",
    "Use of unauthorized electronic equipment during closed-door technical rounds is prohibited.",
    "Delegation championship points are accrued based on certified prize rankings across college events.",
  ];

  // Common Festival Regulations
  const commonRules = [
    "Participants must carry valid college / school identification and complete registration verification before competing.",
    "Reporting time, venue, team size, eligibility, and event-specific requirements must be followed. Late entry is subject to the Event Head's decision.",
    "Misconduct, harassment, discrimination, intoxication, violence, property damage, cheating, or deliberate disruption can lead to immediate removal and disqualification.",
    "Participants are responsible for personal belongings and devices. Organizers maintain a lost-and-found desk but cannot guarantee recovery.",
    "Event officials may photograph or record activities for documentation and promotion subject to institutional policy.",
    "Any medical, safety, electrical, crowd, or security concern must be reported immediately to the Event Head or faculty coordinator.",
    "Complaints must be submitted only through the team leader / participant to the Event Head within the dispute window. Participants must not confront judges directly.",
    "Judges' decisions on evaluation are final. The organizing committee may decide procedural matters not explicitly covered by the rules.",
  ];

  // Categorize dynamic rules
  const dynamicSchoolRules = dbRules.filter((r) => r.category === "school");
  const dynamicCollegeRules = dbRules.filter((r) => r.category === "college");
  const dynamicJudgingRules = dbRules.filter((r) => r.category === "judging");
  const dynamicDisciplineRules = dbRules.filter((r) => r.category === "discipline");
  const dynamicGeneralRules = dbRules.filter((r) => r.category === "general");

  // PDF Document 1: Pages 19-20 Materials Required by Event
  const materialsByEvent = [
    {
      event: "Multiverse: Imagine It (AI Prompt - Image Creation)",
      venue: "Computer Lab",
      items: [
        "College computers / laptops with stable power",
        "Reliable high-speed internet connection",
        "Google Gemini access configured on all terminals",
        "Official submission folder / form",
        "1–2 backup computers ready for failover",
      ],
    },
    {
      event: "SpiderLens: Freeze the Moment (Photography)",
      venue: "Campus Trail",
      items: [
        "Official submission folder / form",
        "USB cable and offline transfer drive / OTG backup",
        "Participant and attendance list",
        "Printed theme announcement sheet",
      ],
    },
    {
      event: "HeroVerse Dance-Off (Spot Dance)",
      venue: "Open Air Arena",
      items: [
        "High-output sound system and stage speakers",
        "Laptop / master mobile device for playing music tracks",
        "Backup audio device and aux / bluetooth connectivity",
        "Official digital stopwatch / timer",
      ],
    },
    {
      event: "The Endgame Heist: Hunt for the Stones (Treasure Hunt)",
      venue: "Campus Perimeter",
      items: [
        "Printed clue sets (primary sealed envelopes)",
        "Backup clue duplicate sets",
        "Participant team chest numbers / badges",
        "Pens and validation answer sheets",
        "Official stopwatch and route marshal whistles",
        "Caution tape, zone markers, and checkpoint badges",
      ],
    },
    {
      event: "Groot's Green Mission (Best Out of Waste)",
      venue: "Ecology Hall",
      items: [
        "Cardboard sheets and corrugated scraps",
        "Newspapers, magazines, and paper rolls",
        "Clean discarded plastic bottles and paper cups",
        "Ice-cream sticks, used packaging boxes, bottle caps",
        "String, thread, adhesive / Fevicol, craft glue, tape",
        "Scissors, rulers, markers, colour paper, stapler, rubber bands",
        "Labelled dry and wet waste bins for mandatory post-event cleanup",
      ],
    },
    {
      event: "Gotham: Mystery Files (Mystery Case / Detective Challenge)",
      venue: "Room 102",
      items: [
        "Printed case files and witness dossier packets",
        "Evidence bags and numbered clue artifacts",
        "Investigation deduction sheets and participant pens",
      ],
    },
    {
      event: "Justice League: Mini Clash (3v3 Football)",
      venue: "Junior Turf",
      items: [
        "Match footballs (standard size and verified inflation)",
        "Mini goal posts and field boundary markers",
        "Referee whistle, cards, and fixture clipboard",
        "Match score sheets and official stopwatch",
        "Fully stocked first-aid emergency medical kit",
      ],
    },
    {
      event: "Civil War: The Great Ideology Debate (Debate / Extempore)",
      venue: "Senate Hall B",
      items: [
        "Printed topic cards (sealed draw bowl)",
        "Stage countdown timer / warning bell",
        "Microphones (handheld / podium) and PA sound setup",
        "Standardized judge evaluation rubrics and scoring sheets",
      ],
    },
  ];

  // PDF Document 1: Page 22 Event Kit for Every Event
  const standardEventKit = [
    "Participant and attendance list",
    "Final rules and scoring criteria document",
    "Team or participant chest numbers / identification tags",
    "Writing pens, clipboards, and answer / work sheets",
    "Stopwatch or digital timer",
    "Markers, masking tape, and stationery supplies",
    "Emergency contacts list (Medical, Security, Faculty)",
    "Judge score sheets and rubric matrices",
    "Incident and technical-issue log",
    "Provisional and final result sheets",
    "Event-specific materials and backup hardware",
  ];

  const treasureHuntKit = [
    "Primary clue set (envelope sealed and numbered)",
    "Backup duplicate clue set",
    "Official clue-location master map",
    "Checkpoint volunteer assignment and response key sheet",
    "Route marshal whistles and high-visibility badges",
    "Route-safety and restricted boundary checklist",
  ];

  // STARK EXPO Domains & Pavilions
  const expoRooms = [
    {
      room: "Pavilion 1",
      title: "Artificial Intelligence (AI)",
      details: "AI image generation, interactive machine learning, neural networks, chatbots, and generative models.",
      badge: "AI & Neural Tech",
    },
    {
      room: "Pavilion 2",
      title: "Internet of Things (IoT)",
      details: "Smart microcontrollers, sensor arrays, home automation, and connected embedded prototypes.",
      badge: "Connected IoT",
    },
    {
      room: "Pavilion 3",
      title: "Science & Experiments",
      details: "Working physics models, interactive chemistry experiments, and fundamental scientific principles.",
      badge: "Core Science",
    },
    {
      room: "Pavilion 4",
      title: "Biology & Life Sciences",
      details: "Life sciences exhibits, biological systems, genetics illustrations, and living environment models.",
      badge: "Bio Sciences",
    },
    {
      room: "Pavilion 5",
      title: "Psychology & Human Behaviour",
      details: "Cognitive perception challenges, behavioural science experiments, and psychological reasoning puzzles.",
      badge: "Human Behaviour",
    },
  ];

  // PDF Document 1: Page 24 Prospective Schools
  const prospectiveSchools = [
    { name: "AMMHSS Edayaranmula", location: "Edayaranmula" },
    { name: "Amrita Vidyalayam", location: "Thiruvalla" },
    { name: "All Saints Public School", location: "Adoor" },
    { name: "Al-Ihsan Central School", location: "Thiruvalla / Niranam" },
    { name: "PM SHRI Kendriya Vidyalaya Rubber Board", location: "Kottayam" },
    { name: "Labour India Public School & Junior College", location: "Marangattupilly" },
    { name: "Mar Baselios Public School", location: "Kottayam" },
    { name: "Lourdes Public School & Junior College", location: "Kottayam" },
    { name: "Don Bosco Central School", location: "Kottayam" },
    { name: "Sacred Heart Higher Secondary School & CISCE Junior College", location: "Kottayam" },
    { name: "Leo XIII Higher Secondary School", location: "Alappuzha" },
    { name: "St. Joseph's Girls Higher Secondary School", location: "Alappuzha" },
    { name: "Other CBSE / ICSE Partner Schools", location: "Alappuzha / Central Travancore" },
  ];

  return (
    <div className="min-h-screen pt-28 pb-16 text-white font-mono relative overflow-hidden">
      {/* Background Marvel Image Backdrop */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/MARVEL/Iron Man.jpg"
          alt="Rules Protocol Marvel Backdrop"
          className="w-full h-full object-cover object-center opacity-85 contrast-[1.05] saturate-[1.1] brightness-[0.92]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05050A]/40 via-black/20 to-[#05050A]/80 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(5,5,10,0.6)_100%)] pointer-events-none" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-metallic-gold/40 bg-black/40 backdrop-blur-md text-metallic-gold text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(212,175,55,0.25)]">
            <RiShieldFlashLine className="animate-pulse text-metallic-gold" />
            <span>S.H.I.E.L.D. PROTOCOL DIRECTIVE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight font-excon-black">
            <span className="shimmer-text">OFFICIAL</span>{" "}
            <span className="gradient-text-gold">RULEBOOK</span>
          </h1>
          <p className="text-xs text-white/70 font-excon max-w-2xl mx-auto">
            Rules, Regulations &amp; Committee Operations compiled directly from the official MacFiesta 2026 organizing charters.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 p-1.5 rounded-2xl bg-black/35 backdrop-blur-xl border border-white/15 max-w-4xl mx-auto">
          {[
            { id: "school-rules", label: "School Master Rules", icon: RiSchoolLine },
            { id: "college-rules", label: "College Master Rules", icon: RiBuilding4Line },
            { id: "materials", label: "Materials Required", icon: RiToolsLine },
            { id: "kits", label: "Event Kits & Control", icon: RiSuitcaseLine },
            { id: "expo", label: "Innovation Expo & Schools", icon: RiLightbulbFlashLine },
            { id: "common", label: "General Code of Conduct", icon: RiAlertLine },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer font-mono ${
                activeTab === id
                  ? "bg-metallic-gold text-black border-metallic-gold shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                  : "bg-black/20 text-white/70 border-white/10 hover:text-white hover:border-white/30"
              }`}
            >
              <Icon className="text-sm" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: SCHOOL MASTER RULES */}
        {activeTab === "school-rules" && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl border border-arc-cyan/30 bg-black/25 backdrop-blur-md shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5 text-arc-cyan text-sm font-bold uppercase tracking-wider font-excon-bold">
                  <RiSchoolLine className="text-lg" />
                  <span>General Rules for All School Events (Participant Rules)</span>
                </div>
                {dynamicSchoolRules.length > 0 && (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-arc-cyan/20 text-arc-cyan font-bold">
                    {dynamicSchoolRules.length} Live Directives
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-excon">
                {schoolParticipantRules.map((rule, idx) => (
                  <div key={idx} className="p-3.5 bg-black/35 backdrop-blur-sm border border-white/10 rounded-xl flex items-start gap-3 hover:border-arc-cyan/40 transition-colors">
                    <span className="w-5 h-5 rounded-full bg-arc-cyan/20 text-arc-cyan font-bold text-[10px] flex items-center justify-center shrink-0 font-mono mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-white/90 leading-relaxed">{rule}</p>
                  </div>
                ))}
                {dynamicSchoolRules.map((r) => (
                  <div key={r.id} className="p-3.5 bg-arc-cyan/10 backdrop-blur-sm border border-arc-cyan/40 rounded-xl flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-arc-cyan text-black font-bold text-[10px] flex items-center justify-center shrink-0 font-mono mt-0.5">
                      ★
                    </span>
                    <div>
                      <span className="text-arc-cyan font-bold block mb-0.5">{r.title}</span>
                      <p className="text-white/90 leading-relaxed">{r.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fairness Rules */}
              <div className="p-6 rounded-3xl border border-metallic-gold/30 bg-black/25 backdrop-blur-md shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-metallic-gold text-xs font-bold uppercase tracking-wider font-excon-bold border-b border-white/10 pb-2.5">
                  <RiCheckDoubleLine className="text-base" />
                  <span>Fairness &amp; Judging Rules</span>
                </div>
                <div className="space-y-2.5 text-xs font-excon">
                  {schoolFairnessRules.map((rule, idx) => (
                    <div key={idx} className="p-3 bg-black/35 backdrop-blur-sm border border-white/10 rounded-xl flex items-start gap-2.5">
                      <span className="text-metallic-gold font-mono font-bold shrink-0">F{idx + 1}.</span>
                      <p className="text-white/85 leading-relaxed">{rule}</p>
                    </div>
                  ))}
                  {dynamicJudgingRules.map((r, idx) => (
                    <div key={r.id} className="p-3 bg-metallic-gold/10 backdrop-blur-sm border border-metallic-gold/40 rounded-xl flex items-start gap-2.5">
                      <span className="text-metallic-gold font-mono font-bold shrink-0">F{schoolFairnessRules.length + idx + 1}.</span>
                      <div>
                        <span className="text-metallic-gold font-bold block">{r.title}</span>
                        <p className="text-white/85 leading-relaxed">{r.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discipline and Safety */}
              <div className="p-6 rounded-3xl border border-marvel-red/30 bg-black/25 backdrop-blur-md shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-marvel-red text-xs font-bold uppercase tracking-wider font-excon-bold border-b border-white/10 pb-2.5">
                  <RiAlertLine className="text-base" />
                  <span>Discipline &amp; Safety Protocol</span>
                </div>
                <div className="space-y-2.5 text-xs font-excon">
                  {schoolDisciplineRules.map((rule, idx) => (
                    <div key={idx} className="p-3 bg-black/35 backdrop-blur-sm border border-white/10 rounded-xl flex items-start gap-2.5">
                      <span className="text-marvel-red font-mono font-bold shrink-0">S{idx + 1}.</span>
                      <p className="text-white/85 leading-relaxed">{rule}</p>
                    </div>
                  ))}
                  {dynamicDisciplineRules.map((r, idx) => (
                    <div key={r.id} className="p-3 bg-marvel-red/10 backdrop-blur-sm border border-marvel-red/40 rounded-xl flex items-start gap-2.5">
                      <span className="text-marvel-red font-mono font-bold shrink-0">S{schoolDisciplineRules.length + idx + 1}.</span>
                      <div>
                        <span className="text-marvel-red font-bold block">{r.title}</span>
                        <p className="text-white/85 leading-relaxed">{r.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: COLLEGE MASTER RULES */}
        {activeTab === "college-rules" && (
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl border border-metallic-gold/30 bg-black/25 backdrop-blur-md shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5 text-metallic-gold text-sm font-bold uppercase tracking-wider font-excon-bold">
                  <RiBuilding4Line className="text-lg" />
                  <span>College &amp; University Championship Protocol</span>
                </div>
                {dynamicCollegeRules.length > 0 && (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-metallic-gold/20 text-metallic-gold font-bold">
                    {dynamicCollegeRules.length} Live Directives
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-excon">
                {collegeBaselineRules.map((rule, idx) => (
                  <div key={idx} className="p-3.5 bg-black/35 backdrop-blur-sm border border-white/10 rounded-xl flex items-start gap-3 hover:border-metallic-gold/40 transition-colors">
                    <span className="w-5 h-5 rounded-full bg-metallic-gold/20 text-metallic-gold font-bold text-[10px] flex items-center justify-center shrink-0 font-mono mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-white/90 leading-relaxed">{rule}</p>
                  </div>
                ))}
                {dynamicCollegeRules.map((r) => (
                  <div key={r.id} className="p-3.5 bg-metallic-gold/10 backdrop-blur-sm border border-metallic-gold/40 rounded-xl flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-metallic-gold text-black font-bold text-[10px] flex items-center justify-center shrink-0 font-mono mt-0.5">
                      ★
                    </span>
                    <div>
                      <span className="text-metallic-gold font-bold block mb-0.5">{r.title}</span>
                      <p className="text-white/90 leading-relaxed">{r.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MATERIALS REQUIRED BY EVENT */}
        {activeTab === "materials" && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-black uppercase text-metallic-gold font-excon-black">
                Materials Required by Event
              </h2>
              <p className="text-xs text-white/60 font-mono">
                Official operational checklist for committee staff, laboratory proctors, and stage marshals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {materialsByEvent.map((m, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-white/15 bg-black/30 backdrop-blur-md hover:border-metallic-gold/50 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                    <h3 className="text-sm font-black uppercase text-white font-excon-bold">
                      {m.event}
                    </h3>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/10 text-arc-cyan border border-arc-cyan/30">
                      {m.venue}
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-white/80 font-mono">
                    {m.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start gap-2">
                        <span className="text-metallic-gold shrink-0">▸</span>
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: EVENT KITS & CONTROL DOCUMENTS */}
        {activeTab === "kits" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Standard Event Kit */}
              <div className="p-6 rounded-3xl border border-metallic-gold/30 bg-black/25 backdrop-blur-md shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-metallic-gold text-xs font-bold uppercase tracking-wider font-excon-bold border-b border-white/10 pb-2.5">
                  <RiSuitcaseLine className="text-base" />
                  <span>Standard Event Kit (For Every Event)</span>
                </div>
                <ul className="space-y-2 text-xs font-mono text-white/80">
                  {standardEventKit.map((item, idx) => (
                    <li key={idx} className="p-2.5 bg-black/35 rounded-lg border border-white/10 flex items-center gap-2">
                      <span className="text-metallic-gold font-bold">{idx + 1}.</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Treasure Hunt Kit */}
              <div className="space-y-6">
                <div className="p-6 rounded-3xl border border-arc-cyan/30 bg-black/25 backdrop-blur-md shadow-xl space-y-4">
                  <div className="flex items-center gap-2 text-arc-cyan text-xs font-bold uppercase tracking-wider font-excon-bold border-b border-white/10 pb-2.5">
                    <RiSuitcaseLine className="text-base" />
                    <span>Treasure Hunt Kit (Additional Items)</span>
                  </div>
                  <ul className="space-y-2 text-xs font-mono text-white/80">
                    {treasureHuntKit.map((item, idx) => (
                      <li key={idx} className="p-2.5 bg-black/35 rounded-lg border border-white/10 flex items-center gap-2">
                        <span className="text-arc-cyan font-bold">{idx + 1}.</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 rounded-2xl border border-white/15 bg-black/25 backdrop-blur-md text-xs font-mono space-y-2 text-white/70">
                  <span className="text-white font-bold uppercase text-[11px] block text-metallic-gold">
                    Official Committee Handover Policy:
                  </span>
                  <p>
                    Every Event Head must verify the presence of their assigned kit 45 minutes before event launch. All signed scoring sheets and incident logs must be returned to the Central Control Desk immediately after conclusion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: INNOVATION EXPO & PROSPECTIVE SCHOOLS */}
        {activeTab === "expo" && (
          <div className="space-y-8">
            {/* Expo Overview */}
            <div className="p-6 sm:p-8 rounded-3xl border border-arc-cyan/30 bg-black/25 backdrop-blur-md space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-arc-cyan/20 text-arc-cyan text-xs font-bold uppercase tracking-wider font-mono">
                    ⭐ School Event Most Attractive Event
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase text-white font-excon-black">
                    STARK EXPO
                  </h2>
                  <p className="text-sm text-metallic-gold font-mono font-bold">
                    Tag line : One Expo. Infinite Worlds of Discovery.
                  </p>
                  <p className="text-xs text-amber-300 font-mono mt-2 bg-amber-400/10 border border-amber-400/30 p-2.5 rounded-xl">
                    ℹ️ <strong>STAR EXPO – PRIZE POOL IS NOT THERE:</strong> Highlighting this in the school event section: this is not a competition, just a free expo / exhibition for students to gain hands-on experience on different domains!
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-arc-cyan/20 text-arc-cyan text-xs font-bold border border-arc-cyan/30">
                  Free Access · Non-Competitive
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {expoRooms.map((r, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-white/10 bg-black/35 backdrop-blur-sm space-y-2">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold font-mono text-metallic-gold">{r.room}</span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/10 text-arc-cyan">
                        {r.badge}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white font-excon-bold">{r.title}</h3>
                    <p className="text-xs text-white/75 font-mono leading-relaxed">{r.details}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Prospective Schools Directory */}
            <div className="p-6 sm:p-8 rounded-3xl border border-white/15 bg-black/25 backdrop-blur-md space-y-4">
              <div className="flex items-center gap-2 text-metallic-gold text-xs font-bold uppercase tracking-wider font-excon-bold border-b border-white/10 pb-2.5">
                <RiSchoolLine className="text-base" />
                <span>Prospective Schools for Expo Invitation (Document 1)</span>
              </div>
              <p className="text-xs text-white/60 font-mono">
                Official list of visiting institutions, partner higher secondary schools, and student delegations:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
                {prospectiveSchools.map((school, idx) => (
                  <div key={idx} className="p-3 bg-black/35 border border-white/10 rounded-xl space-y-1">
                    <div className="flex items-center justify-between text-white/50 text-[10px]">
                      <span>INVITATION #{idx + 1}</span>
                      <span className="text-metallic-gold">{school.location}</span>
                    </div>
                    <p className="text-white font-bold truncate">{school.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: GENERAL CODE OF CONDUCT */}
        {activeTab === "common" && (
          <div className="p-6 sm:p-8 rounded-3xl border border-arc-cyan/30 bg-black/25 backdrop-blur-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2 text-metallic-gold text-xs font-bold uppercase tracking-wider font-excon-bold">
                <RiAlertLine className="text-base" />
                <span>Common Regulations for All Festival Competitions</span>
              </div>
              {dynamicGeneralRules.length > 0 && (
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-arc-cyan/20 text-arc-cyan font-bold">
                  {dynamicGeneralRules.length} Live Directives
                </span>
              )}
            </div>

            <div className="space-y-3 text-xs font-excon">
              {commonRules.map((rule, idx) => (
                <div key={idx} className="p-3.5 bg-black/35 backdrop-blur-sm border border-white/10 rounded-xl flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-marvel-red/20 text-marvel-red font-bold text-[10px] flex items-center justify-center shrink-0 font-mono mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-white/85 leading-relaxed">{rule}</p>
                </div>
              ))}
              {dynamicGeneralRules.map((r) => (
                <div key={r.id} className="p-3.5 bg-marvel-red/10 backdrop-blur-sm border border-marvel-red/40 rounded-xl flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-marvel-red text-white font-bold text-[10px] flex items-center justify-center shrink-0 font-mono mt-0.5">
                    ★
                  </span>
                  <div>
                    <span className="text-marvel-red font-bold block mb-0.5">{r.title}</span>
                    <p className="text-white/85 leading-relaxed">{r.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center pt-4">
          <Link to="/events" className="text-xs text-arc-cyan font-bold hover:underline inline-flex items-center gap-1.5 font-mono">
            <RiCompass3Line />
            <span>Explore All 21 Hero Arena Event Missions &amp; Live Registrations</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

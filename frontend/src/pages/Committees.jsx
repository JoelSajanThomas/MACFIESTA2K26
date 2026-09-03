import { useState } from "react";
import PageHeader from "../components/PageHeader";
import SectionBadge from "../components/theme/SectionBadge";
import {
  CORE_TEAM,
  COMMITTEE_HEADS,
  COLLEGE_EVENTS_INCHARGE,
  SCHOOL_EVENTS_INCHARGE,
} from "../utils/committees";
import { PAGE_IMAGES } from "../utils/assets";
import { SUPERHERO_THEME } from "../theme/superheroTheme";
import { COMMITTEE_DIVISIONS } from "../theme/roster";
import { ORIGINAL_BACKGROUNDS } from "../theme/originalAssets";
import { RiPhoneLine, RiShieldUserLine, RiGraduationCapLine, RiSchoolLine } from "react-icons/ri";

function resolveDivision(roleOrName) {
  const raw = String(roleOrName || "").toLowerCase();
  const entries = Object.entries(COMMITTEE_DIVISIONS);
  for (const [key, div] of entries) {
    if (raw.includes(key)) return { key, ...div };
  }
  for (const [key, label] of Object.entries(SUPERHERO_THEME.committeeDisplay)) {
    if (raw.includes(key)) {
      return COMMITTEE_DIVISIONS[key]
        ? { key, ...COMMITTEE_DIVISIONS[key] }
        : { key, label, emblem: COMMITTEE_DIVISIONS.core.emblem };
    }
  }
  return { key: "core", ...COMMITTEE_DIVISIONS.core, label: roleOrName || "Division" };
}

function PersonCard({ person }) {
  const division = resolveDivision(person.role) || resolveDivision(person.detail);
  const displayRole = division.label || person.role;

  return (
    <article className="committee-card detail-panel comic-panel comic-panel--gold committee-division-card">
      <img
        src={division.emblem}
        alt=""
        className="committee-division-emblem"
        width={48}
        height={48}
        loading="lazy"
      />
      <SectionBadge tone="gold">Division</SectionBadge>
      <h3>{person.name}</h3>
      <p className="committee-role">{displayRole}</p>
      {person.detail && <p className="committee-detail">{person.detail}</p>}
      {person.phone && (
        <a className="committee-phone flex items-center gap-1.5" href={`tel:${person.phone.replace(/[\s+]/g, "")}`}>
          <RiPhoneLine />
          <span>{person.phone}</span>
        </a>
      )}
      {person.image && (
        <img src={person.image} alt="" className="committee-member-photo" loading="lazy" decoding="async" />
      )}
    </article>
  );
}

function EventInchargeCard({ incharge, isSchool = false }) {
  return (
    <article className="committee-card detail-panel comic-panel comic-panel--gold p-5 space-y-3 relative overflow-hidden bg-black/40 backdrop-blur-md border border-white/15 rounded-2xl hover:border-metallic-gold transition-all">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full bg-metallic-gold/15 text-metallic-gold border border-metallic-gold/30 font-mono">
          {isSchool ? "School Arena" : "College Arena"}
        </span>
        <span className="text-[10px] text-white/50 font-mono">{incharge.department}</span>
      </div>

      <div>
        <h4 className="text-sm font-black uppercase text-metallic-gold font-excon-black leading-tight">
          {incharge.event}
        </h4>
        <p className="text-base font-bold text-white mt-1">{incharge.name}</p>
      </div>

      {incharge.contacts && incharge.contacts.length > 0 ? (
        <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs font-mono">
          <span className="text-[10px] uppercase text-white/40 block">Team Coordinators:</span>
          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
            {incharge.contacts.map((c, idx) => (
              <div key={idx} className="flex items-center justify-between gap-2 text-[11px] py-0.5">
                <span className="text-white/80 truncate">
                  {c.name} <span className="text-white/40">({c.detail})</span>
                </span>
                <a
                  href={`tel:${c.phone.replace(/[\s+]/g, "")}`}
                  className="text-arc-cyan hover:underline shrink-0 font-bold"
                >
                  {c.phone}
                </a>
              </div>
            ))}
          </div>
        </div>
      ) : incharge.phone ? (
        <div className="pt-2 border-t border-white/10">
          <a
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-arc-cyan hover:text-white transition-colors"
            href={`tel:${incharge.phone.replace(/[\s+]/g, "")}`}
          >
            <RiPhoneLine />
            <span>{incharge.phone}</span>
          </a>
        </div>
      ) : null}
    </article>
  );
}

export default function Committees() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <>
      <PageHeader
        eyebrow="Command Divisions"
        title="Committees & Coordinators"
        subtitle="Meet the core command, operational heads, and official event in-charges for MacFiesta 2026."
        seoDescription="MacFiesta Core Team, committee heads, and official school & college event coordinators with contact details."
        image={PAGE_IMAGES.about}
      />
      <section
        className="section page-content committees-divisions mf-command-divisions"
        style={{ backgroundImage: `url(${ORIGINAL_BACKGROUNDS.command})` }}
      >
        <div className="committees-divisions__veil" />
        <div className="container space-y-12">
          {/* Section Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {[
              { id: "all", label: "All Teams", icon: RiShieldUserLine },
              { id: "core", label: "Core Command", icon: RiShieldUserLine },
              { id: "college", label: "College Event Heads (13)", icon: RiGraduationCapLine },
              { id: "school", label: "School Event Heads (8)", icon: RiSchoolLine },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer font-mono ${
                  activeTab === id
                    ? "bg-metallic-gold text-black border-metallic-gold shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                    : "bg-black/40 text-white/70 border-white/15 hover:text-white hover:border-white/30"
                }`}
              >
                <Icon className="text-sm" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Core Command */}
          {(activeTab === "all" || activeTab === "core") && (
            <div className="space-y-6">
              <h2 className="section-title">Core Command</h2>
              <div className="committee-grid">
                {CORE_TEAM.map((p) => (
                  <PersonCard key={p.name + p.phone} person={p} />
                ))}
              </div>

              <h2 className="section-title" style={{ marginTop: "2.5rem" }}>
                Operational Divisions
              </h2>
              <div className="committee-grid">
                {COMMITTEE_HEADS.map((p) => (
                  <PersonCard key={p.name + p.role} person={p} />
                ))}
              </div>
            </div>
          )}

          {/* College Events In-Charge */}
          {(activeTab === "all" || activeTab === "college") && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-metallic-gold">
                <RiGraduationCapLine className="text-xl" />
                <h2 className="section-title !m-0">College Events In-Charge</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {COLLEGE_EVENTS_INCHARGE.map((c) => (
                  <EventInchargeCard key={c.event} incharge={c} isSchool={false} />
                ))}
              </div>
            </div>
          )}

          {/* School Events In-Charge */}
          {(activeTab === "all" || activeTab === "school") && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-arc-cyan">
                <RiSchoolLine className="text-xl" />
                <h2 className="section-title !m-0">School Events In-Charge</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {SCHOOL_EVENTS_INCHARGE.map((c) => (
                  <EventInchargeCard key={c.event} incharge={c} isSchool={true} />
                ))}
              </div>
            </div>
          )}

          <p className="committee-note text-center text-xs text-white/50 pt-4 font-mono">
            Staff, student coordinators, and volunteers sign in at the official{" "}
            <a href="/login" className="text-metallic-gold underline">Sign In</a>
            {" "}portal — your assigned mission desk opens automatically after authentication.
          </p>
        </div>
      </section>
    </>
  );
}

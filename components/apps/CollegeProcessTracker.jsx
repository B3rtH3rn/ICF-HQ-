"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Plus, X, GraduationCap, FileText, Users, Award, Phone, Briefcase, Clock,
Trash2, Edit2, Check, MapPin, Mail, Copy, Send, Link2, ExternalLink, Sparkles,
Loader2, Trophy } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
// ---------- constants ----------
const TABS = [
  { id: "dashboard", label: "Overview", icon: Clock },
  { id: "applications", label: "Applications", icon: GraduationCap },
  { id: "essays", label: "Essays", icon: FileText },
  { id: "recs", label: "Recommendations", icon: Users },
  { id: "scholarships", label: "Scholarships", icon: Award },
  { id: "calls", label: "Coach Calls", icon: Phone },
  { id: "visits", label: "Campus Visits", icon: MapPin },
  { id: "email", label: "Coach Email", icon: Mail },
  { id: "links", label: "Links", icon: Link2 },
  { id: "achievements", label: "Achievement Tracker", icon: Trophy },
];
const PURPLE = "#6B4FA0";
const PURPLE_DARK = "#4E3876";
const PURPLE_LIGHT = "#F0EBF8";
const TAB_COLOR = {
  dashboard: PURPLE,
  applications: "#1B2A41",
  essays: "#3F5B45",
  recs: "#7a4a2b",
  scholarships: "#B8894A",
  calls: "#8B3A3A",
  visits: "#2f5b6b",
  email: PURPLE_DARK,
  links: "#2f4f6b",
  achievements: "#8a6d3b",
};
const APP_STATUSES = ["Researching", "In Progress", "Submitted", "Interviewing", 
"Accepted", "Waitlisted", "Enrolled", "Declined"];
const SCHOOL_TIERS = ["Reach", "Target", "Safety"];
const TIER_COLOR = { Reach: "#8B3A3A", Target: "#B8894A", Safety: "#3F5B45" };
const TIER_BG = { Reach: "#f3e2e0", Target: "#f3ead9", Safety: "#e5efe6" };
const LINK_CATEGORIES = [
  "UTR", "Common App / Coalition", "NCAA Eligibility Center", "FAFSA / CSS Profile", "Highlight Video", "Test Scores (College Board / ACT)",
  "School Website", "Admissions / Apply Page", "Tennis Roster / Coaches", 
"Financial Aid / Net Price Calculator", "Major / Department Page", "Campus Visit Scheduling",
  "Other",
];
const ACHIEVEMENT_CATEGORIES = ["Volunteer Hours", "Internship", "Clubs / Organizations", "Leadership", "Award / Honor", "Other"];
const ACHIEVEMENT_COLOR = {
  "Volunteer Hours": "#3F5B45",
  "Internship": "#7a4a2b",
  "Clubs / Organizations": "#2f5b6b",
  "Leadership": PURPLE,
  "Award / Honor": "#B8894A",
  "Other": "#6b6355",
};
const ESSAY_STATUSES = ["Not started", "Outlining", "Drafting", "Revising", 
"Final"];
const PROMPT_TYPES = [
  "Background, identity, interest, or talent",
  "Overcoming a challenge or setback",
  "Questioned or challenged a belief",
  "Gratitude that shifted your perspective",
  "Personal growth / new understanding",
  "Topic or idea that captivates you",
  "Topic of your choice",
  "Why this major / academic interest",
  "Why this school (supplemental)",
  "Extracurricular or activity essay",
  "Community contribution",
  "Other / not sure yet",
];
const REC_STATUSES = ["Not asked", "Requested", "In progress", "Submitted"];
const SCH_STATUSES = ["Researching", "Drafting", "Submitted", "Awarded", 
"Declined"];
const CALL_STATUSES = ["Scheduled", "Completed", "Follow-up needed", "Cancelled"];
const VISIT_STATUSES = ["Planned", "Confirmed", "Completed", "Cancelled"];
const VISIT_TYPES = ["Unofficial visit", "Official visit"];
const STATUS_TONE = {
  Researching: "neutral", "Not started": "neutral", "Not asked": "neutral", 
Planned: "neutral",
  "In Progress": "active", Outlining: "active", Drafting: "active", Requested: "active", Scheduled: "active", "In progress": "active", Confirmed: "active",
  Submitted: "pending", Revising: "pending", Interviewing: "pending", "Follow-up needed": "pending",
  Accepted: "good", Awarded: "good", Final: "good", Enrolled: "good", Completed: "good", Done: "good",
  Waitlisted: "warn",
  Declined: "bad", Rejected: "bad", Cancelled: "bad",
};
// ---------- AI features ----------
// The app's "write my email with AI," scholarship finder, essay feedback,
// and school-lookup features all call the Anthropic API directly from the
// browser. That requires an API key, and putting a real key in frontend
// code would expose it publicly — so instead of doing that, every AI call
// site below checks this flag first and fails with a clear, honest message
// rather than making a network request that's guaranteed to fail (missing
// auth) or get blocked (the API doesn't allow arbitrary browser origins).
// Flip this on (and route the fetch calls through a server-side proxy that
// holds the real key) once that backend piece exists — see README/chat notes.
const AI_FEATURES_ENABLED = false;
const AI_DISABLED_MESSAGE =
  "AI features aren't connected yet — check back once this is set up.";
function assertAiEnabled() {
  if (!AI_FEATURES_ENABLED) throw new Error(AI_DISABLED_MESSAGE);
}
const uid = () => Math.random().toString(36).slice(2, 10);
const todayISO = () => new Date().toISOString().slice(0, 10);
const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  const t = new Date(todayISO() + "T00:00:00");
  return Math.round((d - t) / 86400000);
};
const fmtDate = (dateStr) => {
  if (!dateStr) return "No date set";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};
const EMPTY = {
  schools: [],
  essays: [],
  recs: [],
  scholarships: [],
  calls: [],
  visits: [],
  links: [],
  achievements: [],
  emailDraft: {
    template: "intro", yourName: "", gradYear: "", highSchool: "", club: "", 
position: "",
    utr: "", gpa: "", testScore: "", achievements: "", videoLink: "",
    coachName: "", coachEmail: "", schoolName: "", whySchool: "",
  },
  scholarshipProfile: { gpa: "", satAct: "", state: "", major: "", financialNeed: "", otherFactors: "" },
  emailsSent: 0,
  generalFolderLabel: "General",
};
// ---------- small UI atoms ----------
function Badge({ status }) {
  const tone = STATUS_TONE[status] || "neutral";
  const toneStyles = {
    neutral: { bg: "#eee8db", fg: "#6b6355", bd: "#d8cfba" },
    active: { bg: "#e7edea", fg: "#3F5B45", bd: "#c3d2c8" },
    pending: { bg: "#f3ead9", fg: "#8a6d3b", bd: "#e3cfa4" },
    good: { bg: "#e5efe6", fg: "#2f5233", bd: "#bcd8bf" },
    warn: { bg: "#f6ebd9", fg: "#8B3A3A", bd: "#e8c9a0" },
    bad: { bg: "#f3e2e0", fg: "#8B3A3A", bd: "#e0bcb8" },
  }[tone];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase",
      padding: "3px 8px", borderRadius: 3, background: toneStyles.bg, color: toneStyles.fg,
      border: `1px solid ${toneStyles.bd}`, fontWeight: 600, whiteSpace: "nowrap",
    }}>{status}</span>
  );
}
function DeadlineChip({ dateStr }) {
  if (!dateStr) return <span style={{ fontSize: 12, color: "#a39c8c", fontStyle: "italic" }}>no date set</span>;
  const d = daysUntil(dateStr);
  let color = "#6b6355";
  let text = fmtDate(dateStr);
  if (d < 0) { color = "#8B3A3A"; text = `🔥 ${fmtDate(dateStr)} · past due`; }
  else if (d === 0) { color = "#8B3A3A"; text = `🔥 ${fmtDate(dateStr)} · today`; }
  else if (d <= 3) { color = "#8B3A3A"; text = `🔥 ${fmtDate(dateStr)} · ${d}d left`; }
  else if (d <= 7) { color = "#8B3A3A"; text = `${fmtDate(dateStr)} · ${d}d left`; }
  else if (d <= 21) { color = "#8a6d3b"; text = `${fmtDate(dateStr)} · ${d}d left`; 
}
  return <span style={{ fontSize: 12.5, color, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace" }}>{text}</span>;
}
function Field({ label, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12.5, color: "#6b6355", fontWeight: 600 }}>
      {label}
      {children}
    </label>
  );
}
const inputStyle = {
  fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, padding: "8px 10px",
  border: "1px solid #d8cfba", borderRadius: 4, background: "#fffdf9", color: "#2B2B28", outline: "none",
};
function TextInput(props) { return <input {...props} style={{ ...inputStyle, ...(props.style || {}) }} />; }
function TextArea(props) { return <textarea {...props} style={{ ...inputStyle, 
resize: "vertical", minHeight: 60, ...(props.style || {}) }} />; }
function Select({ options, ...props }) {
  return (
    <select {...props} style={{ ...inputStyle, ...(props.style || {}) }}>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
function Btn({ children, variant = "primary", ...props }) {
  const styles = {
    primary: { background: PURPLE, color: "#F7F3EA", border: `1px solid ${PURPLE}`, 
boxShadow: `0 2px 8px ${PURPLE}33` },
    ghost: { background: "transparent", color: "#6b6355", border: "1px solid #d8cfba" },
    danger: { background: "transparent", color: "#8B3A3A", border: "1px solid #e0bcb8" },
  }[variant];
  return (
    <button {...props} style={{
      ...styles, fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600, 
fontSize: 13,
      padding: "8px 14px", borderRadius: 4, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
      transition: "opacity .15s", ...(props.style || {}),
    }}>{children}</button>
  );
}
function SectionCard({ children, accent, onEdit, onDelete, onOpen }) {
  const [popping, setPopping] = useState(false);
  const handleOpen = () => {
    if (!onOpen) return;
    setPopping(true);
    onOpen();
    setTimeout(() => setPopping(false), 400);
  };
  return (
    <div
      style={{
        background: "#fffdf9", border: "1px solid #e4dcc9", borderLeft: `4px solid ${accent}`,
        borderRadius: 6, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8,
        boxShadow: popping ? `0 0 0 4px ${accent}55` : "0 0 0 0 transparent",
        transition: "box-shadow 0.4s ease",
      }}
    >
      <div
        onClick={handleOpen}
        className={onOpen ? `openable-card${popping ? " pop-animate" : ""}` : ""}
        style={{ display: "flex", flexDirection: "column", gap: 8, cursor: onOpen ? "pointer" : "default" }}
      >
        {children}
      </div>
      {(onEdit || onDelete) && (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, 
marginTop: 4, paddingTop: 10, borderTop: "1px solid #ece4d3" }}>
          {onEdit && (
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} title="Edit" style={actionBtnStyle("#1B2A41", "#dfe6ee")}>
              <Edit2 size={13} /> Edit
            </button>
          )}
          {onDelete && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} title="Delete" style={actionBtnStyle("#8B3A3A", "#f0d9d6")}>
              <Trash2 size={13} /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
const iconBtnStyle = { background: "transparent", border: "none", color: "#a39c8c", 
cursor: "pointer", padding: 4, display: "flex" };
const actionBtnStyle = (fg, border) => ({
  display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 600,
  fontFamily: "'IBM Plex Sans', sans-serif", color: fg, background: "#fffdf9",
  border: `1px solid ${border}`, borderRadius: 5, padding: "6px 10px", cursor: "pointer",
});
function Modal({ title, onClose, children, width = 480 }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(27,42,65,0.35)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16,
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#F7F3EA", borderRadius: 8, padding: 22, width: `min(${width} px, 100%)`,
        maxHeight: "85vh", overflowY: "auto", border: "1px solid #e4dcc9",
        boxShadow: "0 20px 50px rgba(27,42,65,0.25)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontFamily: "'Lora', serif", fontSize: 19, color: "#1B2A41" }}>{title}</h3>
          <button onClick={onClose} style={iconBtnStyle}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
function EmptyState({ text, cta, onClick, emoji }) {
  return (
    <div style={{
      border: "1px dashed #d8cfba", borderRadius: 6, padding: "28px 20px", 
textAlign: "center", color: "#a39c8c",
    }}>
      {emoji && <div style={{ fontSize: 28, marginBottom: 8 }}>{emoji}</div>}
      <p style={{ margin: "0 0 12px", fontSize: 14 }}>{text}</p>
      {cta && <Btn variant="ghost" onClick={onClick}><Plus size={14} />{cta}</Btn>}
    </div>
  );
}
// ---------- main app ----------
export default function CollegeProcessTracker() {
  const { user, loading: authLoading } = useAuth();
  const [supabase] = useState(() => createClient());
  const [data, setData] = useState(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [modal, setModal] = useState(null); // { type, editing }

  useEffect(() => {
    if (!user) {
      setLoaded(false);
      return;
    }
    setLoaded(false);
    (async () => {
      try {
        const { data: row } = await supabase
          .from("college_tracker_data")
          .select("data")
          .eq("user_id", user.id)
          .maybeSingle();
        if (row && row.data) setData({ ...EMPTY, ...row.data });
      } catch (e) { /* no data yet */ }
      setLoaded(true);
    })();
  }, [user, supabase]);

  const persist = useCallback(async (next) => {
    setData(next);
    if (!user) return;
    try {
      await supabase.from("college_tracker_data").upsert({
        user_id: user.id,
        data: next,
        updated_at: new Date().toISOString(),
      });
    } catch (e) { console.error("save failed", e); }
  }, [user, supabase]);
  const upsert = (key, item) => {
    const list = data[key];
    const exists = list.some((x) => x.id === item.id);
    const next = exists ? list.map((x) => (x.id === item.id ? item : x)) : [...list, item];
    persist({ ...data, [key]: next });
  };
  const remove = (key, id) => persist({ ...data, [key]: data[key].filter((x) => x.id !== id) });
  const addLinks = (items) => persist({ ...data, links: [...data.links, ...items] });
  const saveGeneralFolderLabel = (label) => persist({ ...data, generalFolderLabel: label });
  const saveEmailDraft = (emailDraft) => persist({ ...data, emailDraft });
  const saveScholarshipProfile = (scholarshipProfile) => persist({ ...data, 
scholarshipProfile });
  const adjustEmailsSent = (delta) => persist({ ...data, emailsSent: Math.max(0, 
(data.emailsSent || 0) + delta) });
  if (authLoading) {
    return <div style={{ ...shell, alignItems: "center", justifyContent: "center", color: "#a39c8c", fontFamily: "'IBM Plex Sans', sans-serif" }}>Loading…</div>;
  }
  if (!user) {
    return (
      <div style={{ ...shell, alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center", fontFamily: "'IBM Plex Sans', sans-serif" }}>
        <div style={{ maxWidth: 360 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎾</div>
          <h1 style={{ fontFamily: "'Lora', serif", fontSize: 22, color: "#1B2A41", margin: "0 0 8px" }}>Sign in to use the College Process Tracker</h1>
          <p style={{ fontSize: 14, color: "#6b6355", margin: "0 0 20px", lineHeight: 1.5 }}>Your schools, essays, and everything else here are saved to your account, so you&apos;ll need to be signed in first.</p>
          <Link href="/login?redirectedFrom=/apps/college-process" style={{ display: "inline-flex", padding: "10px 20px", borderRadius: 4, background: "#6B4FA0", color: "#F7F3EA", textDecoration: "none", fontWeight: 600, fontFamily: "'IBM Plex Sans', sans-serif" }}>Sign in</Link>
        </div>
      </div>
    );
  }
  if (!loaded) {
    return <div style={{ ...shell, alignItems: "center", justifyContent: "center",
color: "#a39c8c", fontFamily: "'IBM Plex Sans', sans-serif" }}>Loading your tracker…</div>;
  }
  const allDeadlines = [
    ...data.essays.filter((e) => e.dueDate).map((e) => ({ id: e.id, label: e.prompt || e.promptType || "Essay", sub: e.school || "Essay", date: e.dueDate, accent: TAB_COLOR.essays })),
    ...data.recs.filter((r) => r.dueDate).map((r) => ({ id: r.id, label: r.recommender, sub: "Recommendation", date: r.dueDate, accent: TAB_COLOR.recs })),
    ...data.scholarships.filter((s) => s.deadline).map((s) => ({ id: s.id, label: s.name, sub: "Scholarship", date: s.deadline, accent: TAB_COLOR.scholarships })),
    ...data.calls.filter((c) => c.date).map((c) => ({ id: c.id, label: c.coach || c.school, sub: "Coach call", date: c.date, accent: TAB_COLOR.calls })),
    ...data.visits.filter((v) => v.date).map((v) => ({ id: v.id, label: v.school, 
sub: v.type || "Campus visit", date: v.date, accent: TAB_COLOR.visits })),
  ].sort((a, b) => a.date.localeCompare(b.date));
  return (
    <div style={shell}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        * { box-sizing: border-box; }
        ::selection { background: #6B4FA044; }
        button:focus-visible, input:focus-visible, textarea:focus-visible, 
select:focus-visible {
          outline: 2px solid #6B4FA0; outline-offset: 1px;
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 0.9s linear infinite; }
        .openable-card { transition: transform 0.12s ease; }
        @keyframes cardPop {
          0% { transform: scale(1); }
          30% { transform: scale(0.92) rotate(-0.5deg); }
          55% { transform: scale(1.04) rotate(0.5deg); }
          80% { transform: scale(0.98); }
          100% { transform: scale(1); }
        }
        .pop-animate { animation: cardPop 0.4s cubic-bezier(.36,1.65,.6,1); }
        @keyframes ratingPop {
          0% { transform: scale(1) rotate(0deg); }
          35% { transform: scale(1.45) rotate(-6deg); }
          65% { transform: scale(0.9) rotate(4deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        .rating-pop { animation: ratingPop 0.4s cubic-bezier(.36,1.65,.6,1); z-index: 2; }
      `}</style>
      {/* Letterhead */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${PURPLE} 0%, ${PURPLE} 45%, #B8894A 100%)`, flexShrink: 0 }} />
      <header style={{ padding: "22px 28px 18px", borderBottom: "1px solid #e4dcc9" 
}}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, 
letterSpacing: "0.14em", color: PURPLE, textTransform: "uppercase", marginBottom: 4, fontWeight: 600 }}>
              Student-Athlete College Process
            </div>
            <h1 style={{ margin: 0, fontFamily: "'Lora', serif", fontWeight: 700, 
fontSize: 27, color: "#1B2A41" }}>College Process Tracker 🎾</h1>
          </div>
          <EmailsSentBadge count={data.emailsSent || 0} onAdjust={adjustEmailsSent} />
        </div>
      </header>
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* Folder-tab nav */}
        <nav style={{ width: 190, borderRight: "1px solid #e4dcc9", padding: "18px 0", flexShrink: 0 }}>
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 10,
                padding: "11px 18px", border: "none", cursor: "pointer",
                background: active ? "#fffdf9" : "transparent",
                borderLeft: active ? `4px solid ${TAB_COLOR[t.id]}` : "4px solid transparent",
                fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: active ? 700 : 500, fontSize: 13.5,
                color: active ? "#1B2A41" : "#8a8272",
              }}>
                <Icon size={15} color={active ? TAB_COLOR[t.id] : "#a39c8c"} />
                {t.label}
              </button>
            );
          })}
        </nav>
        {/* Main panel */}
        <main style={{ flex: 1, padding: "24px 30px 40px", overflowY: "auto" }}>
          {tab === "dashboard" && <Dashboard data={data} deadlines={allDeadlines} goTo={setTab} />}
          {tab === "applications" && (
            <ApplicationsPanel
              schools={data.schools}
              onAdd={(tier) => setModal({ type: "school", editing: { tier } })}
              onEdit={(item) => setModal({ type: "school", editing: item })}
              onDelete={(id) => remove("schools", id)}
              onOpen={(item) => setModal({ type: "schoolProfile", editing: item })}
            />
          )}
          {tab === "essays" && (
            <ListPanel
              title="Essays" titleEmoji="✍️" accent={TAB_COLOR.essays}
              items={data.essays} addLabel="Add essay"
              onAdd={() => setModal({ type: "essay" })}
              onEdit={(item) => setModal({ type: "essay", editing: item })}
              onDelete={(id) => remove("essays", id)}
              onOpen={(item) => setModal({ type: "essayWorkspace", editing: item })}
              empty="No essays logged yet. Track prompts, drafts, and word limits here."
              emptyEmoji="✍️"
              render={(e) => (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", 
alignItems: "flex-start", gap: 10 }}>
                    <div>
                      <div style={{ fontFamily: "'Lora', serif", fontWeight: 600, 
fontSize: 15.5, color: "#1B2A41" }}>{e.prompt || e.promptType || "Untitled prompt"} </div>
                      <div style={{ fontSize: 12.5, color: "#8a8272", marginTop: 2 }}>{e.school || "General"}{e.wordLimit ? ` · ${e.wordLimit} words` : ""}</div>
                    </div>
                    <Badge status={e.status} />
                  </div>
                  {e.prompt && e.promptType && e.promptType !== "Other / not sure yet" && (
                    <span style={{ display: "inline-flex", alignSelf: "flex-start", 
fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", 
letterSpacing: "0.03em", color: TAB_COLOR.essays, background: "#e7edea", border: "1px solid #c3d2c8", borderRadius: 3, padding: "2px 7px" }}>{e.promptType}</span>
                  )}
                  <DeadlineChip dateStr={e.dueDate} />
                  <div style={{ fontSize: 11.5, color: "#8a8272", marginTop: 2 }}>
                    {e.draft ? `${e.draft.trim().split(/\s+/).filter(Boolean).length} words drafted` : "No draft yet"}
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: TAB_COLOR.essays }}>
                    Click to open workspace →
                  </div>
                </>
              )}
            />
          )}
          {tab === "recs" && (
            <ListPanel
              title="Recommendation Letters" titleEmoji="🤝" accent={TAB_COLOR.recs}
              items={data.recs} addLabel="Add recommender"
              onAdd={() => setModal({ type: "rec" })}
              onEdit={(item) => setModal({ type: "rec", editing: item })}
              onDelete={(id) => remove("recs", id)}
              empty="No recommenders yet. Log who you're asking and where letters are headed."
              emptyEmoji="🤝"
              render={(r) => (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", 
alignItems: "flex-start", gap: 10 }}>
                    <div>
                      <div style={{ fontFamily: "'Lora', serif", fontWeight: 600, 
fontSize: 15.5, color: "#1B2A41" }}>{r.recommender}</div>
                      <div style={{ fontSize: 12.5, color: "#8a8272", marginTop: 2 }}>{r.role}{r.school ? ` · for ${r.school}` : ""}</div>
                    </div>
                    <Badge status={r.status} />
                  </div>
                  <DeadlineChip dateStr={r.dueDate} />
                </>
              )}
            />
          )}
          {tab === "scholarships" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <ScholarshipFinder
                profile={data.scholarshipProfile}
                achievements={data.achievements}
                onSaveProfile={saveScholarshipProfile}
                onAddScholarship={(item) => upsert("scholarships", item)}
              />
              <ListPanel
                title="Scholarships" titleEmoji="💰" accent={TAB_COLOR.scholarships}
                items={data.scholarships} addLabel="Add scholarship"
                onAdd={() => setModal({ type: "scholarship" })}
                onEdit={(item) => setModal({ type: "scholarship", editing: item })}
                onDelete={(id) => remove("scholarships", id)}
                empty="No scholarships tracked yet. Add opportunities as you find them, or use the finder above."
                emptyEmoji="💰"
                render={(s) => (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", 
alignItems: "flex-start", gap: 10 }}>
                      <div>
                        <div style={{ fontFamily: "'Lora', serif", fontWeight: 600, 
fontSize: 15.5, color: "#1B2A41" }}>{s.name}</div>
                        <div style={{ fontSize: 12.5, color: "#8a8272", marginTop: 2 }}>{s.amount ? `$${s.amount}` : "Amount TBD"}</div>
                      </div>
                      <Badge status={s.status} />
                    </div>
                    <DeadlineChip dateStr={s.deadline} />
                    {s.requirements && <div style={{ fontSize: 13, color: "#5c5648", marginTop: 4 }}>{s.requirements}</div>}
                    {s.url && (
                      <a href={s.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "#2f4f6b", textDecoration: "none", 
wordBreak: "break-all" }}>
                        <ExternalLink size={11} style={{ flexShrink: 0 }} /> {s.url}
                      </a>
                    )}
                  </>
                )}
              />
            </div>
          )}
          {tab === "calls" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <CallQuestionGenerator schools={data.schools} onUseQuestions={(notes) => setModal({ type: "call", editing: { notes } })} />
              <ListPanel
                title="Coach Calls" titleEmoji="📞" accent={TAB_COLOR.calls}
                items={data.calls} addLabel="Add call"
                onAdd={() => setModal({ type: "call" })}
                onEdit={(item) => setModal({ type: "call", editing: item })}
                onDelete={(id) => remove("calls", id)}
                empty="No coach calls logged yet. Track every conversation with a college coach here."
                emptyEmoji="📞"
                render={(c) => (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", 
alignItems: "flex-start", gap: 10 }}>
                      <div>
                        <div style={{ fontFamily: "'Lora', serif", fontWeight: 600, 
fontSize: 15.5, color: "#1B2A41" }}>{c.coach || "Coach TBD"}</div>
                        <div style={{ fontSize: 12.5, color: "#8a8272", marginTop: 2 }}>{c.school}{c.format ? ` · ${c.format}` : ""}{c.time ? ` · ${c.time}` : ""}</div>
                      </div>
                      <Badge status={c.status} />
                    </div>
                    <DeadlineChip dateStr={c.date} />
                    {c.notes && <div style={{ fontSize: 13, color: "#5c5648", 
marginTop: 4 }}>{c.notes}</div>}
                  </>
                )}
              />
            </div>
          )}
          {tab === "visits" && (
            <ListPanel
              title="Campus Visits" titleEmoji="🗺️" accent={TAB_COLOR.visits}
              items={data.visits} addLabel="Add visit"
              onAdd={() => setModal({ type: "visit" })}
              onEdit={(item) => setModal({ type: "visit", editing: item })}
              onDelete={(id) => remove("visits", id)}
              onOpen={(item) => setModal({ type: "visitWorkspace", editing: item })}
              empty="No campus visits yet. Log official, unofficial, and virtual visits here."
              emptyEmoji="🗺️"
              render={(v) => (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", 
alignItems: "flex-start", gap: 10 }}>
                    <div>
                      <div style={{ fontFamily: "'Lora', serif", fontWeight: 600, 
fontSize: 15.5, color: "#1B2A41" }}>{v.school}</div>
                      <div style={{ fontSize: 12.5, color: "#8a8272", marginTop: 2 }}>{v.type || "Visit type TBD"}</div>
                    </div>
                    <Badge status={v.status} />
                  </div>
                  <DeadlineChip dateStr={v.date} />
                  {v.notes && <div style={{ fontSize: 13, color: "#5c5648", 
marginTop: 4 }}>{v.notes}</div>}
                  <div style={{ fontSize: 11.5, color: "#8a8272", marginTop: 2 }}>
                    {v.photos && v.photos.length > 0 ? `📷 ${v.photos.length} photo${v.photos.length === 1 ? "" : "s"}` : "No photos yet"}
                    {v.longTermFit ? ` · Fit: ${v.longTermFit}` : ""}
                    {(() => {
                      const vals = Object.values(v.ratings || {}).filter((n) => n > 0);
                      if (vals.length === 0) return null;
                      const avg = (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
                      return ` · ⭐ ${avg}/10`;
                    })()}
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: TAB_COLOR.visits }}>
                    Click to open workspace →
                  </div>
                </>
              )}
            />
          )}
          {tab === "email" && <CoachEmailTab draft={data.emailDraft} schools={data.schools} achievements={data.achievements} onSave={saveEmailDraft} />}
          {tab === "links" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <SchoolLinkFinder schools={data.schools} onAddLinks={addLinks} />
              <LinksPanel
                links={data.links}
                schools={data.schools}
                generalFolderLabel={data.generalFolderLabel || "General"}
                onRenameGeneralFolder={saveGeneralFolderLabel}
                onEdit={(item) => setModal({ type: "link", editing: item })}
                onDelete={(id) => remove("links", id)}
              />
            </div>
          )}
          {tab === "achievements" && (
            <AchievementTracker
              achievements={data.achievements}
              onAdd={() => setModal({ type: "achievement" })}
              onEdit={(item) => setModal({ type: "achievement", editing: item })}
              onDelete={(id) => remove("achievements", id)}
            />
          )}
        </main>
      </div>
      {modal && modal.type === "schoolProfile" && (
        <SchoolProfileModal
          school={modal.editing}
          data={data}
          onClose={() => setModal(null)}
          onEdit={() => setModal({ type: "school", editing: modal.editing })}
        />
      )}
      {modal && modal.type === "essayWorkspace" && (
        <EssayWorkspaceModal
          essay={modal.editing}
          schools={data.schools}
          achievements={data.achievements}
          onClose={() => setModal(null)}
          onSave={(item) => upsert("essays", item)}
        />
      )}
      {modal && modal.type === "visitWorkspace" && (
        <VisitWorkspaceModal
          visit={modal.editing}
          onClose={() => setModal(null)}
          onSave={(item) => upsert("visits", item)}
        />
      )}
      {modal && modal.type !== "schoolProfile" && modal.type !== "essayWorkspace" && modal.type !== "visitWorkspace" && (
        <EditModal
          modal={modal}
          schools={data.schools}
          onClose={() => setModal(null)}
          onSave={(key, item) => { upsert(key, item); setModal(null); }}
        />
      )}
    </div>
  );
}
const shell = {
  minHeight: "100%", height: "100%", display: "flex", flexDirection: "column",
  background: "#F7F3EA", color: "#2B2B28", fontFamily: "'IBM Plex Sans', sans-serif",
};
function EmailsSentBadge({ count, onAdjust }) {
  const now = new Date();
  const hour = now.getHours();
  const isDaytime = hour >= 6 && hour < 18;
  const emoji = isDaytime ? "☀️" : "🌙";
  const dateStr = now.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const stepBtnStyle = {
    width: 20, height: 20, borderRadius: "50%", border: `1px solid ${PURPLE}55`, 
background: "#fffdf9",
    color: PURPLE, display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", padding: 0, flexShrink: 0, fontSize: 13, lineHeight: 1, 
fontWeight: 700,
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button onClick={() => onAdjust(-1)} title="Subtract one" style={stepBtnStyle}>−</button>
      <div style={{
        width: 54, height: 54, borderRadius: "50%", border: `2px solid ${PURPLE}`,
        display: "flex", alignItems: "center", justifyContent: "center", 
flexDirection: "column",
        background: `radial-gradient(circle, #fffdf9 55%, ${PURPLE_LIGHT} 100%)`, 
flexShrink: 0,
        boxShadow: `0 2px 10px ${PURPLE}22`,
      }}>
        <span style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: 18, 
color: PURPLE, lineHeight: 1 }}>{count}</span>
      </div>
      <button onClick={() => onAdjust(1)} title="Add one" style={stepBtnStyle}>+</button>
      <div style={{ fontSize: 11.5, color: "#8a8272", lineHeight: 1.5, fontFamily: "'IBM Plex Mono', monospace", marginLeft: 2 }}>
        emails sent<br />
        <span style={{ color: "#1B2A41", fontWeight: 600 }}>{dateStr}</span> <span style={{ fontSize: 14 }}>{emoji}</span>
      </div>
    </div>
  );
}
function Dashboard({ data, deadlines, goTo }) {
  const upcoming = deadlines.filter((d) => daysUntil(d.date) >= -1).slice(0, 6);
  const counts = [
    { label: "Schools", emoji: "🎓", n: data.schools.length, tab: "applications", 
accent: TAB_COLOR.applications },
    { label: "Essays", emoji: "✍️", n: data.essays.length, tab: "essays", accent: TAB_COLOR.essays },
    { label: "Recommenders", emoji: "🤝", n: data.recs.length, tab: "recs", accent: TAB_COLOR.recs },
    { label: "Scholarships", emoji: "💰", n: data.scholarships.length, tab: "scholarships", accent: TAB_COLOR.scholarships },
    { label: "Coach Calls", emoji: "📞", n: data.calls.length, tab: "calls", 
accent: TAB_COLOR.calls },
    { label: "Campus Visits", emoji: "🗺️", n: data.visits.length, tab: "visits", 
accent: TAB_COLOR.visits },
    { label: "Links Saved", emoji: "🔗", n: data.links.length, tab: "links", 
accent: TAB_COLOR.links },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
        {counts.map((c) => (
          <button key={c.label} onClick={() => goTo(c.tab)} style={{
            textAlign: "left", background: "#fffdf9", border: "1px solid #e4dcc9", 
borderTop: `3px solid ${c.accent}`,
            borderRadius: 6, padding: "14px 16px", cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif",
          }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontFamily: "'Lora', serif", fontWeight: 700, 
fontSize: 26, color: "#1B2A41" }}>{c.n}</span>
              <span style={{ fontSize: 16 }}>{c.emoji}</span>
            </div>
            <div style={{ fontSize: 12.5, color: "#8a8272", marginTop: 2 }} >{c.label}</div>
          </button>
        ))}
      </div>
      <div>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: 17, color: "#1B2A41", 
margin: "0 0 12px" }}>Upcoming on the calendar</h2>
        {upcoming.length === 0 ? (
          <EmptyState text="Nothing on the horizon yet. Add deadlines under any tab and they'll surface here." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {upcoming.map((d) => (
              <div key={d.id + d.sub} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: "#fffdf9", border: "1px solid #e4dcc9", borderLeft: `4px solid ${d.accent}`,
                borderRadius: 6, padding: "10px 14px",
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#1B2A41" }} >{d.label}</div>
                  <div style={{ fontSize: 12, color: "#8a8272" }}>{d.sub}</div>
                </div>
                <DeadlineChip dateStr={d.date} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
function ListPanel({ title, titleEmoji, accent, items, addLabel, onAdd, onEdit, 
onDelete, onOpen, empty, emptyEmoji, render }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: 20, color: "#1B2A41", 
margin: 0 }}>{titleEmoji ? `${titleEmoji} ` : ""}{title}</h2>
        <Btn onClick={onAdd}><Plus size={14} />{addLabel}</Btn>
      </div>
      {items.length === 0 ? (
        <EmptyState text={empty} cta={addLabel} onClick={onAdd} emoji={emptyEmoji} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {items.map((item) => (
            <SectionCard key={item.id} accent={accent} onEdit={() => onEdit(item)} onDelete={() => onDelete(item.id)} onOpen={onOpen ? () => onOpen(item) : undefined} >
              {render(item)}
            </SectionCard>
          ))}
        </div>
      )}
    </div>
  );
}
function TierBadge({ tier }) {
  if (!tier) return null;
  const fg = TIER_COLOR[tier] || "#6b6355";
  const bg = TIER_BG[tier] || "#eee8db";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase", 
fontWeight: 700,
      padding: "3px 8px", borderRadius: 3, background: bg, color: fg, border: `1px solid ${fg}44`,
    }}>{TIER_EMOJI[tier] || ""} {tier}</span>
  );
}
function KnownForLines({ text, fontSize = 12.5 }) {
  if (!text) return null;
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const isLabeled = lines.length > 1 && lines.every((l) => /^[A-Za-z ]+:\s*/.test(l));
  if (!isLabeled) {
    return <div style={{ fontSize, color: "#5c5648", lineHeight: 1.4 
}}>{text}</div>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {lines.map((line, i) => {
        const idx = line.indexOf(":");
        const label = line.slice(0, idx);
        const value = line.slice(idx + 1).trim();
        return (
          <div key={i} style={{ fontSize, lineHeight: 1.4 }}>
            <span style={{ color: "#8a8272", fontWeight: 600 }}>{label}: </span>
            <span style={{ color: "#5c5648" }}>{value}</span>
          </div>
        );
      })}
    </div>
  );
}
function SchoolCardBody({ s }) {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div>
          <div style={{ fontFamily: "'Lora', serif", fontWeight: 600, fontSize: 16, 
color: "#1B2A41" }}>{s.name}</div>
          <div style={{ fontSize: 12.5, color: "#8a8272", marginTop: 2 }} >{s.rosterGender || "Men's"} tennis</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
          <TierBadge tier={s.tier || "Target"} />
          <Badge status={s.status} />
        </div>
      </div>
      {s.knownFor && <KnownForLines text={s.knownFor} fontSize={12.5} />}
      {s.topMajors && (
        <div style={{ fontSize: 11.5, color: "#8a8272" }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", letterSpacing: "0.03em" }}>Best majors: </span>
          {s.topMajors}
        </div>
      )}
      {(s.gpaWeighted || s.gpaUnweighted || s.testSAT || s.testACT || s.utrTarget || s.tuition) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", fontSize: 12, color: "#6b6355", fontFamily: "'IBM Plex Mono', monospace" }}>
          {s.tuition && <span>${s.tuition}/yr</span>}
          {s.gpaWeighted && <span>GPA(w) {s.gpaWeighted}</span>}
          {s.gpaUnweighted && <span>GPA(uw) {s.gpaUnweighted}</span>}
          {s.testSAT && <span>SAT {s.testSAT}</span>}
          {s.testACT && <span>ACT {s.testACT}</span>}
          {s.utrTarget && <span>UTR {s.utrTarget}</span>}
        </div>
      )}
      {s.notes && <div style={{ fontSize: 13, color: "#5c5648", marginTop: 4 }} >{s.notes}</div>}
      <div style={{ fontSize: 11.5, color: "#a39c8c", marginTop: 2 }}>Click for full profile →</div>
    </>
  );
}
const TIER_EMOJI = { Reach: "🚀", Target: "🎯", Safety: "🛡️" };
function ApplicationsPanel({ schools, onAdd, onEdit, onDelete, onOpen }) {
  const groups = SCHOOL_TIERS.map((tier) => ({ tier, items: schools.filter((s) => (s.tier || "Target") === tier) }));
  const total = schools.length;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ fontFamily: "'Lora', serif", fontSize: 20, color: "#1B2A41", 
margin: 0 }}>🎓 Applications</h2>
          <p style={{ fontSize: 12.5, color: "#8a8272", margin: "4px 0 0" }}>Sorted into reach, target, and safety schools.</p>
        </div>
        <Btn onClick={() => onAdd("Target")}><Plus size={14} />Add school</Btn>
      </div>
      {total === 0 ? (
        <EmptyState text="No schools yet. Add the first one you're considering." cta="Add school" onClick={() => onAdd("Target")} emoji="🎓" />
      ) : (
        groups.map(({ tier, items }) => (
          <div key={tier}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, 
marginBottom: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: TIER_COLOR[tier] }} />
              <h3 style={{ fontFamily: "'Lora', serif", fontSize: 16.5, color: TIER_COLOR[tier], margin: 0 }}>{TIER_EMOJI[tier]} {tier} schools</h3>
              <span style={{ fontSize: 12, color: "#a39c8c", fontFamily: "'IBM Plex Mono', monospace" }}>({items.length})</span>
              <button onClick={() => onAdd(tier)} style={{ ...actionBtnStyle(TIER_COLOR[tier], `${TIER_COLOR[tier]}55`), marginLeft: "auto" }}>
                <Plus size={12} /> Add {tier.toLowerCase()}
              </button>
            </div>
            {items.length === 0 ? (
              <div style={{ border: "1px dashed #d8cfba", borderRadius: 6, padding: "16px", textAlign: "center", color: "#a39c8c", fontSize: 13 }}>
                No {tier.toLowerCase()} schools yet.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                {items.map((s) => (
                  <SectionCard key={s.id} accent={TIER_COLOR[tier]} onEdit={() => onEdit(s)} onDelete={() => onDelete(s.id)} onOpen={() => onOpen(s)}>
                    <SchoolCardBody s={s} />
                  </SectionCard>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
function buildEmailPrompt(v) {
  const templateNote = {
    intro: "This is a first-time introduction email to a coach who has never heard from this recruit before.",
    followup: "This is a follow-up email to a coach the recruit already introduced themselves to previously — it should read as checking back in, not repeating a full introduction.",
    thankyou: "This is a thank-you email sent after a call or visit with the coach — it should reference that conversation and express continued interest, not introduce the recruit from scratch.",
  }[v.template] || "";
  const lines = [
    ["Recruit's name", v.yourName],
    ["High school graduation year", v.gradYear],
    ["High school", v.highSchool],
    ["Club / academy", v.club],
    ["Playing position / style", v.position],
    ["UTR", v.utr],
    ["GPA", v.gpa],
    ["Standardized test score", v.testScore],
    ["Key results / achievements", v.achievements],
    ["Highlight video link", v.videoLink],
    ["Coach's name", v.coachName],
    ["Target school", v.schoolName],
    ["Personal reason for interest in this school", v.whySchool],
  ].filter(([, val]) => val && String(val).trim().length > 0);
  const infoBlock = lines.map(([label, val]) => `- ${label}: ${val}`).join("\n") || "(no details provided yet)";
  return `You are helping a high school student-athlete write an outreach email to a college tennis coach as part of the recruiting process.${templateNote} Here is the information the recruit has provided: ${infoBlock} Write this email in simple, plain, direct language — the way a real teenager would actually write to a coach, not overly polished, formal, or flowery. Short sentences. No fancy vocabulary or corporate-sounding phrases. It should still be organized and easy to read (intro, key stats, video link if given, closing ask), 
just not "written too well." Only include the facts given above, and only the ones that matter — don't pad it out with extra sentences. Do not mention that the recruit is new to recruiting, just starting the process, or anything like that — the coach doesn't need that context, only the relevant info about the recruit. Do not invent statistics, results, or details that weren't provided, and do not use placeholder brackets like [X] for missing information — just write around any gaps naturally. Keep the body short: roughly 100-150 words. Sign off with the recruit's name. Respond with ONLY a raw JSON object in this exact shape, no markdown formatting, no code fences, no extra commentary: {"subject": "...", "body": "..."}`;
}
async function generatePolishedEmail(v) {
  assertAiEnabled();
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: buildEmailPrompt(v) }],
    }),
  });
  const data = await response.json();
  const textBlocks = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
  const cleaned = textBlocks.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);
  if (!parsed.subject || !parsed.body) throw new Error("Malformed response");
  return parsed;
}
function buildCoachEmail(v) {
  const yourName = v.yourName || "[Your Name]";
  const gradYear = v.gradYear || "[Grad Year]";
  const highSchool = v.highSchool || "[High School]";
  const club = v.club || "[Club / Academy]";
  const position = v.position || "";
  const utr = v.utr || "[UTR]";
  const gpa = v.gpa || "[GPA]";
  const testScore = v.testScore || "[Test Score]";
  const achievements = v.achievements || "[Key tournament results / ranking]";
  const videoLink = v.videoLink || "[Highlight video link]";
  const coachName = v.coachName || "Coach";
  const schoolName = v.schoolName || "[School Name]";
  const whySchool = v.whySchool || "";
  const templates = {
    intro: {
      subject: `Prospective Student-Athlete – ${yourName} – Class of ${gradYear}`,
      body: `Dear Coach ${coachName},

My name is ${yourName}, a ${gradYear} graduate from ${highSchool}${position ? ` and a ${position}` : ""}. I train at ${club} and currently hold a UTR of ${utr}. I'm very interested in ${schoolName}'s tennis program and wanted to introduce myself.

A bit about my academic and athletic background:
- GPA: ${gpa}
- Test scores: ${testScore}
- Key results: ${achievements}
Here's a link to my highlight video: ${videoLink}
${whySchool ? `\n${whySchool}\n` : ""}
I'd welcome the chance to speak with you further about the program and how I might contribute to the team. Please let me know if there's a good time to connect, or if you'd like any additional information in the meantime.

Thank you for your time and consideration.

Best regards,
${yourName}
${highSchool}, Class of ${gradYear}`,
    },
    followup: {
      subject: `Following Up – ${yourName}, Class of ${gradYear}`,
      body: `Dear Coach ${coachName},

I hope you're doing well. I wanted to follow up on my earlier introduction and reaffirm my strong interest in ${schoolName}'s tennis program.

Since I last reached out, here's where things stand:
- UTR: ${utr}
- GPA: ${gpa}
- Recent results: ${achievements}
Highlight video: ${videoLink}
${whySchool ? `\n${whySchool}\n` : ""}
I'd love the opportunity to connect, whether by phone or video call, whenever works with your schedule. Thank you again for considering me, and I look forward to hearing from you.

Best regards,
${yourName}
${highSchool}, Class of ${gradYear}`,
    },
    thankyou: {
      subject: `Thank You – ${yourName}`,
      body: `Dear Coach ${coachName},

Thank you so much for taking the time to speak with me${schoolName !== "[School Name]" ? ` about ${schoolName}'s tennis program` : ""}. I really enjoyed learning more about the team and I'm even more excited about the possibility of being part of it.

As a quick recap: I'm a ${gradYear} graduate from ${highSchool}, currently hold a UTR of ${utr}, and my most recent results include ${achievements}.
${whySchool ? `\n${whySchool}\n` : ""}
Please don't hesitate to reach out if you need anything further from me. Thank you again for your time and consideration.

Best regards,
${yourName}
${highSchool}, Class of ${gradYear}`,
    },
  };
  return templates[v.template] || templates.intro;
}
function copyToClipboard(text) {
  return new Promise((resolve) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => resolve(true)).catch(() => resolve(fallbackCopy(text)));
    } else {
      resolve(fallbackCopy(text));
    }
  });
}
function fallbackCopy(text) {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch (e) { return false; }
}
function CopyButton({ text, label, primary }) {
  const [state, setState] = useState("idle"); // idle | copied | failed
  const copy = async () => {
    const ok = await copyToClipboard(text);
    setState(ok ? "copied" : "failed");
    setTimeout(() => setState("idle"), 1600);
  };
  const shown = state === "copied" ? "Copied! ✅" : state === "failed" ? "Select & Ctrl+C" : label;
  return (
    <Btn variant={primary ? "primary" : "ghost"} onClick={copy}>
      <Copy size={13} />{shown}
    </Btn>
  );
}
function CoachEmailTab({ draft, schools, achievements, onSave }) {
  const [v, setV] = useState(draft);
  const [saved, setSaved] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  useEffect(() => setV(draft), [draft]);
  useEffect(() => { setAiResult(null); setAiError(""); }, [v.template, v.yourName, 
v.gradYear, v.highSchool, v.club, v.position, v.utr, v.gpa, v.testScore, 
v.achievements, v.videoLink, v.coachName, v.schoolName, v.whySchool]);
  const achievementSummary = (achievements || [])
    .filter((a) => a.category === "Award / Honor" || a.category === "Leadership")
    .map((a) => a.entry).filter(Boolean).join(", ");
  const useAthleticInfo = () => {
    if (achievementSummary) setV({ ...v, achievements: achievementSummary });
  };
  const save = () => { onSave(v); setSaved(true); setTimeout(() => setSaved(false), 
1400); };
  const handleGenerate = async () => {
    setAiLoading(true);
    setAiError("");
    try {
      const result = await generatePolishedEmail(v);
      setAiResult(result);
    } catch (e) {
      setAiError(
        e.message === AI_DISABLED_MESSAGE
          ? AI_DISABLED_MESSAGE
          : "Couldn't reach the writing assistant just now — the draft version below still works fine to send."
      );
    } finally {
      setAiLoading(false);
    }
  };
  const draftEmail = buildCoachEmail(v);
  const email = aiResult || draftEmail;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: 20, color: "#1B2A41", 
margin: "0 0 4px" }}>Coach Email Builder</h2>
        <p style={{ fontSize: 13, color: "#8a8272", margin: 0 }}>Fill in the boxes below and the email fills itself in on the right, ready to send to a college coach.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 40, alignItems: "start" }}>
        {/* form */}
        <div style={{
          display: "flex", flexDirection: "column", gap: 20, background: "#ffffff",
          border: "1px solid #e4dcc9", borderRadius: 8, padding: "20px 22px", 
minWidth: 0,
        }}>
          <div>
            <div style={sectionHeadingStyle}>Email type</div>
            <Field label="Which kind of email is this?">
              <Select options={["intro", "followup", "thankyou"]} value={v.template} onChange={(e) => setV({ ...v, template: e.target.value })} />
            </Field>
            <div style={{ fontSize: 11.5, color: "#8a8272", marginTop: 6, 
background: "#ffffff", padding: "6px 8px", borderRadius: 4, border: "1px solid #ece4d3" }}>intro = first outreach · followup = checking back in · thankyou = after a call or visit</div>
          </div>
          <div>
            <div style={sectionHeadingStyle}>Your info</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Field label="Your name"><TextInput value={v.yourName} onChange={(e) => setV({ ...v, yourName: e.target.value })} /></Field>
              <Field label="Grad year"><TextInput value={v.gradYear} onChange={(e) => setV({ ...v, gradYear: e.target.value })} placeholder="2027" /></Field>
              <Field label="High school"><TextInput value={v.highSchool} onChange={(e) => setV({ ...v, highSchool: e.target.value })} /></Field>
              <Field label="Club / academy"><TextInput value={v.club} onChange={(e) => setV({ ...v, club: e.target.value })} placeholder="No Quit Tennis Academy" /></Field>
            </div>
          </div>
          <div>
            <div style={sectionHeadingStyle}>Athletic &amp; academic stats</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, 
marginBottom: 10 }}>
              <Field label="UTR"><TextInput value={v.utr} onChange={(e) => setV({ ...v, utr: e.target.value })} placeholder="9.5" /></Field>
              <Field label="GPA"><TextInput value={v.gpa} onChange={(e) => setV({ ...v, gpa: e.target.value })} placeholder="3.8" /></Field>
              <Field label="Test score"><TextInput value={v.testScore} onChange={(e) => setV({ ...v, testScore: e.target.value })} placeholder="SAT 1350" /></Field>
              <Field label="Position / style"><TextInput value={v.position} onChange={(e) => setV({ ...v, position: e.target.value })} placeholder="right-handed singles player" /></Field>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Field label="Key results / achievements">
                <TextArea value={v.achievements} onChange={(e) => setV({ ...v, 
achievements: e.target.value })} placeholder="Tournament wins, sectional ranking, 
win-loss record..." />
              </Field>
              {achievementSummary && (
                <div><Btn variant="ghost" onClick={useAthleticInfo}>Pull from Achievement Tracker</Btn></div>
              )}
              <Field label="Highlight video link"><TextInput value={v.videoLink} onChange={(e) => setV({ ...v, videoLink: e.target.value })} placeholder="https://..." /></Field>
            </div>
          </div>
          <div>
            <div style={sectionHeadingStyle}>Recipient &amp; school</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Field label="Coach name">
                <TextInput value={v.coachName} onChange={(e) => setV({ ...v, 
coachName: e.target.value })} placeholder="Smith" />
              </Field>
              <Field label="Coach email (for send button)">
                <TextInput type="email" value={v.coachEmail} onChange={(e) => setV({ ...v, coachEmail: e.target.value })} placeholder="coach@school.edu" />
              </Field>
              <Field label="School">
                <Select options={["", ...schools.map((s) => s.name).filter(Boolean), v.schoolName].filter((x, i, a) => a.indexOf(x) === i)} value={v.schoolName || ""} onChange={(e) => setV({ ...v, schoolName: e.target.value 
})} />
              </Field>
              <Field label="Why this school (optional, personal touch)">
                <TextArea value={v.whySchool} onChange={(e) => setV({ ...v, 
whySchool: e.target.value })} placeholder="I've always admired the program's focus on..." />
              </Field>
            </div>
          </div>
          <div style={{ borderTop: "1px solid #e4dcc9", paddingTop: 16 }}>
            <Btn onClick={save}><Check size={14} />{saved ? "Saved ✅" : "Save these details"}</Btn>
          </div>
        </div>
        {/* live preview */}
        <div style={{
          display: "flex", flexDirection: "column", gap: 12, position: "sticky", 
top: 0, minWidth: 0,
          borderLeft: "1px solid #e4dcc9", paddingLeft: 24, marginLeft: -1,
        }}>
          <Btn onClick={handleGenerate} disabled={aiLoading} style={{ width: "100%", justifyContent: "center", opacity: aiLoading ? 0.7 : 1 }}>
            {aiLoading ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
            {aiLoading ? "Writing your email…" : aiResult ? "Regenerate polished email" : "Write my best email with AI"}
          </Btn>
          {aiError && <div style={{ fontSize: 12, color: "#8B3A3A", background: "#f3e2e0", border: "1px solid #e0bcb8", borderRadius: 4, padding: "8px 10px" }} >{aiError}</div>}
          <div style={{ display: "flex", justifyContent: "space-between", 
alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: TAB_COLOR.email, 
textTransform: "uppercase", letterSpacing: "0.04em", fontFamily: "'IBM Plex Mono', monospace" }}>
              {aiResult ? "AI-polished version" : "Quick draft preview"}
            </span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <CopyButton text={`Subject: ${email.subject}\n\n${email.body}`} label="Copy full email" primary />
            </div>
          </div>
          {!aiResult && !aiLoading && (
            <div style={{ fontSize: 11.5, color: "#a39c8c", marginTop: -8 }}>This is a simple fill-in-the-blanks draft. Click the button above to have it rewritten as a polished, well-organized email.</div>
          )}
          <div style={{ background: "#ffffff", border: "1px solid #e4dcc9", 
borderLeft: `4px solid ${TAB_COLOR.email}`, borderRadius: 6, padding: "16px 18px", 
display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: "#8a8272", textTransform: "uppercase", letterSpacing: "0.04em", fontFamily: "'IBM Plex Mono', monospace" }} >Subject</div>
              <input
                readOnly value={email.subject} onFocus={(e) => e.target.select()}
                style={{
                  width: "100%", border: "none", outline: "none", background: "#ffffff", padding: 0, marginTop: 4,
                  fontFamily: "'Lora', serif", fontWeight: 600, fontSize: 15, 
color: "#1B2A41", cursor: "text",
                }}
              />
            </div>
            <div style={{ borderTop: "1px dashed #e4dcc9", paddingTop: 12 }}>
              <div style={{ fontSize: 11, color: "#8a8272", textTransform: "uppercase", letterSpacing: "0.04em", fontFamily: "'IBM Plex Mono', monospace", 
marginBottom: 6 }}>Body</div>
              <textarea
                readOnly value={email.body} onFocus={(e) => e.target.select()} rows={16}
                style={{
                  width: "100%", border: "none", outline: "none", background: "#ffffff", padding: 0, resize: "vertical",
                  fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13.5, color: "#2B2B28", lineHeight: 1.6, cursor: "text",
                }}
              />
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: "#8a8272" }}>Tip: click into the subject or body above to select all the text, or use the copy buttons.</div>
        </div>
      </div>
    </div>
  );
}
const sectionHeadingStyle = {
  fontSize: 12, fontWeight: 700, color: "#B8894A", textTransform: "uppercase",
  letterSpacing: "0.06em", fontFamily: "'IBM Plex Mono', monospace", marginBottom: 10,
};
function ScholarshipFinder({ profile, achievements, onSaveProfile, onAddScholarship 
}) {
  const [v, setV] = useState(profile);
  const [saved, setSaved] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [addedIds, setAddedIds] = useState({});
  useEffect(() => setV(profile), [profile]);
  const save = () => { onSaveProfile(v); setSaved(true); setTimeout(() => setSaved(false), 1400); };
  const achievementSummary = (achievements || []).map((a) => `${a.entry}${a.category ? ` (${a.category})` : ""}`).join(", ");
  const findScholarships = async () => {
    setLoading(true);
    setError("");
    setResults(null);
    try {
      assertAiEnabled();
      const facts = [
        ["GPA", v.gpa],
        ["SAT / ACT score", v.satAct],
        ["State of residence", v.state],
        ["Intended major / field of study", v.major],
        ["Achievements (sports, academic, volunteer, leadership, etc.)", 
achievementSummary],
        ["Financial need", v.financialNeed],
        ["Other eligibility factors (e.g. first-generation, heritage, disability, military family)", v.otherFactors],
      ].filter(([, val]) => val && String(val).trim().length > 0)
        .map(([label, val]) => `- ${label}: ${val}`).join("\n") || "(no details provided — search broadly for general and tennis-related scholarships)";
      const prompt = `Find real, currently-open scholarship opportunities for a graduating high school student-athlete (tennis player) with this profile: ${facts} Search the web for actual scholarships — mix in national/general scholarships, any tennis or student-athlete specific scholarships you can find, and state-specific ones if a state was given. Do several separate searches to cover different angles rather than stopping after one search. Only include scholarships you found real information about through search. Do not invent scholarship names, amounts, or deadlines. For each one, include the official application URL if you found it. Return 5-8 scholarships as a raw JSON array, no markdown, no code fences, no extra text: [{"name": "...", "amount": "...", "eligibility": "one short sentence", "deadline": "YYYY-MM-DD or empty string if rolling/unknown", "url": "..."}]`;
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 2000,
          messages: [{ role: "user", content: prompt }],
          tools: [{ type: "web_search_20250305", name: "web_search" }],
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message || "API error");
      const textBlocks = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
      const match = textBlocks.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("No results found");
      const parsed = JSON.parse(match[0]);
      setResults(parsed);
    } catch (e) {
      setError(
        e.message === AI_DISABLED_MESSAGE
          ? AI_DISABLED_MESSAGE
          : "Couldn't complete the search just now (" + (e.message || "unknown error") + ") — try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  };
  const addResult = (r, idx) => {
    onAddScholarship({
      id: uid(),
      name: r.name || "Untitled scholarship",
      amount: (r.amount || "").toString().replace(/[^0-9]/g, ""),
      status: "Researching",
      deadline: /^\d{4}-\d{2}-\d{2}$/.test(r.deadline) ? r.deadline : "",
      url: r.url || "",
      requirements: r.eligibility || "",
    });
    setAddedIds({ ...addedIds, [idx]: true });
  };
  return (
    <div style={{ background: "#ffffff", border: "1px solid #e4dcc9", borderLeft: `4px solid ${TAB_COLOR.scholarships}`, borderRadius: 8, padding: "18px 20px", 
display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <div style={{ fontFamily: "'Lora', serif", fontWeight: 600, fontSize: 16, 
color: "#1B2A41" }}>Scholarship Finder</div>
        <div style={{ fontSize: 12.5, color: "#8a8272", marginTop: 2 }}>Fill in your stats, then search for real scholarships you're likely eligible for.</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
        <Field label="GPA"><TextInput value={v.gpa} onChange={(e) => setV({ ...v, 
gpa: e.target.value })} placeholder="3.8" /></Field>
        <Field label="SAT / ACT"><TextInput value={v.satAct} onChange={(e) => setV({ ...v, satAct: e.target.value })} placeholder="SAT 1350" /></Field>
        <Field label="State of residence"><TextInput value={v.state} onChange={(e) => setV({ ...v, state: e.target.value })} placeholder="Nevada" /></Field>
        <Field label="Intended major"><TextInput value={v.major} onChange={(e) => setV({ ...v, major: e.target.value })} placeholder="Business" /></Field>
      </div>
      <Field label="Financial need (optional)"><TextInput value={v.financialNeed} onChange={(e) => setV({ ...v, financialNeed: e.target.value })} placeholder="e.g. significant, some, none" /></Field>
      <Field label="Other eligibility factors (optional)"><TextArea value={v.otherFactors} onChange={(e) => setV({ ...v, otherFactors: e.target.value })} placeholder="First-generation college student, specific heritage, military family, disability, etc. — whatever applies to you." /></Field>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Btn variant="ghost" onClick={save}><Check size={13} />{saved ? "Saved ✅" : "Save my stats"}</Btn>
        <Btn onClick={findScholarships} disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
          {loading ? <Loader2 size={13} className="spin" /> : <Sparkles size={13} />}
          {loading ? "Searching…" : results ? "Search again" : "Find scholarships for me"}
        </Btn>
      </div>
      {error && <div style={{ fontSize: 12, color: "#8B3A3A" }}>{error}</div>}
      <div style={{ fontSize: 11, color: "#a39c8c" }}>Results come from live web search, not a fixed database — always double-check eligibility, amount, and deadline on the official scholarship page before applying.</div>
      {results && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
          {results.map((r, idx) => (
            <div key={idx} style={{ background: "#fffdf9", border: "1px solid #e4dcc9", borderRadius: 6, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", 
alignItems: "flex-start", gap: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: "#1B2A41" }} >{r.name}</div>
                {r.amount && <span style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: TAB_COLOR.scholarships, whiteSpace: "nowrap" }} >{r.amount}</span>}
              </div>
              {r.eligibility && <div style={{ fontSize: 12.5, color: "#5c5648", 
lineHeight: 1.45 }}>{r.eligibility}</div>}
              {r.deadline && <div style={{ fontSize: 11.5, color: "#8a8272", 
fontFamily: "'IBM Plex Mono', monospace" }}>Deadline: {r.deadline}</div>}
              {r.url && (
                <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "#2f4f6b", textDecoration: "none", wordBreak: "break-all" }}>
                  <ExternalLink size={11} style={{ flexShrink: 0 }} /> {r.url}
                </a>
              )}
              <Btn variant={addedIds[idx] ? "ghost" : "primary"} onClick={() => addResult(r, idx)} style={{ alignSelf: "flex-start" }} disabled={!!addedIds[idx]}>
                {addedIds[idx] ? <Check size={12} /> : <Plus size={12} />}
                {addedIds[idx] ? "Added 🎉" : "Add to my scholarships"}
              </Btn>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function CallQuestionGenerator({ schools, onUseQuestions }) {
  const [schoolName, setSchoolName] = useState("");
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleSchoolChange = (name) => {
    setSchoolName(name);
    setResults(null);
    setHistory([]);
  };
  const generateQuestions = async () => {
    setLoading(true);
    setError("");
    try {
      assertAiEnabled();
      const school = schools.find((s) => s.name === schoolName);
      const context = school
        ? [
            school.knownFor && `Known for: ${school.knownFor}`,
            school.topMajors && `Best majors: ${school.topMajors}`,
            school.tier && `This is one of the recruit's ${school.tier.toLowerCase()} schools`,
          ].filter(Boolean).join(". ")
        : "";
      const avoidBlock = history.length
        ? `\n\nThe recruit has already seen these questions from previous rounds — do NOT repeat any of them or close variations/rewordings of them. Come up with genuinely different questions this time:\n${history.map((q) => `- ${q} `).join("\n")}`
        : "";
      const prompt = `A high school tennis recruit is about to have a call with a college tennis coach${schoolName ? ` from ${schoolName}` : ""}.${context ? ` Here's a bit of context on the school: ${context}.` : ""} Generate two short lists of questions the recruit could ask during the call: 1) "interestQuestions": 4-5 questions that show genuine interest in the program specifically — things like coaching philosophy, team culture, how the coach develops players, what they look for in recruits, training approach. These should make the recruit sound thoughtful and engaged, not generic. 2) "infoQuestions": 4-5 practical, informational questions about logistics — things like the season/match schedule, practice times, travel commitments, how athletics balances with academics, roster situation, walk-on vs. scholarship spots, redshirt policies. Things a recruit genuinely needs to know to make a good decision. Keep each question short (one sentence), natural-sounding, and specific enough to feel real rather than generic interview-prep filler. Don't invent specific facts about the school beyond what was given above.${avoidBlock} Respond with ONLY a raw JSON object in this exact shape, no markdown, no code fences, no extra text: {"interestQuestions": ["...", "..."], "infoQuestions": ["...", "..."]}`;
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 900,
          temperature: 1,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message || "API error");
      const textBlocks = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
      const match = textBlocks.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No results found");
      const parsed = JSON.parse(match[0]);
      setResults(parsed);
      setHistory([...history, ...(parsed.interestQuestions || []), ...(parsed.infoQuestions || [])]);
    } catch (e) {
      setError(
        e.message === AI_DISABLED_MESSAGE
          ? AI_DISABLED_MESSAGE
          : "Couldn't generate questions right now (" + (e.message || "unknown error") + ") — try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  };
  const useAll = () => {
    if (!results) return;
    const text = [
      "Questions to show interest in the program:",
      ...results.interestQuestions.map((q) => `- ${q}`),
      "",
      "Questions about schedule / logistics:",
      ...results.infoQuestions.map((q) => `- ${q}`),
    ].join("\n");
    onUseQuestions(text);
  };
  return (
    <div style={{ background: "#ffffff", border: "1px solid #e4dcc9", borderLeft: `4px solid ${TAB_COLOR.calls}`, borderRadius: 8, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={{ fontFamily: "'Lora', serif", fontWeight: 600, fontSize: 16, 
color: "#1B2A41" }}>📋 Call Question Generator</div>
        <div style={{ fontSize: 12.5, color: "#8a8272", marginTop: 2 }}>Get a mix of questions that show real interest, plus practical ones about schedule and logistics.</div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <Field label="School (optional, for personalized questions)">
            <Select options={["", ...schools.map((s) => s.name).filter(Boolean)]} value={schoolName} onChange={(e) => handleSchoolChange(e.target.value)} />
          </Field>
        </div>
        <Btn onClick={generateQuestions} disabled={loading} style={{ opacity: loading ? 0.7 : 1, whiteSpace: "nowrap" }}>
          {loading ? <Loader2 size={13} className="spin" /> : <Sparkles size={13} />}
          {loading ? "Thinking…" : results ? "Regenerate" : "Generate questions"}
        </Btn>
      </div>
      {error && <div style={{ fontSize: 12, color: "#8B3A3A" }}>{error}</div>}
      {results && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: TAB_COLOR.calls, textTransform: "uppercase", letterSpacing: "0.04em", fontFamily: "'IBM Plex Mono', monospace", marginBottom: 8 }}>Shows genuine interest</div>
              <ul style={{ margin: 0, paddingLeft: 18, display: "flex", 
flexDirection: "column", gap: 8 }}>
                {results.interestQuestions.map((q, i) => (
                  <li key={i} style={{ fontSize: 13, color: "#2B2B28", lineHeight: 1.45 }}>{q}</li>
                ))}
              </ul>
            </div>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "#8a8272", 
textTransform: "uppercase", letterSpacing: "0.04em", fontFamily: "'IBM Plex Mono', monospace", marginBottom: 8 }}>Schedule & logistics</div>
              <ul style={{ margin: 0, paddingLeft: 18, display: "flex", 
flexDirection: "column", gap: 8 }}>
                {results.infoQuestions.map((q, i) => (
                  <li key={i} style={{ fontSize: 13, color: "#2B2B28", lineHeight: 1.45 }}>{q}</li>
                ))}
              </ul>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <CopyButton
              text={["Questions to show interest in the program:", ...results.interestQuestions.map((q) => `- ${q}`), "", "Questions about schedule / logistics:", ...results.infoQuestions.map((q) => `- ${q}`)].join("\n")}
              label="Copy all questions"
            />
            <Btn variant="ghost" onClick={useAll}><Plus size={13} />Use in a new coach call</Btn>
          </div>
        </>
      )}
    </div>
  );
}
function SchoolLinkFinder({ schools, onAddLinks }) {
  const [schoolName, setSchoolName] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [justAdded, setJustAdded] = useState(false);
  const findLinks = async () => {
    if (!schoolName) { setError("Pick a school first."); return; }
    setLoading(true);
    setError("");
    setResults(null);
    setJustAdded(false);
    try {
      assertAiEnabled();
      const school = schools.find((s) => s.name === schoolName);
      const majorHint = school?.topMajors ? ` The recruit is especially interested in these majors: ${school.topMajors}.` : "";
      const rosterGender = school?.rosterGender === "Women's" ? "women's" : "men's";
      const prompt = `Find real, official links a high school tennis recruit would need for "${schoolName}".${majorHint} Search the web to find actual URLs — do several separate searches rather than stopping after one. Find as many of these as you can (skip any you genuinely can't find, don't invent URLs): 1. The school's main official website homepage 2. The undergraduate admissions / "how to apply" page 3. The ${rosterGender} tennis team roster and coaches page (athletics site) 4. The financial aid page or net price calculator 5. A page for the specific major(s) mentioned above, or the general academics/majors page if none were given 6. The campus visit scheduling / tour registration page 7. The school's ${rosterGender} tennis team page on UTR Sports (search something like "utrsports.net ${schoolName} ${rosterGender} tennis" or "UTR ${schoolName} tennis team") — this one is important, make a real effort to find it since UTR is central to tennis recruiting. For each one you find, give a short clear label, pick the best matching category from this list: "School Website", "Admissions / Apply Page", "Tennis Roster / Coaches", "Financial Aid / Net Price Calculator", "Major / Department Page", 
"Campus Visit Scheduling", "UTR", and the real URL. Respond with ONLY a raw JSON array, no markdown, no code fences, no extra text: [{"label": "...", "category": "...", "url": "..."}]`;
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }],
          tools: [{ type: "web_search_20250305", name: "web_search" }],
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message || "API error");
      const textBlocks = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
      const match = textBlocks.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("No results found");
      const parsed = JSON.parse(match[0]);
      setResults(parsed.map((r) => ({ ...r, id: uid(), selected: true })));
    } catch (e) {
      setError(
        e.message === AI_DISABLED_MESSAGE
          ? AI_DISABLED_MESSAGE
          : "Couldn't find links right now (" + (e.message || "unknown error") + ") — try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  };
  const toggle = (id) => setResults(results.map((r) => (r.id === id ? { ...r, 
selected: !r.selected } : r)));
  const addSelected = () => {
    const chosen = results.filter((r) => r.selected);
    if (chosen.length === 0) return;
    onAddLinks(chosen.map((r) => ({
      id: uid(), label: r.label || "Untitled link", category: r.category || "Other", url: r.url || "", school: schoolName, notes: "",
    })));
    setJustAdded(true);
    setResults(results.filter((r) => !r.selected));
  };
  const selectedCount = results ? results.filter((r) => r.selected).length : 0;
  return (
    <div style={{ background: "#ffffff", border: "1px solid #e4dcc9", borderLeft: `4px solid ${TAB_COLOR.links}`, borderRadius: 8, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={{ fontFamily: "'Lora', serif", fontWeight: 600, fontSize: 16, 
color: "#1B2A41" }}>🔎 School Link Finder</div>
        <div style={{ fontSize: 12.5, color: "#8a8272", marginTop: 2 }}>Pick a school and it'll dig up the admissions, tennis, financial aid, and major pages you're likely to need.</div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <Field label="School">
            <Select options={["", ...schools.map((s) => s.name).filter(Boolean)]} value={schoolName} onChange={(e) => { setSchoolName(e.target.value); 
setResults(null); setJustAdded(false); }} />
          </Field>
        </div>
        <Btn onClick={findLinks} disabled={loading} style={{ opacity: loading ? 0.7 : 1, whiteSpace: "nowrap" }}>
          {loading ? <Loader2 size={13} className="spin" /> : <Sparkles size={13} />}
          {loading ? "Searching…" : results ? "Search again" : "Find links"}
        </Btn>
      </div>
      {error && <div style={{ fontSize: 12, color: "#8B3A3A" }}>{error}</div>}
      {justAdded && <div style={{ fontSize: 12, color: "#3F5B45" }}>Added to your links below 🎉</div>}
      {results && results.length > 0 && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {results.map((r) => (
              <label key={r.id} style={{
                display: "flex", alignItems: "flex-start", gap: 10, background: "#fffdf9",
                border: "1px solid #e4dcc9", borderRadius: 6, padding: "10px 12px", 
cursor: "pointer",
              }}>
                <input type="checkbox" checked={r.selected} onChange={() => toggle(r.id)} style={{ marginTop: 3, width: 15, height: 15, accentColor: TAB_COLOR.links, cursor: "pointer", flexShrink: 0 }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 3, 
flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", 
gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600, fontSize: 13.5, color: "#1B2A41" }}>{r.label}</span>
                    <span style={{ fontSize: 10.5, fontFamily: "'IBM Plex Mono', monospace", color: TAB_COLOR.links, textTransform: "uppercase", letterSpacing: "0.03em" }}>{r.category}</span>
                  </div>
                  {r.url && <span style={{ fontSize: 12, color: "#8a8272", 
wordBreak: "break-all" }}>{r.url}</span>}
                </div>
              </label>
            ))}
          </div>
          <div>
            <Btn onClick={addSelected} disabled={selectedCount === 0}>
              <Plus size={13} />Add {selectedCount || ""} selected link{selectedCount === 1 ? "" : "s"}
            </Btn>
          </div>
        </>
      )}
    </div>
  );
}
function LinkCard({ l, onEdit, onDelete }) {
  return (
    <SectionCard accent={TAB_COLOR.links} onEdit={onEdit} onDelete={onDelete}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div style={{ fontFamily: "'Lora', serif", fontWeight: 600, fontSize: 15.5, 
color: "#1B2A41" }}>{l.label}</div>
        {l.category && <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: TAB_COLOR.links, textTransform: "uppercase", letterSpacing: "0.03em", whiteSpace: "nowrap" }}>{l.category}</span>}
      </div>
      {l.url && (
        <a href={l.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ display: "inline-flex", alignItems: "center", gap: 5, 
fontSize: 13, color: "#2f4f6b", textDecoration: "none", wordBreak: "break-all" }}>
          <ExternalLink size={12} style={{ flexShrink: 0 }} /> {l.url}
        </a>
      )}
      {l.notes && <div style={{ fontSize: 13, color: "#5c5648", marginTop: 4 }} >{l.notes}</div>}
    </SectionCard>
  );
}
function LinksPanel({ links, schools, generalFolderLabel, onRenameGeneralFolder, 
onEdit, onDelete }) {
  const schoolOrder = schools.map((s) => s.name).filter(Boolean);
  const grouped = {};
  links.forEach((l) => {
    const key = l.school && schoolOrder.includes(l.school) ? l.school : "General";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(l);
  });
  const folders = [
    ...schoolOrder.filter((name) => grouped[name]),
    ...(grouped["General"] ? ["General"] : []),
  ];
  const [openFolders, setOpenFolders] = useState({});
  const toggleFolder = (name) => setOpenFolders({ ...openFolders, [name]: ! openFolders[name] });
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(generalFolderLabel);
  const startRename = (e) => { e.stopPropagation(); 
setRenameValue(generalFolderLabel); setRenaming(true); };
  const commitRename = () => { setRenaming(false); const trimmed = renameValue.trim(); if (trimmed) onRenameGeneralFolder(trimmed); };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: 20, color: "#1B2A41", 
margin: 0 }}>🔗 Important Links</h2>
        <p style={{ fontSize: 12.5, color: "#8a8272", margin: "4px 0 0" }}>Found by the School Link Finder above — pick which ones to keep and they'll land in the right folder.</p>
      </div>
      {links.length === 0 ? (
        <EmptyState
          text="No links saved yet. Use the School Link Finder above to search for a school's admissions, tennis, financial aid, and major pages."
          emoji="🔗"
        />
      ) : (
        folders.map((folderName) => {
          const isOpen = !!openFolders[folderName];
          const isGeneral = folderName === "General";
          const displayName = isGeneral ? generalFolderLabel : folderName;
          return (
            <div key={folderName} style={{ border: "1px solid #e4dcc9", 
borderRadius: 8, background: "#fffdf9", overflow: "hidden" }}>
              <button
                onClick={() => toggleFolder(folderName)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 8, 
padding: "12px 16px",
                  background: "transparent", border: "none", cursor: "pointer", 
textAlign: "left",
                }}
              >
                <span style={{ fontSize: 16 }}>{isOpen ? "📂" : "📁"}</span>
                {isGeneral && renaming ? (
                  <input
                    autoFocus value={renameValue} onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenaming(false); }}
                    style={{ ...inputStyle, fontFamily: "'Lora', serif", fontSize: 16, padding: "2px 6px", fontWeight: 600 }}
                  />
                ) : (
                  <h3 style={{ fontFamily: "'Lora', serif", fontSize: 16, color: "#1B2A41", margin: 0 }}>{displayName}</h3>
                )}
                <span style={{ fontSize: 12, color: "#a39c8c", fontFamily: "'IBM Plex Mono', monospace" }}>({grouped[folderName].length})</span>
                {isGeneral && !renaming && (
                  <button onClick={startRename} title="Rename this folder" style={{ ...iconBtnStyle, padding: 2 }}>
                    <Edit2 size={13} />
                  </button>
                )}
                <span style={{ marginLeft: "auto", color: "#a39c8c", fontSize: 12, 
transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .15s", 
display: "inline-flex" }}>▶</span>
              </button>
              {isOpen && (
                <div style={{ padding: "0 16px 16px", display: "grid", 
gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                  {grouped[folderName].map((l) => (
                    <LinkCard key={l.id} l={l} onEdit={() => onEdit(l)} onDelete={() => onDelete(l.id)} />
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
function AchievementCard({ a, onEdit, onDelete }) {
  const color = ACHIEVEMENT_COLOR[a.category] || "#6b6355";
  const text = a.entry || a.description || a.title || "";
  return (
    <SectionCard accent={color} onEdit={onEdit} onDelete={onDelete}>
      <div style={{ fontSize: 14, color: "#2B2B28", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{text}</div>
      {a.category === "Volunteer Hours" && a.hours && (
        <div style={{ fontSize: 12.5, color: "#3F5B45", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>{a.hours} hours</div>
      )}
    </SectionCard>
  );
}
function AchievementTracker({ achievements, onAdd, onEdit, onDelete }) {
  const totalVolunteerHours = achievements
    .filter((a) => a.category === "Volunteer Hours")
    .reduce((sum, a) => sum + (parseFloat(a.hours) || 0), 0);
  const grouped = {};
  achievements.forEach((a) => {
    const key = a.category || "Other";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(a);
  });
  const folders = ACHIEVEMENT_CATEGORIES.filter((cat) => grouped[cat]);
  const [openFolders, setOpenFolders] = useState({});
  const toggleFolder = (name) => setOpenFolders({ ...openFolders, [name]: ! openFolders[name] });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
          <div>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: 20, color: "#1B2A41", margin: 0 }}>🏆 Achievement Tracker</h2>
            <p style={{ fontSize: 12.5, color: "#8a8272", margin: "4px 0 0" }}>Just log what you want, sorted into folders. No titles or dates required.</p>
          </div>
          <Btn onClick={onAdd}><Plus size={14} />Add achievement</Btn>
        </div>
        {totalVolunteerHours > 0 && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, background: "#fffdf9",
            border: "1px solid #e4dcc9", borderLeft: `3px solid ${ACHIEVEMENT_COLOR["Volunteer Hours"]}`,
            borderRadius: 6, padding: "10px 14px", marginBottom: 20,
          }}>
            <span style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: 20, color: "#1B2A41" }}>{totalVolunteerHours}</span>
            <span style={{ fontSize: 12.5, color: "#8a8272" }}>🙌 total volunteer hours logged</span>
          </div>
        )}
        {achievements.length === 0 ? (
          <EmptyState
            text="No achievements logged yet. Track volunteer hours, sports and academic wins, internships, and anything else worth remembering."
            cta="Add achievement" onClick={onAdd} emoji="🏆"
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {folders.map((folderName) => {
              const isOpen = !!openFolders[folderName];
              const color = ACHIEVEMENT_COLOR[folderName] || "#6b6355";
              return (
                <div key={folderName} style={{ border: "1px solid #e4dcc9", 
borderRadius: 8, background: "#fffdf9", overflow: "hidden" }}>
                  <button
                    onClick={() => toggleFolder(folderName)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 8, 
padding: "12px 16px",
                      background: "transparent", border: "none", cursor: "pointer", 
textAlign: "left",
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{isOpen ? "📂" : "📁"}</span>
                    <h3 style={{ fontFamily: "'Lora', serif", fontSize: 16, color, 
margin: 0 }}>{folderName}</h3>
                    <span style={{ fontSize: 12, color: "#a39c8c", fontFamily: "'IBM Plex Mono', monospace" }}>({grouped[folderName].length})</span>
                    <span style={{ marginLeft: "auto", color: "#a39c8c", fontSize: 12, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .15s", 
display: "inline-flex" }}>▶</span>
                  </button>
                  {isOpen && (
                    <div style={{ padding: "0 16px 16px", display: "grid", 
gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                      {grouped[folderName].map((a) => (
                        <AchievementCard key={a.id} a={a} onEdit={() => onEdit(a)} onDelete={() => onDelete(a.id)} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
function StatBlock({ label, value }) {
  return (
    <div style={{ background: "#fffdf9", border: "1px solid #e4dcc9", borderRadius: 6, padding: "10px 12px" }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", color: "#8a8272", fontFamily: "'IBM Plex Mono', monospace" 
}}>{label}</div>
      <div style={{ fontFamily: "'Lora', serif", fontWeight: 700, fontSize: 17, 
color: "#1B2A41", marginTop: 3 }}>{value || "—"}</div>
    </div>
  );
}
function LinkedGroup({ title, accent, items, renderLine }) {
  if (items.length === 0) return null;
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.04em", fontFamily: "'IBM Plex Mono', monospace", 
marginBottom: 6 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((item) => (
          <div key={item.id} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center", 
gap: 8,
            border: "1px solid #e4dcc9", borderLeft: `3px solid ${accent}`, 
borderRadius: 4, padding: "7px 10px", fontSize: 13,
          }}>
            {renderLine(item)}
          </div>
        ))}
      </div>
    </div>
  );
}
function SchoolProfileModal({ school, data, onClose, onEdit }) {
  const nameMatch = (x) => x.school === school.name;
  const linkedEssays = data.essays.filter(nameMatch);
  const linkedRecs = data.recs.filter(nameMatch);
  const linkedCalls = data.calls.filter(nameMatch);
  const linkedVisits = data.visits.filter(nameMatch);
  return (
    <Modal title={school.name} onClose={onClose} width={640}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <TierBadge tier={school.tier || "Target"} />
            <Badge status={school.status} />
            <span style={{ fontSize: 12.5, color: "#8a8272" }}>{school.rosterGender || "Men's"} tennis</span>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
          <StatBlock label="Tuition / yr" value={school.tuition ? `$${school.tuition}` : null} />
          <StatBlock label="GPA (weighted)" value={school.gpaWeighted} />
          <StatBlock label="GPA (unweighted)" value={school.gpaUnweighted} />
          <StatBlock label="SAT" value={school.testSAT} />
          <StatBlock label="ACT" value={school.testACT} />
          <StatBlock label="UTR needed" value={school.utrTarget} />
        </div>
        {school.utrSourceNote && <div style={{ fontSize: 11.5, color: "#8a8272", 
fontStyle: "italic", marginTop: -4 }}>{school.utrSourceNote}</div>}
        {(school.knownFor || school.topMajors) && (
          <div style={{ background: "#fffdf9", border: "1px solid #e4dcc9", 
borderRadius: 6, padding: "12px 14px", display: "flex", flexDirection: "column", 
gap: 8 }}>
            {school.knownFor && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#8a8272", 
textTransform: "uppercase", letterSpacing: "0.04em", fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>Known for</div>
                <div style={{ marginTop: 4 }}><KnownForLines text={school.knownFor} fontSize={13.5} /></div>
              </div>
            )}
            {school.topMajors && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#8a8272", 
textTransform: "uppercase", letterSpacing: "0.04em", fontFamily: "'IBM Plex Mono', monospace", marginBottom: 4 }}>Best majors</div>
                <div style={{ fontSize: 13.5, color: "#2B2B28" }} >{school.topMajors}</div>
              </div>
            )}
          </div>
        )}
        {school.notes && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#8a8272", 
textTransform: "uppercase", letterSpacing: "0.04em", fontFamily: "'IBM Plex Mono', monospace", marginBottom: 6 }}>Notes</div>
            <div style={{ fontSize: 13.5, color: "#5c5648", lineHeight: 1.5 }} >{school.notes}</div>
          </div>
        )}
        <LinkedGroup title="Essays" accent={TAB_COLOR.essays} items={linkedEssays} renderLine={(e) => (<><span>{e.prompt || e.promptType || "Untitled prompt"}</span><Badge status={e.status} /></>)} />
        <LinkedGroup title="Recommendations" accent={TAB_COLOR.recs} items={linkedRecs} renderLine={(r) => (<><span>{r.recommender}</span><Badge status={r.status} /></>)} />
        <LinkedGroup title="Coach Calls" accent={TAB_COLOR.calls} items={linkedCalls} renderLine={(c) => (<><span>{c.coach || "Coach TBD"}{c.date ? ` · ${fmtDate(c.date)}` : ""}</span><Badge status={c.status} /></>)} />
        <LinkedGroup title="Campus Visits" accent={TAB_COLOR.visits} items={linkedVisits} renderLine={(v) => (<><span>{v.type || "Visit"}{v.date ? ` · ${fmtDate(v.date)}` : ""}</span><Badge status={v.status} /></>)} />
        {linkedEssays.length + linkedRecs.length + linkedCalls.length + linkedVisits.length === 0 && (
          <p style={{ fontSize: 13, color: "#a39c8c", fontStyle: "italic", margin: 0 }}>
            No essays, recommendations, coach calls, or visits linked to this school yet — set the "school" field to "{school.name}" on any of those to see them here.
          </p>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, 
borderTop: "1px solid #e4dcc9", paddingTop: 14 }}>
          <Btn variant="ghost" onClick={onClose}>Close</Btn>
          <Btn onClick={onEdit}><Edit2 size={14} />Edit details</Btn>
        </div>
      </div>
    </Modal>
  );
}
function countWords(text) {
  return (text || "").trim().split(/\s+/).filter(Boolean).length;
}
async function callClaudeText(prompt, maxTokens = 1000) {
  assertAiEnabled();
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message || "API error");
  return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
}
function EssayWorkspaceModal({ essay, schools, achievements, onClose, onSave }) {
  const [v, setV] = useState({ wordLimit: "", promptType: "Other / not sure yet", 
school: "", status: "Not started", dueDate: "", draft: "", ...essay });
  const [saved, setSaved] = useState(false);
  const [tool, setTool] = useState(null); // 'brainstorm' | 'outline' | 'feedback'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [brainstorm, setBrainstorm] = useState(null);
  const [outline, setOutline] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const wordCount = countWords(v.draft);
  const overLimit = v.wordLimit && wordCount > parseInt(v.wordLimit, 10);
  const achievementSummary = (achievements || []).map((a) => `${a.entry}${a.category ? ` (${a.category})` : ""}`).join(", ");
  const saveAll = () => {
    onSave(v);
    setSaved(true);
    setTimeout(() => setSaved(false), 1400);
  };
  const promptContext = `Essay prompt type: ${v.promptType || "not set"}.${v.prompt ? ` Prompt/title: ${v.prompt}.` : ""}${v.school ? ` For: ${v.school}.` : ""}${v.wordLimit ? ` Word limit: ${v.wordLimit}.` : ""}`;
  const runBrainstorm = async () => {
    setTool("brainstorm"); setLoading(true); setError("");
    try {
      const prompt = `A high school student-athlete (tennis) is brainstorming ideas for a college essay.${promptContext} ${achievementSummary ? `\nThings about them that could be worth drawing on: ${achievementSummary}` : ""} Generate 5-6 distinct possible angles or story ideas they could write about for this prompt. Each should be a short 1-2 sentence pitch of the angle, specific enough to spark a real memory, not generic advice. Only reference the background given above — don't invent specific stories or events. If little background was given, suggest angles as open questions/directions to explore rather than presuming specific experiences. Respond with ONLY a raw JSON array of strings, no markdown, no code fences, no extra text: ["...", "..."]`;
      const text = await callClaudeText(prompt, 900);
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("No results found");
      setBrainstorm(JSON.parse(match[0]));
    } catch (e) {
      setError(
        e.message === AI_DISABLED_MESSAGE
          ? AI_DISABLED_MESSAGE
          : "Couldn't brainstorm right now (" + (e.message || "unknown error") + ") — try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  };
  const runOutline = async () => {
    setTool("outline"); setLoading(true); setError("");
    try {
      const basis = v.draft.trim()
        ? `Here's what they've written so far — build an outline that reflects and organizes what's already there, filling gaps sensibly:\n\n${v.draft}`
        : `They haven't started writing yet — give a solid general-purpose outline structure for this kind of prompt.`;
      const prompt = `A high school student-athlete is outlining a college essay.${promptContext} ${basis} Produce a simple 4-5 part outline (e.g. hook/opening, body sections, conclusion). For each part, give a short label and a 1-sentence description of what should go there. Keep it practical and concrete, not abstract writing theory. Respond with ONLY a raw JSON array of objects, no markdown, no code fences, no extra text: [{"label": "...", "note": "..."}]`;
      const text = await callClaudeText(prompt, 900);
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("No results found");
      setOutline(JSON.parse(match[0]));
    } catch (e) {
      setError(
        e.message === AI_DISABLED_MESSAGE
          ? AI_DISABLED_MESSAGE
          : "Couldn't build an outline right now (" + (e.message || "unknown error") + ") — try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  };
  const runFeedback = async () => {
    if (countWords(v.draft) < 30) {
      setError("Write at least a rough paragraph first — there's not enough here yet to give useful feedback.");
      setTool("feedback");
      return;
    }
    setTool("feedback"); setLoading(true); setError("");
    try {
      const prompt = `A high school student-athlete wrote this college essay draft. ${promptContext} DRAFT: """ ${v.draft} """ Give feedback only — do NOT rewrite or rephrase the essay, do not produce a revised version. Organize your feedback into exactly three categories: 1) "grammar": mechanical issues — grammar, punctuation, awkward phrasing, run-ons, 
word choice slips. 2-4 short bullet points, each pointing at something specific (quote a short fragment if useful). 2) "organization": structure and flow — pacing, whether the opening hooks, whether it builds logically, whether the ending lands. 2-4 short bullet points. 3) "story": the substance — is the story specific and vivid or generic, does it show genuine reflection/growth, is there a clear "so what". 2-4 short bullet points. Keep every bullet point short (one sentence). Be honest and specific, not just encouraging. Respond with ONLY a raw JSON object in this exact shape, no markdown, no code fences, no extra text: {"grammar": ["...", "..."], "organization": ["...", "..."], "story": ["...", 
"..."]}`;
      const text = await callClaudeText(prompt, 1200);
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No results found");
      setFeedback(JSON.parse(match[0]));
    } catch (e) {
      setError(
        e.message === AI_DISABLED_MESSAGE
          ? AI_DISABLED_MESSAGE
          : "Couldn't get feedback right now (" + (e.message || "unknown error") + ") — try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  };
  const toolBtn = (key, label, onRun) => (
    <button
      onClick={onRun}
      style={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center", 
gap: 4, padding: "10px 8px",
        borderRadius: 6, cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12.5, fontWeight: 600,
        background: tool === key ? TAB_COLOR.essays : "#fffdf9",
        color: tool === key ? "#ffffff" : "#1B2A41",
        border: `1px solid ${tool === key ? TAB_COLOR.essays : "#e4dcc9"}`,
      }}
    >
      {label}
    </button>
  );
  const sectionLabel = (n, text) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <span style={{
        width: 22, height: 22, borderRadius: "50%", background: TAB_COLOR.essays, 
color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0,
      }}>{n}</span>
      <span style={{ fontSize: 13.5, fontWeight: 700, color: "#1B2A41" 
}}>{text}</span>
    </div>
  );
  return (
    <Modal title={v.prompt || v.promptType || "Essay workspace"} onClose={onClose} width={860}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Section 1: essay details */}
        <div>
          {sectionLabel(1, "Essay Details")}
          <div style={{ background: "#fffdf9", border: "1px solid #e4dcc9", 
borderRadius: 8, padding: "14px 16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
              <Field label="Prompt type"><Select options={PROMPT_TYPES} value={v.promptType} onChange={(e) => setV({ ...v, promptType: e.target.value })} /></Field>
              <Field label="School / application">
                <Select options={["General / Common App", ...(schools || []).map((s) => s.name).filter(Boolean), v.school].filter((x, i, a) => x && a.indexOf(x) === i)} value={v.school || "General / Common App"} onChange={(e) => setV({ ...v, school: e.target.value })} />
              </Field>
              <Field label="Word limit"><TextInput value={v.wordLimit} onChange={(e) => setV({ ...v, wordLimit: e.target.value })} placeholder="650" /></Field>
              <Field label="Status"><Select options={ESSAY_STATUSES} value={v.status} onChange={(e) => setV({ ...v, status: e.target.value })} /></Field>
              <Field label="Due date"><TextInput type="date" value={v.dueDate} onChange={(e) => setV({ ...v, dueDate: e.target.value })} /></Field>
            </div>
          </div>
        </div>
        {/* Section 2: writing space */}
        <div>
          {sectionLabel(2, "Write Your Essay")}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", 
color: overLimit ? "#8B3A3A" : "#8a8272", fontWeight: overLimit ? 700 : 400 }}>
              {wordCount}{v.wordLimit ? ` / ${v.wordLimit}` : ""} words
            </span>
          </div>
          <textarea
            value={v.draft}
            onChange={(e) => setV({ ...v, draft: e.target.value })}
            placeholder="Start writing here..."
            style={{
              ...inputStyle, minHeight: 300, resize: "vertical", lineHeight: 1.6, 
fontSize: 14, width: "100%",
              border: `1px solid ${overLimit ? "#e0bcb8" : "#d8cfba"}`,
            }}
          />
          <div style={{ marginTop: 10 }}>
            <Btn onClick={saveAll}><Check size={14} />{saved ? "Saved ✅" : "Save essay"}</Btn>
          </div>
        </div>
        {/* Section 3: AI feedback */}
        <div>
          {sectionLabel(3, "AI Feedback")}
          <div style={{ background: "#fffdf9", border: "1px solid #e4dcc9", 
borderRadius: 8, padding: "14px 16px", display: "flex", flexDirection: "column", 
gap: 12 }}>
            <p style={{ fontSize: 12.5, color: "#8a8272", margin: 0 }}>Get help correcting mistakes and strengthening the essay — it critiques, it never rewrites it for you.</p>
            <div style={{ display: "flex", gap: 6 }}>
              {toolBtn("brainstorm", "💡 Brainstorm", runBrainstorm)}
              {toolBtn("outline", "🧭 Outline", runOutline)}
              {toolBtn("feedback", "🔍 Feedback", runFeedback)}
            </div>
            {loading && <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#8a8272" }}><Loader2 size={14} className="spin" />Working on it…</div>}
            {error && <div style={{ fontSize: 12.5, color: "#8B3A3A" 
}}>{error}</div>}
            {!loading && tool === "brainstorm" && brainstorm && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
                {brainstorm.map((idea, i) => (
                  <div key={i} style={{ background: "#ffffff", border: "1px solid #e4dcc9", borderLeft: `3px solid ${TAB_COLOR.essays}`, borderRadius: 5, padding: "8px 10px", fontSize: 13, color: "#2B2B28", lineHeight: 1.45 }}>{idea}</div>
                ))}
              </div>
            )}
            {!loading && tool === "outline" && outline && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
                {outline.map((part, i) => (
                  <div key={i} style={{ background: "#ffffff", border: "1px solid #e4dcc9", borderLeft: `3px solid ${TAB_COLOR.essays}`, borderRadius: 5, padding: "8px 10px" }}>
                    <div style={{ fontWeight: 700, fontSize: 12.5, color: "#1B2A41" 
}}>{i + 1}. {part.label}</div>
                    <div style={{ fontSize: 12.5, color: "#5c5648", marginTop: 2 }} >{part.note}</div>
                  </div>
                ))}
              </div>
            )}
            {!loading && tool === "feedback" && feedback && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                {[
                  ["grammar", "Grammar & mechanics"],
                  ["organization", "Organization & flow"],
                  ["story", "Story & content"],
                ].map(([key, label]) => (
                  feedback[key] && feedback[key].length > 0 && (
                    <div key={key}>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: "#8a8272", textTransform: "uppercase", letterSpacing: "0.04em", fontFamily: "'IBM Plex Mono', monospace", marginBottom: 6 }}>{label}</div>
                      <ul style={{ margin: 0, paddingLeft: 18, display: "flex", 
flexDirection: "column", gap: 6 }}>
                        {feedback[key].map((pt, i) => <li key={i} style={{ fontSize: 13, color: "#2B2B28", lineHeight: 1.45 }}>{pt}</li>)}
                      </ul>
                    </div>
                  )
                ))}
              </div>
            )}
            {!tool && !loading && (
              <div style={{ fontSize: 12.5, color: "#a39c8c", lineHeight: 1.5 }}>
                <strong>Brainstorm</strong> for ideas, <strong>Outline</strong> to structure it, or <strong>Feedback</strong> once you have a draft — it'll point out grammar mistakes, organization issues, and story weaknesses so you can fix them yourself.
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={onClose}>Close</Btn>
        </div>
      </div>
    </Modal>
  );
}
function compressImageFile(file, maxWidth = 640, quality = 0.6) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
const FIT_OPTIONS = ["Yes, it felt like home", "Leaning yes", "Not sure yet", 
"Leaning no", "No, not a fit"];
const FIT_COLOR = {
  "Yes, it felt like home": "#3F5B45",
  "Leaning yes": "#3F5B45",
  "Not sure yet": "#8a6d3b",
  "Leaning no": "#8B3A3A",
  "No, not a fit": "#8B3A3A",
};
const VISIT_RATING_CATEGORIES = ["Cafeteria", "Team Chemistry", "Coaching Staff", 
"Dorms", "Campus & Facilities", "Academics"];
function RatingRow({ label, value, onChange, color }) {
  const [popIndex, setPopIndex] = useState(null);
  const handleClick = (n) => {
    onChange(n === value ? 0 : n);
    setPopIndex(n);
    setTimeout(() => setPopIndex(null), 350);
  };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 12.5, color: "#6b6355", fontWeight: 600 }}>{label} </span>
        <span style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", 
color: value ? color : "#a39c8c", fontWeight: 700 }}>{value || 0}/10</span>
      </div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => handleClick(n)}
            className={popIndex === n ? "rating-pop" : ""}
            style={{
              width: 24, height: 24, borderRadius: "50%", cursor: "pointer", 
fontSize: 10.5, fontWeight: 700,
              fontFamily: "'IBM Plex Mono', monospace", padding: 0, position: "relative",
              background: value >= n ? color : "#ffffff",
              color: value >= n ? "#ffffff" : "#a39c8c",
              border: `1px solid ${value >= n ? color : "#e4dcc9"}`,
              boxShadow: popIndex === n ? `0 0 0 4px ${color}55` : "0 0 0 0 transparent",
              transition: "box-shadow 0.35s ease, background 0.15s ease, color 0.15s ease",
            }}
          >{n}</button>
        ))}
      </div>
    </div>
  );
}
function VisitWorkspaceModal({ visit, onClose, onSave }) {
  const [v, setV] = useState({ photos: [], pros: "", cons: "", longTermFit: "", 
ratings: {}, reflection: "", ...visit });
  const [saved, setSaved] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const MAX_PHOTOS = 6;
  const save = () => { onSave(v); setSaved(true); setTimeout(() => setSaved(false), 
1400); };
  const handleFiles = async (fileList) => {
    setUploadError("");
    const files = Array.from(fileList || []);
    const room = MAX_PHOTOS - (v.photos || []).length;
    if (room <= 0) { setUploadError(`You've hit the ${MAX_PHOTOS}-photo limit for this visit — remove one to add another.`); return; }
    const toProcess = files.slice(0, room);
    try {
      const compressed = await Promise.all(toProcess.map((f) => compressImageFile(f)));
      setV((prev) => ({ ...prev, photos: [...(prev.photos || []), ...compressed] }));
    } catch (e) {
      setUploadError("Couldn't process one of those images — try a different photo.");
    }
  };
  const removePhoto = (idx) => setV({ ...v, photos: v.photos.filter((_, i) => i !== idx) });
  const sectionLabel = (n, text) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <span style={{
        width: 22, height: 22, borderRadius: "50%", background: TAB_COLOR.visits, 
color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0,
      }}>{n}</span>
      <span style={{ fontSize: 13.5, fontWeight: 700, color: "#1B2A41" 
}}>{text}</span>
    </div>
  );
  return (
    <Modal title={visit.school || "Campus visit"} onClose={onClose} width={780}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Section 1: visit details */}
        <div>
          {sectionLabel(1, "Visit Details")}
          <div style={{ background: "#fffdf9", border: "1px solid #e4dcc9", 
borderRadius: 8, padding: "14px 16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
              <Field label="Visit type"><Select options={VISIT_TYPES} value={v.type} onChange={(e) => setV({ ...v, type: e.target.value })} /></Field>
              <Field label="Status"><Select options={VISIT_STATUSES} value={v.status} onChange={(e) => setV({ ...v, status: e.target.value })} /></Field>
              <Field label="Date"><TextInput type="date" value={v.date} onChange={(e) => setV({ ...v, date: e.target.value })} /></Field>
            </div>
          </div>
        </div>
        {/* Section 2: photos */}
        <div>
          {sectionLabel(2, "Photos")}
          <div style={{ background: "#fffdf9", border: "1px solid #e4dcc9", 
borderRadius: 8, padding: "14px 16px", display: "flex", flexDirection: "column", 
gap: 10 }}>
            <label style={{
              display: "inline-flex", alignItems: "center", gap: 8, alignSelf: "flex-start", cursor: "pointer",
              padding: "8px 14px", borderRadius: 4, border: `1px solid ${TAB_COLOR.visits}`, color: TAB_COLOR.visits,
              fontSize: 13, fontWeight: 600, fontFamily: "'IBM Plex Sans', sans-serif",
            }}>
              <Plus size={14} /> Upload photos
              <input type="file" accept="image/*" multiple style={{ display: "none" 
}} onChange={(e) => handleFiles(e.target.files)} />
            </label>
            <div style={{ fontSize: 11.5, color: "#a39c8c" }}>Up to {MAX_PHOTOS} photos — dorms, campus, wherever helps you remember the vibe. Images are compressed to keep things light.</div>
            {uploadError && <div style={{ fontSize: 12, color: "#8B3A3A" }} >{uploadError}</div>}
            {v.photos && v.photos.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 8 }}>
                {v.photos.map((src, i) => (
                  <div key={i} style={{ position: "relative", borderRadius: 6, 
overflow: "hidden", border: "1px solid #e4dcc9" }}>
                    <img src={src} alt={`Visit photo ${i + 1}`} style={{ width: "100%", height: 90, objectFit: "cover", display: "block" }} />
                    <button
                      onClick={() => removePhoto(i)}
                      style={{
                        position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: "50%",
                        background: "rgba(43,43,40,0.75)", color: "#fff", border: "none", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
                      }}
                    ><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Section 3: reflection questions */}
        <div>
          {sectionLabel(3, "Reflection")}
          <div style={{ background: "#fffdf9", border: "1px solid #e4dcc9", 
borderRadius: 8, padding: "14px 16px", display: "flex", flexDirection: "column", 
gap: 14 }}>
            <Field label="What did you like? (benefits, upsides)">
              <TextArea value={v.pros} onChange={(e) => setV({ ...v, pros: e.target.value })} placeholder="Team culture, coach, campus, facilities, 
academics..." />
            </Field>
            <Field label="What concerned you? (downsides, red flags)">
              <TextArea value={v.cons} onChange={(e) => setV({ ...v, cons: e.target.value })} placeholder="Anything that gave you pause..." />
            </Field>
            <div>
              <div style={{ fontSize: 12.5, color: "#6b6355", fontWeight: 600, 
marginBottom: 6 }}>Could you see yourself here for the next few years?</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {FIT_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setV({ ...v, longTermFit: opt })}
                    style={{
                      fontSize: 12.5, padding: "6px 12px", borderRadius: 20, 
cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600,
                      background: v.longTermFit === opt ? FIT_COLOR[opt] : "#ffffff",
                      color: v.longTermFit === opt ? "#ffffff" : "#1B2A41",
                      border: `1px solid ${v.longTermFit === opt ? FIT_COLOR[opt] : "#e4dcc9"}`,
                    }}
                  >{opt}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", 
alignItems: "baseline", marginBottom: 10 }}>
                <div style={{ fontSize: 12.5, color: "#6b6355", fontWeight: 600 }} >Rate the visit</div>
                {(() => {
                  const vals = Object.values(v.ratings || {}).filter((n) => n > 0);
                  if (vals.length === 0) return null;
                  const avg = (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
                  return <span style={{ fontSize: 13, fontWeight: 700, color: TAB_COLOR.visits, fontFamily: "'IBM Plex Mono', monospace" }}>Avg: {avg}/10</span>;
                })()}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {VISIT_RATING_CATEGORIES.map((cat) => (
                  <RatingRow
                    key={cat}
                    label={cat}
                    value={(v.ratings || {})[cat] || 0}
                    color={TAB_COLOR.visits}
                    onChange={(n) => setV({ ...v, ratings: { ...(v.ratings || {}), 
[cat]: n } })}
                  />
                ))}
              </div>
            </div>
            <Field label="Anything else worth remembering">
              <TextArea value={v.reflection} onChange={(e) => setV({ ...v, 
reflection: e.target.value })} placeholder="Who you met, a moment that stuck with you, questions you still have..." />
            </Field>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Btn variant="ghost" onClick={onClose}>Close</Btn>
          <Btn onClick={save}><Check size={14} />{saved ? "Saved ✅" : "Save visit"}</Btn>
        </div>
      </div>
    </Modal>
  );
}
function EditModal({ modal, schools, onClose, onSave }) {
  const { type, editing } = modal;
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const lookupSchoolInfo = async (v, set) => {
    if (!v.name || !v.name.trim()) { setLookupError("Enter the school name first."); return; }
    setLookupLoading(true);
    setLookupError("");
    try {
      assertAiEnabled();
      const team = v.rosterGender === "Women's" ? "women's" : "men's";
      const prompt = `Research the university "${v.name}" for a high school student-athlete (tennis recruit) researching colleges. Use web search as many times as you need to — do several separate searches rather than giving up after one. Find and report: 1) "knownFor": a handful of simple, labeled facts — NOT full sentences or prose. Format it as short "Label: value" lines separated by newlines (\\n), one fact per line, in this order:
   - "Population: " + approx. undergrad enrollment
   - "Setting: " + urban / suburban / small town / rural, plus the nearest city if relevant
   - "Vibe: " + 2-4 words on lifestyle/culture (e.g. "laid-back, outdoorsy", 
"preppy, tradition-heavy", "artsy, alternative")
   - "Weather: " + short climate description (e.g. "hot, dry summers; mild winters")
   - "Known for: " + one standout reputation point (a strong program, research strength, school spirit, etc.) — only include this line if there's something genuinely notable, otherwise skip it
   Each line should be short and plain-spoken, just a few words after the label. Don't pad it out. 2) "topMajors": just the two best / most notable majors or programs at this school, 
comma-separated (e.g. "Business, Computer Science"). Not a long list — only the top two. 3) "tuition": the approximate annual sticker-price tuition (out-of-state/private if applicable), as just a number in dollars, no symbols or commas (e.g. "48000"). If unknown, use an empty string. 4) "gpaWeighted": the approximate weighted GPA a competitive applicant would have, 
as a short string (e.g. "4.1+"). If you can only find one general GPA figure (not clearly weighted or unweighted), put your best judgment call here and use the same figure for gpaUnweighted too. If unknown, use an empty string. 5) "gpaUnweighted": the approximate unweighted GPA (4.0 scale) a competitive applicant would have, as a short string (e.g. "3.6+"). If unknown, use an empty string. 6) "testSAT": the approximate middle-50% SAT range for admitted students, as a short string (e.g. "1250-1400"). If unknown, use an empty string. 7) "testACT": the approximate middle-50% ACT range for admitted students, as a short string (e.g. "27-31"). If unknown, use an empty string. 8) "utrTarget" and "utrSourceNote" — real research required, not a guess:
   a. Search for "${v.name} ${team} tennis roster" on their official athletics site (usually the school name + "athletics.com" or similar).
   b. Also try searching "${v.name} ${team} tennis lineup" or "${v.name} ${team} tennis dual match lineup" to see if the #6 singles position is documented anywhere (school site, conference site, or TennisRecruiting.net / ITA rankings pages sometimes list lineup order).
   c. The goal is to identify whoever plays (or is likely to play, based on roster order/class/ranking) the #6 singles spot — the bottom of the starting singles lineup, since that's the realistic bar for making the team. If true lineup order truly cannot be found anywhere, fall back to the 6th player listed on the official roster page (often ordered by class year), and say so.
   d. Once you have a specific player's name, search "[player name] UTR" or "[player name] UTR Sports" to find their UTR rating (from app.utrsports.net, 
utrsports.net, or a site that cites their UTR, like TennisRecruiting.net).
   e. Set "utrTarget" to that exact UTR number only (e.g. "11.24").
   f. Set "utrSourceNote" to a short attribution, e.g. "Based on [Player Name], #6 singles, 2025-26 roster" (or "...6th listed on roster" if you used the fallback method in step c).
   g. Only if you truly cannot find any real roster, any identifiable #6 player, or any real UTR number tied to a real name, leave "utrTarget" and "utrSourceNote" as empty strings. Do not invent a plausible-sounding UTR — an empty string is the correct answer when the real number can't be found. If you're not confident "${v.name}" is a real, specific school, say so honestly in "knownFor" and leave the other fields as empty strings instead of guessing wildly. Respond with ONLY a raw JSON object in this exact shape, no markdown, no code fences, no extra text before or after it. Use \n as a literal escaped newline character inside the "knownFor" string to separate its lines: {"knownFor": "...", "topMajors": "...", "tuition": "...", "gpaWeighted": "...", 
"gpaUnweighted": "...", "testSAT": "...", "testACT": "...", "utrTarget": "...", 
"utrSourceNote": "..."}`;
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 2000,
          messages: [{ role: "user", content: prompt }],
          tools: [{ type: "web_search_20250305", name: "web_search" }],
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message || "API error");
      const textBlocks = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
      const match = textBlocks.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON found in response");
      const parsed = JSON.parse(match[0]);
      set({
        ...v,
        knownFor: parsed.knownFor || "",
        topMajors: parsed.topMajors || "",
        tuition: parsed.tuition || v.tuition,
        gpaWeighted: parsed.gpaWeighted || v.gpaWeighted,
        gpaUnweighted: parsed.gpaUnweighted || v.gpaUnweighted,
        testSAT: parsed.testSAT || v.testSAT,
        testACT: parsed.testACT || v.testACT,
        utrTarget: parsed.utrTarget || v.utrTarget,
        utrSourceNote: parsed.utrSourceNote || "",
      });
      if (!parsed.utrTarget) {
        setLookupError("Filled in what it could find, but couldn't confirm a real #6 roster player's UTR for this school — that field is left blank rather than guessed. You can try again (search results vary), or fill it in yourself from UTR Sports.");
      }
    } catch (e) {
      setLookupError(
        e.message === AI_DISABLED_MESSAGE
          ? AI_DISABLED_MESSAGE
          : "Couldn't complete the lookup just now (" + (e.message || "unknown error") + ") — feel free to fill these in yourself, or try again."
      );
    } finally {
      setLookupLoading(false);
    }
  };
  const configs = {
    school: {
      title: editing?.id ? "Edit application" : "Add school",
      key: "schools",
      initial: { id: editing?.id || uid(), name: "", tier: "Target", status: "Researching", rosterGender: "Men's", tuition: "", gpaWeighted: "", gpaUnweighted: "", testSAT: "", testACT: "", utrTarget: "", utrSourceNote: "", knownFor: "", 
topMajors: "", notes: "", ...editing },
      fields: (v, set) => (<>
        <Field label="School name"><TextInput autoFocus value={v.name} onChange={(e) => set({ ...v, name: e.target.value })} placeholder="University of..." /></Field>
        <Field label="Tennis team (for UTR lookup)"><Select options={["Men's", 
"Women's"]} value={v.rosterGender || "Men's"} onChange={(e) => set({ ...v, 
rosterGender: e.target.value })} /></Field>
        <div>
          <Btn variant="ghost" onClick={() => lookupSchoolInfo(v, set)} disabled={lookupLoading} style={{ width: "100%", justifyContent: "center", opacity: lookupLoading ? 0.7 : 1 }}>
            {lookupLoading ? <Loader2 size={13} className="spin" /> : <Sparkles size={13} />}
            {lookupLoading ? "Looking it up…" : "Auto-fill school info (tuition, GPA, test score, UTR, majors)"}
          </Btn>
          {lookupError && <div style={{ fontSize: 11.5, color: "#8B3A3A", 
marginTop: 6 }}>{lookupError}</div>}
          <div style={{ fontSize: 11, color: "#a39c8c", marginTop: 6 }}>Tuition, 
GPA, and test scores come from published admissions data where available. UTR is pulled from the real UTR profile of whoever plays #6 singles on that team's current roster — not an estimate — but always worth double-checking on UTR Sports yourself.</div>
        </div>
        <Field label="Known for"><TextArea value={v.knownFor} onChange={(e) => set({ ...v, knownFor: e.target.value })} placeholder={"Population: ~12,000 undergrads\nSetting: Urban, near downtown\nVibe: Laid-back, outdoorsy\nWeather: Hot summers, mild winters"} /></Field>
        <Field label="Two best majors"><TextInput value={v.topMajors} onChange={(e) => set({ ...v, topMajors: e.target.value })} placeholder="Business, Engineering" /></Field>
        <Field label="Reach / Target / Safety"><Select options={SCHOOL_TIERS} value={v.tier || "Target"} onChange={(e) => set({ ...v, tier: e.target.value })} /></Field>
        <Field label="Status"><Select options={APP_STATUSES} value={v.status} onChange={(e) => set({ ...v, status: e.target.value })} /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Annual tuition ($)"><TextInput value={v.tuition} onChange={(e) => set({ ...v, tuition: e.target.value })} placeholder="45000" /></Field>
          <Field label="UTR needed to get in"><TextInput value={v.utrTarget} onChange={(e) => set({ ...v, utrTarget: e.target.value })} placeholder="10+" /></Field>
          <Field label="GPA (weighted)"><TextInput value={v.gpaWeighted} onChange={(e) => set({ ...v, gpaWeighted: e.target.value })} placeholder="4.1+" /></Field>
          <Field label="GPA (unweighted)"><TextInput value={v.gpaUnweighted} onChange={(e) => set({ ...v, gpaUnweighted: e.target.value })} placeholder="3.7+" /></Field>
          <Field label="SAT expected"><TextInput value={v.testSAT} onChange={(e) => set({ ...v, testSAT: e.target.value })} placeholder="1350+" /></Field>
          <Field label="ACT expected"><TextInput value={v.testACT} onChange={(e) => set({ ...v, testACT: e.target.value })} placeholder="29+" /></Field>
        </div>
        {v.utrSourceNote && <div style={{ fontSize: 11.5, color: "#8a8272", 
fontStyle: "italic", marginTop: -6 }}>{v.utrSourceNote}</div>}
        <Field label="Notes"><TextArea value={v.notes} onChange={(e) => set({ ...v, 
notes: e.target.value })} placeholder="Portal login, supplements needed, 
contacts..." /></Field>
      </>),
    },
    essay: {
      title: editing?.id ? "Edit essay" : "Add essay",
      key: "essays",
      initial: { id: editing?.id || uid(), prompt: "", promptType: "Other / not sure yet", school: "", wordLimit: "", status: "Not started", dueDate: "", draft: "", ...editing },
      fields: (v, set) => (<>
        <Field label="Prompt type"><Select options={PROMPT_TYPES} value={v.promptType || "Other / not sure yet"} onChange={(e) => set({ ...v, 
promptType: e.target.value })} /></Field>
        <Field label="School / application">
          <Select options={["General / Common App", ...schools.map((s) => s.name).filter(Boolean), v.school].filter((x, i, a) => x && a.indexOf(x) === i)} value={v.school || "General / Common App"} onChange={(e) => set({ ...v, school: e.target.value })} />
        </Field>
        <Field label="Word limit"><TextInput value={v.wordLimit} onChange={(e) => set({ ...v, wordLimit: e.target.value })} placeholder="650" /></Field>
        <Field label="Status"><Select options={ESSAY_STATUSES} value={v.status} onChange={(e) => set({ ...v, status: e.target.value })} /></Field>
        <Field label="Due date"><TextInput type="date" value={v.dueDate} onChange={(e) => set({ ...v, dueDate: e.target.value })} /></Field>
      </>),
    },
    rec: {
      title: editing ? "Edit recommender" : "Add recommender",
      key: "recs",
      initial: { id: editing?.id || uid(), recommender: "", role: "", school: "", 
status: "Not asked", dueDate: "", ...editing },
      fields: (v, set) => (<>
        <Field label="Recommender name"><TextInput autoFocus value={v.recommender} onChange={(e) => set({ ...v, recommender: e.target.value })} placeholder="Coach Jake" /></Field>
        <Field label="Role / relationship"><TextInput value={v.role} onChange={(e) => set({ ...v, role: e.target.value })} placeholder="Tennis coach" /></Field>
        <Field label="For which school (optional)"><TextInput value={v.school} onChange={(e) => set({ ...v, school: e.target.value })} /></Field>
        <Field label="Status"><Select options={REC_STATUSES} value={v.status} onChange={(e) => set({ ...v, status: e.target.value })} /></Field>
        <Field label="Due date"><TextInput type="date" value={v.dueDate} onChange={(e) => set({ ...v, dueDate: e.target.value })} /></Field>
      </>),
    },
    scholarship: {
      title: editing?.id ? "Edit scholarship" : "Add scholarship",
      key: "scholarships",
      initial: { id: editing?.id || uid(), name: "", amount: "", status: "Researching", deadline: "", url: "", requirements: "", ...editing },
      fields: (v, set) => (<>
        <Field label="Scholarship name"><TextInput autoFocus value={v.name} onChange={(e) => set({ ...v, name: e.target.value })} /></Field>
        <Field label="Amount ($)"><TextInput value={v.amount} onChange={(e) => set({ ...v, amount: e.target.value })} placeholder="2500" /></Field>
        <Field label="Status"><Select options={SCH_STATUSES} value={v.status} onChange={(e) => set({ ...v, status: e.target.value })} /></Field>
        <Field label="Deadline"><TextInput type="date" value={v.deadline} onChange={(e) => set({ ...v, deadline: e.target.value })} /></Field>
        <Field label="Application URL"><TextInput value={v.url} onChange={(e) => set({ ...v, url: e.target.value })} placeholder="https://..." /></Field>
        <Field label="Requirements"><TextArea value={v.requirements} onChange={(e) => set({ ...v, requirements: e.target.value })} placeholder="Essay, transcript, 
financial need form..." /></Field>
      </>),
    },
    call: {
      title: editing?.id ? "Edit coach call" : "Add coach call",
      key: "calls",
      initial: { id: editing?.id || uid(), coach: "", school: "", format: "Phone", 
time: "", status: "Scheduled", date: "", notes: "", ...editing },
      fields: (v, set) => (<>
        <Field label="Coach name"><TextInput autoFocus value={v.coach} onChange={(e) => set({ ...v, coach: e.target.value })} placeholder="Head coach, 
assistant coach..." /></Field>
        <Field label="School">
          <Select options={["", ...schools.map((s) => s.name).filter(Boolean), 
v.school].filter((x, i, a) => a.indexOf(x) === i)} value={v.school || ""} onChange={(e) => set({ ...v, school: e.target.value })} />
        </Field>
        <Field label="Format"><Select options={["Phone", "Video call", "In person", 
"Text/email"]} value={v.format} onChange={(e) => set({ ...v, format: e.target.value 
})} /></Field>
        <Field label="Time"><TextInput value={v.time} onChange={(e) => set({ ...v, 
time: e.target.value })} placeholder="4:00 PM PT" /></Field>
        <Field label="Status"><Select options={CALL_STATUSES} value={v.status} onChange={(e) => set({ ...v, status: e.target.value })} /></Field>
        <Field label="Date"><TextInput type="date" value={v.date} onChange={(e) => set({ ...v, date: e.target.value })} /></Field>
        <Field label="Notes"><TextArea value={v.notes} onChange={(e) => set({ ...v, 
notes: e.target.value })} placeholder="Talking points, UTR/ranking to mention, 
follow-up items..." /></Field>
      </>),
    },
    visit: {
      title: editing ? "Edit campus visit" : "Add campus visit",
      key: "visits",
      initial: { id: editing?.id || uid(), school: "", type: "Unofficial visit", 
status: "Planned", date: "", notes: "", ...editing },
      fields: (v, set) => (<>
        <Field label="School">
          <Select options={["", ...schools.map((s) => s.name).filter(Boolean), 
v.school].filter((x, i, a) => a.indexOf(x) === i)} value={v.school || ""} onChange={(e) => set({ ...v, school: e.target.value })} />
        </Field>
        <Field label="Visit type"><Select options={VISIT_TYPES} value={v.type} onChange={(e) => set({ ...v, type: e.target.value })} /></Field>
        <Field label="Status"><Select options={VISIT_STATUSES} value={v.status} onChange={(e) => set({ ...v, status: e.target.value })} /></Field>
        <Field label="Date"><TextInput type="date" value={v.date} onChange={(e) => set({ ...v, date: e.target.value })} /></Field>
        <Field label="Notes"><TextArea value={v.notes} onChange={(e) => set({ ...v, 
notes: e.target.value })} placeholder="Who you're meeting, practice/tryout details, 
travel plan..." /></Field>
      </>),
    },
    link: {
      title: editing?.id ? "Edit link" : "Add link",
      key: "links",
      initial: { id: editing?.id || uid(), label: "", category: "Other", url: "", 
school: "", notes: "", ...editing },
      fields: (v, set) => (<>
        <Field label="Label"><TextInput autoFocus value={v.label} onChange={(e) => set({ ...v, label: e.target.value })} placeholder="My UTR Profile" /></Field>
        <Field label="School (leave blank for general links)">
          <Select options={["", ...schools.map((s) => s.name).filter(Boolean), 
v.school].filter((x, i, a) => a.indexOf(x) === i)} value={v.school || ""} onChange={(e) => set({ ...v, school: e.target.value })} />
        </Field>
        <Field label="Category"><Select options={LINK_CATEGORIES} value={v.category} onChange={(e) => set({ ...v, category: e.target.value })} /></Field>
        <Field label="URL"><TextInput value={v.url} onChange={(e) => set({ ...v, 
url: e.target.value })} placeholder="https://app.utrsports.net/..." /></Field>
        <Field label="Notes"><TextArea value={v.notes} onChange={(e) => set({ ...v, 
notes: e.target.value })} placeholder="Login info, what it's for..." /></Field>
      </>),
    },
    achievement: {
      title: editing?.id ? "Edit achievement" : "Add achievement",
      key: "achievements",
      initial: { id: editing?.id || uid(), category: "Clubs / Organizations", 
entry: "", hours: "", ...editing },
      fields: (v, set) => (<>
        <Field label="Category"><Select options={ACHIEVEMENT_CATEGORIES} value={v.category} onChange={(e) => set({ ...v, category: e.target.value })} /></Field>
        <Field label="What do you want to log?"><TextArea autoFocus value={v.entry} onChange={(e) => set({ ...v, entry: e.target.value })} placeholder="Just write it in..." /></Field>
        {v.category === "Volunteer Hours" && (
          <Field label="Hours (optional)"><TextInput value={v.hours} onChange={(e) => set({ ...v, hours: e.target.value })} placeholder="12" /></Field>
        )}
      </>),
    },
  };
  const cfg = configs[type];
  const [v, setV] = useState(cfg.initial);
  return (
    <Modal title={cfg.title} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {cfg.fields(v, setV)}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", 
marginTop: 8 }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn onClick={() => onSave(cfg.key, v)}><Check size={14} />Save</Btn>
        </div>
      </div>
    </Modal>
  );
}
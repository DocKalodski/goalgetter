"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ChevronDown, ChevronUp, Mic, Square, Phone } from "lucide-react";

type EntryType = "oo" | "mm" | "cc" | "pp" | "aa";

interface JourneyEntry {
  id: string;
  entryType: EntryType;
  entryDate: string;
  weekNumber: number | null;
  win: string | null;
  committed: string | null;
  agenda: string | null;
  homework: string | null;
  meetingType: string | null;
  resolutions: string | null;
  meetingMinutes: string | null;
  callerName: string | null;
  calleeName: string | null;
  callStartTime: string | null;
  callEndTime: string | null;
  callDurationMins: number | null;
  callOutcome: string | null;
  eventName: string | null;
  moduleTopic: string | null;
  ppNotes: string | null;
  ppScoreNum: number | null;
  ppScoreDen: number | null;
  coachObservations: string | null;
  approvalStatus: string;
  createdAt: number;
}

const TYPE_META: Record<EntryType, { label: string; icon: string; color: string; bg: string; border: string }> = {
  oo: { label: "1-on-1",              icon: "🎯", color: "#818cf8", bg: "rgba(99,102,241,0.10)",  border: "#818cf8" },
  mm: { label: "Meeting Master",     icon: "👥", color: "#22c55e", bg: "rgba(34,197,94,0.10)",   border: "#22c55e" },
  cc: { label: "Call Center",        icon: "📞", color: "#f59e0b", bg: "rgba(245,158,11,0.10)",  border: "#f59e0b" },
  pp: { label: "Performance Points", icon: "⭐", color: "#f97316", bg: "rgba(249,115,22,0.10)",  border: "#f97316" },
  aa: { label: "AI Aider",           icon: "🤖", color: "#a78bfa", bg: "rgba(167,139,250,0.10)", border: "#a78bfa" },
};

interface CouncilMember { id: string; name: string; role: string; }

interface JourneyJournalTabProps {
  studentId: string;
  studentName: string;
  currentWeek: number;
  isCoach: boolean;
  preCallMinutes?: number | null;
}

function formatRelativeDate(dateStr: string): string {
  const today = new Date();
  const d = new Date(dateStr + "T00:00:00");
  const diffDays = Math.round((today.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return dateStr;
}

function computeDuration(start: string, end: string): number | null {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return null;
  const diff = (eh * 60 + em) - (sh * 60 + sm);
  return diff > 0 ? diff : null;
}

export function JourneyJournalTab({
  studentId, studentName, currentWeek, isCoach, preCallMinutes,
}: JourneyJournalTabProps) {
  const [entries, setEntries] = useState<JourneyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<EntryType | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<EntryType>("oo");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [councilMembers, setCouncilMembers] = useState<CouncilMember[]>([]);
  const [form, setForm] = useState<Record<string, string | number>>({});
  const [ttText, setTtText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parsedFields, setParsedFields] = useState<Record<string, string> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ studentId });
      if (filterType !== "all") params.set("type", filterType);
      const res = await fetch(`/api/journey/entries?${params}`);
      const data = await res.json();
      setEntries(data.entries || []);
    } finally {
      setLoading(false);
    }
  }, [studentId, filterType]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!isCoach) return;
    fetch(`/api/journey/council-members?studentId=${studentId}`)
      .then((r) => r.json())
      .then((d) => setCouncilMembers(d.members || []))
      .catch(() => {});
  }, [studentId, isCoach]);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    const handler = (event: MessageEvent) => {
      if (event.data?.type === "OPEN_JOURNAL") setShowForm(false);
    };
    navigator.serviceWorker.addEventListener("message", handler);
    return () => navigator.serviceWorker.removeEventListener("message", handler);
  }, []);

  const parseTT = async () => {
    if (!ttText.trim()) return;
    setParsing(true);
    try {
      const res = await fetch("/api/journey/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: ttText, entryType: formType }),
      });
      const data = await res.json();
      setParsedFields(data.fields || {});
    } finally {
      setParsing(false);
    }
  };

  const applyParsed = (approved: string[]) => {
    if (!parsedFields) return;
    const updates: Record<string, string> = {};
    approved.forEach((key) => { if (parsedFields[key]) updates[key] = parsedFields[key]; });
    setForm((f) => ({ ...f, ...updates }));
    setParsedFields(null);
  };

  const saveEntry = async () => {
    setSaving(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      await fetch("/api/journey/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId, entryType: formType,
          entryDate: form.entryDate || today,
          weekNumber: currentWeek, ...form, approvalStatus: "approved",
        }),
      });
      setShowForm(false);
      setForm({});
      setTtText("");
      setParsedFields(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  const openForm = (type: EntryType) => { setFormType(type); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setForm({}); setParsedFields(null); setTtText(""); };

  // Count per type for stats/badges
  const counts = (["oo","mm","cc","pp","aa"] as EntryType[]).reduce((acc, t) => {
    acc[t] = entries.filter((e) => e.entryType === t).length;
    return acc;
  }, {} as Record<EntryType, number>);

  const filtered = filterType === "all" ? entries : entries.filter((e) => e.entryType === filterType);

  // Group by week number for timeline
  const weekGroups: { week: number | null; entries: JourneyEntry[] }[] = [];
  for (const entry of filtered) {
    const last = weekGroups[weekGroups.length - 1];
    if (last && last.week === entry.weekNumber) {
      last.entries.push(entry);
    } else {
      weekGroups.push({ week: entry.weekNumber, entries: [entry] });
    }
  }

  return (
    <div className="space-y-4">
      {/* Pre-call alert */}
      {isCoach && preCallMinutes != null && preCallMinutes <= 15 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-amber-400/50 bg-amber-500/10">
          <Phone className="h-4 w-4 text-amber-500 flex-shrink-0 animate-pulse" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
              Group call in {preCallMinutes} minute{preCallMinutes !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Setup transcriptor · log as Meeting Master
            </p>
          </div>
          <button onClick={() => openForm("mm")}
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors flex-shrink-0">
            Open MM Entry
          </button>
        </div>
      )}

      {/* Header + stats */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-foreground">📔 Adventure Journal</h3>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {(["oo","mm","cc","pp","aa"] as EntryType[]).map((t) => {
              const m = TYPE_META[t];
              if (!counts[t]) return null;
              return (
                <button key={t} onClick={() => setFilterType(t)}
                  className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80"
                  style={{ color: m.color }}>
                  <span>{m.icon}</span>
                  <span>{counts[t]}</span>
                </button>
              );
            })}
            {entries.length > 0 && (
              <span className="text-xs text-muted-foreground">{entries.length} total</span>
            )}
          </div>
        </div>
        {isCoach && !showForm && (
          <button
            onClick={() => openForm(filterType === "all" || filterType === "aa" ? "oo" : filterType)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border hover:border-transparent transition-all flex-shrink-0"
            style={filterType !== "all" && filterType !== "aa"
              ? { background: TYPE_META[filterType].bg, color: TYPE_META[filterType].color }
              : { background: TYPE_META["oo"].bg, color: TYPE_META["oo"].color }}>
            + New {filterType !== "all" && filterType !== "aa" ? TYPE_META[filterType].label : "Entry"}
          </button>
        )}
      </div>

      {/* Type tabs — always visible; when form is open, clicking also switches form type */}
      <div className="flex gap-1.5 flex-wrap">
        {(["all", "oo", "mm", "cc", "pp", "aa"] as const).map((t) => {
          const meta = t === "all" ? null : TYPE_META[t];
          // When form open: active = current form type; when closed: active = filter
          const active = showForm ? (t !== "all" && formType === t) : filterType === t;
          const count = t === "all" ? entries.length : counts[t];
          const handleClick = () => {
            if (t === "all") { setFilterType("all"); }
            else if (showForm) { setFormType(t); setFilterType(t); }
            else { setFilterType(t); }
          };
          return (
            <button key={t} onClick={handleClick}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border flex items-center gap-1 ${
                active ? "border-transparent" : "border-border bg-muted/60 text-muted-foreground hover:text-foreground"
              }`}
              style={active ? { background: meta?.bg ?? "rgba(99,102,241,0.10)", color: meta?.color ?? "#818cf8" } : {}}>
              {t === "all" ? "All" : meta!.label}
              {count > 0 && (
                <span className={`rounded-full px-1 py-0.5 text-[10px] font-semibold leading-none ${
                  active ? "bg-white/20" : "bg-muted text-muted-foreground"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* New Entry Form */}
      {showForm && (
        <EntryForm
          formType={formType} setFormType={setFormType}
          form={form} setForm={setForm}
          ttText={ttText} setTtText={setTtText}
          parsedFields={parsedFields} parsing={parsing} saving={saving}
          councilMembers={councilMembers}
          onParse={parseTT} onApplyParsed={applyParsed}
          onSave={saveEntry} onCancel={closeForm}
        />
      )}

      {/* Timeline */}
      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map((i) => <div key={i} className="h-14 bg-muted/60 animate-pulse rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState filterType={filterType} isCoach={isCoach} onNew={openForm} />
      ) : (
        <div className="space-y-5">
          {weekGroups.map(({ week, entries: groupEntries }) => (
            <div key={week ?? "none"}>
              {/* Week header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-border/50" />
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-2">
                  {week ? (week === currentWeek ? `Week ${week} · Current` : `Week ${week}`) : "Undated"}
                </span>
                <div className="h-px flex-1 bg-border/50" />
              </div>

              {/* Entries with timeline line */}
              <div className="relative ml-3">
                {groupEntries.length > 1 && (
                  <div className="absolute left-0 top-4 bottom-4 w-px bg-border/40" />
                )}
                <div className="space-y-2">
                  {groupEntries.map((entry, idx) => {
                    const m = TYPE_META[entry.entryType];
                    return (
                      <div key={entry.id} className="flex gap-3">
                        {/* Timeline dot */}
                        <div className="relative flex-shrink-0 w-2 flex flex-col items-center pt-4">
                          <div className="w-2 h-2 rounded-full border-2 border-card flex-shrink-0 z-10"
                            style={{ backgroundColor: m.color }} />
                          {idx < groupEntries.length - 1 && (
                            <div className="flex-1 w-px mt-1" style={{ backgroundColor: m.color + "30" }} />
                          )}
                        </div>
                        {/* Card */}
                        <div className="flex-1 min-w-0">
                          <EntryCard
                            entry={entry}
                            expanded={expandedId === entry.id}
                            onToggle={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({ filterType, isCoach, onNew }: {
  filterType: EntryType | "all"; isCoach: boolean; onNew: (t: EntryType) => void;
}) {
  const messages: Record<EntryType, { title: string; sub: string }> = {
    oo: { title: "No 1-on-1 sessions yet", sub: "Log your first One & Only to start tracking WINs, commitments and homework." },
    mm: { title: "No council meetings logged", sub: "Record a Meeting Master entry to capture resolutions and minutes." },
    cc: { title: "No calls logged yet", sub: "Track every accountability call with a Call Center entry." },
    pp: { title: "No performance entries yet", sub: "Score modules and intensives with a Performance Points entry." },
    aa: { title: "No AI sessions yet", sub: "AI-assisted coaching sessions will appear here automatically." },
  };
  const msg = filterType !== "all" ? messages[filterType] : null;

  return (
    <div className="bg-card rounded-xl border border-border p-10 text-center space-y-4">
      <div className="text-4xl">{filterType !== "all" ? TYPE_META[filterType].icon : "📔"}</div>
      <div>
        <p className="text-sm font-semibold text-foreground">
          {msg?.title ?? "No entries yet"}
        </p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
          {msg?.sub ?? "Start logging coaching interactions — every entry builds the student's journey."}
        </p>
      </div>
      {isCoach && filterType !== "all" && filterType !== "aa" && (
        <button onClick={() => onNew(filterType as EntryType)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          style={{ background: TYPE_META[filterType as EntryType].bg, color: TYPE_META[filterType as EntryType].color }}>
          + New {TYPE_META[filterType as EntryType].label}
        </button>
      )}
      {isCoach && filterType === "all" && (
        <div className="flex justify-center gap-2 flex-wrap">
          {(["oo","mm","cc","pp"] as EntryType[]).map((t) => (
            <button key={t} onClick={() => onNew(t)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border hover:border-transparent transition-colors"
              style={{ background: TYPE_META[t].bg, color: TYPE_META[t].color }}>
              {TYPE_META[t].icon} {TYPE_META[t].label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Entry Card ──────────────────────────────────────────────────────────────

function EntryCard({ entry, expanded, onToggle }: {
  entry: JourneyEntry; expanded: boolean; onToggle: () => void;
}) {
  const meta = TYPE_META[entry.entryType];

  const preview = (() => {
    if (entry.entryType === "oo") {
      if (entry.win) return { label: "WIN", text: entry.win };
      if (entry.committed) return { label: "COMMITTED", text: entry.committed };
      return { label: "", text: "1on1 session" };
    }
    if (entry.entryType === "mm") return { label: entry.meetingType || "Meeting", text: entry.resolutions?.slice(0, 80) || entry.meetingMinutes?.slice(0, 80) || "Council meeting" };
    if (entry.entryType === "cc") return { label: `${entry.callerName || "?"} → ${entry.calleeName || "?"}`, text: entry.callOutcome?.slice(0, 70) || "Call logged" };
    if (entry.entryType === "pp") return { label: entry.eventName || entry.moduleTopic || "Session", text: entry.ppNotes?.slice(0, 70) || "Performance entry" };
    if (entry.entryType === "aa") return { label: "AI Session", text: "AI coaching interaction" };
    return { label: "", text: "" };
  })();

  return (
    <div className="rounded-xl border border-border overflow-hidden transition-all"
      style={{ borderLeftWidth: 3, borderLeftColor: meta.color, borderLeftStyle: "solid" }}>
      <button onClick={onToggle}
        className="w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-muted/20 transition-colors">
        {/* Icon */}
        <span className="text-base rounded-md px-1.5 py-0.5 flex-shrink-0 mt-0.5"
          style={{ background: meta.bg }}>{meta.icon}</span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold" style={{ color: meta.color }}>{meta.label}</span>
            {preview.label && <span className="text-xs text-muted-foreground">· {preview.label}</span>}
            {/* PP score pill */}
            {entry.entryType === "pp" && entry.ppScoreNum != null && entry.ppScoreDen != null && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: meta.bg, color: meta.color }}>
                {entry.ppScoreNum}/{entry.ppScoreDen}
              </span>
            )}
            {/* CC duration pill */}
            {entry.entryType === "cc" && entry.callDurationMins != null && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: meta.bg, color: meta.color }}>
                {entry.callDurationMins} min
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate leading-relaxed">
            {preview.text}
          </p>
        </div>

        {/* Date + chevron */}
        <div className="flex-shrink-0 flex flex-col items-end gap-1 ml-1">
          <span className="text-[10px] text-muted-foreground">{formatRelativeDate(entry.entryDate)}</span>
          {expanded
            ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
            : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border px-4 py-3" style={{ background: meta.bg + "50" }}>
          <EntryDetail entry={entry} />
        </div>
      )}
    </div>
  );
}

function EntryDetail({ entry }: { entry: JourneyEntry }) {
  const meta = TYPE_META[entry.entryType];

  const Block = ({ icon, label, value }: { icon: string; label: string; value: string | null | number }) => {
    if (!value) return null;
    return (
      <div className="bg-card/80 rounded-lg p-3 border border-border/60">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-sm">{icon}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: meta.color }}>{label}</span>
        </div>
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{String(value)}</p>
      </div>
    );
  };

  if (entry.entryType === "oo") return (
    <div className="grid grid-cols-1 gap-2">
      <Block icon="🏆" label="WIN" value={entry.win} />
      <Block icon="✅" label="COMMITTED" value={entry.committed} />
      <Block icon="📋" label="AGENDA" value={entry.agenda} />
      <Block icon="📚" label="HOMEWORK" value={entry.homework} />
    </div>
  );

  if (entry.entryType === "mm") return (
    <div className="grid grid-cols-1 gap-2">
      {entry.meetingType && (
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: meta.bg, color: meta.color }}>
            {entry.meetingType}
          </span>
          <span className="text-xs text-muted-foreground">{entry.entryDate}</span>
        </div>
      )}
      <Block icon="✅" label="Resolutions" value={entry.resolutions} />
      <Block icon="📝" label="Minutes" value={entry.meetingMinutes} />
    </div>
  );

  if (entry.entryType === "cc") return (
    <div className="grid grid-cols-1 gap-2">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-semibold text-foreground">{entry.callerName || "?"}</span>
        <span className="text-muted-foreground text-xs">→</span>
        <span className="text-sm font-semibold text-foreground">{entry.calleeName || "?"}</span>
        {entry.callStartTime && entry.callEndTime && (
          <span className="text-xs text-muted-foreground">{entry.callStartTime} – {entry.callEndTime}</span>
        )}
        {entry.callDurationMins != null && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: meta.bg, color: meta.color }}>
            {entry.callDurationMins} min
          </span>
        )}
      </div>
      <Block icon="💬" label="Outcome" value={entry.callOutcome} />
    </div>
  );

  if (entry.entryType === "pp") return (
    <div className="grid grid-cols-1 gap-2">
      {(entry.ppScoreNum != null && entry.ppScoreDen != null) && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold" style={{ color: meta.color }}>
            {entry.ppScoreNum}/{entry.ppScoreDen}
          </span>
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all"
              style={{ width: `${(entry.ppScoreNum / entry.ppScoreDen) * 100}%`, backgroundColor: meta.color }} />
          </div>
        </div>
      )}
      <Block icon="📋" label="Event" value={entry.eventName || entry.moduleTopic} />
      <Block icon="📝" label="Notes" value={entry.ppNotes} />
      <Block icon="👁" label="Observations" value={entry.coachObservations} />
    </div>
  );

  if (entry.entryType === "aa") return (
    <div className="grid grid-cols-1 gap-2">
      <Block icon="🤖" label="AI Summary" value={entry.meetingMinutes} />
    </div>
  );

  return null;
}

// ── Entry Form ──────────────────────────────────────────────────────────────

const FIELD_PLACEHOLDERS: Record<EntryType, Record<string, string>> = {
  oo: {
    win: "What did they accomplish or break through since the last session?",
    committed: "What specific action did they commit to? By when?",
    agenda: "What topics were discussed? What came up?",
    homework: "What are they taking away to complete before next session?",
  },
  mm: {
    meetingType: "coaches / council / client / facilitator",
    resolutions: "Key decisions the group agreed on…",
    meetingMinutes: "Summary of what was discussed, shared, decided…",
  },
  cc: {
    callerName: "Who initiated the call?",
    calleeName: "Who received the call?",
    callStartTime: "e.g. 09:00",
    callEndTime: "e.g. 09:23",
    callOutcome: "What was the result? Next steps?",
  },
  pp: {
    eventName: "e.g. Intensive Day 2 / Breakfast Session",
    moduleTopic: "e.g. Enrollment Mastery / The Committed Life",
    ppNotes: "Key notes, what landed, what the student did or said…",
    ppScoreNum: "e.g. 8",
    ppScoreDen: "e.g. 10",
    coachObservations: "Your observations as coach — energy, breakthroughs, concerns…",
  },
  aa: {},
};

function EntryForm({
  formType, setFormType, form, setForm, ttText, setTtText,
  parsedFields, parsing, saving, councilMembers, onParse, onApplyParsed, onSave, onCancel,
}: {
  formType: EntryType; setFormType: (t: EntryType) => void;
  form: Record<string, string | number>; setForm: (f: Record<string, string | number> | ((prev: Record<string, string | number>) => Record<string, string | number>)) => void;
  ttText: string; setTtText: (t: string) => void;
  parsedFields: Record<string, string> | null;
  parsing: boolean; saving: boolean;
  councilMembers: CouncilMember[];
  onParse: () => void; onApplyParsed: (approved: string[]) => void;
  onSave: () => void; onCancel: () => void;
}) {
  const [approvals, setApprovals] = useState<Record<string, boolean>>({});
  const [ttOpen, setTtOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const [currentSpeaker, setCurrentSpeaker] = useState<string>("Coach");
  const currentSpeakerRef = useRef<string>("Coach");
  const lastSpeakerRef = useRef<string | null>(null);

  // CC: auto-compute duration
  const startTime = (form.callStartTime as string) || "";
  const endTime = (form.callEndTime as string) || "";
  const autoDuration = startTime && endTime ? computeDuration(startTime, endTime) : null;
  useEffect(() => {
    if (autoDuration != null) setForm((f) => ({ ...f, callDurationMins: autoDuration }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime, endTime]);

  const updateSpeaker = (name: string) => { setCurrentSpeaker(name); currentSpeakerRef.current = name; };

  function startRecording() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) { setRecError("Speech recognition not supported. Try Chrome."); return; }
    setRecError(null);
    const rec = new SR();
    rec.continuous = true; rec.interimResults = true; rec.lang = "en-US";
    let finalText = ttText;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          if (formType === "mm") {
            const spk = currentSpeakerRef.current;
            const tag = spk !== lastSpeakerRef.current ? `\n[${spk}] ` : " ";
            finalText += tag + t;
            lastSpeakerRef.current = spk;
          } else {
            finalText += (finalText ? " " : "") + t;
          }
        } else { interim = t; }
      }
      setTtText(finalText.trimStart() + (interim ? " " + interim : ""));
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onerror = (e: any) => { setRecError(`Mic error: ${e.error}`); setRecording(false); };
    rec.onend = () => { setTtText(finalText.trimStart()); setRecording(false); };
    recognitionRef.current = rec; rec.start(); setRecording(true);
    setTtOpen(true);
  }

  function stopRecording() { recognitionRef.current?.stop(); setRecording(false); }

  const meta = TYPE_META[formType];
  const inputClass = "w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50";
  const placeholders = FIELD_PLACEHOLDERS[formType] || {};

  const field = (key: string, label: string, multiline = false, hint?: string) => (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      {hint && <p className="text-[11px] text-muted-foreground/70 italic">{hint}</p>}
      {multiline ? (
        <textarea rows={3} placeholder={placeholders[key] || ""}
          value={(form[key] as string) || ""}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          className={`${inputClass} resize-y`} />
      ) : (
        <input type="text" placeholder={placeholders[key] || ""}
          value={(form[key] as string) || ""}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          className={inputClass} />
      )}
    </div>
  );

  const renderFields = () => {
    if (formType === "oo") return (
      <div className="space-y-3">
        {field("win", "🏆 WIN", true)}
        {field("committed", "✅ COMMITTED", true)}
        {field("agenda", "📋 AGENDA", true)}
        {field("homework", "📚 HOMEWORK", true)}
      </div>
    );
    if (formType === "mm") return (
      <div className="space-y-3">
        {field("meetingType", "Meeting Type")}
        {field("resolutions", "✅ Resolutions", true)}
        {field("meetingMinutes", "📝 Minutes", true)}
      </div>
    );
    if (formType === "cc") return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {field("callerName", "Caller")}
          {field("calleeName", "Callee")}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {field("callStartTime", "Start Time")}
          {field("callEndTime", "End Time")}
        </div>
        {autoDuration != null && (
          <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: meta.color }}>
            <span>⏱</span>
            <span>Auto-computed: {autoDuration} minutes</span>
          </div>
        )}
        {field("callOutcome", "Outcome", true)}
      </div>
    );
    if (formType === "pp") return (
      <div className="space-y-3">
        {field("eventName", "Event Name")}
        {field("moduleTopic", "Module Topic")}
        {field("ppNotes", "Notes", true)}
        <div className="grid grid-cols-2 gap-3">
          {field("ppScoreNum", "Score (X)")}
          {field("ppScoreDen", "Out of (Y)")}
        </div>
        {(form.ppScoreNum && form.ppScoreDen) ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold" style={{ color: meta.color }}>
              {form.ppScoreNum}/{form.ppScoreDen}
            </span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{
                width: `${(Number(form.ppScoreNum) / Number(form.ppScoreDen)) * 100}%`,
                backgroundColor: meta.color
              }} />
            </div>
          </div>
        ) : null}
        {field("coachObservations", "Coach Observations", true)}
      </div>
    );
    return null;
  };

  const speakers = ["Coach", ...councilMembers.map((m) => m.name)];
  const parsedKeys = parsedFields ? Object.keys(parsedFields).filter((k) => parsedFields![k]) : [];

  return (
    <div className="rounded-xl border-2 overflow-hidden" style={{ borderColor: meta.color + "50" }}>
      {/* Form header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border"
        style={{ background: meta.bg }}>
        <div className="flex items-center gap-2">
          <span className="text-base">{meta.icon}</span>
          <span className="text-sm font-bold" style={{ color: meta.color }}>New {meta.label}</span>
        </div>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none">×</button>
      </div>

      <div className="bg-card p-4 space-y-4">
        {/* MM: Speaker Tap */}
        {formType === "mm" && speakers.length > 1 && (
          <div className="rounded-lg border border-green-400/30 bg-green-500/5 p-3 space-y-2">
            <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">
              👥 Speaker Tap
            </p>
            <div className="flex flex-wrap gap-1.5">
              {speakers.map((spk) => (
                <button key={spk} type="button" onClick={() => updateSpeaker(spk)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                    currentSpeaker === spk
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-border bg-muted text-muted-foreground hover:border-green-400"
                  }`}>
                  {currentSpeaker === spk && "● "}{spk}
                </button>
              ))}
            </div>
            {recording && (
              <p className="text-xs text-green-600 font-medium">
                Recording: [{currentSpeaker}] speaking
              </p>
            )}
          </div>
        )}

        {/* Form fields */}
        {renderFields()}

        {/* Date (subtle, defaults to today) */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground font-medium">Date:</label>
          <input type="date"
            value={(form.entryDate as string) || new Date().toISOString().split("T")[0]}
            onChange={(e) => setForm({ ...form, entryDate: e.target.value })}
            className="text-xs border border-border rounded-md px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>

        {/* TT — collapsible */}
        <div className={`rounded-lg border transition-colors ${recording ? "border-red-400/40 bg-red-500/5" : "border-border bg-muted/30"}`}>
          <button type="button" onClick={() => setTtOpen(!ttOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                🎙 Talk Time Transcript
              </span>
              {recording && (
                <span className="flex items-center gap-1 text-xs text-red-500 font-bold animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> REC
                </span>
              )}
              {ttText.trim() && !recording && (
                <span className="text-xs text-muted-foreground">({ttText.trim().split(/\s+/).length} words)</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={(e) => { e.stopPropagation(); recording ? stopRecording() : startRecording(); }}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
                  recording ? "bg-red-500 text-white" : "bg-muted border border-border text-muted-foreground hover:text-foreground"
                }`}>
                {recording ? <><Square className="h-2.5 w-2.5" /> Stop</> : <><Mic className="h-2.5 w-2.5" /> Record</>}
              </button>
              {ttOpen ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
            </div>
          </button>

          {(ttOpen || recording) && (
            <div className="px-3 pb-3 space-y-2 border-t border-border">
              {recError && <p className="text-xs text-destructive pt-2">{recError}</p>}
              <textarea rows={4}
                placeholder={recording ? `Listening… [${currentSpeaker}]` : "Paste or record transcript — AI will parse it into fields above"}
                value={ttText}
                onChange={(e) => setTtText(e.target.value)}
                className="w-full text-xs bg-transparent border-none text-muted-foreground placeholder:text-muted-foreground/40 focus:outline-none resize-y font-mono pt-2" />
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={onParse} disabled={!ttText.trim() || parsing}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    ttText.trim() && !parsing ? "bg-primary/15 text-primary hover:bg-primary/25" : "bg-muted text-muted-foreground/50 cursor-not-allowed"
                  }`}>
                  {parsing ? "Parsing…" : "✨ Parse with AI"}
                </button>
                {ttText.trim() && (
                  <button type="button" onClick={() => setTtText("")}
                    className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
                )}
                {formType === "mm" && ttText.includes("[") && (
                  <span className="text-xs text-green-600 font-medium">✓ Speaker-attributed</span>
                )}
              </div>

              {/* AI approval panel */}
              {parsedFields && parsedKeys.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Select fields to apply:
                  </p>
                  {parsedKeys.map((key) => (
                    <label key={key} className="flex items-start gap-2 cursor-pointer">
                      <input type="checkbox" checked={approvals[key] || false}
                        onChange={() => setApprovals((a) => ({ ...a, [key]: !a[key] }))}
                        className="mt-0.5 accent-primary" />
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">{key}: </span>
                        <span className="text-xs text-foreground">{parsedFields[key]}</span>
                      </div>
                    </label>
                  ))}
                  <div className="flex gap-2 flex-wrap pt-1">
                    <button onClick={() => onApplyParsed(Object.keys(approvals).filter((k) => approvals[k]))}
                      className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">
                      Apply Selected
                    </button>
                    <button onClick={() => { const all: Record<string,boolean> = {}; parsedKeys.forEach((k) => { all[k]=true; }); setApprovals(all); onApplyParsed(parsedKeys); }}
                      className="px-2.5 py-1 rounded-lg bg-muted text-foreground text-xs font-medium hover:bg-muted/70 transition-colors">
                      Approve All
                    </button>
                    <button onClick={() => { setApprovals({}); onApplyParsed([]); }}
                      className="px-2.5 py-1 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors">
                      Reject All
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Save / Cancel */}
        <div className="flex gap-2 pt-1">
          <button onClick={onSave} disabled={saving}
            className="flex-1 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-60"
            style={{ background: meta.color, color: "white" }}>
            {saving ? "Saving…" : `Save ${meta.label}`}
          </button>
          <button onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

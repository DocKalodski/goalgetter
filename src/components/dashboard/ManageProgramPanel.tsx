"use client";

import { useState, useEffect } from "react";
import { getProgramSettings, saveProgramSettings, ProgramSettings, ProgramEvent, WeeklyTargetRange } from "@/lib/actions/program";
import {
  Calendar,
  Clock,
  Target,
  Zap,
  Coffee,
  Users,
  Plus,
  X,
  Save,
  ChevronDown,
  ChevronUp,
  Wand2,
  Star,
} from "lucide-react";

const DAYS = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

const WEEKDAY_OPTIONS = [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
];

type SectionKey = "structure" | "intensives" | "breakfasts" | "events" | "meetings" | "targets";

export function ManageProgramPanel({ initialOpenSection }: { initialOpenSection?: SectionKey } = {}) {
  const [settings, setSettings] = useState<ProgramSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<Record<SectionKey, boolean>>({
    structure: true,
    intensives: true,
    breakfasts: true,
    events: true,
    meetings: true,
    targets: true,
  });

  useEffect(() => {
    getProgramSettings()
      .then(setSettings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function toggle(section: SectionKey) {
    setOpen((o) => ({ ...o, [section]: !o[section] }));
  }

  function set<K extends keyof ProgramSettings>(key: K, value: ProgramSettings[K]) {
    setSettings((s) => s ? { ...s, [key]: value } : s);
  }

  function addDate(field: "intensiveDates" | "breakfastDates") {
    setSettings((s) => {
      if (!s) return s;
      return { ...s, [field]: [...s[field], ""] };
    });
  }

  function updateDate(field: "intensiveDates" | "breakfastDates", idx: number, value: string) {
    setSettings((s) => {
      if (!s) return s;
      const arr = [...s[field]];
      arr[idx] = value;
      return { ...s, [field]: arr };
    });
  }

  function removeDate(field: "intensiveDates" | "breakfastDates", idx: number) {
    setSettings((s) => {
      if (!s) return s;
      return { ...s, [field]: s[field].filter((_, i) => i !== idx) };
    });
  }

  // ── Events helpers ──────────────────────────────────────────────────────────
  function addEvent() {
    setSettings((s) => {
      if (!s) return s;
      const newEvent: ProgramEvent = {
        id: typeof crypto !== "undefined" ? crypto.randomUUID() : `evt-${Date.now()}`,
        name: "",
        date: "",
      };
      return { ...s, events: [...s.events, newEvent] };
    });
  }

  function updateEvent(idx: number, field: "name" | "date", value: string) {
    setSettings((s) => {
      if (!s) return s;
      const arr = [...s.events];
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...s, events: arr };
    });
  }

  function removeEvent(idx: number) {
    setSettings((s) => {
      if (!s) return s;
      return { ...s, events: s.events.filter((_, i) => i !== idx) };
    });
  }

  function updateCallTime(day: string, value: string) {
    setSettings((s) => {
      if (!s) return s;
      return { ...s, callTimes: { ...s.callTimes, [day]: value } };
    });
  }

  const [targetMode, setTargetMode] = useState<"auto" | "manual">("manual");

  function updateWeeklyTarget(week: string, field: "min" | "max", value: string) {
    const num = parseInt(value, 10);
    setSettings((s) => {
      if (!s) return s;
      const current = s.weeklyTargets[week] ?? { min: 0, max: 0 };
      return {
        ...s,
        weeklyTargets: {
          ...s.weeklyTargets,
          [week]: { ...current, [field]: isNaN(num) ? 0 : Math.min(100, Math.max(0, num)) },
        },
      };
    });
  }

  function autoGenerateTargets() {
    if (!settings) return;
    const total = settings.totalWeeks;
    const last = total - 1;
    const targets: Record<string, WeeklyTargetRange> = {};
    for (let w = 2; w < total; w++) {
      const mid = Math.round(((w - 1) / last) * 100);
      targets[String(w)] = {
        min: Math.max(0, mid - 2),
        max: Math.min(100, mid + 2),
      };
    }
    setSettings((s) => s ? { ...s, weeklyTargets: targets } : s);
  }

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const cleaned = {
        ...settings,
        intensiveDates: settings.intensiveDates.filter(Boolean),
        breakfastDates: settings.breakfastDates.filter(Boolean),
        events: settings.events.filter((e) => e.name.trim() && e.date),
      };
      await saveProgramSettings(cleaned);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="h-32 bg-muted animate-pulse rounded-xl" />;
  if (!settings) return null;

  const SectionHeader = ({
    id, icon: Icon, title, count, onQuickAdd,
  }: {
    id: SectionKey;
    icon: React.ElementType;
    title: string;
    count?: string;
    onQuickAdd?: () => void;
  }) => (
    <div className="flex items-center w-full">
      <button
        type="button"
        onClick={() => toggle(id)}
        className="flex-1 flex items-center justify-between py-2.5 px-1 text-left group"
      >
        <span className="flex items-center gap-2 font-medium text-sm">
          <Icon className="h-4 w-4 text-primary" />
          {title}
          {count && <span className="text-xs text-muted-foreground font-normal">{count}</span>}
        </span>
        {open[id] ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {onQuickAdd && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onQuickAdd(); if (!open[id]) toggle(id); }}
          className="ml-2 flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> Add Event
        </button>
      )}
    </div>
  );

  const weeks = Array.from({ length: settings.totalWeeks }, (_, i) => i + 1);

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Program Settings</h3>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save All"}
        </button>
      </div>

      {error && (
        <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-lg mb-3">
          {error}
        </div>
      )}

      {/* ── Section 1: Program Structure ── */}
      <div className="border-t border-border">
        <SectionHeader id="structure" icon={Calendar} title="Program Structure" />
        {open.structure && (
          <div className="pb-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Total Weeks</label>
                <input
                  type="number"
                  min={1}
                  max={52}
                  value={settings.totalWeeks}
                  onChange={(e) => set("totalWeeks", parseInt(e.target.value) || 12)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Current Week</label>
                <input
                  type="number"
                  min={1}
                  max={settings.totalWeeks}
                  value={settings.currentWeek}
                  onChange={(e) => set("currentWeek", parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Batch Start</label>
                <input
                  type="date"
                  value={settings.startDate}
                  onChange={(e) => set("startDate", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Batch End</label>
                <input
                  type="date"
                  value={settings.endDate}
                  onChange={(e) => set("endDate", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Section 2: Intensives ── */}
      <div className="border-t border-border">
        <SectionHeader
          id="intensives"
          icon={Zap}
          title="Intensives"
          count={`(${settings.intensiveDates.length})`}
        />
        {open.intensives && (
          <div className="pb-4 space-y-2">
            {settings.intensiveDates.map((date, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => updateDate("intensiveDates", i, e.target.value)}
                  className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => removeDate("intensiveDates", i)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addDate("intensiveDates")}
              className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              <Plus className="h-4 w-4" /> Add Intensive Date
            </button>
          </div>
        )}
      </div>

      {/* ── Section 3: Breakfasts ── */}
      <div className="border-t border-border">
        <SectionHeader
          id="breakfasts"
          icon={Coffee}
          title="Breakfasts"
          count={`(${settings.breakfastDates.length})`}
        />
        {open.breakfasts && (
          <div className="pb-4 space-y-2">
            {settings.breakfastDates.map((date, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => updateDate("breakfastDates", i, e.target.value)}
                  className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => removeDate("breakfastDates", i)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addDate("breakfastDates")}
              className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              <Plus className="h-4 w-4" /> Add Breakfast Date
            </button>
          </div>
        )}
      </div>

      {/* ── Section 4: Events ── */}
      <div className="border-t border-border">
        <SectionHeader
          id="events"
          icon={Star}
          title="Events"
          count={`(${settings.events.length})`}
          onQuickAdd={addEvent}
        />
        {open.events && (
          <div className="pb-4 space-y-2">
            <p className="text-xs text-muted-foreground mb-3">
              Add special events with a name and date — they automatically appear as attendance slots in the weekly tracker.
            </p>
            {settings.events.map((event, i) => (
              <div key={event.id} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Event name (e.g. Leadership Summit)"
                  value={event.name}
                  onChange={(e) => updateEvent(i, "name", e.target.value)}
                  className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="date"
                  value={event.date}
                  onChange={(e) => updateEvent(i, "date", e.target.value)}
                  className="w-44 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => removeEvent(i)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addEvent}
              className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              <Plus className="h-4 w-4" /> Add Event
            </button>
          </div>
        )}
      </div>

      {/* ── Section 5: Meetings & Call Times ── */}
      <div className="border-t border-border">
        <SectionHeader id="meetings" icon={Users} title="Meetings & Call Times" />
        {open.meetings && (
          <div className="pb-4 space-y-5">
            {/* Weekly meeting */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Weekly Group Meeting</p>
              <div className="flex items-center gap-3">
                <select
                  value={settings.weeklyMeetingDay}
                  onChange={(e) => set("weeklyMeetingDay", e.target.value)}
                  className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">— Select day —</option>
                  {WEEKDAY_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </option>
                  ))}
                </select>
                <input
                  type="time"
                  value={settings.weeklyMeetingTime}
                  onChange={(e) => set("weeklyMeetingTime", e.target.value)}
                  className="w-32 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Daily call times */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Daily Call Times</p>
              <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                {DAYS.map(({ key, label }) => (
                  <div key={key} className="space-y-1">
                    <label className="text-xs text-muted-foreground text-center block">{label}</label>
                    <input
                      type="time"
                      value={settings.callTimes[key] ?? ""}
                      onChange={(e) => updateCallTime(key, e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Leave blank to skip that day.</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Section 6: Weekly Targets ── */}
      <div className="border-t border-border">
        <SectionHeader id="targets" icon={Target} title="Weekly Targets (%)" />
        {open.targets && (
          <div className="pb-4">
            {/* Mode toggle + auto-generate */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground">
                Set the expected cumulative progress range per week.
                W1 = Action Plan, W{settings.totalWeeks} = Program Complete.
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex rounded-lg border border-border overflow-hidden text-xs">
                  <button
                    type="button"
                    onClick={() => setTargetMode("auto")}
                    className={`px-3 py-1.5 transition-colors ${targetMode === "auto" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
                  >
                    Auto
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetMode("manual")}
                    className={`px-3 py-1.5 transition-colors ${targetMode === "manual" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}
                  >
                    Manual
                  </button>
                </div>
                {targetMode === "auto" && (
                  <button
                    type="button"
                    onClick={autoGenerateTargets}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors"
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    Generate
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {weeks.map((w) => {
                const isFirst = w === 1;
                const isLast = w === settings.totalWeeks;
                const range = settings.weeklyTargets[String(w)] ?? { min: 0, max: 0 };
                return (
                  <div key={w} className="space-y-1">
                    <label className="text-xs text-muted-foreground text-center block">W{w}</label>
                    {isFirst || isLast ? (
                      <div className="w-full px-2 py-2 text-xs bg-muted text-muted-foreground rounded-lg text-center">
                        {isFirst ? "Plan" : "Done"}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="relative">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={range.min}
                            readOnly={targetMode === "auto"}
                            onChange={(e) => updateWeeklyTarget(String(w), "min", e.target.value)}
                            className="w-full px-1.5 py-1 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center read-only:opacity-60 read-only:cursor-default"
                          />
                          <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground pointer-events-none">%</span>
                        </div>
                        <div className="text-[9px] text-muted-foreground text-center">–</div>
                        <div className="relative">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={range.max}
                            readOnly={targetMode === "auto"}
                            onChange={(e) => updateWeeklyTarget(String(w), "max", e.target.value)}
                            className="w-full px-1.5 py-1 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center read-only:opacity-60 read-only:cursor-default"
                          />
                          <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground pointer-events-none">%</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { createCouncil, getUnassignedStudents, assignStudentsToCouncil } from "@/lib/actions/councils";
import { getCoaches } from "@/lib/actions/user-management";
import { Users, X, Search, UserPlus, Check, ChevronRight } from "lucide-react";

interface AddCouncilPanelProps {
  batchId: string;
  onCouncilAdded: () => void;
  onCancel: () => void;
}

type Student = { id: string; name: string | null; email: string };

export function AddCouncilPanel({ batchId, onCouncilAdded, onCancel }: AddCouncilPanelProps) {
  const [coaches, setCoaches] = useState<{ id: string; name: string | null; email: string }[]>([]);
  const [formData, setFormData] = useState({ name: "", theme: "", coachId: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Phase 2: add students after council created
  const [createdCouncilId, setCreatedCouncilId] = useState<string | null>(null);
  const [unassigned, setUnassigned] = useState<Student[]>([]);
  const [selected, setSelected] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [savingStudents, setSavingStudents] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getCoaches()
      .then((all) => setCoaches(all.filter((c) => c.approvalStatus === "approved")))
      .catch(() => setCoaches([]));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.coachId) { setError("Please select a coach."); return; }
    setSubmitting(true);
    setError(null);
    try {
      const result = await createCouncil({ name: formData.name, theme: formData.theme || undefined, coachId: formData.coachId, batchId });
      setCreatedCouncilId(result.id);
      // Load unassigned students for phase 2
      const students = await getUnassignedStudents();
      setUnassigned(students);
      setTimeout(() => searchRef.current?.focus(), 100);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create council");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveStudents() {
    if (!createdCouncilId) return;
    setSavingStudents(true);
    try {
      if (selected.length > 0) {
        await assignStudentsToCouncil(createdCouncilId, selected.map((s) => s.id));
      }
      onCouncilAdded();
    } catch {
      setSavingStudents(false);
    }
  }

  function toggleStudent(s: Student) {
    setSelected((prev) =>
      prev.find((x) => x.id === s.id) ? prev.filter((x) => x.id !== s.id) : [...prev, s]
    );
  }

  const filtered = unassigned.filter((s) => {
    const q = search.toLowerCase();
    return (s.name ?? s.email).toLowerCase().includes(q);
  });

  // ── Phase 2: Add Students ──────────────────────────────────────────────────
  if (createdCouncilId) {
    return (
      <div className="bg-muted/40 rounded-xl border border-border p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">Add Students to <span className="text-primary">{formData.name}</span></p>
          </div>
          <span className="text-xs text-muted-foreground">You can also add students later</span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search students by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Selected chips */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selected.map((s) => (
              <span key={s.id} className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/30">
                {s.name || s.email}
                <button type="button" onClick={() => toggleStudent(s)} className="hover:text-destructive transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Student list */}
        <div className="max-h-52 overflow-y-auto rounded-lg border border-border divide-y divide-border">
          {filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">
              {unassigned.length === 0 ? "All students are already in councils." : "No matches found."}
            </p>
          ) : (
            filtered.map((s) => {
              const isSelected = !!selected.find((x) => x.id === s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleStudent(s)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${isSelected ? "bg-primary/8 hover:bg-primary/12" : "bg-card hover:bg-muted/60"}`}
                >
                  <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${isSelected ? "bg-primary border-primary" : "border-border bg-background"}`}>
                    {isSelected && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="text-sm font-medium block truncate">{s.name || s.email}</span>
                    {s.name && <span className="text-xs text-muted-foreground">{s.email}</span>}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveStudents}
            disabled={savingStudents}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            {savingStudents ? "Saving…" : `Add ${selected.length > 0 ? `${selected.length} Student${selected.length > 1 ? "s" : ""}` : "Students"}`}
          </button>
          <button
            type="button"
            onClick={onCouncilAdded}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now <ChevronRight className="h-3.5 w-3.5 inline" />
          </button>
        </div>
      </div>
    );
  }

  // ── Phase 1: Create Council ────────────────────────────────────────────────
  return (
    <div className="bg-muted/40 rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">New Council</p>
        </div>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-lg">{error}</div>
      )}

      <form onSubmit={handleCreate} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Council Name"
            value={formData.name}
            onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
            className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <input
            type="text"
            placeholder="Motto: Unstoppable Love… Whatever it takes!"
            value={formData.theme}
            onChange={(e) => setFormData((f) => ({ ...f, theme: e.target.value }))}
            className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            value={formData.coachId}
            onChange={(e) => setFormData((f) => ({ ...f, coachId: e.target.value }))}
            className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Select Coach…</option>
            {coaches.map((c) => (
              <option key={c.id} value={c.id}>{c.name || c.email}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Creating…" : "Create Council"}
            {!submitting && <ChevronRight className="h-4 w-4" />}
          </button>
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

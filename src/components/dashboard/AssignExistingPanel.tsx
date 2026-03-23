"use client";

import { useState, useEffect, useRef } from "react";
import { getUnassignedStudents, assignStudentsToCouncil } from "@/lib/actions/councils";
import { UserPlus, X, Search, Check } from "lucide-react";

interface AssignExistingPanelProps {
  councilId: string;
  onAssigned: () => void;
  onClose: () => void;
}

type Student = { id: string; name: string | null; email: string };

export function AssignExistingPanel({ councilId, onAssigned, onClose }: AssignExistingPanelProps) {
  const [unassigned, setUnassigned] = useState<Student[]>([]);
  const [selected, setSelected] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getUnassignedStudents()
      .then(setUnassigned)
      .catch(() => setUnassigned([]))
      .finally(() => {
        setLoading(false);
        setTimeout(() => searchRef.current?.focus(), 100);
      });
  }, []);

  function toggleStudent(s: Student) {
    setSelected((prev) =>
      prev.find((x) => x.id === s.id) ? prev.filter((x) => x.id !== s.id) : [...prev, s]
    );
  }

  async function handleAssign() {
    if (selected.length === 0) return;
    setSaving(true);
    try {
      await assignStudentsToCouncil(councilId, selected.map((s) => s.id));
      onAssigned();
    } catch {
      setSaving(false);
    }
  }

  const filtered = unassigned.filter((s) => {
    const q = search.toLowerCase();
    return (s.name ?? s.email).toLowerCase().includes(q);
  });

  return (
    <div className="bg-muted/40 rounded-xl border border-border p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">Assign Students to Council</p>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-4 w-4" />
        </button>
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
        {loading ? (
          <p className="text-xs text-muted-foreground text-center py-6">Loading students…</p>
        ) : filtered.length === 0 ? (
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
          onClick={handleAssign}
          disabled={saving || selected.length === 0}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          {saving ? "Assigning…" : `Assign ${selected.length > 0 ? `${selected.length} Student${selected.length > 1 ? "s" : ""}` : "Students"}`}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

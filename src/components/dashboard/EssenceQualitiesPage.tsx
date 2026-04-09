"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Plus, X, Search, Sparkles } from "lucide-react";
import { useNavigation } from "@/components/layout/DashboardShell";

import { ESSENCE_CATEGORIES, CUSTOM_QUALITIES_KEY } from "@/lib/data/essence-qualities";
import type { EssenceQuality } from "@/lib/data/essence-qualities";

const STORAGE_KEY = CUSTOM_QUALITIES_KEY;

// ─── Component ────────────────────────────────────────────────────────────────

export function EssenceQualitiesPage() {
  const { setCurrentPage } = useNavigation();

  const [search, setSearch] = useState("");
  const [customQualities, setCustomQualities] = useState<EssenceQuality[]>([]);
  const [newName, setNewName] = useState("");
  const [newDef, setNewDef] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [error, setError] = useState("");

  // Load custom qualities from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setCustomQualities(JSON.parse(stored));
    } catch {
      // ignore parse errors
    }
  }, []);

  function saveCustom(updated: EssenceQuality[]) {
    setCustomQualities(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function handleAdd() {
    const name = newName.trim().toUpperCase();
    const definition = newDef.trim();
    if (!name) { setError("EssenceQuality name is required."); return; }
    const allNames = [
      ...ESSENCE_CATEGORIES.flatMap(c => c.qualities.map(q => q.name)),
      ...customQualities.map(q => q.name),
    ];
    if (allNames.includes(name)) { setError("That quality already exists."); return; }
    const updated = [...customQualities, { name, definition }];
    saveCustom(updated);
    setNewName("");
    setNewDef("");
    setAddOpen(false);
    setError("");
  }

  function handleRemove(name: string) {
    saveCustom(customQualities.filter(q => q.name !== name));
  }

  const q = search.toLowerCase();

  function filterQualities(qualities: EssenceQuality[]) {
    if (!q) return qualities;
    return qualities.filter(
      ({ name, definition }) =>
        name.toLowerCase().includes(q) || definition.toLowerCase().includes(q)
    );
  }

  const filteredCategories = ESSENCE_CATEGORIES.map(cat => ({
    ...cat,
    qualities: filterQualities(cat.qualities),
  })).filter(cat => cat.qualities.length > 0 || cat.label.toLowerCase().includes(q));

  const filteredCustom = filterQualities(customQualities);

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCurrentPage("L3")}
          className="p-1.5 rounded-md hover:bg-muted"
          title="Back"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-yellow-500" />
          <h1 className="text-2xl font-bold text-foreground">Essence Qualities</h1>
        </div>
      </div>

      <p className="text-sm text-muted-foreground -mt-2">
        45 qualities across 9 categories · ©2025 Miracle Warriors Foundation
      </p>

      {/* ── Search ── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search qualities or definitions…"
          className="w-full pl-9 pr-4 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            title="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Category cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map(cat => (
          <div
            key={cat.label}
            className={`rounded-lg border-l-4 border border-border bg-card p-4 space-y-3 ${cat.color}`}
          >
            <h2 className={`text-xs font-bold uppercase tracking-wider ${cat.headerColor}`}>
              {cat.label}
            </h2>
            <ul className="space-y-2">
              {cat.qualities.map(q => (
                <li key={q.name}>
                  <span className="font-semibold text-sm text-foreground">{q.name}</span>
                  <span className="text-muted-foreground text-sm"> — </span>
                  <span className="text-sm text-muted-foreground italic">{q.definition}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* ── My Own Qualities card ── */}
        <div className="rounded-lg border-l-4 border border-border bg-card p-4 space-y-3 border-l-gray-400 dark:border-l-gray-500">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
            My Own Qualities
          </h2>

          {filteredCustom.length > 0 ? (
            <ul className="space-y-2">
              {filteredCustom.map(q => (
                <li key={q.name} className="flex items-start gap-2 group">
                  <div className="flex-1">
                    <span className="font-semibold text-sm text-foreground">{q.name}</span>
                    {q.definition && (
                      <>
                        <span className="text-muted-foreground text-sm"> — </span>
                        <span className="text-sm text-muted-foreground italic">{q.definition}</span>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(q.name)}
                    className="mt-0.5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive shrink-0"
                    title="Remove"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            !addOpen && (
              <p className="text-xs text-muted-foreground italic">
                No custom qualities yet.
              </p>
            )
          )}

          {/* Add form */}
          {addOpen ? (
            <div className="space-y-2 pt-1">
              <input
                type="text"
                value={newName}
                onChange={e => { setNewName(e.target.value); setError(""); }}
                placeholder="EssenceQuality name (e.g. PLAYFUL)"
                className="w-full px-3 py-1.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
              <input
                type="text"
                value={newDef}
                onChange={e => setNewDef(e.target.value)}
                placeholder="Definition (optional)"
                className="w-full px-3 py-1.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                onKeyDown={e => { if (e.key === "Enter") handleAdd(); }}
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAdd}
                  className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => { setAddOpen(false); setError(""); setNewName(""); setNewDef(""); }}
                  className="px-3 py-1.5 rounded-md border border-input text-xs text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mt-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Add your own
            </button>
          )}
        </div>
      </div>

      {filteredCategories.length === 0 && filteredCustom.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-12">
          No qualities match &quot;{search}&quot;
        </p>
      )}
    </div>
  );
}

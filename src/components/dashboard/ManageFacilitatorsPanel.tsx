"use client";

import { useState, useEffect, useCallback } from "react";
import { getFacilitators, addFacilitator, updateFacilitator, deleteFacilitator } from "@/lib/actions/user-management";
import { UserPlus, Pencil, Trash2, Check, AlertTriangle } from "lucide-react";

interface Facilitator {
  id: string;
  name: string | null;
  email: string;
}

interface Props {
  refreshKey?: number;
  onChanged?: () => void;
}

export function ManageFacilitatorsPanel({ refreshKey = 0, onChanged }: Props) {
  const [facis, setFacis] = useState<Facilitator[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", email: "", password: "" });
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try { setFacis(await getFacilitators()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { reload(); }, [reload, refreshKey]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true); setAddError(null);
    try {
      const res = await addFacilitator(addForm);
      if (!res.success) { setAddError(res.error || "Failed"); return; }
      setShowAdd(false); setAddForm({ name: "", email: "", password: "" });
      await reload(); onChanged?.();
    } catch (err) { setAddError(err instanceof Error ? err.message : "Failed"); }
    finally { setAdding(false); }
  }

  async function handleSaveEdit(id: string) {
    setSavingId(id); setEditError(null);
    try {
      const res = await updateFacilitator(id, editForm);
      if (!res.success) { setEditError(res.error || "Failed"); return; }
      setEditingId(null); await reload(); onChanged?.();
    } finally { setSavingId(null); }
  }

  async function handleDelete(id: string) {
    setDeletingId(id); setDeleteError(null);
    try {
      const res = await deleteFacilitator(id);
      if (!res.success) { setDeleteError(res.error || "Failed"); setConfirmDeleteId(null); return; }
      setConfirmDeleteId(null); await reload(); onChanged?.();
    } finally { setDeletingId(null); }
  }

  if (loading) return (
    <div className="space-y-3">
      {[1, 2].map((i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {facis.length} facilitator{facis.length !== 1 ? "s" : ""} · Facilitators have read-only access to all councils
        </p>
        <button
          onClick={() => { setShowAdd((v) => !v); setAddError(null); }}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            showAdd ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary hover:bg-primary/20"
          }`}
        >
          <UserPlus className="h-3.5 w-3.5" />
          Add Facilitator
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">New Facilitator</p>
          {addError && <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{addError}</p>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input type="text" placeholder="Full Name" required value={addForm.name}
              onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
              className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            <input type="email" placeholder="Email" required value={addForm.email}
              onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
              className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            <input type="password" placeholder="Password (min 8)" required minLength={8} value={addForm.password}
              onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))}
              className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={adding}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {adding ? "Adding…" : <><UserPlus className="h-3.5 w-3.5" /> Add Facilitator</>}
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {deleteError && <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{deleteError}</p>}

      {facis.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <p className="text-2xl">🧑‍💼</p>
          <p className="text-sm text-muted-foreground">No facilitators yet. Add one above.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {facis.map((faci) => {
            const isEditing = editingId === faci.id;
            const isSaving = savingId === faci.id;
            const isConfirmDelete = confirmDeleteId === faci.id;
            const isDeleting = deletingId === faci.id;

            return (
              <div key={faci.id} className="rounded-xl border border-border overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 bg-card">
                  <div className="w-9 h-9 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-secondary-foreground">
                      {(faci.name || faci.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold">{faci.name || faci.email}</span>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{faci.email}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
                    Facilitator
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button type="button" onClick={() => { setEditingId(isEditing ? null : faci.id); setEditForm({ name: faci.name || "", email: faci.email }); setEditError(null); }}
                      className={`p-1.5 rounded-md border transition-colors ${isEditing ? "bg-primary/10 text-primary border-primary/30" : "bg-muted border-border text-muted-foreground hover:bg-muted/70"}`}>
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => setConfirmDeleteId(isConfirmDelete ? null : faci.id)}
                      className={`p-1.5 rounded-lg transition-colors ${isConfirmDelete ? "bg-destructive/10 text-destructive" : "hover:bg-muted text-muted-foreground hover:text-destructive"}`}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {isEditing && (
                  <div className="border-t border-border bg-muted/20 px-4 py-3 space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Edit Facilitator</p>
                    {editError && <p className="text-xs text-destructive bg-destructive/10 rounded px-2 py-1">{editError}</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input type="text" placeholder="Name" value={editForm.name}
                        onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                        className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                      <input type="email" placeholder="Email" value={editForm.email}
                        onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                        className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleSaveEdit(faci.id)} disabled={isSaving || !editForm.name}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors">
                        {isSaving ? "Saving…" : <><Check className="h-3.5 w-3.5" /> Save</>}
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                    </div>
                  </div>
                )}

                {isConfirmDelete && (
                  <div className="border-t border-destructive/20 bg-destructive/5 px-4 py-3 flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                    <p className="text-xs text-destructive flex-1">Delete <strong>{faci.name || faci.email}</strong>? This cannot be undone.</p>
                    <button type="button" onClick={() => handleDelete(faci.id)} disabled={isDeleting}
                      className="px-3 py-1.5 text-xs font-semibold bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 disabled:opacity-50 transition-colors">
                      {isDeleting ? "Deleting…" : "Delete"}
                    </button>
                    <button type="button" onClick={() => setConfirmDeleteId(null)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

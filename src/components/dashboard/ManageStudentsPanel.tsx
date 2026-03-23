"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getCouncilRoster, assignStudentsToCouncil, removeStudentFromCouncil,
} from "@/lib/actions/councils";
import { addStudent, updateStudent, deleteStudent } from "@/lib/actions/user-management";
import {
  GraduationCap, UserPlus, Trash2, Search, X, AlertTriangle, Check, Plus, Pencil,
} from "lucide-react";

type StudentFlat = {
  id: string; name: string | null; email: string;
  councilId: string | null; councilName: string | null;
};
type CouncilOpt = { id: string; name: string };

interface ManageStudentsPanelProps {
  onClose: () => void;
  onChanged?: () => void;
  embedded?: boolean;
  refreshKey?: number;
}

export function ManageStudentsPanel({ onClose, onChanged, embedded = false, refreshKey = 0 }: ManageStudentsPanelProps) {
  const [students, setStudents] = useState<StudentFlat[]>([]);
  const [councilOpts, setCouncilOpts] = useState<CouncilOpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Add form
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", email: "", password: "", councilId: "" });
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  // Transfer
  const [transferDraft, setTransferDraft] = useState<Record<string, string>>({});
  const [transferringId, setTransferringId] = useState<string | null>(null);

  // Delete
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCouncilRoster();
      const flat: StudentFlat[] = [
        ...data.unassigned.map((s) => ({ ...s, councilId: null, councilName: null })),
        ...data.councils.flatMap((c) =>
          c.students.map((s) => ({ ...s, councilId: c.id, councilName: c.name }))
        ),
      ];
      // Sort: unassigned first, then alphabetical by name
      flat.sort((a, b) => {
        if (!a.councilId && b.councilId) return -1;
        if (a.councilId && !b.councilId) return 1;
        return (a.name || a.email).localeCompare(b.name || b.email);
      });
      setStudents(flat);
      setCouncilOpts(data.councils.map((c) => ({ id: c.id, name: c.name })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { reload(); }, [reload, refreshKey]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true); setAddError(null);
    try {
      const res = await addStudent({
        name: addForm.name, email: addForm.email, password: addForm.password,
        councilId: addForm.councilId || undefined,
      });
      if (!res.success) { setAddError(res.error || "Failed"); return; }
      setShowAdd(false); setAddForm({ name: "", email: "", password: "", councilId: "" });
      await reload(); onChanged?.();
    } catch (err) { setAddError(err instanceof Error ? err.message : "Failed"); }
    finally { setAdding(false); }
  }

  function startEdit(s: StudentFlat) {
    setEditingId(s.id); setEditForm({ name: s.name || "", email: s.email });
    setEditError(null); setConfirmDeleteId(null);
  }

  async function handleSaveEdit(id: string) {
    setSavingId(id); setEditError(null);
    try {
      const res = await updateStudent(id, editForm);
      if (!res.success) { setEditError(res.error || "Failed"); return; }
      setEditingId(null); await reload(); onChanged?.();
    } finally { setSavingId(null); }
  }

  async function handleTransfer(student: StudentFlat) {
    const newCouncilId = transferDraft[student.id];
    if (!newCouncilId) return;
    setTransferringId(student.id);
    try {
      if (newCouncilId === "__unassign__") {
        await removeStudentFromCouncil(student.id);
      } else {
        await assignStudentsToCouncil(newCouncilId, [student.id]);
      }
      setTransferDraft((prev) => { const n = { ...prev }; delete n[student.id]; return n; });
      await reload(); onChanged?.();
    } finally { setTransferringId(null); }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteStudent(id);
      setConfirmDeleteId(null); await reload(); onChanged?.();
    } finally { setDeletingId(null); }
  }

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (s.name ?? s.email).toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
  });

  const unassignedCount = students.filter((s) => !s.councilId).length;

  const content = (
    <div className="space-y-4">
      {/* Header */}
      {!embedded && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">Manage Students</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Toolbar: stats + search + add */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-xs text-muted-foreground shrink-0">
            {students.length} student{students.length !== 1 ? "s" : ""}
            {unassignedCount > 0 && (
              <span className="text-amber-500 ml-1">· {unassignedCount} unassigned</span>
            )}
          </span>
          <div className="relative flex-1 min-w-0 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text" placeholder="Search students…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
        <button
          onClick={() => { setShowAdd((v) => !v); setAddError(null); }}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
            showAdd ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary hover:bg-primary/20"
          }`}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Student
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">New Student</p>
          {addError && <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{addError}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input type="text" placeholder="Full Name" required value={addForm.name}
              onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
              className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            <input type="email" placeholder="Email" required value={addForm.email}
              onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
              className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            <input type="password" placeholder="Password (min 8)" required minLength={8} value={addForm.password}
              onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))}
              className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            <select value={addForm.councilId}
              onChange={(e) => setAddForm((f) => ({ ...f, councilId: e.target.value }))}
              className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">No council (unassigned)</option>
              {councilOpts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={adding}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {adding ? "Adding…" : <><UserPlus className="h-3.5 w-3.5" /> Add Student</>}
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {/* Student list */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-14 bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">{search ? "No matches" : "No students yet."}</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
          {filtered.map((s) => {
            const isEditing = editingId === s.id;
            const isSaving = savingId === s.id;
            const isConfirmDelete = confirmDeleteId === s.id;
            const isDeleting = deletingId === s.id;
            const isTransferring = transferringId === s.id;
            const hasDraft = !!transferDraft[s.id];

            return (
              <div key={s.id}>
                {/* Student row */}
                <div className="flex items-center gap-3 px-4 py-3 bg-card group">
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    s.councilId ? "bg-secondary/20 text-secondary" : "bg-amber-500/15 text-amber-500"
                  }`}>
                    {(s.name || s.email).charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{s.name || s.email}</span>
                      {/* Council badge */}
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                        s.councilId
                          ? "bg-primary/8 text-primary border-primary/20"
                          : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      }`}>
                        {s.councilName ?? "Unassigned"}
                      </span>
                    </div>
                    {s.name && <p className="text-xs text-muted-foreground truncate">{s.email}</p>}
                  </div>

                  {/* Quick transfer */}
                  <div className="hidden group-hover:flex items-center gap-1.5 shrink-0">
                    <select
                      value={transferDraft[s.id] || ""}
                      onChange={(e) => setTransferDraft((prev) => ({ ...prev, [s.id]: e.target.value }))}
                      className="text-xs bg-background border border-border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary max-w-[130px]"
                    >
                      <option value="">Move to…</option>
                      {s.councilId && <option value="__unassign__">— Unassign</option>}
                      {councilOpts.filter((c) => c.id !== s.councilId).map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    {hasDraft && (
                      <button onClick={() => handleTransfer(s)} disabled={isTransferring}
                        className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50">
                        {isTransferring ? "…" : <Check className="h-3 w-3" />}
                      </button>
                    )}
                  </div>

                  {/* Edit / Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => isEditing ? setEditingId(null) : startEdit(s)}
                      className={`p-1.5 rounded-lg transition-colors ${isEditing ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}>
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setConfirmDeleteId(isConfirmDelete ? null : s.id)}
                      className={`p-1.5 rounded-lg transition-colors ${isConfirmDelete ? "bg-destructive/10 text-destructive" : "hover:bg-muted text-muted-foreground hover:text-destructive"}`}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Edit form */}
                {isEditing && (
                  <div className="border-t border-border bg-muted/20 px-4 py-3 space-y-2">
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
                      <button onClick={() => handleSaveEdit(s.id)} disabled={isSaving || !editForm.name}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors">
                        {isSaving ? "Saving…" : <><Check className="h-3 w-3" /> Save</>}
                      </button>
                      <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                    </div>
                  </div>
                )}

                {/* Delete confirm */}
                {isConfirmDelete && (
                  <div className="border-t border-destructive/20 bg-destructive/5 px-4 py-3 flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                    <p className="text-xs text-destructive flex-1">
                      Permanently delete <strong>{s.name}</strong>? This cannot be undone.
                    </p>
                    <button onClick={() => handleDelete(s.id)} disabled={isDeleting}
                      className="px-3 py-1.5 text-xs font-semibold bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 disabled:opacity-50 transition-colors">
                      {isDeleting ? "Deleting…" : "Delete"}
                    </button>
                    <button onClick={() => setConfirmDeleteId(null)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  if (embedded) return content;
  return <div className="bg-muted/40 rounded-xl border border-border p-5">{content}</div>;
}

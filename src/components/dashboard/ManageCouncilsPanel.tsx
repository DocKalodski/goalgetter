"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getCouncilRoster, createCouncil, updateCouncil, deleteCouncil,
  assignStudentsToCouncil, removeStudentFromCouncil,
} from "@/lib/actions/councils";
import { getCoaches } from "@/lib/actions/user-management";
import {
  Plus, X, ChevronDown, ChevronRight, Pencil, Trash2,
  Check, AlertTriangle, Users, ArrowRight, UserPlus,
} from "lucide-react";

type Student = { id: string; name: string | null; email: string };
type CouncilRow = { id: string; name: string; theme: string | null; coachId: string; students: Student[] };
type Coach = { id: string; name: string | null; email: string };

interface ManageCouncilsPanelProps {
  batchId: string;
  onClose: () => void;
  onChanged: () => void;
  embedded?: boolean;
  refreshKey?: number;
}

export function ManageCouncilsPanel({ batchId, onClose, onChanged, embedded = false, refreshKey = 0 }: ManageCouncilsPanelProps) {
  const [unassigned, setUnassigned] = useState<Student[]>([]);
  const [councilList, setCouncilList] = useState<CouncilRow[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);

  // Create new council
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", theme: "", coachId: "" });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Per-council state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", theme: "", coachId: "" });
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Transfer state: key = studentId, value = target councilId
  const [transferTarget, setTransferTarget] = useState<Record<string, string>>({});
  const [transferringId, setTransferringId] = useState<string | null>(null);

  // Remove from council
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Add students to council (quick picker per council)
  const [addingToCouncil, setAddingToCouncil] = useState<string | null>(null);
  const [pickerSel, setPickerSel] = useState<Set<string>>(new Set());
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerSaving, setPickerSaving] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [roster, coachList] = await Promise.all([
        getCouncilRoster(),
        getCoaches(),
      ]);
      setUnassigned(roster.unassigned);
      setCouncilList(roster.councils as CouncilRow[]);
      setCoaches(coachList.filter((c) => c.approvalStatus === "approved"));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { reload(); }, [reload, refreshKey]);

  // ── Create council ─────────────────────────────────────────────
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createForm.coachId) { setCreateError("Please select a coach."); return; }
    setCreating(true); setCreateError(null);
    try {
      await createCouncil({ name: createForm.name, theme: createForm.theme || undefined, coachId: createForm.coachId, batchId });
      setCreateForm({ name: "", theme: "", coachId: "" });
      setShowCreate(false);
      await reload(); onChanged();
    } catch (e) { setCreateError(e instanceof Error ? e.message : "Failed"); }
    finally { setCreating(false); }
  }

  // ── Edit council ───────────────────────────────────────────────
  function startEdit(c: CouncilRow) {
    setEditingId(c.id);
    setEditForm({ name: c.name, theme: c.theme || "", coachId: c.coachId });
    setConfirmDeleteId(null);
  }

  async function handleSaveEdit(id: string) {
    if (!editForm.coachId) return;
    setSavingId(id);
    try {
      await updateCouncil(id, { name: editForm.name, theme: editForm.theme || undefined, coachId: editForm.coachId });
      setEditingId(null);
      await reload(); onChanged();
    } finally { setSavingId(null); }
  }

  // ── Delete council ─────────────────────────────────────────────
  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteCouncil(id);
      setConfirmDeleteId(null);
      setEditingId(null);
      await reload(); onChanged();
    } finally { setDeletingId(null); }
  }

  // ── Transfer student ───────────────────────────────────────────
  async function handleTransfer(studentId: string) {
    const targetId = transferTarget[studentId];
    if (!targetId) return;
    setTransferringId(studentId);
    try {
      await assignStudentsToCouncil(targetId, [studentId]);
      setTransferTarget((prev) => { const n = { ...prev }; delete n[studentId]; return n; });
      await reload();
    } finally { setTransferringId(null); }
  }

  // ── Remove student ─────────────────────────────────────────────
  async function handleRemove(studentId: string) {
    setRemovingId(studentId);
    try { await removeStudentFromCouncil(studentId); await reload(); }
    finally { setRemovingId(null); }
  }

  // ── Add students picker ────────────────────────────────────────
  async function handlePickerSave(councilId: string) {
    if (pickerSel.size === 0) return;
    setPickerSaving(true);
    try {
      await assignStudentsToCouncil(councilId, [...pickerSel]);
      setAddingToCouncil(null); setPickerSel(new Set());
      await reload();
    } finally { setPickerSaving(false); }
  }

  function toggleExpand(id: string) {
    setExpandedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    setAddingToCouncil(null); setPickerSel(new Set()); setPickerSearch("");
  }

  // ── Coach name helper ──────────────────────────────────────────
  const coachName = (id: string) => coaches.find((c) => c.id === id)?.name || coaches.find((c) => c.id === id)?.email || "—";

  const inner = (
    <div className="space-y-5">
      {/* Header — only shown when not embedded */}
      {!embedded && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">Manage Councils</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowCreate((v) => !v); setEditingId(null); setConfirmDeleteId(null); }}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                showCreate ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary hover:bg-primary/20"
              }`}
            >
              <Plus className="h-3.5 w-3.5" />
              New Council
            </button>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      {/* "New Council" action button when embedded — shown inline at top */}
      {embedded && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            The org hub — assign coaches &amp; students to councils, transfer between councils
          </p>
          <button
            onClick={() => { setShowCreate((v) => !v); setEditingId(null); setConfirmDeleteId(null); }}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ml-3 ${
              showCreate ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary hover:bg-primary/20"
            }`}
          >
            <Plus className="h-3.5 w-3.5" />
            New Council
          </button>
        </div>
      )}

      {/* ── Create form ────────────────────────────────────────── */}
      {showCreate && (
        <form onSubmit={handleCreate} className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">New Council</p>
          {createError && <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{createError}</p>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              type="text" placeholder="Council Name" required value={createForm.name}
              onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
              className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text" placeholder="Motto (optional)" value={createForm.theme}
              onChange={(e) => setCreateForm((f) => ({ ...f, theme: e.target.value }))}
              className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              required value={createForm.coachId}
              onChange={(e) => setCreateForm((f) => ({ ...f, coachId: e.target.value }))}
              className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select Coach…</option>
              {coaches.map((c) => <option key={c.id} value={c.id}>{c.name || c.email}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={creating}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {creating ? "Creating…" : <><Check className="h-3.5 w-3.5" /> Create Council</>}
            </button>
            <button type="button" onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {/* ── Council list ────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-14 bg-muted animate-pulse rounded-xl" />)}</div>
      ) : councilList.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No councils yet. Create one above.</p>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {councilList.length} Council{councilList.length !== 1 ? "s" : ""}
          </p>
          {councilList.map((council) => {
            const isExpanded = expandedIds.has(council.id);
            const isEditing = editingId === council.id;
            const isSaving = savingId === council.id;
            const isConfirmDelete = confirmDeleteId === council.id;
            const isDeleting = deletingId === council.id;
            const isAddingHere = addingToCouncil === council.id;
            const otherCouncils = councilList.filter((c) => c.id !== council.id);

            return (
              <div key={council.id} className="rounded-xl border border-border overflow-hidden">
                {/* Council header row */}
                <div className="flex items-center gap-3 px-4 py-3 bg-card">
                  {/* Expand toggle */}
                  <button onClick={() => toggleExpand(council.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm">{council.name}</span>
                      {council.theme && <span className="text-xs text-muted-foreground italic truncate max-w-[180px]">"{council.theme}"</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-muted-foreground">Coach: {coachName(council.coachId)}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{council.students.length} student{council.students.length !== 1 ? "s" : ""}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => isEditing ? setEditingId(null) : startEdit(council)}
                      className={`p-1.5 rounded-md border transition-colors ${isEditing ? "bg-primary/10 text-primary border-primary/30" : "bg-muted border-border text-muted-foreground hover:bg-red-500/10 hover:text-red-500 hover:border-red-400/50"}`}
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(isConfirmDelete ? null : council.id)}
                      className={`p-1.5 rounded-lg transition-colors ${isConfirmDelete ? "bg-destructive/10 text-destructive" : "hover:bg-muted text-muted-foreground hover:text-destructive"}`}
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Delete confirmation */}
                {isConfirmDelete && (
                  <div className="border-t border-destructive/20 bg-destructive/5 px-4 py-3 flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                    <p className="text-xs text-destructive flex-1">
                      Delete <strong>{council.name}</strong>? This will unassign {council.students.length} student{council.students.length !== 1 ? "s" : ""}.
                    </p>
                    <button
                      onClick={() => handleDelete(council.id)}
                      disabled={isDeleting}
                      className="px-3 py-1.5 text-xs font-semibold bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 disabled:opacity-50 transition-colors"
                    >
                      {isDeleting ? "Deleting…" : "Yes, Delete"}
                    </button>
                    <button onClick={() => setConfirmDeleteId(null)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                  </div>
                )}

                {/* Edit form */}
                {isEditing && (
                  <div className="border-t border-border bg-muted/30 px-4 py-3 space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Edit Council</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input
                        type="text" placeholder="Council Name" required value={editForm.name}
                        onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                        className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <input
                        type="text" placeholder="Motto (optional)" value={editForm.theme}
                        onChange={(e) => setEditForm((f) => ({ ...f, theme: e.target.value }))}
                        className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <select
                        value={editForm.coachId}
                        onChange={(e) => setEditForm((f) => ({ ...f, coachId: e.target.value }))}
                        className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select Coach…</option>
                        {coaches.map((c) => <option key={c.id} value={c.id}>{c.name || c.email}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(council.id)}
                        disabled={isSaving || !editForm.name || !editForm.coachId}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                      >
                        {isSaving ? "Saving…" : <><Check className="h-3.5 w-3.5" /> Save Changes</>}
                      </button>
                      <button onClick={() => setEditingId(null)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                    </div>
                  </div>
                )}

                {/* Expanded: student list + transfer/remove */}
                {isExpanded && (
                  <div className="border-t border-border">
                    {council.students.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No students in this council</p>
                    ) : (
                      <div className="divide-y divide-border">
                        {council.students.map((s) => {
                          const isTransferring = transferringId === s.id;
                          const isRemoving = removingId === s.id;
                          return (
                            <div key={s.id} className="flex items-center gap-3 px-4 py-2.5 bg-card/50 group">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{s.name || s.email}</p>
                                {s.name && <p className="text-xs text-muted-foreground truncate">{s.email}</p>}
                              </div>
                              {/* Transfer */}
                              {otherCouncils.length > 0 && (
                                <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <select
                                    value={transferTarget[s.id] || ""}
                                    onChange={(e) => setTransferTarget((prev) => ({ ...prev, [s.id]: e.target.value }))}
                                    className="text-xs bg-background border border-border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary max-w-[130px]"
                                  >
                                    <option value="">Move to…</option>
                                    {otherCouncils.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                  </select>
                                  <button
                                    onClick={() => handleTransfer(s.id)}
                                    disabled={!transferTarget[s.id] || isTransferring}
                                    className="flex items-center gap-1 text-xs px-2 py-1 bg-primary/10 text-primary rounded-lg disabled:opacity-40 hover:bg-primary/20 transition-colors"
                                  >
                                    {isTransferring
                                      ? <span className="h-3 w-3 animate-spin border border-primary border-t-transparent rounded-full inline-block" />
                                      : <ArrowRight className="h-3 w-3" />}
                                    Move
                                  </button>
                                </div>
                              )}
                              {/* Remove */}
                              <button
                                onClick={() => handleRemove(s.id)}
                                disabled={isRemoving}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground disabled:opacity-50 shrink-0"
                                title="Remove from council"
                              >
                                {isRemoving
                                  ? <span className="h-3.5 w-3.5 animate-spin border border-current border-t-transparent rounded-full inline-block" />
                                  : <Trash2 className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Add students to this council */}
                    {!isAddingHere ? (
                      <button
                        onClick={() => { setAddingToCouncil(council.id); setPickerSel(new Set()); }}
                        disabled={unassigned.length === 0}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-primary hover:bg-primary/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed border-t border-border"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        {unassigned.length === 0 ? "No unassigned students available" : `Add unassigned students (${unassigned.length} available)`}
                      </button>
                    ) : (
                      <div className="border-t border-border p-3 space-y-2 bg-muted/20">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-primary">Add to {council.name}</span>
                          <button onClick={() => { setAddingToCouncil(null); setPickerSel(new Set()); setPickerSearch(""); }} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
                        </div>
                        {unassigned.length > 3 && (
                          <input
                            type="text" placeholder="Search unassigned…" value={pickerSearch}
                            onChange={(e) => setPickerSearch(e.target.value)}
                            autoFocus
                            className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        )}
                        <div className="max-h-40 overflow-y-auto rounded-lg border border-border divide-y divide-border">
                          {unassigned
                            .filter((s) => {
                              if (!pickerSearch) return true;
                              const q = pickerSearch.toLowerCase();
                              return (s.name ?? s.email).toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
                            })
                            .map((s) => {
                            const sel = pickerSel.has(s.id);
                            return (
                              <button
                                key={s.id}
                                onClick={() => setPickerSel((prev) => { const n = new Set(prev); sel ? n.delete(s.id) : n.add(s.id); return n; })}
                                className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${sel ? "bg-primary/8" : "bg-card hover:bg-muted/60"}`}
                              >
                                <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${sel ? "bg-primary border-primary" : "border-border bg-background"}`}>
                                  {sel && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                                </span>
                                <span className="truncate">{s.name || s.email}</span>
                              </button>
                            );
                          })}
                        </div>
                        <button
                          onClick={() => handlePickerSave(council.id)}
                          disabled={pickerSel.size === 0 || pickerSaving}
                          className="w-full py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg disabled:opacity-40 hover:bg-primary/90 transition-colors"
                        >
                          {pickerSaving ? "Adding…" : `Add ${pickerSel.size > 0 ? pickerSel.size + " " : ""}Student${pickerSel.size !== 1 ? "s" : ""}`}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Unassigned count footer */}
      {!loading && unassigned.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <span className="text-xs text-amber-500">
            <strong>{unassigned.length}</strong> student{unassigned.length !== 1 ? "s are" : " is"} not in any council — expand a council above and use &quot;Add unassigned students&quot;
          </span>
        </div>
      )}
    </div>
  );

  if (embedded) return inner;
  return <div className="bg-muted/40 rounded-xl border border-border p-5">{inner}</div>;
}

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  addCoach, getCoaches, updateCoach, deleteCoach, toggleCoachAllCouncilsView,
  updateCoachPermissions,
} from "@/lib/actions/user-management";
import { HC_PERMISSION_FLAGS } from "@/lib/config/permissions";
import {
  UserPlus, Plus, Pencil, Trash2, Check, X, Globe, GlobeLock, AlertTriangle, ShieldCheck,
} from "lucide-react";

interface Coach {
  id: string; name: string | null; email: string;
  approvalStatus: string; councilName: string; councilId: string | null;
  canViewAllCouncils: number;
  permissions: string | null;
}

interface ManageCoachesPanelProps {
  refreshKey?: number;
  onChanged?: () => void;
}

export function ManageCoachesPanel({ refreshKey = 0, onChanged }: ManageCoachesPanelProps) {
  const [coaches, setCoaches] = useState<Coach[]>([]);
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

  const [permissionsOpenId, setPermissionsOpenId] = useState<string | null>(null);
  const [permissionsDraft, setPermissionsDraft] = useState<Record<string, string[]>>({});
  const [savingPermissionsId, setSavingPermissionsId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setCoaches(await getCoaches());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { reload(); }, [reload, refreshKey]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true); setAddError(null);
    try {
      const res = await addCoach(addForm);
      if (!res.success) { setAddError(res.error || "Failed"); return; }
      setShowAdd(false); setAddForm({ name: "", email: "", password: "" });
      await reload(); onChanged?.();
    } catch (err) { setAddError(err instanceof Error ? err.message : "Failed"); }
    finally { setAdding(false); }
  }

  function startEdit(c: Coach) {
    setEditingId(c.id); setEditForm({ name: c.name || "", email: c.email });
    setEditError(null); setConfirmDeleteId(null);
  }

  async function handleSaveEdit(id: string) {
    setSavingId(id); setEditError(null);
    try {
      const res = await updateCoach(id, editForm);
      if (!res.success) { setEditError(res.error || "Failed"); return; }
      setEditingId(null); await reload(); onChanged?.();
    } finally { setSavingId(null); }
  }

  async function handleDelete(id: string) {
    setDeletingId(id); setDeleteError(null);
    try {
      const res = await deleteCoach(id);
      if (!res.success) { setDeleteError(res.error || "Failed"); setConfirmDeleteId(null); return; }
      setConfirmDeleteId(null); await reload(); onChanged?.();
    } finally { setDeletingId(null); }
  }

  async function handleToggle(id: string, current: number) {
    try {
      await toggleCoachAllCouncilsView(id, current === 0);
      await reload(); onChanged?.();
    } catch (e) { console.error(e); }
  }

  function openPermissions(coach: Coach) {
    let perms: string[] = [];
    try { perms = coach.permissions ? JSON.parse(coach.permissions) : []; } catch { perms = []; }
    setPermissionsDraft((prev) => ({ ...prev, [coach.id]: perms }));
    setPermissionsOpenId((prev) => (prev === coach.id ? null : coach.id));
  }

  function togglePermission(coachId: string, flag: string) {
    setPermissionsDraft((prev) => {
      const current = prev[coachId] || [];
      return {
        ...prev,
        [coachId]: current.includes(flag) ? current.filter((f) => f !== flag) : [...current, flag],
      };
    });
  }

  async function savePermissions(coachId: string) {
    setSavingPermissionsId(coachId);
    try {
      await updateCoachPermissions(coachId, permissionsDraft[coachId] || []);
      setPermissionsOpenId(null);
      await reload(); onChanged?.();
    } catch (e) { console.error(e); } finally { setSavingPermissionsId(null); }
  }

  if (loading) return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            {coaches.length} coach{coaches.length !== 1 ? "es" : ""} · Council assignment is managed in the <span className="text-primary font-medium">Councils</span> tab
          </p>
        </div>
        <button
          onClick={() => { setShowAdd((v) => !v); setAddError(null); }}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            showAdd ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary hover:bg-primary/20"
          }`}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Coach
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">New Coach</p>
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
              {adding ? "Adding…" : <><UserPlus className="h-3.5 w-3.5" /> Add Coach</>}
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {deleteError && <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{deleteError}</p>}

      {/* Coach cards */}
      {coaches.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <p className="text-2xl">👤</p>
          <p className="text-sm text-muted-foreground">No coaches yet. Add one above.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {coaches.map((coach) => {
            const isEditing = editingId === coach.id;
            const isSaving = savingId === coach.id;
            const isConfirmDelete = confirmDeleteId === coach.id;
            const isDeleting = deletingId === coach.id;
            const isPermissionsOpen = permissionsOpenId === coach.id;
            const isSavingPerms = savingPermissionsId === coach.id;
            let coachPerms: string[] = [];
            try { coachPerms = coach.permissions ? JSON.parse(coach.permissions) : []; } catch { coachPerms = []; }
            const permDraft = permissionsDraft[coach.id] ?? coachPerms;

            return (
              <div key={coach.id} className="rounded-xl border border-border overflow-hidden">
                {/* Coach row */}
                <div className="flex items-center gap-3 px-4 py-3 bg-card">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">
                      {(coach.name || coach.email).charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold">{coach.name || coach.email}</span>
                      {/* Council badge */}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        coach.councilId
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      }`}>
                        {coach.councilName}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{coach.email}</p>
                  </div>

                  {/* Permission toggle — view all councils */}
                  <button
                    onClick={() => handleToggle(coach.id, coach.canViewAllCouncils)}
                    title={coach.canViewAllCouncils ? "Revoke all-councils view" : "Grant all-councils view"}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors shrink-0 ${
                      coach.canViewAllCouncils
                        ? "bg-blue-500/10 text-blue-500 border-blue-500/30 hover:bg-blue-500/20"
                        : "bg-muted/60 text-muted-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {coach.canViewAllCouncils ? <Globe className="h-3 w-3" /> : <GlobeLock className="h-3 w-3" />}
                    <span className="hidden sm:inline">{coach.canViewAllCouncils ? "All Councils" : "Own Only"}</span>
                  </button>

                  {/* HC Modules button */}
                  <button
                    onClick={() => openPermissions(coach)}
                    title="HC module access"
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors shrink-0 ${
                      isPermissionsOpen || coachPerms.length > 0
                        ? "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20"
                        : "bg-muted/60 text-muted-foreground border-border hover:bg-muted"
                    }`}
                  >
                    <ShieldCheck className="h-3 w-3" />
                    <span className="hidden sm:inline">
                      {coachPerms.length > 0 ? `${coachPerms.length} Module${coachPerms.length > 1 ? "s" : ""}` : "HC Access"}
                    </span>
                  </button>

                  {/* Edit / Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => isEditing ? setEditingId(null) : startEdit(coach)}
                      className={`p-1.5 rounded-md border transition-colors ${isEditing ? "bg-primary/10 text-primary border-primary/30" : "bg-muted border-border text-muted-foreground hover:bg-red-500/10 hover:text-red-500 hover:border-red-400/50"}`}>
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setConfirmDeleteId(isConfirmDelete ? null : coach.id)}
                      className={`p-1.5 rounded-lg transition-colors ${isConfirmDelete ? "bg-destructive/10 text-destructive" : "hover:bg-muted text-muted-foreground hover:text-destructive"}`}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Edit form — name + email only; council assignment is in Councils tab */}
                {isEditing && (
                  <div className="border-t border-border bg-muted/20 px-4 py-3 space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Edit Coach</p>
                    <p className="text-xs text-muted-foreground">To change council assignment, use the <span className="text-primary font-medium">Councils</span> tab.</p>
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
                      <button onClick={() => handleSaveEdit(coach.id)} disabled={isSaving || !editForm.name}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors">
                        {isSaving ? "Saving…" : <><Check className="h-3.5 w-3.5" /> Save</>}
                      </button>
                      <button onClick={() => setEditingId(null)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                    </div>
                  </div>
                )}

                {/* HC Module permissions panel */}
                {isPermissionsOpen && (
                  <div className="border-t border-primary/20 bg-primary/5 px-4 py-3 space-y-3">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider">HC Module Access</p>
                    <p className="text-xs text-muted-foreground">
                      Standard coach functions are all ON by default. These unlock HC-only modules.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {HC_PERMISSION_FLAGS.map((flag) => {
                        const enabled = permDraft.includes(flag.id);
                        return (
                          <label key={flag.id} className={`flex items-start gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${enabled ? "bg-primary/10 border-primary/30" : "bg-card border-border hover:bg-muted/40"}`}>
                            <input
                              type="checkbox"
                              checked={enabled}
                              onChange={() => togglePermission(coach.id, flag.id)}
                              className="mt-0.5 shrink-0"
                            />
                            <div>
                              <p className={`text-xs font-semibold ${enabled ? "text-primary" : "text-foreground"}`}>{flag.label}</p>
                              <p className="text-[10px] text-muted-foreground">{flag.desc}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => savePermissions(coach.id)}
                        disabled={isSavingPerms}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                      >
                        {isSavingPerms ? "Saving…" : <><Check className="h-3 w-3" /> Save Access</>}
                      </button>
                      <button onClick={() => setPermissionsOpenId(null)} className="px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                    </div>
                  </div>
                )}

                {/* Delete confirm */}
                {isConfirmDelete && (
                  <div className="border-t border-destructive/20 bg-destructive/5 px-4 py-3 flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                    <p className="text-xs text-destructive flex-1">
                      Delete <strong>{coach.name}</strong>?{" "}
                      {coach.councilId && "This coach is assigned to a council — reassign in Councils tab first."}
                    </p>
                    <button onClick={() => handleDelete(coach.id)} disabled={isDeleting || !!coach.councilId}
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
}

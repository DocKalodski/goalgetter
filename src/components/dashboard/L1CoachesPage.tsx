"use client";

import { useEffect, useState, useCallback } from "react";
import { useNavigation } from "@/components/layout/DashboardShell";
import { getCoachesWithDetails } from "@/lib/actions/batch-overview";
import { addCoach, updateCoach, deleteCoach } from "@/lib/actions/user-management";
import { getAchievementStatus } from "@/lib/utils/achievement-status";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";

interface CoachDetail {
  id: string;
  name: string | null;
  email: string;
  role: string;
  approvalStatus: string;
  declaration: string | null;
  councils: { id: string; name: string }[];
  studentCount: number;
  enrollmentProgress: number;
  personalProgress: number;
  professionalProgress: number;
  enrollmentResults: number;
  personalResults: number;
  professionalResults: number;
  enrollmentCurrentWeek: number;
  personalCurrentWeek: number;
  professionalCurrentWeek: number;
  avgGoalAchievement: number;
  councilAvgProgress: number;
}

export function L1CoachesPage() {
  const { setL1SubView } = useNavigation();
  const [coaches, setCoaches] = useState<CoachDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [editData, setEditData] = useState({ name: "", email: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadCoaches = useCallback(async () => {
    try {
      const data = await getCoachesWithDetails();
      setCoaches(data);
    } catch (error) {
      console.error("Failed to load coaches:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCoaches();
  }, [loadCoaches]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await addCoach(formData);
      if (!result.success) {
        setError(result.error || "Failed to add coach");
      } else {
        setFormData({ name: "", email: "", password: "" });
        setShowAddForm(false);
        await loadCoaches();
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (coachId: string) => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await updateCoach(coachId, editData);
      if (!result.success) {
        setError(result.error || "Failed to update coach");
      } else {
        setEditingId(null);
        await loadCoaches();
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (coachId: string) => {
    if (!confirm("Are you sure you want to delete this coach?")) return;
    setError(null);
    try {
      const result = await deleteCoach(coachId);
      if (!result.success) {
        setError(result.error || "Failed to delete coach");
      } else {
        await loadCoaches();
      }
    } catch (err) {
      setError(String(err));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-96 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setL1SubView("overview")}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold">
              Coaches ({coaches.length})
            </h2>
            <p className="text-muted-foreground text-sm">
              Manage coaches and view their performance
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {showAddForm ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add Coach
        </button>
      </div>

      {error && (
        <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-lg">
          {error}
        </div>
      )}

      {/* Add form */}
      {showAddForm && (
        <form
          onSubmit={handleAdd}
          className="bg-muted/50 rounded-xl p-4 space-y-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="px-3 py-2 text-sm rounded-lg border border-border bg-background"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="px-3 py-2 text-sm rounded-lg border border-border bg-background"
            />
            <input
              type="password"
              placeholder="Password (min 8 chars)"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={8}
              className="px-3 py-2 text-sm rounded-lg border border-border bg-background"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Coach"}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-sm rounded-lg bg-muted hover:bg-muted/80"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Coaches table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-medium">Coach</th>
                <th className="text-left p-4 font-medium">Declaration</th>
                <th className="text-left p-4 font-medium">Own Goals</th>
                <th className="text-left p-4 font-medium">Council</th>
                <th className="text-left p-4 font-medium">Council Avg</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coaches.map((coach) => {
                const ownStatus = getAchievementStatus(coach.avgGoalAchievement);
                const councilStatus = getAchievementStatus(coach.councilAvgProgress);
                const isEditing = editingId === coach.id;

                return (
                  <tr
                    key={coach.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30"
                  >
                    <td className="p-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) =>
                            setEditData({ ...editData, name: e.target.value })
                          }
                          className="px-2 py-1 text-sm rounded border border-border bg-background w-full"
                        />
                      ) : (
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{coach.name}</p>
                            {coach.role === "head_coach" && (
                              <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
                                Head Coach
                              </span>
                            )}
                            {coach.role === "coach" && (
                              <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600">
                                Admin Coach
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {coach.email}
                          </p>
                          {coach.approvalStatus === "pending" && (
                            <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full mt-1">
                              Pending Approval
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="text-sm italic text-muted-foreground line-clamp-2">
                        {coach.declaration || "—"}
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1.5">
                        <p className={`text-sm font-bold ${ownStatus.textColor}`}>{coach.avgGoalAchievement}%</p>
                        {[
                          { label: "Enroll", results: coach.enrollmentResults, cw: coach.enrollmentCurrentWeek, bar: "bg-blue-500" },
                          { label: "Personal", results: coach.personalResults, cw: coach.personalCurrentWeek, bar: "bg-yellow-400" },
                          { label: "Prof", results: coach.professionalResults, cw: coach.professionalCurrentWeek, bar: "bg-purple-500" },
                        ].map((g) => (
                          <div key={g.label} className="space-y-0.5">
                            <span className="text-xs text-muted-foreground">{g.label}</span>
                            <div className="w-full bg-muted rounded-full h-1.5">
                              <div className={`${g.bar} h-1.5 rounded-full transition-all`} style={{ width: `${g.results}%` }} />
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5">
                              <div className={`${g.bar} h-1.5 rounded-full opacity-40 transition-all`} style={{ width: `${g.cw}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      {coach.councils.length > 0 ? (
                        <div className="space-y-1">
                          {coach.councils.map((c) => (
                            <span
                              key={c.id}
                              className="inline-block text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                            >
                              {c.name}
                            </span>
                          ))}
                          <p className="text-xs text-muted-foreground">
                            {coach.studentCount} students
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <p className={`text-lg font-bold ${councilStatus.textColor}`}>
                        {coach.councilAvgProgress}%
                      </p>
                      <p className={`text-xs ${councilStatus.textColor}`}>
                        {councilStatus.label}
                      </p>
                    </td>
                    <td className="p-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleUpdate(coach.id)}
                            disabled={submitting}
                            className="p-1.5 rounded hover:bg-green-500/10 text-green-600"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 rounded hover:bg-muted"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingId(coach.id);
                              setEditData({
                                name: coach.name || "",
                                email: coach.email,
                              });
                            }}
                            className="p-1.5 rounded hover:bg-muted"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(coach.id)}
                            className="p-1.5 rounded hover:bg-destructive/10 text-destructive"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {coaches.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No coaches yet. Add your first coach above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

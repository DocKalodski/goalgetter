"use client";

import { useEffect, useState, useCallback } from "react";
import { getStudentGoals, updateGoal } from "@/lib/actions/goals";
import { getBatchCurrentWeek } from "@/lib/actions/attendance";
import { getStudentAlignment } from "@/lib/actions/alignment";
import { useNavigation } from "@/components/layout/DashboardShell";
import { WeeklyTracker } from "./WeeklyTracker";
import { ApprovalBadge } from "./ApprovalBadge";
import { Pencil, Check, X, AlertTriangle } from "lucide-react";

interface GoalData {
  id: string;
  goalType: string;
  goalStatement: string;
  valuesDeclaration: string | null;
  status: string;
  approvalStatus: string;
  approvedBy: string | null;
  endDate: string | null;
  specificDetails: string | null;
  measurableCriteria: string | null;
  achievableResources: string | null;
  relevantAlignment: string | null;
  excitingMotivation: string | null;
  rewardingBenefits: string | null;
  milestones: {
    id: string;
    weekNumber: number;
    weekStartDate: string | null;
    weekEndDate: string | null;
    milestoneDescription: string | null;
    actions: string | null;
    results: string | null;
    cumulativePercentage: number;
    approvalStatus: string;
    approvedBy: string | null;
  }[];
}

export function GoalsTab({ studentId }: { studentId: string }) {
  const { selectedGoalType, setActiveL3Tab, user } = useNavigation();
  const [goals, setGoals] = useState<GoalData[]>([]);
  const [activeGoal, setActiveGoal] = useState<string>(selectedGoalType);
  const [currentWeek, setCurrentWeek] = useState<number | undefined>(undefined);
  const [alignmentScores, setAlignmentScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Inline edit state
  const [editing, setEditing] = useState(false);
  const [draftStatement, setDraftStatement] = useState("");
  const [draftValues, setDraftValues] = useState<string[]>([]);
  const [valueInput, setValueInput] = useState("");
  const [saving, setSaving] = useState(false);

  const canEdit =
    user.role === "coach" ||
    user.role === "head_coach" ||
    (user.role === "student" && user.userId === studentId) ||
    (user.role === "council_leader" && user.userId === studentId);

  const loadGoals = useCallback(async () => {
    try {
      const [data, week, alignment] = await Promise.all([
        getStudentGoals(studentId),
        getBatchCurrentWeek(),
        getStudentAlignment(studentId),
      ]);
      setGoals(data as GoalData[]);
      setCurrentWeek(week);
      // Build a quick score map by goalType using declaration keyword overlap
      if (alignment.declaration && alignment.goals.length > 0) {
        const decl = alignment.declaration.toLowerCase();
        const scores: Record<string, number> = {};
        for (const g of alignment.goals) {
          const stmt = g.goalStatement.toLowerCase();
          const vals = (g.values || "").toLowerCase();
          // Simple heuristic: count shared meaningful words
          const declWords = decl.split(/\s+/).filter((w) => w.length > 3);
          const combined = stmt + " " + vals;
          const matches = declWords.filter((w) => combined.includes(w)).length;
          scores[g.goalType] = declWords.length > 0 ? Math.round((matches / declWords.length) * 100) : 50;
        }
        setAlignmentScores(scores);
      }
    } catch (error) {
      console.error("Failed to load goals:", error);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  useEffect(() => {
    setActiveGoal(selectedGoalType);
  }, [selectedGoalType]);

  const canApprove = user.role === "coach" || user.role === "head_coach";
  const isViewingOther = studentId !== user.userId;

  const currentGoal = goals.find((g) => g.goalType === activeGoal);

  function startEditing() {
    if (!currentGoal) return;
    setDraftStatement(currentGoal.goalStatement);
    setDraftValues(
      (currentGoal.valuesDeclaration || "")
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
    );
    setValueInput("");
    setEditing(true);
  }

  async function handleSave() {
    if (!currentGoal) return;
    setSaving(true);
    try {
      await updateGoal(currentGoal.id, {
        goalStatement: draftStatement.trim(),
        valuesDeclaration: draftValues.join(", "),
      });
      setEditing(false);
      await loadGoals();
    } catch (e) {
      console.error("Failed to save goal:", e);
    } finally {
      setSaving(false);
    }
  }

  function handleAddValue() {
    const v = valueInput.trim();
    if (v && !draftValues.includes(v)) {
      setDraftValues([...draftValues, v]);
    }
    setValueInput("");
  }

  if (loading) {
    return <div className="h-96 bg-muted animate-pulse rounded-xl" />;
  }

  const values = currentGoal?.valuesDeclaration
    ? currentGoal.valuesDeclaration.split(",").map((v) => v.trim()).filter(Boolean)
    : [];

  return (
    <div className="space-y-6">
      {currentGoal ? (
        <div className="space-y-6">
          {/* Goal Statement + Values card */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {/* Goal tabs */}
            <div className="flex items-center justify-between border-b border-border px-4 pt-3 pb-0">
              <div className="flex gap-1">
                {([
                  { key: "enrollment",    label: "Enrollment",    color: "text-blue-500 border-blue-500",     dot: "bg-blue-500"   },
                  { key: "personal",      label: "Personal",      color: "text-yellow-500 border-yellow-500", dot: "bg-yellow-400" },
                  { key: "professional",  label: "Professional",  color: "text-purple-500 border-purple-500", dot: "bg-purple-500" },
                ] as const).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => { setActiveGoal(tab.key); setEditing(false); }}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors -mb-px ${
                      activeGoal === tab.key
                        ? tab.color
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${tab.dot} shrink-0`} />
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 pb-2">
                {alignmentScores[activeGoal] !== undefined && alignmentScores[activeGoal] < 40 && (
                  <button
                    onClick={() => setActiveL3Tab("action-planner")}
                    className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200 hover:bg-red-200 transition-colors dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    Fix in Action Planner →
                  </button>
                )}
                {isViewingOther && (
                  <ApprovalBadge
                    status={currentGoal.approvalStatus}
                    type="goal"
                    id={currentGoal.id}
                    canApprove={canApprove}
                    onStatusChange={loadGoals}
                  />
                )}
                {canEdit && !editing && (
                  <button
                    onClick={startEditing}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                )}
              </div>
            </div>

            <div className="p-5 space-y-4">

            {editing ? (
              <div className="space-y-4">
                {/* Goal statement textarea */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Goal Statement</p>
                  <textarea
                    value={draftStatement}
                    onChange={(e) => setDraftStatement(e.target.value)}
                    rows={4}
                    className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Values editor */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Values</p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {draftValues.map((v) => (
                      <span key={v} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {v}
                        <button onClick={() => setDraftValues(draftValues.filter((x) => x !== v))} className="hover:text-destructive transition-colors">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={valueInput}
                      onChange={(e) => setValueInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddValue())}
                      placeholder="Add a value, press Enter"
                      className="flex-1 text-sm border border-border rounded-lg px-3 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button onClick={handleAddValue} className="px-3 py-1.5 rounded-lg bg-muted text-sm hover:bg-muted/80 transition-colors">+</button>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    <Check className="h-3.5 w-3.5" />
                    {saving ? "Saving…" : "Save"}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="text-sm px-4 py-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-foreground leading-relaxed">{currentGoal.goalStatement}</p>

                {values.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Values</p>
                    <div className="flex flex-wrap gap-1.5">
                      {values.map((v) => (
                        <span key={v} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {values.length === 0 && canEdit && (
                  <p className="text-xs text-muted-foreground italic">No values added yet. Click Edit to add.</p>
                )}
              </>
            )}
            </div>
          </div>

          {/* Weekly tracker */}
          <WeeklyTracker
            goalId={currentGoal.id}
            milestones={currentGoal.milestones}
            studentId={studentId}
            currentWeek={currentWeek}
            batchStartDate="2026-02-02"
            activeTab={activeGoal as "enrollment" | "personal" | "professional"}
            onTabChange={(tab) => { setActiveGoal(tab); setEditing(false); }}
            allGoals={{
              enrollment:   { id: goals.find((g) => g.goalType === "enrollment")?.id   ?? currentGoal.id, milestones: goals.find((g) => g.goalType === "enrollment")?.milestones   ?? [] },
              personal:     { id: goals.find((g) => g.goalType === "personal")?.id     ?? currentGoal.id, milestones: goals.find((g) => g.goalType === "personal")?.milestones     ?? [] },
              professional: { id: goals.find((g) => g.goalType === "professional")?.id ?? currentGoal.id, milestones: goals.find((g) => g.goalType === "professional")?.milestones ?? [] },
            }}
          />
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">
          <p>No {activeGoal} goal set yet.</p>
        </div>
      )}
    </div>
  );
}

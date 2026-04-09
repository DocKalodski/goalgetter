"use client";

import { useEffect, useState, useCallback } from "react";
import { useNavigation } from "@/components/layout/DashboardShell";
import { getCoachMetrics, getTeamWeeklyHistory } from "@/lib/actions/coach-overview";
import type { WeekHistoryEntry } from "@/lib/actions/coach-overview";
import { getPendingApprovalsCount } from "@/lib/actions/approvals";
import { getCouncilsWithStats } from "@/lib/actions/councils";
import { ManageProgramShell } from "./ManageProgramShell";
import { getTargetStatus } from "@/lib/utils/week-targets";
import { PerformanceBanner } from "./PerformanceBanner";
import {
  Users,
  GraduationCap,
  Crown,
  Settings2,
  ChevronDown,
  ChevronUp,
  MessageCircle,
} from "lucide-react";
import { HcCoachChatPanel } from "./HcCoachChatPanel";


interface CoachMetrics {
  councilCount: number;
  councilNames: string[];
  studentCount: number;
  councilGoalAchievement: number;
  enrollmentResults: number;
  personalResults: number;
  professionalResults: number;
  enrollmentActionPlan: number;
  personalActionPlan: number;
  professionalActionPlan: number;
  ownGoalProgress: number;
  ownGoalResults: number;
  ownGoalCurrentWeek: number;
  pendingApprovals: number;
  currentWeek: number;
  batchStartDate: string;
  batchId: string;
  weeklyTargets: Record<string, { min: number; max: number }>;
  reportingWeek: number;
}

interface CouncilStat {
  id: string;
  name: string;
  theme: string | null;
  coachId: string | null;
  coachName: string | null;
  adminCoachName: string | null;
  leaderName: string | null;
  studentCount: number;
  avgProgress: number;
  avgResults: number;
  avgCurrentWeek: number;
}

export function L2OverviewPage() {
  const {
    setCurrentPage,
    setSelectedCouncilId,
    setL1SubView,
    setL2SubView,
    l1ManageOpen,
    setL1ManageOpen,
    user,
  } = useNavigation();
  const [metrics, setMetrics] = useState<CoachMetrics | null>(null);
  const [councils, setCouncils] = useState<CouncilStat[]>([]);
  const [weeklyHistory, setWeeklyHistory] = useState<WeekHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [hcChatOpen, setHcChatOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const load = useCallback(async () => {
    try {
      const [metricsData, councilsData, historyData, pending] = await Promise.all([
        getCoachMetrics(),
        getCouncilsWithStats(),
        getTeamWeeklyHistory(),
        getPendingApprovalsCount(),
      ]);
      setMetrics(metricsData);
      setCouncils(councilsData);
      setWeeklyHistory(historyData);
      setPendingCount(pending);
    } catch (error) {
      console.error("Failed to load council overview:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCouncilClick = (councilId: string) => {
    setSelectedCouncilId(councilId);
    setCurrentPage("L2");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-24 bg-muted animate-pulse rounded-xl" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  // Use server-computed reportingWeek (based on real date), fall back to currentWeek-1
  const reportingWeek = metrics?.reportingWeek ?? Math.max(1, (metrics?.currentWeek ?? 8) - 1);
  const currentWeek = metrics?.currentWeek ?? reportingWeek + 1;
  const batchStartDate = metrics?.batchStartDate ?? "2026-02-02";
  const isHeadCoach = user.role === "head_coach";
  const isFacilitator = user.role === "facilitator";

  return (
    <div className="space-y-6">
      {/* Title + manage buttons + compact stats */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold whitespace-nowrap">
              {isHeadCoach ? "Team Summary (Head Coach)" : isFacilitator ? "Team Summary (Facilitator)" : "Council Summary (Coach)"}
            </h2>
            <p className="text-muted-foreground">
              {isHeadCoach ? "Manage councils and track group performance" : isFacilitator ? "Read-only overview of all councils" : "Your council's performance overview"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {user.role === "coach" && (
              <button
                onClick={() => setHcChatOpen(!hcChatOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  hcChatOpen ? "bg-amber-500 text-white" : "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                }`}
              >
                <MessageCircle className="h-4 w-4" />
                Ask Head Coach Chat
              </button>
            )}
            {!isFacilitator && (
              <button
                onClick={() => setL1ManageOpen(!l1ManageOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  l1ManageOpen ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary hover:bg-primary/20"
                }`}
              >
                <Settings2 className="h-4 w-4" />
                Manage
                {l1ManageOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Compact councils + students stats */}
        <div className="flex items-center gap-4 px-4 py-2.5 bg-card rounded-lg border border-border w-fit">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">{metrics?.councilCount ?? 0}</span>
            <span className="text-xs text-muted-foreground">Councils</span>
            {metrics?.councilNames && metrics.councilNames.length > 0 && (
              <span className="text-xs text-muted-foreground hidden sm:inline">
                — {metrics.councilNames.join(", ")}
              </span>
            )}
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-secondary" />
            <span className="text-sm font-semibold">{metrics?.studentCount ?? 0}</span>
            <span className="text-xs text-muted-foreground">Students</span>
          </div>
        </div>
      </div>

      {/* Manage Panel */}
      {l1ManageOpen && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
          {metrics && (
            <ManageProgramShell
              batchId={metrics.batchId}
              onClose={() => setL1ManageOpen(false)}
              onChanged={load}
            />
          )}
        </div>
      )}

      {/* Full-width Performance Banner with breakdown */}
      <PerformanceBanner
        reportingWeek={reportingWeek}
        currentWeek={currentWeek}
        batchStartDate={batchStartDate}
        weeklyTargets={metrics?.weeklyTargets}
        weeklyHistory={weeklyHistory}
        showChart={false}
        breakdown={{
          enrollment: { results: metrics?.enrollmentResults ?? 0, actionPlan: metrics?.enrollmentActionPlan ?? 0 },
          personal: { results: metrics?.personalResults ?? 0, actionPlan: metrics?.personalActionPlan ?? 0 },
          professional: { results: metrics?.professionalResults ?? 0, actionPlan: metrics?.professionalActionPlan ?? 0 },
          total: {
            results: metrics?.councilGoalAchievement ?? 0,
            actionPlan: Math.round(((metrics?.enrollmentActionPlan ?? 0) + (metrics?.personalActionPlan ?? 0) + (metrics?.professionalActionPlan ?? 0)) / 3),
          },
        }}
      />

      {/* Council Cards List */}
      <div>
        <h3 className="text-xl font-bold mb-4">Councils ({councils.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {councils.map((council) => {
            const targetStatus = getTargetStatus(council.avgResults, reportingWeek);
            const tsCfg = {
              met:             { bar: "bg-emerald-500", text: "text-emerald-500", badge: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30", label: "✓ Target Met" },
              needs_attention: { bar: "bg-orange-500",  text: "text-orange-500",  badge: "bg-orange-500/10 text-orange-500 border border-orange-500/30",   label: "⚠ Needs Attention" },
              action_plan:     { bar: "bg-blue-500",    text: "text-blue-500",    badge: "bg-blue-500/10 text-blue-500 border border-blue-500/30",           label: "Action Plan" },
              enjoy:           { bar: "bg-purple-500",  text: "text-purple-500",  badge: "bg-purple-500/10 text-purple-500 border border-purple-500/30",     label: "Enjoy" },
            }[targetStatus];

            return (
              <button
                key={council.id}
                onClick={() => handleCouncilClick(council.id)}
                className="bg-card rounded-2xl border-2 border-border p-6 text-left hover:shadow-xl hover:border-primary/60 transition-all group active:scale-[0.98]"
              >
                {/* Status badge — top */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="text-xl font-black group-hover:text-primary transition-colors leading-tight tracking-tight">
                      {council.name}
                    </h4>
                    {council.theme && (
                      <p className="text-sm text-muted-foreground mt-0.5 italic">{council.theme}</p>
                    )}
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 ${tsCfg.badge}`}>
                    {tsCfg.label}
                  </span>
                </div>

                {/* Leader + students row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-amber-500 shrink-0" />
                    <span className="text-base font-semibold">{council.leaderName || "No leader"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                    <GraduationCap className="h-4 w-4" />
                    {council.studentCount} students
                  </div>
                </div>

                {/* Progress — big numbers */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Milestones/Results</span>
                      <span className={`text-2xl font-black tabular-nums ${tsCfg.text}`}>{council.avgResults}%</span>
                    </div>
                    <div className="bg-muted rounded-full h-3">
                      <div className={`${tsCfg.bar} h-3 rounded-full transition-all`} style={{ width: `${council.avgResults}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Action Steps</span>
                      <span className="text-2xl font-black tabular-nums text-muted-foreground">{council.avgCurrentWeek}%</span>
                    </div>
                    <div className="bg-muted rounded-full h-3">
                      <div className={`${tsCfg.bar} h-3 rounded-full opacity-40 transition-all`} style={{ width: `${council.avgCurrentWeek}%` }} />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}

          {councils.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No councils assigned yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Pending Approvals CTA — coaches only, at bottom of overview */}
      {pendingCount > 0 && user.role === "coach" && (
        <button
          type="button"
          onClick={() => setL2SubView("approvals")}
          className="w-full flex items-center justify-between gap-4 p-4 rounded-xl border border-amber-400/40 bg-amber-500/8 hover:bg-amber-500/15 transition-colors text-left group"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-white font-black text-sm shrink-0">
              {pendingCount > 99 ? "99+" : pendingCount}
            </span>
            <div>
              <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                {pendingCount} item{pendingCount !== 1 ? "s" : ""} waiting for your approval
              </p>
              <p className="text-xs text-muted-foreground">
                Goals · Milestones · Declarations — tap to review
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 group-hover:underline shrink-0">
            Review →
          </span>
        </button>
      )}

      {/* Coach → HC Chat Panel */}
      {user.role === "coach" && hcChatOpen && (
        <HcCoachChatPanel
          coachId={user.userId}
          coachName={user.name ?? user.email}
          onClose={() => setHcChatOpen(false)}
        />
      )}

    </div>
  );
}

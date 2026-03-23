"use client";

import { useEffect, useState, useCallback } from "react";
import { useNavigation } from "@/components/layout/DashboardShell";
import { getCoachMetrics, getTeamWeeklyHistory } from "@/lib/actions/coach-overview";
import type { WeekHistoryEntry } from "@/lib/actions/coach-overview";
import { getCouncilsWithStats } from "@/lib/actions/councils";
import { ManageProgramShell } from "./ManageProgramShell";
import { getTargetStatus } from "@/lib/utils/week-targets";
import { PerformanceBanner } from "./PerformanceBanner";
import {
  Users,
  GraduationCap,
  Crown,
  Settings2,
} from "lucide-react";


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
    user,
  } = useNavigation();
  const [metrics, setMetrics] = useState<CoachMetrics | null>(null);
  const [councils, setCouncils] = useState<CouncilStat[]>([]);
  const [weeklyHistory, setWeeklyHistory] = useState<WeekHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showManage, setShowManage] = useState(false);

  const load = useCallback(async () => {
    try {
      const [metricsData, councilsData, historyData] = await Promise.all([
        getCoachMetrics(),
        getCouncilsWithStats(),
        getTeamWeeklyHistory(),
      ]);
      setMetrics(metricsData);
      setCouncils(councilsData);
      setWeeklyHistory(historyData);
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

  return (
    <div className="space-y-6">
      {/* Title + manage buttons + compact stats */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold whitespace-nowrap">{isHeadCoach ? "Team Summary (Head Coach)" : "Council Summary (Coach)"}</h2>
            <p className="text-muted-foreground">
              {isHeadCoach ? "Manage councils and track group performance" : "Your council's performance overview"}
            </p>
          </div>
          {isHeadCoach && (
            <button
              onClick={() => setShowManage((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                showManage ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary hover:bg-primary/20"
              }`}
            >
              <Settings2 className="h-4 w-4" />
              Manage Program
            </button>
          )}
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

      {/* Unified management shell */}
      {isHeadCoach && showManage && metrics && (
        <ManageProgramShell
          batchId={metrics.batchId}
          onClose={() => setShowManage(false)}
          onChanged={load}
        />
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

    </div>
  );
}

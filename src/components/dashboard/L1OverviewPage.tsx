"use client";

import { useEffect, useState, useCallback } from "react";
import { useNavigation } from "@/components/layout/DashboardShell";
import { getBatchMetrics } from "@/lib/actions/batch-overview";
import { getCouncilsWithStats } from "@/lib/actions/councils";
import { InsightsPanel } from "./InsightsPanel";
import { Users, GraduationCap, Target, ArrowRight } from "lucide-react";
import { getAchievementStatus } from "@/lib/utils/achievement-status";

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

interface Metrics {
  coachCount: number;
  studentCount: number;
  teamGoalAchievement: number;
}

export function L1OverviewPage() {
  const { setCurrentPage, setSelectedCouncilId, setL1SubView } = useNavigation();
  const [councils, setCouncils] = useState<CouncilStat[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [metricsData, councilsData] = await Promise.all([
        getBatchMetrics(),
        getCouncilsWithStats(),
      ]);
      setMetrics(metricsData);
      setCouncils([...councilsData].sort((a, b) => b.avgResults - a.avgResults));
    } catch (error) {
      console.error("Failed to load overview:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  const teamStatus = metrics
    ? getAchievementStatus(metrics.teamGoalAchievement)
    : null;

  const metricCards = [
    {
      label: "Coaches",
      value: metrics?.coachCount ?? 0,
      suffix: "",
      subtitle: "Manage coaches",
      icon: Users,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      onClick: () => setL1SubView("coaches"),
    },
    {
      label: "Students",
      value: metrics?.studentCount ?? 0,
      suffix: "",
      subtitle: "View all students",
      icon: GraduationCap,
      iconBg: "bg-secondary/10",
      iconColor: "text-secondary",
      onClick: () => setL1SubView("students"),
    },
    {
      label: "Team Achievement",
      value: metrics?.teamGoalAchievement ?? 0,
      suffix: "%",
      subtitle: teamStatus?.label ?? "Rankings",
      icon: Target,
      iconBg: teamStatus ? `${teamStatus.bgColor}` : "bg-accent/10",
      iconColor: teamStatus ? teamStatus.textColor : "text-accent",
      onClick: () => setL1SubView("councils"),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Batch Overview</h2>
        <p className="text-muted-foreground">LEAP 99 · Unstoppable Love</p>
      </div>

      {/* 3 Compact Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              onClick={card.onClick}
              className="bg-card rounded-xl border border-border px-5 py-4 text-left hover:shadow-lg hover:border-primary/50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${card.iconBg} shrink-0`}>
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black leading-none">
                      {card.value}
                      {card.suffix && (
                        <span className="text-2xl text-muted-foreground">
                          {card.suffix}
                        </span>
                      )}
                    </span>
                    <span className="text-base font-semibold text-muted-foreground">{card.label}</span>
                  </div>
                  <p className="text-sm text-primary mt-1 group-hover:underline truncate">
                    {card.subtitle} →
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            </button>
          );
        })}
      </div>

      {/* AI Insights Panel */}
      <InsightsPanel />

      {/* Council Overview */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Team Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {councils.map((council) => {
            const status = getAchievementStatus(council.avgProgress);
            return (
              <button
                key={council.id}
                onClick={() => {
                  setSelectedCouncilId(council.id);
                  setCurrentPage("L2");
                }}
                className="bg-card rounded-xl border border-border p-6 text-left hover:shadow-lg hover:border-primary/50 transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                    {council.name}
                  </h3>
                  <span className="text-sm font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {council.studentCount} students
                  </span>
                </div>
                {council.theme && (
                  <p className="text-sm text-muted-foreground mb-3 italic">
                    {council.theme}
                  </p>
                )}
                <div className="text-sm text-muted-foreground mb-4 space-y-1">
                  <p>
                    <span className="text-amber-600 font-medium">HC:</span>{" "}
                    {council.coachName || "Unassigned"}
                  </p>
                  {council.leaderName && (
                    <p>
                      <span className="text-primary font-medium">Council Leader:</span>{" "}
                      {council.leaderName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-muted-foreground shrink-0">Milestones/Results</span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div className={`${status.barColor} h-2 rounded-full transition-all`} style={{ width: `${council.avgResults}%` }} />
                    </div>
                    <span className={`text-base font-black w-10 text-right shrink-0 ${status.textColor}`}>{council.avgResults}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-muted-foreground shrink-0">Action Steps</span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div className={`${status.barColor} h-2 rounded-full opacity-40 transition-all`} style={{ width: `${council.avgCurrentWeek}%` }} />
                    </div>
                    <span className="text-base font-bold text-muted-foreground w-10 text-right shrink-0">{council.avgCurrentWeek}%</span>
                  </div>
                  <p className={`text-sm font-semibold ${status.textColor}`}>{status.label}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

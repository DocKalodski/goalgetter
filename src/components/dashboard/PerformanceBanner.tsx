"use client";

import { useState } from "react";
import { Calendar, CheckCircle, AlertTriangle, Sparkles, PartyPopper, ChevronDown } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import {
  getWeekTarget,
  getTargetStatus,
  getWeekDatesFromBatch,
  formatWeekDate,
} from "@/lib/utils/week-targets";
import type { WeekHistoryEntry } from "@/lib/actions/coach-overview";

interface GoalTypePerf {
  results: number;
  actionPlan: number;
}

interface PerformanceBannerProps {
  reportingWeek: number;
  currentWeek?: number;
  batchStartDate: string;
  weeklyTargets?: Record<string, { min: number; max: number }>;
  label?: string;
  labelPrefix?: string;
  showTotal?: boolean;
  onColumnClick?: (type: "enrollment" | "personal" | "professional") => void;
  activeGoalType?: "enrollment" | "personal" | "professional";
  breakdown?: {
    enrollment: GoalTypePerf;
    personal: GoalTypePerf;
    professional: GoalTypePerf;
    total: GoalTypePerf;
  };
  resultsAvg?: number;
  weeklyHistory?: WeekHistoryEntry[];
  showChart?: boolean;
}

function GoalColumn({
  label,
  results,
  actionPlan,
  textColor,
  barColor,
  onClick,
  isActive,
}: {
  label: string;
  results: number;
  actionPlan: number;
  textColor: string;
  barColor: string;
  onClick?: () => void;
  isActive?: boolean;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      className={`flex-1 min-w-[120px] text-left ${onClick ? "cursor-pointer rounded-lg px-2 py-1 -mx-2 -my-1 transition-colors hover:bg-white/5" : ""} ${isActive ? "ring-1 ring-inset rounded-lg px-2 py-1 -mx-2 -my-1 " + barColor.replace("bg-", "ring-") + "/40" : ""}`}
      {...(onClick ? { onClick } : {})}
    >
      <p className={`text-base font-bold uppercase tracking-wider mb-2 ${textColor}`}>{label}</p>
      <div className="space-y-2">
        <div>
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-sm font-medium text-muted-foreground">Milestones/Results</span>
            <span className={`text-3xl font-black ${textColor}`}>{results}%</span>
          </div>
          <div className="h-5 bg-muted rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${results}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-sm font-medium text-muted-foreground">Action Steps</span>
            <span className="text-xl font-bold text-muted-foreground">{actionPlan}%</span>
          </div>
          <div className="h-5 bg-muted rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all opacity-50 ${barColor}`} style={{ width: `${actionPlan}%` }} />
          </div>
        </div>
      </div>
    </Tag>
  );
}

const statusConfig = {
  met: {
    icon: CheckCircle,
    label: "On Track",
    textColor: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/40",
    cardBg: "bg-emerald-500/5",
  },
  needs_attention: {
    icon: AlertTriangle,
    label: "Needs Attention",
    textColor: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/40",
    cardBg: "bg-orange-500/5",
  },
  action_plan: {
    icon: Sparkles,
    label: "Milestones",
    textColor: "text-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/40",
    cardBg: "bg-blue-500/5",
  },
  enjoy: {
    icon: PartyPopper,
    label: "Enjoy",
    textColor: "text-purple-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/40",
    cardBg: "bg-purple-500/5",
  },
};

export function PerformanceBanner({
  reportingWeek,
  currentWeek,
  batchStartDate,
  weeklyTargets,
  labelPrefix = "Team",
  showTotal = true,
  onColumnClick,
  activeGoalType,
  breakdown,
  resultsAvg = 0,
  weeklyHistory,
  showChart = false,
}: PerformanceBannerProps) {
  // currentWeek = the week in progress; reportingWeek = last completed week (always currentWeek - 1)
  const inProgressWeek = currentWeek ?? reportingWeek + 1;
  const [selectedWeek, setSelectedWeek] = useState(reportingWeek);

  // Determine which data to display based on selectedWeek
  const displayWeek = selectedWeek;
  const historyEntry = weeklyHistory?.find((h) => h.week === displayWeek);

  // Use history data when a past week is selected and history is available
  const displayBreakdown: typeof breakdown =
    historyEntry && displayWeek !== reportingWeek
      ? {
          enrollment: historyEntry.enrollment,
          personal: historyEntry.personal,
          professional: historyEntry.professional,
          total: historyEntry.total,
        }
      : breakdown;

  const p = labelPrefix ? `${labelPrefix} ` : "";
  const dbRange = weeklyTargets?.[String(displayWeek)];
  const target = dbRange
    ? { label: `${dbRange.min}–${dbRange.max}%`, min: dbRange.min, max: dbRange.max }
    : getWeekTarget(displayWeek);

  const avgForStatus = displayBreakdown?.total.results ?? resultsAvg;
  const status = dbRange
    ? displayWeek === 1
      ? ("action_plan" as const)
      : avgForStatus >= dbRange.min
      ? ("met" as const)
      : ("needs_attention" as const)
    : getTargetStatus(avgForStatus, displayWeek);

  const { startDate, endDate } = getWeekDatesFromBatch(batchStartDate, displayWeek);
  const cfg = statusConfig[status];
  const Icon = cfg.icon;

  const maxWeek = weeklyHistory ? Math.max(...weeklyHistory.map((h) => h.week), reportingWeek) : reportingWeek;

  // Chart data — flatten history for recharts
  const chartData = weeklyHistory?.map((h) => ({
    week: h.week,
    enrollment: h.enrollment.results,
    personal: h.personal.results,
    professional: h.professional.results,
    total: h.total.results,
  }));

  return (
    <div className={`rounded-xl border-2 ${cfg.borderColor} ${cfg.cardBg} px-5 py-4 space-y-4`}>
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${cfg.bgColor} shrink-0`}>
            <Calendar className={`h-5 w-5 ${cfg.textColor}`} />
          </div>
          <div>
            <p className="text-base text-white uppercase tracking-widest font-bold">
              Performance Report &mdash; as of Monday, March 23, 2026
            </p>
            <p className="text-lg font-bold">
              Week {displayWeek}
              {displayWeek === reportingWeek && (
                <span className="ml-2 text-sm font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">Reporting</span>
              )}
              {displayWeek === inProgressWeek && (
                <span className="ml-2 text-sm font-semibold px-1.5 py-0.5 rounded bg-yellow-400/10 text-yellow-600">In Progress</span>
              )}
              <span className="font-normal ml-2" style={{color: "#ffffff"}}>
                {formatWeekDate(startDate)} – {formatWeekDate(endDate)}
              </span>
            </p>
            {displayWeek === reportingWeek && inProgressWeek > reportingWeek && (
              <p className="text-sm text-muted-foreground mt-0.5">
                Week {inProgressWeek} is currently in progress
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Week dropdown */}
          {weeklyHistory && weeklyHistory.length > 0 && (
            <div className="relative">
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(Number(e.target.value))}
                className="appearance-none pl-3 pr-8 py-1.5 text-sm rounded-lg bg-background border border-border text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/40"
              >
                {Array.from({ length: maxWeek }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={w}>
                    Week {w}{w === reportingWeek ? " — Reporting" : w === inProgressWeek ? " — In Progress" : ""}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
            </div>
          )}
          {target.min !== null && (
            <span className="text-sm text-muted-foreground">Target: {target.label}</span>
          )}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-sm ${cfg.bgColor} ${cfg.textColor}`}>
            <Icon className="h-3.5 w-3.5" />
            {cfg.label}
          </div>
        </div>
      </div>

      {/* Breakdown columns */}
      {displayBreakdown ? (
        <div className={`grid gap-4 pt-1 border-t border-border/50 ${showTotal ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-1 sm:grid-cols-3"}`}>
          <GoalColumn
            label={`${p}Enrollment`}
            textColor="text-blue-500"
            barColor="bg-blue-500"
            results={displayBreakdown.enrollment.results}
            actionPlan={displayBreakdown.enrollment.actionPlan}
            onClick={onColumnClick ? () => onColumnClick("enrollment") : undefined}
            isActive={activeGoalType === "enrollment"}
          />
          <GoalColumn
            label={`${p}Personal`}
            textColor="text-yellow-400"
            barColor="bg-yellow-400"
            results={displayBreakdown.personal.results}
            actionPlan={displayBreakdown.personal.actionPlan}
            onClick={onColumnClick ? () => onColumnClick("personal") : undefined}
            isActive={activeGoalType === "personal"}
          />
          <GoalColumn
            label={`${p}Professional`}
            textColor="text-purple-500"
            barColor="bg-purple-500"
            results={displayBreakdown.professional.results}
            actionPlan={displayBreakdown.professional.actionPlan}
            onClick={onColumnClick ? () => onColumnClick("professional") : undefined}
            isActive={activeGoalType === "professional"}
          />
          {showTotal && (
            <GoalColumn
              label={`${p}Total`}
              textColor="text-teal-500"
              barColor="bg-teal-500"
              results={displayBreakdown.total.results}
              actionPlan={displayBreakdown.total.actionPlan}
            />
          )}
        </div>
      ) : (
        <div className="space-y-2 pt-1 border-t border-border/50">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-muted-foreground">Based on Results</span>
              <span className={`text-xs font-semibold ${cfg.textColor}`}>{resultsAvg}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${status === "met" ? "bg-emerald-500" : status === "needs_attention" ? "bg-orange-500" : "bg-blue-500"}`}
                style={{ width: `${resultsAvg}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Milestone trend chart */}
      {showChart && chartData && chartData.length > 1 && (
        <div className="pt-2 border-t border-border/50">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2 font-semibold">
            Milestones/Results Trend
          </p>
          <div style={{ color: "hsl(var(--foreground))" }}>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <XAxis
                dataKey="week"
                tick={{ fontSize: 13, fill: "currentColor" }}
                tickFormatter={(v) => `W${v}`}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={([dataMin, dataMax]: [number, number]) => [
                  Math.max(0, Math.floor(dataMin / 10) * 10 - 5),
                  Math.min(100, Math.ceil(dataMax / 10) * 10 + 5),
                ]}
                tick={{ fontSize: 13, fill: "currentColor" }}
                tickFormatter={(v) => `${v}%`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "13px",
                  padding: "6px 10px",
                }}
                formatter={(value: number, name: string) => [
                  `${value}%`,
                  name.charAt(0).toUpperCase() + name.slice(1),
                ]}
                labelFormatter={(label) => `Week ${label}`}
              />
              <ReferenceLine
                x={selectedWeek}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="3 3"
                strokeOpacity={0.5}
              />
              <Line
                type="monotone"
                dataKey="enrollment"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="personal"
                stroke="#facc15"
                strokeWidth={2}
                dot={{ r: 3, fill: "#facc15", strokeWidth: 0 }}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="professional"
                stroke="#a855f7"
                strokeWidth={2}
                dot={{ r: 3, fill: "#a855f7", strokeWidth: 0 }}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#14b8a6"
                strokeWidth={2}
                strokeDasharray="4 2"
                dot={{ r: 3, fill: "#14b8a6", strokeWidth: 0 }}
                activeDot={{ r: 4 }}
              />
              <Legend
                iconType="circle"
                iconSize={7}
                wrapperStyle={{ fontSize: "13px", paddingTop: "4px", color: "currentColor" }}
                formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
              />
            </LineChart>
          </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useNavigation } from "@/components/layout/DashboardShell";
import { getAllStudentsWithDetails } from "@/lib/actions/batch-overview";
import { getBatchWeekInfo } from "@/lib/actions/attendance";
import { InsightsPanel } from "./InsightsPanel";
import { PerformanceBanner } from "./PerformanceBanner";
import {
  GraduationCap,
  Target,
  AlertTriangle,
  TrendingDown,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { getAchievementStatus } from "@/lib/utils/achievement-status";

interface StudentDetail {
  id: string;
  name: string | null;
  email: string;
  role: string;
  declaration: string | null;
  councilId: string | null;
  councilName: string;
  coachName: string;
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
}

export function L3StudentsOverview() {
  const {
    setSelectedStudentId,
    setActiveL3Tab,
    setCurrentPage,
    user,
  } = useNavigation();
  const [students, setStudents] = useState<StudentDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekInfo, setWeekInfo] = useState<{ currentWeek: number; reportingWeek: number; batchStartDate: string; weeklyTargets: Record<string, { min: number; max: number }> }>({
    currentWeek: 7,
    reportingWeek: 6,
    batchStartDate: "2026-02-02",
    weeklyTargets: {},
  });

  const load = useCallback(async () => {
    try {
      const [data, info] = await Promise.all([getAllStudentsWithDetails(), getBatchWeekInfo()]);
      setStudents(data);
      setWeekInfo({ currentWeek: info.currentWeek, reportingWeek: info.reportingWeek, batchStartDate: info.batchStartDate, weeklyTargets: info.weeklyTargets });
    } catch (error) {
      console.error("Failed to load students:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleStudentClick = (studentId: string) => {
    setSelectedStudentId(studentId);
    setActiveL3Tab("goals");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  const totalStudents = students.length;
  const below50 = students.filter((s) => s.avgGoalAchievement < 50);
  const below80 = students.filter((s) => s.avgGoalAchievement < 80);
  const overallAvg = totalStudents > 0
    ? Math.round(students.reduce((sum, s) => sum + s.avgGoalAchievement, 0) / totalStudents)
    : 0;
  const overallStatus = getAchievementStatus(overallAvg);

  return (
    <div className="space-y-6">
      {/* Header */}
      {(user.role === "head_coach" || user.role === "coach") && (
        <button
          onClick={() => setCurrentPage(user.role === "head_coach" ? "L1" : "L2")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {user.role === "head_coach" ? "Back to Batch Overview" : "Back to Council Overview"}
        </button>
      )}
      <div>
        <h2 className="text-2xl font-bold">Students Overview</h2>
        <p className="text-muted-foreground">
          Track individual student performance across all councils
        </p>
      </div>

      {/* Performance Banner */}
      {(() => {
        const n = students.length || 1;
        const avg = (key: keyof typeof students[0]) =>
          Math.round(students.reduce((sum, s) => sum + (s[key] as number), 0) / n);
        const enrR = avg("enrollmentResults");
        const perR = avg("personalResults");
        const proR = avg("professionalResults");
        const enrA = avg("enrollmentCurrentWeek");
        const perA = avg("personalCurrentWeek");
        const proA = avg("professionalCurrentWeek");
        return (
          <PerformanceBanner
            reportingWeek={weekInfo.reportingWeek}
            currentWeek={weekInfo.currentWeek}
            batchStartDate={weekInfo.batchStartDate}
            weeklyTargets={weekInfo.weeklyTargets}
            breakdown={{
              enrollment: { results: enrR, actionPlan: enrA },
              personal: { results: perR, actionPlan: perA },
              professional: { results: proR, actionPlan: proA },
              total: {
                results: Math.round((enrR + perR + proR) / 3),
                actionPlan: Math.round((enrA + perA + proA) / 3),
              },
            }}
          />
        );
      })()}

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-card rounded-xl border border-border px-5 py-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black leading-none">
                  {totalStudents}
                </span>
                <span className="text-base font-semibold text-muted-foreground">Students</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total enrolled
              </p>
            </div>
          </div>
        </div>

        {/* Below 50% */}
        <div className="bg-card rounded-xl border border-border px-5 py-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-red-500/10 shrink-0">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className={`text-3xl font-black leading-none ${below50.length > 0 ? "text-red-600" : ""}`}>
                  {below50.length}
                </span>
                <span className="text-base font-semibold text-muted-foreground">Below 50%</span>
              </div>
              <p className="text-sm font-medium text-red-600 mt-1">
                {below50.length > 0 ? "Need immediate support" : "All above 50%"}
              </p>
            </div>
          </div>
        </div>

        {/* Below 80% */}
        <div className="bg-card rounded-xl border border-border px-5 py-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-amber-500/10 shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className={`text-3xl font-black leading-none ${below80.length > 0 ? "text-amber-600" : ""}`}>
                  {below80.length}
                </span>
                <span className="text-base font-semibold text-muted-foreground">Below 80%</span>
              </div>
              <p className="text-sm font-medium text-amber-600 mt-1">
                {below80.length > 0 ? "Needs attention" : "All on track"}
              </p>
            </div>
          </div>
        </div>

        {/* Overall Achievement */}
        <div className="bg-card rounded-xl border border-border px-5 py-4">
          <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-xl ${overallStatus.bgColor} shrink-0`}>
              <Target className={`h-5 w-5 ${overallStatus.textColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className={`text-3xl font-black leading-none ${overallStatus.textColor}`}>
                  {overallAvg}%
                </span>
                <span className="text-base font-semibold text-muted-foreground">Achievement</span>
              </div>
              <p className={`text-sm font-medium mt-1 ${overallStatus.textColor}`}>
                {overallStatus.label}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Student List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          All Students ({totalStudents})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students
            .sort((a, b) => a.avgGoalAchievement - b.avgGoalAchievement)
            .map((student) => {
              const status = getAchievementStatus(student.avgGoalAchievement);
              const eStatus = getAchievementStatus(student.enrollmentProgress);
              const pStatus = getAchievementStatus(student.personalProgress);
              const prStatus = getAchievementStatus(student.professionalProgress);

              return (
                <button
                  key={student.id}
                  onClick={() => handleStudentClick(student.id)}
                  className="bg-card rounded-xl border border-border p-5 text-left hover:shadow-lg hover:border-primary/50 transition-all group"
                >
                  {/* Name + achievement badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold group-hover:text-primary transition-colors">
                          {student.name || student.email}
                        </h4>
                        {student.role === "council_leader" && (
                          <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                            Leader
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {student.councilName}
                      </p>
                    </div>
                    <span
                      className={`text-lg font-black px-2.5 py-1 rounded-full ${status.bgColor} ${status.textColor}`}
                    >
                      {student.avgGoalAchievement}%
                    </span>
                  </div>

                  {/* Declaration */}
                  {student.declaration && (
                    <p className="text-sm italic text-muted-foreground line-clamp-2 mb-3">
                      &ldquo;{student.declaration}&rdquo;
                    </p>
                  )}

                  {/* Per-goal progress bars */}
                  <div className="space-y-3">
                    {[
                      { label: "Enrollment", value: student.enrollmentProgress, results: student.enrollmentResults, currentWeek: student.enrollmentCurrentWeek, st: eStatus },
                      { label: "Personal", value: student.personalProgress, results: student.personalResults, currentWeek: student.personalCurrentWeek, st: pStatus },
                      { label: "Professional", value: student.professionalProgress, results: student.professionalResults, currentWeek: student.professionalCurrentWeek, st: prStatus },
                    ].map((goal) => (
                      <div key={goal.label} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-muted-foreground">{goal.label}</span>
                          <span className={`text-sm font-bold ${goal.st.textColor}`}>{goal.value}%</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-muted-foreground shrink-0">Milestones/Results</span>
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div className={`${goal.st.barColor} h-2 rounded-full transition-all`} style={{ width: `${goal.results}%` }} />
                          </div>
                          <span className="text-xs font-bold text-muted-foreground w-8 text-right">{goal.results}%</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-muted-foreground shrink-0">Action Steps</span>
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div className={`${goal.st.barColor} h-2 rounded-full opacity-40 transition-all`} style={{ width: `${goal.currentWeek}%` }} />
                          </div>
                          <span className={`text-xs font-bold w-8 text-right ${goal.st.textColor}`}>{goal.currentWeek}%</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Arrow hint */}
                  <div className="flex items-center justify-end mt-3">
                    <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      View details <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </button>
              );
            })}

          {students.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <GraduationCap className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No students found.</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Insights — below student list */}
      <InsightsPanel mode="head_coach" />
    </div>
  );
}

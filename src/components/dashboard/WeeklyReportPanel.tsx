"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Sparkles, RefreshCw } from "lucide-react";
import { generateWeeklyReport } from "@/lib/actions/weekly-report";

interface WeeklyReportPanelProps {
  students: {
    id: string;
    name: string | null;
    email: string;
    enrollmentResults: number;
    personalResults: number;
    professionalResults: number;
    enrollmentCurrentWeek: number;
    personalCurrentWeek: number;
    professionalCurrentWeek: number;
    weeklyMeetingAttendance: Record<number, number>;
    weeklyCallAttendance: Record<number, number>;
  }[];
  councilName: string;
  currentWeek: number;
  onStudentClick: (id: string) => void;
}

type ReportData = {
  overallHealth: "excellent" | "good" | "needs_attention" | "critical";
  councilSummary: string;
  topPerformers: { name: string; highlight: string }[];
  studentsNeedingSupport: { name: string; concern: string; suggestedAction: string }[];
  weeklyWins: string[];
  coachingFocus: string;
  motivationalNote: string;
};

const healthConfig: Record<ReportData["overallHealth"], { label: string; className: string }> = {
  excellent: { label: "Excellent", className: "bg-green-100 text-green-800 border-green-200" },
  good: { label: "Good", className: "bg-blue-100 text-blue-800 border-blue-200" },
  needs_attention: { label: "Needs Attention", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  critical: { label: "Critical", className: "bg-red-100 text-red-800 border-red-200" },
};

export function WeeklyReportPanel({
  students,
  councilName,
  currentWeek,
  onStudentClick,
}: WeeklyReportPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setIsLoading(true);
    setError(null);
    try {
      const mappedStudents = students.map((s) => ({
        name: s.name,
        email: s.email,
        enrollmentResults: s.enrollmentResults,
        personalResults: s.personalResults,
        professionalResults: s.professionalResults,
        enrollmentCurrentWeek: s.enrollmentCurrentWeek,
        personalCurrentWeek: s.personalCurrentWeek,
        professionalCurrentWeek: s.professionalCurrentWeek,
        meetingAttendance: s.weeklyMeetingAttendance[currentWeek] ?? null,
        callAttendance: s.weeklyCallAttendance[currentWeek] ?? null,
      }));
      const result = await generateWeeklyReport({ councilName, weekNumber: currentWeek, students: mappedStudents });
      setReport(result);
      setIsExpanded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegenerate() {
    setReport(null);
    await handleGenerate();
  }

  if (!isExpanded || !report) {
    return (
      <div className="w-full">
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full bg-card border border-border rounded-xl px-5 py-3.5 flex items-center justify-between text-sm font-medium text-foreground hover:bg-muted/40 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span className="flex items-center gap-2">
            {isLoading ? (
              <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            )}
            {isLoading ? "Generating AI Report…" : `📊 Generate Week ${currentWeek} AI Report`}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
        {error && <p className="mt-2 text-xs text-red-500 px-1">{error}</p>}
      </div>
    );
  }

  const health = healthConfig[report.overallHealth];

  return (
    <div className="w-full bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExpanded(false)}
            className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
          >
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            Week {currentWeek} AI Report
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          </button>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${health.className}`}>
            {health.label}
          </span>
        </div>
        <button
          onClick={handleRegenerate}
          disabled={isLoading}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Regenerate
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Council Summary */}
        <p className="text-sm text-foreground leading-relaxed">{report.councilSummary}</p>

        {/* Top Performers + Needs Support */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">⭐ Top Performers</h4>
            {report.topPerformers.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {report.topPerformers.map((p, i) => (
                  <div key={i} className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs">
                    <span className="font-semibold text-green-800">{p.name}</span>
                    <span className="text-green-700 ml-1">— {p.highlight}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No top performers identified this week.</p>
            )}
          </div>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">⚠️ Needs Support</h4>
            {report.studentsNeedingSupport.length > 0 ? (
              <div className="space-y-2">
                {report.studentsNeedingSupport.map((s, i) => {
                  const student = students.find(
                    (st) =>
                      (st.name ?? st.email).toLowerCase().includes(s.name.toLowerCase()) ||
                      s.name.toLowerCase().includes((st.name ?? "").toLowerCase())
                  );
                  return (
                    <div
                      key={i}
                      className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2.5 text-xs cursor-pointer hover:bg-orange-100 transition-colors"
                      onClick={() => student && onStudentClick(student.id)}
                    >
                      <p className="font-semibold text-orange-800">{s.name}</p>
                      <p className="text-orange-700 mt-0.5">{s.concern}</p>
                      <p className="text-orange-600 mt-1 italic">→ {s.suggestedAction}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">All students are on track.</p>
            )}
          </div>
        </div>

        {/* Weekly Wins */}
        {report.weeklyWins.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">Weekly Wins</h4>
            <ul className="space-y-1">
              {report.weeklyWins.map((win, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-green-500 mt-0.5 shrink-0">•</span>
                  <span className="text-foreground">{win}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Coaching Focus */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3.5">
          <h4 className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1.5">Coaching Focus for Next Week</h4>
          <p className="text-sm text-blue-800 leading-relaxed font-medium">{report.coachingFocus}</p>
        </div>

        {/* Motivational Note */}
        <p className="text-sm text-muted-foreground italic text-center px-4">"{report.motivationalNote}"</p>
      </div>
    </div>
  );
}

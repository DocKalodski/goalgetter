"use client";

import { useEffect, useState } from "react";
import { useNavigation } from "@/components/layout/DashboardShell";
import { getStudentDetail, getStudentWeeklyHistory } from "@/lib/actions/students";
import type { WeekHistoryEntry } from "@/lib/actions/coach-overview";
import { getBatchWeekInfo } from "@/lib/actions/attendance";
import { GoalsTab } from "./GoalsTab";
import { AttendanceTab } from "./AttendanceTab";
import { FeedbackTab } from "./FeedbackTab";
import { PerformanceBanner } from "./PerformanceBanner";
import { CoachNotesPanel } from "./CoachNotesPanel";
import { AskMeChatTab } from "./AskMeChatTab";
import { StudentProfileCard } from "./StudentProfileCard";
import { ArrowLeft } from "lucide-react";
import { useReminderNotifications } from "@/lib/hooks/useReminderNotifications";

interface StudentInfo {
  id: string;
  name: string | null;
  email: string;
  pendingName: string | null;
  declaration: string | null;
  pendingDeclarationId: string | null;
  pendingDeclarationText: string | null;
  buddyName: string | null;
  councilName: string | null;
  coachName: string | null;
  enrollmentProgress: number;
  personalProgress: number;
  professionalProgress: number;
  enrollmentResults: number;
  personalResults: number;
  professionalResults: number;
  enrollmentCurrentWeek: number;
  personalCurrentWeek: number;
  professionalCurrentWeek: number;
  unreadDmCount: number;
}

export function L3StudentDetail() {
  const {
    selectedStudentId,
    setSelectedStudentId,
    activeL3Tab,
    setActiveL3Tab,
    setSelectedGoalType,
    user,
  } = useNavigation();
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [weeklyHistory, setWeeklyHistory] = useState<WeekHistoryEntry[]>([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [weekInfo, setWeekInfo] = useState<{ currentWeek: number; reportingWeek: number; batchStartDate: string; weeklyTargets: Record<string, { min: number; max: number }> }>({
    currentWeek: 7,
    reportingWeek: 6,
    batchStartDate: "2026-02-02",
    weeklyTargets: {},
  });

  const targetId = selectedStudentId || user.userId;
  const isCoach = user.role === "coach" || user.role === "head_coach";
  const isHC = user.role === "head_coach";

  // Browser push reminders for action steps and milestones
  useReminderNotifications(targetId);

  useEffect(() => {
    async function load() {
      try {
        const [data, info, history] = await Promise.all([
          getStudentDetail(targetId),
          getBatchWeekInfo(),
          getStudentWeeklyHistory(targetId),
        ]);
        setStudent(data);
        setWeeklyHistory(history);
        setUnreadChatCount(data?.unreadDmCount ?? 0);
        setWeekInfo({ currentWeek: info.currentWeek, reportingWeek: info.reportingWeek, batchStartDate: info.batchStartDate, weeklyTargets: info.weeklyTargets });
      } catch (error) {
        console.error("Failed to load student:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [targetId]);

  if (loading || !student) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-24 bg-muted animate-pulse rounded-xl" />
        <div className="h-96 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Back button for coaches */}
      {isCoach && (
        <button
          onClick={() => setSelectedStudentId(null)}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-muted hover:bg-muted/70 border border-border transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Council Summary
        </button>
      )}

      {/* Student Profile Card */}
      <StudentProfileCard
        student={student}
        isCoach={isCoach}
        onRefresh={() => {
          getStudentDetail(targetId).then(setStudent).catch(console.error);
        }}
      />

      {/* Performance Banner */}
      <PerformanceBanner
        reportingWeek={weekInfo.reportingWeek}
        currentWeek={weekInfo.currentWeek}
        batchStartDate={weekInfo.batchStartDate}
        weeklyTargets={weekInfo.weeklyTargets}
        labelPrefix={student.name?.split(" ")[0] ?? ""}
        showTotal={true}
        weeklyHistory={weeklyHistory}
        onColumnClick={(type) => { setSelectedGoalType(type); setActiveL3Tab("goals"); }}
        breakdown={{
          enrollment: { results: student.enrollmentResults, actionPlan: student.enrollmentCurrentWeek },
          personal: { results: student.personalResults, actionPlan: student.personalCurrentWeek },
          professional: { results: student.professionalResults, actionPlan: student.professionalCurrentWeek },
          total: {
            results: Math.round((student.enrollmentResults + student.personalResults + student.professionalResults) / 3),
            actionPlan: Math.round((student.enrollmentCurrentWeek + student.personalCurrentWeek + student.professionalCurrentWeek) / 3),
          },
        }}
      />

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-4 overflow-x-auto">
          <button
            onClick={() => setActiveL3Tab("goals")}
            className={`pb-3 text-base font-semibold border-b-2 transition-colors whitespace-nowrap ${activeL3Tab === "goals" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            Actual Goals
          </button>
          <button
            onClick={() => setActiveL3Tab("attendance")}
            className={`pb-3 text-base font-semibold border-b-2 transition-colors whitespace-nowrap ${activeL3Tab === "attendance" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            Attendance
          </button>
          {!isHC && (
            <button
              onClick={() => { setActiveL3Tab("ask-me-chat"); setUnreadChatCount(0); }}
              className={`relative pb-3 text-base font-semibold border-b-2 transition-colors whitespace-nowrap ${activeL3Tab === "ask-me-chat" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {isCoach ? "💬 Ask Coachee Chat" : "💬 Ask Coach Chat"}
              {unreadChatCount > 0 && (
                <span className="absolute -top-2 -right-4 min-w-[20px] h-5 flex items-center justify-center rounded-full bg-red-600 text-white text-[11px] font-bold px-1.5 shadow-md ring-2 ring-red-400/50">
                  {unreadChatCount > 9 ? "9+" : unreadChatCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Student-facing coach notes */}
      {user.role === "student" && (
        <CoachNotesPanel studentId={targetId} />
      )}

      {/* Tab content */}
      {activeL3Tab === "goals" ? (
        <GoalsTab studentId={targetId} readOnly={isHC} />
      ) : activeL3Tab === "attendance" ? (
        <div className="space-y-8">
          <AttendanceTab studentId={targetId} readOnly={isHC} />
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Attendance Analysis</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <FeedbackTab studentId={targetId} view="attendance" />
          </div>
        </div>
      ) : activeL3Tab === "ask-me-chat" && !isHC ? (
        <AskMeChatTab
          studentId={targetId}
          studentName={student.name || student.email}
        />
      ) : (
        <GoalsTab studentId={targetId} readOnly={isHC} />
      )}
    </div>
  );
}

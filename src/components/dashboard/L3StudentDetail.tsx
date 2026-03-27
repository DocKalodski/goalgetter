"use client";

import { useEffect, useState } from "react";
import { useNavigation } from "@/components/layout/DashboardShell";
import { getStudentDetail, getStudentWeeklyHistory } from "@/lib/actions/students";
import type { WeekHistoryEntry } from "@/lib/actions/coach-overview";
import { getBatchWeekInfo } from "@/lib/actions/attendance";
import { GoalsTab } from "./GoalsTab";
import { AttendanceTab } from "./AttendanceTab";
import { FeedbackTab } from "./FeedbackTab";
import { ActionPlannerTab } from "./ActionPlannerTab";
import { PerformanceBanner } from "./PerformanceBanner";
import { CoachNotesPanel } from "./CoachNotesPanel";
import { ArrowLeft } from "lucide-react";
import { useReminderNotifications } from "@/lib/hooks/useReminderNotifications";

interface StudentInfo {
  id: string;
  name: string | null;
  email: string;
  declaration: string | null;
  enrollmentProgress: number;
  personalProgress: number;
  professionalProgress: number;
  enrollmentResults: number;
  personalResults: number;
  professionalResults: number;
  enrollmentCurrentWeek: number;
  personalCurrentWeek: number;
  professionalCurrentWeek: number;
}

export function L3StudentDetail() {
  const {
    selectedStudentId,
    setSelectedStudentId,
    activeL3Tab,
    setActiveL3Tab,
    setSelectedGoalType,
    aiCoachInitialMessage,
    setAiCoachInitialMessage,
    user,
  } = useNavigation();
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [weeklyHistory, setWeeklyHistory] = useState<WeekHistoryEntry[]>([]);
  const [weekInfo, setWeekInfo] = useState<{ currentWeek: number; reportingWeek: number; batchStartDate: string; weeklyTargets: Record<string, { min: number; max: number }> }>({
    currentWeek: 7,
    reportingWeek: 6,
    batchStartDate: "2026-02-02",
    weeklyTargets: {},
  });

  const targetId = selectedStudentId || user.userId;
  const isCoach = user.role === "coach" || user.role === "head_coach";

  // Browser push reminders for action steps and milestones
  useReminderNotifications(targetId);

  // Pre-call notification: fires 10 min before scheduled group calls
  const { minutesUntil: preCallMinutes } = usePreCallNotifications(isCoach);

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
      {/* Compact header row */}
      <div className="flex items-center gap-3 flex-wrap">
        {isCoach && (
          <button
            onClick={() => setSelectedStudentId(null)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-muted hover:bg-muted/70 border border-border transition-colors shrink-0"
          >
            <ArrowLeft className="h-3 w-3" />
            Council Summary
          </button>
        )}
        <div className="min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h2 className="text-xl font-bold leading-tight">{student.name || student.email}</h2>
            <span className="text-xs text-muted-foreground">Student Summary</span>
          </div>
          {student.declaration
            ? <p className="text-xs text-muted-foreground italic mt-0.5">"{student.declaration}"</p>
            : null}
        </div>
      </div>

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
            onClick={() => setActiveL3Tab("action-planner")}
            className={`pb-3 text-base font-semibold border-b-2 transition-colors whitespace-nowrap ${activeL3Tab === "action-planner" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            Action Planner
          </button>
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
          <button
            onClick={() => setActiveL3Tab("calendar")}
            className={`pb-3 text-base font-semibold border-b-2 transition-colors whitespace-nowrap ${activeL3Tab === "calendar" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            Action Calendar
          </button>
          {isCoach && (
            <button
              onClick={() => setActiveL3Tab("journey")}
              className={`pb-3 text-base font-semibold border-b-2 transition-colors whitespace-nowrap ${activeL3Tab === "journey" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              📔 Adventure Journal
            </button>
          )}
          {isCoach && (
            <button
              onClick={() => setActiveL3Tab("ask-ai")}
              className={`pb-3 text-base font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${activeL3Tab === "ask-ai" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/15 text-primary text-[9px] font-bold">AI</span>
              Ask AI<BetaPill />
            </button>
          )}
          {isCoach && (
            <button
              onClick={() => setActiveL3Tab("feedback")}
              className={`pb-3 text-base font-semibold border-b-2 transition-colors whitespace-nowrap ${activeL3Tab === "feedback" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              AI Post Assessment (for LEAP 99 Coaches only)
            </button>
          )}
          {isCoach && (
            <button
              onClick={() => setActiveL3Tab("ai-coach")}
              className={`pb-3 text-base font-semibold border-b-2 transition-colors whitespace-nowrap ${activeL3Tab === "ai-coach" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              🎙 AI Coach<BetaPill />
            </button>
          )}
          {isCoach && (
            <button
              onClick={() => setActiveL3Tab("voice-coach")}
              className={`pb-3 text-base font-semibold border-b-2 transition-colors whitespace-nowrap ${activeL3Tab === "voice-coach" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              🤖 Voice AI Coach<BetaPill />
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
        <GoalsTab studentId={targetId} />
      ) : activeL3Tab === "attendance" ? (
        <div className="space-y-8">
          <AttendanceTab studentId={targetId} />
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Attendance Analysis</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <FeedbackTab studentId={targetId} view="attendance" />
          </div>
        </div>
      ) : activeL3Tab === "action-planner" ? (
        <ActionPlannerTab studentId={targetId} />
      ) : activeL3Tab === "calendar" ? (
        <StudentCalendarWidget
          studentId={targetId}
          currentWeek={weekInfo.currentWeek}
          batchStartDate={weekInfo.batchStartDate}
        />
      ) : activeL3Tab === "feedback" ? (
        <FeedbackTab studentId={targetId} view="assessments" />
      ) : activeL3Tab === "ask-ai" ? (
        <AskAITab
          studentContext={{
            studentName: student.name?.split(" ")[0] ?? student.email,
            enrollmentResults: student.enrollmentResults,
            personalResults: student.personalResults,
            professionalResults: student.professionalResults,
            enrollmentCurrentWeek: student.enrollmentCurrentWeek,
            personalCurrentWeek: student.personalCurrentWeek,
            professionalCurrentWeek: student.professionalCurrentWeek,
            reportingWeek: weekInfo.reportingWeek,
          }}
          initialMessage={aiCoachInitialMessage}
          onInitialMessageSent={() => setAiCoachInitialMessage(null)}
          coachSession={isCoach ? {
            studentId: targetId,
            studentName: student.name?.split(" ")[0] ?? student.email,
            weekNumber: weekInfo.reportingWeek,
          } : undefined}
        />
      ) : activeL3Tab === "journey" ? (
        <JourneyJournalTab
          studentId={targetId}
          studentName={student.name || student.email}
          currentWeek={weekInfo.currentWeek}
          isCoach={isCoach}
          preCallMinutes={preCallMinutes}
        />
      ) : activeL3Tab === "ai-coach" ? (
        <AICoachTab
          studentId={targetId}
          studentName={student.name?.split(" ")[0] ?? student.email}
          weekNumber={weekInfo.reportingWeek}
          onSendToAskAI={(msg) => { setAiCoachInitialMessage(msg); setActiveL3Tab("ask-ai"); }}
        />
      ) : activeL3Tab === "voice-coach" ? (
        <VoiceAICoachTab
          students={[{ id: targetId, name: student.name }]}
          defaultStudentId={targetId}
          weekNumber={weekInfo.reportingWeek}
          studentContext={{
            studentName: student.name?.split(" ")[0] ?? student.email,
            enrollmentResults: student.enrollmentResults,
            personalResults: student.personalResults,
            professionalResults: student.professionalResults,
            enrollmentCurrentWeek: student.enrollmentCurrentWeek,
            personalCurrentWeek: student.personalCurrentWeek,
            professionalCurrentWeek: student.professionalCurrentWeek,
            reportingWeek: weekInfo.reportingWeek,
          }}
        />
      ) : (
        <ActionPlannerTab studentId={targetId} />
      )}
    </div>
  );
}

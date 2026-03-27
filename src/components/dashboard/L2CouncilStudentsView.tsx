"use client";

import { useEffect, useState, useCallback } from "react";
import { useNavigation } from "@/components/layout/DashboardShell";
import { getCouncilStudents, getCouncilList, getUnassignedStudents, assignStudentsToCouncil, removeStudentFromCouncil } from "@/lib/actions/councils";
import { getBatchWeekInfo } from "@/lib/actions/attendance";
import { updateDeclarationForStudent } from "@/lib/actions/alignment";
import { ArrowLeft, UserPlus, Pencil, Check, X, Search, Trash2 } from "lucide-react";
import { AddStudentPanel } from "./AddStudentPanel";
import { PerformanceBanner } from "./PerformanceBanner";
import { WeeklyReportPanel } from "./WeeklyReportPanel";
import { BatchPPScorecard } from "./BatchPPScorecard";
import { AssignExistingPanel } from "./AssignExistingPanel";
import { Star } from "lucide-react";

interface StudentRow {
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
  weeklyMeetingAttendance: Record<number, number>;
  weeklyCallAttendance: Record<number, number>;
}

interface CouncilTab {
  id: string;
  name: string;
}

export function L2CouncilStudentsView() {
  const {
    selectedCouncilId,
    setSelectedCouncilId,
    setCurrentPage,
    setSelectedStudentId,
    setSelectedGoalType,
    setActiveL3Tab,
    user,
  } = useNavigation();

  const [councils, setCouncils] = useState<CouncilTab[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [councilName, setCouncilName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAssignExisting, setShowAssignExisting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [weekInfo, setWeekInfo] = useState<{ currentWeek: number; reportingWeek: number; batchStartDate: string; weeklyTargets: Record<string, { min: number; max: number }> }>({
    currentWeek: 6,
    reportingWeek: 7,
    batchStartDate: "2026-02-02",
    weeklyTargets: {},
  });

  // Declaration editing state: studentId → draft text
  const [editingDecl, setEditingDecl] = useState<string | null>(null);
  const [declDraft, setDeclDraft] = useState("");
  const [savingDecl, setSavingDecl] = useState(false);

  // Load council list once
  useEffect(() => {
    getCouncilList().then(setCouncils).catch(console.error);
  }, []);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const [data, info] = await Promise.all([
        getCouncilStudents(selectedCouncilId),
        getBatchWeekInfo(),
      ]);
      setStudents(data.students);
      setCouncilName(data.councilName);
      setWeekInfo({ currentWeek: info.currentWeek, reportingWeek: info.reportingWeek, batchStartDate: info.batchStartDate, weeklyTargets: info.weeklyTargets });
    } catch (error) {
      console.error("Failed to load students:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCouncilId]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  function handleGoalClick(
    studentId: string,
    goalType: "enrollment" | "personal" | "professional"
  ) {
    setSelectedStudentId(studentId);
    setSelectedGoalType(goalType);
    setActiveL3Tab("goals");
    setCurrentPage("L3");
  }

  function handleAttendanceClick(studentId: string) {
    setSelectedStudentId(studentId);
    setActiveL3Tab("attendance");
    setCurrentPage("L3");
  }

  function startEditDecl(student: StudentRow) {
    setEditingDecl(student.id);
    setDeclDraft(student.declaration ?? "");
  }

  async function saveDecl(studentId: string) {
    setSavingDecl(true);
    try {
      const result = await updateDeclarationForStudent(studentId, declDraft);
      if (result.success) {
        setStudents((prev) =>
          prev.map((s) =>
            s.id === studentId ? { ...s, declaration: declDraft.trim() } : s
          )
        );
        setEditingDecl(null);
      }
    } finally {
      setSavingDecl(false);
    }
  }

  async function handleRemoveStudent(studentId: string, studentName: string) {
    if (!confirm(`Remove ${studentName} from this council? They can be re-assigned later.`)) return;
    setRemovingId(studentId);
    try {
      await removeStudentFromCouncil(studentId);
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
    } finally {
      setRemovingId(null);
    }
  }

  const canAddStudents = user.role === "coach" || user.role === "head_coach";
  const canEditDecl = user.role === "coach" || user.role === "head_coach";
  const [showBatchPP, setShowBatchPP] = useState(false);

  return (
    <div className="space-y-3">
      {showBatchPP && (
        <BatchPPScorecard
          students={students}
          councilId={selectedCouncilId ?? ""}
          currentWeek={weekInfo.currentWeek}
          onClose={() => setShowBatchPP(false)}
        />
      )}

      {/* Page title — compact single row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          {(user.role === "head_coach" || user.role === "coach") && (
            <button
              onClick={() => setCurrentPage("L1")}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-muted hover:bg-muted/70 border border-border transition-colors shrink-0"
            >
              <ArrowLeft className="h-3 w-3" />
              {user.role === "head_coach" ? "Team Summary" : "Back"}
            </button>
          )}
          <div className="min-w-0">
            <h2 className="text-xl font-bold leading-tight">Council Summary</h2>
            <p className="text-xs text-muted-foreground">Coach View · {councilName}</p>
          </div>
        </div>
      </div>

      {/* Council Tabs */}
      {councils.length > 1 && (
        <div className="flex gap-1 border-b border-border overflow-x-auto pb-0">
          {councils.map((c) => {
            const isActive = c.id === selectedCouncilId;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCouncilId(c.id)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs text-muted-foreground">{students.length} student{students.length !== 1 ? "s" : ""} in council</p>
        {canAddStudents && (
          <div className="flex gap-2">
            <button
              onClick={() => { setShowAssignExisting((v) => !v); setShowAddStudent(false); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${showAssignExisting ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary hover:bg-primary/20"}`}
            >
              <Search className="h-3.5 w-3.5" />
              Assign Existing
            </button>
            <button
              onClick={() => { setShowAddStudent((v) => !v); setShowAssignExisting(false); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${showAddStudent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              <UserPlus className="h-3.5 w-3.5" />
              New Student
            </button>
          </div>
        )}
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
        const totalR = Math.round((enrR + perR + proR) / 3);
        const totalA = Math.round((enrA + perA + proA) / 3);
        return (
          <PerformanceBanner
            reportingWeek={weekInfo.reportingWeek}
            currentWeek={weekInfo.currentWeek}
            batchStartDate={weekInfo.batchStartDate}
            weeklyTargets={weekInfo.weeklyTargets}
            labelPrefix="Council"
            breakdown={{
              enrollment: { results: enrR, actionPlan: enrA },
              personal: { results: perR, actionPlan: perA },
              professional: { results: proR, actionPlan: proA },
              total: { results: totalR, actionPlan: totalA },
            }}
          />
        );
      })()}

      {canAddStudents && showAssignExisting && selectedCouncilId && (
        <AssignExistingPanel
          councilId={selectedCouncilId}
          onAssigned={() => { setShowAssignExisting(false); loadStudents(); }}
          onClose={() => setShowAssignExisting(false)}
        />
      )}

      {canAddStudents && showAddStudent && (
        <AddStudentPanel
          councilId={selectedCouncilId || undefined}
          onStudentAdded={loadStudents}
          onClose={() => setShowAddStudent(false)}
        />
      )}

      {loading ? (
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-5 py-4 text-base font-bold uppercase tracking-wide text-muted-foreground">Student</th>
                  <th className="text-center px-5 py-4 text-base font-bold uppercase tracking-wide text-blue-500">Enrollment</th>
                  <th className="text-center px-5 py-4 text-base font-bold uppercase tracking-wide text-yellow-500">Personal</th>
                  <th className="text-center px-5 py-4 text-base font-bold uppercase tracking-wide text-purple-500">Professional</th>
                  <th className="text-center px-5 py-4 text-base font-bold uppercase tracking-wide text-muted-foreground">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30"
                  >
                    {/* Student name + declaration */}
                    <td className="px-5 py-5 max-w-[280px]">
                      <div className="flex items-center gap-2 group">
                        <div
                          className="flex-1 text-base font-bold cursor-pointer hover:text-primary transition-colors leading-tight"
                          onClick={() => handleGoalClick(student.id, "enrollment")}
                        >
                          {student.name || student.email}
                        </div>
                        {canAddStudents && (
                          <button
                            onClick={() => handleRemoveStudent(student.id, student.name || student.email)}
                            disabled={removingId === student.id}
                            title="Remove from council"
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground disabled:opacity-30"
                          >
                            {removingId === student.id ? <span className="text-xs">…</span> : <Trash2 className="h-3.5 w-3.5" />}
                          </button>
                        )}
                      </div>

                      {editingDecl === student.id ? (
                        <div className="mt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
                          <textarea
                            value={declDraft}
                            onChange={(e) => setDeclDraft(e.target.value)}
                            rows={3}
                            className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Enter student's declaration..."
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveDecl(student.id)}
                              disabled={savingDecl || !declDraft.trim()}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
                            >
                              <Check className="h-4 w-4" />Save
                            </button>
                            <button
                              onClick={() => setEditingDecl(null)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-muted text-muted-foreground hover:bg-muted/80"
                            >
                              <X className="h-4 w-4" />Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2 mt-1 group">
                          <p className={`flex-1 text-xs leading-relaxed line-clamp-2 ${student.declaration ? "text-muted-foreground" : "text-muted-foreground/40 italic"}`}>
                            {student.declaration || "No declaration"}
                          </p>
                          {canEditDecl && (
                            <button
                              onClick={(e) => { e.stopPropagation(); startEditDecl(student); }}
                              className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-muted"
                            >
                              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Enrollment */}
                    <td className="px-5 py-5">
                      <button onClick={(e) => { e.stopPropagation(); handleGoalClick(student.id, "enrollment"); }} className="w-full text-left rounded-xl hover:bg-blue-500/8 transition-colors" title="View Enrollment Goals →">
                        <div className="space-y-2 min-w-[110px]">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-medium text-muted-foreground">Milestones/Results</span>
                              <span className="text-xl font-black text-blue-500 tabular-nums">{student.enrollmentResults}%</span>
                            </div>
                            <div className="bg-muted rounded-full h-2">
                              <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${student.enrollmentResults}%` }} />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-medium text-muted-foreground">Action Steps</span>
                              <span className="text-base font-bold text-muted-foreground tabular-nums">{student.enrollmentCurrentWeek}%</span>
                            </div>
                            <div className="bg-muted rounded-full h-2">
                              <div className="bg-blue-500 h-2 rounded-full opacity-40 transition-all" style={{ width: `${student.enrollmentCurrentWeek}%` }} />
                            </div>
                          </div>
                        </div>
                      </button>
                    </td>

                    {/* Personal */}
                    <td className="px-5 py-5">
                      <button onClick={(e) => { e.stopPropagation(); handleGoalClick(student.id, "personal"); }} className="w-full text-left rounded-xl hover:bg-yellow-400/8 transition-colors" title="View Personal Goals →">
                        <div className="space-y-2 min-w-[110px]">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-medium text-muted-foreground">Milestones/Results</span>
                              <span className="text-xl font-black text-yellow-400 tabular-nums">{student.personalResults}%</span>
                            </div>
                            <div className="bg-muted rounded-full h-2">
                              <div className="bg-yellow-400 h-2 rounded-full transition-all" style={{ width: `${student.personalResults}%` }} />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-medium text-muted-foreground">Action Steps</span>
                              <span className="text-base font-bold text-muted-foreground tabular-nums">{student.personalCurrentWeek}%</span>
                            </div>
                            <div className="bg-muted rounded-full h-2">
                              <div className="bg-yellow-400 h-2 rounded-full opacity-40 transition-all" style={{ width: `${student.personalCurrentWeek}%` }} />
                            </div>
                          </div>
                        </div>
                      </button>
                    </td>

                    {/* Professional */}
                    <td className="px-5 py-5">
                      <button onClick={(e) => { e.stopPropagation(); handleGoalClick(student.id, "professional"); }} className="w-full text-left rounded-xl hover:bg-purple-500/8 transition-colors" title="View Professional Goals →">
                        <div className="space-y-2 min-w-[110px]">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-medium text-muted-foreground">Milestones/Results</span>
                              <span className="text-xl font-black text-purple-500 tabular-nums">{student.professionalResults}%</span>
                            </div>
                            <div className="bg-muted rounded-full h-2">
                              <div className="bg-purple-500 h-2 rounded-full transition-all" style={{ width: `${student.professionalResults}%` }} />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-medium text-muted-foreground">Action Steps</span>
                              <span className="text-base font-bold text-muted-foreground tabular-nums">{student.professionalCurrentWeek}%</span>
                            </div>
                            <div className="bg-muted rounded-full h-2">
                              <div className="bg-purple-500 h-2 rounded-full opacity-40 transition-all" style={{ width: `${student.professionalCurrentWeek}%` }} />
                            </div>
                          </div>
                        </div>
                      </button>
                    </td>

                    {/* Attendance — Mtg + Call split */}
                    <td className="px-5 py-5">
                      {(() => {
                        const weeks = Array.from({ length: weekInfo.currentWeek }, (_, i) => i + 1);
                        const mtgRates = weeks.map((w) => student.weeklyMeetingAttendance[w]).filter((r) => r !== undefined) as number[];
                        const callRates = weeks.map((w) => student.weeklyCallAttendance[w]).filter((r) => r !== undefined) as number[];
                        const mtgAvg = mtgRates.length > 0 ? Math.round(mtgRates.reduce((a, b) => a + b, 0) / mtgRates.length) : null;
                        const callAvg = callRates.length > 0 ? Math.round(callRates.reduce((a, b) => a + b, 0) / callRates.length) : null;
                        const dotColor = (rate: number | undefined) =>
                          rate === undefined ? "bg-muted-foreground/20" : rate >= 75 ? "bg-green-500" : rate >= 50 ? "bg-yellow-400" : "bg-red-500";
                        const numColor = (avg: number | null) =>
                          avg === null ? "text-muted-foreground/40" : avg >= 75 ? "text-green-500" : avg >= 50 ? "text-yellow-400" : "text-red-500";
                        return (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleAttendanceClick(student.id); }}
                            className="group inline-block hover:opacity-80 transition-opacity text-left"
                            title="View attendance"
                          >
                            <div className="space-y-2 min-w-[120px]">
                              {/* Meetings row */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-medium text-muted-foreground">Mtg</span>
                                  <span className={`text-xl font-black tabular-nums leading-none ${numColor(mtgAvg)}`}>
                                    {mtgAvg !== null ? `${mtgAvg}%` : "—"}
                                  </span>
                                </div>
                                <div className="flex flex-nowrap gap-[3px] items-center">
                                  {weeks.map((week) => (
                                    <div key={week} className={`w-2 h-2 rounded-full shrink-0 ${dotColor(student.weeklyMeetingAttendance[week])}`} />
                                  ))}
                                </div>
                              </div>
                              {/* Calls row */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-medium text-muted-foreground">Call</span>
                                  <span className={`text-xl font-black tabular-nums leading-none ${numColor(callAvg)}`}>
                                    {callAvg !== null ? `${callAvg}%` : "—"}
                                  </span>
                                </div>
                                <div className="flex flex-nowrap gap-[3px] items-center">
                                  {weeks.map((week) => (
                                    <div key={week} className={`w-2 h-2 rounded-full shrink-0 ${dotColor(student.weeklyCallAttendance[week])}`} />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Weekly Report Panel — coaches only */}
      {(user.role === "coach" || user.role === "head_coach") && !loading && students.length > 0 && (
        <WeeklyReportPanel
          students={students}
          councilName={councilName}
          currentWeek={weekInfo.reportingWeek}
          onStudentClick={(id) => { setSelectedStudentId(id); setCurrentPage("L3"); }}
        />
      )}


    </div>
  );
}

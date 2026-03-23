"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";

interface StudentRow {
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
}

interface AtRiskPanelProps {
  students: StudentRow[];
  currentWeek: number;
  weeklyTargets: Record<string, { min: number; max: number }>;
  onStudentClick: (studentId: string) => void;
}

interface FlaggedStudent {
  student: StudentRow;
  flags: { label: string; category: "enrollment" | "personal" | "professional" | "attendance" }[];
}

export function AtRiskPanel({
  students,
  currentWeek,
  weeklyTargets,
  onStudentClick,
}: AtRiskPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const target = weeklyTargets[String(currentWeek)];
  const minTarget = target?.min ?? 50;
  const minSteps = minTarget - 10;

  const flaggedStudents: FlaggedStudent[] = [];

  for (const student of students) {
    const flags: FlaggedStudent["flags"] = [];

    if (student.enrollmentResults < minTarget) {
      flags.push({
        label: `Enrollment M/R ${student.enrollmentResults}%`,
        category: "enrollment",
      });
    }
    if (student.personalResults < minTarget) {
      flags.push({
        label: `Personal M/R ${student.personalResults}%`,
        category: "personal",
      });
    }
    if (student.professionalResults < minTarget) {
      flags.push({
        label: `Professional M/R ${student.professionalResults}%`,
        category: "professional",
      });
    }

    if (student.enrollmentCurrentWeek < minSteps) {
      flags.push({
        label: `Enrollment Steps ${student.enrollmentCurrentWeek}%`,
        category: "enrollment",
      });
    }
    if (student.personalCurrentWeek < minSteps) {
      flags.push({
        label: `Personal Steps ${student.personalCurrentWeek}%`,
        category: "personal",
      });
    }
    if (student.professionalCurrentWeek < minSteps) {
      flags.push({
        label: `Professional Steps ${student.professionalCurrentWeek}%`,
        category: "professional",
      });
    }

    const prevWeek = currentWeek - 1;
    if (
      prevWeek in student.weeklyMeetingAttendance &&
      student.weeklyMeetingAttendance[prevWeek] < 50
    ) {
      flags.push({
        label: `Low Attendance ${student.weeklyMeetingAttendance[prevWeek]}%`,
        category: "attendance",
      });
    }
    if (
      prevWeek in student.weeklyCallAttendance &&
      student.weeklyCallAttendance[prevWeek] < 50
    ) {
      flags.push({
        label: `Low Call Attendance ${student.weeklyCallAttendance[prevWeek]}%`,
        category: "attendance",
      });
    }

    if (flags.length > 0) {
      flaggedStudents.push({ student, flags });
    }
  }

  if (flaggedStudents.length === 0) return null;

  const chipClass = (category: FlaggedStudent["flags"][number]["category"]) => {
    switch (category) {
      case "enrollment":
        return "bg-blue-100 text-blue-700";
      case "personal":
        return "bg-yellow-100 text-yellow-700";
      case "professional":
        return "bg-purple-100 text-purple-700";
      case "attendance":
        return "bg-red-100 text-red-700";
    }
  };

  return (
    <div className="mb-4 bg-red-500/8 border border-red-500/20 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 text-red-600 font-semibold text-sm hover:bg-red-500/10 transition-colors"
      >
        <span className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {flaggedStudents.length} student{flaggedStudents.length !== 1 ? "s" : ""} need
          {flaggedStudents.length === 1 ? "s" : ""} attention this week
        </span>
        {expanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-red-500/20">
          {flaggedStudents.map(({ student, flags }, index) => (
            <div key={student.id}>
              {index > 0 && <div className="border-t border-red-500/10" />}
              <div className="flex items-center justify-between px-4 py-3 gap-4">
                <div className="min-w-0 w-40 shrink-0">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {student.name ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                </div>

                <div className="flex flex-wrap gap-1.5 flex-1">
                  {flags.map((flag, i) => (
                    <span
                      key={i}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${chipClass(flag.category)}`}
                    >
                      {flag.label}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => onStudentClick(student.id)}
                  className="shrink-0 text-xs font-medium text-red-600 hover:text-red-800 border border-red-300 hover:border-red-400 rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap"
                >
                  → View Student
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

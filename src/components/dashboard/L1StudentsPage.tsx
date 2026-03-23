"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigation } from "@/components/layout/DashboardShell";
import { getAllStudentsWithDetails } from "@/lib/actions/batch-overview";
import { getAchievementStatus } from "@/lib/utils/achievement-status";
import { ArrowLeft, Search, ArrowUpDown } from "lucide-react";

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
  avgGoalAchievement: number;
}

type SortField = "name" | "avg";

export function L1StudentsPage() {
  const { setL1SubView, setCurrentPage, setSelectedStudentId, setActiveL3Tab } =
    useNavigation();
  const [students, setStudents] = useState<StudentDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortAsc, setSortAsc] = useState(true);

  const loadStudents = useCallback(async () => {
    try {
      const data = await getAllStudentsWithDetails();
      setStudents(data);
    } catch (error) {
      console.error("Failed to load students:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const filtered = useMemo(() => {
    let result = students;
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name?.toLowerCase().includes(lower) ||
          s.councilName.toLowerCase().includes(lower) ||
          s.coachName.toLowerCase().includes(lower)
      );
    }
    result = [...result].sort((a, b) => {
      if (sortField === "name") {
        const cmp = (a.name || "").localeCompare(b.name || "");
        return sortAsc ? cmp : -cmp;
      }
      const cmp = a.avgGoalAchievement - b.avgGoalAchievement;
      return sortAsc ? cmp : -cmp;
    });
    return result;
  }, [students, search, sortField, sortAsc]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === "name");
    }
  };

  const handleStudentClick = (studentId: string) => {
    setSelectedStudentId(studentId);
    setActiveL3Tab("goals");
    setCurrentPage("L3");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-96 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setL1SubView("overview")}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold">
              All Students ({students.length})
            </h2>
            <p className="text-muted-foreground text-sm">
              Student roster with goal progress
            </p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, council, coach..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-background w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-semibold">
                  <button
                    onClick={() => toggleSort("name")}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    Name
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-4 font-semibold">Declaration</th>
                <th className="text-center p-4 font-semibold">Enrollment</th>
                <th className="text-center p-4 font-semibold">Personal</th>
                <th className="text-center p-4 font-semibold">Professional</th>
                <th className="text-center p-4 font-semibold">
                  <button
                    onClick={() => toggleSort("avg")}
                    className="flex items-center gap-1 hover:text-foreground mx-auto"
                  >
                    Avg
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-4 font-semibold">Coach</th>
                <th className="text-left p-4 font-semibold">Council</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => {
                const eStatus = getAchievementStatus(student.enrollmentProgress);
                const pStatus = getAchievementStatus(student.personalProgress);
                const prStatus = getAchievementStatus(student.professionalProgress);
                const avgStatus = getAchievementStatus(student.avgGoalAchievement);

                return (
                  <tr
                    key={student.id}
                    onClick={() => handleStudentClick(student.id)}
                    className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{student.name}</p>
                        {student.role === "council_leader" && (
                          <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                            Council Leader
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {student.email}
                      </p>
                    </td>
                    <td className="p-4 max-w-48">
                      <p className="text-sm italic text-muted-foreground line-clamp-2">
                        {student.declaration || "—"}
                      </p>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-base font-bold ${eStatus.textColor}`}>
                        {student.enrollmentProgress}%
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-base font-bold ${pStatus.textColor}`}>
                        {student.personalProgress}%
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-sm font-medium ${prStatus.textColor}`}>
                        {student.professionalProgress}%
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${avgStatus.bgColor} ${avgStatus.textColor}`}
                      >
                        {student.avgGoalAchievement}%
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {student.coachName}
                    </td>
                    <td className="p-4">
                      <span className="text-sm bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                        {student.councilName}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    {search
                      ? "No students match your search."
                      : "No students enrolled yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useNavigation } from "@/components/layout/DashboardShell";
import { getCouncilRankings } from "@/lib/actions/batch-overview";
import { getAchievementStatus } from "@/lib/utils/achievement-status";
import { ArrowLeft, Trophy } from "lucide-react";

interface CouncilRanking {
  id: string;
  name: string;
  coachName: string;
  adminCoachName: string;
  leaderName: string | null;
  studentCount: number;
  enrollmentAvg: number;
  personalAvg: number;
  professionalAvg: number;
  enrollmentResultsAvg: number;
  personalResultsAvg: number;
  professionalResultsAvg: number;
  enrollmentCWAvg: number;
  personalCWAvg: number;
  professionalCWAvg: number;
  avgGoalAchievement: number;
  avgResults: number;
  avgCurrentWeek: number;
  rank: number;
  status: "on_track" | "needs_attention" | "needs_support";
}

export function L1CouncilRankingsPage() {
  const { setL1SubView, setCurrentPage, setSelectedCouncilId } = useNavigation();
  const [rankings, setRankings] = useState<CouncilRanking[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRankings = useCallback(async () => {
    try {
      const data = await getCouncilRankings();
      setRankings(data);
    } catch (error) {
      console.error("Failed to load rankings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRankings();
  }, [loadRankings]);

  const handleCouncilClick = (councilId: string) => {
    setSelectedCouncilId(councilId);
    setCurrentPage("L2");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setL1SubView("overview")}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold">Council Rankings</h2>
          <p className="text-muted-foreground text-sm">
            Ranked by overall goal achievement
          </p>
        </div>
      </div>

      {/* Ranking cards */}
      <div className="space-y-4">
        {rankings.map((council) => {
          const status = getAchievementStatus(council.avgGoalAchievement);

          return (
            <button
              key={council.id}
              onClick={() => handleCouncilClick(council.id)}
              className={`w-full text-left bg-card rounded-xl border-l-4 ${status.borderColor} border border-border p-6 hover:shadow-lg transition-all group`}
            >
              {/* Top row: rank, name, meta, status badge */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${status.bgColor} ${status.textColor} font-bold text-lg`}
                  >
                    {council.rank <= 3 ? (
                      <span className="flex items-center">
                        #{council.rank}
                      </span>
                    ) : (
                      `#${council.rank}`
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {council.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      <span className="text-amber-600 font-medium">HC:</span> {council.coachName}
                      {council.leaderName && (
                        <> · <span className="text-primary font-medium">CL:</span> {council.leaderName}</>
                      )}
                      {" "}· {council.studentCount} students
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full ${status.bgColor} ${status.textColor}`}
                >
                  {status.label}
                </span>
              </div>

              {/* Dual progress bars */}
              <div className="mb-4 space-y-1.5">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-muted-foreground">Overall Achievement</span>
                  <span className="text-xl font-black text-green-600">{council.avgGoalAchievement}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground shrink-0">Milestones/Results</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${council.avgResults}%` }} />
                  </div>
                  <span className="text-base font-bold w-10 text-right shrink-0 text-green-600">{council.avgResults}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground shrink-0">Action Steps</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full opacity-40 transition-all" style={{ width: `${council.avgCurrentWeek}%` }} />
                  </div>
                  <span className="text-base font-bold text-muted-foreground w-10 text-right shrink-0">{council.avgCurrentWeek}%</span>
                </div>
              </div>

              {/* Per-goal breakdown */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Enrollment", value: council.enrollmentAvg, results: council.enrollmentResultsAvg, cw: council.enrollmentCWAvg, bar: "bg-blue-500", text: "text-blue-500" },
                  { label: "Personal",   value: council.personalAvg,   results: council.personalResultsAvg,   cw: council.personalCWAvg,   bar: "bg-yellow-400", text: "text-yellow-400" },
                  { label: "Professional", value: council.professionalAvg, results: council.professionalResultsAvg, cw: council.professionalCWAvg, bar: "bg-purple-500", text: "text-purple-500" },
                ].map((goal) => (
                  <div key={goal.label}>
                    <p className="text-xs text-muted-foreground mb-1 text-center">{goal.label}</p>
                    <p className={`text-base font-black text-center ${goal.text}`}>{goal.value}%</p>
                    <div className="space-y-1 mt-1">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className={`${goal.bar} h-2 rounded-full transition-all`} style={{ width: `${goal.results}%` }} />
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className={`${goal.bar} h-2 rounded-full opacity-40 transition-all`} style={{ width: `${goal.cw}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </button>
          );
        })}

        {rankings.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Trophy className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No councils to rank yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

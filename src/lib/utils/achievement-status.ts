export type AchievementLevel = "on_track" | "needs_attention" | "needs_support";

export interface AchievementStatus {
  level: AchievementLevel;
  label: string;
  dotColor: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  barColor: string;
}

const statusMap: Record<AchievementLevel, AchievementStatus> = {
  on_track: {
    level: "on_track",
    label: "On Track",
    dotColor: "bg-green-500",
    bgColor: "bg-green-500/10",
    textColor: "text-green-600",
    borderColor: "border-green-500",
    barColor: "bg-green-500",
  },
  needs_attention: {
    level: "needs_attention",
    label: "Needs Attention",
    dotColor: "bg-amber-500",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-600",
    borderColor: "border-amber-500",
    barColor: "bg-amber-500",
  },
  needs_support: {
    level: "needs_support",
    label: "Needs Support",
    dotColor: "bg-red-500",
    bgColor: "bg-red-500/10",
    textColor: "text-red-600",
    borderColor: "border-red-500",
    barColor: "bg-red-500",
  },
};

export function getAchievementStatus(percentage: number): AchievementStatus {
  if (percentage >= 70) return statusMap.on_track;
  if (percentage >= 40) return statusMap.needs_attention;
  return statusMap.needs_support;
}

export function getSeverityColors(severity: "critical" | "warning" | "info") {
  switch (severity) {
    case "critical":
      return { dot: "bg-red-500", bg: "bg-red-500/10", text: "text-red-600", border: "border-red-500" };
    case "warning":
      return { dot: "bg-amber-500", bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-500" };
    case "info":
      return { dot: "bg-blue-500", bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-500" };
  }
}

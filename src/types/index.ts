export type UserRole = "head_coach" | "coach" | "council_leader" | "student";
export type GoalType = "enrollment" | "personal" | "professional";
export type GoalStatus = "draft" | "in_progress" | "completed" | "archived";
export type AttendanceStatus = "present" | "late" | "absent" | "no_data";
export type NotificationType =
  | "milestone_reminder"
  | "weekly_checkin"
  | "goal_completion"
  | "council"
  | "batch"
  | "low_progress";

export interface JWTPayload {
  userId: string;
  role: UserRole;
}

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

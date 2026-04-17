/**
 * API v1 Types — GG ↔ APA Contract
 *
 * This file defines the data shapes that APA imports from GG.
 * Bump to v2 when adding required fields or changing shapes.
 * Maintain backward compatibility within major version.
 *
 * Version: 1.0
 * Last Updated: April 13, 2026
 */

export const GOAL_GETTER_API_VERSION = "v1";

/**
 * Student object shape for APA integration
 * Used by ActionPlanner to load and display student goal records
 */
export interface StudentV1 {
  id: string;
  coach_id: string;
  name: string;
  created_at: string;
}

/**
 * Goal object shape (future: used when APA fetches goals from GG)
 */
export interface GoalV1 {
  id: string;
  student_id: string;
  title: string;
  description?: string;
  status: "draft" | "active" | "completed" | "archived";
  created_at: string;
  updated_at: string;
}

/**
 * Attendance record shape (future: APA posts attendance back to GG)
 */
export interface AttendanceV1 {
  id: string;
  goal_id: string;
  meeting_id: string;
  status: "present" | "absent" | "excused";
  recorded_at: string;
}

/**
 * Version compatibility check
 * Use this to verify APA is compatible with current GG version
 */
export function isCompatibleWithV1(version: string): boolean {
  return version === "v1";
}

/**
 * Type guards for runtime validation
 */
export function isStudentV1(obj: any): obj is StudentV1 {
  return (
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.coach_id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.created_at === "string"
  );
}

export function isGoalV1(obj: any): obj is GoalV1 {
  return (
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.student_id === "string" &&
    typeof obj.title === "string" &&
    ["draft", "active", "completed", "archived"].includes(obj.status)
  );
}

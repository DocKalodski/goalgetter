export const config = {
  app: {
    name: "GoalGetter",
    version: "3.25",
    author: "by Doc Kalodski",
    description: "LEAP 99 Goal Management Platform",
  },
  program: {
    name: "LEAP",
    fullName: "Leadership Excellence Achievement Program",
    totalWeeks: 12,
    startDate: "2026-02-02",
    endDate: "2026-04-26",
    goalTypes: ["enrollment", "personal", "professional"] as const,
  },
  auth: {
    saltRounds: 12,
    accessTokenExpiry: "1h",
    refreshTokenExpiry: "7d",
  },
  attendance: {
    statuses: ["present", "late", "absent", "no_data"] as const,
    callDays: ["Mon", "Tue", "Wed", "Thu", "Fri"] as const,
  },
  roles: {
    hierarchy: ["head_coach", "developer", "coach", "council_leader", "student", "facilitator"] as const,
    loginDestinations: {
      head_coach: "/l1",
      developer: "/l1",
      coach: "/l2",
      council_leader: "/l3",
      student: "/l3",
      facilitator: "/l1",
    } as const,
  },
} as const;

export type UserRole = (typeof config.roles.hierarchy)[number];
export type GoalType = (typeof config.program.goalTypes)[number];
export type AttendanceStatus = (typeof config.attendance.statuses)[number];

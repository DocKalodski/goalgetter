"use server";

import { llmChat } from "@/lib/llm";
import { getAuthUser } from "@/lib/auth/jwt";
import { PRIVACY_CLAUSE } from "@/lib/utils/sanitize-pii";

export async function generateWeeklyReport(data: {
  councilName: string;
  weekNumber: number;
  students: {
    name: string | null;
    email: string;
    enrollmentResults: number;
    personalResults: number;
    professionalResults: number;
    enrollmentCurrentWeek: number;
    personalCurrentWeek: number;
    professionalCurrentWeek: number;
    meetingAttendance: number | null;
    callAttendance: number | null;
  }[];
}) {
  const user = await getAuthUser();
  if (!user || !["coach", "head_coach"].includes(user.role)) {
    throw new Error("Unauthorized: coach or head_coach role required");
  }

  const { councilName, weekNumber, students } = data;

  // Replace real names/emails with indexed labels before sending to LLM
  const prompt = `${PRIVACY_CLAUSE}

You are a LEAP 99 coaching program analyst. Generate a weekly coaching report for Week ${weekNumber}.

Student data (M/R = milestones/results %, AS = action steps %):
${students
  .map(
    (s, idx) =>
      `- Student ${idx + 1}: Enrollment M/R:${s.enrollmentResults}% AS:${s.enrollmentCurrentWeek}% | Personal M/R:${s.personalResults}% AS:${s.personalCurrentWeek}% | Professional M/R:${s.professionalResults}% AS:${s.professionalCurrentWeek}% | Meeting:${s.meetingAttendance ?? "N/A"}% Call:${s.callAttendance ?? "N/A"}%`
  )
  .join("\n")}

Return ONLY valid JSON:
{
  "overallHealth": "excellent|good|needs_attention|critical",
  "councilSummary": "2-3 sentence council-level summary",
  "topPerformers": [{"name": "...", "highlight": "..."}],
  "studentsNeedingSupport": [{"name": "...", "concern": "...", "suggestedAction": "..."}],
  "weeklyWins": ["..."],
  "coachingFocus": "What the coach should prioritize this coming week",
  "motivationalNote": "An energizing message for the council"
}`;

  const raw = await llmChat([{ role: "user", content: prompt }], { tier: "smart", maxTokens: 1500 });
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Failed to parse AI response as JSON");

  return JSON.parse(match[0]) as {
    overallHealth: "excellent" | "good" | "needs_attention" | "critical";
    councilSummary: string;
    topPerformers: { name: string; highlight: string }[];
    studentsNeedingSupport: { name: string; concern: string; suggestedAction: string }[];
    weeklyWins: string[];
    coachingFocus: string;
    motivationalNote: string;
  };
}

import { NextResponse } from "next/server";
import { verifyToken, isHeadCoach,
} from "@/lib/auth/jwt";
import { cookies } from "next/headers";
import { nerRedact, PRIVACY_CLAUSE } from "@/lib/utils/sanitize-pii";
import { llmStream } from "@/lib/llm";

const COACHING_SYSTEM_PROMPT = `You are a professional coaching assistant for the LEAP 99 program, a 12-week goal achievement cohort run by Doc Kalodski. You help coaches support their students effectively.

## Your Role
You assist coaches (and the head coach) in:
- Applying the GROW coaching framework (Goal, Reality, Options, Way Forward)
- Using SMARTER goal methodology (Specific, Measurable, Achievable, Relevant, Time-bound, Evaluated, Reviewed)
- Crafting powerful coaching questions to unlock student insight
- Interpreting student performance data and identifying patterns
- Strategizing interventions for stuck or disengaged students
- Preparing for 1-on-1 and group coaching sessions

## LEAP 99 Program Context
- 12-week intensive goal achievement program
- Three goal domains: Enrollment (external/career), Personal (inner life), Professional (skills/growth)
- Weekly call times hold students accountable day-to-day
- Weekly group meetings are the primary council touchpoint
- Intensives and breakfasts are high-energy community events
- Milestones are weekly commitments tracked in the Action Planner
- Results are the cumulative percentage of actual goal achievement
- AI Assessment scores alignment between a student's stated goal, values, and weekly actions
- Weeks 1-2: Action planning phase. Week 3+: Results begin compounding

## Coaching Philosophy
- Ask, don't tell — powerful questions over advice
- Meet the student where they are
- Celebrate progress, not just outcomes
- A low AI Assessment score (< 60%) signals the student's actions may not align with their stated goal — explore this with curiosity, not judgment
- Consistency in daily calls is one of the strongest predictors of goal achievement

## Your Tone
- Warm but direct
- Evidence-based (reference student data when provided)
- Solution-focused
- Never preachy — give practical, actionable coaching suggestions
- Keep responses concise and structured (bullet points or numbered steps when listing actions)

When student context is provided (goals, scores, progress), always reference it specifically in your response.

${PRIVACY_CLAUSE}`;

function buildStudentContext(ctx: {
  studentName: string;
  enrollmentResults: number;
  personalResults: number;
  professionalResults: number;
  enrollmentCurrentWeek: number;
  personalCurrentWeek: number;
  professionalCurrentWeek: number;
  reportingWeek: number;
}): string {
  // studentName is intentionally not sent to the LLM — use generic label for privacy
  return `
## Current Student: [Student]
**Reporting Week:** ${ctx.reportingWeek}

| Domain | Results | Milestones (this week) |
|--------|---------|----------------------|
| Enrollment | ${ctx.enrollmentResults}% | ${ctx.enrollmentCurrentWeek}% |
| Personal | ${ctx.personalResults}% | ${ctx.personalCurrentWeek}% |
| Professional | ${ctx.professionalResults}% | ${ctx.professionalCurrentWeek}% |

Use this data when answering coaching questions about this student.`;
}

export async function POST(request: Request) {
  // Auth check
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await verifyToken(token);
  if (!user || (user.role !== "coach" && user.role !== "head_coach")) {
    return NextResponse.json({ error: "Forbidden: coaches only" }, { status: 403 });
  }

  let body: {
    messages: { role: "user" | "assistant"; content: string }[];
    studentContext?: {
      studentName: string;
      enrollmentResults: number;
      personalResults: number;
      professionalResults: number;
      enrollmentCurrentWeek: number;
      personalCurrentWeek: number;
      professionalCurrentWeek: number;
      reportingWeek: number;
    };
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { messages, studentContext } = body;

  if (!messages?.length) {
    return NextResponse.json({ error: "No messages provided" }, { status: 400 });
  }

  // Rate limit: max 20 messages in history to keep context lean
  const trimmedMessages = messages.slice(-20);

  const systemPrompt = studentContext
    ? COACHING_SYSTEM_PROMPT + "\n\n" + buildStudentContext(studentContext)
    : COACHING_SYSTEM_PROMPT;

  // Filter empty placeholders, then NER-redact all message content before sending
  const rawMessages = trimmedMessages.filter((m) => !(m.role === "assistant" && m.content === ""));
  const redactedContents = await Promise.all(rawMessages.map((m) => nerRedact(m.content)));
  const validMessages = rawMessages.map((m, i) => ({ ...m, content: redactedContents[i] }));

  if (!validMessages.length || validMessages[validMessages.length - 1].role !== "user") {
    return NextResponse.json({ error: "Invalid message sequence" }, { status: 400 });
  }

  let readableStream: ReadableStream<Uint8Array>;
  try {
    readableStream = await llmStream(validMessages, {
      tier: "smart",
      maxTokens: 1024,
      system: systemPrompt,
    });
  } catch (err) {
    console.error("[ai/chat] stream error:", err);
    return NextResponse.json({ error: "Failed to start AI stream" }, { status: 500 });
  }

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
    },
  });
}

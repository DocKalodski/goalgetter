import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { verifyToken, isHeadCoach,
} from "@/lib/auth/jwt";
import { cookies } from "next/headers";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

When student context is provided (goals, scores, progress), always reference it specifically in your response.`;

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
  return `
## Current Student: ${ctx.studentName}
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

  // Filter out empty assistant messages (streaming placeholders) before sending
  const validMessages = trimmedMessages.filter(
    (m) => !(m.role === "assistant" && m.content === "")
  );

  if (!validMessages.length || validMessages[validMessages.length - 1].role !== "user") {
    return NextResponse.json({ error: "Invalid message sequence" }, { status: 400 });
  }

  let stream: ReturnType<typeof client.messages.stream>;
  try {
    stream = client.messages.stream({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemPrompt,
      messages: validMessages,
    });
  } catch (err) {
    console.error("[ai/chat] stream init error:", err);
    return NextResponse.json({ error: "Failed to start AI stream" }, { status: 500 });
  }

  const encoder = new TextEncoder();

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        console.error("[ai/chat] stream read error:", err);
        controller.error(err);
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
    },
  });
}

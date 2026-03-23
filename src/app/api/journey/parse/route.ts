import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

// POST /api/journey/parse
// Takes a raw transcript + entry type, returns structured field suggestions
export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { transcript, entryType } = await req.json();
  if (!transcript || !entryType) {
    return NextResponse.json({ error: "transcript and entryType required" }, { status: 400 });
  }

  const prompts: Record<string, string> = {
    oo: `You are parsing a coaching session transcript for a LEAP 99 One & Only (1on1) session.
Extract these 4 fields from the transcript. Return ONLY valid JSON with these exact keys:
{
  "win": "what the student won or achieved since last session",
  "committed": "what the student committed to doing",
  "agenda": "main topics discussed and action items",
  "homework": "homework or tasks assigned for next session"
}
If a field cannot be extracted, use null. Be concise — 1-3 sentences per field max.`,

    mm: `You are parsing a coaching session transcript for a LEAP 99 Meeting Master (council meeting).
The transcript may include speaker attribution in [SpeakerName] format — honor this.
Extract these fields. Return ONLY valid JSON:
{
  "meetingType": "coaches|council|client|facilitator",
  "resolutions": "key decisions and resolutions made by the group",
  "meetingMinutes": "narrative summary: who shared what WIN, what each person committed to, key themes"
}
If speaker tags exist, capture each person's WIN and commitment in meetingMinutes.`,

    cc: `You are parsing a call transcript for a LEAP 99 Call Center log.
Extract these fields. Return ONLY valid JSON:
{
  "callerName": "who initiated the call",
  "calleeName": "who received the call",
  "callOutcome": "summary of the call outcome and next steps"
}`,

    pp: `You are parsing notes from a LEAP 99 Performance Points session (intensive/breakfast/module).
Extract these fields. Return ONLY valid JSON:
{
  "eventName": "name of the event or module",
  "moduleTopic": "main topic or theme",
  "ppNotes": "key notes from the session",
  "coachObservations": "coach observations about students or the session"
}`,
  };

  const systemPrompt = prompts[entryType] || prompts.oo;

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: "user", content: `Transcript:\n\n${transcript}` }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    return NextResponse.json({ fields: parsed });
  } catch {
    return NextResponse.json({ error: "Parse failed" }, { status: 500 });
  }
}

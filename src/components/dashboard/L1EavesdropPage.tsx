"use client";

import { useEffect, useState, useRef } from "react";
import { Headphones, Bell, BellOff, Loader2, MessageSquare, X, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { scanForPII } from "@/lib/utils/pii-scan";
import { UpgradeModuleBanner } from "@/components/ui/UpgradeModuleBanner";
import { getAllCoachSessionsForHC, flagSessionForHC } from "@/lib/actions/coach-sessions";
import { useNavigation } from "@/components/layout/DashboardShell";

type HCFlag = "needs_attention" | "at_risk" | "great_progress" | "routine";

interface HCSession {
  id: string;
  coachId: string;
  coachName: string | null;
  studentId: string | null;
  studentName: string | null;
  weekNumber: number;
  sessionType: string;
  destination: string;
  aiSummary: string | null;
  hcFlag: string | null;
  hcOneLiner: string | null;
  createdAt: Date | null;
}

interface AISummaryData {
  summary?: string;
  keyPoints?: string[];
  actionItems?: string[];
  growAlignment?: { goal: string; reality: string; options: string[]; wayForward: string };
  sentiment?: string;
  coachingTone?: string;
  studentEngagement?: string;
  keyInsights?: string[];
}

const FLAG_CONFIG: Record<HCFlag, { label: string; color: string; bg: string; border: string }> = {
  needs_attention: {
    label: "Needs Attention",
    color: "text-red-700",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-300 dark:border-red-800",
  },
  at_risk: {
    label: "At Risk",
    color: "text-amber-700",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-300 dark:border-amber-800",
  },
  great_progress: {
    label: "Great Progress",
    color: "text-green-700",
    bg: "bg-green-50 dark:bg-green-950/30",
    border: "border-green-300 dark:border-green-800",
  },
  routine: {
    label: "Routine",
    color: "text-muted-foreground",
    bg: "bg-muted/30",
    border: "border-border",
  },
};

const FILTER_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "All Sessions", value: "all" },
  { label: "Needs Attention", value: "needs_attention" },
  { label: "At Risk", value: "at_risk" },
  { label: "Great Progress", value: "great_progress" },
  { label: "Routine", value: "routine" },
];

const STARTER_PROMPTS = [
  "What should I follow up on with this coach?",
  "How should I support this student?",
  "Is this a coaching methodology issue?",
  "What pattern do you see here?",
];

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function FlagBadge({ flag }: { flag: string | null }) {
  const cfg = FLAG_CONFIG[(flag as HCFlag) ?? "routine"] ?? FLAG_CONFIG.routine;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-semibold border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
}

function SessionCard({
  session,
  onFlagged,
}: {
  session: HCSession;
  onFlagged: (id: string, flag: string, oneLiner: string) => void;
}) {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [flagging, setFlagging] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session.hcFlag && session.aiSummary) {
      setFlagging(true);
      flagSessionForHC(session.id)
        .then((result) => {
          if (result) onFlagged(session.id, result.flag, result.oneLiner);
        })
        .finally(() => setFlagging(false));
    }
  }, [session.id, session.hcFlag, session.aiSummary, onFlagged]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const parsedSummary: AISummaryData | null = (() => {
    if (!session.aiSummary) return null;
    try { return JSON.parse(session.aiSummary); } catch { return null; }
  })();

  async function sendMessage(text: string, bypassScan = false) {
    if (!text.trim() || streaming) return;
    if (!bypassScan) {
      const scan = scanForPII(text.trim());
      if (!scan.clean) {
        const ok = window.confirm(`⚠️ Privacy Check\n\nMessage may contain: ${scan.warnings.join(", ")}.\n\nIt will be automatically redacted before reaching the AI.\n\nSend anyway?`);
        if (!ok) return;
      }
    }
    setInput("");

    const sessionContext = `[HC Intelligence Context — Coach: ${session.coachName ?? "Unknown"}, Student: ${session.studentName ?? "General"}, Week ${session.weekNumber}, Type: ${session.sessionType}]\n\nAI Summary: ${session.aiSummary ?? "No summary available"}`;

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages([...newMessages, { role: "assistant", content: "" }]);
    setStreaming(true);

    try {
      const body = {
        messages: newMessages,
        studentContext: { name: session.studentName ?? "Unknown student" },
        systemExtra: sessionContext,
      };

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok || !res.body) throw new Error("Request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: full };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: "Sorry, I couldn't get a response. Please try again." };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  }

  const dateStr = session.createdAt
    ? new Date(session.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";

  return (
    <div className={`rounded-xl border p-4 space-y-3 transition-colors ${FLAG_CONFIG[(session.hcFlag as HCFlag) ?? "routine"]?.bg ?? "bg-muted/30"} ${FLAG_CONFIG[(session.hcFlag as HCFlag) ?? "routine"]?.border ?? "border-border"}`}>
      {/* Card header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {flagging ? (
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing…
            </span>
          ) : (
            <FlagBadge flag={session.hcFlag} />
          )}
          <span className="text-xs text-muted-foreground capitalize border border-border rounded-full px-2 py-0.5">{session.sessionType}</span>
          <span className="text-xs text-muted-foreground border border-border rounded-full px-2 py-0.5">Week {session.weekNumber}</span>
        </div>
        <span className="text-xs text-muted-foreground shrink-0">{dateStr}</span>
      </div>

      {/* One-liner — the hero */}
      {session.hcOneLiner ? (
        <p className="text-base font-medium leading-snug">{session.hcOneLiner}</p>
      ) : session.aiSummary && parsedSummary?.summary ? (
        <p className="text-base font-medium leading-snug text-muted-foreground italic">{parsedSummary.summary.slice(0, 120)}…</p>
      ) : (
        <p className="text-base text-muted-foreground italic">No summary available yet.</p>
      )}

      {/* Coach → Student */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{session.coachName ?? "Unknown coach"}</span>
        <span>→</span>
        <span className="font-medium text-foreground">{session.studentName ?? "General Knowledge"}</span>
      </div>

      {/* Ask AI toggle */}
      <button
        onClick={() => setChatOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
      >
        <MessageSquare className="h-4 w-4" />
        {chatOpen ? "Close AI Chat" : "Ask Maritess AI"}
        {chatOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {/* Inline AI chat */}
      {chatOpen && (
        <div className="bg-card rounded-lg border border-border p-3 space-y-3">
          {/* Starter prompts — show when no messages yet */}
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2">
              {STARTER_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => sendMessage(p, true)}
                  className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Message thread */}
          {messages.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                    {msg.content || (streaming && i === messages.length - 1 ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null)}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage(input))}
              placeholder="Ask about this session…"
              className="flex-1 text-sm bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              disabled={streaming}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || streaming}
              className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function L1EavesdropPage() {
  const { setL1SubView, setL1ManageOpen } = useNavigation();
  const [sessions, setSessions] = useState<HCSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    getAllCoachSessionsForHC()
      .then((data) => setSessions(data as HCSession[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function handleFlagged(id: string, flag: string, oneLiner: string) {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, hcFlag: flag, hcOneLiner: oneLiner } : s))
    );
  }

  const filtered = activeFilter === "all"
    ? sessions
    : sessions.filter((s) => s.hcFlag === activeFilter);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <UpgradeModuleBanner />
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <button type="button" onClick={() => { setL1SubView("overview"); setL1ManageOpen(true); }} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Headphones className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Coaching Intelligence Feed</h1>
        </div>
        <p className="text-base text-muted-foreground">
          AI-filtered summaries across all coaches — no verbatim conversations
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground p-3 rounded-lg bg-muted/20 border border-border">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Needs Attention</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> At Risk</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Great Progress</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-muted-foreground/40 inline-block" /> Routine</span>
        <span className="flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> Ask AI about any session</span>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setActiveFilter(opt.value)}
            className={`text-sm px-3 py-1.5 rounded-full border font-medium transition-colors ${
              activeFilter === opt.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {opt.label}
            {opt.value !== "all" && (
              <span className="ml-1.5 text-xs opacity-70">
                ({sessions.filter((s) => s.hcFlag === opt.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Session list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <BellOff className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">
            {sessions.length === 0 ? "No published sessions yet" : "No sessions match this filter"}
          </p>
          <p className="text-sm mt-1">
            {sessions.length === 0
              ? "Sessions appear here once coaches publish them"
              : "Try a different filter above"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((session) => (
            <SessionCard key={session.id} session={session} onFlagged={handleFlagged} />
          ))}
        </div>
      )}
    </div>
  );
}

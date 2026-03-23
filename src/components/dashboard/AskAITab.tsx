"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Bot, Send, RotateCcw, Sparkles, User, Mic, MicOff,
  ChevronDown, ChevronUp, FileText, CheckCircle2, Save, Trash2,
} from "lucide-react";
import {
  createCoachSession,
  updateSessionTranscript,
  getCoachSessions,
  getGeneralSessions,
  generateSessionSummary,
  publishSessionDocument,
  deleteSession,
} from "@/lib/actions/coach-sessions";
import type { CoachSession } from "@/lib/db/schema";

// ─── Types ───────────────────────────────────────────────────────

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface StudentContext {
  studentName: string;
  enrollmentResults: number;
  personalResults: number;
  professionalResults: number;
  enrollmentCurrentWeek: number;
  personalCurrentWeek: number;
  professionalCurrentWeek: number;
  reportingWeek: number;
}

interface CoachSessionProps {
  studentId: string;
  studentName: string;
  weekNumber: number;
}

interface AISummary {
  summary?: string;
  keyPoints?: string[];
  actionItems?: string[];
  growAlignment?: { goal: string; reality: string; options: string[]; wayForward: string };
  sentiment?: string;
  coachingTone?: string;
  studentEngagement?: string;
  keyInsights?: string[];
  methodologyNotes?: string[];
  applicableTo?: string[];
}

type SessionTab = "student" | "general";

const STARTER_PROMPTS = [
  "What coaching questions should I ask this student today?",
  "How do I help a student who is stuck and losing momentum?",
  "Their AI Post Assessment score is low — what does that mean and what do I do?",
  "Help me prepare for this student's check-in session",
  "What actions can boost their results in the next 2 weeks?",
  "How do I apply GROW framework with this student?",
];

// ─── Main Component ──────────────────────────────────────────────

export function AskAITab({
  studentContext,
  initialMessage,
  onInitialMessageSent,
  coachSession,
}: {
  studentContext: StudentContext;
  initialMessage?: string | null;
  onInitialMessageSent?: () => void;
  coachSession?: CoachSessionProps;
}) {
  // ── Chat state ──
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [listening, setListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [micError, setMicError] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sentInitial = useRef(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chatRecognitionRef = useRef<any>(null);

  // ── Recording state (coach only) ──
  const [sessionOpen, setSessionOpen] = useState(false);
  const [destination, setDestination] = useState<"student" | "general">("student");
  const [sessionType, setSessionType] = useState("call");
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [activeSpeaker, setActiveSpeaker] = useState<string>("Coach");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [summary, setSummary] = useState<AISummary | null>(null);
  const [publishTitle, setPublishTitle] = useState("");
  const [publishContent, setPublishContent] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sessionTab, setSessionTab] = useState<SessionTab>("student");
  const [pastSessions, setPastSessions] = useState<CoachSession[]>([]);
  const [generalSessions, setGeneralSessions] = useState<CoachSession[]>([]);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [loadingSessions, setLoadingSessions] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recRecognitionRef = useRef<any>(null);
  const transcriptRef = useRef(transcript);
  transcriptRef.current = transcript;
  const activeSpeakerRef = useRef(activeSpeaker);
  activeSpeakerRef.current = activeSpeaker;

  // ── Init ──
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) setSpeechSupported(true);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (coachSession) loadPastSessions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coachSession?.studentId]);

  // ── Chat ──────────────────────────────────────────────────────

  const sendMessage = useCallback(async function sendMessage(text: string) {
    if (!text.trim() || streaming) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setStreaming(true);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, studentContext }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: `Error: ${err.error ?? "Something went wrong"}` },
        ]);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let accumulated = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { role: "assistant", content: accumulated },
          ]);
        }
      } catch {
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: accumulated || "Stream interrupted — please try again." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "Network error — please try again." },
      ]);
    } finally {
      setStreaming(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, streaming]);

  useEffect(() => {
    if (initialMessage && !sentInitial.current) {
      sentInitial.current = true;
      sendMessage(initialMessage);
      onInitialMessageSent?.();
    }
  }, [initialMessage, sendMessage, onInitialMessageSent]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function reset() {
    setMessages([]);
    setInput("");
    inputRef.current?.focus();
  }

  async function startChatListening() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    setMicError(null);
    if (listening) { chatRecognitionRef.current?.stop(); return; }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
    } catch (err: unknown) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError") setMicError("Microphone access denied. Click the lock icon in your browser address bar to allow it.");
      else if (name === "NotFoundError") setMicError("No microphone found. Please connect a microphone and try again.");
      else setMicError("Could not access microphone. Please check your browser settings.");
      return;
    }

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalAccumulated = "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalAccumulated += t;
        else interim += t;
      }
      setInterimText(interim);
      if (finalAccumulated) setInput(finalAccumulated);
    };
    recognition.onend = () => {
      setListening(false);
      setInterimText("");
      if (finalAccumulated.trim()) setTimeout(() => sendMessage(finalAccumulated), 100);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      setListening(false);
      setInterimText("");
      if (event.error === "not-allowed" || event.error === "permission-denied") {
        setMicError("Microphone access denied. Allow microphone permission in your browser.");
      } else if (event.error === "no-speech") {
        setMicError("No speech detected. Speak closer to your microphone.");
      } else {
        setMicError(`Mic error: ${event.error}. Try refreshing the page.`);
      }
    };
    chatRecognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  // ── Recording session (coach only) ───────────────────────────

  async function loadPastSessions() {
    if (!coachSession) return;
    setLoadingSessions(true);
    try {
      const [student, general] = await Promise.all([
        getCoachSessions(coachSession.studentId),
        getGeneralSessions(),
      ]);
      setPastSessions(student);
      setGeneralSessions(general);
    } catch { /* ignore */ }
    setLoadingSessions(false);
  }

  async function ensureSession(): Promise<string> {
    if (!coachSession) throw new Error("No coach session context");
    if (sessionId) return sessionId;
    const session = await createCoachSession(coachSession.studentId, sessionType, coachSession.weekNumber, destination);
    setSessionId(session.id);
    return session.id;
  }

  function startRecording() {
    setTranscript("");
    setSessionId(null);
    setSummary(null);
    setPublished(false);
    setSaved(false);
    setPublishTitle(`Week ${coachSession?.weekNumber} ${sessionType} — ${coachSession?.studentName}`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { setIsRecording(true); return; }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript + " ";
      }
      if (final) {
        const tagged = `[${activeSpeakerRef.current}]: ${final.trim()}\n`;
        setTranscript((prev) => prev + tagged);
      }
    };
    recognition.onend = () => {
      if (recRecognitionRef.current) {
        try { recRecognitionRef.current.start(); } catch { /* ignore */ }
      }
    };
    recognition.onerror = (e: { error: string }) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        recRecognitionRef.current = null;
        setIsRecording(false);
      }
    };

    recRecognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }

  async function stopRecording() {
    recRecognitionRef.current?.stop();
    recRecognitionRef.current = null;
    setIsRecording(false);
  }

  async function saveRecording() {
    if (!transcriptRef.current.trim()) return;
    setSaving(true);
    try {
      const id = await ensureSession();
      await updateSessionTranscript(id, transcriptRef.current);
      setSaved(true);
      loadPastSessions();
    } catch (e) { console.error(e); }
    setSaving(false);
  }

  async function discardRecording() {
    setDeleting(true);
    try {
      if (sessionId) await deleteSession(sessionId);
    } catch { /* ignore */ }
    setTranscript("");
    setSessionId(null);
    setSummary(null);
    setSaved(false);
    setPublished(false);
    setDeleting(false);
  }

  async function analyze() {
    if (!transcriptRef.current.trim()) return;
    const id = await ensureSession();
    await updateSessionTranscript(id, transcriptRef.current);
    setSaved(true);
    setAnalyzing(true);
    try {
      const result = await generateSessionSummary(id);
      setSummary(result);
      setPublishContent(
        result.summary +
          (result.keyPoints?.length ? "\n\nKey Points:\n" + result.keyPoints.map((p: string) => `• ${p}`).join("\n") : "") +
          (result.actionItems?.length ? "\n\nAction Items:\n" + result.actionItems.map((a: string) => `• ${a}`).join("\n") : "")
      );
    } catch (e) { console.error(e); }
    setAnalyzing(false);
    loadPastSessions();
  }

  async function publish() {
    if (!publishTitle || !publishContent) return;
    setPublishing(true);
    try {
      const id = await ensureSession();
      await publishSessionDocument(id, publishTitle, publishContent);
      setPublished(true);
      loadPastSessions();
      // Auto-log as AA (AI Aider) Journey Journal entry
      if (coachSession?.studentId) {
        try {
          await fetch("/api/journey/entries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              studentId: coachSession.studentId,
              entryType: "aa",
              entryDate: new Date().toISOString().split("T")[0],
              weekNumber: coachSession.weekNumber,
              meetingMinutes: JSON.stringify({
                title: publishTitle,
                summary: publishContent,
                sessionId: id,
              }),
              approvalStatus: "approved",
              approvedFields: ["meetingMinutes"],
            }),
          });
        } catch (aaErr) { console.warn("AA auto-log failed (non-critical):", aaErr); }
      }
    } catch (e) { console.error(e); }
    setPublishing(false);
  }

  function sendSummaryToChat() {
    if (!summary || !coachSession) return;
    const msg = `Here is my coaching session transcript summary for ${coachSession.studentName} (Week ${coachSession.weekNumber}):\n\n${summary.summary}\n\nKey Points: ${summary.keyPoints?.join(", ")}\n\nAction Items: ${summary.actionItems?.join(", ")}\n\nBased on this, what coaching questions or strategies should I use next?`;
    sendMessage(msg);
    setSessionOpen(false);
  }

  const sentimentColor = summary?.sentiment === "positive" ? "text-green-600" : summary?.sentiment === "needs_support" ? "text-red-500" : "text-yellow-600";
  const engagementColor = summary?.studentEngagement === "high" ? "text-green-600" : summary?.studentEngagement === "low" ? "text-red-500" : "text-yellow-600";

  const isEmpty = messages.length === 0;
  const speakers = ["Coach", coachSession?.studentName ?? "Student"];

  return (
    <div className="flex flex-col gap-4">
      {/* ── Chat header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-base font-bold">Coaching Assistant</p>
            <p className="text-xs text-muted-foreground">
              AI powered by GROW · SMARTER · LEAP 99 methodology
            </p>
          </div>
        </div>
        {!isEmpty && (
          <button
            onClick={reset}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted"
          >
            <RotateCcw className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {/* ── Student context pills ── */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 font-medium">
          Enrollment: {studentContext.enrollmentResults}% milestones · {studentContext.enrollmentCurrentWeek}% action steps
        </span>
        <span className="px-2.5 py-1 rounded-full bg-yellow-400/10 text-yellow-500 font-medium">
          Personal: {studentContext.personalResults}% milestones · {studentContext.personalCurrentWeek}% action steps
        </span>
        <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-500 font-medium">
          Professional: {studentContext.professionalResults}% milestones · {studentContext.professionalCurrentWeek}% action steps
        </span>
      </div>

      {/* ── COACH ONLY: Record Session (collapsible) ── */}
      {coachSession && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <button
            onClick={() => setSessionOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold hover:bg-muted/40 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-primary" />
              Record Session
              {isRecording && <span className="text-xs text-red-500 font-normal animate-pulse">● Recording…</span>}
            </span>
            {sessionOpen
              ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
              : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>

          {sessionOpen && (
            <div className="px-4 pb-5 space-y-4 border-t border-border pt-4">
              {/* Destination toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setDestination("student")}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${destination === "student" ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border text-muted-foreground hover:text-foreground"}`}
                >
                  👤 For {coachSession.studentName}
                </button>
                <button
                  onClick={() => setDestination("general")}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${destination === "general" ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border text-muted-foreground hover:text-foreground"}`}
                >
                  📚 General Knowledge
                </button>
              </div>

              {/* Session type */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Session type</label>
                <select
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value)}
                  disabled={isRecording}
                  className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                >
                  <option value="call">Call Time</option>
                  <option value="meeting">Meeting</option>
                  <option value="thought">Thought / Note</option>
                  <option value="group">Group Session</option>
                </select>
              </div>

              {/* Speaker tags */}
              {(isRecording || transcript) && destination === "student" && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">Active speaker — tap to switch:</p>
                  <div className="flex gap-2 flex-wrap">
                    {speakers.map((sp) => (
                      <button
                        key={sp}
                        onClick={() => setActiveSpeaker(sp)}
                        className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${activeSpeaker === sp ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border text-muted-foreground hover:border-primary/50"}`}
                      >
                        {sp}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Record / Stop */}
              <div className="flex gap-3 items-center">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    disabled={analyzing}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    <Mic className="h-4 w-4" />
                    Start Recording
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors animate-pulse"
                  >
                    <MicOff className="h-4 w-4" />
                    Stop Recording
                  </button>
                )}
                {isRecording && (
                  <span className="text-xs text-muted-foreground">Recording as <strong>{activeSpeaker}</strong>…</span>
                )}
              </div>

              {/* Transcript */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Transcript</label>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder={isRecording ? "Listening… speak now" : "Transcript will appear here. You can also type or paste notes."}
                  rows={7}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground resize-y"
                />
              </div>

              {/* Save / Discard / Analyze */}
              {transcript && !isRecording && (
                <div className="flex flex-wrap gap-2 items-center">
                  {saved ? (
                    <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                      <CheckCircle2 className="h-4 w-4" /> Saved
                    </span>
                  ) : (
                    <button
                      onClick={saveRecording}
                      disabled={saving || analyzing}
                      className="flex items-center gap-2 px-4 py-2 bg-muted border border-border text-foreground rounded-lg text-sm font-semibold hover:bg-muted/70 disabled:opacity-50 transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      {saving ? "Saving…" : "Save"}
                    </button>
                  )}
                  <button
                    onClick={discardRecording}
                    disabled={deleting || analyzing || publishing}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-500/20 disabled:opacity-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    {deleting ? "Discarding…" : "Discard"}
                  </button>
                  <button
                    onClick={analyze}
                    disabled={analyzing || !transcript.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 transition-colors"
                  >
                    <Sparkles className="h-4 w-4" />
                    {analyzing ? "Analyzing…" : "✨ Analyze with AI"}
                  </button>
                </div>
              )}

              {/* AI Summary */}
              {summary && (
                <div className="space-y-4 pt-2">
                  <div className="h-px bg-border" />
                  <h4 className="text-sm font-bold">AI Analysis</h4>

                  <div className="bg-muted/40 rounded-lg p-4 space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Summary</p>
                    <p className="text-sm">{summary.summary}</p>
                  </div>

                  {destination === "student" && (
                    <>
                      {summary.keyPoints && summary.keyPoints.length > 0 && (
                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 space-y-2">
                          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Key Points</p>
                          <ul className="space-y-1">
                            {summary.keyPoints.map((p, i) => (
                              <li key={i} className="text-sm flex gap-2"><span className="text-blue-500 shrink-0">•</span>{p}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {summary.actionItems && summary.actionItems.length > 0 && (
                        <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4 space-y-2">
                          <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Action Items</p>
                          <ul className="space-y-1">
                            {summary.actionItems.map((a, i) => (
                              <li key={i} className="text-sm flex gap-2"><span className="text-green-500 shrink-0">→</span>{a}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {summary.growAlignment && (
                        <div className="bg-violet-500/5 border border-violet-500/20 rounded-lg p-4 space-y-2">
                          <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide">GROW Framework</p>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div><span className="font-medium text-muted-foreground">Goal: </span>{summary.growAlignment.goal}</div>
                            <div><span className="font-medium text-muted-foreground">Reality: </span>{summary.growAlignment.reality}</div>
                            <div><span className="font-medium text-muted-foreground">Way Forward: </span>{summary.growAlignment.wayForward}</div>
                            {summary.growAlignment.options?.length > 0 && (
                              <div><span className="font-medium text-muted-foreground">Options: </span>{summary.growAlignment.options.join(", ")}</div>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-3 flex-wrap text-sm">
                        {summary.sentiment && (
                          <span className={`px-2.5 py-1 rounded-full bg-muted font-medium ${sentimentColor}`}>Sentiment: {summary.sentiment}</span>
                        )}
                        {summary.studentEngagement && (
                          <span className={`px-2.5 py-1 rounded-full bg-muted font-medium ${engagementColor}`}>Engagement: {summary.studentEngagement}</span>
                        )}
                        {summary.coachingTone && (
                          <span className="px-2.5 py-1 rounded-full bg-muted font-medium text-muted-foreground">Tone: {summary.coachingTone}</span>
                        )}
                      </div>
                    </>
                  )}

                  {destination === "general" && (
                    <>
                      {summary.keyInsights && summary.keyInsights.length > 0 && (
                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 space-y-2">
                          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Key Insights</p>
                          <ul className="space-y-1">
                            {summary.keyInsights.map((p, i) => (
                              <li key={i} className="text-sm flex gap-2"><span className="text-blue-500 shrink-0">•</span>{p}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {summary.methodologyNotes && summary.methodologyNotes.length > 0 && (
                        <div className="bg-violet-500/5 border border-violet-500/20 rounded-lg p-4 space-y-2">
                          <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide">Methodology Notes</p>
                          <ul className="space-y-1">
                            {summary.methodologyNotes.map((n, i) => (
                              <li key={i} className="text-sm flex gap-2"><span className="text-violet-500 shrink-0">•</span>{n}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {summary.applicableTo && summary.applicableTo.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          <span className="text-xs text-muted-foreground font-medium">Applicable to:</span>
                          {summary.applicableTo.map((t, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 bg-muted rounded-full">{t}</span>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex flex-col gap-3 pt-1">
                    <button
                      onClick={sendSummaryToChat}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors w-fit"
                    >
                      <Send className="h-4 w-4" />
                      Send to Chat
                    </button>

                    {destination === "student" && !published && (
                      <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Publish to {coachSession.studentName}</p>
                        <input
                          value={publishTitle}
                          onChange={(e) => setPublishTitle(e.target.value)}
                          placeholder="Document title"
                          className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <textarea
                          value={publishContent}
                          onChange={(e) => setPublishContent(e.target.value)}
                          rows={5}
                          placeholder="Document content"
                          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-y"
                        />
                        <button
                          onClick={publish}
                          disabled={publishing || !publishTitle || !publishContent}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          <FileText className="h-4 w-4" />
                          {publishing ? "Publishing…" : "📤 Publish to Student"}
                        </button>
                      </div>
                    )}
                    {published && (
                      <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
                        <CheckCircle2 className="h-4 w-4" />
                        Published to {coachSession.studentName}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Chat area ── */}
      <div className="bg-card rounded-xl border border-border flex flex-col min-h-[420px] max-h-[600px]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full pt-8 pb-4 gap-5">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="p-3 rounded-full bg-primary/10">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <p className="text-base font-bold">Coaching Assistant</p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Ask anything about coaching {studentContext.studentName} — session prep,
                  GROW questions, interpreting their scores, or next-step strategies.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {STARTER_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="text-left text-sm px-3 py-2.5 rounded-lg border border-border bg-muted/30 hover:bg-muted hover:border-primary/30 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {msg.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5 text-primary" />}
                </div>
                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-base leading-relaxed ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm"}`}>
                  {msg.content === "" && msg.role === "assistant" ? (
                    <span className="inline-flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                    </span>
                  ) : (
                    <MessageContent content={msg.content} />
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border p-3 space-y-2">
          {micError && (
            <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-600 flex items-start justify-between gap-2">
              <span>{micError}</span>
              <button onClick={() => setMicError(null)} className="shrink-0 font-bold">✕</button>
            </div>
          )}
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={listening ? input + interimText : input}
              onChange={(e) => { if (!listening) setInput(e.target.value); }}
              onKeyDown={handleKeyDown}
              disabled={streaming || listening}
              rows={1}
              placeholder={listening ? "Listening… speak now" : "Ask about coaching strategy, GROW questions, session prep…"}
              className={`flex-1 resize-none bg-background border rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground disabled:opacity-50 max-h-32 overflow-y-auto ${listening ? "border-red-400" : "border-border"}`}
              style={{ minHeight: "38px" }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 128) + "px";
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || streaming || listening}
              className="shrink-0 h-9 w-9 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
            {speechSupported && (
              <button
                onClick={startChatListening}
                className={`shrink-0 h-9 w-9 flex items-center justify-center rounded-lg transition-all ${listening ? "bg-red-500 text-white ring-2 ring-red-300 animate-pulse" : "bg-muted text-muted-foreground hover:text-primary"}`}
                title={listening ? "Stop recording" : "Speak your message"}
              >
                {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground px-1">
            Enter to send · Shift+Enter for new line{speechSupported ? " · Mic to speak" : ""}
          </p>
        </div>
      </div>

      {/* ── COACH ONLY: Past Sessions ── */}
      {coachSession && (
        <div className="space-y-4">
          <h3 className="text-base font-bold">Past Sessions</h3>
          <div className="flex gap-4 border-b border-border">
            {(["student", "general"] as SessionTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setSessionTab(t)}
                className={`pb-2 text-sm font-semibold border-b-2 transition-colors ${sessionTab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                {t === "student" ? `For ${coachSession.studentName}` : "General Knowledge"}
              </button>
            ))}
          </div>

          {loadingSessions ? (
            <div className="space-y-2">
              {[1, 2].map((i) => <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {(sessionTab === "student" ? pastSessions : generalSessions).map((s) => {
                const sum = s.aiSummary ? (() => { try { return JSON.parse(s.aiSummary) as AISummary; } catch { return null; } })() : null;
                const isOpen = expandedSession === s.id;
                return (
                  <div key={s.id} className="border border-border rounded-lg overflow-hidden">
                    <div className="flex items-center">
                      <button
                        onClick={() => setExpandedSession(isOpen ? null : s.id)}
                        className="flex-1 flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors text-left min-w-0"
                      >
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-medium shrink-0">
                          {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize shrink-0">{s.sessionType}</span>
                        {s.status === "published" && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 font-medium shrink-0">Published</span>
                        )}
                        <span className="text-sm text-muted-foreground flex-1 truncate">
                          {sum?.summary?.slice(0, 120) ?? (s.transcript?.slice(0, 120) ?? "No content")}
                        </span>
                        {isOpen ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!confirm("Delete this session?")) return;
                          await deleteSession(s.id);
                          loadPastSessions();
                        }}
                        className="shrink-0 px-3 py-3 text-muted-foreground hover:text-red-500 transition-colors"
                        title="Delete session"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {isOpen && sum && (
                      <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                        <p className="text-sm">{sum.summary}</p>
                        {sum.keyPoints && sum.keyPoints.length > 0 && (
                          <ul className="space-y-1">
                            {sum.keyPoints.map((p, i) => <li key={i} className="text-sm text-muted-foreground flex gap-2"><span className="text-primary">•</span>{p}</li>)}
                          </ul>
                        )}
                        {sum.growAlignment && (
                          <div className="text-sm text-muted-foreground">
                            <p><strong>Way Forward:</strong> {sum.growAlignment.wayForward}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {(sessionTab === "student" ? pastSessions : generalSessions).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">No sessions yet</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Markdown renderers ──────────────────────────────────────────

function MessageContent({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        const numMatch = line.match(/^(\d+)\.\s+(.+)/);
        if (numMatch) return (
          <div key={i} className="flex gap-2">
            <span className="shrink-0 font-semibold text-primary">{numMatch[1]}.</span>
            <InlineMarkdown text={numMatch[2]} />
          </div>
        );
        const bulletMatch = line.match(/^[-*]\s+(.+)/);
        if (bulletMatch) return (
          <div key={i} className="flex gap-2">
            <span className="shrink-0 text-primary mt-0.5">•</span>
            <InlineMarkdown text={bulletMatch[1]} />
          </div>
        );
        if (line.startsWith("## ")) return <p key={i} className="font-semibold text-sm mt-1">{line.slice(3)}</p>;
        return <p key={i}><InlineMarkdown text={line} /></p>;
      })}
    </div>
  );
}

function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
        if (part.startsWith("__") && part.endsWith("__")) return <strong key={i}>{part.slice(2, -2)}</strong>;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

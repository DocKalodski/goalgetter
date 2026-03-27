"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, MicOff, Send, Volume2, Save, Bot, User } from "lucide-react";
import { scanForPII } from "@/lib/utils/pii-scan";
import { createCoachSession, updateSessionTranscript } from "@/lib/actions/coach-sessions";
import { UpgradeModuleBanner } from "@/components/ui/UpgradeModuleBanner";

interface VoiceAICoachTabProps {
  students: { id: string; name: string | null }[];
  defaultStudentId: string;
  weekNumber: number;
  studentContext: {
    studentName: string;
    enrollmentResults: number;
    personalResults: number;
    professionalResults: number;
    enrollmentCurrentWeek: number;
    personalCurrentWeek: number;
    professionalCurrentWeek: number;
    reportingWeek: number;
  };
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STARTER_PROMPTS = [
  "How is this student progressing this week?",
  "What GROW questions should I ask today?",
  "This student seems stuck — what coaching approach?",
  "Help me prepare for the call time session",
  "What are the key action items for this student?",
  "How do I apply SMARTER goals here?",
];

export function VoiceAICoachTab({
  students,
  defaultStudentId,
  weekNumber,
  studentContext,
}: VoiceAICoachTabProps) {
  const [selectedStudentId, setSelectedStudentId] = useState(defaultStudentId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);
  const [micError, setMicError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) setSpeechSupported(false);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);
  const activeStudentContext = {
    ...studentContext,
    studentName: selectedStudent?.name?.split(" ")[0] ?? studentContext.studentName,
  };

  const submitMessage = useCallback(
    async (text: string, bypassScan = false) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;
      if (!bypassScan) {
        const scan = scanForPII(trimmed);
        if (!scan.clean) {
          const ok = window.confirm(`⚠️ Privacy Check\n\nMessage may contain: ${scan.warnings.join(", ")}.\n\nIt will be automatically redacted before reaching the AI.\n\nSend anyway?`);
          if (!ok) return;
        }
      }
      setInputText("");
      setInterimText("");

      const userMessage: Message = { role: "user", content: trimmed };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setIsLoading(true);
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: updatedMessages, studentContext: activeStudentContext }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Request failed" }));
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: `Error: ${err.error ?? "Something went wrong"}` };
            return updated;
          });
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
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: "assistant", content: accumulated };
              return updated;
            });
          }
        } catch {
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: accumulated || "Stream interrupted — please try again." };
            return updated;
          });
        }
      } catch {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: "Network error — please try again." };
          return updated;
        });
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, activeStudentContext]
  );

  const startListening = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    setMicError(null);
    if (listening) { recognitionRef.current?.stop(); return; }

    // Warm up mic permission explicitly before SpeechRecognition to get typed errors
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
      if (finalAccumulated) setInputText(finalAccumulated);
    };
    recognition.onend = () => {
      setListening(false);
      setInterimText("");
      if (finalAccumulated.trim()) {
        setTimeout(() => submitMessage(finalAccumulated), 100);
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      setListening(false);
      setInterimText("");
      if (event.error === "not-allowed" || event.error === "permission-denied") {
        setMicError("Microphone access denied. Please allow microphone permission in your browser and try again.");
      } else if (event.error === "no-speech") {
        setMicError("No speech detected. Please speak closer to your microphone.");
      } else if (event.error === "network") {
        setMicError("Network error. Speech recognition requires an internet connection.");
      } else {
        setMicError(`Microphone error: ${event.error}. Try refreshing the page.`);
      }
    };
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [listening, submitMessage]);

  function speak(text: string, index: number) {
    window.speechSynthesis.cancel();
    if (speakingIndex === index) { setSpeakingIndex(null); return; }
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 1.0;
    utt.onend = () => setSpeakingIndex(null);
    window.speechSynthesis.speak(utt);
    setSpeakingIndex(index);
  }

  async function handleSave() {
    if (messages.length === 0 || saving) return;
    setSaving(true);
    try {
      const transcript = messages
        .map((m) => `[${m.role === "user" ? "Coach" : "AI"}]: ${m.content}`)
        .join("\n");
      const session = await createCoachSession(selectedStudentId, "thought", weekNumber, "student");
      if (session?.id) await updateSessionTranscript(session.id, transcript);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error("Save failed:", e);
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitMessage(inputText); }
  }

  return (
    <div className="flex flex-col min-h-[600px] bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-4 pt-4"><UpgradeModuleBanner /></div>
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30">
        <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Student:</label>
        <select
          value={selectedStudentId}
          onChange={(e) => { setSelectedStudentId(e.target.value); setMessages([]); setSaved(false); }}
          className="flex-1 max-w-xs rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {students.map((s) => (
            <option key={s.id} value={s.id}>{s.name ?? "Unnamed Student"}</option>
          ))}
        </select>
        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md ml-auto">Week {weekNumber}</span>
        {!speechSupported && (
          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
            Voice not supported — use Chrome browser for voice
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-[400px]">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-6 py-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">AI Coaching Assistant</p>
                <p className="text-sm text-muted-foreground">
                  Ask about <span className="font-medium">{selectedStudent?.name ?? "your student"}</span>
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
              {STARTER_PROMPTS.map((prompt) => (
                <button key={prompt} onClick={() => submitMessage(prompt, true)}
                  className="text-left px-3 py-2.5 rounded-lg border border-border bg-muted/30 hover:bg-muted text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {prompt}
                </button>
              ))}
            </div>
            {speechSupported && (
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs text-muted-foreground">Or press the mic to speak</p>
                <button onClick={startListening}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${listening ? "bg-red-500 text-white ring-4 ring-red-300 animate-pulse" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
                  {listening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
                </button>
              </div>
            )}
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            {message.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4 text-primary" />
              </div>
            )}
            <div className={`max-w-[75%] flex flex-col gap-1 ${message.role === "user" ? "items-end" : "items-start"}`}>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${message.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm"}`}>
                {message.content === "" && message.role === "assistant" ? (
                  <span className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                  </span>
                ) : message.content}
              </div>
              {message.role === "assistant" && message.content && (
                <button onClick={() => speak(message.content, index)}
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors ${speakingIndex === index ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-muted"}`}>
                  <Volume2 className="w-3 h-3" />
                  {speakingIndex === index ? "Stop" : "Listen"}
                </button>
              )}
            </div>
            {message.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4 text-primary" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Mic error banner */}
      {micError && (
        <div className="mx-4 mt-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-600 flex items-start justify-between gap-3">
          <span>{micError}</span>
          <button onClick={() => setMicError(null)} className="shrink-0 text-red-400 hover:text-red-600 font-bold">✕</button>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border bg-background px-4 py-3 space-y-2">
        <div className="flex gap-2 items-end">
          <textarea
            value={listening ? inputText + interimText : inputText}
            onChange={(e) => { if (!listening) setInputText(e.target.value); }}
            onKeyDown={handleKeyDown}
            placeholder={listening ? "Listening… speak now" : "Type a message or press mic to speak…"}
            rows={2}
            disabled={listening}
            className={`flex-1 resize-none rounded-xl border px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary ${listening ? "border-red-400 text-muted-foreground" : "border-border"}`}
          />
          <div className="flex flex-col gap-2">
            <button onClick={() => submitMessage(inputText)}
              disabled={!inputText.trim() || isLoading || listening}
              className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 transition-colors">
              <Send className="w-4 h-4" />
            </button>
            {speechSupported && (
              <button onClick={startListening}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${listening ? "bg-red-500 text-white ring-2 ring-red-300 animate-pulse" : "bg-muted text-muted-foreground hover:text-primary"}`}>
                {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Enter to send · Shift+Enter for new line
          </p>
          <button onClick={handleSave}
            disabled={messages.length === 0 || saving || saved}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${saved ? "bg-green-100 text-green-700 border border-green-300" : messages.length === 0 ? "opacity-40 cursor-not-allowed bg-muted text-muted-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary border border-border"}`}>
            <Save className="w-3.5 h-3.5" />
            {saved ? "Saved!" : saving ? "Saving…" : "Save to Student File"}
          </button>
        </div>
      </div>
    </div>
  );
}

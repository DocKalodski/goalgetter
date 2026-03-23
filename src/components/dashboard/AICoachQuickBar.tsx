"use client";

import { useState, useRef } from "react";
import { Mic, MicOff, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { createCoachSession, updateSessionTranscript } from "@/lib/actions/coach-sessions";
import { useNavigation } from "@/components/layout/DashboardShell";

interface AICoachQuickBarProps {
  students: { id: string; name: string | null }[];
  weekNumber: number;
}

export function AICoachQuickBar({ students, weekNumber }: AICoachQuickBarProps) {
  const { setSelectedStudentId, setActiveL3Tab, setCurrentPage } = useNavigation();
  const [expanded, setExpanded] = useState(false);
  const [sessionType, setSessionType] = useState("meeting");
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [activeSpeaker, setActiveSpeaker] = useState<string>("Coach");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeStudentId, setActiveStudentId] = useState<string | null>(
    students[0]?.id ?? null
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef(transcript);
  transcriptRef.current = transcript;

  const speakers = ["Coach", ...students.map((s) => s.name ?? s.id)];

  async function startRecording() {
    const session = await createCoachSession(activeStudentId, sessionType, weekNumber, "student");
    setSessionId(session.id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsRecording(true);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript + " ";
        }
      }
      if (final) {
        const tagged = `[${activeSpeaker}]: ${final.trim()}\n`;
        setTranscript((prev) => prev + tagged);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }

  async function stopRecording() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsRecording(false);
    if (sessionId && transcriptRef.current) {
      await updateSessionTranscript(sessionId, transcriptRef.current);
    }
  }

  function openFullAICoach() {
    if (activeStudentId) {
      setSelectedStudentId(activeStudentId);
      setActiveL3Tab("ai-coach");
      setCurrentPage("L3");
    }
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full flex items-center justify-between px-4 py-3 bg-card border border-border rounded-xl text-sm font-semibold hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Mic className="h-4 w-4 text-primary" />
          <span>🎙 AI Coach Quick Capture</span>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold">🎙 AI Coach Quick Capture</span>
        </div>
        <button onClick={() => setExpanded(false)}>
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Session type */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-muted-foreground whitespace-nowrap">Type</label>
        <select
          value={sessionType}
          onChange={(e) => setSessionType(e.target.value)}
          disabled={isRecording}
          className="bg-background border border-border rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
        >
          <option value="meeting">Meeting</option>
          <option value="call">Call Time</option>
          <option value="thought">Thought</option>
          <option value="group">Group</option>
        </select>
      </div>

      {/* Speaker tag buttons */}
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Active speaker:</p>
        <div className="flex gap-2 flex-wrap">
          {speakers.map((sp) => (
            <button
              key={sp}
              onClick={() => {
                setActiveSpeaker(sp);
                // Also set active student if tapping a student name
                const student = students.find((s) => (s.name ?? s.id) === sp);
                if (student) setActiveStudentId(student.id);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                activeSpeaker === sp
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {sp}
            </button>
          ))}
        </div>
      </div>

      {/* Record button */}
      <div className="flex gap-3 items-center">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Mic className="h-3.5 w-3.5" />
            Start
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors animate-pulse"
          >
            <MicOff className="h-3.5 w-3.5" />
            Stop
          </button>
        )}
      </div>

      {/* Transcript preview */}
      {transcript && (
        <div className="bg-background border border-border rounded-lg p-3 max-h-24 overflow-y-auto">
          <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">{transcript}</pre>
        </div>
      )}

      {/* Open full AI Coach */}
      <button
        onClick={openFullAICoach}
        className="flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        Open Full AI Coach →
      </button>
    </div>
  );
}

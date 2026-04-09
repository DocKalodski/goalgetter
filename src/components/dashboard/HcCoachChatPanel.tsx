"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigation } from "@/components/layout/DashboardShell";
import {
  getHcCoachMessages,
  sendHcCoachMessage,
  markHcCoachRead,
} from "@/lib/actions/hc-coach-messages";
import type { HcCoachMessage } from "@/lib/db/schema";
import { Send, X } from "lucide-react";

interface Props {
  coachId: string;
  coachName: string;
  onClose?: () => void;
}

export function HcCoachChatPanel({ coachId, coachName, onClose }: Props) {
  const { user } = useNavigation();
  const [messages, setMessages] = useState<HcCoachMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isHC = user.role === "head_coach";
  const otherName = isHC ? coachName : "Head Coach";

  const load = useCallback(async () => {
    try {
      const data = await getHcCoachMessages(coachId);
      setMessages(data);
      await markHcCoachRead(coachId);
    } catch {
      // silent
    }
  }, [coachId]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setInput("");
    try {
      await sendHcCoachMessage(coachId, trimmed);
      await load();
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function formatTime(date: Date | null) {
    if (!date) return "";
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function formatDate(date: Date | null) {
    if (!date) return "";
    return new Date(date).toLocaleDateString([], { month: "short", day: "numeric" });
  }

  const grouped: { date: string; messages: HcCoachMessage[] }[] = [];
  for (const msg of messages) {
    const d = formatDate(msg.createdAt);
    const last = grouped[grouped.length - 1];
    if (last && last.date === d) {
      last.messages.push(msg);
    } else {
      grouped.push({ date: d, messages: [msg] });
    }
  }

  return (
    <div className="flex flex-col h-[380px] bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30 shrink-0">
        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600 font-bold text-sm shrink-0">
          {otherName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight truncate">{otherName}</p>
          <p className="text-xs text-muted-foreground">
            {isHC ? `Private chat with coach` : "Private chat with your Head Coach"}
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-green-500 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
          Private
        </span>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted transition-colors ml-1">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-2">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Send className="h-5 w-5 text-amber-600" />
            </div>
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs text-muted-foreground">
              {isHC
                ? `Start a conversation with ${coachName}`
                : "Send a message to your Head Coach"}
            </p>
          </div>
        )}

        {grouped.map(({ date, messages: dayMsgs }) => (
          <div key={date}>
            <div className="flex items-center gap-3 my-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground font-medium">{date}</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {dayMsgs.map((msg, i) => {
              const isMine = msg.senderId === user.userId;
              const showName = i === 0 || dayMsgs[i - 1].senderId !== msg.senderId;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col mb-1 ${isMine ? "items-end" : "items-start"}`}
                >
                  {showName && (
                    <span className="text-xs text-muted-foreground mb-1 px-1">
                      {isMine ? "You" : msg.senderName ?? otherName}
                    </span>
                  )}
                  <div className="flex items-end gap-1.5 max-w-[75%]">
                    {!isMine && (
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-600 shrink-0 mb-0.5">
                        {(msg.senderName ?? otherName).charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div
                      className={`px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                        isMine
                          ? "bg-amber-500 text-white rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5 px-1">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border px-3 py-3 bg-background flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${otherName}…`}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-border bg-muted px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder:text-muted-foreground max-h-28 overflow-y-auto"
          style={{ lineHeight: "1.5" }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

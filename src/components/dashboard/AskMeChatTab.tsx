"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigation } from "@/components/layout/DashboardShell";
import {
  getDirectMessages,
  sendDirectMessage,
  markDirectMessagesRead,
} from "@/lib/actions/direct-messages";
import type { DirectMessage } from "@/lib/db/schema";
import { Send, ImagePlus, X } from "lucide-react";

interface Props {
  studentId: string;
  studentName: string;
}

export function AskMeChatTab({ studentId, studentName }: Props) {
  const { user } = useNavigation();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isCoach = user.role === "coach" || user.role === "head_coach";
  const otherName = isCoach ? studentName : "Coach";

  const load = useCallback(async () => {
    try {
      const data = await getDirectMessages(studentId);
      setMessages(data);
      await markDirectMessagesRead(studentId);
    } catch {
      // silent
    }
  }, [studentId]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    e.target.value = "";
  }

  function clearImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setImageFile(null);
  }

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed && !imageFile) return;
    if (sending) return;
    setSending(true);
    setInput("");
    const fileToSend = imageFile;
    clearImage();
    try {
      let uploadedUrl: string | undefined;
      if (fileToSend) {
        const fd = new FormData();
        fd.append("file", fileToSend);
        const res = await fetch("/api/chat/upload", { method: "POST", body: fd });
        if (res.ok) {
          const json = await res.json();
          uploadedUrl = json.url;
        }
      }
      await sendDirectMessage(studentId, trimmed, uploadedUrl);
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

  const grouped: { date: string; messages: DirectMessage[] }[] = [];
  for (const msg of messages) {
    const d = formatDate(msg.createdAt);
    const last = grouped[grouped.length - 1];
    if (last && last.date === d) last.messages.push(msg);
    else grouped.push({ date: d, messages: [msg] });
  }

  return (
    <>
      <div className="flex flex-col h-[380px] bg-card rounded-xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30 shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
            {otherName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">{otherName}</p>
            <p className="text-xs text-muted-foreground">
              {isCoach ? "Private chat with student" : "Private chat with your coach"}
            </p>
          </div>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-green-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Private
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 min-h-0">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Send className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-medium">No messages yet</p>
              <p className="text-xs text-muted-foreground">
                {isCoach
                  ? `Start a private conversation with ${studentName}`
                  : "Send a message to your coach"}
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
                        <div className="w-6 h-6 rounded-full bg-secondary/30 flex items-center justify-center text-xs font-bold text-secondary-foreground shrink-0 mb-0.5">
                          {(msg.senderName ?? otherName).charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col gap-1">
                        {msg.imageUrl && (
                          <button
                            onClick={() => setLightbox(msg.imageUrl!)}
                            className="rounded-xl overflow-hidden border border-border hover:opacity-90 transition-opacity"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={msg.imageUrl}
                              alt="shared image"
                              className="max-w-[220px] max-h-[200px] object-cover block"
                            />
                          </button>
                        )}
                        {msg.content && (
                          <div
                            className={`px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                              isMine
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : "bg-muted text-foreground rounded-bl-sm"
                            }`}
                          >
                            {msg.content}
                          </div>
                        )}
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

        {/* Image preview strip */}
        {imagePreview && (
          <div className="shrink-0 px-3 pt-2 flex items-center gap-2 border-t border-border bg-background">
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="preview" className="h-16 w-16 object-cover rounded-lg border border-border" />
              <button
                onClick={clearImage}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/80"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <span className="text-xs text-muted-foreground truncate max-w-[160px]">{imageFile?.name}</span>
          </div>
        )}

        {/* Input */}
        <div className="shrink-0 border-t border-border px-3 py-3 bg-background flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleImageSelect}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Attach image"
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
          >
            <ImagePlus className="h-4 w-4" />
          </button>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${otherName}…`}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-border bg-muted px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground max-h-28 overflow-y-auto"
            style={{ lineHeight: "1.5" }}
          />
          <button
            onClick={handleSend}
            disabled={(!input.trim() && !imageFile) || sending}
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="full size"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </>
  );
}

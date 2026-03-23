"use client";

import { useEffect, useState } from "react";
import { getStudentDocuments, markDocumentRead } from "@/lib/actions/coach-sessions";
import type { CoachDocument } from "@/lib/db/schema";
import { FileText, BookOpen } from "lucide-react";

export function CoachNotesPanel({ studentId }: { studentId: string }) {
  const [docs, setDocs] = useState<CoachDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentDocuments(studentId)
      .then(setDocs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [studentId]);

  async function handleMarkRead(docId: string) {
    await markDocumentRead(docId);
    setDocs((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, readAt: new Date() } : d))
    );
  }

  if (loading) return null;
  if (docs.length === 0) return null;

  const unreadCount = docs.filter((d) => !d.readAt).length;

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-primary/10">
          <FileText className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-base font-bold">Coach Notes</h3>
        {unreadCount > 0 && (
          <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5 font-semibold">
            {unreadCount} new
          </span>
        )}
      </div>

      <div className="space-y-3">
        {docs.map((doc) => (
          <div
            key={doc.id}
            className={`border rounded-lg p-4 space-y-2 transition-colors ${
              !doc.readAt ? "border-primary/30 bg-primary/5" : "border-border"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                {!doc.readAt && (
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-0.5" />
                )}
                <p className="text-sm font-semibold">{doc.title}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                {new Date(doc.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{doc.content}</p>
            {!doc.readAt && (
              <button
                onClick={() => handleMarkRead(doc.id)}
                className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
              >
                <BookOpen className="h-3.5 w-3.5" />
                Mark as read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Check, X, Pencil, Clock } from "lucide-react";
import { saveStudentName, saveMyDeclaration, approveStudentNameChange } from "@/lib/actions/students";
import { approveDeclaration } from "@/lib/actions/approvals";

interface StudentInfo {
  id: string;
  name: string | null;
  email: string;
  pendingName: string | null;
  declaration: string | null;
  pendingDeclarationId: string | null;
  pendingDeclarationText: string | null;
  buddyName: string | null;
  councilName: string | null;
  coachName: string | null;
}

interface Props {
  student: StudentInfo;
  isCoach: boolean;
  onRefresh: () => void;
}

export function StudentProfileCard({ student, isCoach, onRefresh }: Props) {
  const [editingName, setEditingName] = useState(false);
  const [editingDeclaration, setEditingDeclaration] = useState(false);
  const [nameInput, setNameInput] = useState(student.name ?? "");
  const [declarationInput, setDeclarationInput] = useState(student.declaration ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSaveName() {
    setSaving(true);
    try {
      await saveStudentName(nameInput);
      setEditingName(false);
      onRefresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveDeclaration() {
    setSaving(true);
    try {
      await saveMyDeclaration(declarationInput);
      setEditingDeclaration(false);
      onRefresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleApproveName(approve: boolean) {
    setSaving(true);
    try {
      await approveStudentNameChange(student.id, approve);
      onRefresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleApproveDeclaration(approve: boolean) {
    if (!student.pendingDeclarationId) return;
    setSaving(true);
    try {
      await approveDeclaration(student.pendingDeclarationId, approve ? "approved" : "rejected");
      onRefresh();
    } finally {
      setSaving(false);
    }
  }

  const displayName = student.name || student.email;

  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 space-y-2">

      {/* Row 1: Name · Declaration */}
      <div className="flex items-baseline gap-2 flex-wrap min-w-0">

        {/* Name segment */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-sm font-bold text-foreground leading-snug">{displayName}</span>
          {student.pendingName && (
            <span className="flex items-center gap-0.5 text-[10px] text-warning font-medium">
              <Clock className="h-2.5 w-2.5" />
              &ldquo;{student.pendingName}&rdquo;
            </span>
          )}
          {isCoach && student.pendingName && (
            <span className="flex items-center gap-0.5 ml-0.5">
              <button onClick={() => handleApproveName(true)} disabled={saving} title="Approve name" className="p-0.5 rounded bg-success/10 hover:bg-success/20 text-success">
                <Check className="h-3 w-3" />
              </button>
              <button onClick={() => handleApproveName(false)} disabled={saving} title="Reject name" className="p-0.5 rounded bg-destructive/10 hover:bg-destructive/20 text-destructive">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {!isCoach && !student.pendingName && (
            <button onClick={() => { setNameInput(student.name ?? ""); setEditingName(true); }} className="p-1.5 rounded-md bg-muted border border-border text-red-500 hover:bg-red-500/10 hover:border-red-400/50 transition-colors">
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <span className="text-border select-none text-xs">·</span>

        {/* Declaration segment */}
        <div className="flex-1 min-w-0 flex items-center gap-1.5">
          <span className={`text-xs italic leading-snug line-clamp-1 ${student.declaration ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
            {student.declaration ? `"${student.declaration}"` : "No declaration."}
          </span>
          {student.pendingDeclarationText && (
            <span className="flex items-center gap-0.5 text-[10px] text-warning font-medium shrink-0">
              <Clock className="h-2.5 w-2.5" /> Pending
              {isCoach && (
                <>
                  <button onClick={() => handleApproveDeclaration(true)} disabled={saving} title="Approve declaration" className="ml-0.5 p-0.5 rounded bg-success/10 hover:bg-success/20 text-success">
                    <Check className="h-3 w-3" />
                  </button>
                  <button onClick={() => handleApproveDeclaration(false)} disabled={saving} title="Reject declaration" className="p-0.5 rounded bg-destructive/10 hover:bg-destructive/20 text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </>
              )}
            </span>
          )}
          {!isCoach && !student.pendingDeclarationText && (
            <button onClick={() => { setDeclarationInput(student.declaration ?? ""); setEditingDeclaration(true); }} className="p-1.5 rounded-md bg-muted border border-border text-red-500 hover:bg-red-500/10 hover:border-red-400/50 transition-colors shrink-0">
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Name edit form (expands below row 1) */}
      {editingName && (
        <div className="flex items-center gap-2">
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="flex-1 text-sm bg-transparent border border-input rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring"
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") setEditingName(false); }}
          />
          <button onClick={handleSaveName} disabled={saving} className="p-1 rounded hover:bg-muted text-success">
            <Check className="h-4 w-4" />
          </button>
          <button onClick={() => setEditingName(false)} className="p-1 rounded hover:bg-muted text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Declaration edit form (expands below row 1) */}
      {editingDeclaration && (
        <div className="space-y-1.5">
          <textarea
            value={declarationInput}
            onChange={(e) => setDeclarationInput(e.target.value)}
            rows={3}
            className="w-full text-sm bg-transparent border border-input rounded-md px-2 py-1 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            autoFocus
          />
          <div className="flex items-center gap-2">
            <button onClick={handleSaveDeclaration} disabled={saving} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
              <Check className="h-3 w-3" /> Submit for Approval
            </button>
            <button onClick={() => setEditingDeclaration(false)} className="px-2.5 py-1 text-xs rounded-md hover:bg-muted text-muted-foreground">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Row 2: Buddy / Council / Coach */}
      <div className="flex items-center gap-4 pt-1.5 border-t border-border flex-wrap">
        <MetaField label="Buddy" value={student.buddyName} />
        <MetaField label="Council" value={student.councilName} />
        <MetaField label="Coach" value={student.coachName} />
      </div>

    </div>
  );
}

function MetaField({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}:</span>
      <span className="text-xs text-foreground">{value ?? "—"}</span>
    </div>
  );
}

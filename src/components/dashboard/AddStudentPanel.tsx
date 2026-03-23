"use client";

import { useState } from "react";
import { addStudent } from "@/lib/actions/user-management";

interface AddStudentPanelProps {
  councilId?: string;
  onStudentAdded?: () => void;
  onClose: () => void;
}

export function AddStudentPanel({ councilId, onStudentAdded, onClose }: AddStudentPanelProps) {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddStudent(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await addStudent({ ...formData, councilId });
      if (result.success) {
        setFormData({ name: "", email: "", password: "" });
        onStudentAdded?.();
        onClose();
      } else {
        setError(result.error || "Failed to add student");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add student");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleAddStudent} className="p-4 bg-muted/50 rounded-lg space-y-3">
      {error && (
        <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-lg">{error}</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Student Name"
          value={formData.name}
          onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
          className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
        <input
          type="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
          className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
        <input
          type="password"
          placeholder="Password (min 8 chars)"
          value={formData.password}
          onChange={(e) => setFormData((f) => ({ ...f, password: e.target.value }))}
          className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
          minLength={8}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {submitting ? "Adding..." : "Add Student"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm bg-muted text-muted-foreground rounded-lg hover:bg-muted/80"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

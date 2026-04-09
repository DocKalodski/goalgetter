"use client";

import { useState } from "react";
import { login } from "@/lib/actions/auth";
import { isRedirectError } from "next/dist/client/components/redirect";

const PASSCODE_MAP: Record<string, { email: string; label: string }> = {
  hcleap99beta2:      { email: "beta_hc@leap99.test",      label: "L99HCoach — Head Coach View" },
  coachleap99beta2:   { email: "beta_coach@leap99.test",   label: "L99Coach — Coach View" },
  studentleap99beta2: { email: "beta_student@leap99.test", label: "L99Student — Student View" },
  buddyleap99beta2:   { email: "beta_buddy@leap99.test",   label: "L99Buddy — Student View" },
  tester2leap99beta2: { email: "beta_tester2@leap99.test", label: "Beta Tester2 — Student View" },
};

export function BetaLoginForm() {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const entry = PASSCODE_MAP[passcode.trim()];
    if (!entry) {
      setError("Invalid passcode. Check with your beta coordinator.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("email", entry.email);
      fd.append("password", passcode.trim());
      const result = await login(fd);
      if (result?.error) setError(result.error);
    } catch (e) {
      if (isRedirectError(e)) throw e;
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
          {error}
        </div>
      )}
      <input
        type="text"
        value={passcode}
        onChange={(e) => setPasscode(e.target.value)}
        placeholder="Enter beta passcode"
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        autoComplete="off"
      />
      <button
        type="submit"
        disabled={!passcode.trim() || loading}
        className="inline-flex items-center justify-center w-full h-10 px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-md hover:bg-amber-600 disabled:opacity-50 disabled:pointer-events-none transition-colors"
      >
        {loading ? "Entering…" : "Enter Beta View"}
      </button>
    </form>
  );
}

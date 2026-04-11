"use client";

import { useState } from "react";
import { devLogin } from "@/lib/actions/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";

const ROLE_VIEWS = [
  { key: "HC", label: "Head Coach",  desc: "All councils · spy mode 👀", color: "bg-purple-700 hover:bg-purple-600" },
  { key: "F",  label: "Facilitator", desc: "Read-only · L1 + L2 · no student detail", color: "bg-violet-800 hover:bg-violet-700" },
] as const;

const COACHES = [
  { key: "CK",   label: "Coach Kinder",          council: "KINDER",          color: "bg-sky-800 hover:bg-sky-700" },
  { key: "CMG",  label: "Coach MARY-G",           council: "MARY-G",          color: "bg-sky-800 hover:bg-sky-700" },
  { key: "CMAG", label: "Coach The Magnificants", council: "The Magnificents", color: "bg-sky-800 hover:bg-sky-700" },
] as const;

const STUDENTS = [
  { key: "SK",   label: "Student Kinder",          council: "KINDER",          color: "bg-teal-800 hover:bg-teal-700" },
  { key: "SMG",  label: "Student MARY-G",           council: "MARY-G",          color: "bg-teal-800 hover:bg-teal-700" },
  { key: "SMAG", label: "Student The Magnificents", council: "The Magnificents", color: "bg-teal-800 hover:bg-teal-700" },
] as const;

export default function Beta2Page() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(key: string) {
    setLoading(key);
    setError(null);
    try {
      await devLogin(key);
    } catch (e) {
      if (isRedirectError(e)) throw e;
      setError("Login failed. Check account exists in DB.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center gap-12 p-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-white">GoalGetter</h1>
        <p className="text-sm text-gray-400">Dev Quick-Login · not visible to participants</p>
      </div>

      <div className="w-full max-w-2xl space-y-12">
        {/* Role views */}
        <div className="space-y-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Role Views</p>
          <div className="grid grid-cols-1 gap-3">
            {ROLE_VIEWS.map((v) => (
              <button
                key={v.key}
                type="button"
                disabled={!!loading}
                onClick={() => handleLogin(v.key)}
                className={`w-full flex flex-col items-start justify-center px-6 py-4 rounded-lg text-white font-bold transition-all disabled:opacity-50 ${v.color}`}
              >
                <p className="text-lg">{loading === v.key ? "Logging in…" : v.label}</p>
                <p className="text-xs font-normal opacity-70">{v.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Coaches */}
        <div className="space-y-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Coaches</p>
          <div className="grid grid-cols-3 gap-3">
            {COACHES.map((v) => (
              <button
                key={v.key}
                type="button"
                disabled={!!loading}
                onClick={() => handleLogin(v.key)}
                className={`flex flex-col items-center justify-center px-4 py-4 rounded-lg text-white font-semibold transition-all disabled:opacity-50 ${v.color}`}
              >
                <p className="text-sm">{loading === v.key ? "…" : v.label}</p>
                <p className="text-xs font-normal opacity-70 mt-1">{v.council}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Students */}
        <div className="space-y-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Students</p>
          <div className="grid grid-cols-3 gap-3">
            {STUDENTS.map((v) => (
              <button
                key={v.key}
                type="button"
                disabled={!!loading}
                onClick={() => handleLogin(v.key)}
                className={`flex flex-col items-center justify-center px-4 py-4 rounded-lg text-white font-semibold transition-all disabled:opacity-50 ${v.color}`}
              >
                <p className="text-sm">{loading === v.key ? "…" : v.label}</p>
                <p className="text-xs font-normal opacity-70 mt-1">{v.council}</p>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-300 bg-red-950/50 border border-red-800 rounded-lg px-4 py-3">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

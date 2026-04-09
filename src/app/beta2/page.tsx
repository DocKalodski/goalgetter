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
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-8 p-6">
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-black text-white">GoalGetter</h1>
        <p className="text-sm text-gray-500">Dev Quick-Login · not visible to participants</p>
      </div>

      {/* Role views */}
      <div className="w-full max-w-sm space-y-3">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Role Views</p>
        {ROLE_VIEWS.map((v) => (
          <button
            key={v.key}
            type="button"
            disabled={!!loading}
            onClick={() => handleLogin(v.key)}
            className={`w-full flex items-center justify-between px-5 py-3.5 rounded-xl text-white font-bold transition-all disabled:opacity-50 ${v.color}`}
          >
            <div className="text-left">
              <p className="text-base leading-tight">{loading === v.key ? "Logging in…" : v.label}</p>
              <p className="text-xs font-normal opacity-60">{v.desc}</p>
            </div>
            <span className="text-xs font-black opacity-40 ml-4">{v.key}</span>
          </button>
        ))}
      </div>

      {/* Coaches */}
      <div className="w-full max-w-sm space-y-3">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Coaches</p>
        {COACHES.map((v) => (
          <button
            key={v.key}
            type="button"
            disabled={!!loading}
            onClick={() => handleLogin(v.key)}
            className={`w-full flex items-center justify-between px-5 py-3 rounded-xl text-white font-semibold transition-all disabled:opacity-50 ${v.color}`}
          >
            <div className="text-left">
              <p className="text-sm leading-tight">{loading === v.key ? "Logging in…" : v.label}</p>
              <p className="text-xs font-normal opacity-50">{v.council}</p>
            </div>
            <span className="text-xs font-black opacity-40 ml-4">{v.key}</span>
          </button>
        ))}
      </div>

      {/* Students */}
      <div className="w-full max-w-sm space-y-3">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Students</p>
        {STUDENTS.map((v) => (
          <button
            key={v.key}
            type="button"
            disabled={!!loading}
            onClick={() => handleLogin(v.key)}
            className={`w-full flex items-center justify-between px-5 py-3 rounded-xl text-white font-semibold transition-all disabled:opacity-50 ${v.color}`}
          >
            <div className="text-left">
              <p className="text-sm leading-tight">{loading === v.key ? "Logging in…" : v.label}</p>
              <p className="text-xs font-normal opacity-50">{v.council}</p>
            </div>
            <span className="text-xs font-black opacity-40 ml-4">{v.key}</span>
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-2">
          {error}
        </p>
      )}
    </div>
  );
}

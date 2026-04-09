"use client";

import { LoginForm } from "@/components/forms/LoginForm";
import { useState } from "react";
import { devLogin } from "@/lib/actions/auth";
import { isRedirectError } from "next/dist/client/components/redirect";

const QUICK_LOGIN = [
  { name: "HC · Louie", key: "HC", color: "bg-purple-600 hover:bg-purple-700" },
  { name: "Facilitator", key: "F", color: "bg-slate-700 hover:bg-slate-800" },
  { name: "Coach · Kinder", key: "CK", color: "bg-blue-600 hover:bg-blue-700" },
  { name: "Coach · MARY-G", key: "CMG", color: "bg-blue-600 hover:bg-blue-700" },
  { name: "Coach · Magnificents", key: "CMAG", color: "bg-blue-600 hover:bg-blue-700" },
  { name: "Student · Kinder", key: "SK", color: "bg-emerald-600 hover:bg-emerald-700" },
  { name: "Student · MARY-G", key: "SMG", color: "bg-emerald-600 hover:bg-emerald-700" },
  { name: "Student · Magnificents", key: "SMAG", color: "bg-emerald-600 hover:bg-emerald-700" },
];

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string }>;
}) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleQuickLogin(key: string) {
    setLoading(key);
    try {
      await devLogin(key);
    } catch (e) {
      if (isRedirectError(e)) throw e;
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            GoalGetter
          </h1>
          <p className="text-muted-foreground mt-2">
            LEAP 99 Goal Tracking Platform
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">by Doc Kalodski</p>
        </div>

        <div className="bg-card rounded-xl shadow-lg border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Sign in to your account</h2>

          {/* Quick Login Buttons */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">BETA · QUICK LOGIN</p>
            <div className="grid grid-cols-2 gap-2 w-full">
              {QUICK_LOGIN.map((btn) => (
                <button
                  key={btn.key}
                  type="button"
                  onClick={() => handleQuickLogin(btn.key)}
                  disabled={!!loading}
                  className={`w-full px-3 py-2.5 rounded-lg text-xs font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${btn.color}`}
                >
                  {loading === btn.key ? "..." : btn.name}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-card text-muted-foreground">or sign in manually</span>
            </div>
          </div>

          {/* Manual Login */}
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

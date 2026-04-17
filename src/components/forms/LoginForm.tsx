"use client";

import { useState } from "react";
import { devLogin } from "@/lib/actions/auth";

const ROLES_BASIC = [
  { key: "HC" as const, label: "Head Coach", color: "bg-blue-600 hover:bg-blue-700" },
  { key: "C" as const, label: "Coach", color: "bg-green-600 hover:bg-green-700" },
  { key: "S" as const, label: "Student", color: "bg-purple-600 hover:bg-purple-700" },
];

export function LoginForm() {
  const [isPending, setIsPending] = useState(false);
  const isDemo = process.env.NEXT_PUBLIC_DEMO_11_BUTTONS === "true";

  const handleLogin = async (passcode: string) => {
    setIsPending(true);
    try {
      await devLogin(passcode);
    } catch (error) {
      // Re-throw redirect errors so navigation actually happens
      if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
        throw error;
      }
      console.error("Login error:", error);
      setIsPending(false);
    }
  };

  // 11-Button Demo Version
  if (isDemo) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => handleLogin("HC")}
          disabled={isPending}
          className="w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-700"
        >
          {isPending ? "Signing in..." : "HC view"}
        </button>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Coach Iya (Kinder)</p>
          <button
            type="button"
            onClick={() => handleLogin("COACH_IYA")}
            disabled={isPending}
            className="w-full py-2.5 px-4 rounded-lg font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-sm"
          >
            {isPending ? "Signing in..." : "Demo Coach Iya view"}
          </button>
          <div className="grid grid-cols-2 gap-2">
            {["STUDENT_1A", "STUDENT_1B", "STUDENT_1C", "STUDENT_1D"].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleLogin(key)}
                disabled={isPending}
                className="py-2 px-3 rounded-lg font-semibold text-white text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-cyan-500 hover:bg-cyan-600"
              >
                {key.replace("STUDENT_", "Student ")}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Coach RJ (Mary-g)</p>
          <button
            type="button"
            onClick={() => handleLogin("COACH_RJ")}
            disabled={isPending}
            className="w-full py-2.5 px-4 rounded-lg font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-green-600 hover:bg-green-700 text-sm"
          >
            {isPending ? "Signing in..." : "Demo Coach RJ view"}
          </button>
          <div className="grid grid-cols-2 gap-2">
            {["STUDENT_2A", "STUDENT_2B", "STUDENT_2C", "STUDENT_2D"].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleLogin(key)}
                disabled={isPending}
                className="py-2 px-3 rounded-lg font-semibold text-white text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-500 hover:bg-emerald-600"
              >
                {key.replace("STUDENT_", "Student ")}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center pt-4">Demo mode — all goals from APA</p>
      </div>
    );
  }

  // 3-Button Basic Version
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {ROLES_BASIC.map((role) => (
          <button
            key={role.key}
            type="button"
            onClick={() => handleLogin(role.key)}
            disabled={isPending}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${role.color}`}
          >
            {isPending ? "Signing in..." : `Login as ${role.label}`}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center pt-2">Demo mode — no password required</p>
    </div>
  );
}

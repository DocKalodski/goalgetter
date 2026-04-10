'use client';

import { LoginForm } from "@/components/forms/LoginForm";
import { devLoginAction } from "@/lib/actions/auth";
import { useTransition } from "react";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string }>;
}) {
  const [isPending, startTransition] = useTransition();

  const handleHCLogin = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("key", "HC");
      await devLoginAction(formData);
    });
  };

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

          {/* HC Quick Login */}
          <button
            type="button"
            onClick={handleHCLogin}
            disabled={isPending}
            className="w-full px-4 py-3 rounded-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Signing in..." : "HC · Louie"}
          </button>

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

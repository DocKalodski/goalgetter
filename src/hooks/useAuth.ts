"use client";

import { useEffect, useState } from "react";

interface AuthUser {
  userId: string;
  role: "head_coach" | "coach" | "council_leader" | "student";
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch {
        // Not authenticated
      } finally {
        setLoading(false);
      }
    }
    check();
  }, []);

  return { user, loading };
}

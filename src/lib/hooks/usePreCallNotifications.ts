"use client";

import { useEffect, useState, useRef } from "react";

interface BatchCallSchedule {
  callTimes: Record<string, string>; // { mon: "09:00", wed: "10:30", ... }
  weeklyMeetingDay: string | null;   // "monday"|"tuesday"|...
  weeklyMeetingTime: string | null;  // "HH:MM"
}

const DAY_MAP: Record<string, number> = {
  monday: 0, tuesday: 1, wednesday: 2, thursday: 3, friday: 4, saturday: 5, sunday: 6,
  mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6,
};

/** Returns minutes until the next call TODAY, or -1 if none */
function minutesUntilNextCallToday(schedule: BatchCallSchedule): number {
  const now = new Date();
  const todayIndex = (now.getDay() + 6) % 7; // 0=Mon … 6=Sun
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  let minDiff = Infinity;

  for (const [day, time] of Object.entries(schedule.callTimes)) {
    if (!time) continue;
    const dayIdx = DAY_MAP[day.toLowerCase()];
    if (dayIdx !== todayIndex) continue;
    const [h, m] = time.split(":").map(Number);
    const diff = h * 60 + m - nowMinutes;
    if (diff > 0 && diff < minDiff) minDiff = diff;
  }

  if (schedule.weeklyMeetingDay && schedule.weeklyMeetingTime) {
    const dayIdx = DAY_MAP[schedule.weeklyMeetingDay.toLowerCase()];
    if (dayIdx === todayIndex) {
      const [h, m] = schedule.weeklyMeetingTime.split(":").map(Number);
      const diff = h * 60 + m - nowMinutes;
      if (diff > 0 && diff < minDiff) minDiff = diff;
    }
  }

  return minDiff === Infinity ? -1 : minDiff;
}

async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const r = await Notification.requestPermission();
  return r === "granted";
}

/**
 * Hook for pre-call notifications.
 * Returns `minutesUntil` — minutes until the next call today, or null.
 * At T-10 fires a browser notification ("Setup transcriptor").
 */
export function usePreCallNotifications(isCoach: boolean): { minutesUntil: number | null } {
  const [minutesUntil, setMinutesUntil] = useState<number | null>(null);
  const [schedule, setSchedule] = useState<BatchCallSchedule | null>(null);
  const notifiedRef = useRef<string | null>(null); // tracks the call key we already notified

  // Fetch schedule once
  useEffect(() => {
    if (!isCoach) return;
    fetch("/api/pre-call")
      .then((r) => r.json())
      .then((data: BatchCallSchedule) => {
        if (data && (Object.keys(data.callTimes || {}).length > 0 || data.weeklyMeetingDay)) {
          setSchedule(data);
        }
      })
      .catch(() => {});
  }, [isCoach]);

  // Check every minute
  useEffect(() => {
    if (!schedule) return;

    async function check() {
      if (!schedule) return;
      const mins = minutesUntilNextCallToday(schedule);
      setMinutesUntil(mins > 0 && mins <= 60 ? mins : null);

      // Fire notification at T-10 (once per call time)
      if (mins >= 9 && mins <= 10) {
        const now = new Date();
        const callKey = `${now.toDateString()}-${now.getHours()}-${Math.floor(now.getMinutes() / 10)}`;
        if (notifiedRef.current !== callKey) {
          notifiedRef.current = callKey;
          const permitted = await requestNotificationPermission();
          if (permitted) {
            new Notification("📞 Call in ~10 minutes", {
              body: "Open Adventure Journal & setup your transcriptor before the call starts.",
              icon: "/favicon.ico",
              tag: "pre-call",
            });
          }
        }
      }
    }

    check();
    const interval = setInterval(check, 60 * 1000);
    return () => clearInterval(interval);
  }, [schedule]);

  return { minutesUntil };
}

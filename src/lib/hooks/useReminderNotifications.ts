"use client";

import { useEffect } from "react";

interface CalendarEvent {
  id: string;
  title: string;
  eventDate: string;
  reminderSent: number;
  reminderType: string | null;
}

async function requestPushPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

function showNotification(title: string, body: string) {
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "/favicon.ico" });
  }
}

export function useReminderNotifications(studentId: string) {
  useEffect(() => {
    if (!studentId) return;

    async function checkReminders() {
      const permitted = await requestPushPermission();
      if (!permitted) return;

      try {
        const resp = await fetch(`/api/calendar?studentId=${studentId}`);
        const { events } = await resp.json() as { events: CalendarEvent[] };

        const today = new Date().toISOString().split("T")[0];
        const todayEvents = events.filter(
          (e) => e.eventDate === today && !e.reminderSent
        );

        if (todayEvents.length > 0) {
          showNotification(
            "GoalGetter — Today's Action Steps",
            `You have ${todayEvents.length} item${todayEvents.length > 1 ? "s" : ""} due today: ${todayEvents.map((e) => e.title).join(", ")}`
          );
          // Mark as sent
          await Promise.all(
            todayEvents.map((e) =>
              fetch("/api/calendar", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: e.id }),
              })
            )
          );
        }

        // Sunday weekly reminder
        const dayOfWeek = new Date().getDay();
        if (dayOfWeek === 0) {
          const upcomingWeek = new Date();
          upcomingWeek.setDate(upcomingWeek.getDate() + 7);
          const upcomingStr = upcomingWeek.toISOString().split("T")[0];
          const upcomingEvents = events.filter(
            (e) => e.eventDate > today && e.eventDate <= upcomingStr && !e.reminderSent
          );
          if (upcomingEvents.length > 0) {
            showNotification(
              "GoalGetter — Plan Your Week",
              `${upcomingEvents.length} item${upcomingEvents.length > 1 ? "s" : ""} coming up this week. Time to plan!`
            );
          }
        }
      } catch (e) {
        console.warn("Reminder check failed:", e);
      }
    }

    // Check on mount, then every hour
    checkReminders();
    const interval = setInterval(checkReminders, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [studentId]);
}

"use client";

import { useEffect } from "react";
import type { JWTPayload } from "@/lib/auth/jwt";

/**
 * Watermark overlay — covers the entire viewport with the user's email
 * repeated in a diagonal grid pattern. Very faint but survives screenshots.
 */
export function Watermark({ user }: { user: JWTPayload }) {
  const label = `${user.userId} · GoalGetter LEAP 99`;

  // Build a repeating diagonal SVG watermark
  const svgText = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="180">
      <text
        x="50%" y="50%"
        font-family="sans-serif"
        font-size="13"
        fill="rgba(120,120,120,0.09)"
        text-anchor="middle"
        dominant-baseline="middle"
        transform="rotate(-30 160 90)"
      >${label}</text>
    </svg>
  `);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none select-none z-40"
      style={{
        backgroundImage: `url("data:image/svg+xml,${svgText}")`,
        backgroundRepeat: "repeat",
        backgroundSize: "320px 180px",
      }}
    />
  );
}

/**
 * DataShield — mounts once per protected page.
 * - Blocks printing (CSS + JS beforeprint)
 * - Disables right-click on data areas
 * - Disables text selection on data tables
 * - Blocks keyboard print shortcuts (Ctrl/Cmd+P, Ctrl/Cmd+S)
 */
export function DataShield() {
  useEffect(() => {
    // Block print shortcuts
    const blockPrintKeys = (e: KeyboardEvent) => {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      if (isCtrlOrMeta && (e.key === "p" || e.key === "P" || e.key === "s" || e.key === "S")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Block right-click on data content (not on inputs/buttons)
    const blockContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a");
      if (!isInteractive) {
        e.preventDefault();
      }
    };

    // Blur content before print dialog opens
    const beforePrint = () => {
      document.body.classList.add("printing-blocked");
    };
    const afterPrint = () => {
      document.body.classList.remove("printing-blocked");
    };

    document.addEventListener("keydown", blockPrintKeys, true);
    document.addEventListener("contextmenu", blockContextMenu);
    window.addEventListener("beforeprint", beforePrint);
    window.addEventListener("afterprint", afterPrint);

    return () => {
      document.removeEventListener("keydown", blockPrintKeys, true);
      document.removeEventListener("contextmenu", blockContextMenu);
      window.removeEventListener("beforeprint", beforePrint);
      window.removeEventListener("afterprint", afterPrint);
    };
  }, []);

  return null;
}

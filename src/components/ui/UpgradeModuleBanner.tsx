"use client";

import { ArrowUpCircle } from "lucide-react";

export function UpgradeModuleBanner() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 mb-4 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400">
      <ArrowUpCircle className="h-3.5 w-3.5 shrink-0" />
      <span>Upgrade Module on Beta Mode for LEAP 99</span>
    </div>
  );
}

export function BetaPill() {
  return (
    <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium dark:bg-amber-900/50 dark:text-amber-400">
      Beta+
    </span>
  );
}

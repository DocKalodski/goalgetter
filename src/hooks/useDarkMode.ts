"use client";

import { useTheme } from "next-themes";

export function useDarkMode() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  function toggle() {
    setTheme(isDark ? "light" : "dark");
  }

  return { isDark, theme, setTheme, toggle };
}

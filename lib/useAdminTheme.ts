"use client";

import { useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "admin-theme";

/** Reads the current theme from the <html> class list — source of truth. */
function getHtmlTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/** Applies theme to <html> and persists to localStorage. */
function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // private-browsing mode — ignore
  }
}

export function useAdminTheme() {
  const [theme, setThemeState] = useState<Theme>("light");

  // Sync state from DOM on mount (the no-flash script may have already set it)
  useEffect(() => {
    setThemeState(getHtmlTheme());
  }, []);

  const setTheme = useCallback((next: Theme) => {
    applyTheme(next);
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return { theme, toggleTheme };
}

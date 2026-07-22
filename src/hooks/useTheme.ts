"use client";

import { useSyncExternalStore, useCallback, useEffect } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "turf-theme";
const THEME_COLOR: Record<Theme, string> = { dark: "#0a0a0a", light: "#f6f5f2" };

// localStorage is an external store, so this reads it via useSyncExternalStore
// rather than useState+useEffect — that keeps every consumer (and other tabs)
// in sync without ever calling a state setter from inside an effect.
let listeners: Array<() => void> = [];
function notify() {
  listeners.forEach((l) => l());
}
function subscribe(callback: () => void) {
  listeners.push(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
    window.removeEventListener("storage", callback);
  };
}
function getSnapshot(): Theme {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}
// Matches the default the blocking inline script in layout.tsx falls back to,
// so there's nothing for the server-rendered markup to mismatch against.
function getServerSnapshot(): Theme {
  return "dark";
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Pure DOM/meta synchronization, not a state update — legitimate effect use.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[theme]);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const next: Theme = getSnapshot() === "dark" ? "light" : "dark";
    window.localStorage.setItem(STORAGE_KEY, next);
    notify();
  }, []);

  return { theme, toggleTheme };
}

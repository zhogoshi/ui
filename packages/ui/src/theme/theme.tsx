"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "hogoshi:theme";

export type ColorMode = "light" | "dark" | "system";
export type ResolvedMode = "light" | "dark";

interface ThemeState {
  mode: ColorMode;
  resolved: ResolvedMode;
  setMode: (mode: ColorMode) => void;
}

const ThemeContext = createContext<ThemeState | null>(null);

function systemMode(): ResolvedMode {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readStored(): Record<string, unknown> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function readMode(): ColorMode {
  const mode = readStored().mode;
  return mode === "light" || mode === "dark" ? mode : "system";
}

function applyMode(next: ResolvedMode) {
  const root = document.documentElement;
  root.setAttribute("data-mode", next);
  root.style.colorScheme = next;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ColorMode | null>(null);
  const [resolved, setResolved] = useState<ResolvedMode>("light");

  useEffect(() => {
    setMode(readMode());
    setResolved(document.documentElement.getAttribute("data-mode") === "dark" ? "dark" : "light");
  }, []);

  useEffect(() => {
    if (!mode) return;
    const next = mode === "system" ? systemMode() : mode;
    setResolved(next);
    applyMode(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readStored(), mode }));
    if (mode !== "system") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      const value = systemMode();
      setResolved(value);
      applyMode(value);
    };
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode: mode ?? "system", resolved, setMode }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used within ThemeProvider");
  return value;
}

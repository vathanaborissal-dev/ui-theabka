"use client"

import * as React from "react"
import { createPersistedStore } from "@/lib/persisted-store"
import {
  APP_THEMES,
  DEFAULT_THEME,
  MODE_STORAGE_KEY,
  THEME_STORAGE_KEY,
  type AppThemeId,
  type ThemeMode,
} from "@/lib/themes"

const themeIds = new Set<string>(APP_THEMES.map((t) => t.id))
const modes = new Set<string>(["light", "dark", "system"])

const themeStore = createPersistedStore<AppThemeId>(THEME_STORAGE_KEY, DEFAULT_THEME, (v) =>
  themeIds.has(v)
)
const modeStore = createPersistedStore<ThemeMode>(MODE_STORAGE_KEY, "light", (v) => modes.has(v))

type ThemeContextValue = {
  theme: AppThemeId
  mode: ThemeMode
  resolvedMode: "light" | "dark"
  setTheme: (theme: AppThemeId) => void
  setMode: (mode: ThemeMode) => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

function prefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // The inline <head> script has already applied these to <html>, so there is
  // no flash. Reading them here keeps the React tree in agreement with the DOM.
  const theme = React.useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSnapshot,
    themeStore.getServerSnapshot
  )
  const mode = React.useSyncExternalStore(
    modeStore.subscribe,
    modeStore.getSnapshot,
    modeStore.getServerSnapshot
  )

  const resolvedMode = useResolvedMode(mode)

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])

  React.useEffect(() => {
    const dark = resolvedMode === "dark"
    document.documentElement.classList.toggle("dark", dark)
    document.documentElement.style.colorScheme = dark ? "dark" : "light"
  }, [resolvedMode])

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      mode,
      resolvedMode,
      setTheme: themeStore.set,
      setMode: modeStore.set,
    }),
    [theme, mode, resolvedMode]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/** Follows the OS setting while the mode is "system". */
function useResolvedMode(mode: ThemeMode): "light" | "dark" {
  const subscribe = React.useCallback((onChange: () => void) => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  const systemDark = React.useSyncExternalStore(
    subscribe,
    () => prefersDark(),
    () => false
  )

  if (mode === "system") return systemDark ? "dark" : "light"
  return mode
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>")
  return ctx
}

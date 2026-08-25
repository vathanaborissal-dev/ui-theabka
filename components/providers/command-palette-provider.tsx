"use client"

import * as React from "react"

type CommandPaletteContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}

const CommandPaletteContext = React.createContext<CommandPaletteContextValue | null>(null)

/**
 * Owns the palette's open state and the global ⌘K / Ctrl+K binding.
 *
 * Separate from the palette UI so that any component — the sidebar search
 * field, an empty state, a phone header — can open it without importing the
 * whole palette.
 */
export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey
      if (meta && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((previous) => !previous)
      }
      // "/" is the other search convention, but only when the caret is not
      // already inside a field.
      if (event.key === "/" && !meta) {
        const target = event.target as HTMLElement | null
        const typing =
          target?.tagName === "INPUT" ||
          target?.tagName === "TEXTAREA" ||
          target?.isContentEditable
        if (!typing) {
          event.preventDefault()
          setOpen(true)
        }
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const value = React.useMemo(
    () => ({ open, setOpen, toggle: () => setOpen((previous) => !previous) }),
    [open]
  )

  return (
    <CommandPaletteContext.Provider value={value}>{children}</CommandPaletteContext.Provider>
  )
}

export function useCommandPalette() {
  const ctx = React.useContext(CommandPaletteContext)
  if (!ctx) throw new Error("useCommandPalette must be used inside <CommandPaletteProvider>")
  return ctx
}

/** The platform-correct label for the shortcut. */
export function useShortcutLabel() {
  const isMac = React.useSyncExternalStore(
    () => () => {},
    () => navigator.platform.toLowerCase().includes("mac"),
    () => true
  )
  return isMac ? "⌘K" : "Ctrl K"
}

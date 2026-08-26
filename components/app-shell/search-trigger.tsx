"use client"

import { Search } from "lucide-react"
import { useCommandPalette, useShortcutLabel } from "@/components/providers/command-palette-provider"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useLocale } from "@/components/providers/locale-provider"
import { cn } from "@/lib/utils"

/**
 * The app's search affordance, in the top bar.
 *
 * Rendered as a field rather than a button because that is what people look
 * for, but it opens the palette instead of accepting text inline — one search
 * surface, reachable by click or by ⌘K.
 */
export function SearchTrigger({
  iconOnly = false,
  className,
}: {
  iconOnly?: boolean
  className?: string
}) {
  const { setOpen } = useCommandPalette()
  const { t } = useLocale()
  const shortcut = useShortcutLabel()

  if (iconOnly) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={t("cmd.open")}
              className={cn(
                "flex size-9 items-center justify-center rounded-[var(--btn-radius)] text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                className
              )}
            >
              <Search className="size-4" />
            </button>
          }
        />
        <TooltipContent side="bottom">
          {t("cmd.open")} <span className="ml-1 opacity-60">{shortcut}</span>
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cn(
        "flex h-9 items-center gap-2 rounded-[var(--btn-radius)] border border-border bg-muted/40 px-2.5 text-left text-sm text-muted-foreground",
        "transition-colors outline-none hover:border-foreground/20 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
    >
      <Search className="size-4 shrink-0" aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate">{t("cmd.open")}</span>
      <kbd className="shrink-0 rounded border border-border px-1.5 py-0.5 font-sans text-[0.6875rem] text-muted-foreground">
        {shortcut}
      </kbd>
    </button>
  )
}

"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { useLocale } from "@/components/providers/locale-provider"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { LoadMore as LoadMoreState } from "./use-load-more"

/**
 * Footer for a progressively-loaded list.
 *
 * A real button rather than bare infinite scroll: a list that only grows when
 * you scroll is unreachable by keyboard, hides whatever sits below it, and
 * gives no sense of how much is left. The sentinel above it loads the next
 * batch when it comes into view, so pointer users rarely need to press
 * anything — but the control is always there and always says what remains.
 */
export function LoadMoreBar<T>({
  state,
  className,
}: {
  state: LoadMoreState<T>
  className?: string
}) {
  const { t, locale } = useLocale()
  const { hasMore, remaining, total, shown, loadMore } = state
  const sentinel = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const node = sentinel.current
    if (!node || !hasMore) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore()
      },
      { rootMargin: "200px 0px" }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, loadMore])

  if (total === 0) return null

  return (
    <div className={cn("border-t border-border px-4 py-4 text-center", className)}>
      <div ref={sentinel} aria-hidden="true" />
      {hasMore ? (
        <Button variant="outline" size="sm" onClick={loadMore}>
          {t("pager.loadMore")}
          <span className="tnum ml-1 text-muted-foreground">
            {formatNumber(remaining, locale)}
          </span>
        </Button>
      ) : null}
      <p className="mt-2 text-xs text-muted-foreground" aria-live="polite">
        <span className="tnum">{formatNumber(shown, locale)}</span> {t("common.of")}{" "}
        <span className="tnum">{formatNumber(total, locale)}</span>
      </p>
    </div>
  )
}

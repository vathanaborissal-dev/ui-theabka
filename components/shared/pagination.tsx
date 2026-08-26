"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLocale } from "@/components/providers/locale-provider"
import { formatNumber } from "@/lib/format"
import { PAGE_SIZES, pageSizeStore } from "@/lib/ui-preferences"
import { cn } from "@/lib/utils"
import type { Pagination as PaginationState } from "./use-pagination"

/**
 * Footer controls for a paginated list.
 *
 * The row-count select writes to the shared preference, so picking 50 here
 * changes every other table in the app as well. Hidden entirely when the whole
 * list already fits on one page at the smallest offered size — controls that
 * can only ever say "1 of 1" are noise.
 */
export function Pagination<T>({
  state,
  className,
}: {
  state: PaginationState<T>
  className?: string
}) {
  const { t, locale } = useLocale()
  const { page, pageCount, pageSize, total, from, to, setPage } = state

  // Nothing to page through: a control that can only ever read "1 / 1" is noise.
  if (pageCount === 1) return null

  return (
    <nav
      aria-label={t("pager.label")}
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3",
        className
      )}
    >
      <p className="text-xs text-muted-foreground" aria-live="polite">
        <span className="tnum">
          {formatNumber(from, locale)}–{formatNumber(to, locale)}
        </span>{" "}
        {t("common.of")} <span className="tnum">{formatNumber(total, locale)}</span>
      </p>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">{t("pager.rows")}</span>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              if (!value) return
              pageSizeStore.set(value as `${(typeof PAGE_SIZES)[number]}`)
              // A bigger page can strand the viewer mid-list; go back to the top.
              setPage(1)
            }}
            items={PAGE_SIZES.map((size) => ({ value: `${size}`, label: `${size}` }))}
          >
            <SelectTrigger size="sm" aria-label={t("pager.rows")} className="w-[4.5rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} side="top" align="end">
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {formatNumber(size, locale)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            aria-label={t("pager.previous")}
          >
            <ChevronLeft />
          </Button>
          <p className="tnum px-1.5 text-xs text-muted-foreground">
            {formatNumber(page, locale)} / {formatNumber(pageCount, locale)}
          </p>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setPage(page + 1)}
            disabled={page >= pageCount}
            aria-label={t("pager.next")}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </nav>
  )
}

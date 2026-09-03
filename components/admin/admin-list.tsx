"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { MascotMotion } from "@/components/brand/mascot"
import { useLocale } from "@/components/providers/locale-provider"
import { formatNumber } from "@/lib/format"
import type { PageMeta, Paged } from "@/lib/api-client"
import { DataTableSkeleton } from "@/components/shared/data-list-skeleton"

export type AdminListState<T> = {
  items: T[]
  meta: PageMeta | null
  query: string
  setQuery: (value: string) => void
  page: number
  setPage: (page: number) => void
  status: "loading" | "ready" | "failed"
  /** A request is in flight for a key other than the one on screen. */
  busy: boolean
  reload: () => void
  replace: (row: T, match: (row: T) => boolean) => void
}

/**
 * A searched, server-paged list.
 *
 * Paging happens on the server rather than by slicing a full download the way
 * the planner's tables do: those hold one wedding's guests, this holds every
 * account on the platform, and the difference only shows up once the platform
 * is worth having.
 */
export function useAdminList<T>(
  fetcher: (query: string, page: number) => Promise<Paged<T>>,
  /** Seeds the search box — the admin search palette deep-links here with one. */
  initialQuery = ""
): AdminListState<T> {
  const [query, setQuery] = React.useState(initialQuery)
  const [applied, setApplied] = React.useState(initialQuery)
  const [page, setPage] = React.useState(0)
  const [items, setItems] = React.useState<T[]>([])
  const [meta, setMeta] = React.useState<PageMeta | null>(null)
  const [status, setStatus] = React.useState<"loading" | "ready" | "failed">("loading")
  const [attempt, setAttempt] = React.useState(0)

  // Typing should not fire a request per keystroke; the delay is deliberately
  // short enough that the list still feels attached to the box.
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setApplied(query)
      setPage(0)
    }, 250)
    return () => clearTimeout(timer)
  }, [query])

  const key = `${applied}|${page}|${attempt}`
  const [loadedKey, setLoadedKey] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        const result = await fetcher(applied, page)
        if (cancelled) return
        setItems(result.items)
        setMeta(result.meta)
        setStatus("ready")
      } catch {
        if (!cancelled) setStatus("failed")
      } finally {
        if (!cancelled) setLoadedKey(key)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [applied, page, fetcher, key])

  return {
    items,
    meta,
    query,
    setQuery,
    page,
    setPage,
    status,
    busy: loadedKey !== key,
    reload: () => setAttempt((n) => n + 1),
    replace: (row, match) =>
      setItems((current) => current.map((existing) => (match(existing) ? row : existing))),
  }
}

/**
 * The table itself. Rows stay on screen while the next page loads — a list
 * that blanks between pages makes a fast connection feel like a broken one.
 */
export function AdminList<T>({
  state,
  columns,
  row,
  keyOf,
  empty,
}: {
  state: AdminListState<T>
  columns: string[]
  row: (item: T) => React.ReactNode
  keyOf: (item: T) => string
  empty: string
}) {
  const { locale, t } = useLocale()
  const { items, meta, status, busy } = state

  if (status === "loading") {
    return (
      <div
        className="overflow-hidden rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card shadow-(--shadow-card)"
        role="status"
        aria-label={t("admin.loadingList")}
      >
        <DataTableSkeleton
          columns={columns.map((_, index) => ({
            width: index === 0 ? "34%" : undefined,
            secondary: index === 0,
            align: index === columns.length - 1 ? "right" : "left",
          }))}
          rows={6}
          minWidth="36rem"
        />
      </div>
    )
  }

  if (status === "failed") {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card text-center">
        <MascotMotion motion="thinking" size={72} />
        <p className="text-sm text-muted-foreground">{t("admin.listFailed")}</p>
        <Button variant="outline" size="sm" onClick={state.reload}>
          {t("action.tryAgain")}
        </Button>
      </div>
    )
  }

  const from = meta && meta.totalElements > 0 ? meta.page * meta.size + 1 : 0
  const to = meta ? Math.min(from + items.length - 1, meta.totalElements) : 0

  return (
    <div className="overflow-hidden rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card shadow-(--shadow-card)">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] text-left">
          <thead>
            <tr className="border-b border-border/70">
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-3 py-2.5 text-xs font-medium text-muted-foreground first:pl-5 last:pr-5"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody
            aria-busy={busy}
            className="divide-y divide-border/60 transition-opacity data-[stale=true]:opacity-60"
            data-stale={busy}
          >
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-12 text-center text-sm text-muted-foreground"
                >
                  {empty}
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={keyOf(item)} className="[&>td:first-child]:pl-5 [&>td:last-child]:pr-5">
                  {row(item)}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 ? (
        <nav
          aria-label={t("admin.pages")}
          className="flex items-center justify-between gap-3 border-t border-border px-4 py-3"
        >
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {t("admin.rangeOf")
              .replace("%s", formatNumber(from, locale))
              .replace("%s", formatNumber(to, locale))
              .replace("%s", formatNumber(meta.totalElements, locale))}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label={t("admin.previousPage")}
              disabled={meta.page === 0 || busy}
              onClick={() => state.setPage(meta.page - 1)}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label={t("admin.nextPage")}
              disabled={!meta.hasMore || busy}
              onClick={() => state.setPage(meta.page + 1)}
            >
              <ChevronRight />
            </Button>
          </div>
        </nav>
      ) : null}
    </div>
  )
}

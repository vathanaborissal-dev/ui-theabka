"use client"

import * as React from "react"
import { pageSizeStore, type PageSize } from "@/lib/ui-preferences"

/** The shared row count, as a number. */
export function usePageSize(): PageSize {
  const raw = React.useSyncExternalStore(
    pageSizeStore.subscribe,
    pageSizeStore.getSnapshot,
    pageSizeStore.getServerSnapshot
  )
  return Number(raw) as PageSize
}

export type Pagination<T> = {
  /** Just the rows for the current page. */
  items: T[]
  page: number
  pageCount: number
  pageSize: PageSize
  total: number
  /** 1-based index of the first row shown, for "x–y of z". */
  from: number
  to: number
  setPage: (page: number) => void
}

/**
 * Slices a list into pages against the shared page-size preference.
 *
 * Page is kept here rather than in the URL because these lists sit behind
 * filters that already reset it: changing a filter shortens the list, and
 * staying on page 7 of a now 2-page list would show nothing. The effect below
 * pulls the page back in range whenever that happens.
 */
export function usePagination<T>(all: T[]): Pagination<T> {
  const pageSize = usePageSize()
  const [page, setPage] = React.useState(1)

  const total = all.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  // A shorter list (or a bigger page size) can strand the viewer past the end.
  // Clamped while rendering rather than corrected in an effect, which would
  // cost an extra render and briefly paint an empty page.
  const safePage = Math.min(page, pageCount)
  const start = (safePage - 1) * pageSize

  return {
    items: all.slice(start, start + pageSize),
    page: safePage,
    pageCount,
    pageSize,
    total,
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + pageSize, total),
    setPage: (next: number) => setPage(Math.min(Math.max(1, next), pageCount)),
  }
}

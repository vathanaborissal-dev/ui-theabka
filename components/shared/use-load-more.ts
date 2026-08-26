"use client"

import * as React from "react"
import { usePageSize } from "./use-pagination"

export type LoadMore<T> = {
  items: T[]
  total: number
  shown: number
  remaining: number
  hasMore: boolean
  loadMore: () => void
}

/**
 * Progressive disclosure for lists that are browsed rather than tabulated.
 *
 * Uses the same shared row-count preference as the pager, so "20" means the
 * same thing whether a screen pages or grows. `resetKey` is whatever narrows
 * the list — a search string, usually — so typing starts again from the top
 * instead of leaving the reader deep in a list that no longer exists.
 */
export function useLoadMore<T>(all: T[], resetKey: string = ""): LoadMore<T> {
  const batch = usePageSize()
  const [shown, setShown] = React.useState<number>(batch)

  // Adjusting during render rather than in an effect: an effect would paint
  // the stale window first and then correct it.
  const [prevKey, setPrevKey] = React.useState(resetKey)
  const [prevBatch, setPrevBatch] = React.useState<number>(batch)
  if (resetKey !== prevKey || batch !== prevBatch) {
    setPrevKey(resetKey)
    setPrevBatch(batch)
    setShown(batch)
  }

  const total = all.length
  const capped = Math.min(shown, total)

  return {
    items: all.slice(0, capped),
    total,
    shown: capped,
    remaining: Math.max(0, total - capped),
    hasMore: capped < total,
    loadMore: () => setShown((n) => n + batch),
  }
}

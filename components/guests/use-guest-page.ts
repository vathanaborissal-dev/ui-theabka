"use client"

import * as React from "react"
import { listGuests, type GuestQuery } from "@/lib/guests"
import type { PageMeta } from "@/lib/api-client"
import type { Guest } from "@/lib/types"
import type { PageSize } from "@/lib/ui-preferences"
import { usePageSize, type Pagination } from "@/components/shared/use-pagination"
import type { GuestFilters, SortKey } from "./use-guest-filters"
import { emptyFilters } from "./use-guest-filters"

/**
 * One page of the guest list, filtered and sorted by the database.
 *
 * The table used to hold every guest and filter in the browser. That reads the
 * whole list on every visit, and a search then only ever matched the rows
 * already downloaded — with paging that silently misses everyone off screen.
 * Both problems are the same problem, and both are fixed by asking the server.
 */

const EMPTY_META: PageMeta = {
  page: 0,
  size: 0,
  totalElements: 0,
  totalPages: 0,
  hasMore: false,
}

/** The table's sort keys, mapped to the columns the API will sort on. */
const SORT_PARAM: Record<SortKey, string | undefined> = {
  name: "name,asc",
  seats: "partySize,desc",
  recent: "respondedAt,desc",
  // No gift column to sort on server-side yet; left to insertion order rather
  // than sorting one page of results and calling it a ranking.
  gift: undefined,
}

function toQuery(filters: GuestFilters, sort: SortKey): GuestQuery {
  return {
    search: filters.query.trim() || undefined,
    rsvp: filters.rsvp === "all" ? undefined : filters.rsvp,
    side: filters.side === "all" ? undefined : filters.side,
    sort: SORT_PARAM[sort],
  }
}

export function useGuestPage(
  eventId: string | undefined,
  initial?: Partial<GuestFilters>
) {
  const [filters, setFilters] = React.useState<GuestFilters>({
    ...emptyFilters,
    ...initial,
  })
  const [sort, setSort] = React.useState<SortKey>("name")
  const [page, setPage] = React.useState(0)
  // The shared preference, so changing rows-per-page on any table changes it
  // here too.
  const size: PageSize = usePageSize()
  const [reloadToken, setReloadToken] = React.useState(0)

  /**
   * The last response, tagged with the request it answered.
   *
   * Loading is derived by comparing that tag with the request the current
   * render wants, rather than flipping a flag at the top of an effect. It
   * cannot drift out of step with the data, and it avoids a render pass whose
   * only job is to say "now loading".
   */
  const [result, setResult] = React.useState<{
    key: string
    guests: Guest[]
    meta: PageMeta
    error?: string
  } | null>(null)

  // Typing a search re-runs the query; without a pause that is a request per
  // keystroke. Filter and sort changes apply immediately — they come from a
  // click, and a delay there just feels broken.
  const search = filters.query
  const [debouncedSearch, setDebouncedSearch] = React.useState(search)
  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300)
    return () => window.clearTimeout(timer)
  }, [search])

  const effective = React.useMemo(
    () => toQuery({ ...filters, query: debouncedSearch }, sort),
    [filters, debouncedSearch, sort]
  )
  const queryKey = JSON.stringify(effective)

  // Narrowing the filters can leave you past the end of the shorter result.
  // Adjusted during render rather than in an effect, so the request below is
  // never fired for a page that is about to be discarded.
  const [lastQueryKey, setLastQueryKey] = React.useState(queryKey)
  const [lastSize, setLastSize] = React.useState(size)
  if (lastQueryKey !== queryKey || lastSize !== size) {
    setLastQueryKey(queryKey)
    setLastSize(size)
    setPage(0)
  }

  const requestKey = `${eventId ?? ""}|${queryKey}|${page}|${size}|${reloadToken}`

  React.useEffect(() => {
    if (!eventId) return
    let cancelled = false

    listGuests(eventId, { ...effective, page, size })
      .then((response) => {
        if (!cancelled) {
          setResult({ key: requestKey, guests: response.items, meta: response.meta })
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResult({
            key: requestKey,
            guests: [],
            meta: EMPTY_META,
            error: "Could not load the guest list. Please try again.",
          })
        }
      })

    return () => {
      cancelled = true
    }
    // `effective` is captured by requestKey; listing it too would refetch on
    // every render that rebuilt an identical object.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey])

  const settled = result?.key === requestKey
  const guests = settled ? result.guests : []
  const meta = settled ? result.meta : EMPTY_META
  const error = settled ? result.error : undefined
  const loading = !settled

  /**
   * Every guest matching the current filters, walked page by page.
   *
   * Export must cover the whole filtered set, not the page on screen —
   * downloading "guests.csv" and getting twenty of eight hundred rows is a
   * silent, expensive mistake to discover later.
   */
  const fetchAllMatching = React.useCallback(async () => {
    if (!eventId) return [] as Guest[]
    const all: Guest[] = []
    for (let next = 0; ; next++) {
      const result = await listGuests(eventId, { ...effective, page: next, size: 200 })
      all.push(...result.items)
      if (!result.meta.hasMore) return all
    }
  }, [eventId, effective])

  /** After an edit, so the row reflects what was saved. */
  const reload = React.useCallback(() => setReloadToken((n) => n + 1), [])

  const isFiltered =
    filters.query.trim() !== "" ||
    filters.rsvp !== "all" ||
    filters.side !== "all" ||
    filters.family !== "all" ||
    filters.onlyWithGift

  const reset = React.useCallback(() => setFilters(emptyFilters), [])

  /**
   * Shaped like the client-side pager's state so the existing `<Pagination>`
   * renders unchanged. The counts come from the server, and `page` is
   * converted to the 1-based index that component speaks.
   */
  const pager: Pagination<Guest> = {
    items: guests,
    page: meta.page + 1,
    pageCount: Math.max(1, meta.totalPages),
    pageSize: size,
    total: meta.totalElements,
    from: meta.totalElements === 0 ? 0 : meta.page * meta.size + 1,
    to: Math.min((meta.page + 1) * meta.size, meta.totalElements),
    setPage: (next: number) => setPage(Math.max(0, next - 1)),
  }

  return {
    pager,
    fetchAllMatching,
    guests,
    meta,
    loading,
    error,
    filters,
    setFilters,
    sort,
    setSort,
    page,
    setPage,
    size,
    isFiltered,
    reset,
    reload,
  }
}

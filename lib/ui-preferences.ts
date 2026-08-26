import { createPersistedStore } from "@/lib/persisted-store"

/** Sidebar collapsed state, remembered between visits. */
export const sidebarStore = createPersistedStore<"expanded" | "collapsed">(
  "theabka.sidebar",
  "expanded",
  (value) => value === "expanded" || value === "collapsed"
)

/** Page sizes offered wherever a long list is paginated. */
export const PAGE_SIZES = [10, 20, 50, 100] as const
export type PageSize = (typeof PAGE_SIZES)[number]

const DEFAULT_PAGE_SIZE: PageSize = 20

/**
 * How many rows every paginated table shows.
 *
 * Deliberately one shared preference rather than per-table state: someone who
 * sets 50 on the guest list means "show me more rows", not "show me more rows
 * here only". Backed by the same external store as the sidebar, so changing it
 * on one screen re-renders every other mounted table immediately — and, via
 * the storage event, other tabs too.
 */
export const pageSizeStore = createPersistedStore<`${PageSize}`>(
  "theabka.pageSize",
  `${DEFAULT_PAGE_SIZE}`,
  (value) => PAGE_SIZES.some((size) => `${size}` === value)
)

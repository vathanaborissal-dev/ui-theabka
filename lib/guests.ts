import { api, apiPaged, apiRequest, type Paged } from "@/lib/api-client"
import type { Currency, Guest, RsvpStatus } from "@/lib/types"

/* ---------------------------------------------------------------- planner */

type GuestPatch = Partial<Omit<Guest, "id" | "eventId" | "token">>

/**
 * Filtering, sorting and paging, all server-side.
 *
 * Client-side filtering can only ever filter what has already been downloaded,
 * so searching a paged list would silently miss everyone not on screen. These
 * go to the database instead.
 */
export type GuestQuery = {
  page?: number
  size?: number
  search?: string
  rsvp?: RsvpStatus
  side?: Guest["side"]
  attendance?: Guest["attendance"]
  /** e.g. `name,asc`. Unknown columns fall back to insertion order. */
  sort?: string
}

function toQueryString(query: GuestQuery) {
  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    // Empty means "no filter", and sending it would narrow nothing while
    // making every cache key unique.
    if (value === undefined || value === null || value === "") return
    params.set(key, String(value))
  })
  const search = params.toString()
  return search ? `?${search}` : ""
}

/**
 * One page of the guest list, with its position.
 *
 * The same call serves both presentations: a numbered pager replaces `items`
 * on each page change, an infinite list appends them and stops when
 * `meta.hasMore` is false. Nothing here decides which.
 */
export function listGuests(eventId: string, query: GuestQuery = {}): Promise<Paged<Guest>> {
  return apiPaged<Guest>(`/api/events/${eventId}/guests${toQueryString(query)}`, {
    method: "GET",
  })
}

/**
 * Every guest, walked page by page.
 *
 * For the places that genuinely need the whole list — the check-in screen
 * working offline at the door, a CSV export — rather than for rendering a
 * table, which should page.
 */
export async function listAllGuests(eventId: string, pageSize = 200) {
  const all: Guest[] = []
  for (let page = 0; ; page++) {
    const { items, meta } = await listGuests(eventId, { page, size: pageSize })
    all.push(...items)
    if (!meta.hasMore) return all
  }
}

export type GiftTotal = { currency: Currency; count: number; amount: number }

export type GuestSummary = {
  invited: number
  confirmed: number
  declined: number
  pending: number
  maybe: number
  /** Seats to cater for: confirmed where known, offered where still silent. */
  expectedSeats: number
  /** What has been given, per currency — never a combined figure. */
  gifts: GiftTotal[]
  /** Seats offered across every invitation, answered or not. */
  invitedSeats: number
  /** The groom's and bride's sides, side by side. */
  bySide: SideTotal[]
}

export type SideTotal = {
  side: Guest["side"]
  invitations: number
  seats: number
  confirmed: number
}

/** One day of replies: how many arrived, and the running total. */
export type ResponseTrendPoint = { date: string; replies: number; total: number }

/**
 * Replies per day, bucketed by the database.
 *
 * A trend line needs a date and a number, not eight hundred guest rows for the
 * browser to group itself.
 */
export function guestResponseTrend(eventId: string, timezone: string) {
  return api.get<ResponseTrendPoint[]>(
    `/api/events/${eventId}/guests/response-trend?timezone=${encodeURIComponent(timezone)}`
  )
}

export function guestSummary(eventId: string) {
  return api.get<GuestSummary>(`/api/events/${eventId}/guests/summary`)
}

export function addGuest(eventId: string, guest: GuestPatch & { name: string }) {
  return api.post<Guest>(`/api/events/${eventId}/guests`, guest)
}

export function updateGuest(eventId: string, guestId: string, patch: GuestPatch) {
  return api.patch<Guest>(`/api/events/${eventId}/guests/${guestId}`, patch)
}

/** One change across a selection, as one request, so it lands or it does not. */
export function updateGuests(eventId: string, guestIds: string[], patch: GuestPatch) {
  return api.patch<Guest[]>(`/api/events/${eventId}/guests`, { guestIds, patch })
}

export function removeGuests(eventId: string, guestIds: string[]) {
  return apiRequest<{ removed: number }>(`/api/events/${eventId}/guests`, {
    method: "DELETE",
    body: { guestIds },
  })
}

export type ImportableGuest = {
  name: string
  nameKm?: string
  phone?: string
  family?: string
  side?: Guest["side"]
  relationship?: string
  partySize?: number
  table?: string
  notes?: string
}

/**
 * Bulk import. `skipDuplicates` defaults on server-side: re-pasting a corrected
 * list is the normal case, and silently doubling a 400-person list is painful
 * to undo by hand.
 */
export function importGuests(
  eventId: string,
  guests: ImportableGuest[],
  skipDuplicates = true
) {
  return api.post<Guest[]>(`/api/events/${eventId}/guests/import`, {
    guests,
    skipDuplicates,
  })
}

/** The guest's own invitation link, for sharing one-to-one. */
export function guestInviteUrl(slug: string, token: string, origin?: string) {
  const base = origin ?? (typeof window === "undefined" ? "" : window.location.origin)
  return `${base}/i/${slug}?g=${encodeURIComponent(token)}`
}

/* ----------------------------------------------------------------- public */

/** What the invitation page is allowed to know about the link's holder. */
export type InvitedGuest = {
  name: string
  nameKm?: string
  partySize: number
  rsvp: RsvpStatus
  partyConfirmed?: number
  replied: boolean
}

/**
 * Resolves a `?g=` token to the guest it belongs to.
 *
 * Returns null for an unknown token rather than throwing: a forwarded link
 * should quietly fall back to the open form, not show an error to someone who
 * did nothing wrong.
 */
export async function fetchInvitedGuest(slug: string, token: string) {
  try {
    return await apiRequest<InvitedGuest | null>(
      `/api/public/invitations/${encodeURIComponent(slug)}/guest?g=${encodeURIComponent(token)}`,
      { method: "GET", skipAuthRetry: true }
    )
  } catch {
    return null
  }
}

export type RsvpInput = {
  token?: string
  name?: string
  phone?: string
  attending: boolean
  seats?: number
  message?: string
}

export function submitRsvp(slug: string, input: RsvpInput) {
  // skipAuthRetry: a guest has no session, and a 401 here must not send the
  // page chasing a refresh it can never complete.
  return apiRequest<{ name: string; rsvp: RsvpStatus; seats?: number }>(
    `/api/public/invitations/${encodeURIComponent(slug)}/rsvp`,
    { method: "POST", body: input, skipAuthRetry: true }
  )
}

/**
 * A message a guest left with their reply, shown on the invitation's wishes
 * wall. Deliberately three fields: the wall is public, so nothing else a guest
 * told the couple travels with it.
 */
export type Wish = {
  name: string
  message: string
  respondedAt?: string
}

export function fetchWishes(slug: string, limit = 30) {
  return apiRequest<Wish[]>(
    `/api/public/invitations/${encodeURIComponent(slug)}/wishes?limit=${limit}`,
    { method: "GET", skipAuthRetry: true }
  )
}

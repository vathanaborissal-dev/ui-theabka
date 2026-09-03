import { api, apiPaged, type Paged } from "@/lib/api-client"

/**
 * The platform's own numbers, for whoever runs it.
 *
 * Everything here crosses account boundaries, so the endpoint behind it is
 * refused to anyone without the admin role — the shape below is only ever
 * filled in for an operator.
 */
export type AdminEventType =
  | "wedding"
  | "engagement"
  | "birthday"
  | "funeral"
  | "housewarming"
  | "graduation"
  | "baby"
  | "anniversary"
  | "corporate"
  | "other"

export type AdminOverview = {
  accounts: { total: number; newThisWeek: number; newThisMonth: number; withEvents: number }
  events: { total: number; published: number; draft: number; upcoming: number; past: number }
  guests: { total: number; replied: number; attending: number }
  cameras: { eventsUsing: number; rolls: number; photos: number; bytes: number }
  /** New accounts per day, last 30 days, oldest first — every day present, even at zero. */
  signupTrend: { date: string; count: number }[]
  /** New events per day, same window. */
  eventTrend: { date: string; count: number }[]
  guestFunnel: { pending: number; confirmed: number; declined: number; maybe: number }
  /** What kind of events people make, heaviest first. */
  eventTypes: { type: AdminEventType; count: number }[]
  recentAccounts: { email: string; displayName: string; events: number; createdAt: string }[]
  recentActivity: AdminActivity[]
  upcoming: {
    id: string
    title: string
    slug: string
    ownerEmail: string
    date: string
    published: boolean
    guests: number
  }[]
}

/* ------------------------------------------------------------- activity */

export type AdminActivityAction =
  | "account_role_changed"
  | "account_access_changed"

export type AdminActivity = {
  id: string
  action: AdminActivityAction
  actorEmail: string
  targetUserId: string
  targetEmail: string
  previousValue: string
  newValue: string
  createdAt: string
}

export function getAdminActivity(params: {
  query?: string
  page?: number
  size?: number
}): Promise<Paged<AdminActivity>> {
  return apiPaged<AdminActivity>(`/api/admin/activity?${search(params)}`)
}

export function getAdminOverview(): Promise<AdminOverview> {
  return api.get<AdminOverview>("/api/admin/overview")
}

/** Bytes as a person reads them. Storage is the number that becomes a bill. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ["KB", "MB", "GB", "TB"]
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`
}

/* ------------------------------------------------------------- accounts */

export type AdminRole = "PLANNER" | "ADMIN"

export type AdminAccount = {
  id: string
  email: string
  displayName: string
  role: AdminRole
  enabled: boolean
  events: number
  createdAt: string
}

export function getAdminAccounts(params: {
  query?: string
  page?: number
  size?: number
}): Promise<Paged<AdminAccount>> {
  return apiPaged<AdminAccount>(`/api/admin/accounts?${search(params)}`)
}

/**
 * Grants or withdraws the admin role, or suspends an account.
 *
 * Both fields are optional on the wire, so the role select and the suspend
 * switch each send only what they changed — neither has to restate the other's
 * value and risk overwriting a change made in another tab.
 */
export function updateAdminAccount(
  id: string,
  patch: { role?: AdminRole; enabled?: boolean }
): Promise<AdminAccount> {
  return api.patch<AdminAccount>(`/api/admin/accounts/${id}`, patch)
}

/* --------------------------------------------------------------- events */

export type AdminEventRow = {
  id: string
  title: string
  slug: string
  ownerEmail: string
  ownerName: string
  /** Lower-cased on the wire, like every other status in this API. */
  status: "draft" | "published"
  date: string
  createdAt: string
  guests: number
  confirmed: number
  camera: boolean
}

export function getAdminEvents(params: {
  query?: string
  status?: string
  page?: number
  size?: number
}): Promise<Paged<AdminEventRow>> {
  return apiPaged<AdminEventRow>(`/api/admin/events?${search(params)}`)
}

/* -------------------------------------------------------------- cameras */

export type AdminCameraRow = {
  eventId: string
  title: string
  slug: string
  ownerEmail: string
  eventDate: string
  revealAt: string | null
  enabled: boolean
  rolls: number
  photos: number
  bytes: number
}

export function getAdminCameras(size = 25): Promise<AdminCameraRow[]> {
  return api.get<AdminCameraRow[]>(`/api/admin/cameras?size=${size}`)
}

/** Query string without the empty keys, so `?query=&status=` never appears. */
function search(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value))
  }
  return query.toString()
}

/**
 * The single door to the API.
 *
 * Two rules hold everything together:
 *
 *  1. The access token lives in memory only. Pairing an httpOnly refresh cookie
 *     with an access token in localStorage would throw away most of what the
 *     cookie buys — script could still read the thing that opens the API.
 *  2. Every request sends credentials, because the refresh cookie is httpOnly
 *     and travels no other way.
 */

/**
 * Where the API is, which is not the same answer on both sides.
 *
 * In the browser: nowhere. Requests go to this app's own origin as `/api/...`
 * and a Next rewrite forwards them to Spring. That way a phone on the LAN, a
 * tunnel, or an HTTPS dev server all work with nothing configured — the API is
 * wherever the page came from — and the session cookie is same-origin rather
 * than cross-site.
 *
 * On the server there is no origin to be relative to, so it dials the API
 * directly. `NEXT_PUBLIC_API_URL` still overrides it, for a deployment that
 * genuinely serves the two from different hosts.
 */
const BASE_URL =
  typeof window === "undefined" ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080") : ""

/**
 * Where a page sits in the whole result.
 *
 * Carries both the total and `hasMore` because the caller chooses the
 * presentation: a numbered pager needs the total to draw "page 3 of 17", an
 * infinite list only asks whether to fetch again.
 */
export type PageMeta = {
  page: number
  size: number
  totalElements: number
  totalPages: number
  hasMore: boolean
}

export type Paged<T> = { items: T[]; meta: PageMeta }

/** The envelope every endpoint answers with. */
export type ApiEnvelope<T> = {
  success: boolean
  message: string
  data?: T
  code?: string
  errors?: Record<string, string>
  /** Present only on paged endpoints. */
  meta?: PageMeta
  timestamp: string
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fieldErrors?: Record<string, string>
  ) {
    super(message)
    this.name = "ApiError"
  }
}

/* --------------------------------------------------------------- access token */

let accessToken: string | null = null
const listeners = new Set<(token: string | null) => void>()

export function setAccessToken(token: string | null) {
  accessToken = token
  listeners.forEach((listener) => listener(token))
}

export function getAccessToken() {
  return accessToken
}

/** Lets React mirror the in-memory token without owning it. */
export function onAccessTokenChange(listener: (token: string | null) => void) {
  listeners.add(listener)
  // Returns void, not Set.delete's boolean: React effect cleanups must not
  // return a value.
  return () => {
    listeners.delete(listener)
  }
}

/* -------------------------------------------------------------------- refresh */

/**
 * What a refresh hands back. The server returns the account alongside the new
 * token, so a caller restoring a session needs nothing further — no follow-up
 * /me round trip.
 */
export type RefreshedSession = { accessToken: string; user: unknown }

/**
 * The in-flight refresh, shared by every caller that needs one.
 *
 * This single promise is not an optimisation — it is required. The server
 * rotates refresh tokens and treats a re-used one as theft, revoking the whole
 * chain. If three requests each hit 401 and each fired its own refresh, the
 * first would succeed and the other two would present the token it just
 * retired, and the user would be signed out for doing nothing wrong.
 */
let refreshInFlight: Promise<RefreshedSession | null> | null = null

async function refreshSession(): Promise<RefreshedSession | null> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        // Single-flight only covers this tab. Another tab sharing the cookie
        // can rotate it first, in which case our token is already retired and
        // the cookie jar now holds the winner's. One retry re-sends that new
        // cookie; the server's reuse grace window keeps the chain alive long
        // enough for it to land.
        for (let attempt = 0; attempt < 2; attempt++) {
          const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
            method: "POST",
            credentials: "include",
          })
          if (response.ok) {
            const envelope = (await response.json()) as ApiEnvelope<{
              accessToken: string
              user: unknown
            }>
            const token = envelope.data?.accessToken
            if (!token) return null
            // Published here rather than by each caller, so every path that
            // refreshes leaves the in-memory token in the same state.
            setAccessToken(token)
            return { accessToken: token, user: envelope.data?.user }
          }
          if (response.status !== 401) return null
        }
        return null
      } catch {
        // Network failure is not an auth failure; the caller surfaces it.
        return null
      } finally {
        // Cleared in `finally` so a failed refresh cannot wedge every later
        // request behind a permanently rejected promise.
        refreshInFlight = null
      }
    })()
  }
  return refreshInFlight
}

/* -------------------------------------------------------------------- request */

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown
  /** Set for the auth endpoints themselves, which must not recurse. */
  skipAuthRetry?: boolean
}

async function send(path: string, options: RequestOptions, token: string | null) {
  const headers = new Headers(options.headers)
  headers.set("Accept", "application/json")
  if (options.body !== undefined) headers.set("Content-Type", "application/json")
  if (token) headers.set("Authorization", `Bearer ${token}`)

  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    // Without this the refresh cookie is neither sent nor stored.
    credentials: "include",
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response = await send(path, options, accessToken)

  // A 401 usually just means the 15-minute access token aged out. Refresh once
  // and replay; if that fails the session is genuinely over.
  if (response.status === 401 && !options.skipAuthRetry) {
    const renewed = await refreshSession()
    if (renewed) {
      response = await send(path, options, renewed.accessToken)
    } else {
      setAccessToken(null)
    }
  }

  // 204 and friends carry no body to parse.
  const text = await response.text()
  const envelope: ApiEnvelope<T> | null = text ? JSON.parse(text) : null

  if (!response.ok || !envelope?.success) {
    throw new ApiError(
      response.status,
      envelope?.code ?? "network_error",
      envelope?.message ?? "Could not reach the server",
      envelope?.errors
    )
  }

  return envelope.data as T
}

/**
 * A paged request, returning the rows together with their position.
 *
 * Separate from `apiRequest` rather than widening its return type, so the
 * hundred unpaged callers keep getting a plain payload.
 */
export async function apiPaged<T>(
  path: string,
  options: RequestOptions = {}
): Promise<Paged<T>> {
  let response = await send(path, options, accessToken)

  if (response.status === 401 && !options.skipAuthRetry) {
    const renewed = await refreshSession()
    if (renewed) {
      response = await send(path, options, renewed.accessToken)
    } else {
      setAccessToken(null)
    }
  }

  const text = await response.text()
  const envelope: ApiEnvelope<T[]> | null = text ? JSON.parse(text) : null

  if (!response.ok || !envelope?.success) {
    throw new ApiError(
      response.status,
      envelope?.code ?? "network_error",
      envelope?.message ?? "Could not reach the server",
      envelope?.errors
    )
  }

  const items = envelope.data ?? []
  return {
    items,
    // An endpoint that forgot its metadata still yields something usable
    // rather than crashing whatever is rendering the pager.
    meta: envelope.meta ?? {
      page: 0,
      size: items.length,
      totalElements: items.length,
      totalPages: 1,
      hasMore: false,
    },
  }
}

export const api = {
  get: <T>(path: string, options: RequestOptions = {}) =>
    apiRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
    apiRequest<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
    apiRequest<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
    apiRequest<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options: RequestOptions = {}) =>
    apiRequest<T>(path, { ...options, method: "DELETE" }),
}

export { refreshSession }

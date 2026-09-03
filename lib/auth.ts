/**
 * Account actions, wired to the Spring API.
 *
 * The refresh token is never touched here — it lives in an httpOnly cookie the
 * browser sends on its own, and script cannot read it by design. This module
 * only ever handles the short-lived access token, and only in memory.
 *
 * Passwords are passed straight to the API and never logged or persisted.
 */
import { api, ApiError, apiRequest, refreshSession, setAccessToken } from "@/lib/api-client"

export type AuthUser = {
  id: string
  email: string
  name: string
  role: string
}

type AuthPayload = {
  accessToken: string
  tokenType: string
  expiresIn: number
  user: AuthUser
}

export type AuthResult =
  | { ok: true; user: AuthUser }
  | { ok: false; message: string; fieldErrors?: Record<string, string> }

/**
 * For the flows that succeed without signing anyone in — asking for a reset
 * link, and spending one. Kept separate rather than making `user` nullable on
 * AuthResult, so sign-in keeps its guarantee that success means a user.
 */
export type ActionResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string> }

/** Rough shape check only — the server is the real authority. */
export function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

/** Minimum we will accept before bothering the server. */
export const MIN_PASSWORD_LENGTH = 8

function toResult(error: unknown): AuthResult {
  if (error instanceof ApiError) {
    return { ok: false, message: error.message, fieldErrors: error.fieldErrors }
  }
  return { ok: false, message: "Could not reach the server. Please try again." }
}

async function authenticate(path: string, body: unknown): Promise<AuthResult> {
  try {
    // skipAuthRetry: a failed sign-in is not a stale token, and retrying it
    // through refresh would only muddy the error.
    const payload = await api.post<AuthPayload>(path, body, { skipAuthRetry: true })
    setAccessToken(payload.accessToken)
    return { ok: true, user: payload.user }
  } catch (error) {
    return toResult(error)
  }
}

export function signIn(input: { email: string; password: string }) {
  return authenticate("/api/auth/login", {
    email: input.email.trim(),
    password: input.password,
  })
}

export function signUp(input: { name: string; email: string; password: string }) {
  return authenticate("/api/auth/register", {
    name: input.name.trim(),
    email: input.email.trim(),
    password: input.password,
  })
}

/**
 * Clears the session both sides. The local token is dropped even if the call
 * fails — a user who asked to sign out should not stay signed in because the
 * network was down.
 */
export async function signOut(): Promise<void> {
  try {
    await api.post<void>("/api/auth/logout", undefined, { skipAuthRetry: true })
  } catch {
    /* already gone, or unreachable — either way, drop the local token */
  } finally {
    setAccessToken(null)
  }
}

export async function signOutEverywhere(): Promise<void> {
  try {
    await api.post<void>("/api/auth/logout-all")
  } finally {
    setAccessToken(null)
  }
}

/** The signed-in account, or null when the session is over. */
/**
 * Rebuilds the session after a reload, in a single request.
 *
 * The access token lives in memory and is therefore gone, but the httpOnly
 * refresh cookie survives — and the refresh response already carries the
 * account, so asking /me afterwards would only re-fetch what we just received.
 */
export async function restoreSession(): Promise<AuthUser | null> {
  const session = await refreshSession()
  return (session?.user as AuthUser | undefined) ?? null
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    return await api.get<AuthUser>("/api/auth/me")
  } catch {
    return null
  }
}

/**
 * Not implemented server-side yet. Reported honestly rather than pretending an
 * email went out — the endpoint does not exist, so nothing would arrive.
 */
/* --------------------------------------------------------------- account */

/**
 * Changing the name, the email, or both.
 *
 * A new email needs the current password: it is the login identifier and the
 * route back in if a password is ever lost, so a borrowed session must not be
 * able to move it.
 */
export async function updateAccount(input: {
  name?: string
  email?: string
  currentPassword?: string
}): Promise<AuthResult> {
  try {
    const user = await api.patch<AuthUser>("/api/account", input)
    return { ok: true, user }
  } catch (error) {
    return toResult(error)
  }
}

/**
 * Changing the password.
 *
 * Ends every other session — that is what changing a password is for. This one
 * is re-issued, so the person making the change stays signed in; the new access
 * token replaces the one held in memory.
 */
export async function changePassword(input: {
  currentPassword: string
  newPassword: string
}): Promise<AuthResult> {
  try {
    const payload = await api.post<AuthPayload>("/api/account/password", input)
    setAccessToken(payload.accessToken)
    return { ok: true, user: payload.user }
  } catch (error) {
    return toResult(error)
  }
}

/**
 * Asks for a reset link.
 *
 * Always resolves the same way, whatever the address — the API deliberately
 * does not say whether an account exists, and the page must not undo that by
 * showing a different message.
 */
/* -------------------------------------------------------------- sessions */

/**
 * One signed-in device.
 *
 * Keyed by token family, not token: rotation mints a new token on every
 * refresh, so a phone open for a week is dozens of rows and one device.
 */
export type Session = {
  id: string
  device: string
  userAgent?: string
  lastActive: string
  signedInAt: string
  /** The device asking. Offered sign-out, never revoke. */
  current: boolean
}

export function listSessions() {
  return api.get<Session[]>("/api/auth/sessions")
}

export function revokeSession(sessionId: string) {
  return apiRequest<void>(`/api/auth/sessions/${sessionId}`, { method: "DELETE" })
}

export async function requestPasswordReset(input: { email: string }): Promise<ActionResult> {
  try {
    await api.post<void>("/api/auth/forgot-password", { email: input.email.trim() }, {
      skipAuthRetry: true,
    })
    return { ok: true }
  } catch (error) {
    return toResult(error)
  }
}

/** Is this link still good? Lets the page say so before asking for a password. */
export async function checkResetToken(token: string): Promise<boolean> {
  try {
    const result = await apiRequest<{ valid: boolean }>(
      `/api/auth/reset-password?token=${encodeURIComponent(token)}`,
      { method: "GET", skipAuthRetry: true }
    )
    return result.valid
  } catch {
    return false
  }
}

/**
 * Spends the link.
 *
 * Does not sign anyone in: resetting ends every session, and the person now
 * has a password they can use. Sending them to sign in with it is one step and
 * leaves no doubt about which credential is live.
 */
export async function resetPassword(input: {
  token: string
  newPassword: string
}): Promise<ActionResult> {
  try {
    await api.post<void>("/api/auth/reset-password", input, { skipAuthRetry: true })
    return { ok: true }
  } catch (error) {
    return toResult(error)
  }
}


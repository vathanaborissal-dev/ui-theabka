/**
 * Account actions.
 *
 * There is no auth service yet — `e-theabka-api` is still empty — so these are
 * deliberate stubs. They validate shape and then report that accounts are not
 * connected, rather than pretending to sign anyone in: a form that appears to
 * work and silently does nothing is worse than one that says so.
 *
 * Passwords are never logged, stored, or persisted anywhere by this module.
 * When the API lands, replace the bodies here and the forms keep working.
 */
/* The stubs below take their input but cannot use it until there is an API to
   send it to. Keeping the parameters documents the contract callers already
   depend on, so wiring the real service is a body change and nothing more. */
/* eslint-disable @typescript-eslint/no-unused-vars */

export type AuthResult =
  | { ok: true }
  | { ok: false; reason: "not-configured" | "invalid" ; message?: string }

const NOT_CONFIGURED: AuthResult = { ok: false, reason: "not-configured" }

/** Rough shape check only — the server is the real authority. */
export function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

/** Minimum we will accept before bothering the server. */
export const MIN_PASSWORD_LENGTH = 8

export async function signIn(_input: { email: string; password: string }): Promise<AuthResult> {
  return NOT_CONFIGURED
}

export async function signUp(_input: {
  name: string
  email: string
  password: string
}): Promise<AuthResult> {
  return NOT_CONFIGURED
}

export async function requestPasswordReset(_input: { email: string }): Promise<AuthResult> {
  return NOT_CONFIGURED
}

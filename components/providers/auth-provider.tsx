"use client"

import * as React from "react"
import { onAccessTokenChange, getAccessToken } from "@/lib/api-client"
import { restoreSession, signOut as apiSignOut, type AuthUser } from "@/lib/auth"

type AuthState = {
  user: AuthUser | null
  /** True until the first session check settles, so guards do not flash. */
  loading: boolean
  signOut: () => Promise<void>
  reload: () => Promise<void>
  /** Mirrors a freshly authenticated account without an unnecessary request. */
  establishSession: (user: AuthUser) => void
}

const AuthContext = React.createContext<AuthState | null>(null)

/**
 * Holds the signed-in account for the app.
 *
 * On mount it attempts one silent refresh: the access token lives only in
 * memory and is therefore gone after a reload, but the httpOnly refresh cookie
 * survives — so a returning user is restored without ever exposing a
 * long-lived credential to script. That single call returns the account too,
 * so restoring a session costs one request, not a 401 plus a refresh plus a
 * retry.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null)
  const [loading, setLoading] = React.useState(true)

  const reload = React.useCallback(async () => {
    const current = await restoreSession()
    setUser(current)
  }, [])

  React.useEffect(() => {
    let cancelled = false

    // State is set after the await, never synchronously during the effect, and
    // the flag stops a slow response landing on an unmounted provider.
    async function restore() {
      const current = await restoreSession()
      if (cancelled) return
      setUser(current)
      setLoading(false)
    }

    void restore()
    return () => {
      cancelled = true
    }
  }, [])

  // Keeps React in step when the client clears the token on a dead session.
  React.useEffect(() => {
    return onAccessTokenChange((token) => {
      if (!token && getAccessToken() === null) {
        setUser((previous) => (previous === null ? previous : null))
      }
    })
  }, [])

  const signOut = React.useCallback(async () => {
    await apiSignOut()
    setUser(null)
  }, [])

  const establishSession = React.useCallback((authenticatedUser: AuthUser) => {
    setUser(authenticatedUser)
    setLoading(false)
  }, [])

  const value = React.useMemo<AuthState>(
    () => ({ user, loading, signOut, reload, establishSession }),
    [user, loading, signOut, reload, establishSession]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider")
  }
  return context
}

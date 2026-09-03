"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { AuthSessionTransition } from "@/components/auth/session-transition"

function safeDestination() {
  const requested = new URLSearchParams(window.location.search).get("next")
  return requested?.startsWith("/") && !requested.startsWith("//") ? requested : "/events"
}

/** Redirects an existing session away from sign-in and account creation. */
export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (!loading && user) router.replace(safeDestination())
  }, [loading, router, user])

  if (loading || user) {
    return <AuthSessionTransition />
  }

  return children
}

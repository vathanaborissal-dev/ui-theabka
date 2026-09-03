"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { AppSessionTransition } from "@/components/auth/session-transition"

/**
 * Keeps private UI hidden until the refresh-cookie session check settles.
 * Spring Security remains the authorization boundary for every data request.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  React.useEffect(() => {
    if (loading || user) return

    const query = searchParams.toString()
    const destination = query ? `${pathname}?${query}` : pathname
    router.replace(`/login?next=${encodeURIComponent(destination)}`)
  }, [loading, pathname, router, searchParams, user])

  if (loading || !user) {
    return <AppSessionTransition />
  }

  return children
}

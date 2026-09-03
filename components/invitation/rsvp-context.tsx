"use client"

import * as React from "react"
import type { InvitedGuest } from "@/lib/guests"

/**
 * Who is replying, and where the reply goes.
 *
 * Carried as context rather than threaded through props because eleven
 * templates sit between the page and the form, and none of them has any
 * business knowing about tokens or slugs. They lay out an invitation; the form
 * knows how to send one.
 *
 * Absent context means preview mode — the builder renders the same templates,
 * and a preview must never post a real reply.
 */
export type RsvpTarget = {
  slug: string
  /** From `?g=`. Absent when someone was forwarded the plain link. */
  token?: string
  /** Resolved from the token, when it matched a guest on this event. */
  guest: InvitedGuest | null
}

const RsvpContext = React.createContext<RsvpTarget | null>(null)

export function RsvpProvider({
  value,
  children,
}: {
  value: RsvpTarget
  children: React.ReactNode
}) {
  const memoised = React.useMemo(
    () => value,
    // The three fields are what matter; the object identity is not stable
    // across a server render.
    [value.slug, value.token, value.guest] // eslint-disable-line react-hooks/exhaustive-deps
  )
  return <RsvpContext.Provider value={memoised}>{children}</RsvpContext.Provider>
}

/** Null in the builder's preview, where replying must do nothing. */
export function useRsvpTarget() {
  return React.useContext(RsvpContext)
}

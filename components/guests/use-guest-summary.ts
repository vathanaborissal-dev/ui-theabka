"use client"

import * as React from "react"
import { guestSummary, type GuestSummary } from "@/lib/guests"

/**
 * The counts above the guest table.
 *
 * Totalled by the database rather than by counting the rows in the browser,
 * because the browser now holds one page. Counting what is on screen would
 * report "3 confirmed" out of eight hundred guests.
 */
const EMPTY: GuestSummary = {
  invited: 0,
  confirmed: 0,
  declined: 0,
  pending: 0,
  maybe: 0,
  expectedSeats: 0,
  gifts: [],
  invitedSeats: 0,
  bySide: [],
}

export function useGuestSummary(eventId: string | undefined, refreshToken = 0) {
  const requestKey = `${eventId ?? ""}|${refreshToken}`
  // Tagged with the request it answered, so "loading" is derived rather than
  // set at the top of an effect.
  const [result, setResult] = React.useState<{ key: string; summary: GuestSummary } | null>(null)

  React.useEffect(() => {
    if (!eventId) return
    let cancelled = false
    guestSummary(eventId)
      .then((summary) => {
        if (!cancelled) setResult({ key: requestKey, summary })
      })
      .catch(() => {
        // The table below is the page's job; a failed count strip should not
        // replace the whole screen with an error.
        if (!cancelled) setResult({ key: requestKey, summary: EMPTY })
      })
    return () => {
      cancelled = true
    }
  }, [eventId, requestKey])

  const settled = result?.key === requestKey
  return {
    summary: settled ? result.summary : EMPTY,
    loading: !settled,
  }
}

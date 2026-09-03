"use client"

import * as React from "react"
import { expenseSummary, type ExpenseSummary } from "@/lib/budget"

/**
 * Budget totals, added up by the database.
 *
 * Mirrors `useGuestSummary`: loading is derived by comparing the in-flight
 * request against the last response, so it cannot drift out of step with the
 * data it describes.
 */
const EMPTY: ExpenseSummary = { lines: 0, totals: [] }

export function useExpenseSummary(eventId: string | undefined, refreshToken = 0) {
  const requestKey = `${eventId ?? ""}|${refreshToken}`
  const [result, setResult] = React.useState<{ key: string; summary: ExpenseSummary } | null>(null)

  React.useEffect(() => {
    if (!eventId) return
    let cancelled = false
    expenseSummary(eventId)
      .then((summary) => {
        if (!cancelled) setResult({ key: requestKey, summary })
      })
      .catch(() => {
        if (!cancelled) setResult({ key: requestKey, summary: EMPTY })
      })
    return () => {
      cancelled = true
    }
  }, [eventId, requestKey])

  const settled = result?.key === requestKey
  return { summary: settled ? result.summary : EMPTY, loading: !settled }
}

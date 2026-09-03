"use client"

import * as React from "react"
import { guestResponseTrend } from "@/lib/guests"
import type { TrendPoint } from "@/components/charts/area-trend"

/**
 * Replies per day for the trend line.
 *
 * The API buckets by date, so this fetches a handful of points rather than
 * every guest row for the browser to group itself. The event's own timezone
 * decides where a day ends — a reply at 11pm in Phnom Penh belongs to that
 * day, not the next one in UTC.
 */
export function useResponseTrend(eventId: string | undefined, timezone: string | undefined) {
  const zone = timezone || "Asia/Phnom_Penh"
  const [attempt, setAttempt] = React.useState(0)
  const requestKey = `${eventId ?? ""}|${zone}|${attempt}`
  const [result, setResult] = React.useState<{
    key: string | null
    points: TrendPoint[]
    status: "ready" | "failed"
  }>({ key: null, points: [], status: "ready" })

  React.useEffect(() => {
    if (!eventId) return
    let cancelled = false
    guestResponseTrend(eventId, zone)
      .then((trend) => {
        if (cancelled) return
        setResult({
          key: requestKey,
          points: trend.map((day) => ({ label: day.date, value: day.total })),
          status: "ready",
        })
      })
      .catch(() => {
        if (!cancelled) {
          setResult({ key: requestKey, points: [], status: "failed" })
        }
      })
    return () => {
      cancelled = true
    }
  }, [eventId, zone, attempt, requestKey])

  const current = result.key === requestKey
    ? result
    : { points: [] as TrendPoint[], status: "loading" as const }

  return {
    points: current.points,
    status: current.status,
    retry: () => setAttempt((current) => current + 1),
  }
}

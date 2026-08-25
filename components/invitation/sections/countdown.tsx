"use client"

import * as React from "react"
import { useLocale } from "@/components/providers/locale-provider"
import { formatNumber, timeParts } from "@/lib/format"

/**
 * Live countdown.
 *
 * The clock is an external source, so it is read through useSyncExternalStore:
 * the server snapshot is a fixed placeholder (a time-dependent value cannot be
 * server-rendered without a hydration mismatch) and the client re-reads once a
 * second.
 */
function subscribeToSeconds(onChange: () => void) {
  const id = setInterval(onChange, 1000)
  return () => clearInterval(id)
}

export function InvitationCountdown({ date }: { date: string }) {
  const { t, locale } = useLocale()

  const now = React.useSyncExternalStore(
    subscribeToSeconds,
    () => Math.floor(Date.now() / 1000),
    () => 0
  )

  const mounted = now > 0
  const parts = mounted
    ? timeParts(date, new Date(now * 1000))
    : { days: 0, hours: 0, minutes: 0, seconds: 0 }

  const units = [
    { value: parts.days, label: t("public.countdownDays") },
    { value: parts.hours, label: t("public.countdownHours") },
    { value: parts.minutes, label: t("public.countdownMinutes") },
    { value: parts.seconds, label: t("public.countdownSeconds") },
  ]

  return (
    <div className="flex items-start justify-center gap-4 @xl:gap-8" suppressHydrationWarning>
      {units.map((unit) => (
        <div key={unit.label} className="text-center">
          <p
            className="tnum text-[clamp(1.6rem,6cqi,2.25rem)] leading-none text-(--inv-accent)"
            style={{ fontFamily: "var(--inv-font-display)" }}
            suppressHydrationWarning
          >
            {mounted ? formatNumber(unit.value, locale) : "—"}
          </p>
          <p className="mt-1.5 text-[0.6875rem] tracking-[0.14em] text-(--inv-muted) uppercase">
            {unit.label}
          </p>
        </div>
      ))}
    </div>
  )
}

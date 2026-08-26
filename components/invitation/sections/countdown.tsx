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

export type CountdownVariant = "row" | "boxed" | "lead" | "inline"

export function InvitationCountdown({
  date,
  variant = "row",
}: {
  date: string
  /**
   * How the clock is dressed. Templates pick one so the countdown is not the
   * same object on every card: "row" is four bare figures, "boxed" sets each
   * in a ruled cell, "lead" makes the day count the headline with the rest
   * subordinate, and "inline" collapses to a single quiet line.
   */
  variant?: CountdownVariant
}) {
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

  const figure = (value: number) => (mounted ? formatNumber(value, locale) : "\u2014")

  if (variant === "inline") {
    return (
      <p
        className="text-center text-sm tracking-[0.08em] text-(--inv-muted)"
        suppressHydrationWarning
      >
        {units.map((unit, i) => (
          <span key={unit.label}>
            {i > 0 ? <span className="mx-2 text-(--inv-border)">&middot;</span> : null}
            <span className="tnum font-medium text-(--inv-accent)">{figure(unit.value)}</span>{" "}
            {unit.label.toLowerCase()}
          </span>
        ))}
      </p>
    )
  }

  if (variant === "lead") {
    const [days, ...rest] = units
    return (
      <div className="text-center" suppressHydrationWarning>
        <p
          className="tnum text-[clamp(3rem,14cqi,5rem)] leading-none text-(--inv-accent)"
          style={{ fontFamily: "var(--inv-font-display)" }}
          suppressHydrationWarning
        >
          {figure(days.value)}
        </p>
        <p className="mt-2 text-[0.6875rem] tracking-[0.24em] text-(--inv-muted) uppercase">
          {days.label}
        </p>
        <p className="mt-4 text-xs text-(--inv-muted)" suppressHydrationWarning>
          {rest.map((unit, i) => (
            <span key={unit.label}>
              {i > 0 ? <span className="mx-1.5 text-(--inv-border)">&middot;</span> : null}
              <span className="tnum">{figure(unit.value)}</span> {unit.label.toLowerCase()}
            </span>
          ))}
        </p>
      </div>
    )
  }

  if (variant === "boxed") {
    return (
      <div className="flex items-stretch justify-center gap-2 @xl:gap-3" suppressHydrationWarning>
        {units.map((unit) => (
          <div
            key={unit.label}
            className="min-w-[4.25rem] rounded-[var(--inv-radius,0.5rem)] border border-(--inv-border) bg-(--inv-surface) px-3 py-3 text-center @xl:min-w-[5rem]"
          >
            <p
              className="tnum text-[clamp(1.4rem,5cqi,2rem)] leading-none text-(--inv-accent)"
              style={{ fontFamily: "var(--inv-font-display)" }}
              suppressHydrationWarning
            >
              {figure(unit.value)}
            </p>
            <p className="mt-1.5 text-[0.625rem] tracking-[0.12em] text-(--inv-muted) uppercase">
              {unit.label}
            </p>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-start justify-center gap-4 @xl:gap-8" suppressHydrationWarning>
      {units.map((unit) => (
        <div key={unit.label} className="text-center">
          <p
            className="tnum text-[clamp(1.6rem,6cqi,2.25rem)] leading-none text-(--inv-accent)"
            style={{ fontFamily: "var(--inv-font-display)" }}
            suppressHydrationWarning
          >
            {figure(unit.value)}
          </p>
          <p className="mt-1.5 text-[0.6875rem] tracking-[0.14em] text-(--inv-muted) uppercase">
            {unit.label}
          </p>
        </div>
      ))}
    </div>
  )
}

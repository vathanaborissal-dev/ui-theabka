"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type Period = "AM" | "PM"

function parseTime(value?: string) {
  const [h, m] = (value ?? "").split(":").map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null
  return {
    hour: h % 12 === 0 ? 12 : h % 12,
    minute: m,
    period: (h >= 12 ? "PM" : "AM") as Period,
  }
}

function toValue(hour: number, minute: number, period: Period) {
  const h = period === "PM" ? (hour % 12) + 12 : hour % 12
  return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

/**
 * Replaces the native `<input type="time">`, whose picker UI is inconsistent
 * across browsers and can't be styled to match the rest of the app.
 *
 * Segments are typed into directly — no dropdown or popover. Digits advance
 * hour → minute automatically, arrow keys step values, and A/P set the period.
 * Value and onChange still speak plain 24-hour "HH:MM" so this drops into
 * existing form state unchanged.
 */
export function TimePicker({
  id,
  value,
  onChange,
  className,
  disabled,
  "aria-label": ariaLabel,
}: {
  id?: string
  value?: string
  onChange: (value: string) => void
  className?: string
  disabled?: boolean
  "aria-label"?: string
}) {
  const parsed = parseTime(value)
  const minuteRef = React.useRef<HTMLInputElement>(null)

  // While a segment is being typed it holds a partial string ("1", "") that
  // isn't a committed value yet. Cleared on blur so display re-derives.
  const [draftHour, setDraftHour] = React.useState<string | null>(null)
  const [draftMinute, setDraftMinute] = React.useState<string | null>(null)

  const hourText = draftHour ?? (parsed ? String(parsed.hour) : "")
  const minuteText =
    draftMinute ?? (parsed ? String(parsed.minute).padStart(2, "0") : "")
  const period: Period = parsed?.period ?? "AM"

  const commit = (next: {
    hour?: number
    minute?: number
    period?: Period
  }) => {
    const hour = next.hour ?? parsed?.hour ?? 12
    const minute = next.minute ?? parsed?.minute ?? 0
    onChange(toValue(hour, minute, next.period ?? period))
  }

  function handleHourInput(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(-2)
    setDraftHour(digits)
    if (digits === "") return
    const n = Number(digits)
    // "13".."19" can only have been meant as a single-digit hour plus a stray
    // keystroke, so keep the leading digit rather than snapping to 12.
    if (n >= 1 && n <= 12) {
      commit({ hour: n })
      if (digits.length === 2 || n > 1) minuteRef.current?.select()
    }
  }

  function handleMinuteInput(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(-2)
    setDraftMinute(digits)
    if (digits === "") return
    const n = Number(digits)
    if (n >= 0 && n <= 59) commit({ minute: n })
  }

  function step(segment: "hour" | "minute", delta: number) {
    if (segment === "hour") {
      const next = ((parsed?.hour ?? 12) - 1 + delta + 12) % 12
      setDraftHour(null)
      commit({ hour: next + 1 })
    } else {
      const next = ((parsed?.minute ?? 0) + delta + 60) % 60
      setDraftMinute(null)
      commit({ minute: next })
    }
  }

  const segmentKeys =
    (segment: "hour" | "minute") => (e: React.KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault()
        step(segment, 1)
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        step(segment, -1)
      } else if (e.key === "a" || e.key === "p") {
        e.preventDefault()
        commit({ period: e.key === "a" ? "AM" : "PM" })
      }
    }

  const segmentClass =
    "tnum w-[2ch] bg-transparent text-center outline-none disabled:cursor-not-allowed"

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      data-disabled={disabled || undefined}
      className={cn(
        "flex h-9 w-full min-w-0 items-center rounded-lg border border-input bg-transparent px-3 py-1 text-base transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 data-disabled:cursor-not-allowed data-disabled:bg-input/50 data-disabled:opacity-50 md:text-sm dark:bg-input/30",
        className
      )}
    >
      <input
        id={id}
        type="text"
        inputMode="numeric"
        aria-label="Hour"
        disabled={disabled}
        className={cn(segmentClass, "text-right")}
        value={hourText}
        placeholder="--"
        onChange={(e) => handleHourInput(e.target.value)}
        onKeyDown={segmentKeys("hour")}
        onFocus={(e) => e.currentTarget.select()}
        onBlur={() => setDraftHour(null)}
      />
      <span aria-hidden="true" className="px-0.5 text-muted-foreground">
        :
      </span>
      <input
        ref={minuteRef}
        type="text"
        inputMode="numeric"
        aria-label="Minute"
        disabled={disabled}
        className={segmentClass}
        value={minuteText}
        placeholder="--"
        onChange={(e) => handleMinuteInput(e.target.value)}
        onKeyDown={segmentKeys("minute")}
        onFocus={(e) => e.currentTarget.select()}
        onBlur={() => setDraftMinute(null)}
      />
      <button
        type="button"
        disabled={disabled}
        aria-label={`Period: ${period}. Activate to switch.`}
        onClick={() => commit({ period: period === "AM" ? "PM" : "AM" })}
        className="ml-1.5 rounded px-1.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed"
      >
        {period}
      </button>
    </div>
  )
}

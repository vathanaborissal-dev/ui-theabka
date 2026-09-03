"use client"

import { useLocale } from "@/components/providers/locale-provider"
import { dateFieldParts, formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

/**
 * The month, with the day ringed.
 *
 * A date in a sentence tells a guest when; a month grid tells them *where in
 * their week* — which day it falls on, what it sits next to, whether they need
 * the Friday off. Cambodian printed invitations often include one for exactly
 * that reason, and it is the section people photograph.
 *
 * Built from the event date rather than a library: it is one month with one day
 * marked, and the only hard parts are which weekday the month starts on and
 * getting Khmer numerals right — both of which `lib/format` already answers.
 */
export function WeddingCalendar({ date }: { date: string }) {
  const { locale, t } = useLocale()
  const target = new Date(date)
  if (Number.isNaN(target.getTime())) return null

  const { month, year } = dateFieldParts(date, locale)

  // Built in Cambodia's timezone, so a guest reading this in another country
  // does not see the day marked against the wrong square.
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Phnom_Penh",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(target)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  const y = get("year")
  const m = get("month")
  const weddingDay = get("day")

  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const startsOn = new Date(Date.UTC(y, m - 1, 1)).getUTCDay()

  const weekdays =
    locale === "km"
      ? ["អា", "ច", "អ", "ព", "ព្រ", "សុ", "ស"]
      : ["S", "M", "T", "W", "T", "F", "S"]

  const cells: (number | null)[] = [
    ...Array.from({ length: startsOn }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="mx-auto w-full max-w-xs">
      <p
        className="text-center text-sm tracking-wide text-(--inv-muted)"
        style={{ fontFamily: "var(--inv-font-display)" }}
      >
        {month} {year}
      </p>

      <div className="mt-4 grid grid-cols-7 gap-y-2 text-center">
        {weekdays.map((day, i) => (
          <span key={i} className="text-[0.6875rem] font-medium text-(--inv-muted)/70">
            {day}
          </span>
        ))}

        {cells.map((day, i) => {
          const wedding = day === weddingDay
          return (
            <span
              key={i}
              // The wedding day is the one thing this grid exists to show, so
              // it is the only cell that is not plain text.
              aria-current={wedding ? "date" : undefined}
              className={cn(
                "mx-auto flex size-7 items-center justify-center rounded-full text-xs tabular-nums",
                wedding
                  ? "bg-(--inv-accent) font-semibold text-(--inv-accent-contrast) ring-2 ring-(--inv-gold) ring-offset-2 ring-offset-transparent"
                  : "text-(--inv-fg)/80"
              )}
            >
              {day === null ? "" : formatNumber(day, locale)}
            </span>
          )
        })}
      </div>

      <p className="mt-5 text-center text-xs text-(--inv-muted)">
        {t("public.theDay")}
      </p>
    </div>
  )
}

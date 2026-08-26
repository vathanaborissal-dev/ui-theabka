"use client"

import { useLocale } from "@/components/providers/locale-provider"
import { formatTime } from "@/lib/format"
import type { ScheduleItem } from "@/lib/types"

export type ScheduleVariant = "line" | "plain" | "cards" | "centred"

export function InvitationSchedule({
  items,
  variant = "line",
}: {
  items: ScheduleItem[]
  /**
   * "line" is the connected timeline, "plain" a bare time column, "cards"
   * gives each moment its own ruled block, and "centred" stacks the time above
   * the title down the middle of the card.
   */
  variant?: ScheduleVariant
}) {
  const { L, locale } = useLocale()
  if (items.length === 0) return null

  if (variant === "cards") {
    return (
      <ol className="mx-auto grid max-w-lg gap-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-[var(--inv-radius,0.5rem)] border border-(--inv-border) bg-(--inv-surface) px-5 py-4"
          >
            <time
              className="tnum text-xs tracking-[0.14em] text-(--inv-accent) uppercase"
              dateTime={item.time}
            >
              {formatTime(item.time, locale, true)}
            </time>
            <p className="mt-1.5 font-medium text-(--inv-fg)">{L(item.title)}</p>
            {item.description ? (
              <p className="mt-1 text-sm leading-relaxed text-(--inv-muted)">
                {L(item.description)}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    )
  }

  if (variant === "centred") {
    return (
      <ol className="mx-auto max-w-md space-y-7 text-center">
        {items.map((item, i) => (
          <li key={item.id}>
            {i > 0 ? (
              <span
                className="mx-auto mb-7 block h-px w-10 bg-(--inv-border)"
                aria-hidden="true"
              />
            ) : null}
            <time
              className="tnum block text-xs tracking-[0.2em] text-(--inv-accent) uppercase"
              dateTime={item.time}
            >
              {formatTime(item.time, locale, true)}
            </time>
            <p
              className="mt-2 text-lg text-(--inv-fg)"
              style={{ fontFamily: "var(--inv-font-display)" }}
            >
              {L(item.title)}
            </p>
            {item.description ? (
              <p className="mt-1.5 text-sm leading-relaxed text-(--inv-muted)">
                {L(item.description)}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    )
  }

  return (
    <ol className="mx-auto max-w-md space-y-0">
      {items.map((item, i) => (
        <li key={item.id} className="relative flex gap-5 pb-7 last:pb-0">
          {variant === "line" ? (
            <>
              {i < items.length - 1 ? (
                <span
                  className="absolute top-3 bottom-0 left-[5.25rem] w-px bg-(--inv-border)"
                  aria-hidden="true"
                />
              ) : null}
              <time
                className="tnum w-20 shrink-0 pt-0.5 text-right text-sm leading-snug font-medium text-(--inv-accent)"
                dateTime={item.time}
              >
                {formatTime(item.time, locale, true)}
              </time>
              <span
                className="relative z-10 mt-1.5 size-2 shrink-0 rounded-full bg-(--inv-accent) ring-4 ring-(--inv-bg)"
                aria-hidden="true"
              />
            </>
          ) : (
            <time className="tnum w-20 shrink-0 text-sm text-(--inv-muted)" dateTime={item.time}>
              {formatTime(item.time, locale, true)}
            </time>
          )}

          <div className="min-w-0 flex-1 pt-0">
            <p className="font-medium text-(--inv-fg)">{L(item.title)}</p>
            {item.description ? (
              <p className="mt-1 text-sm leading-relaxed text-(--inv-muted)">
                {L(item.description)}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  )
}

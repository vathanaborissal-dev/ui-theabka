"use client"

import { useLocale } from "@/components/providers/locale-provider"
import { formatTime } from "@/lib/format"
import type { ScheduleItem } from "@/lib/types"

export function InvitationSchedule({
  items,
  variant = "line",
}: {
  items: ScheduleItem[]
  variant?: "line" | "plain"
}) {
  const { L, locale } = useLocale()
  if (items.length === 0) return null

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

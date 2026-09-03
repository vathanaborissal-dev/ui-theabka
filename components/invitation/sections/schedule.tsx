"use client"

import * as React from "react"
import { useLocale } from "@/components/providers/locale-provider"
import { cn } from "@/lib/utils"
import { formatTime } from "@/lib/format"
import { GoldFlourish } from "@/components/invitation/gold-ornaments"
import type { ScheduleItem } from "@/lib/types"

export type ScheduleVariant = "line" | "plain" | "cards" | "centred" | "sompeah"

/**
 * Marks a ceremony that only close family attend.
 *
 * Carries a word, not just a colour — an unlabelled dot would leave the very
 * guests this is for guessing, and colour alone is not an encoding.
 */
function FamilyBadge({ className }: { className?: string }) {
  const { t } = useLocale()
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border border-(--inv-gold)/50 px-2 py-0.5 text-[0.625rem] tracking-[0.08em] whitespace-nowrap text-(--inv-muted) uppercase",
        className
      )}
    >
      {t("schedule.familyShort")}
    </span>
  )
}

export function InvitationSchedule({
  items,
  variant = "line",
}: {
  items: ScheduleItem[]
  /**
   * "line" is the connected timeline, "plain" a bare time column, "cards"
   * gives each moment its own ruled block, "centred" stacks the time above the
   * title, and "sompeah" uses a small Khmer gold flourish between moments.
   */
  variant?: ScheduleVariant
}) {
  const { t, L, locale } = useLocale()

  const familyCount = items.filter((i) => i.audience === "family").length
  // Default to the guest's own part: most invitees attend the reception only,
  // and a dawn-to-night list read cold looks like the whole day is expected.
  const [showAll, setShowAll] = React.useState(false)
  const visible = showAll || familyCount === 0
    ? items
    : items.filter((i) => i.audience !== "family")

  if (items.length === 0) return null

  // Only worth a control when the day actually splits.
  const toggle =
    familyCount > 0 && familyCount < items.length ? (
      <div className="mb-6 flex justify-center">
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          aria-pressed={showAll}
          className="inline-flex min-h-11 items-center rounded-full border border-(--inv-border) px-4 text-xs text-(--inv-muted) transition-colors outline-none hover:text-(--inv-fg) focus-visible:ring-3 focus-visible:ring-(--inv-accent)/40"
        >
          {t(showAll ? "schedule.showMine" : "schedule.showAll")}
        </button>
      </div>
    ) : null

  if (variant === "cards") {
    return (
      <>
      {toggle}
      <ol className="mx-auto grid max-w-lg gap-3">
        {visible.map((item) => (
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
            <p className="mt-1.5 flex flex-wrap items-center gap-2 font-medium text-(--inv-fg)">
              <span>{L(item.title)}</span>
              {item.audience === "family" ? <FamilyBadge /> : null}
            </p>
            {item.description ? (
              <p className="mt-1 text-sm leading-relaxed text-(--inv-muted)">
                {L(item.description)}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
      </>
    )
  }

  if (variant === "centred" || variant === "sompeah") {
    return (
      <>
      {toggle}
      <ol className="mx-auto max-w-md space-y-7 text-center">
        {visible.map((item, i) => (
          <li key={item.id}>
            {i > 0 && variant === "sompeah" ? (
              <GoldFlourish className="mb-7 h-3 w-24" />
            ) : i > 0 ? (
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
            {item.audience === "family" ? <FamilyBadge className="mt-2" /> : null}
            {item.description ? (
              <p className="mt-1.5 text-sm leading-relaxed text-(--inv-muted)">
                {L(item.description)}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
      </>
    )
  }

  return (
    <>
    {toggle}
    <ol className="mx-auto max-w-md space-y-0">
      {visible.map((item, i) => (
        <li key={item.id} className="relative flex gap-5 pb-7 last:pb-0">
          {variant === "line" ? (
            <>
              {i < visible.length - 1 ? (
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
            <p className="flex flex-wrap items-center gap-2 font-medium text-(--inv-fg)">
              <span>{L(item.title)}</span>
              {item.audience === "family" ? <FamilyBadge /> : null}
            </p>
            {item.description ? (
              <p className="mt-1 text-sm leading-relaxed text-(--inv-muted)">
                {L(item.description)}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
    </>
  )
}

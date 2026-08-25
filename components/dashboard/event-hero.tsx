"use client"

import { CalendarDays, MapPin, Share2 } from "lucide-react"
import { ButtonLink } from "@/components/ui/button-link"
import { Photo } from "@/components/shared/photo"
import { useLocale } from "@/components/providers/locale-provider"
import { daysUntil, formatDate, formatNumber, formatTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { EventRecord } from "@/lib/types"

/**
 * The page's anchor: what the event is, when it is, and how long is left.
 * A band rather than a card — the dashboard already has enough boxes.
 *
 * The cover photo is treated differently per breakpoint: a band above the text
 * on a phone, where an overlaid photo would either be invisible or wreck the
 * contrast, and a faded backdrop from the right on wider screens.
 */
export function EventHero({ event }: { event: EventRecord }) {
  const { t, L, locale } = useLocale()
  const days = daysUntil(event.date)

  return (
    <section className="overflow-hidden rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card shadow-(--shadow-card)">
      <Photo
        src={event.coverPhoto}
        alt=""
        seed={3}
        rounded={false}
        className="h-28 w-full sm:hidden"
      />

      <div className="relative">
        <div className="absolute inset-0 hidden sm:block" aria-hidden="true">
          <Photo src={event.coverPhoto} alt="" seed={3} className="h-full w-full" rounded={false} />
          <div className="absolute inset-0 bg-linear-to-r from-card via-card/95 to-card/50" />
        </div>

        <div className="relative flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
          <div className="min-w-0 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="eyebrow rounded-full bg-primary/10 px-2.5 py-1 text-primary">
                {t(`event.type.${event.type}`)}
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  event.status === "published"
                    ? "bg-success/12 text-success"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {t(`status.${event.status}`)}
              </span>
            </div>

            <h1 className="display max-w-xl text-[1.6rem] leading-tight text-balance sm:text-3xl">
              {L(event.title)}
            </h1>

            <dl className="flex flex-col gap-1.5 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-5">
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">{t("expenses.dueDate")}</dt>
                <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
                <dd>
                  {formatDate(event.date, locale, "full")} · {formatTime(event.date, locale)}
                </dd>
              </div>
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">{t("public.venueTitle")}</dt>
                <MapPin className="size-4 shrink-0" aria-hidden="true" />
                <dd className="truncate">{L(event.venue.name)}</dd>
              </div>
            </dl>
          </div>

          <div className="flex shrink-0 flex-col gap-4 lg:flex-row lg:items-end lg:gap-5">
            <Countdown days={days} />
            <div className="grid grid-cols-2 gap-2 lg:flex lg:flex-col">
              <ButtonLink href={`/events/${event.id}/share`}>
                <Share2 />
                {t("action.share")}
              </ButtonLink>
              <ButtonLink href={`/i/${event.slug}`} target="_blank" variant="outline">
                {t("action.preview")}
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Countdown({ days }: { days: number }) {
  const { t, locale } = useLocale()

  if (days === 0) {
    return <p className="display text-lg text-primary">{t("dash.today")}</p>
  }

  const past = days < 0
  return (
    <p className="flex items-baseline gap-2 lg:block lg:text-right">
      <span className="display tnum text-4xl leading-none text-primary sm:text-5xl">
        {formatNumber(Math.abs(days), locale)}
      </span>
      <span className="text-xs text-muted-foreground lg:mt-1 lg:block">
        {past ? t("dash.past") : t("dash.daysToGo")}
      </span>
    </p>
  )
}

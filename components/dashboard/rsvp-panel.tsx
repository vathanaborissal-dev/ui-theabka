"use client"

import { ArrowRight } from "lucide-react"
import { ButtonLink } from "@/components/ui/button-link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { SegmentedBar } from "@/components/shared/segmented-bar"
import { AreaTrend, type TrendPoint } from "@/components/charts/area-trend"
import { useLocale } from "@/components/providers/locale-provider"
import { formatDate, formatNumber } from "@/lib/format"
import type { GuestSummary } from "@/lib/guests"
import type { EventRecord } from "@/lib/types"

export function RsvpPanel({
  event,
  summary,
  trend,
}: {
  event: EventRecord
  summary: GuestSummary
  /** Replies per day, already bucketed by the API. */
  trend: {
    points: TrendPoint[]
    status: "loading" | "ready" | "failed"
    retry: () => void
  }
}) {
  const { t, L, locale } = useLocale()
  // Every figure here is a count, and counts come from the database.
  const stats = summary

  const segments = [
    { key: "confirmed", label: t("status.confirmed"), value: stats.confirmed, className: "bg-success" },
    { key: "maybe", label: t("status.maybe"), value: stats.maybe, className: "bg-warning" },
    { key: "declined", label: t("status.declined"), value: stats.declined, className: "bg-muted-foreground/45" },
    { key: "pending", label: t("status.pending"), value: stats.pending, className: "bg-muted-foreground/15" },
  ]


  return (
    <section className="rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card shadow-(--shadow-card)">
      <header className="flex items-start justify-between gap-3 border-b border-border/70 p-5">
        <div>
          <h2 className="display text-base">{t("dash.rsvpProgress")}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {formatNumber(Math.round(((stats.confirmed + stats.declined + stats.maybe) / (stats.invited || 1)) * 100), locale)}% {t("dash.responseRate")}
            {" · "}
            {formatNumber(stats.pending, locale)} {t("status.pending").toLowerCase()}
          </p>
        </div>
        <ButtonLink href={`/events/${event.id}/guests`} variant="ghost" size="sm" className="shrink-0">
          {t("nav.guests")}
          <ArrowRight />
        </ButtonLink>
      </header>

      <div className="space-y-6 p-5">
        <SegmentedBar segments={segments} total={stats.invited} />

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="eyebrow mb-3 text-muted-foreground">{t("side.label")}</p>
            <dl className="space-y-2.5">
              {(["a", "b", "shared"] as const).map((side) => {
                const s = stats.bySide.find((total) => total.side === side)
                if (!s || s.invitations === 0) return null
                const label =
                  side === "shared" ? t("side.shared") : L(event.sides[side])
                const pct = s.invitations ? (s.confirmed / s.invitations) * 100 : 0
                return (
                  <div key={side} className="space-y-1">
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <dt className="truncate text-muted-foreground">{label}</dt>
                      <dd className="tnum shrink-0 font-medium">
                        {formatNumber(s.confirmed, locale)}
                        <span className="text-muted-foreground">
                          /{formatNumber(s.invitations, locale)}
                        </span>
                      </dd>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-sm bg-muted">
                      <div
                        className="h-full rounded-r-[4px] bg-primary/70"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </dl>
          </div>

          <div>
            <p className="eyebrow mb-3 text-muted-foreground">{t("gifts.trend")}</p>
            {trend.status === "loading" ? (
              <div className="flex h-[168px] items-end gap-3 px-8 pb-6" role="status" aria-label={t("common.loading")}>
                {[35, 58, 44, 76, 62, 88].map((height, index) => (
                  <Skeleton key={index} className="flex-1" style={{ height: `${height}%` }} />
                ))}
              </div>
            ) : trend.status === "failed" ? (
              <div className="flex h-[168px] flex-col items-center justify-center gap-3 text-center">
                <p className="text-sm text-muted-foreground">{t("dash.repliesLoadFailed")}</p>
                <Button type="button" variant="outline" size="sm" onClick={trend.retry}>
                  {t("action.tryAgain")}
                </Button>
              </div>
            ) : (
              <AreaTrend
                points={trend.points}
                caption="Cumulative replies received per day"
                emptyLabel={t("dash.noRepliesYet")}
                formatLabel={(label) => formatDate(label, locale, "dayMonth")}
                formatValue={(value) =>
                  `${formatNumber(value, locale)} ${t("dash.repliesSoFar").toLowerCase()}`
                }
              />
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              {formatNumber(stats.confirmed + stats.declined + stats.maybe, locale)}{" "}
              {t("common.of")} {formatNumber(stats.invited, locale)} {t("guests.parties").toLowerCase()}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

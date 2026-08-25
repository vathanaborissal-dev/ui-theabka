"use client"

import { ArrowRight } from "lucide-react"
import { ButtonLink } from "@/components/ui/button-link"
import { SegmentedBar } from "@/components/shared/segmented-bar"
import { AreaTrend, type TrendPoint } from "@/components/charts/area-trend"
import { useLocale } from "@/components/providers/locale-provider"
import { formatNumber } from "@/lib/format"
import { guestStats } from "@/lib/stats"
import type { EventRecord, Guest } from "@/lib/types"

export function RsvpPanel({ event, guests }: { event: EventRecord; guests: Guest[] }) {
  const { t, L, locale } = useLocale()
  const stats = guestStats(guests)

  const segments = [
    { key: "confirmed", label: t("status.confirmed"), value: stats.confirmed, className: "bg-success" },
    { key: "maybe", label: t("status.maybe"), value: stats.maybe, className: "bg-warning" },
    { key: "declined", label: t("status.declined"), value: stats.declined, className: "bg-muted-foreground/45" },
    { key: "pending", label: t("status.pending"), value: stats.pending, className: "bg-muted-foreground/15" },
  ]

  const trend = responseTrend(guests)

  return (
    <section className="rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card shadow-(--shadow-card)">
      <header className="flex items-start justify-between gap-3 border-b border-border/70 p-5">
        <div>
          <h2 className="display text-base">{t("dash.rsvpProgress")}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {formatNumber(Math.round(stats.responseRate * 100), locale)}% {t("dash.responseRate")}
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
        <SegmentedBar segments={segments} total={stats.invitations} />

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="eyebrow mb-3 text-muted-foreground">{t("side.label")}</p>
            <dl className="space-y-2.5">
              {(["a", "b", "shared"] as const).map((side) => {
                const s = stats.bySide[side]
                if (s.invitations === 0) return null
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
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary/70"
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
            <AreaTrend
              points={trend}
              caption="Cumulative replies received per day"
              height={72}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {formatNumber(stats.confirmed + stats.declined + stats.maybe, locale)}{" "}
              {t("common.of")} {formatNumber(stats.invitations, locale)} {t("guests.parties").toLowerCase()}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Cumulative replies bucketed by day, for the trend line. */
function responseTrend(guests: Guest[]): TrendPoint[] {
  const byDay = new Map<string, number>()
  for (const g of guests) {
    if (!g.respondedAt) continue
    const day = g.respondedAt.slice(0, 10)
    byDay.set(day, (byDay.get(day) ?? 0) + 1)
  }
  const days = [...byDay.keys()].sort()
  let running = 0
  return days.map((day) => {
    running += byDay.get(day) ?? 0
    return { label: day, value: running }
  })
}

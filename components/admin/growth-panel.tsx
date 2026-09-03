"use client"

import { AreaTrend, type TrendPoint } from "@/components/charts/area-trend"
import { Panel } from "@/components/shared/panel"
import { useLocale } from "@/components/providers/locale-provider"
import { formatDate, formatNumber } from "@/lib/format"

/**
 * The two lines that answer "is the platform growing": accounts and events,
 * both per day rather than cumulative. A cumulative line only ever goes up
 * and flatters every platform equally; a quiet week is invisible on one and
 * obvious on this.
 */
export function GrowthPanel({
  signups,
  eventsCreated,
  className,
}: {
  signups: { date: string; count: number }[]
  eventsCreated: { date: string; count: number }[]
  className?: string
}) {
  const { locale, t } = useLocale()
  const signupPoints: TrendPoint[] = signups.map((d) => ({ label: d.date, value: d.count }))
  const eventPoints: TrendPoint[] = eventsCreated.map((d) => ({ label: d.date, value: d.count }))
  const signupTotal = signups.reduce((sum, d) => sum + d.count, 0)
  const eventTotal = eventsCreated.reduce((sum, d) => sum + d.count, 0)

  return (
    <Panel
      title={t("admin.growth.title")}
      description={t("admin.growth.description")}
      className={className}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <p className="eyebrow text-muted-foreground">{t("admin.growth.signups")}</p>
            <p className="text-xs text-muted-foreground">
              {t("admin.growth.inThirtyDays").replace(
                "%s",
                formatNumber(signupTotal, locale)
              )}
            </p>
          </div>
          <AreaTrend
            points={signupPoints}
            height={148}
            caption={t("admin.growth.accountsCaption")}
            color="var(--chart-1)"
            formatLabel={(label) => formatDate(label, locale, "dayMonth")}
            formatValue={(value) =>
              t("admin.growth.newAccounts").replace("%s", formatNumber(value, locale))
            }
          />
        </div>

        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <p className="eyebrow text-muted-foreground">{t("admin.growth.eventsCreated")}</p>
            <p className="text-xs text-muted-foreground">
              {t("admin.growth.inThirtyDays").replace(
                "%s",
                formatNumber(eventTotal, locale)
              )}
            </p>
          </div>
          <AreaTrend
            points={eventPoints}
            height={148}
            caption={t("admin.growth.eventsCaption")}
            color="var(--chart-4)"
            formatLabel={(label) => formatDate(label, locale, "dayMonth")}
            formatValue={(value) =>
              t("admin.growth.newEvents").replace("%s", formatNumber(value, locale))
            }
          />
        </div>
      </div>
    </Panel>
  )
}

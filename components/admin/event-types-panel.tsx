"use client"

import { Panel } from "@/components/shared/panel"
import { useLocale } from "@/components/providers/locale-provider"
import type { AdminEventType } from "@/lib/admin"
import type { DictKey } from "@/lib/i18n/dictionary"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

const BAR_COLORS = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
]

const EVENT_TYPE_KEYS: Record<AdminEventType, DictKey> = {
  wedding: "admin.eventType.wedding",
  engagement: "admin.eventType.engagement",
  birthday: "admin.eventType.birthday",
  funeral: "admin.eventType.funeral",
  housewarming: "admin.eventType.housewarming",
  graduation: "admin.eventType.graduation",
  baby: "admin.eventType.baby",
  anniversary: "admin.eventType.anniversary",
  corporate: "admin.eventType.corporate",
  other: "admin.eventType.other",
}

/**
 * What people are actually making, ranked. A pie would need a legend to be
 * readable at this many slices; a ranked list reads top to bottom without one,
 * and the long tail past the fifth type is worth naming but not worth a bar.
 */
export function EventTypesPanel({
  types,
}: {
  types: { type: AdminEventType; count: number }[]
}) {
  const { locale, t } = useLocale()
  const total = types.reduce((sum, t) => sum + t.count, 0)
  const top = types.slice(0, 5)
  const restCount = types.slice(5).reduce((sum, t) => sum + t.count, 0)

  return (
    <Panel
      title={t("admin.eventTypes.title")}
      description={t("admin.eventTypes.description").replace("%s", formatNumber(total, locale))}
    >
      <div className="space-y-3.5">
        {total === 0 ? (
          <p className="text-sm text-muted-foreground">{t("admin.eventTypes.empty")}</p>
        ) : (
          <>
            {top.map((row, index) => {
              const pct = total ? Math.round((row.count / total) * 100) : 0
              return (
                <div key={row.type} className="space-y-1">
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <dt className="flex min-w-0 items-center gap-1.5 truncate text-foreground">
                      <span
                        className={cn("size-2 shrink-0 rounded-full", BAR_COLORS[index])}
                        aria-hidden="true"
                      />
                      {t(EVENT_TYPE_KEYS[row.type])}
                    </dt>
                    <dd className="tnum shrink-0 text-muted-foreground">
                      {formatNumber(row.count, locale)} · {pct}%
                    </dd>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-sm bg-muted">
                    <div
                      className={cn("h-full rounded-r-[4px]", BAR_COLORS[index])}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
            {restCount > 0 ? (
              <p className="pt-1 text-xs text-muted-foreground">
                {t("admin.eventTypes.more").replace("%s", formatNumber(restCount, locale))}
              </p>
            ) : null}
          </>
        )}
      </div>
    </Panel>
  )
}

"use client"

import { Panel } from "@/components/shared/panel"
import { SegmentedBar } from "@/components/shared/segmented-bar"
import { useLocale } from "@/components/providers/locale-provider"
import { formatNumber } from "@/lib/format"

/**
 * Every guest reply on the platform, one bar. It answers a different question
 * than the per-event RSVP panel does: not "is this couple's list replying"
 * but "are replies moving at all" — the number an operator would notice
 * flatlining before any one planner would think to complain about it.
 */
export function RepliesPanel({
  funnel,
}: {
  funnel: { pending: number; confirmed: number; declined: number; maybe: number }
}) {
  const { locale, t } = useLocale()
  const total = funnel.pending + funnel.confirmed + funnel.declined + funnel.maybe
  const replied = funnel.confirmed + funnel.declined + funnel.maybe
  const rate = total ? Math.round((replied / total) * 100) : 0

  const segments = [
    { key: "confirmed", label: t("status.confirmed"), value: funnel.confirmed, className: "bg-success" },
    { key: "maybe", label: t("status.maybe"), value: funnel.maybe, className: "bg-warning" },
    {
      key: "declined",
      label: t("status.declined"),
      value: funnel.declined,
      className: "bg-muted-foreground/45",
    },
    {
      key: "pending",
      label: t("status.pending"),
      value: funnel.pending,
      className: "bg-muted-foreground/15",
    },
  ]

  return (
    <Panel
      title={t("admin.replies.title")}
      description={t("admin.replies.description")
        .replace("%s", String(rate))
        .replace("%s", formatNumber(total, locale))}
      bodyClassName="flex flex-1 flex-col justify-center"
    >
      <SegmentedBar segments={segments} total={total} height="h-3" />
    </Panel>
  )
}

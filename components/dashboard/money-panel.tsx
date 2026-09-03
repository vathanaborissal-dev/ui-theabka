"use client"

import { ArrowRight } from "lucide-react"
import { ButtonLink } from "@/components/ui/button-link"
import { useLocale } from "@/components/providers/locale-provider"
import { formatMoney, formatNumber } from "@/lib/format"
import { expenseTotalIn } from "@/lib/summaries"
import type { ExpenseSummary } from "@/lib/budget"
import { cn } from "@/lib/utils"
import type { EventRecord } from "@/lib/types"

/**
 * Gifts against expenses. In Cambodia the cash gifts are genuinely expected to
 * cover much of the wedding cost, so this comparison is the number families
 * actually care about — not a vanity metric.
 */
export function MoneyPanel({
  event,
  giftTotal,
  giftCount,
  costs: costSummary,
}: {
  event: EventRecord
  /** In the event's own currency; the API keeps currencies apart. */
  giftTotal: number
  giftCount: number
  costs: ExpenseSummary
}) {
  const { t, locale } = useLocale()
  // Totalled by the database, not by walking rows in the browser.
  const gifts = { total: giftTotal, count: giftCount }
  const costs = {
    total: expenseTotalIn(costSummary, event.currency, "budgeted"),
    outstanding: expenseTotalIn(costSummary, event.currency, "outstanding"),
  }

  const scale = Math.max(gifts.total, costs.total, 1)
  const balance = gifts.total - costs.total
  const positive = balance >= 0

  return (
    <section className="rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card shadow-(--shadow-card)">
      <header className="flex items-start justify-between gap-3 border-b border-border/70 p-5">
        <div>
          <h2 className="display text-base">{t("dash.giftsVsExpenses")}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {formatNumber(gifts.count, locale)} {t("gifts.givers").toLowerCase()} ·{" "}
            {formatNumber(costSummary.lines, locale)} {t("expenses.title").toLowerCase()}
          </p>
        </div>
        <ButtonLink href={`/events/${event.id}/gifts`} variant="ghost" size="sm">
          {t("nav.gifts")}
          <ArrowRight />
        </ButtonLink>
      </header>

      <div className="space-y-5 p-5">
        <div className="space-y-3">
          <MoneyBar
            label={t("dash.totalGifts")}
            amount={gifts.total}
            currency={event.currency}
            pct={(gifts.total / scale) * 100}
            barClass="bg-success"
          />
          <MoneyBar
            label={t("dash.totalExpenses")}
            amount={costs.total}
            currency={event.currency}
            pct={(costs.total / scale) * 100}
            barClass="bg-primary/70"
            note={`${formatMoney(costs.outstanding, event.currency, locale)} ${t("expenses.outstanding").toLowerCase()}`}
          />
        </div>

        <div className="flex items-baseline justify-between gap-3 border-t border-border/70 pt-4">
          <div>
            <p className="text-sm font-medium">{t("dash.balance")}</p>
            <p className="text-xs text-muted-foreground">
              {positive ? t("dash.surplus") : t("dash.shortfall")}
            </p>
          </div>
          <p
            className={cn(
              "display tnum text-2xl",
              positive ? "text-success" : "text-destructive"
            )}
          >
            {positive ? "+" : "−"}
            {formatMoney(Math.abs(balance), event.currency, locale)}
          </p>
        </div>
      </div>
    </section>
  )
}

function MoneyBar({
  label,
  amount,
  currency,
  pct,
  barClass,
  note,
}: {
  label: string
  amount: number
  currency: EventRecord["currency"]
  pct: number
  barClass: string
  note?: string
}) {
  const { locale } = useLocale()
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="tnum text-sm font-medium">{formatMoney(amount, currency, locale)}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", barClass)} style={{ width: `${pct}%` }} />
      </div>
      {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
    </div>
  )
}

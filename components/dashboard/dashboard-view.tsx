"use client"

import { Coins, Users, UserCheck, Wallet } from "lucide-react"
import { ButtonLink } from "@/components/ui/button-link"
import { StatCard } from "@/components/shared/stat-card"
import { useBudget, useEventData } from "@/components/providers/data-provider"
import { useLocale } from "@/components/providers/locale-provider"
import { formatMoney, formatMoneyCompact, formatNumber } from "@/lib/format"
import { useGuestSummary } from "@/components/guests/use-guest-summary"
import { useResponseTrend } from "@/components/dashboard/use-response-trend"
import { useExpenseSummary } from "@/components/expenses/use-expense-summary"
import { amountIn, giftCountIn, expenseTotalIn } from "@/lib/summaries"
import { EventHero } from "./event-hero"
import { RsvpPanel } from "./rsvp-panel"
import { MoneyPanel } from "./money-panel"
import { NextUpPanel } from "./next-up-panel"
import { ActivityFeed } from "./activity-feed"

export function DashboardView({ eventId }: { eventId: string }) {
  const { event, tasks, activity } = useEventData(eventId)
  // Counted by the database. This screen shows totals, so it has no reason to
  // download several hundred guest rows in order to add them up.
  const { summary } = useGuestSummary(event?.id)
  const { summary: costs } = useExpenseSummary(event?.id)
  const trend = useResponseTrend(event?.id, event?.timezone)
  // Still loaded: the checklist panel lists individual outstanding tasks.
  useBudget(event?.id)
  const { t, locale } = useLocale()

  if (!event) return null

  const giftTotal = amountIn(summary.gifts, event.currency)
  const giftCount = giftCountIn(summary, event.currency)
  const spent = expenseTotalIn(costs, event.currency, "budgeted")
  const balance = giftTotal - spent

  return (
    <div className="space-y-6">
      <EventHero event={event} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard
          label={t("dash.totalGuests")}
          value={formatNumber(summary.invitedSeats, locale)}
          sublabel={`${formatNumber(summary.invited, locale)} ${t("guests.parties").toLowerCase()}`}
          icon={Users}
        />
        <StatCard
          label={t("dash.expectedAttendance")}
          value={formatNumber(summary.expectedSeats, locale)}
          sublabel={`${formatNumber(Math.round((summary.expectedSeats / (summary.invitedSeats || 1)) * 100), locale)}% ${t("dash.ofInvited")}`}
          icon={UserCheck}
        />
        <StatCard
          label={t("dash.totalGifts")}
          value={formatMoneyCompact(giftTotal, event.currency, locale)}
          sublabel={`${formatNumber(giftCount, locale)} ${t("gifts.givers").toLowerCase()}`}
          icon={Coins}
          tone="gold"
        />
        <StatCard
          label={t("dash.balance")}
          value={`${balance >= 0 ? "+" : "−"}${formatMoneyCompact(Math.abs(balance), event.currency, locale)}`}
          sublabel={`${formatMoney(spent, event.currency, locale)} ${t("dash.totalExpenses").toLowerCase()}`}
          icon={Wallet}
          tone={balance >= 0 ? "positive" : "negative"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
        <div className="space-y-4 lg:col-span-2 lg:space-y-5">
          <RsvpPanel event={event} summary={summary} trend={trend} />
          <MoneyPanel event={event} giftTotal={giftTotal} giftCount={giftCount} costs={costs} />
        </div>
        <div className="space-y-4 lg:space-y-5">
          <NextUpPanel event={event} tasks={tasks} />
          <ActivityFeed activity={activity} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--card-radius)] border border-dashed border-border bg-muted/25 p-4">
        <p className="text-sm text-muted-foreground">
          {formatNumber(summary.pending, locale)} {t("guests.count").toLowerCase()}{" "}
          {t("status.pending").toLowerCase()} — {t("planner.dueOn")}{" "}
          {event.design.rsvpDeadline ? event.design.rsvpDeadline : "—"}
        </p>
        <ButtonLink href={`/events/${event.id}/guests?rsvp=pending`} variant="outline" size="sm">
          {t("guests.title")}
        </ButtonLink>
      </div>
    </div>
  )
}

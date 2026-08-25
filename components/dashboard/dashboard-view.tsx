"use client"

import { Coins, Users, UserCheck, Wallet } from "lucide-react"
import { ButtonLink } from "@/components/ui/button-link"
import { StatCard } from "@/components/shared/stat-card"
import { useEventData } from "@/components/providers/data-provider"
import { useLocale } from "@/components/providers/locale-provider"
import { formatMoney, formatMoneyCompact, formatNumber } from "@/lib/format"
import { expenseStats, giftStats, guestStats } from "@/lib/stats"
import { EventHero } from "./event-hero"
import { RsvpPanel } from "./rsvp-panel"
import { MoneyPanel } from "./money-panel"
import { NextUpPanel } from "./next-up-panel"
import { ActivityFeed } from "./activity-feed"

export function DashboardView({ eventId }: { eventId: string }) {
  const { event, guests, expenses, tasks, activity } = useEventData(eventId)
  const { t, locale } = useLocale()

  if (!event) return null

  const gStats = guestStats(guests)
  const gifts = giftStats(guests)
  const costs = expenseStats(expenses)
  const balance = gifts.total - costs.total

  return (
    <div className="space-y-6">
      <EventHero event={event} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard
          label={t("dash.totalGuests")}
          value={formatNumber(gStats.invitedSeats, locale)}
          sublabel={`${formatNumber(gStats.invitations, locale)} ${t("guests.parties").toLowerCase()}`}
          icon={Users}
        />
        <StatCard
          label={t("dash.expectedAttendance")}
          value={formatNumber(gStats.expectedSeats, locale)}
          sublabel={`${formatNumber(Math.round((gStats.expectedSeats / (gStats.invitedSeats || 1)) * 100), locale)}% ${t("dash.ofInvited")}`}
          icon={UserCheck}
        />
        <StatCard
          label={t("dash.totalGifts")}
          value={formatMoneyCompact(gifts.total, event.currency, locale)}
          sublabel={`${formatNumber(gifts.count, locale)} ${t("gifts.givers").toLowerCase()}`}
          icon={Coins}
          tone="gold"
        />
        <StatCard
          label={t("dash.balance")}
          value={`${balance >= 0 ? "+" : "−"}${formatMoneyCompact(Math.abs(balance), event.currency, locale)}`}
          sublabel={`${formatMoney(costs.total, event.currency, locale)} ${t("dash.totalExpenses").toLowerCase()}`}
          icon={Wallet}
          tone={balance >= 0 ? "positive" : "negative"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
        <div className="space-y-4 lg:col-span-2 lg:space-y-5">
          <RsvpPanel event={event} guests={guests} />
          <MoneyPanel event={event} guests={guests} expenses={expenses} />
        </div>
        <div className="space-y-4 lg:space-y-5">
          <NextUpPanel event={event} tasks={tasks} />
          <ActivityFeed activity={activity} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--card-radius)] border border-dashed border-border bg-muted/25 p-4">
        <p className="text-sm text-muted-foreground">
          {formatNumber(gStats.pending, locale)} {t("guests.count").toLowerCase()}{" "}
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

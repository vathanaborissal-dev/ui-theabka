"use client"

import * as React from "react"
import { Coins, Search, Wallet } from "lucide-react"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/page-header"
import { LoadMoreBar } from "@/components/shared/load-more"
import { useLoadMore } from "@/components/shared/use-load-more"
import { EmptyState } from "@/components/shared/empty-state"
import { StatCard } from "@/components/shared/stat-card"
import { Panel } from "@/components/shared/panel"
import { RecordGiftDialog } from "@/components/guests/record-gift-dialog"
import { useEventData } from "@/components/providers/data-provider"
import { useLocale } from "@/components/providers/locale-provider"
import { formatMoney, formatNumber, initials } from "@/lib/format"
import { giftStats } from "@/lib/stats"
import type { Guest } from "@/lib/types"

/** The envelope tiers Cambodian guests actually give in. */
const TIERS = [
  { max: 20, labelKey: "gifts.tier.under" },
  { max: 50, labelKey: "gifts.tier.t50" },
  { max: 100, labelKey: "gifts.tier.t100" },
  { max: 200, labelKey: "gifts.tier.t200" },
  { max: Infinity, labelKey: "gifts.tier.over" },
] as const

export function GiftsView({ eventId }: { eventId: string }) {
  const { event, guests } = useEventData(eventId)
  const { t, L, locale } = useLocale()

  const [query, setQuery] = React.useState("")
  const [giftGuest, setGiftGuest] = React.useState<Guest | undefined>()
  const [open, setOpen] = React.useState(false)

  // Computed above the early return: the pagination hook below cannot run
  // conditionally.
  const withGift = guests
    .filter((g) => g.gift)
    .sort((a, b) => (b.gift?.amount ?? 0) - (a.gift?.amount ?? 0))

  const q = query.trim().toLowerCase()
  const rows = q
    ? withGift.filter(
        (g) => g.name.toLowerCase().includes(q) || (g.family?.toLowerCase().includes(q) ?? false)
      )
    : withGift

  const list = useLoadMore(rows, q)

  if (!event) return null

  const stats = giftStats(guests)

  const distribution = TIERS.map((tier, i) => {
    const min = i === 0 ? 0 : TIERS[i - 1].max
    const count = withGift.filter((g) => {
      const amount = g.gift?.amount ?? 0
      return amount > min && amount <= tier.max
    }).length
    return { ...tier, count }
  })
  const peak = Math.max(...distribution.map((d) => d.count), 1)

  function record(guest: Guest) {
    setGiftGuest(guest)
    setOpen(true)
  }

  const awaiting = guests.filter((g) => g.rsvp === "confirmed" && !g.gift)

  return (
    <div className="space-y-5">
      <PageHeader title={t("gifts.title")} description={t("gifts.subtitle")} />

      {withGift.length === 0 ? (
        <EmptyState
          icon={Coins}
          title={t("gifts.empty.title")}
          description={t("gifts.empty.body")}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            <StatCard
              label={t("gifts.total")}
              value={formatMoney(stats.total, event.currency, locale)}
              icon={Coins}
              tone="gold"
            />
            <StatCard
              label={t("gifts.average")}
              value={formatMoney(Math.round(stats.average), event.currency, locale)}
              sublabel={`${formatNumber(stats.count, locale)} ${t("gifts.givers").toLowerCase()}`}
            />
            <StatCard
              label={t("gifts.largest")}
              value={formatMoney(stats.largest, event.currency, locale)}
            />
            <StatCard
              label={t("gifts.pending")}
              value={formatNumber(stats.awaiting, locale)}
              sublabel={t("status.confirmed").toLowerCase()}
              icon={Wallet}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
            <Panel title={t("gifts.sizes")} className="lg:col-span-2">
              <ul className="space-y-2.5">
                {distribution.map((tier) => (
                  <li key={tier.labelKey} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-sm text-muted-foreground">
                      {t(tier.labelKey)}
                    </span>
                    <span className="h-6 flex-1 overflow-hidden rounded-sm bg-muted">
                      <span
                        className="block h-full rounded-r-[4px] bg-gold/70"
                        style={{ width: `${(tier.count / peak) * 100}%` }}
                      />
                    </span>
                    <span className="tnum w-8 shrink-0 text-right text-sm font-medium">
                      {formatNumber(tier.count, locale)}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title={t("gifts.bySide")}>
              <dl className="space-y-3">
                {(["a", "b", "shared"] as const).map((side) => {
                  const amount = stats.bySide[side]
                  if (amount === 0) return null
                  const label = side === "shared" ? t("side.shared") : L(event.sides[side])
                  return (
                    <div key={side} className="space-y-1.5">
                      <div className="flex items-baseline justify-between gap-2 text-sm">
                        <dt className="truncate text-muted-foreground">{label}</dt>
                        <dd className="tnum font-medium">
                          {formatMoney(amount, event.currency, locale)}
                        </dd>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-sm bg-muted">
                        <div
                          className="h-full rounded-r-[4px] bg-gold"
                          style={{ width: `${(amount / (stats.total || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </dl>
            </Panel>
          </div>

          <div className="overflow-hidden rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card shadow-(--shadow-card)">
            <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
              <div className="relative min-w-0 flex-1 sm:max-w-xs">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("guests.searchPlaceholder")}
                  aria-label={t("action.search")}
                  className="pl-9"
                />
              </div>
              <p className="ml-auto text-xs text-muted-foreground">
                {formatNumber(rows.length, locale)} {t("common.of")}{" "}
                {formatNumber(withGift.length, locale)}
              </p>
            </div>

            <ul className="divide-y divide-border/60">
              {list.items.map((guest) => (
                <li key={guest.id}>
                  <button
                    type="button"
                    onClick={() => record(guest)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors outline-none hover:bg-muted/45 focus-visible:bg-muted/45"
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-[0.6875rem] font-semibold text-muted-foreground"
                    >
                      {initials(guest.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{guest.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {guest.family ?? guest.relationship}
                        {guest.gift?.note ? ` · ${guest.gift.note}` : ""}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="tnum block font-medium">
                        {formatMoney(guest.gift!.amount, guest.gift!.currency, locale)}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {t(`gifts.method.${guest.gift!.method === "item" ? "gift" : guest.gift!.method}`)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <LoadMoreBar state={list} />
          </div>

          {awaiting.length > 0 ? (
            <Panel title={`${t("gifts.pending")} · ${formatNumber(awaiting.length, locale)}`}>
              <p className="mb-3 text-sm text-muted-foreground">{t("gifts.awaitingHelp")}</p>
              <ul className="flex flex-wrap gap-2">
                {awaiting.slice(0, 24).map((guest) => (
                  <li key={guest.id}>
                    <button
                      type="button"
                      onClick={() => record(guest)}
                      className="rounded-full border border-border px-3 py-1.5 text-sm transition-colors outline-none hover:border-primary/40 hover:bg-primary/6 focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      {guest.name}
                    </button>
                  </li>
                ))}
                {awaiting.length > 24 ? (
                  <li className="self-center text-sm text-muted-foreground">
                    +{formatNumber(awaiting.length - 24, locale)}
                  </li>
                ) : null}
              </ul>
            </Panel>
          ) : null}
        </>
      )}

      <RecordGiftDialog
        guest={giftGuest}
        currency={event.currency}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  )
}


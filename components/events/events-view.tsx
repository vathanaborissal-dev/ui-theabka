"use client"

import * as React from "react"
import {
  CalendarPlus,
  ChevronRight,
  Coins,
  Grid2X2,
  List,
  PanelsTopLeft,
  Plus,
  RefreshCw,
  Users,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui/button-link"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Photo } from "@/components/shared/photo"
import { EmptyState } from "@/components/shared/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Brand } from "@/components/app-shell/brand"
import { LanguageToggle, ThemeMenu } from "@/components/app-shell/appearance-menu"
import { useData } from "@/components/providers/data-provider"
import { useLocale } from "@/components/providers/locale-provider"
import { daysUntil, formatDate, formatMoney, formatNumber } from "@/lib/format"
import { giftStats, guestStats } from "@/lib/stats"
import { eventsLayoutStore, type EventsLayout } from "@/lib/ui-preferences"
import { cn } from "@/lib/utils"
import type { EventRecord } from "@/lib/types"

/** Workspace home: every event this account is running. */
export function EventsView() {
  const { events, eventsLoading, eventsError, guests, reloadEvents } = useData()
  const { t, locale } = useLocale()
  const layout = React.useSyncExternalStore(
    eventsLayoutStore.subscribe,
    eventsLayoutStore.getSnapshot,
    eventsLayoutStore.getServerSnapshot
  )

  if (eventsLoading) return <EventsLoading />

  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date))
  const items: EventItem[] = sorted.map((event, index) => {
    // Counts come from the server. The cache is only consulted as a fallback
    // for an event whose guests another screen has already loaded.
    const eventGuests = guests.filter((guest) => guest.eventId === event.id)
    const guestSummary = guestStats(eventGuests)
    const gifts = giftStats(eventGuests)

    return {
      event,
      seed: index + 2,
      invited: event.guestCount ?? guestSummary.invitedSeats,
      confirmed: event.confirmedCount ?? guestSummary.confirmed,
      giftTotal: gifts.total,
      days: daysUntil(event.date),
    }
  })

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Brand />
          <div className="ml-auto flex items-center gap-2">
            <LanguageToggle />
            <ThemeMenu />
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {eventsError ? (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[var(--card-radius)] border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <p>{eventsError}</p>
            <Button variant="outline" size="sm" onClick={() => void reloadEvents()}>
              <RefreshCw />
              Try again
            </Button>
          </div>
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="display text-2xl sm:text-3xl">{t("nav.events")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatNumber(events.length, locale)}{" "}
              {t(events.length === 1 ? "events.countOne" : "events.count")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {sorted.length > 0 ? <EventsLayoutSwitcher value={layout} /> : null}
            <ButtonLink href="/events/new">
              <Plus />
              {t("action.createEvent")}
            </ButtonLink>
          </div>
        </div>

        {sorted.length === 0 ? (
          <EmptyState
            className="mt-8"
            icon={CalendarPlus}
            mascotMotion="waving"
            title={t("events.empty.title")}
            description={t("events.empty.body")}
            action={
              <ButtonLink href="/events/new">
                <Plus />
                {t("action.createEvent")}
              </ButtonLink>
            }
          />
        ) : (
          <EventCollection items={items} layout={layout} />
        )}

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-[var(--card-radius)] border border-dashed border-border bg-muted/25 p-5">
          <div>
            <p className="text-sm font-medium">Running an event for someone else?</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Planner accounts and vendor tools are coming next.
            </p>
          </div>
          <Button variant="outline" size="sm" disabled>
            {t("common.more")}
          </Button>
        </div>
      </main>
    </div>
  )
}

type EventItem = {
  event: EventRecord
  seed: number
  invited: number
  confirmed: number
  giftTotal: number
  days: number
}

function EventsLayoutSwitcher({ value }: { value: EventsLayout }) {
  const { t } = useLocale()
  const layouts: Array<{
    value: EventsLayout
    label: string
    icon: React.ComponentType<{ className?: string }>
  }> = [
    { value: "cards", label: t("events.layout.cards"), icon: PanelsTopLeft },
    { value: "grid", label: t("events.layout.grid"), icon: Grid2X2 },
    { value: "list", label: t("events.layout.list"), icon: List },
  ]

  return (
    <ToggleGroup
      value={[value]}
      onValueChange={(next) => {
        if (next[0]) eventsLayoutStore.set(next[0] as EventsLayout)
      }}
      variant="outline"
      size="sm"
      spacing={0}
      aria-label={t("events.layout.label")}
    >
      {layouts.map(({ value: option, label, icon: Icon }) => (
        <ToggleGroupItem key={option} value={option} aria-label={label} title={label}>
          <Icon aria-hidden="true" />
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

function EventCollection({ items, layout }: { items: EventItem[]; layout: EventsLayout }) {
  if (layout === "list") {
    return (
      <ul className="mt-6 divide-y divide-border/70 overflow-hidden rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card shadow-(--shadow-card)">
        {items.map((item) => (
          <EventListRow key={item.event.id} item={item} />
        ))}
      </ul>
    )
  }

  if (layout === "grid") {
    return (
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <CompactEventCard key={item.event.id} item={item} />
        ))}
      </ul>
    )
  }

  return (
    <ul className="mt-6 grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <EventCard key={item.event.id} item={item} />
      ))}
    </ul>
  )
}

function EventCard({ item }: { item: EventItem }) {
  const { event, seed, invited, confirmed, giftTotal, days } = item
  const { t, L } = useLocale()

  return (
    <li>
      <Link
        href={`/events/${event.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card shadow-(--shadow-card) transition-colors outline-none hover:border-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <div className="relative">
          <Photo
            src={event.coverPhoto}
            alt=""
            seed={seed}
            sizes="(min-width: 1024px) 34rem, 100vw"
            rounded={false}
            className="aspect-[16/7] w-full"
          />
          <EventStatus status={event.status} />
        </div>

        <div className="flex flex-1 flex-col p-4">
          <p className="eyebrow text-muted-foreground">{t(`event.type.${event.type}`)}</p>
          <h2 className="display mt-1.5 text-lg leading-snug text-balance">{L(event.title)}</h2>
          <EventDate event={event} days={days} />
          <EventCounts
            event={event}
            invited={invited}
            confirmed={confirmed}
            giftTotal={giftTotal}
            className="mt-4 border-t border-border/70 pt-3"
          />
        </div>
      </Link>
    </li>
  )
}

function CompactEventCard({ item }: { item: EventItem }) {
  const { event, seed, invited, confirmed, days } = item
  const { t, L } = useLocale()

  return (
    <li>
      <Link
        href={`/events/${event.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card shadow-(--shadow-card) transition-colors outline-none hover:border-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <div className="relative">
          <Photo
            src={event.coverPhoto}
            alt=""
            seed={seed}
            sizes="(min-width: 1024px) 22rem, (min-width: 640px) 50vw, 100vw"
            rounded={false}
            className="aspect-[16/8] w-full"
          />
          <EventStatus status={event.status} compact />
        </div>
        <div className="flex flex-1 flex-col p-3.5">
          <p className="eyebrow text-muted-foreground">{t(`event.type.${event.type}`)}</p>
          <h2 className="mt-1 truncate font-medium">{L(event.title)}</h2>
          <EventDate event={event} days={days} compact />
          <EventCounts
            event={event}
            invited={invited}
            confirmed={confirmed}
            giftTotal={0}
            className="mt-3 border-t border-border/70 pt-2.5"
          />
        </div>
      </Link>
    </li>
  )
}

function EventListRow({ item }: { item: EventItem }) {
  const { event, seed, invited, confirmed, giftTotal, days } = item
  const { t, L } = useLocale()

  return (
    <li>
      <Link
        href={`/events/${event.id}`}
        className="group flex items-center gap-3 p-3 outline-none transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 sm:gap-4"
      >
        <Photo
          src={event.coverPhoto}
          alt=""
          seed={seed}
          sizes="8rem"
          className="size-16 shrink-0 rounded-[var(--btn-radius)] sm:h-20 sm:w-32"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate font-medium">{L(event.title)}</h2>
            <EventStatus status={event.status} inline />
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t(`event.type.${event.type}`)}
          </p>
          <EventDate event={event} days={days} compact />
          <EventCounts
            event={event}
            invited={invited}
            confirmed={confirmed}
            giftTotal={giftTotal}
            className="mt-2"
          />
        </div>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </Link>
    </li>
  )
}

function EventStatus({
  status,
  compact = false,
  inline = false,
}: {
  status: EventRecord["status"]
  compact?: boolean
  inline?: boolean
}) {
  const { t } = useLocale()
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        !inline && "absolute left-3 backdrop-blur",
        !inline && (compact ? "top-2" : "top-3"),
        status === "published"
          ? "bg-success/90 text-white"
          : inline
            ? "bg-muted text-muted-foreground"
            : "bg-background/85 text-muted-foreground"
      )}
    >
      {t(`status.${status}`)}
    </span>
  )
}

function EventDate({
  event,
  days,
  compact = false,
}: {
  event: EventRecord
  days: number
  compact?: boolean
}) {
  const { t, locale } = useLocale()
  return (
    <p className={cn("mt-1 text-muted-foreground", compact ? "text-xs" : "text-sm")}>
      {formatDate(event.date, locale, compact ? "medium" : "long")}
      {days > 0 ? (
        <span className="text-primary">
          {" · "}
          {formatNumber(days, locale)} {t("dash.daysToGo")}
        </span>
      ) : null}
    </p>
  )
}

function EventCounts({
  event,
  invited,
  confirmed,
  giftTotal,
  className,
}: {
  event: EventRecord
  invited: number
  confirmed: number
  giftTotal: number
  className?: string
}) {
  const { t, locale } = useLocale()
  return (
    <dl className={cn("flex flex-wrap gap-x-5 gap-y-1 text-sm", className)}>
      <div className="flex items-center gap-1.5">
        <Users className="size-3.5 text-muted-foreground" aria-hidden="true" />
        <dt className="sr-only">{t("nav.guests")}</dt>
        <dd className="tnum">{formatNumber(invited, locale)}</dd>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground">✓</span>
        <dt className="sr-only">{t("status.confirmed")}</dt>
        <dd className="tnum">{formatNumber(confirmed, locale)}</dd>
      </div>
      {giftTotal > 0 ? (
        <div className="flex items-center gap-1.5">
          <Coins className="size-3.5 text-muted-foreground" aria-hidden="true" />
          <dt className="sr-only">{t("nav.gifts")}</dt>
          <dd className="tnum">{formatMoney(giftTotal, event.currency, locale)}</dd>
        </div>
      ) : null}
    </dl>
  )
}

function EventsLoading() {
  return (
    <div className="min-h-svh bg-background" aria-busy="true" aria-label="Loading events">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-4 sm:px-6">
          <Brand />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-3">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-10 w-36 rounded-[var(--btn-radius)]" />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-64 rounded-[var(--card-radius)]" />
          ))}
        </div>
      </main>
    </div>
  )
}

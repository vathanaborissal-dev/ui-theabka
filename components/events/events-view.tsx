"use client"

import { CalendarPlus, Coins, Plus, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui/button-link"
import { Photo } from "@/components/shared/photo"
import { EmptyState } from "@/components/shared/empty-state"
import { Brand } from "@/components/app-shell/brand"
import { LanguageToggle, ThemeMenu } from "@/components/app-shell/appearance-menu"
import { useData } from "@/components/providers/data-provider"
import { useLocale } from "@/components/providers/locale-provider"
import { daysUntil, formatDate, formatMoney, formatNumber } from "@/lib/format"
import { giftStats, guestStats } from "@/lib/stats"
import { cn } from "@/lib/utils"

/** Workspace home: every event this account is running. */
export function EventsView() {
  const { events, guests } = useData()
  const { t, L, locale } = useLocale()

  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4 sm:px-6">
          <Brand />
          <div className="ml-auto flex items-center gap-2">
            <LanguageToggle />
            <ThemeMenu />
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="display text-2xl sm:text-3xl">{t("nav.events")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatNumber(events.length, locale)} {t("events.count")}
            </p>
          </div>
          <ButtonLink href="/events/new">
            <Plus />
            {t("action.createEvent")}
          </ButtonLink>
        </div>

        {sorted.length === 0 ? (
          <EmptyState
            className="mt-8"
            icon={CalendarPlus}
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
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {sorted.map((event, i) => {
              const eventGuests = guests.filter((g) => g.eventId === event.id)
              const gStats = guestStats(eventGuests)
              const gifts = giftStats(eventGuests)
              const days = daysUntil(event.date)

              return (
                <li key={event.id}>
                  <Link
                    href={`/events/${event.id}`}
                    className="group flex h-full flex-col overflow-hidden rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card shadow-(--shadow-card) transition-colors outline-none hover:border-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <div className="relative">
                      <Photo
                        src={event.coverPhoto}
                        alt=""
                        seed={i + 2}
                        rounded={false}
                        className="aspect-[16/7] w-full"
                      />
                      <span
                        className={cn(
                          "absolute top-3 left-3 rounded-full px-2 py-0.5 text-xs font-medium backdrop-blur",
                          event.status === "published"
                            ? "bg-success/90 text-white"
                            : "bg-background/85 text-muted-foreground"
                        )}
                      >
                        {t(`status.${event.status}`)}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <p className="eyebrow text-muted-foreground">
                        {t(`event.type.${event.type}`)}
                      </p>
                      <h2 className="display mt-1.5 text-lg leading-snug text-balance">
                        {L(event.title)}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatDate(event.date, locale, "long")}
                        {days > 0 ? (
                          <span className="text-primary">
                            {" · "}
                            {formatNumber(days, locale)} {t("dash.daysToGo")}
                          </span>
                        ) : null}
                      </p>

                      <dl className="mt-4 flex gap-5 border-t border-border/70 pt-3 text-sm">
                        <div className="flex items-center gap-1.5">
                          <Users className="size-3.5 text-muted-foreground" aria-hidden="true" />
                          <dt className="sr-only">{t("nav.guests")}</dt>
                          <dd className="tnum">
                            {formatNumber(gStats.invitedSeats, locale)}
                          </dd>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-muted-foreground">✓</span>
                          <dt className="sr-only">{t("status.confirmed")}</dt>
                          <dd className="tnum">{formatNumber(gStats.confirmed, locale)}</dd>
                        </div>
                        {gifts.total > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <Coins className="size-3.5 text-muted-foreground" aria-hidden="true" />
                            <dt className="sr-only">{t("nav.gifts")}</dt>
                            <dd className="tnum">
                              {formatMoney(gifts.total, event.currency, locale)}
                            </dd>
                          </div>
                        ) : null}
                      </dl>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
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

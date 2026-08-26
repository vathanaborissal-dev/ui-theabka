"use client"

import * as React from "react"
import { Check, Minus, Plus, Search, Undo2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { LoadMoreBar } from "@/components/shared/load-more"
import { useLoadMore } from "@/components/shared/use-load-more"
import { useData, useEventData } from "@/components/providers/data-provider"
import { useLocale } from "@/components/providers/locale-provider"
import { formatNumber, initials } from "@/lib/format"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { Guest } from "@/lib/types"

/**
 * Door check-in, for the day itself.
 *
 * Built for one thumb in a noisy hall: search is the whole interface, rows are
 * large, and arriving is a single tap that assumes the party size on the
 * invitation. The head count is only adjusted when it differs, because most of
 * the time it does not — and every action can be undone, since the cost of a
 * mistap at the door is someone being marked absent at their own wedding.
 */
export function CheckInView({ eventId }: { eventId: string }) {
  const { event, guests } = useEventData(eventId)
  const { updateGuest } = useData()
  const { t, locale } = useLocale()
  const [query, setQuery] = React.useState("")

  const arrived = guests.filter((g) => g.attendance === "attended")
  const headCount = arrived.reduce((sum, g) => sum + (g.attendedCount ?? g.partySize), 0)
  const expected = guests
    .filter((g) => g.rsvp === "confirmed" || g.rsvp === "maybe")
    .reduce((sum, g) => sum + g.partySize, 0)

  const needle = query.trim().toLowerCase()
  const digits = needle.replace(/\D/g, "")
  const matches = needle
    ? guests.filter(
        (g) =>
          g.name.toLowerCase().includes(needle) ||
          (g.nameKm ?? "").includes(query.trim()) ||
          (g.family ?? "").toLowerCase().includes(needle) ||
          (digits.length >= 3 && (g.phone ?? "").replace(/\D/g, "").includes(digits))
      )
    : // With no search, surface who is still expected rather than the whole list.
      guests.filter((g) => g.attendance !== "attended" && g.rsvp === "confirmed")

  const list = useLoadMore(matches, query)

  if (!event) return null

  function markArrived(guest: Guest) {
    updateGuest(guest.id, { attendance: "attended", attendedCount: guest.partySize })
    toast.success(`${guest.name} — ${t("checkin.arrived")}`, {
      action: {
        label: t("action.undo"),
        onClick: () => updateGuest(guest.id, { attendance: "unknown", attendedCount: undefined }),
      },
    })
  }

  function adjust(guest: Guest, delta: number) {
    const current = guest.attendedCount ?? guest.partySize
    updateGuest(guest.id, { attendedCount: Math.max(1, current + delta) })
  }

  return (
    <div className="space-y-5">
      <PageHeader title={t("checkin.title")} description={t("checkin.subtitle")} />

      {/* The two numbers anyone at the door is actually asked for. */}
      <section className="flex items-center gap-6 rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card p-5 shadow-(--shadow-card)">
        <div>
          <p className="text-xs text-muted-foreground">{t("checkin.arrivedCount")}</p>
          <p className="display text-3xl leading-none text-success">
            {formatNumber(headCount, locale)}
          </p>
        </div>
        <div className="h-10 w-px bg-border" aria-hidden="true" />
        <div>
          <p className="text-xs text-muted-foreground">{t("checkin.expected")}</p>
          <p className="display text-3xl leading-none">{formatNumber(expected, locale)}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-muted-foreground">{t("checkin.parties")}</p>
          <p className="tnum text-sm font-medium">
            {formatNumber(arrived.length, locale)} / {formatNumber(guests.length, locale)}
          </p>
        </div>
      </section>

      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("checkin.searchPlaceholder")}
          aria-label={t("checkin.searchPlaceholder")}
          autoFocus
          className="h-12 pl-9 text-base"
        />
        {query ? (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setQuery("")}
            aria-label={t("action.clear")}
            className="absolute top-1/2 right-2 -translate-y-1/2"
          >
            <X />
          </Button>
        ) : null}
      </div>

      {matches.length === 0 ? (
        <EmptyState
          icon={Search}
          title={t("checkin.noMatch")}
          description={t("checkin.noMatchHelp")}
        />
      ) : (
        <ul className="overflow-hidden rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card shadow-(--shadow-card)">
          {list.items.map((guest) => {
            const here = guest.attendance === "attended"
            const count = guest.attendedCount ?? guest.partySize
            return (
              <li
                key={guest.id}
                className={cn(
                  "flex items-center gap-3 border-b border-border/60 px-4 py-3 last:border-0",
                  here && "bg-success/6"
                )}
              >
                <span
                  aria-hidden="true"
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground"
                >
                  {initials(guest.name)}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-foreground">{guest.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {guest.family ?? guest.relationship ?? ""}
                    {guest.table ? ` · ${t("guests.field.table")} ${guest.table}` : ""}
                  </span>
                </span>

                {here ? (
                  <div className="flex items-center gap-1">
                    {/* Adjust only when the party that turned up differs. */}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => adjust(guest, -1)}
                      disabled={count <= 1}
                      aria-label={t("checkin.fewer")}
                    >
                      <Minus />
                    </Button>
                    <span className="tnum w-8 text-center text-sm font-medium">
                      {formatNumber(count, locale)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => adjust(guest, 1)}
                      aria-label={t("checkin.more")}
                    >
                      <Plus />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() =>
                        updateGuest(guest.id, { attendance: "unknown", attendedCount: undefined })
                      }
                      aria-label={`${t("action.undo")} — ${guest.name}`}
                    >
                      <Undo2 />
                    </Button>
                  </div>
                ) : (
                  <Button size="lg" onClick={() => markArrived(guest)} className="shrink-0">
                    <Check />
                    {t("checkin.arrive")}
                    <span className="tnum ml-1 opacity-70">
                      {formatNumber(guest.partySize, locale)}
                    </span>
                  </Button>
                )}
              </li>
            )
          })}
          <li>
            <LoadMoreBar state={list} className="border-t-0" />
          </li>
        </ul>
      )}
    </div>
  )
}

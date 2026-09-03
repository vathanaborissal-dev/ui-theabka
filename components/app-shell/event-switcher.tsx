"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Check, ChevronsUpDown, Plus, Search } from "lucide-react"
import { BrandSpinner } from "@/components/brand/brand-spinner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useData } from "@/components/providers/data-provider"
import { useLocale } from "@/components/providers/locale-provider"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { EventRecord } from "@/lib/types"

/** Keep the current event section while replacing only its event identifier. */
export function eventPageHref(pathname: string, eventId: string) {
  const eventRoute = /^\/events\/[^/]+(\/.*)?$/.exec(pathname)
  return `/events/${eventId}${eventRoute?.[1] ?? ""}`
}

export function EventSwitcher({
  current,
  variant = "card",
}: {
  current: EventRecord
  /**
   * "card" is the two-line block used inside the mobile drawer; "bar" is the
   * compact single-line trigger that sits in the top bar.
   */
  variant?: "card" | "bar"
}) {
  const { events } = useData()
  const { t, L, locale } = useLocale()
  const pathname = usePathname()
  const [query, setQuery] = React.useState("")
  /*
   * Which event was just picked.
   *
   * Switching event keeps the same route section, so the page frame does not
   * change and the guest list, budget and photos reload underneath an
   * unchanged-looking screen — from the couple's side the click did nothing
   * for a beat. The menu also closes on click, which takes the row (and any
   * `useLinkStatus` inside it) with it, so the pending state has to be held
   * out here where the trigger can still show it.
   *
   * Derived from the path rather than cleared in an effect, so arriving is
   * what ends it and there is no state to get stuck on a failed navigation.
   */
  const [pickedId, setPickedId] = React.useState<string | null>(null)
  const switching = pickedId && !pathname.startsWith(`/events/${pickedId}`) ? pickedId : null

  const filteredEvents = React.useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase(locale)
    if (!normalizedQuery) return events

    return events.filter((event) => {
      const searchableText = [
        event.title.en,
        event.title.km,
        t(`event.type.${event.type}`),
      ]
        .join(" ")
        .toLocaleLowerCase(locale)

      return searchableText.includes(normalizedQuery)
    })
  }, [events, locale, query, t])

  const trigger =
    variant === "bar" ? (
      <Button
        variant="ghost"
        size="sm"
        aria-label={`${t("nav.events")} — ${L(current.title)}`}
        className="-mx-1 h-8 max-w-[18rem] gap-1.5 px-2"
      >
        <span className="truncate text-sm font-medium text-foreground">{L(current.title)}</span>
        {switching ? (
          <BrandSpinner className="shrink-0 text-primary" label={t("eventSwitcher.switching")} />
        ) : (
          <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
        )}
      </Button>
    ) : (
      <Button
        variant="ghost"
        className="h-auto w-full justify-between gap-2 px-2 py-2 text-left hover:bg-sidebar-accent"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">
            {L(current.title)}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {formatDate(current.date, locale, "medium")}
          </span>
        </span>
        {switching ? (
          <BrandSpinner className="shrink-0 text-primary" label={t("eventSwitcher.switching")} />
        ) : (
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
        )}
      </Button>
    )

  return (
    <DropdownMenu onOpenChange={(open) => !open && setQuery("")}>
      <DropdownMenuTrigger render={trigger} />
      <DropdownMenuContent align="start" className="w-72 overflow-hidden">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("nav.events")}</DropdownMenuLabel>
          <div className="px-1.5 pb-1.5">
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                autoFocus
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape" && query) {
                    event.preventDefault()
                    event.stopPropagation()
                    setQuery("")
                    return
                  }
                  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
                    event.stopPropagation()
                  }
                }}
                placeholder={t("eventSwitcher.search")}
                aria-label={t("eventSwitcher.search")}
                className="h-8 rounded-md pr-2 pl-8"
              />
            </div>
          </div>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <div className="max-h-72 overflow-y-auto">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <DropdownMenuItem
                  key={event.id}
                  render={<Link href={eventPageHref(pathname, event.id)} />}
                  className="items-start gap-2 py-2"
                  onClick={() => setPickedId(event.id)}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{L(event.title)}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {t(`event.type.${event.type}`)} · {formatDate(event.date, locale, "medium")}
                    </span>
                  </span>
                  {switching === event.id ? (
                    <BrandSpinner className="mt-1.5 shrink-0 text-primary" label="" />
                  ) : event.id === current.id ? (
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  ) : (
                    <span
                      className={cn(
                        "mt-1 shrink-0 rounded-full px-1.5 py-0.5 text-[0.625rem] font-medium",
                        event.status === "draft"
                          ? "bg-muted text-muted-foreground"
                          : "bg-success/12 text-success"
                      )}
                    >
                      {t(`status.${event.status}`)}
                    </span>
                  )}
                </DropdownMenuItem>
              ))
            ) : (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground" role="status">
                {t("eventSwitcher.noResults")}
              </p>
            )}
          </div>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/events" />}>{t("nav.allEvents")}</DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/events/new" />}>
          <Plus className="size-4" />
          {t("action.createEvent")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

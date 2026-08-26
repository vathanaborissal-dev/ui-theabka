"use client"

import Link from "next/link"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
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

  const trigger =
    variant === "bar" ? (
      <Button
        variant="ghost"
        size="sm"
        aria-label={`${t("nav.events")} — ${L(current.title)}`}
        className="-mx-1 h-8 max-w-[18rem] gap-1.5 px-2"
      >
        <span className="truncate text-sm font-medium text-foreground">{L(current.title)}</span>
        <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
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
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
      </Button>
    )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={trigger} />
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("nav.events")}</DropdownMenuLabel>
          {events.map((event) => (
          <DropdownMenuItem
            key={event.id}
            render={<Link href={`/events/${event.id}`} />}
            className="items-start gap-2 py-2"
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{L(event.title)}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {t(`event.type.${event.type}`)} · {formatDate(event.date, locale, "medium")}
              </span>
            </span>
            {event.id === current.id ? (
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
          ))}
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

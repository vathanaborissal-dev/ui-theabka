"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { Command as CommandPrimitive } from "cmdk"
import {
  ArrowRight,
  CalendarDays,
  Coins,
  CornerDownLeft,
  ListChecks,
  Moon,
  Plus,
  Receipt,
  Search,
  Sun,
  Users,
} from "lucide-react"
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useCommandPalette, useShortcutLabel } from "@/components/providers/command-palette-provider"
import { useData } from "@/components/providers/data-provider"
import { useLocale } from "@/components/providers/locale-provider"
import { useTheme } from "@/components/providers/theme-provider"
import { RsvpBadge } from "@/components/shared/status-badge"
import { allEventNavItems, eventHref } from "@/lib/nav"
import { formatDate, formatMoney, formatNumber, initials } from "@/lib/format"
import { APP_THEMES } from "@/lib/themes"
import { cn } from "@/lib/utils"

/** Caps each group so one match type cannot crowd out the others. */
const LIMIT = 6

/**
 * Spotlight-style global search.
 *
 * Opened with ⌘K / Ctrl+K anywhere in the app. With no query it offers the
 * places and actions for the event you are currently in; typing searches
 * across guests, events, expenses and tasks at once, because "where was that
 * person" is the question this product gets asked most.
 */
export function CommandPalette() {
  const { open, setOpen } = useCommandPalette()
  const { events, guests, expenses, tasks } = useData()
  const { t, L, locale } = useLocale()
  const { setMode, setTheme, resolvedMode } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const shortcut = useShortcutLabel()

  const [query, setQuery] = React.useState("")

  // Which event the user is currently inside, if any.
  const currentEventId = pathname.match(/^\/events\/([^/]+)/)?.[1]
  const currentEvent =
    events.find((e) => e.id === currentEventId) ?? events.find((e) => e.status === "published")

  // Clearing on close happens in the handler rather than an effect, so the
  // query is never briefly stale on reopen.
  const onOpenChange = React.useCallback(
    (next: boolean) => {
      if (!next) setQuery("")
      setOpen(next)
    },
    [setOpen]
  )

  const run = React.useCallback(
    (action: () => void) => {
      onOpenChange(false)
      action()
    },
    [onOpenChange]
  )

  const go = React.useCallback((href: string) => run(() => router.push(href)), [run, router])

  const q = query.trim().toLowerCase()
  const searching = q.length > 0

  const matchedGuests = React.useMemo(() => {
    if (!searching) return []
    const digits = q.replace(/\D/g, "")
    return guests
      .filter((guest) => {
        if (guest.name.toLowerCase().includes(q)) return true
        if (guest.nameKm?.includes(query.trim())) return true
        if (guest.family?.toLowerCase().includes(q)) return true
        if (digits.length >= 3 && guest.phone?.replace(/\D/g, "").includes(digits)) return true
        return false
      })
      .slice(0, LIMIT)
  }, [guests, q, query, searching])

  const matchedEvents = React.useMemo(() => {
    if (!searching) return events.slice(0, LIMIT)
    return events
      .filter(
        (event) =>
          event.title.en.toLowerCase().includes(q) ||
          event.title.km.includes(query.trim()) ||
          t(`event.type.${event.type}`).toLowerCase().includes(q)
      )
      .slice(0, LIMIT)
  }, [events, q, query, searching, t])

  const matchedExpenses = React.useMemo(() => {
    if (!searching) return []
    return expenses
      .filter(
        (expense) =>
          expense.title.toLowerCase().includes(q) ||
          expense.vendor?.toLowerCase().includes(q) ||
          t(`cat.${expense.category}`).toLowerCase().includes(q)
      )
      .slice(0, LIMIT)
  }, [expenses, q, searching, t])

  const matchedTasks = React.useMemo(() => {
    if (!searching) return []
    return tasks
      .filter((task) => task.title.en.toLowerCase().includes(q) || task.title.km.includes(query.trim()))
      .slice(0, LIMIT)
  }, [tasks, q, query, searching])

  const pages = React.useMemo(() => {
    if (!currentEvent) return []
    return allEventNavItems.filter((item) =>
      searching ? t(item.labelKey).toLowerCase().includes(q) : true
    )
  }, [currentEvent, searching, q, t])

  const eventOf = (eventId: string) => events.find((e) => e.id === eventId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          // Spotlight geometry: high on the screen, wide, and floating well
          // clear of the page rather than centred in it.
          "top-[12vh] w-[calc(100vw-1.5rem)] max-w-2xl sm:max-w-2xl translate-y-0 gap-0 overflow-hidden p-0",
          "rounded-2xl! border-border/70 shadow-2xl shadow-black/25"
        )}
      >
        <DialogTitle className="sr-only">{t("cmd.open")}</DialogTitle>

        <CommandPrimitive
          shouldFilter={false}
          className="flex w-full flex-col overflow-hidden bg-popover text-popover-foreground"
          loop
        >
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <CommandPrimitive.Input
              value={query}
              onValueChange={setQuery}
              placeholder={t("cmd.placeholder")}
              className="h-14 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
            />
            <kbd className="hidden shrink-0 rounded border border-border px-1.5 py-0.5 text-[0.6875rem] text-muted-foreground sm:block">
              esc
            </kbd>
          </div>

          <CommandList className="max-h-[min(24rem,60vh)] p-2">
            <CommandEmpty className="py-10">
              <p className="text-sm font-medium">{t("cmd.noResults")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("cmd.noResultsHint")}</p>
            </CommandEmpty>

            {matchedGuests.length > 0 ? (
              <CommandGroup heading={t("cmd.guests")}>
                {matchedGuests.map((guest) => {
                  const event = eventOf(guest.eventId)
                  return (
                    <CommandItem
                      key={guest.id}
                      value={`guest-${guest.id}`}
                      onSelect={() =>
                        go(
                          `/events/${guest.eventId}/guests?q=${encodeURIComponent(guest.name)}`
                        )
                      }
                      className="gap-3 py-2"
                    >
                      <span
                        aria-hidden="true"
                        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[0.625rem] font-semibold text-muted-foreground"
                      >
                        {initials(guest.name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{guest.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {guest.family ?? guest.relationship}
                          {event ? ` · ${L(event.title)}` : ""}
                        </span>
                      </span>
                      <span className="hidden shrink-0 items-center gap-2 sm:flex">
                        <span className="tnum text-xs text-muted-foreground">
                          {formatNumber(guest.partySize, locale)} {t("cmd.seats")}
                        </span>
                        <RsvpBadge status={guest.rsvp} />
                      </span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ) : null}

            {matchedEvents.length > 0 ? (
              <CommandGroup heading={t("cmd.events")}>
                {matchedEvents.map((event) => (
                  <CommandItem
                    key={event.id}
                    value={`event-${event.id}`}
                    onSelect={() => go(`/events/${event.id}`)}
                    className="gap-3 py-2"
                  >
                    <CalendarDays className="text-muted-foreground" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{L(event.title)}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {t(`event.type.${event.type}`)} · {formatDate(event.date, locale, "medium")}
                      </span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}

            {currentEvent && pages.length > 0 ? (
              <CommandGroup heading={t("cmd.jumpTo")}>
                {pages.map((item) => {
                  const Icon = item.icon
                  return (
                    <CommandItem
                      key={item.segment}
                      value={`page-${item.segment}`}
                      onSelect={() => go(eventHref(currentEvent.id, item.segment))}
                    >
                      <Icon className="text-muted-foreground" />
                      <span className="flex-1">{t(item.labelKey)}</span>
                      <ArrowRight className="opacity-0 group-data-selected/command-item:opacity-60" />
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ) : null}

            {matchedExpenses.length > 0 ? (
              <CommandGroup heading={t("cmd.expenses")}>
                {matchedExpenses.map((expense) => (
                  <CommandItem
                    key={expense.id}
                    value={`expense-${expense.id}`}
                    onSelect={() => go(`/events/${expense.eventId}/expenses`)}
                    className="gap-3"
                  >
                    <Receipt className="text-muted-foreground" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{expense.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {t(`cat.${expense.category}`)}
                        {expense.vendor && expense.vendor !== "—" ? ` · ${expense.vendor}` : ""}
                      </span>
                    </span>
                    <span className="tnum shrink-0 text-xs font-medium">
                      {formatMoney(expense.amount, expense.currency, locale)}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}

            {matchedTasks.length > 0 ? (
              <CommandGroup heading={t("cmd.tasks")}>
                {matchedTasks.map((task) => (
                  <CommandItem
                    key={task.id}
                    value={`task-${task.id}`}
                    onSelect={() => go(`/events/${task.eventId}/planner`)}
                  >
                    <ListChecks className="text-muted-foreground" />
                    <span
                      className={cn("flex-1 truncate", task.done && "text-muted-foreground line-through")}
                    >
                      {L(task.title)}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}

            {currentEvent ? (
              <CommandGroup heading={t("cmd.actions")}>
                <CommandItem
                  value="action-add-guest"
                  onSelect={() => go(`/events/${currentEvent.id}/guests?new=1`)}
                >
                  <Plus className="text-muted-foreground" />
                  <span className="flex-1">{t("action.addGuest")}</span>
                </CommandItem>
                <CommandItem
                  value="action-record-gift"
                  onSelect={() => go(`/events/${currentEvent.id}/gifts`)}
                >
                  <Coins className="text-muted-foreground" />
                  <span className="flex-1">{t("gifts.record")}</span>
                </CommandItem>
                <CommandItem
                  value="action-add-expense"
                  onSelect={() => go(`/events/${currentEvent.id}/expenses?new=1`)}
                >
                  <Receipt className="text-muted-foreground" />
                  <span className="flex-1">{t("expenses.add")}</span>
                </CommandItem>
                <CommandItem
                  value="action-pending"
                  onSelect={() => go(`/events/${currentEvent.id}/guests?rsvp=pending`)}
                >
                  <Users className="text-muted-foreground" />
                  <span className="flex-1">
                    {t("guests.title")} — {t("status.pending")}
                  </span>
                </CommandItem>
                <CommandItem value="action-new-event" onSelect={() => go("/events/new")}>
                  <CalendarDays className="text-muted-foreground" />
                  <span className="flex-1">{t("action.createEvent")}</span>
                </CommandItem>
              </CommandGroup>
            ) : null}

            <CommandGroup heading={t("cmd.appearance")}>
              <CommandItem
                value="appearance-mode"
                onSelect={() => run(() => setMode(resolvedMode === "dark" ? "light" : "dark"))}
              >
                {resolvedMode === "dark" ? (
                  <Sun className="text-muted-foreground" />
                ) : (
                  <Moon className="text-muted-foreground" />
                )}
                <span className="flex-1">
                  {t(resolvedMode === "dark" ? "common.light" : "common.dark")}
                </span>
              </CommandItem>
              {APP_THEMES.map((theme) => (
                <CommandItem
                  key={theme.id}
                  value={`theme-${theme.id}`}
                  onSelect={() => run(() => setTheme(theme.id))}
                >
                  <span className="flex gap-0.5" aria-hidden="true">
                    {theme.swatch.map((color, i) => (
                      <span
                        key={i}
                        className="size-3 rounded-full ring-1 ring-black/10"
                        style={{ background: color }}
                      />
                    ))}
                  </span>
                  <span className="flex-1">{theme.name[locale]}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>

          {/* Keyboard legend, as on the real thing */}
          <div className="flex items-center gap-4 border-t border-border px-4 py-2.5 text-[0.6875rem] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Key>↑</Key>
              <Key>↓</Key>
              {t("cmd.navigate")}
            </span>
            <span className="flex items-center gap-1.5">
              <Key>
                <CornerDownLeft className="size-3" />
              </Key>
              {t("cmd.select")}
            </span>
            <span className="ml-auto hidden items-center gap-1.5 sm:flex">
              <Key>{shortcut}</Key>
            </span>
          </div>
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  )
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1 font-sans text-[0.6875rem]">
      {children}
    </kbd>
  )
}

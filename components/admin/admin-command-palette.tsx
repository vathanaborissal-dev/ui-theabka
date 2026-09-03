"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Command as CommandPrimitive } from "cmdk"
import { CalendarDays, CornerDownLeft, Moon, Search, Sun } from "lucide-react"

import { CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useCommandPalette, useShortcutLabel } from "@/components/providers/command-palette-provider"
import { useTheme } from "@/components/providers/theme-provider"
import { useLocale } from "@/components/providers/locale-provider"
import { formatDate } from "@/lib/format"
import { getAdminAccounts, getAdminEvents, type AdminAccount, type AdminEventRow } from "@/lib/admin"
import { adminNav } from "./admin-shell"
import { cn } from "@/lib/utils"

/**
 * The platform's own spotlight.
 *
 * A separate component from the planner's `CommandPalette` rather than a
 * shared one with branches: that one is built around "the event you are
 * currently in" and searches guests, gifts, expenses — none of which mean
 * anything here. This one searches across accounts, and results are fetched
 * from the same endpoints the Accounts and Events pages use, not duplicated
 * client-side.
 */
export function AdminCommandPalette() {
  const { open, setOpen } = useCommandPalette()
  const { setMode, resolvedMode } = useTheme()
  const { locale, t } = useLocale()
  const router = useRouter()
  const shortcut = useShortcutLabel()

  const [query, setQuery] = React.useState("")
  const [accounts, setAccounts] = React.useState<AdminAccount[]>([])
  const [events, setEvents] = React.useState<AdminEventRow[]>([])
  // The query these results actually answer — compared against the live
  // query below rather than an imperative "loading" flag, the same way
  // `AdminList`'s `busy` state is derived rather than set.
  const [searchedQuery, setSearchedQuery] = React.useState("")

  const onOpenChange = React.useCallback(
    (next: boolean) => {
      if (!next) setQuery("")
      setOpen(next)
    },
    [setOpen]
  )

  // Debounced platform search — the same 250ms as the list pages, so typing
  // here feels like the same product rather than a faster or slower copy.
  React.useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) return

    const timer = setTimeout(async () => {
      try {
        const [accountPage, eventPage] = await Promise.all([
          getAdminAccounts({ query: trimmed, size: 5 }),
          getAdminEvents({ query: trimmed, size: 5 }),
        ])
        setAccounts(accountPage.items)
        setEvents(eventPage.items)
      } catch {
        // A failed search is not worth surfacing in a modal meant to be fast;
        // it just comes back empty, same as a query with no matches.
        setAccounts([])
        setEvents([])
      } finally {
        setSearchedQuery(trimmed)
      }
    }, 250)
    return () => clearTimeout(timer)
  }, [query])

  const go = React.useCallback(
    (href: string) => {
      onOpenChange(false)
      router.push(href)
    },
    [onOpenChange, router]
  )

  const hasQuery = query.trim().length > 0
  const searching = hasQuery && searchedQuery !== query.trim()
  // Stale results from a query that has since been cleared or replaced never
  // reach the screen — gated here rather than reset in the effect above.
  const visibleAccounts = hasQuery && !searching ? accounts : []
  const visibleEvents = hasQuery && !searching ? events : []
  const noResults = hasQuery && !searching && visibleAccounts.length === 0 && visibleEvents.length === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "top-[12vh] w-[calc(100vw-1.5rem)] max-w-2xl translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-2xl",
          "rounded-2xl! border-border/70 shadow-2xl shadow-black/25"
        )}
      >
        <DialogTitle className="sr-only">{t("admin.search.title")}</DialogTitle>

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
              placeholder={t("admin.search.placeholder")}
              className="h-14 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
            />
            <kbd className="hidden shrink-0 rounded border border-border px-1.5 py-0.5 text-[0.6875rem] text-muted-foreground sm:block">
              esc
            </kbd>
          </div>

          <CommandList className="max-h-[min(24rem,60vh)] p-2">
            {noResults ? (
              <CommandEmpty className="py-10">
                <p className="text-sm font-medium">
                  {t("admin.search.noMatch").replace("%s", query.trim())}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("admin.search.tryDifferent")}
                </p>
              </CommandEmpty>
            ) : null}

            {!hasQuery ? (
              <CommandGroup heading={t("admin.search.jumpTo")}>
                {adminNav.map((item) => {
                  const Icon = item.icon
                  return (
                    <CommandItem
                      key={item.href}
                      value={`page-${item.href}`}
                      onSelect={() => go(item.href)}
                    >
                      <Icon className="text-muted-foreground" />
                      <span className="flex-1">{t(item.labelKey)}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ) : null}

            {visibleAccounts.length > 0 ? (
              <CommandGroup heading={t("admin.accounts")}>
                {visibleAccounts.map((account) => (
                  <CommandItem
                    key={account.id}
                    value={`account-${account.id}`}
                    onSelect={() => go(`/admin/accounts?q=${encodeURIComponent(account.email)}`)}
                    className="gap-3 py-2"
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[0.625rem] font-semibold text-muted-foreground"
                    >
                      {initials(account.displayName)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{account.displayName}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {account.email}
                      </span>
                    </span>
                    {account.role === "ADMIN" ? (
                      <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                        {t("admin.accounts.admin")}
                      </span>
                    ) : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}

            {visibleEvents.length > 0 ? (
              <CommandGroup heading={t("admin.events")}>
                {visibleEvents.map((event) => (
                  <CommandItem
                    key={event.id}
                    value={`event-${event.id}`}
                    onSelect={() => go(`/admin/events?q=${encodeURIComponent(event.slug)}`)}
                    className="gap-3 py-2"
                  >
                    <CalendarDays className="text-muted-foreground" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{event.title || event.slug}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {event.ownerEmail} · {formatDate(event.date, locale, "medium")}
                      </span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}

            {!hasQuery ? (
              <CommandGroup heading={t("admin.search.appearance")}>
                <CommandItem
                  value="appearance-mode"
                  onSelect={() => {
                    onOpenChange(false)
                    setMode(resolvedMode === "dark" ? "light" : "dark")
                  }}
                >
                  {resolvedMode === "dark" ? (
                    <Sun className="text-muted-foreground" />
                  ) : (
                    <Moon className="text-muted-foreground" />
                  )}
                  <span className="flex-1">
                    {resolvedMode === "dark"
                      ? t("admin.search.lightMode")
                      : t("admin.search.darkMode")}
                  </span>
                </CommandItem>
              </CommandGroup>
            ) : null}
          </CommandList>

          <div className="flex items-center gap-4 border-t border-border px-4 py-2.5 text-[0.6875rem] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Key>↑</Key>
              <Key>↓</Key>
              {t("admin.search.navigate")}
            </span>
            <span className="flex items-center gap-1.5">
              <Key>
                <CornerDownLeft className="size-3" />
              </Key>
              {t("admin.search.select")}
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

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase()
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1 font-sans text-[0.6875rem]">
      {children}
    </kbd>
  )
}

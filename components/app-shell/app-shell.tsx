"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ExternalLink,
  Menu,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui/button-link"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { useLocale } from "@/components/providers/locale-provider"
import { Brand, BrandMark } from "./brand"
import { SidebarSearch } from "./sidebar-search"
import { useCommandPalette } from "@/components/providers/command-palette-provider"
import { sidebarStore } from "@/lib/ui-preferences"
import { EventSwitcher } from "./event-switcher"
import { LanguageToggle, ThemeMenu } from "./appearance-menu"
import { CommandPalette } from "./command-palette"
import { allEventNavItems, eventFooterNav, eventHref, eventNav } from "@/lib/nav"
import { cn } from "@/lib/utils"
import type { EventRecord } from "@/lib/types"

/**
 * Two-tier chrome:
 *  – desktop: a persistent sidebar scoped to the current event
 *  – phone: a compact top bar plus a five-slot tab bar, because the people
 *    running a Cambodian wedding are on their phone, standing in a hall.
 */
export function AppShell({
  event,
  children,
}: {
  event: EventRecord
  children: React.ReactNode
}) {
  const { t } = useLocale()

  return (
    <div className="flex min-h-svh w-full">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        {t("nav.overview")}
      </a>

      <DesktopSidebar event={event} />

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar event={event} />
        <main
          id="main"
          className="flex-1 px-4 pt-5 pb-28 sm:px-6 lg:px-8 lg:pt-8 lg:pb-12"
        >
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>

      <MobileTabBar event={event} label={t("common.more")} />
      <CommandPalette />
    </div>
  )
}

function useIsActive() {
  const pathname = usePathname()
  return React.useCallback(
    (href: string, exact: boolean) =>
      exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`),
    [pathname]
  )
}

function NavLink({
  href,
  exact,
  icon: Icon,
  label,
  onNavigate,
  collapsed = false,
}: {
  href: string
  exact: boolean
  icon: React.ComponentType<{ className?: string }>
  label: string
  onNavigate?: () => void
  collapsed?: boolean
}) {
  const isActive = useIsActive()
  const active = isActive(href, exact)

  const link = (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? label : undefined}
      className={cn(
        "group flex items-center rounded-[var(--btn-radius)] text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        collapsed ? "size-9 justify-center" : "gap-2.5 px-2.5 py-2",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
      )}
    >
      <Icon
        className={cn(
          "size-4 shrink-0 transition-colors",
          active ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground"
        )}
      />
      {collapsed ? null : <span className="truncate">{label}</span>}
    </Link>
  )

  // Collapsed to icons, the label has to come back on hover or the nav is a
  // guessing game.
  if (!collapsed) return link
  return (
    <Tooltip>
      <TooltipTrigger render={link} />
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

function NavSections({
  event,
  onNavigate,
  collapsed = false,
}: {
  event: EventRecord
  onNavigate?: () => void
  collapsed?: boolean
}) {
  const { t } = useLocale()

  return (
    <nav
      className={cn("flex flex-col gap-5", collapsed && "items-center gap-4")}
      aria-label={t("nav.overview")}
    >
      {eventNav.map((group, i) => (
        <div key={i} className={cn("space-y-1", collapsed && "flex flex-col items-center gap-1")}>
          {group.labelKey ? (
            collapsed ? (
              // A rule stands in for the group heading when there is no room
              // for words, so the grouping survives the collapse.
              <span className="my-1 h-px w-5 bg-sidebar-border" aria-hidden="true" />
            ) : (
              <p className="eyebrow px-2.5 pb-1 text-muted-foreground/70">{t(group.labelKey)}</p>
            )
          ) : null}
          {group.items.map((item) => (
            <NavLink
              key={item.segment}
              href={eventHref(event.id, item.segment)}
              exact={item.segment === ""}
              icon={item.icon}
              label={t(item.labelKey)}
              onNavigate={onNavigate}
              collapsed={collapsed}
            />
          ))}
        </div>
      ))}
    </nav>
  )
}

function DesktopSidebar({ event }: { event: EventRecord }) {
  const { t } = useLocale()
  const collapsed =
    React.useSyncExternalStore(
      sidebarStore.subscribe,
      sidebarStore.getSnapshot,
      sidebarStore.getServerSnapshot
    ) === "collapsed"

  const toggle = () => sidebarStore.set(collapsed ? "expanded" : "collapsed")

  // ⌘B / Ctrl+B is the convention for this, and costs nothing to support.
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b") {
        event.preventDefault()
        sidebarStore.set(
          sidebarStore.getSnapshot() === "collapsed" ? "expanded" : "collapsed"
        )
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const label = t(collapsed ? "sidebar.expand" : "sidebar.collapse")

  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "sticky top-0 hidden h-svh shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-out lg:flex",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div
        className={cn(
          "flex h-14 items-center",
          collapsed ? "justify-center px-2" : "justify-between px-4"
        )}
      >
        {collapsed ? (
          <Link href="/events" aria-label="Theabka" className="outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            <BrandMark />
          </Link>
        ) : (
          <Brand />
        )}
        {collapsed ? null : (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="ghost" size="icon-sm" onClick={toggle} aria-label={label}>
                  <PanelLeftClose />
                </Button>
              }
            />
            <TooltipContent side="right">{label}</TooltipContent>
          </Tooltip>
        )}
      </div>

      {collapsed ? (
        <div className="flex justify-center px-2 pb-1">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="ghost" size="icon-sm" onClick={toggle} aria-label={label}>
                  <PanelLeftOpen />
                </Button>
              }
            />
            <TooltipContent side="right">{label}</TooltipContent>
          </Tooltip>
        </div>
      ) : null}

      <div className={cn(collapsed ? "flex justify-center px-2" : "px-3")}>
        <SidebarSearch collapsed={collapsed} />
      </div>

      {collapsed ? (
        <div className="mt-3 flex justify-center px-2">
          <EventSwitcher current={event} collapsed />
        </div>
      ) : (
        <div className="mt-3 px-3">
          <div className="rounded-[var(--card-radius)] border border-sidebar-border bg-background/60">
            <EventSwitcher current={event} />
          </div>
        </div>
      )}

      <div className={cn("flex-1 overflow-y-auto py-5", collapsed ? "px-2" : "px-3")}>
        <NavSections event={event} collapsed={collapsed} />
      </div>

      <div
        className={cn(
          "space-y-1 border-t border-sidebar-border py-3",
          collapsed ? "flex flex-col items-center px-2" : "px-3"
        )}
      >
        {eventFooterNav.map((item) => (
          <NavLink
            key={item.segment}
            href={eventHref(event.id, item.segment)}
            exact={false}
            icon={item.icon}
            label={t(item.labelKey)}
            collapsed={collapsed}
          />
        ))}

        {collapsed ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <Link
                  href={`/i/${event.slug}`}
                  target="_blank"
                  aria-label={t("inv.openPage")}
                  className="flex size-9 items-center justify-center rounded-[var(--btn-radius)] text-muted-foreground transition-colors outline-none hover:bg-sidebar-accent/60 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <ExternalLink className="size-4" />
                </Link>
              }
            />
            <TooltipContent side="right">{t("inv.openPage")}</TooltipContent>
          </Tooltip>
        ) : (
          <Link
            href={`/i/${event.slug}`}
            target="_blank"
            className="flex items-center gap-2.5 rounded-[var(--btn-radius)] px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors outline-none hover:bg-sidebar-accent/60 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <ExternalLink className="size-4 shrink-0 text-muted-foreground/70" />
            <span className="truncate">{t("inv.openPage")}</span>
          </Link>
        )}

        <Separator className="my-2" />

        {collapsed ? (
          <ThemeMenu align="start" />
        ) : (
          <div className="flex items-center justify-between gap-2 px-1">
            <LanguageToggle />
            <ThemeMenu />
          </div>
        )}
      </div>
    </aside>
  )
}

function MobileTopBar({ event }: { event: EventRecord }) {
  const { t, L } = useLocale()
  const [open, setOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/85 px-4 backdrop-blur-md lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon" aria-label={t("nav.overview")}>
              <Menu />
            </Button>
          }
        />
        <SheetContent side="left" className="w-[17rem] p-0">
          <SheetTitle className="sr-only">{t("nav.overview")}</SheetTitle>
          <div className="flex h-14 items-center px-4">
            <Brand />
          </div>
          <div className="px-3">
            <div className="rounded-[var(--card-radius)] border border-border bg-muted/40">
              <EventSwitcher current={event} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-5">
            <NavSections event={event} onNavigate={() => setOpen(false)} />
            <Separator className="my-4" />
            <div className="space-y-1">
              {eventFooterNav.map((item) => (
                <NavLink
                  key={item.segment}
                  href={eventHref(event.id, item.segment)}
                  exact={false}
                  icon={item.icon}
                  label={t(item.labelKey)}
                  onNavigate={() => setOpen(false)}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <LanguageToggle />
            <ThemeMenu />
          </div>
        </SheetContent>
      </Sheet>

      <p className="min-w-0 flex-1 truncate text-sm font-medium">{L(event.title)}</p>

      <MobileSearchButton />

      <ButtonLink href={`/i/${event.slug}`} target="_blank" variant="ghost" size="icon" aria-label={t("inv.openPage")}>
        <ExternalLink />
      </ButtonLink>
    </header>
  )
}

function MobileSearchButton() {
  const { setOpen } = useCommandPalette()
  const { t } = useLocale()
  return (
    <Button variant="ghost" size="icon" aria-label={t("cmd.open")} onClick={() => setOpen(true)}>
      <Search />
    </Button>
  )
}

function MobileTabBar({ event, label }: { event: EventRecord; label: string }) {
  const isActive = useIsActive()
  const { t } = useLocale()
  const [open, setOpen] = React.useState(false)

  const primary = allEventNavItems.filter((i) => i.primary)
  const overflow = allEventNavItems.filter((i) => !i.primary)

  return (
    <>
      <nav
        aria-label={t("nav.overview")}
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      >
        <div className="mx-auto flex max-w-md items-stretch">
          {primary.map((item) => {
            const href = eventHref(event.id, item.segment)
            const active = isActive(href, item.segment === "")
            const Icon = item.icon
            return (
              <Link
                key={item.segment}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-2.5 text-[0.6875rem] font-medium transition-colors outline-none focus-visible:bg-muted",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="size-5" />
                <span className="max-w-full truncate px-0.5">{t(item.labelKey)}</span>
              </Link>
            )
          })}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <button
                  type="button"
                  className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[0.6875rem] font-medium text-muted-foreground outline-none focus-visible:bg-muted"
                >
                  <MoreHorizontal className="size-5" />
                  <span>{label}</span>
                </button>
              }
            />
            <SheetContent side="bottom" className="rounded-t-[var(--card-radius)] p-4 pb-8">
              <SheetTitle className="mb-3 text-sm">{label}</SheetTitle>
              <div className="grid grid-cols-3 gap-2">
                {overflow.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.segment}
                      href={eventHref(event.id, item.segment)}
                      onClick={() => setOpen(false)}
                      className="flex flex-col items-center gap-2 rounded-[var(--card-radius)] border border-border bg-card px-2 py-4 text-xs font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <Icon className="size-5 text-primary" />
                      <span className="text-center">{t(item.labelKey)}</span>
                    </Link>
                  )
                })}
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <LanguageToggle />
                <ThemeMenu align="end" />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </>
  )
}

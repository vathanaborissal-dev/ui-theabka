"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Camera, CalendarDays, History, LayoutDashboard, Menu, MoreHorizontal, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Brand, BrandMark } from "@/components/app-shell/brand"
import { ProfileMenu } from "@/components/app-shell/profile-menu"
import { SearchTrigger } from "@/components/app-shell/search-trigger"
import { LanguageToggle, ThemeMenu } from "@/components/app-shell/appearance-menu"
import {
  NavLink,
  SidebarToggle,
  useIsActive,
  useSidebarCollapsed,
  useSidebarShortcut,
} from "@/components/app-shell/app-shell"
import { AdminCommandPalette } from "./admin-command-palette"
import { useLocale } from "@/components/providers/locale-provider"
import type { DictKey } from "@/lib/i18n/dictionary"
import { cn } from "@/lib/utils"

/**
 * The operator's chrome, built from the same pieces as the planner's — same
 * sidebar, same collapse behaviour, same search, same nav-link styling —
 * rather than a parallel copy that quietly drifts from it. The only things
 * that actually differ are what a platform has instead of an event: no
 * event to switch between, so no switcher; four sections instead of a
 * scoped nav; and nothing to open publicly, so no page-link button.
 */
export const adminNav = [
  { segment: "", href: "/admin", labelKey: "admin.overview", icon: LayoutDashboard, exact: true },
  { segment: "accounts", href: "/admin/accounts", labelKey: "admin.accounts", icon: Users, exact: false },
  { segment: "events", href: "/admin/events", labelKey: "admin.events", icon: CalendarDays, exact: false },
  { segment: "cameras", href: "/admin/cameras", labelKey: "admin.cameras", icon: Camera, exact: false },
  { segment: "activity", href: "/admin/activity", labelKey: "admin.activity", icon: History, exact: false },
] satisfies { segment: string; href: string; labelKey: DictKey; icon: typeof Users; exact: boolean }[]

export function AdminShell({ children }: { children: React.ReactNode }) {
  useSidebarShortcut()

  return (
    <div className="flex min-h-svh w-full">
      <DesktopSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main id="main" className="flex-1 px-4 pt-6 pb-28 sm:px-6 lg:px-8 lg:pb-12">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>

      <MobileTabBar />
      <AdminCommandPalette />
    </div>
  )
}

/** The current section's name, for the top bar's breadcrumb. */
function useAdminSection() {
  const isActive = useIsActive()
  const { t } = useLocale()
  const key = adminNav.find((item) => isActive(item.href, item.exact))?.labelKey
  return t(key ?? "admin.overview")
}

function NavSections({
  onNavigate,
  collapsed = false,
}: {
  onNavigate?: () => void
  collapsed?: boolean
}) {
  const { t } = useLocale()

  return (
    <nav className={cn("flex flex-col gap-6", collapsed && "items-center gap-4")} aria-label={t("admin.platformNav")}>
      <div className={cn("space-y-1", collapsed && "flex flex-col items-center gap-1")}>
        {adminNav.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            exact={item.exact}
            icon={item.icon}
            label={t(item.labelKey)}
            onNavigate={onNavigate}
            collapsed={collapsed}
          />
        ))}
      </div>
    </nav>
  )
}

function DesktopSidebar() {
  const collapsed = useSidebarCollapsed()
  const { t } = useLocale()

  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "sticky top-0 hidden h-svh shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-out lg:flex",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand, on the same baseline as the top bar beside it. */}
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-sidebar-border",
          collapsed ? "justify-center px-2" : "px-4"
        )}
      >
        {collapsed ? (
          <Link
            href="/admin"
            aria-label="Theabka"
            className="outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <BrandMark />
          </Link>
        ) : (
          <Brand />
        )}
      </div>

      <div className={cn("flex-1 overflow-y-auto py-6", collapsed ? "px-2" : "px-3")}>
        <NavSections collapsed={collapsed} />

        <div
          className={cn(
            "mt-6 space-y-1 border-t border-sidebar-border pt-4",
            collapsed && "flex flex-col items-center"
          )}
        >
          <NavLink href="/events" exact={false} icon={ArrowLeft} label={t("admin.myEvents")} collapsed={collapsed} />
        </div>
      </div>

      {/* The signed-in operator, and the preferences that hang off them. */}
      <div className={cn("shrink-0 border-t border-sidebar-border p-2", collapsed && "flex justify-center")}>
        <ProfileMenu collapsed={collapsed} />
      </div>
    </aside>
  )
}

/**
 * Present at every size. On desktop it carries the breadcrumb and search;
 * on phones it also holds the drawer trigger. Where the planner's top bar
 * ends in a link out to the public invitation, this one just ends — there
 * is no single page for the whole platform to open.
 */
function TopBar() {
  const section = useAdminSection()
  const { t } = useLocale()

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/85 px-4 backdrop-blur-md sm:px-6 lg:px-4">
      <MobileNavSheet />
      <SidebarToggle />

      <nav aria-label={t("admin.breadcrumb")} className="hidden min-w-0 flex-1 items-center gap-1.5 text-sm lg:flex">
        <span className="font-medium">{t("admin.platform")}</span>
        <span aria-hidden="true" className="text-muted-foreground/40">
          /
        </span>
        <span className="truncate text-muted-foreground">{section}</span>
      </nav>

      <p className="min-w-0 flex-1 truncate text-sm font-medium lg:hidden">{section}</p>

      <SearchTrigger className="hidden w-56 lg:flex" />
      <SearchTrigger iconOnly className="lg:hidden" />

      {/*
       * Not in the planner's own top bar — there it lives one level down, in
       * the profile menu's "Appearance" submenu. Placed here instead because
       * the operator area has no per-event public page link to fill this
       * slot, and language/theme are worth surfacing directly for whoever is
       * jumping between the two chrome styles all day.
       */}
      <LanguageToggle className="hidden sm:inline-flex" />
      <ThemeMenu align="end" />
    </header>
  )
}

function MobileNavSheet() {
  const [open, setOpen] = React.useState(false)
  const { t } = useLocale()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" aria-label={t("admin.platformMenu")} className="lg:hidden">
            <Menu />
          </Button>
        }
      />
      <SheetContent side="left" className="flex w-[17rem] flex-col p-0">
        <SheetTitle className="sr-only">{t("admin.platform")}</SheetTitle>
        <div className="flex h-14 shrink-0 items-center border-b border-border px-4">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-6">
          <NavSections onNavigate={() => setOpen(false)} />
          <div className="mt-6 space-y-1 border-t border-border pt-4">
            <NavLink
              href="/events"
              exact={false}
              icon={ArrowLeft}
              label={t("admin.myEvents")}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </div>
        <div className="shrink-0 border-t border-border p-2">
          <ProfileMenu />
        </div>
      </SheetContent>
    </Sheet>
  )
}

function MobileTabBar() {
  const isActive = useIsActive()
  const [open, setOpen] = React.useState(false)
  const { t } = useLocale()

  return (
    <nav
      aria-label={t("admin.platformNav")}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <div className="mx-auto flex max-w-md items-stretch">
        {adminNav.slice(0, 4).map((item) => {
          const active = isActive(item.href, item.exact)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
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
                <span>{t("admin.more")}</span>
              </button>
            }
          />
          <SheetContent side="bottom" className="rounded-t-[var(--card-radius)] p-4 pb-8">
            <SheetTitle className="mb-3 text-sm">{t("admin.more")}</SheetTitle>
            <div className="grid grid-cols-3 gap-2">
              <Link
                href="/admin/activity"
                onClick={() => setOpen(false)}
                className="flex flex-col items-center gap-2 rounded-[var(--card-radius)] border border-border bg-card px-2 py-4 text-xs font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <History className="size-5 text-primary" />
                <span className="text-center">{t("admin.activity")}</span>
              </Link>
              <Link
                href="/events"
                onClick={() => setOpen(false)}
                className="flex flex-col items-center gap-2 rounded-[var(--card-radius)] border border-border bg-card px-2 py-4 text-xs font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <ArrowLeft className="size-5 text-primary" />
                <span className="text-center">{t("admin.myEvents")}</span>
              </Link>
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
  )
}

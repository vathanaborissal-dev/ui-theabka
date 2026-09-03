"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CalendarDays,
  ChevronsUpDown,
  LogOut,
  Palette,
  Plus,
  ShieldCheck,
  UserRound,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useLocale } from "@/components/providers/locale-provider"
import { useAuth } from "@/components/providers/auth-provider"
import { currentAccount, accountInitials } from "@/lib/data/account"
import { LanguageToggle, ThemeMenuItems } from "./appearance-menu"
import { cn } from "@/lib/utils"

function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/12 text-[0.6875rem] font-semibold text-primary",
        className
      )}
    >
      {accountInitials(name)}
    </span>
  )
}

/**
 * The signed-in planner, at the foot of the sidebar — the conventional home
 * for it, and where the preferences that used to be loose in the sidebar
 * (language, theme) now live.
 */
export function ProfileMenu({ collapsed = false }: { collapsed?: boolean }) {
  const { t, locale } = useLocale()
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [signingOut, setSigningOut] = React.useState(false)

  // The signed-in account when there is one. The sample account is only a
  // stand-in for the still-mocked parts of the app, so a real session must
  // always win — otherwise the menu names someone who is not logged in.
  const displayName = user
    ? user.name
    : locale === "km" && currentAccount.nameKm
      ? currentAccount.nameKm
      : currentAccount.name
  const displayEmail = user?.email ?? currentAccount.email
  const canAccessAdmin = user?.role === "ADMIN"

  /**
   * Signing out has to reach the server. Navigating to /login on its own would
   * leave the refresh cookie and its rotation chain alive, so the next visit
   * would silently restore the session the user just ended.
   */
  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut()
    } finally {
      router.push("/login")
    }
  }

  const trigger = collapsed ? (
    <button
      type="button"
      aria-label={`${t("account.label")} — ${displayName}`}
      className="flex size-9 items-center justify-center rounded-[var(--btn-radius)] transition-colors outline-none hover:bg-sidebar-accent focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Avatar name={displayName} />
    </button>
  ) : (
    <button
      type="button"
      aria-label={t("account.label")}
      className="flex w-full items-center gap-2.5 rounded-[var(--btn-radius)] px-2 py-2 text-left transition-colors outline-none hover:bg-sidebar-accent focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Avatar name={displayName} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">{displayName}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {displayEmail}
        </span>
      </span>
      <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
    </button>
  )

  return (
    <DropdownMenu>
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger render={<DropdownMenuTrigger render={trigger} />} />
          <TooltipContent side="right">{displayName}</TooltipContent>
        </Tooltip>
      ) : (
        <DropdownMenuTrigger render={trigger} />
      )}

      <DropdownMenuContent align="start" side="top" className="w-64">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <Avatar name={displayName} className="size-8" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{displayName}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {displayEmail}
            </span>
          </span>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {/* Only an operator has anywhere to go here, and only an operator's
              token is accepted by the endpoint behind it. */}
          {canAccessAdmin ? (
            <DropdownMenuItem render={<Link href="/admin" />}>
              <ShieldCheck />
              {t("admin.dashboard")}
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem render={<Link href="/account" />}>
            <UserRound className="size-4" />
            {t("account.title")}
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/events" />}>
            <CalendarDays className="size-4" />
            {t("nav.allEvents")}
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/events/new" />}>
            <Plus className="size-4" />
            {t("action.createEvent")}
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette className="size-4" />
            {t("common.appearance")}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-64">
            <ThemeMenuItems />
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("common.language")}</DropdownMenuLabel>
          <div className="px-2 pb-1.5">
            <LanguageToggle />
          </div>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem disabled={signingOut} onClick={handleSignOut}>
          <LogOut className="size-4" />
          {t("account.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

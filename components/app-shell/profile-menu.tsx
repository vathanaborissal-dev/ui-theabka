"use client"

import Link from "next/link"
import { CalendarDays, ChevronsUpDown, Palette, Plus } from "lucide-react"
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
import { currentAccount, accountInitials } from "@/lib/data/account"
import { LanguageToggle, ThemeMenuItems } from "./appearance-menu"
import { cn } from "@/lib/utils"

function Avatar({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/12 text-[0.6875rem] font-semibold text-primary",
        className
      )}
    >
      {accountInitials(currentAccount.name)}
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
  const displayName =
    locale === "km" && currentAccount.nameKm ? currentAccount.nameKm : currentAccount.name

  const trigger = collapsed ? (
    <button
      type="button"
      aria-label={`${t("account.label")} — ${displayName}`}
      className="flex size-9 items-center justify-center rounded-[var(--btn-radius)] transition-colors outline-none hover:bg-sidebar-accent focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Avatar />
    </button>
  ) : (
    <button
      type="button"
      aria-label={t("account.label")}
      className="flex w-full items-center gap-2.5 rounded-[var(--btn-radius)] px-2 py-2 text-left transition-colors outline-none hover:bg-sidebar-accent focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Avatar />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">{displayName}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {currentAccount.email}
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
          <Avatar className="size-8" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{displayName}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {currentAccount.email}
            </span>
          </span>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
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
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

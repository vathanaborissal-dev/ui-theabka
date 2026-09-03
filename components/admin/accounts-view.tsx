"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import {MoreHorizontal, Search, ShieldCheck, ShieldOff, UserCheck, UserX} from "lucide-react"
import { BrandSpinner } from "@/components/brand/brand-spinner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PageHeader } from "@/components/shared/page-header"
import { useAuth } from "@/components/providers/auth-provider"
import { useLocale } from "@/components/providers/locale-provider"
import { formatDate, formatNumber } from "@/lib/format"
import type { DictKey } from "@/lib/i18n/dictionary"
import { getAdminAccounts, updateAdminAccount, type AdminAccount } from "@/lib/admin"
import { AdminList, useAdminList } from "./admin-list"

/**
 * Every account on the platform, and the two things an operator can do to one:
 * grant the admin role, or stop it signing in.
 *
 * Both sit behind a confirmation rather than a switch that acts on release.
 * They are the only controls in the product that reach into somebody else's
 * account, and a mis-click on a trackpad is not the standard of proof that
 * should meet "this person can now read every customer's data".
 */
export function AccountsView() {
  const { user } = useAuth()
  const { locale, t } = useLocale()
  // A deep link from the platform search palette arrives as ?q=, seeding the
  // box rather than being applied invisibly — the person can see what they
  // searched for and change it.
  const initialQuery = useSearchParams().get("q") ?? ""
  const list = useAdminList<AdminAccount>(
    React.useCallback((query, page) => getAdminAccounts({ query, page }), []),
    initialQuery
  )
  const [pending, setPending] = React.useState<Action | null>(null)
  const [saving, setSaving] = React.useState(false)

  async function apply(action: Action) {
    setSaving(true)
    try {
      const updated = await updateAdminAccount(action.account.id, action.patch)
      list.replace(updated, (row) => row.id === updated.id)
      toast.success(action.done)
      setPending(null)
    } catch {
      toast.error(t("admin.accounts.actionFailed"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("admin.accounts")}
        description={
          list.meta
            ? t("admin.accounts.descriptionCount").replace(
                "%s",
                formatNumber(list.meta.totalElements, locale)
              )
            : t("admin.accounts.description")
        }
        actions={
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={list.query}
              onChange={(event) => list.setQuery(event.target.value)}
              placeholder={t("admin.accounts.searchPlaceholder")}
              aria-label={t("admin.accounts.searchLabel")}
              className="w-full pl-8 sm:w-64"
            />
          </div>
        }
      />

      <AdminList
        state={list}
        empty={
          list.query
            ? t("admin.accounts.noMatch").replace("%s", list.query)
            : t("admin.accounts.empty")
        }
        columns={[
          t("admin.accounts.columnAccount"),
          t("admin.accounts.columnEvents"),
          t("admin.accounts.columnJoined"),
          "",
        ]}
        row={(account) => {
          const self = account.id === user?.id
          return (
            <>
              <td className="py-3 pr-3">
                <div className="flex min-w-0 flex-col">
                  <span className="flex items-center gap-2 truncate text-sm font-medium">
                    {account.displayName}
                    {account.role === "ADMIN" ? (
                      <Badge variant="secondary" className="gap-1">
                        <ShieldCheck aria-hidden="true" />
                        {t("admin.accounts.admin")}
                      </Badge>
                    ) : null}
                    {!account.enabled ? (
                      <Badge variant="destructive">{t("admin.accounts.suspended")}</Badge>
                    ) : null}
                    {self ? (
                      <span className="text-xs text-muted-foreground">
                        {t("admin.accounts.you")}
                      </span>
                    ) : null}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">{account.email}</span>
                </div>
              </td>
              <td className="py-3 pr-3 text-sm tabular-nums">
                {formatNumber(account.events, locale)}
              </td>
              <td className="py-3 pr-3 text-xs whitespace-nowrap text-muted-foreground">
                {formatDate(account.createdAt, locale, "medium")}
              </td>
              <td className="py-3 text-right">
                {/* An operator cannot change their own role or lock themselves
                    out — the API refuses it, so the menu does not offer it. */}
                {self ? null : (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={t("admin.accounts.actionsFor").replace("%s", account.email)}
                        >
                          <MoreHorizontal />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setPending(roleAction(account, t))}>
                        {account.role === "ADMIN" ? <ShieldOff /> : <ShieldCheck />}
                        {account.role === "ADMIN"
                          ? t("admin.accounts.removeAdmin")
                          : t("admin.accounts.makeAdmin")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant={account.enabled ? "destructive" : undefined}
                        onClick={() => setPending(accessAction(account, t))}
                      >
                        {account.enabled ? <UserX /> : <UserCheck />}
                        {account.enabled
                          ? t("admin.accounts.suspend")
                          : t("admin.accounts.restore")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </td>
            </>
          )
        }}
        keyOf={(account) => account.id}
      />

      <Dialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{pending?.title}</DialogTitle>
            <DialogDescription>{pending?.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPending(null)} disabled={saving}>
              {t("action.cancel")}
            </Button>
            <Button
              variant={pending?.destructive ? "destructive" : "default"}
              disabled={saving}
              onClick={() => pending && void apply(pending)}
            >
              {saving ? <BrandSpinner /> : null}
              {pending?.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

type Action = {
  account: AdminAccount
  patch: { role?: "ADMIN" | "PLANNER"; enabled?: boolean }
  title: string
  description: string
  confirm: string
  done: string
  destructive?: boolean
}

type Translate = (key: DictKey) => string

function roleAction(account: AdminAccount, t: Translate): Action {
  const promoting = account.role !== "ADMIN"
  return {
    account,
    patch: { role: promoting ? "ADMIN" : "PLANNER" },
    title: promoting
      ? t("admin.accounts.makeAdminTitle")
      : t("admin.accounts.removeAdminTitle"),
    description: promoting
      ? t("admin.accounts.makeAdminDescription").replace("%s", account.email)
      : t("admin.accounts.removeAdminDescription").replace("%s", account.email),
    confirm: promoting ? t("admin.accounts.makeAdmin") : t("admin.accounts.removeAdmin"),
    done: promoting ? t("admin.accounts.adminGranted") : t("admin.accounts.adminRemoved"),
    destructive: !promoting,
  }
}

function accessAction(account: AdminAccount, t: Translate): Action {
  const suspending = account.enabled
  return {
    account,
    patch: { enabled: !suspending },
    title: suspending
      ? t("admin.accounts.suspendTitle")
      : t("admin.accounts.restoreTitle"),
    description: suspending
      ? t("admin.accounts.suspendDescription").replace("%s", account.email)
      : t("admin.accounts.restoreDescription").replace("%s", account.email),
    confirm: suspending ? t("admin.accounts.suspend") : t("admin.accounts.restore"),
    done: suspending
      ? t("admin.accounts.accountSuspended")
      : t("admin.accounts.accountRestored"),
    destructive: suspending,
  }
}

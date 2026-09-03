"use client"

import * as React from "react"
import { Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/page-header"
import { useLocale } from "@/components/providers/locale-provider"
import { formatDateTime, formatNumber } from "@/lib/format"
import {
  getAdminActivity,
  type AdminActivity,
} from "@/lib/admin"
import type { DictKey } from "@/lib/i18n/dictionary"
import { AdminList, useAdminList } from "./admin-list"

/** Searchable, server-paged accountability record for sensitive admin work. */
export function ActivityView() {
  const { locale, t } = useLocale()
  const list = useAdminList<AdminActivity>(
    React.useCallback((query, page) => getAdminActivity({ query, page }), [])
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("admin.activity")}
        description={
          list.meta
            ? t("admin.activity.descriptionCount").replace(
                "%s",
                formatNumber(list.meta.totalElements, locale)
              )
            : t("admin.activity.description")
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
              placeholder={t("admin.activity.searchPlaceholder")}
              aria-label={t("admin.activity.searchLabel")}
              className="w-full pl-8 sm:w-64"
            />
          </div>
        }
      />

      <AdminList
        state={list}
        empty={
          list.query
            ? t("admin.activity.noMatch").replace("%s", list.query)
            : t("admin.activity.empty")
        }
        columns={[
          t("admin.activity.columnChange"),
          t("admin.activity.columnAccount"),
          t("admin.activity.columnAdmin"),
          t("admin.activity.columnTime"),
        ]}
        keyOf={(activity) => activity.id}
        row={(activity) => (
          <>
            <td className="py-3 pr-3">
              <Badge
                variant={activity.newValue === "suspended" ? "destructive" : "secondary"}
                className="whitespace-nowrap"
              >
                {activityLabel(activity, t)}
              </Badge>
              <span className="mt-1 block text-xs text-muted-foreground">
                {t("admin.activity.valueChange")
                  .replace("%s", readableValue(activity.previousValue, t))
                  .replace("%s", readableValue(activity.newValue, t))}
              </span>
            </td>
            <td className="py-3 pr-3 text-sm">
              <span className="block max-w-56 truncate">{activity.targetEmail}</span>
            </td>
            <td className="py-3 pr-3 text-sm text-muted-foreground">
              <span className="block max-w-56 truncate">{activity.actorEmail}</span>
            </td>
            <td className="py-3 text-xs whitespace-nowrap tabular-nums text-muted-foreground">
              {formatDateTime(activity.createdAt, locale)}
            </td>
          </>
        )}
      />

      <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
        {t("admin.activity.note")}
      </p>
    </div>
  )
}

type Translate = (key: DictKey) => string

function activityLabel(activity: AdminActivity, t: Translate) {
  if (activity.action === "account_role_changed") {
    return activity.newValue === "admin"
      ? t("admin.activity.adminGranted")
      : t("admin.activity.adminRemoved")
  }
  return activity.newValue === "suspended"
    ? t("admin.activity.accountSuspended")
    : t("admin.activity.accountRestored")
}

function readableValue(value: string, t: Translate) {
  const keys: Record<string, DictKey> = {
    admin: "admin.activity.valueAdmin",
    planner: "admin.activity.valuePlanner",
    enabled: "admin.activity.valueEnabled",
    suspended: "admin.activity.valueSuspended",
  }
  return keys[value.toLowerCase()]
    ? t(keys[value.toLowerCase()])
    : value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

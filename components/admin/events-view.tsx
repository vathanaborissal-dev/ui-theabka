"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Camera, ExternalLink, Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { useLocale } from "@/components/providers/locale-provider"
import { formatDate, formatNumber } from "@/lib/format"
import { getAdminEvents, type AdminEventRow } from "@/lib/admin"
import type { DictKey } from "@/lib/i18n/dictionary"
import { AdminList, useAdminList } from "./admin-list"

const FILTERS = [
  { value: "", labelKey: "admin.events.filterAll" },
  { value: "PUBLISHED", labelKey: "admin.events.filterLive" },
  { value: "DRAFT", labelKey: "admin.events.filterDrafts" },
] satisfies { value: string; labelKey: DictKey }[]

/**
 * Every event on the platform.
 *
 * The link on each row goes to the public invitation, not into the planner's
 * editing screens: an operator needs to see what a guest sees, and reaching
 * the couple's own workspace from here would make an accidental edit to
 * somebody's wedding a single click away.
 */
export function EventsView() {
  const { locale, t } = useLocale()
  const [status, setStatus] = React.useState<string>("")
  const initialQuery = useSearchParams().get("q") ?? ""

  const fetcher = React.useCallback(
    (query: string, page: number) => getAdminEvents({ query, status, page }),
    [status]
  )
  const list = useAdminList<AdminEventRow>(fetcher, initialQuery)

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("admin.events")}
        description={
          list.meta
            ? t("admin.events.descriptionCount").replace(
                "%s",
                formatNumber(list.meta.totalElements, locale)
              )
            : t("admin.events.description")
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
              placeholder={t("admin.events.searchPlaceholder")}
              aria-label={t("admin.events.searchLabel")}
              className="w-full pl-8 sm:w-64"
            />
          </div>
        }
      />

      <div role="group" aria-label={t("admin.events.filterLabel")} className="flex flex-wrap gap-1.5">
        {FILTERS.map((filter) => (
          <Button
            key={filter.value}
            size="sm"
            variant={status === filter.value ? "secondary" : "ghost"}
            aria-pressed={status === filter.value}
            onClick={() => {
              setStatus(filter.value)
              list.setPage(0)
            }}
          >
            {t(filter.labelKey)}
          </Button>
        ))}
      </div>

      <AdminList
        state={list}
        empty={
          list.query
            ? t("admin.events.noMatch").replace("%s", list.query)
            : t("admin.events.empty")
        }
        columns={[
          t("admin.events.columnEvent"),
          t("admin.events.columnOwner"),
          t("admin.events.columnDate"),
          t("admin.events.columnGuests"),
          "",
        ]}
        keyOf={(event) => event.id}
        row={(event) => (
          <>
            <td className="py-3 pr-3">
              <div className="flex min-w-0 flex-col">
                <span className="flex items-center gap-2 truncate text-sm font-medium">
                  {event.title || event.slug}
                  {event.status === "draft" ? (
                    <Badge variant="destructive">{t("admin.overview.draft")}</Badge>
                  ) : null}
                  {event.camera ? (
                    <Camera className="size-3.5 text-muted-foreground" aria-label={t("admin.events.cameraOn")} />
                  ) : null}
                </span>
                <span className="truncate text-xs text-muted-foreground">/i/{event.slug}</span>
              </div>
            </td>
            <td className="py-3 pr-3">
              <span className="block max-w-40 truncate text-sm">{event.ownerName}</span>
              <span className="block max-w-40 truncate text-xs text-muted-foreground">
                {event.ownerEmail}
              </span>
            </td>
            <td className="py-3 pr-3 text-xs whitespace-nowrap tabular-nums">
              {formatDate(event.date, locale, "medium")}
            </td>
            <td className="py-3 pr-3 text-sm tabular-nums">
              {formatNumber(event.confirmed, locale)}/{formatNumber(event.guests, locale)}
            </td>
            <td className="py-3 text-right">
              {/* Only offered where it leads somewhere: an unpublished
                  invitation answers 404 to everyone, operators included. */}
              {event.status === "published" ? (
                <Link
                  href={`/i/${event.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  {t("admin.events.view")}
                  <ExternalLink className="size-3" aria-hidden="true" />
                </Link>
              ) : null}
            </td>
          </>
        )}
      />
    </div>
  )
}

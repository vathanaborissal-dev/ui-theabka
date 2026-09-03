"use client"

import * as React from "react"
import Link from "next/link"
import {
  AlertTriangle,
  Aperture,
  ArrowRight,
  CalendarDays,
  History,
  RefreshCw,
  UserCheck,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MascotMotion } from "@/components/brand/mascot"
import { ButtonLink } from "@/components/ui/button-link"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/shared/page-header"
import { Panel } from "@/components/shared/panel"
import { StatCard } from "@/components/shared/stat-card"
import { useAuth } from "@/components/providers/auth-provider"
import { useLocale } from "@/components/providers/locale-provider"
import { formatDate, formatDateTime, formatNumber } from "@/lib/format"
import { ApiError } from "@/lib/api-client"
import { weekOverWeek } from "@/lib/trend"
import {
  getAdminOverview,
  formatBytes,
  type AdminActivity,
  type AdminOverview,
} from "@/lib/admin"
import type { DictKey } from "@/lib/i18n/dictionary"
import { GrowthPanel } from "./growth-panel"
import { RepliesPanel } from "./replies-panel"
import { EventTypesPanel } from "./event-types-panel"
import { cn } from "@/lib/utils"

/**
 * The operator's page.
 *
 * Chosen for what changes a decision rather than what flatters: which weddings
 * are days away (who to be careful around), what the cameras are storing (what
 * it costs), whether signups and replies are actually moving, and how many
 * invitations are finished but unpublished (people stuck one button from
 * done). Totals are here too, but they are the least useful thing on the
 * screen and are sized accordingly.
 */
export function AdminView() {
  const { user } = useAuth()
  const { locale, t } = useLocale()
  const [data, setData] = React.useState<AdminOverview | null>(null)
  const [state, setState] = React.useState<"loading" | "ready" | "denied" | "failed">("loading")
  const [refreshing, setRefreshing] = React.useState(false)

  const load = React.useCallback(async (background = false) => {
    if (background) setRefreshing(true)
    try {
      const overview = await getAdminOverview()
      setData(overview)
      setState("ready")
    } catch (error) {
      // A planner reaching this URL gets the same answer the API gives: no.
      const denied = error instanceof ApiError && error.status === 403
      setState(denied ? "denied" : "failed")
    } finally {
      setRefreshing(false)
    }
  }, [])

  React.useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        const overview = await getAdminOverview()
        if (!cancelled) {
          setData(overview)
          setState("ready")
        }
      } catch (error) {
        if (cancelled) return
        setState(error instanceof ApiError && error.status === 403 ? "denied" : "failed")
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [])

  if (state === "loading") {
    return <AdminOverviewSkeleton />
  }

  if (state !== "ready" || !data) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <AlertTriangle className="text-muted-foreground mx-auto size-8" aria-hidden="true" />
        <h1 className="display mt-4 text-xl">
          {state === "denied" ? t("admin.notYourPage") : t("admin.couldNotLoad")}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {state === "denied"
            ? t("admin.notAdmin").replace("%s", user?.email ?? "")
            : t("admin.platformLoadFailed")}
        </p>
        {state === "failed" ? (
          <div className="mt-6 flex flex-col items-center gap-4">
            <MascotMotion motion="thinking" size={80} />
            <Button variant="outline" onClick={() => void load()}>
              <RefreshCw />
              {t("action.tryAgain")}
            </Button>
          </div>
        ) : null}
      </div>
    )
  }

  const { accounts, events, guests, cameras } = data
  const replyRate = guests.total ? Math.round((guests.replied / guests.total) * 100) : 0
  // Real comparisons, from the same series the chart below is drawn from —
  // the two figures with a history behind them get a movement pill, and the
  // two without one do not.
  const signupTrend = weekOverWeek(data.signupTrend)
  const eventTrend = weekOverWeek(data.eventTrend)

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("admin.platform")}
        description={t("admin.overview.description")}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => void load(true)}
            disabled={refreshing}
          >
            <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} aria-hidden="true" />
            {t("admin.refresh")}
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard
          label={t("admin.accounts")}
          value={formatNumber(accounts.total, locale)}
          trend={signupTrend}
          sublabel={t("admin.overview.accountsThisWeek").replace(
            "%s",
            formatNumber(accounts.newThisWeek, locale)
          )}
          icon={Users}
        />
        <StatCard
          label={t("admin.events")}
          value={formatNumber(events.total, locale)}
          trend={eventTrend}
          sublabel={t("admin.overview.eventsNextMonth").replace(
            "%s",
            formatNumber(events.upcoming, locale)
          )}
          icon={CalendarDays}
        />
        <StatCard
          label={t("nav.guests")}
          value={formatNumber(guests.total, locale)}
          sublabel={t("admin.overview.guestReplies")
            .replace("%s", String(replyRate))
            .replace("%s", formatNumber(guests.attending, locale))}
          icon={UserCheck}
        />
        <StatCard
          label={t("admin.overview.cameraStorage")}
          value={formatBytes(cameras.bytes)}
          sublabel={t("admin.overview.photosAcrossEvents")
            .replace("%s", formatNumber(cameras.photos, locale))
            .replace("%s", formatNumber(cameras.eventsUsing, locale))}
          icon={Aperture}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
        <GrowthPanel
          signups={data.signupTrend}
          eventsCreated={data.eventTrend}
          className="lg:col-span-2"
        />
        <RepliesPanel funnel={data.guestFunnel} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
        <Panel title={t("admin.overview.health")} description={t("admin.overview.healthDescription")}>
          <dl className="space-y-3 text-sm">
            <Row label={t("admin.overview.publishedInvitations")} value={formatNumber(events.published, locale)} />
            {/*
             * Drafts are the interesting half: an invitation that is finished
             * but unpublished is a couple one button away from being live, and
             * a guest scanning that QR gets a 404.
             */}
            <Row
              label={t("admin.overview.stillDrafts")}
              value={formatNumber(events.draft, locale)}
              tone={events.draft > 0 ? "warn" : undefined}
            />
            <Row label={t("admin.overview.pastEvents")} value={formatNumber(events.past, locale)} />
            <Row
              label={t("admin.overview.accountsWithEvent")}
              value={t("admin.overview.of")
                .replace("%s", formatNumber(accounts.withEvents, locale))
                .replace("%s", formatNumber(accounts.total, locale))}
              tone={
                accounts.total > 3 && accounts.withEvents / accounts.total < 0.5 ? "warn" : undefined
              }
            />
            <Row label={t("admin.overview.seatsConfirmed")} value={formatNumber(guests.attending, locale)} />
          </dl>
        </Panel>

        <EventTypesPanel types={data.eventTypes} />

        <Panel title={t("admin.cameras")} description={t("admin.overview.cameraDescription")}>
          <dl className="space-y-3 text-sm">
            <Row label={t("admin.overview.eventsUsingCamera")} value={formatNumber(cameras.eventsUsing, locale)} />
            <Row label={t("admin.overview.rollsPickedUp")} value={formatNumber(cameras.rolls, locale)} />
            <Row label={t("admin.overview.photosKept")} value={formatNumber(cameras.photos, locale)} />
            <Row label={t("admin.overview.storage")} value={formatBytes(cameras.bytes)} />
            <Row
              label={t("admin.overview.averagePerPhoto")}
              value={cameras.photos ? formatBytes(Math.round(cameras.bytes / cameras.photos)) : t("admin.overview.notAvailable")}
            />
          </dl>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
        <Panel title={t("admin.overview.newAccounts")} description={t("admin.overview.newAccountsDescription")}>
          {data.recentAccounts.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("admin.overview.nobodyYet")}</p>
          ) : (
            <ul className="divide-border/60 divide-y">
              {data.recentAccounts.map((account) => (
                <li key={account.email} className="flex items-center gap-3 py-2">
                  <span
                    aria-hidden="true"
                    className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/12 text-[0.6875rem] font-semibold text-primary"
                  >
                    {initials(account.displayName)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {account.displayName}
                    </span>
                    <span className="text-muted-foreground block truncate text-xs">
                      {account.email}
                    </span>
                  </span>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {account.events === 0
                      ? t("admin.overview.noEvents")
                      : account.events === 1
                        ? t("admin.overview.oneEvent")
                        : t("admin.overview.eventCount").replace(
                            "%s",
                            formatNumber(account.events, locale)
                          )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/*
          * The list worth opening the page for.
          *
          * These weddings happen within the fortnight: for them a fault is not
          * a support ticket, it is someone's morning. A draft in this list is
          * the loudest thing on the screen.
          */}
        <Panel
          title={t("admin.overview.upcoming")}
          description={t("admin.overview.upcomingDescription")}
          className="lg:col-span-2"
        >
          {data.upcoming.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("admin.overview.nothingUpcoming")}</p>
          ) : (
            <ul className="divide-border/60 divide-y">
              {data.upcoming.map((event) => (
                <li key={event.id} className="flex flex-wrap items-center gap-3 py-3">
                  <span
                    className={cn(
                      "h-8 w-1 shrink-0 rounded-full",
                      event.published ? "bg-success/60" : "bg-destructive/60"
                    )}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <Link
                      href={`/i/${event.slug}`}
                      target="_blank"
                      className="block truncate text-sm font-medium hover:underline"
                    >
                      {event.title || event.slug}
                    </Link>
                    <span className="text-muted-foreground block truncate text-xs">
                      {event.ownerEmail} · /i/{event.slug}
                    </span>
                  </span>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {t("admin.overview.guestCount").replace(
                      "%s",
                      formatNumber(event.guests, locale)
                    )}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums">
                    {formatDate(event.date, locale, "long")}
                  </span>
                  <Badge variant={event.published ? "secondary" : "destructive"} className="shrink-0">
                    {event.published
                      ? t("admin.overview.live")
                      : t("admin.overview.draft")}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel
        title={t("admin.overview.recentActivity")}
        description={t("admin.overview.recentActivityDescription")}
        action={
          <ButtonLink variant="ghost" size="sm" href="/admin/activity">
            {t("action.viewAll")}
            <ArrowRight aria-hidden="true" />
          </ButtonLink>
        }
      >
        {data.recentActivity.length === 0 ? (
          <div className="flex items-start gap-3 py-1">
            <History className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium">{t("admin.overview.noSensitiveChanges")}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("admin.overview.changesAppearHere")}
              </p>
            </div>
          </div>
        ) : (
          <ul className="grid gap-x-8 md:grid-cols-2">
            {data.recentActivity.map((activity) => (
              <li key={activity.id} className="flex items-start gap-3 border-b border-border/60 py-3 last:border-0 md:[&:nth-last-child(-n+2)]:border-0">
                <History className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{activityLabel(activity, t)}</span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {t("admin.overview.activityBy")
                      .replace("%s", activity.targetEmail)
                      .replace("%s", activity.actorEmail)}
                  </span>
                </span>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {formatDateTime(activity.createdAt, locale)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase()
}

function AdminOverviewSkeleton() {
  const { t } = useLocale()

  return (
    <div className="space-y-6" role="status" aria-label={t("admin.loadingOverview")}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-4 rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card p-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
        <Skeleton className="h-72 rounded-[var(--card-radius)] lg:col-span-2" />
        <Skeleton className="h-72 rounded-[var(--card-radius)]" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-56 rounded-[var(--card-radius)]" />
        ))}
      </div>
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

function Row({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: "warn"
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("font-medium tabular-nums", tone === "warn" && "text-destructive")}>
        {value}
      </dd>
    </div>
  )
}

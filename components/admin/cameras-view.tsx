"use client"

import * as React from "react"
import { Aperture, Film, HardDrive } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MascotMotion } from "@/components/brand/mascot"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { useLocale } from "@/components/providers/locale-provider"
import { formatDate, formatNumber } from "@/lib/format"
import { formatBytes, getAdminCameras, type AdminCameraRow } from "@/lib/admin"
import { DataTableSkeleton } from "@/components/shared/data-list-skeleton"

/**
 * Where the storage bill actually comes from.
 *
 * Ordered by weight rather than by date, because the question this page exists
 * to answer is "what is costing us", and the answer is nearly always a handful
 * of events at the top rather than the long tail underneath them. The bar
 * under each byte count is relative to the heaviest row here, not to the
 * platform total — the point is to see which of these fifty is the outlier.
 */
export function CamerasView() {
  const { locale, t } = useLocale()
  const [rows, setRows] = React.useState<AdminCameraRow[] | null>(null)
  const [failed, setFailed] = React.useState(false)
  const [attempt, setAttempt] = React.useState(0)

  React.useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        const loaded = await getAdminCameras(50)
        if (!cancelled) setRows(loaded)
      } catch {
        if (!cancelled) setFailed(true)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [attempt])

  const totalBytes = rows?.reduce((sum, row) => sum + row.bytes, 0) ?? 0
  const totalPhotos = rows?.reduce((sum, row) => sum + row.photos, 0) ?? 0
  const totalRolls = rows?.reduce((sum, row) => sum + row.rolls, 0) ?? 0
  const maxBytes = rows?.reduce((max, row) => Math.max(max, row.bytes), 0) ?? 0

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("admin.cameras")}
        description={t("admin.cameras.description")}
      />

      {rows && rows.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <StatCard label={t("admin.cameras.inUse")} value={formatNumber(rows.length, locale)} icon={Aperture} />
          <StatCard label={t("admin.overview.rollsPickedUp")} value={formatNumber(totalRolls, locale)} icon={Film} />
          <StatCard
            label={t("admin.overview.photosKept")}
            value={formatNumber(totalPhotos, locale)}
            sublabel={
              totalPhotos
                ? t("admin.cameras.average").replace(
                    "%s",
                    formatBytes(Math.round(totalBytes / totalPhotos))
                  )
                : t("admin.cameras.noPhotos")
            }
          />
          <StatCard label={t("admin.overview.storage")} value={formatBytes(totalBytes)} icon={HardDrive} />
        </div>
      ) : null}

      {failed ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card text-center">
          <MascotMotion motion="thinking" size={72} />
          <p className="text-sm text-muted-foreground">{t("admin.listFailed")}</p>
          <Button variant="outline" size="sm" onClick={() => setAttempt((n) => n + 1)}>
            {t("action.tryAgain")}
          </Button>
        </div>
      ) : rows === null ? (
        <div
          className="overflow-hidden rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card"
          role="status"
          aria-label={t("admin.loadingCameraStorage")}
        >
          <DataTableSkeleton
            columns={[
              { width: "36%", secondary: true },
              { width: "16%" },
              { width: "12%" },
              { width: "18%", secondary: true },
              { width: "18%" },
            ]}
            rows={6}
            minWidth="42rem"
          />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card px-5 py-12 text-center text-sm text-muted-foreground">
          {t("admin.cameras.empty")}
        </div>
      ) : (
        <div className="overflow-hidden rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card shadow-(--shadow-card)">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[42rem] text-left">
              <thead>
                <tr className="border-b border-border/70">
                  {[
                    t("admin.cameras.columnEvent"),
                    t("admin.cameras.columnRolls"),
                    t("admin.cameras.columnPhotos"),
                    t("admin.cameras.columnStorage"),
                    t("admin.cameras.columnReveal"),
                  ].map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className="px-3 py-2.5 text-xs font-medium text-muted-foreground first:pl-5 last:pr-5"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {rows.map((row) => (
                  <tr
                    key={row.eventId}
                    className="[&>td:first-child]:pl-5 [&>td:last-child]:pr-5"
                  >
                    <td className="py-3 pr-3">
                      <div className="flex min-w-0 flex-col">
                        <span className="flex items-center gap-2 truncate text-sm font-medium">
                          {row.title || row.slug}
                          {/* A camera switched off still holds everything it
                              collected — worth seeing, since it is the one row
                              where the storage is definitely not growing. */}
                          {row.enabled ? null : (
                            <Badge variant="outline">{t("admin.cameras.off")}</Badge>
                          )}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {row.ownerEmail} · {formatDate(row.eventDate, locale, "medium")}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-3 text-sm tabular-nums">
                      {formatNumber(row.rolls, locale)}
                    </td>
                    <td className="py-3 pr-3 text-sm tabular-nums">
                      {formatNumber(row.photos, locale)}
                    </td>
                    <td className="py-3 pr-3">
                      <div className="w-28 space-y-1">
                        <span className="tnum block text-sm">{formatBytes(row.bytes)}</span>
                        <div className="h-1 w-full overflow-hidden rounded-sm bg-muted">
                          <div
                            className="h-full rounded-r-[2px] bg-chart-1"
                            style={{ width: `${maxBytes ? (row.bytes / maxBytes) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-xs whitespace-nowrap text-muted-foreground">
                      {row.revealAt
                        ? formatDate(row.revealAt, locale, "medium")
                        : t("admin.cameras.notSet")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import * as React from "react"
import {
  Check,
  Download,
  MoreHorizontal,
  Upload,
  Plus,
  UserRoundCheck,
  Users,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Pagination } from "@/components/shared/pagination"
import { SegmentedBar } from "@/components/shared/segmented-bar"
import { useData, useEventData } from "@/components/providers/data-provider"
import { useLocale } from "@/components/providers/locale-provider"
import { formatNumber } from "@/lib/format"
import { downloadCsv, toCsv } from "@/lib/csv"
import { toast } from "sonner"
import { GuestTable } from "./guest-table"
import { GuestCards } from "./guest-cards"
import { GuestFormSheet } from "./guest-form-sheet"
import { RecordGiftDialog } from "./record-gift-dialog"
import { groupGuests, type GroupBy } from "./use-guest-filters"
import { GuestFilterBar } from "./guest-filter-bar"
import { ImportGuestsSheet } from "./import-guests-sheet"
import { GuestListSkeleton, GuestSummarySkeleton } from "./guests-loading"
import { useGuestPage } from "./use-guest-page"
import { useGuestSummary } from "./use-guest-summary"
import type { Guest, RsvpStatus } from "@/lib/types"

export function GuestsView({
  eventId,
  initialRsvp,
  initialQuery,
  openNew = false,
}: {
  eventId: string
  initialRsvp?: RsvpStatus
  /** Pre-filled search, used when arriving from the command palette. */
  initialQuery?: string
  /** Opens the add-guest sheet straight away. */
  openNew?: boolean
}) {
  const { event } = useEventData(eventId)
  const { updateGuests, removeGuests, importGuests } = useData()
  const { t, L, locale } = useLocale()

  // Filtering, sorting and paging all happen in the database. The browser
  // holds one page, not the whole list.
  const {
    pager,
    guests,
    loading: guestsLoading,
    filters,
    setFilters,
    reset,
    reload: reloadGuests,
    fetchAllMatching,
  } = useGuestPage(event?.id, {
    ...(initialRsvp ? { rsvp: initialRsvp } : {}),
    ...(initialQuery ? { query: initialQuery } : {}),
  })
  const [groupBy, setGroupBy] = React.useState<GroupBy>("none")
  const families = React.useMemo(() => {
    const set = new Set<string>()
    for (const g of guests) if (g.family) set.add(g.family)
    return [...set].sort()
  }, [guests])

  const [summaryToken, setSummaryToken] = React.useState(0)
  const [exporting, setExporting] = React.useState(false)
  const [importOpen, setImportOpen] = React.useState(false)
  // Counted in the database: the browser holds one page, so counting what is
  // on screen would report the page, not the guest list.
  const { summary, loading: summaryLoading } = useGuestSummary(event?.id, summaryToken)
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [editing, setEditing] = React.useState<Guest | undefined>()
  const [formOpen, setFormOpen] = React.useState(openNew)
  const [giftGuest, setGiftGuest] = React.useState<Guest | undefined>()
  const [giftOpen, setGiftOpen] = React.useState(false)

  if (!event) return null

  // Select-all covers the rows actually on screen; quietly selecting a hundred
  // off-page guests would make the bulk actions dangerous.
  const visibleIds = pager.items.map((g) => g.id)
  const selectedVisible = visibleIds.filter((id) => selected.has(id))
  const allSelected = visibleIds.length > 0 && selectedVisible.length === visibleIds.length
  const someSelected = selectedVisible.length > 0

  const groups = groupGuests(pager.items, groupBy, {
    sides: { a: L(event.sides.a), b: L(event.sides.b), shared: t("side.shared") },
    rsvp: {
      confirmed: t("status.confirmed"),
      declined: t("status.declined"),
      pending: t("status.pending"),
      maybe: t("status.maybe"),
    },
    noFamily: t("common.none"),
  })

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allSelected) visibleIds.forEach((id) => next.delete(id))
      else visibleIds.forEach((id) => next.add(id))
      return next
    })
  }

  function openEdit(guest?: Guest) {
    setEditing(guest)
    setFormOpen(true)
  }

  function openGift(guest: Guest) {
    setGiftGuest(guest)
    setGiftOpen(true)
  }

  /**
   * Re-reads the page and the counts after an edit.
   *
   * The rows on screen came from the server, and a change may move a guest out
   * of the current filter entirely — marking someone confirmed while filtering
   * on "pending" should drop them from the list, not leave a stale row behind.
   */
  function refresh() {
    reloadGuests()
    setSummaryToken((token) => token + 1)
  }

  /**
   * Reports success only once the server has accepted it.
   *
   * The toast used to fire immediately, which is how a silent no-op went
   * unnoticed: every edit looked like it had saved whether or not a request
   * was ever sent.
   */
  function bulk(patch: Partial<Guest>, message: string) {
    if (!event) return
    const count = selectedVisible.length
    void updateGuests(event.id, selectedVisible, patch)
      .then(() => {
        refresh()
        toast.success(`${count} ${message}`)
      })
      .catch(() => toast.error("That could not be saved. Please try again."))
    setSelected(new Set())
  }

  const segments = [
    { key: "confirmed", label: t("status.confirmed"), value: summary.confirmed, className: "bg-success" },
    { key: "maybe", label: t("status.maybe"), value: summary.maybe, className: "bg-warning" },
    { key: "declined", label: t("status.declined"), value: summary.declined, className: "bg-muted-foreground/45" },
    { key: "pending", label: t("status.pending"), value: summary.pending, className: "bg-muted-foreground/15" },
  ]

  /** Exports the filtered list, so the file matches what is on screen. */
  async function exportVisible() {
    if (exporting) return
    setExporting(true)
    // The whole filtered set, not the page on screen.
    const rows = await fetchAllMatching().catch(() => null)
    setExporting(false)
    if (!rows) {
      toast.error("The guest list could not be exported. Please try again.")
      return
    }
    if (!event) return
    const csv = toCsv(
      [
        t("guests.field.name"),
        t("guests.field.nameKm"),
        t("guests.field.family"),
        t("side.label"),
        t("guests.field.relationship"),
        t("guests.field.partySize"),
        t("guests.field.rsvp"),
        t("guests.field.table"),
        t("guests.field.phone"),
        t("guests.field.gift"),
        t("guests.field.notes"),
      ],
      rows.map((guest) => [
        guest.name,
        guest.nameKm,
        guest.family,
        guest.side === "shared" ? t("side.shared") : L(event.sides[guest.side]),
        guest.relationship,
        guest.partySize,
        t(`status.${guest.rsvp}` as Parameters<typeof t>[0]),
        guest.table,
        guest.phone,
        guest.gift?.amount,
        guest.notes,
      ])
    )
    downloadCsv(`${event.slug}-guests.csv`, csv)
    toast.success(`${formatNumber(rows.length, locale)} ${t("guests.parties").toLowerCase()}`)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("guests.title")}
        description={t("guests.subtitle")}
        actions={
          <>
            {/* Import and export are occasional; adding a guest is the reason
                people open this page. On a narrow screen the two rarer ones
                fold into a menu rather than pushing the primary action onto a
                second row. */}
            <div className="hidden gap-2 sm:flex">
              <Button variant="outline" onClick={() => setImportOpen(true)}>
                <Upload />
                {t("guests.importAction")}
              </Button>
              <Button
                variant="outline"
                onClick={() => void exportVisible()}
                disabled={exporting || summary.invited === 0}
              >
                <Download />
                {t("action.export")}
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" size="icon" className="sm:hidden" aria-label={t("common.more")}>
                    <MoreHorizontal />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setImportOpen(true)}>
                  <Upload />
                  {t("guests.importAction")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={exporting || summary.invited === 0}
                  onClick={() => void exportVisible()}
                >
                  <Download />
                  {t("action.export")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={() => openEdit(undefined)}>
              <Plus />
              {t("action.addGuest")}
            </Button>
          </>
        }
      />

      <section className="grid gap-4 rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card p-5 shadow-(--shadow-card) sm:grid-cols-[auto_1fr] sm:gap-8">
        {summaryLoading ? (
          <GuestSummarySkeleton />
        ) : (
          <>
            <dl className="flex gap-6">
              <div>
                <dt className="text-xs text-muted-foreground">{t("guests.parties")}</dt>
                <dd className="display tnum text-2xl">{formatNumber(summary.invited, locale)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t("dash.expectedAttendance")}</dt>
                <dd className="display tnum text-2xl text-primary">
                  {formatNumber(summary.expectedSeats, locale)}
                </dd>
              </div>
            </dl>
            <SegmentedBar segments={segments} total={summary.invited} className="self-center" />
          </>
        )}
      </section>

      <div className="overflow-hidden rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card shadow-(--shadow-card)">
        <GuestFilterBar
          filters={filters}
          setFilters={setFilters}
          groupBy={groupBy}
          setGroupBy={setGroupBy}
          families={families}
          sides={{ a: L(event.sides.a), b: L(event.sides.b) }}
          shown={pager.total}
          total={summary.invited}
        />


        {guestsLoading ? (
          <GuestListSkeleton />
        ) : guests.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={Users}
              mascotMotion={guests.length === 0 ? "waving" : undefined}
              title={t(guests.length === 0 ? "guests.empty.title" : "guests.noResults.title")}
              description={t(guests.length === 0 ? "guests.empty.body" : "guests.noResults.body")}
              action={
                guests.length === 0 ? (
                  <Button onClick={() => openEdit(undefined)}>
                    <Plus />
                    {t("action.addGuest")}
                  </Button>
                ) : (
                  <Button variant="outline" onClick={reset}>
                    {t("action.clearFilters")}
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <GuestTable
                event={event}
                groups={groups}
                selected={selected}
                onToggle={toggle}
                onToggleAll={toggleAll}
                allSelected={allSelected}
                someSelected={someSelected}
                onEdit={openEdit}
                onRecordGift={openGift}
              />
            </div>
            <div className="md:hidden">
              <GuestCards
                event={event}
                groups={groups}
                selected={selected}
                onToggle={toggle}
                onEdit={openEdit}
                onRecordGift={openGift}
              />
            </div>
            <Pagination state={pager} />
          </>
        )}
      </div>

      <BulkBar
        count={selectedVisible.length}
        onClear={() => setSelected(new Set())}
        onConfirm={() =>
          bulk({ rsvp: "confirmed", respondedAt: new Date().toISOString() }, t("status.confirmed").toLowerCase())
        }
        onCheckIn={() => bulk({ attendance: "attended" }, t("status.attended").toLowerCase())}
        onDelete={() => {
          const count = selectedVisible.length
          void removeGuests(event.id, selectedVisible)
            .then(() => {
              refresh()
              toast.success(`${count} removed`)
            })
            .catch(() => toast.error("Those could not be removed. Please try again."))
          setSelected(new Set())
        }}
      />

      <ImportGuestsSheet
        open={importOpen}
        onOpenChange={setImportOpen}
        onImport={async (incoming) => {
          const created = await importGuests(event.id, incoming)
          refresh()
          return created.length
        }}
      />

      <GuestFormSheet
        event={event}
        guest={editing}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          // Closing means it either saved or was cancelled; re-reading covers
          // both without the sheet having to report which.
          if (!open) refresh()
        }}
      />
      <RecordGiftDialog
        guest={giftGuest}
        currency={event.currency}
        open={giftOpen}
        onOpenChange={setGiftOpen}
      />
    </div>
  )
}

/** Floating action bar — sits above the phone tab bar when rows are selected. */
function BulkBar({
  count,
  onClear,
  onConfirm,
  onCheckIn,
  onDelete,
}: {
  count: number
  onClear: () => void
  onConfirm: () => void
  onCheckIn: () => void
  onDelete: () => void
}) {
  const { t, locale } = useLocale()
  if (count === 0) return null

  return (
    <div
      role="status"
      className="fixed inset-x-3 bottom-20 z-40 mx-auto flex max-w-2xl flex-wrap items-center gap-2 rounded-[var(--card-radius)] border border-border bg-popover p-2.5 shadow-lg lg:bottom-6"
    >
      <p className="px-1.5 text-sm font-medium">
        {formatNumber(count, locale)} {t("guests.selected")}
      </p>
      <div className="ml-auto flex flex-wrap gap-1.5">
        <Button size="sm" variant="outline" onClick={onConfirm}>
          <Check />
          {t("status.confirmed")}
        </Button>
        <Button size="sm" variant="outline" onClick={onCheckIn}>
          <UserRoundCheck />
          {t("guests.bulkCheckIn")}
        </Button>
        <Button size="sm" variant="destructive" onClick={onDelete}>
          {t("action.delete")}
        </Button>
        <Button size="icon-sm" variant="ghost" onClick={onClear} aria-label={t("action.close")}>
          <X />
        </Button>
      </div>
    </div>
  )
}

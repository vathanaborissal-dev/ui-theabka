"use client"

import * as React from "react"
import {
  Check,
  Download,
  Plus,
  Search,
  SlidersHorizontal,
  UserRoundCheck,
  Users,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { SegmentedBar } from "@/components/shared/segmented-bar"
import { useData, useEventData } from "@/components/providers/data-provider"
import { useLocale } from "@/components/providers/locale-provider"
import { formatNumber } from "@/lib/format"
import { downloadCsv, toCsv } from "@/lib/csv"
import { guestStats } from "@/lib/stats"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { GuestTable } from "./guest-table"
import { GuestCards } from "./guest-cards"
import { GuestFormSheet } from "./guest-form-sheet"
import { RecordGiftDialog } from "./record-gift-dialog"
import { groupGuests, useGuestFilters, type GroupBy } from "./use-guest-filters"
import type { Guest, RsvpStatus, SideKey } from "@/lib/types"

const rsvpOptions: RsvpStatus[] = ["confirmed", "maybe", "pending", "declined"]

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
  const { event, guests } = useEventData(eventId)
  const { updateGuests, removeGuests } = useData()
  const { t, L, locale } = useLocale()

  const {
    filters,
    setFilters,
    groupBy,
    setGroupBy,
    families,
    filtered,
    isFiltered,
    reset,
  } = useGuestFilters(guests, {
    ...(initialRsvp ? { rsvp: initialRsvp } : {}),
    ...(initialQuery ? { query: initialQuery } : {}),
  })

  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [editing, setEditing] = React.useState<Guest | undefined>()
  const [formOpen, setFormOpen] = React.useState(openNew)
  const [giftGuest, setGiftGuest] = React.useState<Guest | undefined>()
  const [giftOpen, setGiftOpen] = React.useState(false)
  const [showFilters, setShowFilters] = React.useState(false)

  if (!event) return null

  const stats = guestStats(guests)
  const visibleIds = filtered.map((g) => g.id)
  const selectedVisible = visibleIds.filter((id) => selected.has(id))
  const allSelected = visibleIds.length > 0 && selectedVisible.length === visibleIds.length
  const someSelected = selectedVisible.length > 0

  const groups = groupGuests(filtered, groupBy, {
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

  function bulk(patch: Partial<Guest>, message: string) {
    updateGuests(selectedVisible, patch)
    toast.success(`${selectedVisible.length} ${message}`)
    setSelected(new Set())
  }

  const segments = [
    { key: "confirmed", label: t("status.confirmed"), value: stats.confirmed, className: "bg-success" },
    { key: "maybe", label: t("status.maybe"), value: stats.maybe, className: "bg-warning" },
    { key: "declined", label: t("status.declined"), value: stats.declined, className: "bg-muted-foreground/45" },
    { key: "pending", label: t("status.pending"), value: stats.pending, className: "bg-muted-foreground/15" },
  ]

  /** Exports the filtered list, so the file matches what is on screen. */
  function exportVisible() {
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
      filtered.map((guest) => [
        guest.name,
        guest.nameKm,
        guest.family,
        guest.side === "shared" ? t("side.shared") : L(event.sides[guest.side]),
        guest.relationship,
        guest.partySize,
        t(`status.${guest.rsvp}`),
        guest.table,
        guest.phone,
        guest.gift?.amount,
        guest.notes,
      ])
    )
    downloadCsv(`${event.slug}-guests.csv`, csv)
    toast.success(`${formatNumber(filtered.length, locale)} ${t("guests.parties").toLowerCase()}`)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("guests.title")}
        description={t("guests.subtitle")}
        actions={
          <>
            <Button variant="outline" onClick={exportVisible} disabled={filtered.length === 0}>
              <Download />
              {t("action.export")}
            </Button>
            <Button onClick={() => openEdit(undefined)}>
              <Plus />
              {t("action.addGuest")}
            </Button>
          </>
        }
      />

      <section className="grid gap-4 rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card p-5 shadow-(--shadow-card) sm:grid-cols-[auto_1fr] sm:gap-8">
        <dl className="flex gap-6">
          <div>
            <dt className="text-xs text-muted-foreground">{t("guests.parties")}</dt>
            <dd className="display tnum text-2xl">{formatNumber(stats.invitations, locale)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{t("guests.seats")}</dt>
            <dd className="display tnum text-2xl">{formatNumber(stats.invitedSeats, locale)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{t("dash.expectedAttendance")}</dt>
            <dd className="display tnum text-2xl text-primary">
              {formatNumber(stats.expectedSeats, locale)}
            </dd>
          </div>
        </dl>
        <SegmentedBar segments={segments} total={stats.invitations} className="self-center" />
      </section>

      <div className="overflow-hidden rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card shadow-(--shadow-card)">
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={filters.query}
              onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
              placeholder={t("guests.searchPlaceholder")}
              aria-label={t("action.search")}
              className="pl-9"
            />
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <FilterSelects
              filters={filters}
              setFilters={setFilters}
              families={families}
              sides={{ a: L(event.sides.a), b: L(event.sides.b) }}
            />
          </div>

          <Button
            variant={showFilters ? "secondary" : "outline"}
            size="icon"
            className="md:hidden"
            aria-expanded={showFilters}
            aria-label={t("action.filter")}
            onClick={() => setShowFilters((v) => !v)}
          >
            <SlidersHorizontal />
          </Button>

          <Select
            value={groupBy}
            onValueChange={(v) => setGroupBy(v as GroupBy)}
            items={[
              { value: "none", label: t("guests.groupBy.none") },
              { value: "side", label: t("guests.groupBy.side") },
              { value: "family", label: t("guests.groupBy.family") },
              { value: "rsvp", label: t("guests.groupBy.rsvp") },
            ]}
          >
            <SelectTrigger size="sm" aria-label={t("guests.groupBy")} className="hidden lg:flex">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t("guests.groupBy.none")}</SelectItem>
              <SelectItem value="side">{t("guests.groupBy.side")}</SelectItem>
              <SelectItem value="family">{t("guests.groupBy.family")}</SelectItem>
              <SelectItem value="rsvp">{t("guests.groupBy.rsvp")}</SelectItem>
            </SelectContent>
          </Select>

          {isFiltered ? (
            <Button variant="ghost" size="sm" onClick={reset}>
              <X />
              <span className="hidden sm:inline">{t("action.clearFilters")}</span>
            </Button>
          ) : null}

          <p className="ml-auto hidden shrink-0 text-xs text-muted-foreground sm:block">
            {formatNumber(filtered.length, locale)} {t("common.of")}{" "}
            {formatNumber(guests.length, locale)}
          </p>
        </div>

        {showFilters ? (
          <div className="grid gap-3 border-b border-border bg-muted/30 p-3 md:hidden">
            <FilterSelects
              filters={filters}
              setFilters={setFilters}
              families={families}
              sides={{ a: L(event.sides.a), b: L(event.sides.b) }}
              full
            />
            <div className="flex items-center gap-2">
              <Switch
                id="only-gift"
                checked={filters.onlyWithGift}
                onCheckedChange={(v) => setFilters((f) => ({ ...f, onlyWithGift: Boolean(v) }))}
              />
              <Label htmlFor="only-gift" className="text-sm font-normal">
                {t("gifts.givers")}
              </Label>
            </div>
            <Select
              value={groupBy}
              onValueChange={(v) => setGroupBy(v as GroupBy)}
              items={[
                { value: "none", label: t("guests.groupBy.none") },
                { value: "side", label: t("guests.groupBy.side") },
                { value: "family", label: t("guests.groupBy.family") },
                { value: "rsvp", label: t("guests.groupBy.rsvp") },
              ]}
            >
              <SelectTrigger className="w-full" aria-label={t("guests.groupBy")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("guests.groupBy.none")}</SelectItem>
                <SelectItem value="side">{t("guests.groupBy.side")}</SelectItem>
                <SelectItem value="family">{t("guests.groupBy.family")}</SelectItem>
                <SelectItem value="rsvp">{t("guests.groupBy.rsvp")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : null}

        {filtered.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={Users}
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
          removeGuests(selectedVisible)
          toast.success(`${selectedVisible.length} removed`)
          setSelected(new Set())
        }}
      />

      <GuestFormSheet event={event} guest={editing} open={formOpen} onOpenChange={setFormOpen} />
      <RecordGiftDialog
        guest={giftGuest}
        currency={event.currency}
        open={giftOpen}
        onOpenChange={setGiftOpen}
      />
    </div>
  )
}

function FilterSelects({
  filters,
  setFilters,
  families,
  sides,
  full,
}: {
  filters: ReturnType<typeof useGuestFilters>["filters"]
  setFilters: ReturnType<typeof useGuestFilters>["setFilters"]
  families: string[]
  sides: { a: string; b: string }
  full?: boolean
}) {
  const { t } = useLocale()
  const width = full ? "w-full" : ""

  return (
    <>
      <Select
        value={filters.rsvp}
        onValueChange={(v) => setFilters((f) => ({ ...f, rsvp: v as RsvpStatus | "all" }))}
        items={[
          { value: "all", label: `${t("common.all")} — ${t("guests.field.rsvp")}` },
          ...rsvpOptions.map((r) => ({ value: r, label: t(`status.${r}`) })),
        ]}
      >
        <SelectTrigger size={full ? "default" : "sm"} className={width} aria-label={t("guests.field.rsvp")}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{`${t("common.all")} — ${t("guests.field.rsvp")}`}</SelectItem>
          {rsvpOptions.map((r) => (
            <SelectItem key={r} value={r}>
              {t(`status.${r}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.side}
        onValueChange={(v) => setFilters((f) => ({ ...f, side: v as SideKey | "all" }))}
        items={[
          { value: "all", label: `${t("common.all")} — ${t("side.label")}` },
          { value: "a", label: sides.a },
          { value: "b", label: sides.b },
          { value: "shared", label: t("side.shared") },
        ]}
      >
        <SelectTrigger size={full ? "default" : "sm"} className={width} aria-label={t("side.label")}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{`${t("common.all")} — ${t("side.label")}`}</SelectItem>
          <SelectItem value="a">{sides.a}</SelectItem>
          <SelectItem value="b">{sides.b}</SelectItem>
          <SelectItem value="shared">{t("side.shared")}</SelectItem>
        </SelectContent>
      </Select>

      {families.length > 0 ? (
        <Select
          value={filters.family}
          onValueChange={(v) => setFilters((f) => ({ ...f, family: v ?? "all" }))}
          items={[
            { value: "all", label: `${t("common.all")} — ${t("guests.field.family")}` },
            ...families.map((f) => ({ value: f, label: f })),
          ]}
        >
          <SelectTrigger
            size={full ? "default" : "sm"}
            className={cn(width, !full && "max-w-44")}
            aria-label={t("guests.field.family")}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{`${t("common.all")} — ${t("guests.field.family")}`}</SelectItem>
            {families.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
    </>
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

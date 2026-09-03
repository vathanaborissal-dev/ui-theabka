"use client"

import * as React from "react"
import { Group, ListFilter, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useLocale } from "@/components/providers/locale-provider"
import type { RsvpStatus, SideKey } from "@/lib/types"
import { cn } from "@/lib/utils"
import { emptyFilters, type GroupBy, type GuestFilters } from "./use-guest-filters"

/**
 * Search, filters and grouping for the guest table.
 *
 * One implementation at every width, rather than an inline row for wide
 * screens and a separate stacked panel for narrow ones. Two implementations of
 * the same controls is how the gift toggle ended up reachable only on a phone
 * and grouping only on a large desktop.
 *
 * The shape is search first, everything else behind one button. Search is what
 * people reach for; the rest is occasional, and putting six controls in a row
 * means they wrap into each other the moment the window narrows.
 *
 * Active filters appear as chips underneath. A collapsed panel hides the fact
 * that the list is filtered at all, which is how someone concludes half their
 * guests have vanished.
 */

const RSVP_OPTIONS: RsvpStatus[] = ["pending", "confirmed", "maybe", "declined"]

export function GuestFilterBar({
  filters,
  setFilters,
  groupBy,
  setGroupBy,
  families,
  sides,
  shown,
  total,
  className,
}: {
  filters: GuestFilters
  setFilters: React.Dispatch<React.SetStateAction<GuestFilters>>
  groupBy: GroupBy
  setGroupBy: (value: GroupBy) => void
  families: string[]
  sides: { a: string; b: string }
  /** Rows matching the current filters. */
  shown: number
  /** Rows on the event at all. */
  total: number
  className?: string
}) {
  const { t } = useLocale()
  const [open, setOpen] = React.useState(false)

  const sideLabel = (side: SideKey) =>
    side === "shared" ? t("side.shared") : side === "a" ? sides.a : sides.b

  /**
   * The filters currently narrowing the list, as chips.
   *
   * Search is deliberately not among them — it has its own visible box, and a
   * chip repeating what is already on screen is noise.
   */
  const chips: { key: string; label: string; clear: () => void }[] = []
  if (filters.rsvp !== "all") {
    chips.push({
      key: "rsvp",
      label: t(`status.${filters.rsvp}` as Parameters<typeof t>[0]),
      clear: () => setFilters((f) => ({ ...f, rsvp: "all" })),
    })
  }
  if (filters.side !== "all") {
    chips.push({
      key: "side",
      label: sideLabel(filters.side),
      clear: () => setFilters((f) => ({ ...f, side: "all" })),
    })
  }
  if (filters.family !== "all") {
    chips.push({
      key: "family",
      label: filters.family,
      clear: () => setFilters((f) => ({ ...f, family: "all" })),
    })
  }
  if (filters.onlyWithGift) {
    chips.push({
      key: "gift",
      label: t("gifts.givers"),
      clear: () => setFilters((f) => ({ ...f, onlyWithGift: false })),
    })
  }

  const activeCount = chips.length
  const searching = filters.query.trim() !== ""

  return (
    <div className={cn("space-y-2 border-b border-border p-3", className)}>
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
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

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <Button
                variant={activeCount > 0 ? "secondary" : "outline"}
                aria-label={t("action.filter")}
              >
                <ListFilter />
                <span className="hidden sm:inline">{t("action.filter")}</span>
                {/* The count is the whole point of the button when collapsed:
                    it says the list is narrowed without opening anything. */}
                {activeCount > 0 ? (
                  <span className="tnum ml-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-[0.6875rem] font-medium text-primary-foreground">
                    {activeCount}
                  </span>
                ) : null}
              </Button>
            }
          />
          <PopoverContent align="end" className="w-72">
            <FilterField label={t("guests.field.rsvp")}>
              <Select
                value={filters.rsvp}
                onValueChange={(v) => setFilters((f) => ({ ...f, rsvp: v as RsvpStatus | "all" }))}
                items={[
                  { value: "all", label: t("common.all") },
                  ...RSVP_OPTIONS.map((r) => ({
                    value: r,
                    label: t(`status.${r}` as Parameters<typeof t>[0]),
                  })),
                ]}
              >
                <SelectTrigger className="w-full" aria-label={t("guests.field.rsvp")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  {RSVP_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {t(`status.${r}` as Parameters<typeof t>[0])}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterField>

            <FilterField label={t("guests.field.side")}>
              <Select
                value={filters.side}
                onValueChange={(v) => setFilters((f) => ({ ...f, side: v as SideKey | "all" }))}
                items={[
                  { value: "all", label: t("common.all") },
                  { value: "a", label: sides.a },
                  { value: "b", label: sides.b },
                  { value: "shared", label: t("side.shared") },
                ]}
              >
                <SelectTrigger className="w-full" aria-label={t("guests.field.side")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  <SelectItem value="a">{sides.a}</SelectItem>
                  <SelectItem value="b">{sides.b}</SelectItem>
                  <SelectItem value="shared">{t("side.shared")}</SelectItem>
                </SelectContent>
              </Select>
            </FilterField>

            {/* Only offered once there is more than one household to choose
                between — a select with a single option is a dead control. */}
            {families.length > 1 ? (
              <FilterField label={t("guests.field.family")}>
                <Select
                  value={filters.family}
                  onValueChange={(v) => setFilters((f) => ({ ...f, family: v ?? "all" }))}
                  items={[
                    { value: "all", label: t("common.all") },
                    ...families.map((f) => ({ value: f, label: f })),
                  ]}
                >
                  <SelectTrigger className="w-full" aria-label={t("guests.field.family")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("common.all")}</SelectItem>
                    {families.map((family) => (
                      <SelectItem key={family} value={family}>
                        {family}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>
            ) : null}

            <div className="flex items-center justify-between gap-3 pt-0.5">
              <Label htmlFor="only-gift" className="text-sm font-normal">
                {t("gifts.givers")}
              </Label>
              <Switch
                id="only-gift"
                checked={filters.onlyWithGift}
                onCheckedChange={(v) => setFilters((f) => ({ ...f, onlyWithGift: Boolean(v) }))}
              />
            </div>
          </PopoverContent>
        </Popover>

        {/* Grouping is a view setting rather than a filter — it changes how the
            same rows are arranged, so it sits outside the filter count. */}
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
          {/* One instance at every width — icon-only where there is no room
              for the label, rather than hidden below a breakpoint. A control
              that disappears on a phone is a control people cannot find. */}
          <SelectTrigger
            aria-label={t("guests.groupBy")}
            className="w-auto shrink-0 max-md:px-2.5 max-md:[&>svg:last-child]:hidden"
          >
            <Group className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="hidden md:inline">
              <SelectValue />
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{t("guests.groupBy.none")}</SelectItem>
            <SelectItem value="side">{t("guests.groupBy.side")}</SelectItem>
            <SelectItem value="family">{t("guests.groupBy.family")}</SelectItem>
            <SelectItem value="rsvp">{t("guests.groupBy.rsvp")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {chips.length > 0 || searching ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.clear}
              className="inline-flex items-center gap-1 rounded-full bg-secondary py-1 pr-1.5 pl-2.5 text-xs text-secondary-foreground transition-colors outline-none hover:bg-secondary/70 focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span className="max-w-40 truncate">{chip.label}</span>
              <X className="size-3.5 shrink-0 opacity-60" aria-hidden="true" />
              <span className="sr-only">{t("action.clearFilters")}</span>
            </button>
          ))}

          {chips.length > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setFilters((f) => ({ ...emptyFilters, query: f.query }))}
            >
              {t("action.clearFilters")}
            </Button>
          ) : null}

          <p className="tnum ml-auto shrink-0 text-xs text-muted-foreground">
            {shown} {t("common.of")} {total}
          </p>
        </div>
      ) : null}
    </div>
  )
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

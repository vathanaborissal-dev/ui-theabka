"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { RsvpBadge } from "@/components/shared/status-badge"
import { GuestRowMenu } from "./guest-row-menu"
import { useLocale } from "@/components/providers/locale-provider"
import { formatMoney, formatNumber, initials } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { EventRecord, Guest } from "@/lib/types"

export type GuestGroup = { key: string; label: string; guests: Guest[] }

/**
 * Desktop guest list. A real table (not divs) so screen readers and keyboard
 * users get row/column semantics on a list that can run to hundreds of rows.
 */
export function GuestTable({
  event,
  groups,
  selected,
  onToggle,
  onToggleAll,
  allSelected,
  someSelected,
  onEdit,
  onRecordGift,
}: {
  event: EventRecord
  groups: GuestGroup[]
  selected: Set<string>
  onToggle: (id: string) => void
  onToggleAll: () => void
  allSelected: boolean
  someSelected: boolean
  onEdit: (guest: Guest) => void
  onRecordGift: (guest: Guest) => void
}) {
  const { t, L, locale } = useLocale()

  const sideLabel = (guest: Guest) =>
    guest.side === "shared" ? t("side.shared") : L(event.sides[guest.side])

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[52rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th scope="col" className="w-10 py-2.5 pr-2 pl-4">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected && !allSelected}
                onCheckedChange={onToggleAll}
                aria-label={t("action.selectAll")}
              />
            </th>
            <Th className="min-w-[13rem]">{t("guests.field.name")}</Th>
            <Th className="min-w-[10rem]">{t("guests.field.family")}</Th>
            <Th className="w-20 text-right">{t("guests.field.partySize")}</Th>
            <Th className="w-36">{t("guests.field.rsvp")}</Th>
            <Th className="w-28 text-right">{t("guests.field.gift")}</Th>
            <th scope="col" className="w-12 pr-4">
              <span className="sr-only">{t("common.more")}</span>
            </th>
          </tr>
        </thead>

        {groups.map((group) => (
          <tbody key={group.key}>
            {group.label ? (
              <tr>
                <th
                  colSpan={7}
                  scope="colgroup"
                  className="border-b border-border bg-muted/50 px-4 py-1.5 text-left"
                >
                  <span className="eyebrow text-muted-foreground">{group.label}</span>
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {formatNumber(group.guests.length, locale)}
                  </span>
                </th>
              </tr>
            ) : null}

            {group.guests.map((guest) => {
              const isSelected = selected.has(guest.id)
              return (
                <tr
                  key={guest.id}
                  onClick={() => onEdit(guest)}
                  className={cn(
                    "cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-muted/45",
                    isSelected && "bg-primary/6 hover:bg-primary/8"
                  )}
                >
                  <td className="py-2.5 pr-2 pl-4" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggle(guest.id)}
                      aria-label={`Select ${guest.name}`}
                    />
                  </td>

                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-[0.6875rem] font-semibold text-muted-foreground"
                      >
                        {initials(guest.name)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-foreground">
                          {guest.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {guest.nameKm ? (
                            <span lang="km">{guest.nameKm}</span>
                          ) : (
                            guest.relationship
                          )}
                          {guest.table ? (
                            <span className="ml-1.5 text-muted-foreground/70">
                              · {t("guests.field.table")} {guest.table}
                            </span>
                          ) : null}
                        </span>
                      </span>
                    </div>
                  </td>

                  <td className="py-2.5 pr-3">
                    <span className="block truncate text-foreground">{guest.family ?? "—"}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {sideLabel(guest)}
                    </span>
                  </td>

                  <td className="tnum py-2.5 pr-3 text-right text-foreground">
                    {formatNumber(guest.partySize, locale)}
                  </td>

                  <td className="py-2.5 pr-3">
                    <RsvpBadge status={guest.rsvp} />
                  </td>

                  <td className="tnum py-2.5 pr-3 text-right">
                    {guest.gift ? (
                      <span className="font-medium text-foreground">
                        {formatMoney(guest.gift.amount, guest.gift.currency, locale)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </td>

                  <td className="pr-4" onClick={(e) => e.stopPropagation()}>
                    <GuestRowMenu
                      guest={guest}
                      onEdit={() => onEdit(guest)}
                      onRecordGift={() => onRecordGift(guest)}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        ))}
      </table>
    </div>
  )
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cn("py-2.5 pr-3 text-xs font-medium text-muted-foreground", className)}
    >
      {children}
    </th>
  )
}

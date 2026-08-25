"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { RsvpBadge } from "@/components/shared/status-badge"
import { GuestRowMenu } from "./guest-row-menu"
import { useLocale } from "@/components/providers/locale-provider"
import { formatMoney, formatNumber, initials } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { EventRecord, Guest } from "@/lib/types"
import type { GuestGroup } from "./guest-table"

/** Phone layout for the same data — a table at 375px is unusable. */
export function GuestCards({
  event,
  groups,
  selected,
  onToggle,
  onEdit,
  onRecordGift,
}: {
  event: EventRecord
  groups: GuestGroup[]
  selected: Set<string>
  onToggle: (id: string) => void
  onEdit: (guest: Guest) => void
  onRecordGift: (guest: Guest) => void
}) {
  const { t, L, locale } = useLocale()

  return (
    <div className="divide-y divide-border">
      {groups.map((group) => (
        <section key={group.key}>
          {group.label ? (
            <h3 className="eyebrow sticky top-14 z-10 bg-muted/90 px-4 py-2 text-muted-foreground backdrop-blur">
              {group.label}
              <span className="ml-2 font-normal">{formatNumber(group.guests.length, locale)}</span>
            </h3>
          ) : null}

          <ul className="divide-y divide-border/60">
            {group.guests.map((guest) => {
              const isSelected = selected.has(guest.id)
              return (
                <li
                  key={guest.id}
                  className={cn("flex items-start gap-3 px-4 py-3", isSelected && "bg-primary/6")}
                >
                  <Checkbox
                    className="mt-2"
                    checked={isSelected}
                    onCheckedChange={() => onToggle(guest.id)}
                    aria-label={`Select ${guest.name}`}
                  />

                  <button
                    type="button"
                    onClick={() => onEdit(guest)}
                    className="min-w-0 flex-1 text-left outline-none focus-visible:underline"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-[0.6875rem] font-semibold text-muted-foreground"
                      >
                        {initials(guest.name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{guest.name}</span>
                        {guest.nameKm ? (
                          <span lang="km" className="block truncate text-xs text-muted-foreground">
                            {guest.nameKm}
                          </span>
                        ) : null}
                      </span>
                    </span>

                    <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                      <RsvpBadge status={guest.rsvp} />
                      <span className="tnum">
                        {formatNumber(guest.partySize, locale)} {t("guests.seats").toLowerCase()}
                      </span>
                      {guest.gift ? (
                        <span className="tnum font-medium text-foreground">
                          {formatMoney(guest.gift.amount, guest.gift.currency, locale)}
                        </span>
                      ) : null}
                      <span className="truncate">
                        {guest.family ??
                          (guest.side === "shared" ? t("side.shared") : L(event.sides[guest.side]))}
                      </span>
                    </span>
                  </button>

                  <GuestRowMenu
                    guest={guest}
                    onEdit={() => onEdit(guest)}
                    onRecordGift={() => onRecordGift(guest)}
                  />
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}

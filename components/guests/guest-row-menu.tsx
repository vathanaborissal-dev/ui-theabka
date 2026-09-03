"use client"

import { Check, Coins, MoreHorizontal, Pencil, Phone, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useData } from "@/components/providers/data-provider"
import { useLocale } from "@/components/providers/locale-provider"
import { toast } from "sonner"
import type { Guest } from "@/lib/types"

export function GuestRowMenu({
  guest,
  onEdit,
  onRecordGift,
}: {
  guest: Guest
  onEdit: () => void
  onRecordGift: () => void
}) {
  const { updateGuest, removeGuests } = useData()
  const { t } = useLocale()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`${t("common.more")} — ${guest.name}`}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil />
          {t("action.edit")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onRecordGift}>
          <Coins />
          {t("gifts.recordFor")}
        </DropdownMenuItem>
        {guest.phone ? (
          <DropdownMenuItem render={<a href={`tel:${guest.phone.replace(/\s/g, "")}`} />}>
            <Phone />
            {guest.phone}
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("guests.field.rsvp")}</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() =>
              updateGuest(guest.eventId, guest.id, { rsvp: "confirmed", respondedAt: new Date().toISOString() })
            }
          >
            <Check />
            {t("status.confirmed")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              updateGuest(guest.eventId, guest.id, { rsvp: "declined", respondedAt: new Date().toISOString() })
            }
          >
            <X />
            {t("status.declined")}
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            removeGuests(guest.eventId, [guest.id])
            toast.success(`${guest.name} removed`)
          }}
        >
          <Trash2 />
          {t("action.delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

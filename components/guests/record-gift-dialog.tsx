"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field } from "@/components/shared/field"
import { useData } from "@/components/providers/data-provider"
import { useLocale } from "@/components/providers/locale-provider"
import { formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { Currency, GiftMethod, Guest } from "@/lib/types"

/** Amounts that actually turn up in Cambodian wedding envelopes. */
const QUICK_AMOUNTS = [20, 50, 100, 200]

const methods: GiftMethod[] = ["cash", "transfer", "item"]

/**
 * Recording a gift happens fast, often on a phone, while envelopes are being
 * opened — so this is a small dialog with tap-sized preset amounts rather than
 * a full form.
 */
export function RecordGiftDialog({
  guest,
  currency,
  open,
  onOpenChange,
}: {
  guest?: Guest
  currency: Currency
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { updateGuest } = useData()
  const { t, locale } = useLocale()

  const [amount, setAmount] = React.useState("")
  const [method, setMethod] = React.useState<GiftMethod>("cash")
  const [note, setNote] = React.useState("")

  // See GuestFormSheet: re-seed during render on open / guest change.
  const seed = `${guest?.id ?? "none"}:${open}`
  const [prevSeed, setPrevSeed] = React.useState(seed)
  if (seed !== prevSeed) {
    setPrevSeed(seed)
    setAmount(guest?.gift ? String(guest.gift.amount) : "")
    setMethod(guest?.gift?.method ?? "cash")
    setNote(guest?.gift?.note ?? "")
  }

  if (!guest) return null

  function save() {
    if (!guest) return
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) return
    const recorded = guest
    void updateGuest(recorded.eventId, recorded.id, {
      gift: { amount: value, currency, method, note: note.trim() || undefined },
    })
      .then(() =>
        toast.success(
          `${formatMoney(value, currency, locale)} recorded from ${recorded.name}`
        )
      )
      .catch(() => toast.error("That gift could not be saved. Please try again."))
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("gifts.recordFor")}</DialogTitle>
          <DialogDescription>
            {guest.name}
            {guest.nameKm ? <span lang="km"> · {guest.nameKm}</span> : null}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Field label={t("gifts.amount")} htmlFor="gift-amount" required>
              <Input
                id="gift-amount"
                type="number"
                inputMode="decimal"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="h-11 text-lg"
                autoFocus
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAmount(String(value))}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    Number(amount) === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-foreground/25 hover:text-foreground"
                  )}
                >
                  {formatMoney(value, currency, locale)}
                </button>
              ))}
            </div>
          </div>

          <fieldset className="space-y-1.5">
            <legend className="text-sm font-medium">{t("gifts.method")}</legend>
            <div className="flex gap-2">
              {methods.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  aria-pressed={method === m}
                  className={cn(
                    "flex-1 rounded-[var(--btn-radius)] border px-3 py-2 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    method === m
                      ? "border-primary bg-primary/8 font-medium text-foreground"
                      : "border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  {t(`gifts.method.${m === "item" ? "gift" : m}`)}
                </button>
              ))}
            </div>
          </fieldset>

          <Field label={t("guests.field.notes")} htmlFor="gift-note" optional>
            <Textarea
              id="gift-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Given by the family at the house"
            />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t("action.cancel")}
          </Button>
          <Button onClick={save} disabled={!amount || Number(amount) <= 0}>
            {t("action.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

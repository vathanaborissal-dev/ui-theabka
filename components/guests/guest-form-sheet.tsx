"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Field } from "@/components/shared/field"
import { useData } from "@/components/providers/data-provider"
import { useLocale } from "@/components/providers/locale-provider"
import { toast } from "sonner"
import type { EventRecord, Guest, RsvpStatus, SideKey } from "@/lib/types"

const rsvpOptions: RsvpStatus[] = ["pending", "confirmed", "maybe", "declined"]

/**
 * Add / edit a guest. A side sheet rather than a modal: on a phone it becomes a
 * full-height panel, and the list stays visible behind it on desktop.
 */
export function GuestFormSheet({
  event,
  guest,
  open,
  onOpenChange,
}: {
  event: EventRecord
  guest?: Guest
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { addGuest, updateGuest } = useData()
  const { t, L } = useLocale()
  const editing = Boolean(guest)

  const [form, setForm] = React.useState(() => toForm(guest))
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  // Re-seed the form whenever the sheet opens, or opens for a different guest.
  // Adjusting state during render (rather than in an effect) means the fields
  // are already correct on the first paint, with no flash of the old values.
  const seed = `${guest?.id ?? "new"}:${open}`
  const [prevSeed, setPrevSeed] = React.useState(seed)
  if (seed !== prevSeed) {
    setPrevSeed(seed)
    setForm(toForm(guest))
    setErrors({})
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const nextErrors: Record<string, string> = {}
    if (!form.name.trim()) nextErrors.name = "Please enter a name"
    const seats = Number(form.partySize)
    if (!Number.isFinite(seats) || seats < 1) nextErrors.partySize = "At least one seat"
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const payload = {
      name: form.name.trim(),
      nameKm: form.nameKm.trim() || undefined,
      phone: form.phone.trim() || undefined,
      family: form.family.trim() || undefined,
      side: form.side,
      relationship: form.relationship.trim() || undefined,
      partySize: seats,
      rsvp: form.rsvp,
      table: form.table.trim() || undefined,
      notes: form.notes.trim() || undefined,
    }

    if (editing && guest) {
      updateGuest(guest.id, payload)
      toast.success(`${payload.name} updated`)
    } else {
      addGuest({
        ...payload,
        id: `g_${Date.now()}`,
        eventId: event.id,
        attendance: "unknown",
        invitedAt: new Date().toISOString(),
      })
      toast.success(`${payload.name} added to the guest list`)
    }
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          <SheetHeader className="border-b border-border px-5 py-4">
            <SheetTitle>{t(editing ? "guests.editTitle" : "guests.addTitle")}</SheetTitle>
            <SheetDescription>{t("guests.addDescription")}</SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
            <Field label={t("guests.field.name")} htmlFor="guest-name" error={errors.name} required>
              <Input
                id="guest-name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Sok Dara"
                aria-invalid={Boolean(errors.name)}
                autoFocus
              />
            </Field>

            <Field label={t("guests.field.nameKm")} htmlFor="guest-name-km" optional>
              <Input
                id="guest-name-km"
                lang="km"
                value={form.nameKm}
                onChange={(e) => set("nameKm", e.target.value)}
                placeholder="សុខ តារា"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label={t("guests.field.phone")} htmlFor="guest-phone" optional>
                <Input
                  id="guest-phone"
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="012 345 678"
                />
              </Field>

              <Field
                label={t("guests.field.partySize")}
                htmlFor="guest-seats"
                error={errors.partySize}
                required
              >
                <Input
                  id="guest-seats"
                  type="number"
                  min={1}
                  max={20}
                  inputMode="numeric"
                  value={form.partySize}
                  onChange={(e) => set("partySize", e.target.value)}
                  aria-invalid={Boolean(errors.partySize)}
                />
              </Field>
            </div>

            <Field label={t("side.label")} htmlFor="guest-side">
              <Select
                value={form.side}
                onValueChange={(value) => set("side", value as SideKey)}
                items={[
                  { value: "a", label: L(event.sides.a) },
                  { value: "b", label: L(event.sides.b) },
                  { value: "shared", label: t("side.shared") },
                ]}
              >
                <SelectTrigger id="guest-side" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a">{L(event.sides.a)}</SelectItem>
                  <SelectItem value="b">{L(event.sides.b)}</SelectItem>
                  <SelectItem value="shared">{t("side.shared")}</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label={t("guests.field.family")} htmlFor="guest-family" optional>
                <Input
                  id="guest-family"
                  value={form.family}
                  onChange={(e) => set("family", e.target.value)}
                  placeholder="Sok family"
                />
              </Field>
              <Field label={t("guests.field.relationship")} htmlFor="guest-rel" optional>
                <Input
                  id="guest-rel"
                  value={form.relationship}
                  onChange={(e) => set("relationship", e.target.value)}
                  placeholder="Cousin"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label={t("guests.field.rsvp")} htmlFor="guest-rsvp">
                <Select
                  value={form.rsvp}
                  onValueChange={(value) => set("rsvp", value as RsvpStatus)}
                  items={rsvpOptions.map((r) => ({ value: r, label: t(`status.${r}`) }))}
                >
                  <SelectTrigger id="guest-rsvp" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {rsvpOptions.map((r) => (
                      <SelectItem key={r} value={r}>
                        {t(`status.${r}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label={t("guests.field.table")} htmlFor="guest-table" optional>
                <Input
                  id="guest-table"
                  value={form.table}
                  onChange={(e) => set("table", e.target.value)}
                  placeholder="12"
                />
              </Field>
            </div>

            <Field label={t("guests.field.notes")} htmlFor="guest-notes" optional>
              <Textarea
                id="guest-notes"
                rows={3}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Vegetarian, arriving late…"
              />
            </Field>
          </div>

          <SheetFooter className="flex-row justify-end gap-2 border-t border-border px-5 py-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t("action.cancel")}
            </Button>
            <Button type="submit">{t(editing ? "action.saveChanges" : "action.addGuest")}</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

type FormState = {
  name: string
  nameKm: string
  phone: string
  family: string
  relationship: string
  side: SideKey
  partySize: string
  rsvp: RsvpStatus
  table: string
  notes: string
}

function toForm(guest?: Guest): FormState {
  return {
    name: guest?.name ?? "",
    nameKm: guest?.nameKm ?? "",
    phone: guest?.phone ?? "",
    family: guest?.family ?? "",
    relationship: guest?.relationship ?? "",
    side: guest?.side ?? "a",
    partySize: String(guest?.partySize ?? 2),
    rsvp: guest?.rsvp ?? "pending",
    table: guest?.table ?? "",
    notes: guest?.notes ?? "",
  }
}


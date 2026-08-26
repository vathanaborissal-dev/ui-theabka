"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Field } from "@/components/shared/field"
import { useData } from "@/components/providers/data-provider"
import { useLocale } from "@/components/providers/locale-provider"
import { toast } from "sonner"
import type { EventRecord, Expense, ExpenseCategory, ExpenseStatus } from "@/lib/types"

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "venue",
  "food",
  "decoration",
  "photography",
  "entertainment",
  "transport",
  "invitations",
  "clothing",
  "ceremony",
  "other",
]

const STATUSES: ExpenseStatus[] = ["planned", "deposit", "paid"]

export function ExpenseDialog({
  event,
  expense,
  open,
  onOpenChange,
}: {
  event: EventRecord
  expense?: Expense
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { addExpense, updateExpense } = useData()
  const { t } = useLocale()
  const editing = Boolean(expense)

  const [form, setForm] = React.useState(() => toForm(expense))
  const [error, setError] = React.useState<string>()

  // See GuestFormSheet: re-seed during render on open / expense change.
  const seed = `${expense?.id ?? "new"}:${open}`
  const [prevSeed, setPrevSeed] = React.useState(seed)
  if (seed !== prevSeed) {
    setPrevSeed(seed)
    setForm(toForm(expense))
    setError(undefined)
  }

  const set = <K extends keyof ReturnType<typeof toForm>>(
    key: K,
    value: ReturnType<typeof toForm>[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }))

  function save(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) {
      setError("Please describe the expense")
      return
    }
    const amount = Number(form.amount) || 0
    const paidAmount = form.status === "paid" ? amount : Number(form.paidAmount) || 0

    const payload = {
      title: form.title.trim(),
      category: form.category,
      vendor: form.vendor.trim() || undefined,
      amount,
      currency: event.currency,
      paidAmount: Math.min(paidAmount, amount),
      status: form.status,
      dueDate: form.dueDate || undefined,
      note: form.note.trim() || undefined,
    }

    if (editing && expense) {
      updateExpense(expense.id, payload)
      toast.success(`${payload.title} updated`)
    } else {
      addExpense({ ...payload, id: `ex_${Date.now()}`, eventId: event.id })
      toast.success(`${payload.title} added`)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={save}>
          <DialogHeader>
            <DialogTitle>{t(editing ? "action.edit" : "expenses.add")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Field label="What is it for" htmlFor="ex-title" error={error} required>
              <Input
                id="ex-title"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Dinner catering — 52 tables"
                autoFocus
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t("expenses.category")} htmlFor="ex-cat">
                <Select
                  value={form.category}
                  onValueChange={(v) => set("category", (v as ExpenseCategory) ?? "other")}
                  items={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: t(`cat.${c}`) }))}
                >
                  <SelectTrigger id="ex-cat" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {t(`cat.${c}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label={t("expenses.vendor")} htmlFor="ex-vendor" optional>
                <Input
                  id="ex-vendor"
                  value={form.vendor}
                  onChange={(e) => set("vendor", e.target.value)}
                  placeholder="Angkor Catering House"
                />
              </Field>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Field label={t("expenses.amount")} htmlFor="ex-amount" required>
                <Input
                  id="ex-amount"
                  type="number"
                  min={0}
                  inputMode="decimal"
                  value={form.amount}
                  onChange={(e) => set("amount", e.target.value)}
                />
              </Field>
              <Field label="Already paid" htmlFor="ex-paid" optional>
                <Input
                  id="ex-paid"
                  type="number"
                  min={0}
                  inputMode="decimal"
                  value={form.paidAmount}
                  onChange={(e) => set("paidAmount", e.target.value)}
                  disabled={form.status === "paid"}
                />
              </Field>
              <Field label={t("expenses.dueDate")} htmlFor="ex-due" optional>
                <DatePicker
                  id="ex-due"
                  value={form.dueDate}
                  onChange={(value) => set("dueDate", value)}
                />
              </Field>
            </div>

            <fieldset>
              <legend className="mb-1.5 text-sm font-medium">Payment status</legend>
              <div className="flex gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set("status", s)}
                    aria-pressed={form.status === s}
                    className={
                      form.status === s
                        ? "flex-1 rounded-[var(--btn-radius)] border border-primary bg-primary/8 px-3 py-2 text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        : "flex-1 rounded-[var(--btn-radius)] border border-border px-3 py-2 text-sm text-muted-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                    }
                  >
                    {t(`status.${s}`)}
                  </button>
                ))}
              </div>
            </fieldset>

            <Field label={t("guests.field.notes")} htmlFor="ex-note" optional>
              <Textarea
                id="ex-note"
                rows={2}
                value={form.note}
                onChange={(e) => set("note", e.target.value)}
              />
            </Field>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t("action.cancel")}
            </Button>
            <Button type="submit">{t("action.save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function toForm(expense?: Expense) {
  return {
    title: expense?.title ?? "",
    category: expense?.category ?? ("other" as ExpenseCategory),
    vendor: expense?.vendor ?? "",
    amount: expense ? String(expense.amount) : "",
    paidAmount: expense ? String(expense.paidAmount) : "0",
    status: expense?.status ?? ("planned" as ExpenseStatus),
    dueDate: expense?.dueDate ?? "",
    note: expense?.note ?? "",
  }
}

"use client"

import * as React from "react"
import { Plus, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { StatCard } from "@/components/shared/stat-card"
import { BarList } from "@/components/charts/bar-list"
import { Panel } from "@/components/shared/panel"
import { ExpenseStatusBadge } from "@/components/shared/status-badge"
import { ExpenseDialog } from "./expense-dialog"
import { useData, useEventData } from "@/components/providers/data-provider"
import { useLocale } from "@/components/providers/locale-provider"
import { daysUntil, formatDate, formatMoney, formatNumber } from "@/lib/format"
import { expenseStats, giftStats } from "@/lib/stats"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { Expense } from "@/lib/types"

export function ExpensesView({
  eventId,
  openNew = false,
}: {
  eventId: string
  /** Opens the add-expense dialog straight away. */
  openNew?: boolean
}) {
  const { event, expenses, guests } = useEventData(eventId)
  const { updateExpense } = useData()
  const { t, locale } = useLocale()

  const [editing, setEditing] = React.useState<Expense | undefined>()
  const [open, setOpen] = React.useState(openNew)

  if (!event) return null

  const stats = expenseStats(expenses)
  const gifts = giftStats(guests)
  const coverage = stats.total ? Math.min((gifts.total / stats.total) * 100, 100) : 0

  const rows = [...expenses].sort((a, b) => b.amount - a.amount)

  function openDialog(expense?: Expense) {
    setEditing(expense)
    setOpen(true)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("expenses.title")}
        description={t("expenses.subtitle")}
        actions={
          <Button onClick={() => openDialog(undefined)}>
            <Plus />
            {t("expenses.add")}
          </Button>
        }
      />

      {expenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={t("expenses.empty.title")}
          description={t("expenses.empty.body")}
          action={
            <Button onClick={() => openDialog(undefined)}>
              <Plus />
              {t("expenses.add")}
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            <StatCard
              label={t("expenses.total")}
              value={formatMoney(stats.total, event.currency, locale)}
              sublabel={`${formatNumber(expenses.length, locale)} ${t("expenses.title").toLowerCase()}`}
              icon={Receipt}
            />
            <StatCard
              label={t("status.paid")}
              value={formatMoney(stats.paid, event.currency, locale)}
              tone="positive"
            />
            <StatCard
              label={t("expenses.outstanding")}
              value={formatMoney(stats.outstanding, event.currency, locale)}
              tone={stats.outstanding > 0 ? "negative" : "default"}
            />
            <StatCard
              label={t("expenses.covered")}
              value={`${formatNumber(Math.round(coverage), locale)}%`}
              sublabel={formatMoney(gifts.total, event.currency, locale)}
              tone="gold"
              footer={
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-gold" style={{ width: `${coverage}%` }} />
                </div>
              }
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-5 lg:gap-5">
            <Panel title={t("expenses.byCategory")} className="lg:col-span-2">
              <BarList
                rows={stats.byCategory.map((row) => ({
                  key: row.category,
                  label: t(`cat.${row.category}`),
                  value: row.amount,
                  display: formatMoney(row.amount, event.currency, locale),
                  secondary: row.paid,
                  secondaryLabel: t("status.paid"),
                  secondaryDisplay: formatMoney(row.paid, event.currency, locale),
                }))}
                barClassName="bg-primary/25"
                secondaryClassName="bg-primary"
              />
              <p className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
                  {t("status.paid")}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-primary/25" aria-hidden="true" />
                  {t("expenses.committed")}
                </span>
              </p>
            </Panel>

            <div className="overflow-hidden rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card shadow-(--shadow-card) lg:col-span-3">
              <header className="border-b border-border/70 px-5 py-3.5">
                <h2 className="display text-base">{t("expenses.title")}</h2>
              </header>
              <ul className="divide-y divide-border/60">
                {rows.map((expense) => {
                  const days = expense.dueDate ? daysUntil(expense.dueDate) : null
                  const dueSoon =
                    expense.status !== "paid" && days !== null && days <= 14
                  const remaining = expense.amount - expense.paidAmount

                  return (
                    <li key={expense.id} className="flex items-start gap-3 px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openDialog(expense)}
                        className="min-w-0 flex-1 text-left outline-none focus-visible:underline"
                      >
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="truncate font-medium">{expense.title}</span>
                          <ExpenseStatusBadge status={expense.status} />
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {t(`cat.${expense.category}`)}
                          {expense.vendor && expense.vendor !== "—" ? ` · ${expense.vendor}` : ""}
                          {expense.dueDate ? (
                            <span className={cn(dueSoon && "font-medium text-warning-foreground dark:text-warning")}>
                              {" · "}
                              {t("expenses.dueDate")} {formatDate(expense.dueDate, locale, "dayMonth")}
                            </span>
                          ) : null}
                        </span>
                      </button>

                      <div className="shrink-0 text-right">
                        <p className="tnum font-medium">
                          {formatMoney(expense.amount, expense.currency, locale)}
                        </p>
                        {remaining > 0 ? (
                          <button
                            type="button"
                            onClick={() => {
                              updateExpense(expense.id, {
                                paidAmount: expense.amount,
                                status: "paid",
                              })
                              toast.success(`${expense.title} marked paid`)
                            }}
                            className="text-xs text-primary underline-offset-2 outline-none hover:underline focus-visible:underline"
                          >
                            {t("action.markPaid")}
                          </button>
                        ) : (
                          <p className="text-xs text-muted-foreground">{t("status.paid")}</p>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </>
      )}

      <ExpenseDialog event={event} expense={editing} open={open} onOpenChange={setOpen} />
    </div>
  )
}

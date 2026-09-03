"use client"

import * as React from "react"
import {Maximize2, Paperclip, Pencil} from "lucide-react"
import { BrandSpinner } from "@/components/brand/brand-spinner"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ExpenseStatusBadge } from "@/components/shared/status-badge"
import { ImagePreviewDialog } from "@/components/shared/image-preview-dialog"
import { useLocale } from "@/components/providers/locale-provider"
import { formatDate, formatMoney } from "@/lib/format"
import { cloudinaryUrl } from "@/lib/uploads"
import type { Expense } from "@/lib/types"

export function ExpenseDetailsSheet({
  expense,
  loading,
  error,
  open,
  onOpenChange,
  onEdit,
  onMarkPaid,
  onRetry,
}: {
  expense?: Expense
  loading: boolean
  error: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: () => void
  onMarkPaid: () => Promise<void>
  onRetry: () => void
}) {
  const { t, locale } = useLocale()
  const [markingPaid, setMarkingPaid] = React.useState(false)
  const [previewOpen, setPreviewOpen] = React.useState(false)

  const remaining = expense ? Math.max(expense.amount - expense.paidAmount, 0) : 0
  const paidPercent = expense?.amount
    ? Math.min((expense.paidAmount / expense.amount) * 100, 100)
    : 0

  async function markPaid() {
    setMarkingPaid(true)
    try {
      await onMarkPaid()
    } finally {
      setMarkingPaid(false)
    }
  }

  return (
    <>
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setPreviewOpen(false)
        onOpenChange(nextOpen)
      }}
    >
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-5 pt-5 pb-4 pr-12">
          {expense ? (
            <div className="mb-2">
              <ExpenseStatusBadge status={expense.status} />
            </div>
          ) : null}
          <SheetTitle className="text-xl leading-snug">
            {expense?.title ?? t("expenses.details")}
          </SheetTitle>
          <SheetDescription>{t("expenses.detailsDescription")}</SheetDescription>
        </SheetHeader>

        {loading && !expense ? (
          <ExpenseDetailSkeleton />
        ) : error && !expense ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
            <p className="text-sm font-medium">{t("expenses.detailsLoadFailed")}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("expenses.detailsLoadFailedHelp")}
            </p>
            <Button type="button" variant="outline" className="mt-4" onClick={onRetry}>
              {t("action.tryAgain")}
            </Button>
          </div>
        ) : expense ? (
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <section
            aria-labelledby="expense-payment-heading"
            className="rounded-[var(--card-radius)] border border-border bg-card p-4 shadow-(--shadow-card)"
          >
            <h2
              id="expense-payment-heading"
              className="text-xs font-medium text-muted-foreground"
            >
              {t("expenses.totalCost")}
            </h2>
            <p className="display tnum mt-1 text-3xl">
              {formatMoney(expense.amount, expense.currency, locale)}
            </p>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-success transition-[width]"
                style={{ width: `${paidPercent}%` }}
              />
            </div>
            <p className="sr-only">
              {t("expenses.paymentProgress")}: {Math.round(paidPercent)}%
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4">
              <div>
                <dt className="text-xs text-muted-foreground">{t("status.paid")}</dt>
                <dd className="tnum mt-1 font-medium text-success">
                  {formatMoney(expense.paidAmount, expense.currency, locale)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t("expenses.outstanding")}</dt>
                <dd className="tnum mt-1 font-medium">
                  {formatMoney(remaining, expense.currency, locale)}
                </dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="expense-information-heading">
            <h2 id="expense-information-heading" className="mb-2 text-sm font-semibold">
              {t("expenses.information")}
            </h2>
            <dl className="divide-y divide-border overflow-hidden rounded-[var(--card-radius)] border border-border">
              <DetailRow label={t("expenses.category")} value={t(`cat.${expense.category}`)} />
              {expense.vendor && expense.vendor !== "—" ? (
                <DetailRow label={t("expenses.vendor")} value={expense.vendor} />
              ) : null}
              {expense.dueDate ? (
                <DetailRow
                  label={t("expenses.dueDate")}
                  value={formatDate(expense.dueDate, locale, "medium")}
                />
              ) : null}
            </dl>
          </section>

          {expense.note ? (
            <section aria-labelledby="expense-notes-heading">
              <h2 id="expense-notes-heading" className="mb-2 text-sm font-semibold">
                {t("guests.field.notes")}
              </h2>
              <p className="whitespace-pre-wrap rounded-[var(--card-radius)] border border-border bg-muted/30 p-3 text-sm leading-relaxed text-muted-foreground">
                {expense.note}
              </p>
            </section>
          ) : null}

          <section aria-labelledby="expense-receipt-heading">
            <h2 id="expense-receipt-heading" className="mb-2 text-sm font-semibold">
              {t("expenses.receipt")}
            </h2>
            {expense.receiptUrl ? (
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="group block w-full cursor-zoom-in overflow-hidden rounded-[var(--card-radius)] border border-border bg-muted/30 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cloudinaryUrl(expense.receiptUrl, "f_auto,q_auto,c_fit,w_900,h_900")}
                  alt={t("expenses.receipt")}
                  className="max-h-80 w-full object-contain"
                />
                <span className="flex items-center justify-between gap-3 border-t border-border px-3 py-2.5 text-sm font-medium">
                  {t("expenses.receiptPreview")}
                  <Maximize2 className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-3 rounded-[var(--card-radius)] border border-dashed border-border p-3 text-muted-foreground">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-[var(--btn-radius)] bg-muted">
                  <Paperclip className="size-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-medium text-foreground">
                    {t("expenses.noReceipt")}
                  </span>
                  <span className="mt-0.5 block text-xs">{t("expenses.noReceiptHelp")}</span>
                </span>
              </div>
            )}
          </section>
          </div>
        ) : null}

        {expense ? (
          <SheetFooter className="flex-row justify-end border-t border-border px-5 py-4">
          {remaining > 0 ? (
            <Button
              type="button"
              variant="outline"
              disabled={markingPaid}
              onClick={() => void markPaid()}
            >
              {markingPaid ? <BrandSpinner /> : null}
              {t("action.markPaid")}
            </Button>
          ) : null}
          <Button type="button" onClick={onEdit}>
            <Pencil />
            {t("expenses.edit")}
          </Button>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
      <ImagePreviewDialog
        src={expense?.receiptUrl}
        open={previewOpen}
        label={t("expenses.receipt")}
        closeLabel={t("action.close")}
        unavailableLabel={t("expenses.receiptPreviewUnavailable")}
        onOpenChange={setPreviewOpen}
      />
    </>
  )
}

function ExpenseDetailSkeleton() {
  return (
    <div className="min-h-0 flex-1 space-y-6 overflow-hidden px-5 py-5" aria-hidden="true">
      <div className="rounded-[var(--card-radius)] border border-border p-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-2 h-9 w-40" />
        <Skeleton className="mt-5 h-1.5 w-full" />
        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-28 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-44 w-full" />
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-3 py-2.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-medium">{value}</dd>
    </div>
  )
}

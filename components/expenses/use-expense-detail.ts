"use client"

import * as React from "react"
import { getExpense } from "@/lib/budget"
import type { Expense } from "@/lib/types"

type DetailResult = {
  requestKey: string
  selectionKey: string
  expense?: Expense
  error: boolean
}

/**
 * Loads the canonical expense record for the details sheet.
 *
 * Requests are cancelled when the selected row changes or the sheet closes,
 * and each response is tagged with its selection and revision so a slower
 * prior response cannot become the current detail. Refreshes preserve the
 * current record so a payment mutation does not blank the open sheet while it
 * revalidates.
 */
export function useExpenseDetail(eventId: string | undefined, expenseId: string | undefined) {
  const [revision, setRevision] = React.useState(0)
  const [result, setResult] = React.useState<DetailResult | null>(null)
  const selectionKey = `${eventId ?? ""}|${expenseId ?? ""}`
  const requestKey = `${selectionKey}|${revision}`

  React.useEffect(() => {
    if (!eventId || !expenseId) return

    const controller = new AbortController()
    let cancelled = false

    getExpense(eventId, expenseId, controller.signal)
      .then((expense) => {
        if (!cancelled) setResult({ requestKey, selectionKey, expense, error: false })
      })
      .catch(() => {
        if (!cancelled && !controller.signal.aborted) {
          setResult({ requestKey, selectionKey, error: true })
        }
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [eventId, expenseId, requestKey, selectionKey])

  const selected = result?.selectionKey === selectionKey ? result : null
  const settled = selected?.requestKey === requestKey
  const hasSelection = Boolean(eventId && expenseId)

  return {
    expense: selected?.expense,
    loading: hasSelection && (!selected || (!selected.expense && !settled)),
    refreshing: hasSelection && Boolean(selected?.expense) && !settled,
    error: Boolean(settled && selected?.error),
    retry: () => setRevision((current) => current + 1),
    refresh: () => setRevision((current) => current + 1),
  }
}

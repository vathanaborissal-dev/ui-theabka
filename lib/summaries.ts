import type { GuestSummary } from "@/lib/guests"
import type { ExpenseSummary } from "@/lib/budget"
import type { Currency } from "@/lib/types"

/**
 * Picks one currency out of a per-currency total.
 *
 * The API keeps dollars and riel apart on purpose — a combined figure means
 * nothing. The headline tiles show the event's own currency, which is the one
 * a planner is budgeting in; the rest is visible on the money screens.
 */
export function amountIn(
  totals: { currency: Currency; amount?: number; budgeted?: number; paid?: number; outstanding?: number }[] | undefined,
  currency: Currency,
  field: "amount" | "budgeted" | "paid" | "outstanding" = "amount"
) {
  return totals?.find((total) => total.currency === currency)?.[field] ?? 0
}

export function giftCountIn(summary: GuestSummary | undefined, currency: Currency) {
  return summary?.gifts.find((gift) => gift.currency === currency)?.count ?? 0
}

export function expenseTotalIn(
  summary: ExpenseSummary | undefined,
  currency: Currency,
  field: "budgeted" | "paid" | "outstanding"
) {
  return amountIn(summary?.totals, currency, field)
}

import type { Expense, Guest, Task } from "@/lib/types"

export type GuestStats = {
  invitations: number
  invitedSeats: number
  confirmed: number
  declined: number
  pending: number
  maybe: number
  /** Seats covered by confirmed invitations. */
  expectedSeats: number
  attendedInvitations: number
  attendedSeats: number
  responseRate: number
  bySide: Record<"a" | "b" | "shared", { invitations: number; seats: number; confirmed: number }>
}

export function guestStats(guests: Guest[]): GuestStats {
  const stats: GuestStats = {
    invitations: guests.length,
    invitedSeats: 0,
    confirmed: 0,
    declined: 0,
    pending: 0,
    maybe: 0,
    expectedSeats: 0,
    attendedInvitations: 0,
    attendedSeats: 0,
    responseRate: 0,
    bySide: {
      a: { invitations: 0, seats: 0, confirmed: 0 },
      b: { invitations: 0, seats: 0, confirmed: 0 },
      shared: { invitations: 0, seats: 0, confirmed: 0 },
    },
  }

  for (const g of guests) {
    stats.invitedSeats += g.partySize
    stats[g.rsvp] += 1
    if (g.rsvp === "confirmed") stats.expectedSeats += g.partySize
    // "Maybe" replies are counted at half weight for catering planning.
    if (g.rsvp === "maybe") stats.expectedSeats += Math.round(g.partySize / 2)
    if (g.attendance === "attended") {
      stats.attendedInvitations += 1
      stats.attendedSeats += g.attendedCount ?? g.partySize
    }
    const side = stats.bySide[g.side]
    side.invitations += 1
    side.seats += g.partySize
    if (g.rsvp === "confirmed") side.confirmed += 1
  }

  const responded = stats.confirmed + stats.declined + stats.maybe
  stats.responseRate = stats.invitations ? responded / stats.invitations : 0
  return stats
}

export type GiftStats = {
  total: number
  count: number
  average: number
  largest: number
  bySide: Record<"a" | "b" | "shared", number>
  /** Confirmed guests who have not given yet. */
  awaiting: number
}

export function giftStats(guests: Guest[]): GiftStats {
  const withGift = guests.filter((g) => g.gift && g.gift.amount > 0)
  const total = withGift.reduce((sum, g) => sum + (g.gift?.amount ?? 0), 0)
  const bySide = { a: 0, b: 0, shared: 0 }
  for (const g of withGift) bySide[g.side] += g.gift?.amount ?? 0

  return {
    total,
    count: withGift.length,
    average: withGift.length ? total / withGift.length : 0,
    largest: withGift.reduce((max, g) => Math.max(max, g.gift?.amount ?? 0), 0),
    bySide,
    awaiting: guests.filter((g) => g.rsvp === "confirmed" && !g.gift).length,
  }
}

export type ExpenseStats = {
  total: number
  paid: number
  outstanding: number
  byCategory: Array<{ category: Expense["category"]; amount: number; paid: number }>
}

export function expenseStats(expenses: Expense[]): ExpenseStats {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0)
  const paid = expenses.reduce((sum, e) => sum + e.paidAmount, 0)

  const map = new Map<Expense["category"], { amount: number; paid: number }>()
  for (const e of expenses) {
    const entry = map.get(e.category) ?? { amount: 0, paid: 0 }
    entry.amount += e.amount
    entry.paid += e.paidAmount
    map.set(e.category, entry)
  }

  return {
    total,
    paid,
    outstanding: total - paid,
    byCategory: [...map.entries()]
      .map(([category, v]) => ({ category, ...v }))
      .sort((a, b) => b.amount - a.amount),
  }
}

export function taskStats(tasks: Task[]) {
  const done = tasks.filter((t) => t.done).length
  return {
    total: tasks.length,
    done,
    remaining: tasks.length - done,
    progress: tasks.length ? done / tasks.length : 0,
  }
}

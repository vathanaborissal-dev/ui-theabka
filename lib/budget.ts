import { api, apiPaged, apiRequest } from "@/lib/api-client"
import type { Currency, Expense, ExpenseCategory, Task } from "@/lib/types"

/* --------------------------------------------------------------- expenses */

type ExpenseInput = Partial<Omit<Expense, "id" | "eventId">>

/** Small collections — a wedding budget is tens of lines, not thousands. */
const PAGE_SIZE = 200

/**
 * A ceiling on the page walk.
 *
 * These screens read the whole list on purpose: a budget is totalled and a
 * checklist is grouped and counted, and neither means anything shown a page at
 * a time. But "keep asking until the server says stop" is a loop with no bound
 * on it, and an event that somehow held thousands of rows would turn one page
 * view into a burst of requests. Two pages covers four hundred items, which is
 * far past anything either list should reach.
 */
const MAX_PAGES = 2

/**
 * Every expense on an event.
 *
 * Walked rather than paged in the UI because the budget screen totals and
 * charts the whole list; showing page one of a budget would be useless. The
 * endpoint still pages, so the request is bounded either way.
 */
export async function listExpenses(eventId: string) {
  const all: Expense[] = []
  for (let page = 0; page < MAX_PAGES; page++) {
    const { items, meta } = await apiPaged<Expense>(
      `/api/events/${eventId}/expenses?page=${page}&size=${PAGE_SIZE}`,
      { method: "GET" }
    )
    all.push(...items)
    if (!meta.hasMore) break
  }
  return all
}

export function getExpense(eventId: string, expenseId: string, signal?: AbortSignal) {
  return api.get<Expense>(`/api/events/${eventId}/expenses/${expenseId}`, { signal })
}

export type CurrencyTotal = {
  currency: Currency
  budgeted: number
  paid: number
  outstanding: number
  byCategory: Partial<Record<ExpenseCategory, number>>
}

/**
 * Totals per currency, added up by the database.
 *
 * Never a single combined figure: dollars and riel are both in play at a
 * Cambodian wedding and adding them produces a number that means nothing.
 */
export type ExpenseSummary = { lines: number; totals: CurrencyTotal[] }

export function expenseSummary(eventId: string) {
  return api.get<ExpenseSummary>(`/api/events/${eventId}/expenses/summary`)
}

export function addExpense(eventId: string, expense: ExpenseInput & { title: string }) {
  return api.post<Expense>(`/api/events/${eventId}/expenses`, expense)
}

export function updateExpense(eventId: string, expenseId: string, patch: ExpenseInput) {
  return api.patch<Expense>(`/api/events/${eventId}/expenses/${expenseId}`, patch)
}

export function removeExpense(eventId: string, expenseId: string) {
  return apiRequest<void>(`/api/events/${eventId}/expenses/${expenseId}`, { method: "DELETE" })
}

/* ------------------------------------------------------------------ tasks */

type TaskInput = Partial<Omit<Task, "id" | "eventId">>

/** The whole checklist: it is read as a list, not paged through. */
export async function listTasks(eventId: string) {
  const all: Task[] = []
  for (let page = 0; page < MAX_PAGES; page++) {
    const { items, meta } = await apiPaged<Task>(
      `/api/events/${eventId}/tasks?page=${page}&size=${PAGE_SIZE}`,
      { method: "GET" }
    )
    all.push(...items)
    if (!meta.hasMore) break
  }
  return all
}

/**
 * Fills an empty checklist with a starting point for this kind of event.
 *
 * Refused by the server if the list already has items, so this cannot quietly
 * duplicate a checklist someone has worked on.
 */
export function applyStarterTasks(eventId: string) {
  return api.post<Task[]>(`/api/events/${eventId}/tasks/starter`)
}

export type TaskSummary = { total: number; done: number; remaining: number }

export function taskSummary(eventId: string) {
  return api.get<TaskSummary>(`/api/events/${eventId}/tasks/summary`)
}

export function addTask(eventId: string, task: TaskInput & { title: Task["title"] }) {
  return api.post<Task>(`/api/events/${eventId}/tasks`, task)
}

export function updateTask(eventId: string, taskId: string, patch: TaskInput) {
  return api.patch<Task>(`/api/events/${eventId}/tasks/${taskId}`, patch)
}

export function removeTask(eventId: string, taskId: string) {
  return apiRequest<void>(`/api/events/${eventId}/tasks/${taskId}`, { method: "DELETE" })
}

"use client"

import * as React from "react"
import { seedActivity, seedEvents, seedExpenses, seedGuests, seedTasks } from "@/lib/data/seed"
import type {
  Activity,
  EventRecord,
  Expense,
  Guest,
  InvitationDesign,
  Task,
} from "@/lib/types"

/* ---------------------------------------------------------------------------
 * In-memory store standing in for the API.
 *
 * Everything the UI mutates lives here, so the prototype behaves like the real
 * product within a session: adding a guest updates the dashboard totals, an
 * RSVP change moves the chart, and so on. Swapping this for real data means
 * replacing the action bodies with fetch calls — the component tree does not
 * change.
 * ------------------------------------------------------------------------- */

type DataContextValue = {
  events: EventRecord[]
  guests: Guest[]
  expenses: Expense[]
  tasks: Task[]
  activity: Activity[]

  createEvent: (event: EventRecord) => void
  updateEvent: (eventId: string, patch: Partial<EventRecord>) => void
  updateDesign: (eventId: string, patch: Partial<InvitationDesign>) => void

  addGuest: (guest: Guest) => void
  updateGuest: (guestId: string, patch: Partial<Guest>) => void
  updateGuests: (guestIds: string[], patch: Partial<Guest>) => void
  removeGuests: (guestIds: string[]) => void

  addExpense: (expense: Expense) => void
  updateExpense: (expenseId: string, patch: Partial<Expense>) => void
  removeExpense: (expenseId: string) => void

  addTask: (task: Task) => void
  updateTask: (taskId: string, patch: Partial<Task>) => void
  removeTask: (taskId: string) => void
}

const DataContext = React.createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = React.useState<EventRecord[]>(seedEvents)
  const [guests, setGuests] = React.useState<Guest[]>(seedGuests)
  const [expenses, setExpenses] = React.useState<Expense[]>(seedExpenses)
  const [tasks, setTasks] = React.useState<Task[]>(seedTasks)
  const [activity, setActivity] = React.useState<Activity[]>(seedActivity)

  const logActivity = React.useCallback((entry: Omit<Activity, "id" | "at">) => {
    setActivity((prev) => [
      { ...entry, id: `ac_${Date.now()}_${prev.length}`, at: new Date().toISOString() },
      ...prev,
    ])
  }, [])

  const value = React.useMemo<DataContextValue>(
    () => ({
      events,
      guests,
      expenses,
      tasks,
      activity,

      createEvent: (event) => setEvents((prev) => [event, ...prev]),

      updateEvent: (eventId, patch) =>
        setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, ...patch } : e))),

      updateDesign: (eventId, patch) =>
        setEvents((prev) =>
          prev.map((e) => (e.id === eventId ? { ...e, design: { ...e.design, ...patch } } : e))
        ),

      addGuest: (guest) => {
        setGuests((prev) => [guest, ...prev])
        logActivity({
          eventId: guest.eventId,
          kind: "guest",
          message: { en: `${guest.name} added to the guest list`, km: `${guest.nameKm || guest.name} ត្រូវបានបញ្ចូលក្នុងបញ្ជីភ្ញៀវ` },
        })
      },

      updateGuest: (guestId, patch) =>
        setGuests((prev) => prev.map((g) => (g.id === guestId ? { ...g, ...patch } : g))),

      updateGuests: (guestIds, patch) => {
        const ids = new Set(guestIds)
        setGuests((prev) => prev.map((g) => (ids.has(g.id) ? { ...g, ...patch } : g)))
      },

      removeGuests: (guestIds) => {
        const ids = new Set(guestIds)
        setGuests((prev) => prev.filter((g) => !ids.has(g.id)))
      },

      addExpense: (expense) => setExpenses((prev) => [expense, ...prev]),
      updateExpense: (expenseId, patch) =>
        setExpenses((prev) => prev.map((e) => (e.id === expenseId ? { ...e, ...patch } : e))),
      removeExpense: (expenseId) => setExpenses((prev) => prev.filter((e) => e.id !== expenseId)),

      addTask: (task) => setTasks((prev) => [...prev, task]),
      updateTask: (taskId, patch) =>
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...patch } : t))),
      removeTask: (taskId) => setTasks((prev) => prev.filter((t) => t.id !== taskId)),
    }),
    [events, guests, expenses, tasks, activity, logActivity]
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = React.useContext(DataContext)
  if (!ctx) throw new Error("useData must be used inside <DataProvider>")
  return ctx
}

/** Everything belonging to one event, memoised. */
export function useEventData(eventId: string) {
  const data = useData()
  return React.useMemo(() => {
    const event = data.events.find((e) => e.id === eventId || e.slug === eventId)
    const id = event?.id
    return {
      event,
      guests: id ? data.guests.filter((g) => g.eventId === id) : [],
      expenses: id ? data.expenses.filter((e) => e.eventId === id) : [],
      tasks: id ? data.tasks.filter((t) => t.eventId === id) : [],
      activity: id ? data.activity.filter((a) => a.eventId === id) : [],
    }
  }, [data, eventId])
}

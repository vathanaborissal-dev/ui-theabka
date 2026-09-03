"use client"

import * as React from "react"
import { seedActivity } from "@/lib/data/seed"
import { useAuth } from "@/components/providers/auth-provider"
import {
  createEvent as createEventRequest,
  deleteEvent as deleteEventRequest,
  listEvents,
  publishEvent as publishEventRequest,
  unpublishEvent as unpublishEventRequest,
  updateEvent as updateEventRequest,
} from "@/lib/events"
import {
  addGuest as addGuestRequest,
  importGuests as importGuestsRequest,
  listAllGuests,
  removeGuests as removeGuestsRequest,
  updateGuest as updateGuestRequest,
  updateGuests as updateGuestsRequest,
  type ImportableGuest,
} from "@/lib/guests"
import {
  addExpense as addExpenseRequest,
  addTask as addTaskRequest,
  applyStarterTasks,
  listExpenses,
  listTasks,
  removeExpense as removeExpenseRequest,
  removeTask as removeTaskRequest,
  updateExpense as updateExpenseRequest,
  updateTask as updateTaskRequest,
} from "@/lib/budget"
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

export type EventSaveState = "idle" | "saving" | "saved" | "error"

type DataContextValue = {
  events: EventRecord[]
  eventsLoading: boolean
  eventsError?: string
  eventSaveState: Record<string, EventSaveState>
  guests: Guest[]
  expenses: Expense[]
  tasks: Task[]
  activity: Activity[]

  reloadEvents: () => Promise<void>
  createEvent: (event: EventRecord) => Promise<EventRecord>
  updateEvent: (eventId: string, patch: Partial<EventRecord>) => void
  updateDesign: (eventId: string, patch: Partial<InvitationDesign>) => void
  publishEvent: (eventId: string) => Promise<EventRecord>
  unpublishEvent: (eventId: string) => Promise<EventRecord>
  removeEvent: (eventId: string) => Promise<void>

  guestsLoading: boolean
  /** Loads an event's guests once, on first view. */
  ensureGuests: (eventId: string) => void
  reloadGuests: (eventId: string) => Promise<void>
  addGuest: (eventId: string, guest: Partial<Guest> & { name: string }) => Promise<Guest>
  importGuests: (eventId: string, guests: ImportableGuest[]) => Promise<Guest[]>
  /**
   * The event is passed rather than looked up.
   *
   * These used to find it by searching the provider's guest cache, which is
   * only populated by the screens that load every row. The paged guest table
   * does not, so every edit made from it silently did nothing — no request, no
   * error, and a success toast regardless. An explicit event id cannot go
   * quietly missing.
   */
  updateGuest: (eventId: string, guestId: string, patch: Partial<Guest>) => Promise<void>
  updateGuests: (eventId: string, guestIds: string[], patch: Partial<Guest>) => Promise<void>
  removeGuests: (eventId: string, guestIds: string[]) => Promise<void>

  /** Loads an event's budget and checklist once, on first view. */
  ensureBudget: (eventId: string) => void
  budgetLoading: boolean

  addExpense: (eventId: string, expense: Partial<Expense> & { title: string }) => Promise<Expense>
  updateExpense: (expenseId: string, patch: Partial<Expense>) => Promise<void>
  removeExpense: (expenseId: string) => Promise<void>

  addTask: (eventId: string, task: Partial<Task> & { title: Task["title"] }) => Promise<Task>
  /** Seeds an empty checklist with a starting point for the event type. */
  startChecklist: (eventId: string) => Promise<number>
  updateTask: (taskId: string, patch: Partial<Task>) => Promise<void>
  removeTask: (taskId: string) => Promise<void>
}

const DataContext = React.createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [events, setEvents] = React.useState<EventRecord[]>([])
  const [eventsLoading, setEventsLoading] = React.useState(true)
  const [eventsError, setEventsError] = React.useState<string>()
  const [eventSaveState, setEventSaveState] = React.useState<Record<string, EventSaveState>>({})
  const [guests, setGuests] = React.useState<Guest[]>([])
  const [guestsLoading, setGuestsLoading] = React.useState(false)
  const [expenses, setExpenses] = React.useState<Expense[]>([])
  const [tasks, setTasks] = React.useState<Task[]>([])
  const [budgetLoading, setBudgetLoading] = React.useState(false)
  const [activity, setActivity] = React.useState<Activity[]>(seedActivity)

  const eventsRef = React.useRef<EventRecord[]>([])
  const guestsRef = React.useRef<Guest[]>([])
  // Events whose guests have been fetched, so a revisit does not refetch.
  const loadedGuestEvents = React.useRef(new Set<string>())
  const pendingEventPatches = React.useRef(new Map<string, Partial<EventRecord>>())
  const eventSaveTimers = React.useRef(new Map<string, number>())
  const eventSaveChains = React.useRef(new Map<string, Promise<void>>())
  const loadGeneration = React.useRef(0)

  const replaceEvents = React.useCallback(
    (update: (current: EventRecord[]) => EventRecord[]) => {
      setEvents((current) => {
        const next = update(current)
        eventsRef.current = next
        return next
      })
    },
    []
  )

  const setSaveState = React.useCallback((eventId: string, state: EventSaveState) => {
    setEventSaveState((current) => ({ ...current, [eventId]: state }))
  }, [])

  const reloadEvents = React.useCallback(async () => {
    const generation = ++loadGeneration.current

    if (authLoading) return
    if (!user) {
      replaceEvents(() => [])
      setEventsError(undefined)
      setEventsLoading(false)
      return
    }

    setEventsLoading(true)
    setEventsError(undefined)
    try {
      const loaded = await listEvents()
      if (generation !== loadGeneration.current) return
      replaceEvents(() => loaded)
    } catch {
      if (generation !== loadGeneration.current) return
      setEventsError("Could not load your events. Check that the API is running and try again.")
    } finally {
      if (generation === loadGeneration.current) setEventsLoading(false)
    }
  }, [authLoading, replaceEvents, user])

  React.useEffect(() => {
    const timer = window.setTimeout(() => void reloadEvents(), 0)
    return () => window.clearTimeout(timer)
  }, [reloadEvents])

  React.useEffect(() => {
    const timers = eventSaveTimers.current
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [])

  const flushEvent = React.useCallback(
    (eventId: string): Promise<void> => {
      const timer = eventSaveTimers.current.get(eventId)
      if (timer) {
        window.clearTimeout(timer)
        eventSaveTimers.current.delete(eventId)
      }

      const patch = pendingEventPatches.current.get(eventId)
      if (!patch) return eventSaveChains.current.get(eventId) ?? Promise.resolve()
      pendingEventPatches.current.delete(eventId)

      const previous = eventSaveChains.current.get(eventId) ?? Promise.resolve()
      const task = previous
        .catch(() => undefined)
        .then(async () => {
          setSaveState(eventId, "saving")
          const saved = await updateEventRequest(eventId, patch)
          replaceEvents((current) =>
            current.map((event) => {
              if (event.id !== eventId) return event
              const newer = pendingEventPatches.current.get(eventId)
              return newer ? { ...saved, ...newer } : saved
            })
          )
          if (!pendingEventPatches.current.has(eventId)) setSaveState(eventId, "saved")
        })
        .catch((error) => {
          setSaveState(eventId, "error")
          setEventsError("Some event changes could not be saved. Please try again.")
          throw error
        })

      eventSaveChains.current.set(eventId, task)
      void task.finally(() => {
        if (eventSaveChains.current.get(eventId) === task) {
          eventSaveChains.current.delete(eventId)
        }
      }).catch(() => undefined)
      return task
    },
    [replaceEvents, setSaveState]
  )

  const queueEventPatch = React.useCallback(
    (eventId: string, patch: Partial<EventRecord>) => {
      replaceEvents((current) =>
        current.map((event) =>
          event.id === eventId
            ? {
                ...event,
                ...patch,
                // Any edit to a published invitation creates a pending change.
                // The server says so too, but only after the debounce and the
                // round trip — and a "published" badge that stays clean for a
                // second after you type is telling the couple something false.
                hasUnpublishedChanges:
                  event.status === "published" ? true : event.hasUnpublishedChanges,
              }
            : event
        )
      )
      pendingEventPatches.current.set(eventId, {
        ...pendingEventPatches.current.get(eventId),
        ...patch,
      })
      setSaveState(eventId, "saving")

      const previousTimer = eventSaveTimers.current.get(eventId)
      if (previousTimer) window.clearTimeout(previousTimer)
      const timer = window.setTimeout(() => {
        eventSaveTimers.current.delete(eventId)
        void flushEvent(eventId).catch(() => undefined)
      }, 500)
      eventSaveTimers.current.set(eventId, timer)
    },
    [flushEvent, replaceEvents, setSaveState]
  )

  const logActivity = React.useCallback((entry: Omit<Activity, "id" | "at">) => {
    setActivity((prev) => [
      { ...entry, id: `ac_${Date.now()}_${prev.length}`, at: new Date().toISOString() },
      ...prev,
    ])
  }, [])

  const replaceGuests = React.useCallback(
    (update: (current: Guest[]) => Guest[]) => {
      setGuests((current) => {
        const next = update(current)
        guestsRef.current = next
        return next
      })
    },
    []
  )

  const reloadGuests = React.useCallback(
    async (eventId: string) => {
      setGuestsLoading(true)
      try {
        // The provider's cache backs the dashboard, check-in and gift
        // screens, which all need the whole list. The guest table pages
        // against the API directly instead of reading this.
        const loaded = await listAllGuests(eventId)
        loadedGuestEvents.current.add(eventId)
        // Replaces only this event's rows; other events stay as they are.
        replaceGuests((current) => [
          ...current.filter((guest) => guest.eventId !== eventId),
          ...loaded,
        ])
      } finally {
        setGuestsLoading(false)
      }
    },
    [replaceGuests]
  )

  const ensureGuests = React.useCallback(
    (eventId: string) => {
      if (!eventId || loadedGuestEvents.current.has(eventId)) return
      // Marked before the request so a double render does not fetch twice.
      loadedGuestEvents.current.add(eventId)
      void reloadGuests(eventId).catch(() => {
        // Allow a retry on the next visit rather than showing an empty list
        // forever because one request failed.
        loadedGuestEvents.current.delete(eventId)
      })
    },
    [reloadGuests]
  )

  /**
   * Guest edits are applied locally first and rolled back if the server
   * refuses. The guest table is edited inline, cell by cell, and waiting for a
   * round trip on every keystroke would make it feel broken.
   */
  const withRollback = React.useCallback(
    async (optimistic: (current: Guest[]) => Guest[], request: () => Promise<unknown>) => {
      const before = guestsRef.current
      replaceGuests(optimistic)
      try {
        await request()
      } catch (error) {
        replaceGuests(() => before)
        throw error
      }
    },
    [replaceGuests]
  )

  const addGuest = React.useCallback(
    async (eventId: string, guest: Partial<Guest> & { name: string }) => {
      const created = await addGuestRequest(eventId, guest)
      replaceGuests((current) => [...current, created])
      logActivity({
        eventId,
        kind: "guest",
        message: {
          en: `${created.name} added to the guest list`,
          km: `${created.nameKm || created.name} ត្រូវបានបញ្ចូលក្នុងបញ្ជីភ្ញៀវ`,
        },
      })
      return created
    },
    [logActivity, replaceGuests]
  )

  const importGuests = React.useCallback(
    async (eventId: string, incoming: ImportableGuest[]) => {
      const created = await importGuestsRequest(eventId, incoming)
      replaceGuests((current) => [...current, ...created])
      return created
    },
    [replaceGuests]
  )

  const updateGuest = React.useCallback(
    async (eventId: string, guestId: string, patch: Partial<Guest>) => {
      await withRollback(
        (current) => current.map((g) => (g.id === guestId ? { ...g, ...patch } : g)),
        () => updateGuestRequest(eventId, guestId, patch)
      )
    },
    [withRollback]
  )

  const updateGuests = React.useCallback(
    async (eventId: string, guestIds: string[], patch: Partial<Guest>) => {
      const ids = new Set(guestIds)
      await withRollback(
        (current) => current.map((g) => (ids.has(g.id) ? { ...g, ...patch } : g)),
        () => updateGuestsRequest(eventId, guestIds, patch)
      )
    },
    [withRollback]
  )

  const removeGuests = React.useCallback(
    async (eventId: string, guestIds: string[]) => {
      const ids = new Set(guestIds)
      await withRollback(
        (current) => current.filter((g) => !ids.has(g.id)),
        () => removeGuestsRequest(eventId, guestIds)
      )
    },
    [withRollback]
  )

  const expensesRef = React.useRef<Expense[]>([])
  const tasksRef = React.useRef<Task[]>([])
  const loadedBudgetEvents = React.useRef(new Set<string>())

  /**
   * The budget and checklist for one event.
   *
   * Loaded together because the screens that want one usually want the other —
   * the dashboard shows spend and outstanding tasks side by side — and both
   * are small enough that a second round trip costs more than the rows do.
   */
  const ensureBudget = React.useCallback((eventId: string) => {
    if (!eventId || loadedBudgetEvents.current.has(eventId)) return
    loadedBudgetEvents.current.add(eventId)
    setBudgetLoading(true)

    void Promise.all([listExpenses(eventId), listTasks(eventId)])
      .then(([loadedExpenses, loadedTasks]) => {
        setExpenses((current) => {
          const next = [...current.filter((e) => e.eventId !== eventId), ...loadedExpenses]
          expensesRef.current = next
          return next
        })
        setTasks((current) => {
          const next = [...current.filter((t) => t.eventId !== eventId), ...loadedTasks]
          tasksRef.current = next
          return next
        })
      })
      .catch(() => {
        // Allow a retry on the next visit rather than showing an empty budget
        // for the rest of the session because one request failed.
        loadedBudgetEvents.current.delete(eventId)
      })
      .finally(() => setBudgetLoading(false))
  }, [])

  const addExpense = React.useCallback(
    async (eventId: string, expense: Partial<Expense> & { title: string }) => {
      const created = await addExpenseRequest(eventId, expense)
      setExpenses((current) => {
        const next = [...current, created]
        expensesRef.current = next
        return next
      })
      return created
    },
    []
  )

  const updateExpense = React.useCallback(async (expenseId: string, patch: Partial<Expense>) => {
    const existing = expensesRef.current.find((e) => e.id === expenseId)
    if (!existing) return
    const before = expensesRef.current
    // Applied locally first: the budget table is edited inline, and a round
    // trip per field would make it feel broken.
    setExpenses((current) => {
      const next = current.map((e) => (e.id === expenseId ? { ...e, ...patch } : e))
      expensesRef.current = next
      return next
    })
    try {
      // The server derives status and outstanding from the amounts, so the
      // saved row replaces the guess rather than merging with it.
      const saved = await updateExpenseRequest(existing.eventId, expenseId, patch)
      setExpenses((current) => {
        const next = current.map((e) => (e.id === expenseId ? saved : e))
        expensesRef.current = next
        return next
      })
    } catch (error) {
      setExpenses(() => {
        expensesRef.current = before
        return before
      })
      throw error
    }
  }, [])

  const removeExpense = React.useCallback(async (expenseId: string) => {
    const existing = expensesRef.current.find((e) => e.id === expenseId)
    if (!existing) return
    await removeExpenseRequest(existing.eventId, expenseId)
    setExpenses((current) => {
      const next = current.filter((e) => e.id !== expenseId)
      expensesRef.current = next
      return next
    })
  }, [])

  const addTask = React.useCallback(
    async (eventId: string, task: Partial<Task> & { title: Task["title"] }) => {
      const created = await addTaskRequest(eventId, task)
      setTasks((current) => {
        const next = [...current, created]
        tasksRef.current = next
        return next
      })
      return created
    },
    []
  )

  const startChecklist = React.useCallback(async (eventId: string) => {
    const created = await applyStarterTasks(eventId)
    setTasks((current) => {
      const next = [...current, ...created]
      tasksRef.current = next
      return next
    })
    return created.length
  }, [])

  const updateTask = React.useCallback(async (taskId: string, patch: Partial<Task>) => {
    const existing = tasksRef.current.find((t) => t.id === taskId)
    if (!existing) return
    const before = tasksRef.current
    setTasks((current) => {
      const next = current.map((t) => (t.id === taskId ? { ...t, ...patch } : t))
      tasksRef.current = next
      return next
    })
    try {
      await updateTaskRequest(existing.eventId, taskId, patch)
    } catch (error) {
      setTasks(() => {
        tasksRef.current = before
        return before
      })
      throw error
    }
  }, [])

  const removeTask = React.useCallback(async (taskId: string) => {
    const existing = tasksRef.current.find((t) => t.id === taskId)
    if (!existing) return
    await removeTaskRequest(existing.eventId, taskId)
    setTasks((current) => {
      const next = current.filter((t) => t.id !== taskId)
      tasksRef.current = next
      return next
    })
  }, [])

  const createEvent = React.useCallback(async (event: EventRecord) => {
    const saved = await createEventRequest(event)
    replaceEvents((current) => [saved, ...current])
    return saved
  }, [replaceEvents])

  const updateEvent = React.useCallback(
    (eventId: string, patch: Partial<EventRecord>) => queueEventPatch(eventId, patch),
    [queueEventPatch]
  )

  const updateDesign = React.useCallback(
    (eventId: string, patch: Partial<InvitationDesign>) => {
      const event = eventsRef.current.find((candidate) => candidate.id === eventId)
      if (!event) return
      queueEventPatch(eventId, { design: { ...event.design, ...patch } })
    },
    [queueEventPatch]
  )

  const publishEvent = React.useCallback(async (eventId: string) => {
    await flushEvent(eventId)
    const saved = await publishEventRequest(eventId)
    replaceEvents((current) => current.map((event) => (event.id === eventId ? saved : event)))
    return saved
  }, [flushEvent, replaceEvents])

  const unpublishEvent = React.useCallback(async (eventId: string) => {
    await flushEvent(eventId)
    const saved = await unpublishEventRequest(eventId)
    replaceEvents((current) => current.map((event) => (event.id === eventId ? saved : event)))
    return saved
  }, [flushEvent, replaceEvents])

  const removeEvent = React.useCallback(async (eventId: string) => {
    const timer = eventSaveTimers.current.get(eventId)
    if (timer) window.clearTimeout(timer)
    eventSaveTimers.current.delete(eventId)
    pendingEventPatches.current.delete(eventId)
    await deleteEventRequest(eventId)
    replaceEvents((current) => current.filter((event) => event.id !== eventId))
  }, [replaceEvents])

  const value = React.useMemo<DataContextValue>(
    () => ({
      events,
      eventsLoading,
      eventsError,
      eventSaveState,
      guests,
      expenses,
      tasks,
      activity,

      reloadEvents,
      createEvent,
      updateEvent,
      updateDesign,
      publishEvent,
      unpublishEvent,
      removeEvent,

      guestsLoading,
      ensureGuests,
      reloadGuests,
      addGuest,
      importGuests,
      updateGuest,
      updateGuests,
      removeGuests,

      ensureBudget,
      budgetLoading,
      addExpense,
      updateExpense,
      removeExpense,
      addTask,
      startChecklist,
      updateTask,
      removeTask,
    }),
    [
      events,
      eventsLoading,
      eventsError,
      eventSaveState,
      guests,
      expenses,
      tasks,
      activity,
      reloadEvents,
      createEvent,
      updateEvent,
      updateDesign,
      publishEvent,
      unpublishEvent,
      removeEvent,
      guestsLoading,
      ensureGuests,
      reloadGuests,
      addGuest,
      importGuests,
      updateGuest,
      updateGuests,
      removeGuests,
      ensureBudget,
      budgetLoading,
      addExpense,
      updateExpense,
      removeExpense,
      addTask,
      startChecklist,
      updateTask,
      removeTask,
    ]
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

/**
 * The whole guest list for one event, fetched on demand.
 *
 * Only for screens that really do need every row at once — check-in works
 * through the entire list at the door, gifts totals every guest, and the share
 * screen prints a link per guest. Anything rendering a table should page.
 */
export function useAllGuests(eventId: string | undefined) {
  const { ensureGuests, guests, guestsLoading } = useData()

  React.useEffect(() => {
    if (eventId) ensureGuests(eventId)
  }, [ensureGuests, eventId])

  return {
    guests: React.useMemo(
      () => (eventId ? guests.filter((guest) => guest.eventId === eventId) : []),
      [guests, eventId]
    ),
    loading: guestsLoading,
  }
}

/**
 * Loads an event's budget and checklist on first view.
 *
 * Opt-in for the same reason guests are: most screens want an event, not its
 * whole budget, and a hook that fetched everything for everyone is what made
 * the guest list slow.
 */
export function useBudget(eventId: string | undefined) {
  const { ensureBudget, budgetLoading } = useData()

  React.useEffect(() => {
    if (eventId) ensureBudget(eventId)
  }, [ensureBudget, eventId])

  return { loading: budgetLoading }
}

export function useData() {
  const ctx = React.useContext(DataContext)
  if (!ctx) throw new Error("useData must be used inside <DataProvider>")
  return ctx
}

/** Everything belonging to one event, memoised. */
/**
 * Everything belonging to one event.
 *
 * Guests are NOT fetched here. Nine screens call this hook and most of them
 * want an event, not eight hundred guest rows — the invitation builder reads a
 * single count. Screens that genuinely need the whole list ask for it with
 * {@link useAllGuests}; the guest table pages against the API instead.
 */
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

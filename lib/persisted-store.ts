/**
 * A tiny localStorage-backed store designed for `useSyncExternalStore`.
 *
 * Reading persisted preferences in an effect and calling setState causes a
 * cascading render on every mount (and races with any effect that writes).
 * An external store lets React read the real value during render on the
 * client, fall back to the SSR default on the server, and stay in sync across
 * browser tabs for free.
 */
export type PersistedStore<T extends string> = {
  subscribe: (onChange: () => void) => () => void
  getSnapshot: () => T
  getServerSnapshot: () => T
  set: (value: T) => void
}

export function createPersistedStore<T extends string>(
  key: string,
  fallback: T,
  isValid: (value: string) => boolean = () => true
): PersistedStore<T> {
  const listeners = new Set<() => void>()
  let cached: T | null = null

  const emit = () => {
    cached = null
    listeners.forEach((listener) => listener())
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === key) emit()
  }

  return {
    subscribe(onChange) {
      listeners.add(onChange)
      window.addEventListener("storage", onStorage)
      return () => {
        listeners.delete(onChange)
        if (listeners.size === 0) window.removeEventListener("storage", onStorage)
      }
    },
    // Cached so repeated reads return a referentially stable value; React
    // calls getSnapshot on every render and bails out only if it is unchanged.
    getSnapshot() {
      if (cached === null) {
        const stored = window.localStorage.getItem(key)
        cached = stored && isValid(stored) ? (stored as T) : fallback
      }
      return cached
    },
    getServerSnapshot() {
      return fallback
    },
    set(value) {
      window.localStorage.setItem(key, value)
      emit()
    },
  }
}

"use client"

import * as React from "react"
import { createPersistedStore } from "@/lib/persisted-store"
import { dictionaries, type DictKey } from "@/lib/i18n/dictionary"
import type { Locale, LocalizedText } from "@/lib/types"

const LOCALE_STORAGE_KEY = "theabka.locale"

const localeStore = createPersistedStore<Locale>(
  LOCALE_STORAGE_KEY,
  "en",
  (value) => value === "en" || value === "km"
)

type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  /** Translate a UI string key. */
  t: (key: DictKey) => string
  /** Resolve a bilingual value from data, falling back to the other language. */
  L: (value: LocalizedText | undefined) => string
}

const LocaleContext = React.createContext<LocaleContextValue | null>(null)

/**
 * `persist: false` gives a subtree its own language that is not written to
 * storage — the public invitation uses it so a guest switching to Khmer does
 * not change the language of the couple's dashboard.
 *
 * Passing `locale` makes it controlled, for when something outside the subtree
 * owns the choice: the builder's preview is switched from a toggle in the
 * editor chrome, which sits above the provider and so cannot reach into it.
 */
export function LocaleProvider({
  children,
  initialLocale = "en",
  locale,
  persist = true,
}: {
  children: React.ReactNode
  initialLocale?: Locale
  /** Controlled language. Overrides `persist` and `initialLocale`. */
  locale?: Locale
  persist?: boolean
}) {
  if (locale) {
    return <ControlledLocaleProvider locale={locale}>{children}</ControlledLocaleProvider>
  }
  return persist ? (
    <PersistedLocaleProvider>{children}</PersistedLocaleProvider>
  ) : (
    <LocalLocaleProvider initialLocale={initialLocale}>{children}</LocalLocaleProvider>
  )
}

/**
 * Language owned by the caller.
 *
 * `setLocale` is a no-op rather than local state: something above is already
 * the source of truth, and letting a child set a competing value here would
 * make the toggle and the preview disagree about which language is showing.
 */
function ControlledLocaleProvider({
  children,
  locale,
}: {
  children: React.ReactNode
  locale: Locale
}) {
  const noop = React.useCallback(() => {}, [])
  return (
    <LocaleContext.Provider value={useLocaleValue(locale, noop)}>
      {children}
    </LocaleContext.Provider>
  )
}

function PersistedLocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = React.useSyncExternalStore(
    localeStore.subscribe,
    localeStore.getSnapshot,
    localeStore.getServerSnapshot
  )
  return (
    <LocaleContext.Provider value={useLocaleValue(locale, localeStore.set)}>
      {children}
    </LocaleContext.Provider>
  )
}

function LocalLocaleProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode
  initialLocale: Locale
}) {
  const [locale, setLocale] = React.useState<Locale>(initialLocale)
  return (
    <LocaleContext.Provider value={useLocaleValue(locale, setLocale)}>
      {children}
    </LocaleContext.Provider>
  )
}

function useLocaleValue(locale: Locale, setLocale: (locale: Locale) => void) {
  return React.useMemo<LocaleContextValue>(() => {
    const dict = dictionaries[locale]
    return {
      locale,
      setLocale,
      t: (key) => dict[key] ?? dictionaries.en[key] ?? key,
      L: (value) => {
        if (!value) return ""
        const primary = value[locale]?.trim()
        if (primary) return primary
        return (locale === "en" ? value.km : value.en)?.trim() ?? ""
      },
    }
  }, [locale, setLocale])
}

export function useLocale() {
  const ctx = React.useContext(LocaleContext)
  if (!ctx) throw new Error("useLocale must be used inside <LocaleProvider>")
  return ctx
}

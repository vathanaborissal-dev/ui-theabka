import type { Currency, Locale } from "@/lib/types"

const KHMER_DIGITS = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"]

const KHMER_MONTHS = [
  "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា",
  "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ",
]

const KHMER_WEEKDAYS = [
  "អាទិត្យ", "ច័ន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍",
]

/** Renders Latin digits in Khmer numerals, leaving other characters intact. */
export function toKhmerDigits(input: string | number) {
  return String(input).replace(/\d/g, (d) => KHMER_DIGITS[Number(d)])
}

export function formatNumber(value: number, locale: Locale = "en") {
  const formatted = new Intl.NumberFormat("en-US").format(value)
  return locale === "km" ? toKhmerDigits(formatted) : formatted
}

/**
 * Money. Cambodia runs on USD for large amounts and riel for small ones, so
 * both are supported; riel is always whole-number.
 */
export function formatMoney(amount: number, currency: Currency = "USD", locale: Locale = "en") {
  if (currency === "KHR") {
    const n = new Intl.NumberFormat("en-US").format(Math.round(amount))
    return locale === "km" ? `${toKhmerDigits(n)} ៛` : `៛${n}`
  }
  const hasCents = Math.abs(amount % 1) > 0.001
  const n = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(amount)
  return locale === "km" ? `$${toKhmerDigits(n)}` : `$${n}`
}

/**
 * Compact money for dense stat tiles: $19.5k.
 *
 * Khmer keeps the full number — a Latin "k" suffix next to Khmer numerals is
 * neither idiomatic nor readable, and the digits fit at these sizes anyway.
 */
export function formatMoneyCompact(amount: number, currency: Currency = "USD", locale: Locale = "en") {
  if (locale === "km" || Math.abs(amount) < 10000) return formatMoney(amount, currency, locale)
  const value = amount / 1000
  const n = value.toFixed(value >= 100 ? 0 : 1).replace(/\.0$/, "")
  return currency === "KHR" ? `${n}k ៛` : `$${n}k`
}

type DateStyle = "full" | "long" | "medium" | "short" | "dayMonth"

export function formatDate(iso: string, locale: Locale = "en", style: DateStyle = "medium") {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""

  if (locale === "km") {
    const day = toKhmerDigits(d.getDate())
    const month = KHMER_MONTHS[d.getMonth()]
    const year = toKhmerDigits(d.getFullYear())
    const weekday = KHMER_WEEKDAYS[d.getDay()]
    switch (style) {
      case "full":
        return `ថ្ងៃ${weekday} ទី${day} ខែ${month} ឆ្នាំ${year}`
      case "long":
        return `ទី${day} ខែ${month} ឆ្នាំ${year}`
      case "dayMonth":
        return `${day} ${month}`
      case "short":
        return `${day}/${toKhmerDigits(d.getMonth() + 1)}/${year}`
      default:
        return `${day} ${month} ${year}`
    }
  }

  const options: Record<DateStyle, Intl.DateTimeFormatOptions> = {
    full: { weekday: "long", day: "numeric", month: "long", year: "numeric" },
    long: { day: "numeric", month: "long", year: "numeric" },
    medium: { day: "numeric", month: "short", year: "numeric" },
    short: { day: "2-digit", month: "2-digit", year: "numeric" },
    dayMonth: { day: "numeric", month: "short" },
  }
  return new Intl.DateTimeFormat("en-GB", options[style]).format(d)
}

/**
 * "17:00" or an ISO string → "5:00 PM" / "ម៉ោង ៥:០០ ល្ងាច".
 * `compact` drops the Khmer "ម៉ោង" prefix, for narrow timeline columns.
 */
export function formatTime(value: string, locale: Locale = "en", compact = false) {
  let hours: number
  let minutes: number
  if (/^\d{1,2}:\d{2}$/.test(value)) {
    ;[hours, minutes] = value.split(":").map(Number)
  } else {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return ""
    hours = d.getHours()
    minutes = d.getMinutes()
  }

  if (locale === "km") {
    // Khmer splits the day into named parts rather than AM/PM.
    const part =
      hours < 12 ? "ព្រឹក" : hours < 13 ? "ថ្ងៃត្រង់" : hours < 18 ? "រសៀល" : hours < 20 ? "ល្ងាច" : "យប់"
    const h12 = hours % 12 === 0 ? 12 : hours % 12
    const clock = `${toKhmerDigits(h12)}:${toKhmerDigits(String(minutes).padStart(2, "0"))}`
    return compact ? `${clock} ${part}` : `ម៉ោង ${clock} ${part}`
  }
  const h12 = hours % 12 === 0 ? 12 : hours % 12
  const suffix = hours < 12 ? "AM" : "PM"
  return `${h12}:${String(minutes).padStart(2, "0")} ${suffix}`
}

/** Whole days from `now` until the event. Negative once it has passed. */
export function daysUntil(iso: string, now: Date = new Date()) {
  const target = new Date(iso)
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate())
  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((startOfTarget.getTime() - startOfNow.getTime()) / 86400000)
}

export function timeParts(iso: string, now: Date = new Date()) {
  const diff = Math.max(0, new Date(iso).getTime() - now.getTime())
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export function formatRelative(iso: string, locale: Locale = "en", now: Date = new Date()) {
  const diffMs = now.getTime() - new Date(iso).getTime()
  const mins = Math.round(diffMs / 60000)
  const hours = Math.round(diffMs / 3600000)
  const days = Math.round(diffMs / 86400000)

  if (locale === "km") {
    if (mins < 1) return "អម្បាញ់មិញ"
    if (mins < 60) return `${toKhmerDigits(mins)} នាទីមុន`
    if (hours < 24) return `${toKhmerDigits(hours)} ម៉ោងមុន`
    if (days < 30) return `${toKhmerDigits(days)} ថ្ងៃមុន`
    return formatDate(iso, "km", "medium")
  }
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  return formatDate(iso, "en", "medium")
}

/** Initials for avatars — handles "Sok Rithy" and single names. */
export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

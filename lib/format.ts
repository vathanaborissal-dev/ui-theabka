import type { Currency, Locale } from "@/lib/types"

export const CAMBODIA_TIME_ZONE = "Asia/Phnom_Penh"

const KHMER_DIGITS = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"]

const KHMER_MONTHS = [
  "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា",
  "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ",
]

const KHMER_WEEKDAYS = [
  "អាទិត្យ", "ច័ន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍",
]

const WEEKDAY_KEYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function cambodiaDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CAMBODIA_TIME_ZONE,
    weekday: "short",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date)
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ""

  return {
    year: Number(value("year")),
    month: Number(value("month")) - 1,
    day: Number(value("day")),
    weekday: WEEKDAY_KEYS.indexOf(value("weekday")),
  }
}

/** Renders Latin digits in Khmer numerals, leaving other characters intact. */
export function toKhmerDigits(input: string | number) {
  return String(input).replace(/\d/g, (d) => KHMER_DIGITS[Number(d)])
}

/**
 * Telegram only resolves `t.me/+<countrycode><number>` links, not local
 * formats — so a Cambodian "012 345 678" needs its leading 0 swapped for 855.
 */
export function telegramHref(phone: string) {
  const digits = phone.replace(/\D/g, "")
  const withCountryCode = digits.startsWith("855")
    ? digits
    : `855${digits.replace(/^0/, "")}`
  return `https://t.me/+${withCountryCode}`
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
    const cambodia = cambodiaDateParts(d)
    const day = toKhmerDigits(cambodia.day)
    const month = KHMER_MONTHS[cambodia.month]
    const year = toKhmerDigits(cambodia.year)
    const weekday = KHMER_WEEKDAYS[cambodia.weekday]
    switch (style) {
      case "full":
        return `ថ្ងៃ${weekday} ទី${day} ខែ${month} ឆ្នាំ${year}`
      case "long":
        return `ទី${day} ខែ${month} ឆ្នាំ${year}`
      case "dayMonth":
        return `${day} ${month}`
      case "short":
        return `${day}/${toKhmerDigits(cambodia.month + 1)}/${year}`
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
  return new Intl.DateTimeFormat("en-GB", {
    ...options[style],
    timeZone: CAMBODIA_TIME_ZONE,
  }).format(d)
}

/** Date and exact local time for audit records and other operational history. */
export function formatDateTime(iso: string, locale: Locale = "en") {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""

  return new Intl.DateTimeFormat(locale === "km" ? "km-KH" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: CAMBODIA_TIME_ZONE,
  }).format(date)
}

/**
 * The day and month as separate, already-localised strings.
 *
 * For layouts that set the numeral apart from the month rather than printing a
 * sentence. It goes through the same Cambodia-pinned parts as `formatDate`
 * instead of calling `Intl` directly: a bare `Intl.DateTimeFormat` resolves
 * against the running machine's timezone and ICU data, which differ between the
 * server render and the browser — that mismatch is a hydration error, and in
 * Khmer it also yields English month names, since the Khmer months here are a
 * hand-written table rather than something ICU supplies.
 */
export function dateFieldParts(iso: string, locale: Locale = "en") {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { day: "", month: "", year: "" }

  const parts = cambodiaDateParts(d)
  if (locale === "km") {
    return {
      day: toKhmerDigits(parts.day),
      month: `ខែ${KHMER_MONTHS[parts.month]}`,
      year: toKhmerDigits(parts.year),
    }
  }
  return {
    day: String(parts.day),
    month: new Intl.DateTimeFormat("en-GB", {
      month: "long",
      timeZone: CAMBODIA_TIME_ZONE,
    }).format(d),
    year: String(parts.year),
  }
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
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: CAMBODIA_TIME_ZONE,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(d)
    hours = Number(parts.find((part) => part.type === "hour")?.value)
    minutes = Number(parts.find((part) => part.type === "minute")?.value)
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
  if (Number.isNaN(target.getTime())) return 0
  const targetParts = cambodiaDateParts(target)
  const nowParts = cambodiaDateParts(now)
  const targetDay = Date.UTC(targetParts.year, targetParts.month, targetParts.day)
  const currentDay = Date.UTC(nowParts.year, nowParts.month, nowParts.day)
  return Math.round((targetDay - currentDay) / 86400000)
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

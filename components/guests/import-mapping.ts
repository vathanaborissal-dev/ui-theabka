import type { ImportableGuest } from "@/lib/guests"
import type { SideKey } from "@/lib/types"

/**
 * Turning somebody's spreadsheet into guests.
 *
 * The columns people arrive with are never the columns we store. This maps
 * between them, guesses the mapping from the header row, and is deliberately
 * separate from the sheet that renders it — the guessing is the part worth
 * reading and the part worth being able to test.
 */

export type ImportField =
  | "name"
  | "nameKm"
  | "phone"
  | "family"
  | "relationship"
  | "partySize"
  | "side"
  | "table"
  | "notes"
  /** Explicitly not imported. */
  | "ignore"

export const IMPORT_FIELDS: { id: ImportField; labelKey: string }[] = [
  { id: "name", labelKey: "guests.field.name" },
  { id: "nameKm", labelKey: "guests.field.nameKm" },
  { id: "phone", labelKey: "guests.field.phone" },
  { id: "family", labelKey: "guests.field.family" },
  { id: "relationship", labelKey: "guests.field.relationship" },
  { id: "partySize", labelKey: "guests.field.partySize" },
  { id: "side", labelKey: "guests.field.side" },
  { id: "table", labelKey: "guests.field.table" },
  { id: "notes", labelKey: "guests.field.notes" },
]

/**
 * Header words that point at each field, in both languages.
 *
 * Matched loosely on purpose: a real guest list says "Name", "Guest", "ឈ្មោះ",
 * "Full Name", "គ្រួសារ" or "No. of pax", and refusing everything but an exact
 * match would send people back to rename their columns by hand.
 */
const HEADER_HINTS: Record<Exclude<ImportField, "ignore">, string[]> = {
  name: ["name", "guest", "fullname", "full name", "ឈ្មោះ", "ភ្ញៀវ"],
  nameKm: ["khmer", "namekm", "khmer name", "ឈ្មោះខ្មែរ"],
  phone: ["phone", "tel", "mobile", "contact", "number", "ទូរស័ព្ទ", "លេខ"],
  family: ["family", "household", "group", "គ្រួសារ", "ក្រុម"],
  relationship: ["relation", "relationship", "role", "ទំនាក់ទំនង"],
  partySize: ["seat", "pax", "party", "guests", "size", "qty", "quantity", "អាសនៈ", "ចំនួន"],
  side: ["side", "ខាង"],
  table: ["table", "តុ"],
  notes: ["note", "remark", "comment", "កំណត់"],
}

const SIDE_HINTS: Record<SideKey, string[]> = {
  a: ["a", "groom", "male", "ប្រុស", "ខាងប្រុស"],
  b: ["b", "bride", "female", "ស្រី", "ខាងស្រី"],
  shared: ["shared", "both", "common", "រួម"],
}

/** A cell that is mostly digits — a phone number, a seat count, a table. */
function looksNumeric(cell: string) {
  const trimmed = cell.trim()
  if (!trimmed) return false
  const digits = trimmed.replace(/\D/g, "").length
  return digits > 0 && digits >= trimmed.replace(/\s/g, "").length / 2
}

/**
 * Does this row look like headers rather than a guest?
 *
 * Word-matching alone is not enough: "Sok family" is a perfectly ordinary
 * guest name and contains the word a `family` column would. Headers are
 * therefore also required to carry no numeric-looking cells, because a real
 * first row almost always has a phone number or a seat count in it and a
 * header almost never does.
 */
export function looksLikeHeader(cells: string[]) {
  if (cells.some(looksNumeric)) return false
  const known = cells.filter((cell) => guessField(cell) !== "ignore").length
  return known >= Math.max(1, Math.ceil(cells.length / 2))
}

export function guessField(header: string): ImportField {
  const normalised = header.trim().toLowerCase().replace(/[_-]+/g, " ")
  if (!normalised) return "ignore"

  for (const [field, hints] of Object.entries(HEADER_HINTS)) {
    if (hints.some((hint) => normalised === hint)) {
      return field as ImportField
    }
  }
  // Exact matches first, so a column called "Name" does not lose to a
  // substring hit on "Khmer Name".
  for (const [field, hints] of Object.entries(HEADER_HINTS)) {
    if (hints.some((hint) => normalised.includes(hint))) {
      return field as ImportField
    }
  }
  return "ignore"
}

/**
 * Guesses a mapping for each column, refusing to assign the same field twice —
 * two columns both landing on `name` would silently drop one of them.
 */
export function guessMapping(headers: string[]): ImportField[] {
  const taken = new Set<ImportField>()
  return headers.map((header) => {
    const guess = guessField(header)
    if (guess === "ignore" || taken.has(guess)) return "ignore"
    taken.add(guess)
    return guess
  })
}

function parseSide(value: string): SideKey | undefined {
  const normalised = value.trim().toLowerCase()
  if (!normalised) return undefined

  // Exact matches across every side first. Otherwise "both" is caught by the
  // single letter "b" and quietly filed under the bride's family.
  for (const [side, hints] of Object.entries(SIDE_HINTS)) {
    if (hints.some((hint) => normalised === hint)) return side as SideKey
  }
  for (const [side, hints] of Object.entries(SIDE_HINTS)) {
    // Only multi-character hints may match on a substring; a lone "a" or "b"
    // appears inside far too many ordinary words.
    if (hints.some((hint) => hint.length > 1 && normalised.includes(hint))) {
      return side as SideKey
    }
  }
  return undefined
}

function parseSeats(value: string): number | undefined {
  // "2 pax", "2 people", " 2 " all mean two.
  const digits = value.replace(/[^\d]/g, "")
  if (!digits) return undefined
  const seats = Number(digits)
  return Number.isFinite(seats) && seats > 0 && seats <= 50 ? seats : undefined
}

export type MappedRow = {
  guest: ImportableGuest
  /** Why this row will not be imported, if it will not. */
  problem?: "no-name" | "duplicate-in-file"
}

/**
 * Applies a mapping to the rows.
 *
 * Rows without a name are kept and flagged rather than dropped silently — a
 * blank line in the middle of someone's spreadsheet usually means their
 * mapping is off by a column, and they should see that before committing.
 */
export function mapRows(rows: string[][], mapping: ImportField[]): MappedRow[] {
  const seen = new Set<string>()

  return rows.map((cells) => {
    const guest: ImportableGuest = { name: "" }

    mapping.forEach((field, column) => {
      const value = (cells[column] ?? "").trim()
      if (!value || field === "ignore") return

      switch (field) {
        case "partySize":
          guest.partySize = parseSeats(value)
          break
        case "side":
          guest.side = parseSide(value)
          break
        default:
          guest[field] = value
      }
    })

    if (!guest.name) return { guest, problem: "no-name" as const }

    const key = guest.name.toLowerCase()
    if (seen.has(key)) return { guest, problem: "duplicate-in-file" as const }
    seen.add(key)

    return { guest }
  })
}

/** Only the rows that will actually be sent. */
export function importableRows(rows: MappedRow[]) {
  return rows.filter((row) => !row.problem).map((row) => row.guest)
}

/** A cell value as it arrives from the app's records. */
type Cell = string | number | null | undefined

/**
 * Leading characters a spreadsheet treats as the start of a formula. Guest
 * names, families and notes are user-authored, so a value like `=1+1` (or a
 * hand-typed `-` before a note) would otherwise execute on open in Excel and
 * Sheets. Prefixing with an apostrophe forces it back to text.
 */
const FORMULA_TRIGGER = /^[=+\-@\t\r]/

function escapeCell(value: Cell) {
  const raw = value === null || value === undefined ? "" : String(value)
  const safe = FORMULA_TRIGGER.test(raw) ? `'${raw}` : raw
  return `"${safe.replace(/"/g, '""')}"`
}

export function toCsv(headers: string[], rows: Cell[][]) {
  return [headers, ...rows].map((row) => row.map(escapeCell).join(",")).join("\r\n")
}

/**
 * Hands the file to the browser.
 *
 * The leading BOM is not optional here: without it Excel reads the file as
 * the system codepage and every Khmer name comes out as mojibake.
 */
export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([`\uFEFF${content}`], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/* ---------------------------------------------------------------- parsing */

/**
 * Splits pasted or uploaded tabular text into rows.
 *
 * Written rather than pulled in, because the job is narrow and the failure
 * modes are specific: people paste straight out of Excel or Google Sheets,
 * which gives tab-separated text, and they upload comma-separated files they
 * exported from somewhere else. Both arrive through the same box.
 *
 * Quoted fields are honoured — a guest list has "Sok, Dara" and addresses with
 * commas in them, and splitting naively would shift every later column.
 */
export function parseDelimited(text: string): string[][] {
  const source = text.replace(/^﻿/, "").replace(/\r\n?/g, "\n").trim()
  if (!source) return []

  const delimiter = detectDelimiter(source)
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let quoted = false

  for (let i = 0; i < source.length; i++) {
    const char = source[i]

    if (quoted) {
      if (char === '"') {
        // A doubled quote inside a quoted field is an escaped quote.
        if (source[i + 1] === '"') {
          field += '"'
          i++
        } else {
          quoted = false
        }
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      quoted = true
    } else if (char === delimiter) {
      row.push(field.trim())
      field = ""
    } else if (char === "\n") {
      row.push(field.trim())
      rows.push(row)
      row = []
      field = ""
    } else {
      field += char
    }
  }

  row.push(field.trim())
  rows.push(row)

  // Trailing blank lines are normal in a paste and are not empty guests.
  return rows.filter((cells) => cells.some((cell) => cell !== ""))
}

/**
 * Tabs win when present. A spreadsheet paste is tab-separated and its cells
 * routinely contain commas, so counting commas first would mis-split it.
 */
function detectDelimiter(source: string) {
  const firstLine = source.slice(0, source.indexOf("\n") + 1 || undefined)
  return firstLine.includes("\t") ? "\t" : ","
}

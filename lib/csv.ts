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

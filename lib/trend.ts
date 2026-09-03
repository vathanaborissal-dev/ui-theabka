/**
 * Week-over-week movement from a daily series.
 *
 * The admin dashboard shows a "+12%" pill beside its headline numbers, and a
 * pill with an arrow on it is a promise that two periods were actually
 * compared. So the comparison is computed here from the real series rather
 * than decorated onto whatever number is at hand: the last seven days against
 * the seven before them.
 */
export type Trend = {
  /** Percentage change, rounded. Positive means the recent week was busier. */
  percent: number
  direction: "up" | "down" | "flat"
  /** What the recent window totalled — for "12 in the last 7 days". */
  recent: number
  previous: number
}

/**
 * Compares the last `window` days against the `window` before them.
 *
 * Returns null rather than a zero when there is nothing to compare against:
 * a platform whose first week is still in progress has no honest percentage
 * to show, and "0%" would read as "flat" rather than "unknown".
 */
export function weekOverWeek(
  series: { date: string; count: number }[],
  window = 7
): Trend | null {
  if (series.length < window * 2) return null

  const sum = (from: number, to: number) =>
    series.slice(from, to).reduce((total, day) => total + day.count, 0)

  const recent = sum(series.length - window, series.length)
  const previous = sum(series.length - window * 2, series.length - window)

  // Growth from nothing is not a percentage. Both empty is genuinely flat;
  // rising from zero is real movement but unquantifiable, so it is reported
  // as a direction with no number behind it.
  if (previous === 0) {
    if (recent === 0) return { percent: 0, direction: "flat", recent, previous }
    return { percent: 100, direction: "up", recent, previous }
  }

  const percent = Math.round(((recent - previous) / previous) * 100)
  return {
    percent,
    direction: percent > 0 ? "up" : percent < 0 ? "down" : "flat",
    recent,
    previous,
  }
}

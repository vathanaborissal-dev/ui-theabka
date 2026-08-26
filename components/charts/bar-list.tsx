import { cn } from "@/lib/utils"

export type BarRow = {
  key: string
  label: string
  value: number
  /** Rendered on the right — usually a formatted amount. */
  display: string
  /** Optional second value drawn as a darker inset, e.g. amount already paid. */
  secondary?: number
  secondaryLabel?: string
  /** Formatted `secondary`, for the hover readout. */
  secondaryDisplay?: string
}

/**
 * Ranked horizontal bars. Preferred over a pie for category breakdowns: with
 * eight or more categories a pie becomes unreadable, and a sorted list also
 * answers "what is biggest?" instantly.
 *
 * Bars grow from a square left baseline and round only at the data end, so the
 * tip reads as the value rather than as a pill.
 */
export function BarList({
  rows,
  className,
  barClassName = "bg-primary/75",
  secondaryClassName = "bg-primary",
}: {
  rows: BarRow[]
  className?: string
  barClassName?: string
  secondaryClassName?: string
}) {
  const max = Math.max(...rows.map((r) => r.value), 1)

  return (
    <ul className={cn("space-y-1", className)}>
      {rows.map((row) => {
        const readout =
          row.secondaryDisplay && row.secondaryLabel
            ? `${row.label}: ${row.display} · ${row.secondaryLabel} ${row.secondaryDisplay}`
            : `${row.label}: ${row.display}`

        return (
          <li
            key={row.key}
            tabIndex={0}
            aria-label={readout}
            className="group relative -mx-2 space-y-1.5 rounded-md px-2 py-1.5 transition-colors outline-none hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate text-foreground">{row.label}</span>
              <span className="tnum shrink-0 font-medium text-foreground">{row.display}</span>
            </div>

            <div className="relative h-2 w-full overflow-hidden rounded-sm bg-muted">
              <div
                className={cn("absolute inset-y-0 left-0 rounded-r-[4px]", barClassName)}
                style={{ width: `${(row.value / max) * 100}%` }}
              />
              {row.secondary !== undefined && row.secondary > 0 ? (
                <div
                  className={cn("absolute inset-y-0 left-0 rounded-r-[4px]", secondaryClassName)}
                  style={{ width: `${(row.secondary / max) * 100}%` }}
                />
              ) : null}
            </div>

            {row.secondaryDisplay && row.secondaryLabel ? (
              <div className="pointer-events-none absolute right-2 bottom-full z-10 mb-1 rounded-md border border-border bg-popover px-2 py-1 opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <p className="tnum text-xs font-medium whitespace-nowrap text-popover-foreground">
                  {row.secondaryDisplay}
                </p>
                <p className="text-[0.6875rem] whitespace-nowrap text-muted-foreground">
                  {row.secondaryLabel}
                </p>
              </div>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

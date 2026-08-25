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
}

/**
 * Ranked horizontal bars. Preferred over a pie for category breakdowns: with
 * eight or more categories a pie becomes unreadable, and a sorted list also
 * answers "what is biggest?" instantly.
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
    <ul className={cn("space-y-3", className)}>
      {rows.map((row) => (
        <li key={row.key} className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-foreground">{row.label}</span>
            <span className="tnum shrink-0 font-medium text-foreground">{row.display}</span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn("absolute inset-y-0 left-0 rounded-full", barClassName)}
              style={{ width: `${(row.value / max) * 100}%` }}
            />
            {row.secondary !== undefined && row.secondary > 0 ? (
              <div
                className={cn("absolute inset-y-0 left-0 rounded-full", secondaryClassName)}
                style={{ width: `${(row.secondary / max) * 100}%` }}
                title={row.secondaryLabel}
              />
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  )
}

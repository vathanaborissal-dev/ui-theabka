import { cn } from "@/lib/utils"

export type Segment = {
  key: string
  label: string
  value: number
  className: string
}

/**
 * A single stacked bar for part-to-whole status. Chosen over a pie chart —
 * four RSVP buckets read faster on one line, and it survives a phone width.
 *
 * Segments are separated by a 2px gap in the surface colour rather than a
 * border: a stroke around each fill would add ink that isn't data, and reads
 * heavier at small sizes.
 */
export function SegmentedBar({
  segments,
  total,
  className,
  showLegend = true,
  height = "h-2.5",
}: {
  segments: Segment[]
  total: number
  className?: string
  showLegend?: boolean
  height?: string
}) {
  const safeTotal = total || 1
  const visible = segments.filter((s) => s.value > 0)

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className={cn("flex w-full gap-0.5 overflow-hidden rounded-full bg-muted", height)}
        role="img"
        aria-label={segments.map((s) => `${s.label}: ${s.value}`).join(", ")}
      >
        {visible.map((s) => (
          <div
            key={s.key}
            className={cn(
              "h-full rounded-full transition-[width] duration-500 ease-out",
              s.className
            )}
            style={{ width: `${(s.value / safeTotal) * 100}%` }}
          />
        ))}
      </div>

      {showLegend ? (
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
          {segments.map((s) => (
            <li key={s.key} className="flex items-center gap-1.5 text-xs">
              <span className={cn("size-2 shrink-0 rounded-full", s.className)} aria-hidden="true" />
              <span className="text-muted-foreground">{s.label}</span>
              <span className="tnum font-medium text-foreground">{s.value}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

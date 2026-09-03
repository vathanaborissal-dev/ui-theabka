import { Minus, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Trend } from "@/lib/trend"

/**
 * The dashboard's primary reading unit.
 *
 * Laid out top-down — icon, then what the number is, then the number, then
 * what it means — rather than putting the label and the icon on one line. The
 * eye lands on the figure without the label competing with it, and the
 * sentence underneath is what turns a number into something worth acting on.
 *
 * The wash across the surface is a light-mode-only touch: on a dark ground the
 * same tint reads as a smudge rather than as depth, so dark mode keeps the
 * flat card.
 */
export function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  tone = "default",
  trend,
  footer,
  className,
}: {
  label: string
  value: React.ReactNode
  sublabel?: React.ReactNode
  icon?: LucideIcon
  tone?: "default" | "positive" | "negative" | "gold"
  /** Week-over-week movement, when there is a real series behind it. */
  trend?: Trend | null
  footer?: React.ReactNode
  className?: string
}) {
  const toneClass = {
    default: "text-foreground",
    positive: "text-success",
    negative: "text-destructive",
    gold: "text-gold",
  }[tone]

  return (
    <div
      className={cn(
        // Packed to the top rather than spread: sublabels differ in length
        // from card to card, and spreading makes the headline figures sit at
        // different heights across a row that is meant to be read straight
        // across.
        "flex flex-col gap-4 rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card p-4 shadow-(--shadow-card)",
        "bg-linear-to-t from-primary/[0.04] to-card dark:bg-card dark:bg-none",
        className
      )}
    >
      <div className="space-y-2.5">
        {Icon ? (
          <span
            aria-hidden="true"
            className="flex size-8 items-center justify-center rounded-[var(--btn-radius)] border border-border bg-muted/70 text-muted-foreground"
          >
            <Icon className="size-4" />
          </span>
        ) : null}
        <p className="text-[0.8125rem] font-medium text-muted-foreground">{label}</p>
      </div>

      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={cn("display text-[1.75rem] leading-none tnum", toneClass)}>{value}</p>
          {trend ? <TrendPill trend={trend} /> : null}
        </div>
        {sublabel ? <p className="text-xs text-muted-foreground">{sublabel}</p> : null}
      </div>

      {footer}
    </div>
  )
}

/**
 * The movement pill.
 *
 * Coloured by direction rather than by whether the direction is good news:
 * this component cannot know that, and on this dashboard a fall in signups and
 * a fall in storage cost are opposite things. Green means up, red means down,
 * and the sentence under the number says whether that matters.
 */
function TrendPill({ trend }: { trend: Trend }) {
  const Icon =
    trend.direction === "up" ? TrendingUp : trend.direction === "down" ? TrendingDown : Minus

  return (
    <span
      className={cn(
        "inline-flex h-5 shrink-0 items-center gap-1 rounded-full px-2 text-[0.6875rem] font-medium tnum",
        trend.direction === "up" && "bg-success/10 text-success",
        trend.direction === "down" && "bg-destructive/10 text-destructive",
        trend.direction === "flat" && "bg-muted text-muted-foreground"
      )}
      title="Last 7 days against the 7 before"
    >
      <Icon className="size-3" aria-hidden="true" />
      {trend.direction === "up" && trend.percent > 0 ? "+" : ""}
      {trend.percent}%
    </span>
  )
}

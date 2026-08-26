import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * The dashboard's primary reading unit. Deliberately flat — a grid of heavy
 * shadowed cards is the main thing that makes dashboards feel generic.
 */
export function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  tone = "default",
  footer,
  className,
}: {
  label: string
  value: React.ReactNode
  sublabel?: React.ReactNode
  icon?: LucideIcon
  tone?: "default" | "positive" | "negative" | "gold"
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
        "flex flex-col justify-between gap-3 rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card p-4 shadow-(--shadow-card)",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[0.8125rem] font-medium text-muted-foreground">{label}</p>
        {Icon ? (
          <Icon className="size-4 shrink-0 text-muted-foreground/70" aria-hidden="true" />
        ) : null}
      </div>
      <div className="space-y-0.5">
        <p className={cn("display text-[1.75rem] leading-none", toneClass)}>{value}</p>
        {sublabel ? <p className="text-xs text-muted-foreground">{sublabel}</p> : null}
      </div>
      {footer}
    </div>
  )
}

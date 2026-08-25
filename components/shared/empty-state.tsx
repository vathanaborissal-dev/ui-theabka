import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  compact = false,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[var(--card-radius)] border border-dashed border-border/80 bg-muted/25 text-center",
        compact ? "gap-2 px-6 py-8" : "gap-3 px-6 py-14",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-background text-muted-foreground ring-1 ring-border",
          compact ? "size-9" : "size-12"
        )}
      >
        <Icon className={compact ? "size-4" : "size-5"} aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <p className={cn("font-medium text-foreground", compact ? "text-sm" : "text-base")}>
          {title}
        </p>
        {description ? (
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  )
}

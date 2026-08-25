"use client"

import { Check, Clock, HelpCircle, Minus, X } from "lucide-react"
import { useLocale } from "@/components/providers/locale-provider"
import { cn } from "@/lib/utils"
import type { AttendanceStatus, ExpenseStatus, RsvpStatus } from "@/lib/types"

const dot = "size-1.5 rounded-full"

const rsvpStyles: Record<RsvpStatus, { chip: string; dot: string; icon: typeof Check }> = {
  confirmed: {
    chip: "bg-success/12 text-success ring-success/25",
    dot: "bg-success",
    icon: Check,
  },
  declined: {
    chip: "bg-muted text-muted-foreground ring-border",
    dot: "bg-muted-foreground/60",
    icon: X,
  },
  maybe: {
    chip: "bg-warning/15 text-warning-foreground ring-warning/30 dark:text-warning",
    dot: "bg-warning",
    icon: HelpCircle,
  },
  pending: {
    chip: "bg-background text-muted-foreground ring-border",
    dot: "bg-muted-foreground/35",
    icon: Clock,
  },
}

export function RsvpBadge({
  status,
  className,
  showIcon = false,
}: {
  status: RsvpStatus
  className?: string
  showIcon?: boolean
}) {
  const { t } = useLocale()
  const style = rsvpStyles[status]
  const Icon = style.icon
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap",
        style.chip,
        className
      )}
    >
      {showIcon ? (
        <Icon className="size-3" aria-hidden="true" />
      ) : (
        <span className={cn(dot, style.dot)} aria-hidden="true" />
      )}
      {t(`status.${status}`)}
    </span>
  )
}

export function AttendanceBadge({ status }: { status: AttendanceStatus }) {
  const { t } = useLocale()
  if (status === "unknown") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground/70">
        <Minus className="size-3" aria-hidden="true" />
        {t("status.notCheckedIn")}
      </span>
    )
  }
  const attended = status === "attended"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap",
        attended
          ? "bg-primary/10 text-primary ring-primary/25"
          : "bg-muted text-muted-foreground ring-border"
      )}
    >
      {attended ? <Check className="size-3" aria-hidden="true" /> : <X className="size-3" aria-hidden="true" />}
      {t(attended ? "status.attended" : "status.absent")}
    </span>
  )
}

export function ExpenseStatusBadge({ status }: { status: ExpenseStatus }) {
  const { t } = useLocale()
  const styles: Record<ExpenseStatus, string> = {
    paid: "bg-success/12 text-success ring-success/25",
    deposit: "bg-warning/15 text-warning-foreground ring-warning/30 dark:text-warning",
    planned: "bg-muted text-muted-foreground ring-border",
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap",
        styles[status]
      )}
    >
      {t(`status.${status}`)}
    </span>
  )
}

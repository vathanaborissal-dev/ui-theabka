import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export type TableSkeletonColumn = {
  /** CSS table width, such as `13rem` or `2fr`-like percentages. */
  width?: string
  headerClassName?: string
  cellClassName?: string
  align?: "left" | "right"
  variant?: "text" | "avatar" | "badge" | "square"
  secondary?: boolean
}

/**
 * Reusable loading state for dense desktop tables.
 *
 * Callers describe column proportions while this component owns the repeated
 * accessible table markup and shadcn skeleton treatment.
 */
export function DataTableSkeleton({
  columns,
  rows = 7,
  minWidth = "52rem",
  className,
}: {
  columns: TableSkeletonColumn[]
  rows?: number
  minWidth?: string
  className?: string
}) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full table-fixed border-collapse" style={{ minWidth }}>
        <colgroup>
          {columns.map((column, index) => (
            <col key={index} style={column.width ? { width: column.width } : undefined} />
          ))}
        </colgroup>
        <thead>
          <tr className="border-b border-border">
            {columns.map((column, index) => (
              <th
                key={index}
                className={cn(
                  "px-3 py-3",
                  index === 0 && "pl-4",
                  index === columns.length - 1 && "pr-4",
                  column.align === "right" && "text-right"
                )}
              >
                <Skeleton className={cn("h-2.5 w-14", column.headerClassName)} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, row) => (
            <tr key={row} className="border-b border-border/60 last:border-0">
              {columns.map((column, index) => (
                <td
                  key={index}
                  className={cn(
                    "px-3 py-3",
                    index === 0 && "pl-4",
                    index === columns.length - 1 && "pr-4",
                    column.align === "right" && "text-right"
                  )}
                >
                  <SkeletonCell column={column} row={row} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SkeletonCell({ column, row }: { column: TableSkeletonColumn; row: number }) {
  if (column.variant === "avatar") {
    return (
      <div className="flex items-center gap-2.5">
        <Skeleton className="size-8 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className={cn("h-3", row % 3 === 0 ? "w-28" : "w-24", column.cellClassName)} />
          <Skeleton className="h-2.5 w-20" />
        </div>
      </div>
    )
  }

  if (column.variant === "square") {
    return <Skeleton className={cn("size-4", column.cellClassName)} />
  }

  if (column.variant === "badge") {
    return <Skeleton className={cn("h-5 w-20 rounded-full", column.cellClassName)} />
  }

  return (
    <div className={cn("space-y-1.5", column.align === "right" && "flex flex-col items-end")}>
      <Skeleton
        className={cn("h-3", row % 2 === 0 ? "w-20" : "w-16", column.cellClassName)}
      />
      {column.secondary ? <Skeleton className="h-2.5 w-14" /> : null}
    </div>
  )
}

/** Mobile counterpart for entity lists that collapse from tables into cards. */
export function DataCardListSkeleton({
  rows = 6,
  className,
}: {
  rows?: number
  className?: string
}) {
  return (
    <div className={cn("divide-y divide-border/60", className)}>
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex items-start gap-3 px-4 py-3">
          <Skeleton className="mt-2 size-4 shrink-0" />
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className={cn("h-3.5", row % 3 === 0 ? "w-36" : "w-28")} />
            <Skeleton className="h-2.5 w-24" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
          <Skeleton className="size-8 shrink-0 rounded-[var(--btn-radius)]" />
        </div>
      ))}
    </div>
  )
}

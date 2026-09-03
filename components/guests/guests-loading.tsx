import { Skeleton } from "@/components/ui/skeleton"
import {
  DataCardListSkeleton,
  DataTableSkeleton,
  type TableSkeletonColumn,
} from "@/components/shared/data-list-skeleton"

const GUEST_COLUMNS: TableSkeletonColumn[] = [
  { width: "3rem", variant: "square", headerClassName: "size-4" },
  { width: "24%", variant: "avatar", headerClassName: "w-12" },
  { width: "19%", secondary: true, headerClassName: "w-14" },
  { width: "8%", align: "right", headerClassName: "ml-auto w-10" },
  { width: "15%", variant: "badge", headerClassName: "w-12" },
  { width: "14%", headerClassName: "w-12" },
  { width: "12%", align: "right", headerClassName: "ml-auto w-10" },
  { width: "3rem", variant: "square", headerClassName: "invisible size-4" },
]

export function GuestSummarySkeleton() {
  return (
    <>
      <dl className="flex gap-6">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <dt><Skeleton className={index === 0 ? "h-2.5 w-14" : "h-2.5 w-24"} /></dt>
            <dd><Skeleton className="h-7 w-12" /></dd>
          </div>
        ))}
      </dl>
      <div className="self-center space-y-2">
        <Skeleton className="h-2.5 w-full rounded-full" />
        <div className="flex gap-4">
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="h-2.5 w-14" />
          <Skeleton className="h-2.5 w-16" />
        </div>
      </div>
    </>
  )
}

export function GuestListSkeleton() {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <DataTableSkeleton columns={GUEST_COLUMNS} rows={7} className="hidden md:block" />
      <DataCardListSkeleton rows={6} className="md:hidden" />
      <span className="sr-only">Loading guests</span>
    </div>
  )
}

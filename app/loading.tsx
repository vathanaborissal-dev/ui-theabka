import { Skeleton } from "@/components/ui/skeleton"

/** Route-level fallback. Mirrors the dashboard's shape so the jump is small. */
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <Skeleton className="h-40 w-full rounded-[var(--card-radius)]" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-[var(--card-radius)]" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
        <Skeleton className="h-72 rounded-[var(--card-radius)] lg:col-span-2" />
        <Skeleton className="h-72 rounded-[var(--card-radius)]" />
      </div>
      <span className="sr-only">Loading</span>
    </div>
  )
}

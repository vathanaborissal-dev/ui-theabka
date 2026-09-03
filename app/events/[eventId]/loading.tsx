import { Skeleton } from "@/components/ui/skeleton"

/**
 * The fallback for every section of an event.
 *
 * Without a loading boundary here, React holds the previous page on screen
 * until the next one is completely ready — so clicking "Expenses" did nothing
 * visible for over a second, and the natural response is to click again. The
 * boundary lets the shell swap immediately: the click is acknowledged even
 * when the page behind it is still being built.
 *
 * Deliberately generic. It stands in for eight different sections, so it
 * sketches the shape they share — a header, some figures, a body — rather than
 * imitating one of them and mismatching the other seven.
 */
export default function Loading() {
  return (
    <div className="space-y-5" aria-busy="true">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-[var(--card-radius)]" />
        ))}
      </div>
      <Skeleton className="h-80 w-full rounded-[var(--card-radius)]" />
      <span className="sr-only">Loading</span>
    </div>
  )
}

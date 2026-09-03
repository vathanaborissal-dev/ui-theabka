import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * Loading state shared by the camera route boundary and its client-side fetch.
 *
 * It follows the enabled camera layout because that is the tallest, most
 * common state: title, activation control, film settings, QR card, and photo
 * moderation. Reserving those shapes keeps navigation steady while the camera
 * overview and first photo page arrive together.
 */
export function CameraLoading() {
  return (
    <div className="space-y-6" role="status" aria-busy="true" aria-live="polite">
      <div aria-hidden="true" className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>

      <Card aria-hidden="true" className="p-5">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3.5 w-full max-w-lg" />
            <Skeleton className="h-3.5 w-3/4 max-w-sm" />
          </div>
          <Skeleton className="h-6 w-11 shrink-0 rounded-full" />
        </div>
      </Card>

      <Card aria-hidden="true" className="space-y-6 p-5">
        <SettingsSectionSkeleton variant="slider" />
        <SettingsSectionSkeleton variant="date" />

        <div className="space-y-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3.5 w-full max-w-md" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="w-full shrink-0 space-y-2 sm:w-40">
              <Skeleton className="aspect-3/4 w-full rounded-lg" />
              <Skeleton className="mx-auto h-3 w-20" />
              <Skeleton className="h-8 w-full rounded-[var(--btn-radius)]" />
            </div>
            <div className="grid min-w-0 flex-1 grid-cols-[repeat(auto-fill,minmax(4.75rem,1fr))] gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="space-y-2 rounded-lg border p-1.5">
                  <Skeleton className="aspect-square w-full rounded" />
                  <Skeleton
                    className={cn("mx-auto h-2.5", index % 2 === 0 ? "w-12" : "w-16")}
                  />
                </div>
              ))}
            </div>
          </div>
          <Skeleton className="h-3 w-full max-w-sm" />
        </div>

        <div className="flex items-start justify-between gap-6">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3.5 w-56 max-w-full" />
          </div>
          <Skeleton className="h-6 w-11 shrink-0 rounded-full" />
        </div>
      </Card>

      <Card aria-hidden="true" className="p-5">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Skeleton className="mx-auto size-48 shrink-0 rounded-lg sm:mx-0" />
          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3.5 w-full max-w-md" />
            <Skeleton className="h-3 w-full max-w-sm" />
            <Skeleton className="h-9 w-full rounded-[var(--input-radius)]" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-28 rounded-[var(--btn-radius)]" />
              <Skeleton className="h-8 w-24 rounded-[var(--btn-radius)]" />
            </div>
          </div>
        </div>
      </Card>

      <section aria-hidden="true" className="space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3.5 w-full max-w-lg" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton
              key={index}
              className={cn(
                "aspect-square w-full rounded-lg",
                index > 5 && "hidden sm:block"
              )}
            />
          ))}
        </div>
      </section>

      <span className="sr-only">Loading camera</span>
    </div>
  )
}

function SettingsSectionSkeleton({ variant }: { variant: "slider" | "date" }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-3 w-20" />
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-3.5 w-32" />
        {variant === "slider" ? <Skeleton className="h-6 w-7" /> : null}
      </div>
      {variant === "slider" ? (
        <Skeleton className="h-2 w-full rounded-full" />
      ) : (
        <div className="flex gap-2">
          <Skeleton className="h-9 w-44 rounded-[var(--input-radius)]" />
          <Skeleton className="h-9 w-28 rounded-[var(--input-radius)]" />
        </div>
      )}
      <Skeleton className="h-3.5 w-full max-w-md" />
    </div>
  )
}

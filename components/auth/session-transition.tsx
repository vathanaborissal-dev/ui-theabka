import { BrandMark, BrandWordmark } from "@/components/app-shell/brand"
import { Skeleton } from "@/components/ui/skeleton"

function BrandPlaceholder() {
  return (
    <div className="flex items-center gap-2" aria-hidden="true">
      <BrandMark />
      <BrandWordmark />
    </div>
  )
}

function AccessibleStatus({ children }: { children: React.ReactNode }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading your account</span>
      {children}
    </div>
  )
}

/** Content-shaped placeholder for private event routes. */
export function AppSessionTransition() {
  return (
    <AccessibleStatus>
      <div className="flex min-h-svh w-full bg-background">
        <aside className="hidden w-60 shrink-0 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col">
          <div className="flex h-16 items-center border-b border-sidebar-border px-4">
            <BrandPlaceholder />
          </div>

          <div className="space-y-6 p-3">
            <Skeleton className="h-10 w-full rounded-[var(--btn-radius)]" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-[88%] rounded-[var(--btn-radius)]" />
              <Skeleton className="h-8 w-[72%] rounded-[var(--btn-radius)]" />
              <Skeleton className="h-8 w-[82%] rounded-[var(--btn-radius)]" />
              <Skeleton className="h-8 w-[68%] rounded-[var(--btn-radius)]" />
            </div>
          </div>

          <div className="mt-auto border-t border-sidebar-border p-3">
            <div className="flex items-center gap-3 px-2 py-2">
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2.5 w-32" />
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 items-center gap-4 border-b border-border px-4 sm:px-6">
            <div className="lg:hidden">
              <BrandPlaceholder />
            </div>
            <Skeleton className="hidden h-3 w-36 lg:block" />
            <div className="ml-auto flex items-center gap-2">
              <Skeleton className="h-9 w-24 rounded-[var(--btn-radius)]" />
              <Skeleton className="size-9 rounded-[var(--btn-radius)]" />
            </div>
          </header>

          <main className="flex-1 px-4 pt-7 pb-24 sm:px-6 lg:px-8 lg:pb-12">
            <div className="mx-auto w-full max-w-6xl">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-4 h-9 w-full max-w-sm" />
              <Skeleton className="mt-3 h-3 w-full max-w-md" />

              <div className="mt-9 grid gap-4 md:grid-cols-3">
                <Skeleton className="h-28 rounded-[var(--card-radius)]" />
                <Skeleton className="h-28 rounded-[var(--card-radius)]" />
                <Skeleton className="h-28 rounded-[var(--card-radius)]" />
              </div>
              <Skeleton className="mt-5 h-64 rounded-[var(--card-radius)]" />
            </div>
          </main>
        </div>
      </div>
    </AccessibleStatus>
  )
}

/** Layout-matched placeholder for login and account-creation redirects. */
export function AuthSessionTransition() {
  return (
    <AccessibleStatus>
      <div className="flex min-h-svh flex-col bg-background lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
        <div className="flex flex-1 flex-col px-5 py-6 sm:px-8">
          <header className="flex items-center">
            <BrandPlaceholder />
            <div className="ml-auto flex items-center gap-2">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="size-9 rounded-[var(--btn-radius)]" />
            </div>
          </header>

          <main className="flex flex-1 items-center justify-center py-10">
            <div className="w-full max-w-sm">
              <Skeleton className="mb-9 h-4 w-16" />
              <Skeleton className="h-8 w-56" />
              <Skeleton className="mt-3 h-3 w-full max-w-xs" />

              <div className="mt-9 space-y-5">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-14" />
                  <Skeleton className="h-10 w-full rounded-[var(--btn-radius)]" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-10 w-full rounded-[var(--btn-radius)]" />
                </div>
                <Skeleton className="h-11 w-full rounded-[var(--btn-radius)]" />
              </div>
            </div>
          </main>
        </div>

        <aside
          aria-hidden="true"
          className="relative hidden overflow-hidden border-l border-border bg-linear-to-b from-primary/8 via-background to-gold/10 lg:grid lg:place-items-center"
        >
          <div className="flex flex-col items-center">
            <Skeleton className="h-24 w-24 rounded-[var(--card-radius)] bg-gold/15" />
            <Skeleton className="mt-8 h-1 w-32 bg-gold/25" />
            <Skeleton className="mt-8 h-6 w-64 bg-foreground/8" />
            <Skeleton className="mt-3 h-6 w-52 bg-foreground/8" />
          </div>
        </aside>
      </div>
    </AccessibleStatus>
  )
}

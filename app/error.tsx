"use client"

import { RotateCcw, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui/button-link"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlert className="size-5" aria-hidden="true" />
      </span>
      <h1 className="display text-2xl">Something went wrong</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        This page could not be loaded. Your event data is safe — try again, or go back to your
        events.
      </p>
      {error.digest ? (
        <p className="font-mono text-xs text-muted-foreground/70">Reference: {error.digest}</p>
      ) : null}
      <div className="mt-2 flex gap-2">
        <Button onClick={reset}>
          <RotateCcw />
          Try again
        </Button>
        <ButtonLink href="/events" variant="outline">
          My events
        </ButtonLink>
      </div>
    </main>
  )
}

"use client"

import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui/button-link"
import { MascotMotion } from "@/components/brand/mascot"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      {/* A red warning triangle overstates this: nothing is lost and the fix
          is one button away. Thiep working the problem says that better. */}
      <MascotMotion motion="thinking" size={104} />
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

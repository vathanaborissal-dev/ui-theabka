"use client"

import * as React from "react"
import { CalendarX2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui/button-link"
import { EmptyState } from "@/components/shared/empty-state"
import { AppSessionTransition } from "@/components/auth/session-transition"
import { useData } from "@/components/providers/data-provider"
import { AppShell } from "./app-shell"

/**
 * Resolves the route's event from the client store and hands it to the shell.
 * With a real API this becomes a server component that fetches and 404s.
 */
export function EventShell({
  eventId,
  children,
}: {
  eventId: string
  children: React.ReactNode
}) {
  const { events, eventsLoading, eventsError, reloadEvents } = useData()
  const event = events.find((e) => e.id === eventId || e.slug === eventId)

  if (eventsLoading) return <AppSessionTransition />

  if (eventsError && !event) {
    return (
      <div className="mx-auto flex min-h-svh max-w-lg items-center px-6">
        <EmptyState
          className="w-full"
          icon={RefreshCw}
          mascotMotion="thinking"
          title="We couldn't load this event"
          description={eventsError}
          action={<Button onClick={() => void reloadEvents()}>Try again</Button>}
        />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="mx-auto flex min-h-svh max-w-lg items-center px-6">
        <EmptyState
          className="w-full"
          icon={CalendarX2}
          mascotMotion="thinking"
          title="We couldn't find that event"
          description="It may have been removed, or the link is out of date."
          action={
            <ButtonLink href="/events">Back to my events</ButtonLink>
          }
        />
      </div>
    )
  }

  return <AppShell event={event}>{children}</AppShell>
}

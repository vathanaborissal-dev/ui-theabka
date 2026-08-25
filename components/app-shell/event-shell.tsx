"use client"

import * as React from "react"
import { CalendarX2 } from "lucide-react"
import { ButtonLink } from "@/components/ui/button-link"
import { EmptyState } from "@/components/shared/empty-state"
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
  const { events } = useData()
  const event = events.find((e) => e.id === eventId || e.slug === eventId)

  if (!event) {
    return (
      <div className="mx-auto flex min-h-svh max-w-lg items-center px-6">
        <EmptyState
          className="w-full"
          icon={CalendarX2}
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


"use client"

import * as React from "react"
import Link from "next/link"
import { CalendarX2 } from "lucide-react"
import { LocaleProvider } from "@/components/providers/locale-provider"
import { useData } from "@/components/providers/data-provider"
import { InvitationRenderer } from "./invitation-renderer"
import { InvitationLanguageToggle } from "./language-toggle"

/**
 * The guest-facing page.
 *
 * It runs its own LocaleProvider so a guest switching to Khmer here does not
 * change the language of the couple's dashboard, and vice versa. Khmer is the
 * default: most people scanning a printed Cambodian invitation read Khmer
 * first.
 */
export function PublicInvitation({
  slug,
  guestToken,
}: {
  slug: string
  guestToken?: string
}) {
  const { events, guests } = useData()
  const event = events.find((e) => e.slug === slug || e.id === slug)

  if (!event) return <InvitationNotFound />

  const guest = guestToken ? guests.find((g) => g.id === guestToken) : undefined

  return (
    <LocaleProvider initialLocale="km" persist={false}>
      <div className="relative min-h-svh">
        <InvitationLanguageToggle />
        <InvitationRenderer event={event} guestName={guest?.name} motionEnabled />
      </div>
    </LocaleProvider>
  )
}

function InvitationNotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      <CalendarX2 className="size-8 text-muted-foreground" aria-hidden="true" />
      <h1 className="display text-2xl">This invitation isn&rsquo;t available</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The link may be out of date. Please check with the family who invited you.
      </p>
      <Link
        href="/"
        className="text-sm text-primary underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        Go to Theabka
      </Link>
    </main>
  )
}

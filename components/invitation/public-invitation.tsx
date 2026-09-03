"use client"

import Link from "next/link"
import { CalendarX2 } from "lucide-react"
import { LocaleProvider } from "@/components/providers/locale-provider"
import type { InvitationEvent } from "@/lib/types"
import type { InvitedGuest } from "@/lib/guests"
import { RsvpProvider } from "./rsvp-context"
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
  event,
  slug,
  token,
  guest,
}: {
  event: InvitationEvent | null
  slug: string
  /** From `?g=`; absent when the plain link was forwarded on. */
  token?: string
  /** Resolved server-side, so the card is already personalised on first paint. */
  guest?: InvitedGuest | null
}) {
  if (!event) return <InvitationNotFound />

  return (
    <LocaleProvider initialLocale="km" persist={false}>
      <RsvpProvider value={{ slug, token, guest: guest ?? null }}>
        <div className="relative min-h-svh">
          <InvitationLanguageToggle />
          <InvitationRenderer
            event={event}
            motionEnabled
            guestActions
            guest={guest}
          />
        </div>
      </RsvpProvider>
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

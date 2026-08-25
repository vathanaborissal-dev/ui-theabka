import { GuestsView } from "@/components/guests/guests-view"
import type { RsvpStatus } from "@/lib/types"

const valid: RsvpStatus[] = ["pending", "confirmed", "declined", "maybe"]

export default async function GuestsPage({
  params,
  searchParams,
}: PageProps<"/events/[eventId]/guests">) {
  const { eventId } = await params
  const { rsvp, q, new: create } = await searchParams
  const initialRsvp = valid.find((r) => r === rsvp)

  return (
    <GuestsView
      // The view seeds its filter state on mount, so arriving from the command
      // palette while already on this page must remount it — otherwise the new
      // ?q= / ?new= is silently ignored.
      key={`${initialRsvp ?? ""}|${typeof q === "string" ? q : ""}|${create ?? ""}`}
      eventId={eventId}
      initialRsvp={initialRsvp}
      initialQuery={typeof q === "string" ? q : undefined}
      openNew={create === "1"}
    />
  )
}

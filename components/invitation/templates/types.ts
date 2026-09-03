import type { InvitationEvent } from "@/lib/types"

export type TemplateProps = {
  event: InvitationEvent
  /** Pre-fills the RSVP when the guest came from a personal link. */
  guestName?: string
  /** Preview mode renders the same markup but disables outbound links. */
  preview?: boolean
}

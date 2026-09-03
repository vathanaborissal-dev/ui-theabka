import { api, apiRequest } from "@/lib/api-client"
import type { EventRecord, InvitationEvent } from "@/lib/types"

/** `slug` is optional: the server derives one from the title when it is blank. */
type CreateEventInput = Omit<EventRecord, "id" | "status" | "createdAt" | "slug"> & {
  slug?: string
}
type EventPatch = Partial<
  Omit<EventRecord, "id" | "status" | "createdAt" | "design">
> & { design?: EventRecord["design"] }

const PAGE_SIZE = 100

/**
 * Every event the planner owns.
 *
 * The sidebar switcher and the events page both need the whole set, and the
 * response carries no total, so pages are walked until one comes back short.
 * A planner with a hundred events is not the normal case — this exists so that
 * the one who has them does not silently lose the hundred-and-first.
 */
export async function listEvents() {
  const all: EventRecord[] = []
  for (let page = 0; ; page++) {
    const batch = await api.get<EventRecord[]>(
      `/api/events?page=${page}&size=${PAGE_SIZE}`
    )
    all.push(...batch)
    if (batch.length < PAGE_SIZE) return all
  }
}

export function createEvent(input: EventRecord) {
  const body: CreateEventInput = {
    slug: input.slug || undefined,
    type: input.type,
    title: input.title,
    date: input.date,
    timezone: input.timezone,
    venue: input.venue,
    hosts: input.hosts,
    contacts: input.contacts,
    schedule: input.schedule,
    description: input.description,
    sides: input.sides,
    currency: input.currency,
    design: input.design,
    coverPhoto: input.coverPhoto,
  }
  return api.post<EventRecord>("/api/events", body satisfies CreateEventInput)
}

export function updateEvent(eventId: string, patch: Partial<EventRecord>) {
  const body = { ...patch }
  delete body.id
  delete body.status
  delete body.createdAt
  // Server-owned publish state. Sending it back would be a client claiming its
  // own edits are already published.
  delete body.publishedAt
  delete body.hasUnpublishedChanges
  return api.patch<EventRecord>(`/api/events/${eventId}`, body satisfies EventPatch)
}

export function replaceEventDesign(eventId: string, design: EventRecord["design"]) {
  return api.put<EventRecord>(`/api/events/${eventId}/design`, design)
}

export function publishEvent(eventId: string) {
  return api.post<EventRecord>(`/api/events/${eventId}/publish`)
}

export function unpublishEvent(eventId: string) {
  return api.post<EventRecord>(`/api/events/${eventId}/unpublish`)
}

export function deleteEvent(eventId: string) {
  return api.delete<void>(`/api/events/${eventId}`)
}

/** Public reads must never try the private refresh flow when a slug is missing. */
export function getPublicInvitation(slug: string) {
  return apiRequest<InvitationEvent>(
    `/api/public/invitations/${encodeURIComponent(slug)}`,
    { method: "GET", skipAuthRetry: true }
  )
}

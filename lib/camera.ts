import { api, apiPaged, type Paged } from "@/lib/api-client"
import { uploadSignedBlob } from "@/lib/uploads"

/**
 * The disposable camera.
 *
 * One QR on the table, a roll of film per phone, and nothing visible until the
 * couple's reveal time. Note what is missing from `CameraState`: there is no
 * photo URL on it, and there is none before the reveal on any endpoint here.
 * The server does not send addresses it is not ready for anyone to open — a
 * client that merely declines to render them would be one devtools panel away
 * from spoiling the surprise.
 */

export type CameraState = {
  noteEn: string
  noteKm: string
  titleEn: string
  titleKm: string
  /** Which look the photos are developed in. An id; the recipe lives in the client. */
  filter: string
  enabled: boolean
  /** The camera is on and the film is not developed yet. */
  accepting: boolean
  askName: boolean
  revealAt: string | null
  revealed: boolean
  shotsPerGuest: number
  /** This device is holding a roll. */
  hasRoll: boolean
  rollName: string | null
  shotsTaken: number
  shotsLeft: number
  /** Everyone's photos so far. A count is not a leak, and it is the only feedback there is. */
  photoCount: number
}

export type CameraPhoto = {
  id: string
  url: string
  width: number | null
  height: number | null
  takenAt: string
  /** Whoever shot it, if they said. */
  by: string | null
  hidden: boolean
}

export type CameraSettings = {
  enabled: boolean
  shotsPerGuest: number
  revealAt: string | null
  filter: string
  noteEn: string
  noteKm: string
  askName: boolean
}

export type CameraOverview = {
  camera: CameraSettings
  slug: string
  photoCount: number
  hiddenCount: number
  rollCount: number
}

type Shot = {
  shotId: string
  uploadUrl: string
  fields: Record<string, string>
  maxBytes: number
  shotsLeft: number
}

/* ------------------------------------------------------------------ guest */

export function getCamera(slug: string): Promise<CameraState> {
  return api.get<CameraState>(`/api/public/cameras/${encodeURIComponent(slug)}`)
}

/**
 * Picking up the camera.
 *
 * The roll is remembered in an httpOnly cookie the server sets, so nothing is
 * kept here — asking the server "what is my roll" is always right, and a token
 * in localStorage would be a token any script on the page could copy.
 */
export function pickUpCamera(
  slug: string,
  { name, guestToken }: { name?: string; guestToken?: string } = {}
): Promise<CameraState> {
  return api.post<CameraState>(`/api/public/cameras/${encodeURIComponent(slug)}/roll`, {
    name: name?.trim() || undefined,
    guestToken: guestToken || undefined,
  })
}

/**
 * Takes one photo: authorise, upload straight to storage, tell the server it
 * landed.
 *
 * The file never passes through our API — the browser posts it to the storage
 * host with a signature that is only good for the one path the server chose.
 * The exposure is spent on the confirm, so a failed upload costs the guest
 * nothing.
 */
export async function sendShot(slug: string, file: Blob, takenAt = new Date()): Promise<CameraState> {
  const base = `/api/public/cameras/${encodeURIComponent(slug)}`
  const shot = await api.post<Shot>(`${base}/shots`, {
    contentType: file.type || "image/jpeg",
    size: file.size,
  })

  let stored: { width?: number; height?: number }
  try {
    stored = await uploadSignedBlob(shot, file)
  } catch (error) {
    /*
     * Hand the exposure straight back.
     *
     * The shot is reserved the moment it is signed — otherwise a roll on its
     * last frame could be signed several times over while the first upload was
     * still climbing the venue's wifi. The cost of that is this: a photo that
     * never arrives has to be released, or the guest silently loses it. Best
     * effort, and the server expires the reservation anyway if this never
     * gets sent.
     */
    void api.delete(`${base}/shots/${shot.shotId}`).catch(() => {})
    throw error
  }

  return api.post<CameraState>(`${base}/shots/${shot.shotId}`, {
    width: stored.width,
    height: stored.height,
    takenAt: takenAt.toISOString(),
  })
}

/** The developed roll. Refused with `camera_not_revealed` until the moment arrives. */
export function listCameraPhotos(
  slug: string,
  page = 0,
  size = 30
): Promise<Paged<CameraPhoto>> {
  return apiPaged<CameraPhoto>(
    `/api/public/cameras/${encodeURIComponent(slug)}/photos?page=${page}&size=${size}`
  )
}

/* ----------------------------------------------------------------- couple */

export function getCameraOverview(eventId: string): Promise<CameraOverview> {
  return api.get<CameraOverview>(`/api/events/${eventId}/camera`)
}

export function saveCameraSettings(
  eventId: string,
  camera: CameraSettings
): Promise<CameraOverview> {
  return api.patch<CameraOverview>(`/api/events/${eventId}/camera`, { camera })
}

/** The couple's view, which is not gated by the reveal — they moderate what publishes. */
export function listOwnerPhotos(
  eventId: string,
  page = 0,
  size = 30
): Promise<Paged<CameraPhoto>> {
  return apiPaged<CameraPhoto>(`/api/events/${eventId}/camera/photos?page=${page}&size=${size}`)
}

export function setPhotoHidden(eventId: string, photoId: string, hidden: boolean): Promise<void> {
  return api.patch<void>(`/api/events/${eventId}/camera/photos/${photoId}?hidden=${hidden}`)
}

export function deletePhoto(eventId: string, photoId: string): Promise<void> {
  return api.delete<void>(`/api/events/${eventId}/camera/photos/${photoId}`)
}

/**
 * A sensible first reveal: the morning after, at ten.
 *
 * Not the wedding day itself — the photos worth waiting for are taken late,
 * and a reveal at midnight develops a half-empty roll.
 */
export function defaultRevealAt(eventDate: string | Date, timeZone = "Asia/Phnom_Penh"): Date {
  const date = new Date(eventDate)
  const next = new Date(date.getTime() + 24 * 60 * 60 * 1000)
  // Ten in the couple's own timezone, not the browser's: the guests waiting
  // for this are in Phnom Penh even when the person setting it is not.
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(next)
  const at = (type: string) => parts.find((part) => part.type === type)?.value ?? "01"
  return new Date(`${at("year")}-${at("month")}-${at("day")}T10:00:00+07:00`)
}

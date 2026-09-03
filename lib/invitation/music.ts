import type { LocalizedText } from "@/lib/types"

/* ---------------------------------------------------------------------------
 * Background music for the invitation.
 *
 * Files live in `public/invitation-music/`. The list below names the tracks the
 * picker offers; a name whose file is missing simply does not play, so entries
 * can be added here before the audio arrives and the app keeps working either
 * way — the same arrangement as `motif-assets.ts`.
 *
 * To add one: drop the mp3 in that folder under the exact `file` name below,
 * and record its licence in `public/invitation-music/credits.json`. Only music
 * the couple is allowed to play to the public belongs here — an invitation link
 * is a public page, not a private listen.
 * ------------------------------------------------------------------------- */

export type MusicTrack = {
  id: string
  /** Path under /public, e.g. "invitation-music/pleng-kar.mp3". */
  file: string
  name: LocalizedText
  /** Shown under the name in the picker: composer, performer or style. */
  credit?: string
}

/**
 * The default set.
 *
 * Chosen to cover what a Cambodian wedding card actually needs rather than to
 * be a long list: the traditional wedding ensemble, something quiet for a card
 * read at a desk, and a couple of modern options for a younger couple. Drop the
 * matching file in and the track appears; leave it out and it stays absent.
 */
export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: "pleng-kar",
    file: "invitation-music/pleng-kar.mp3",
    name: { en: "Pleng Kar", km: "ភ្លេងការ" },
    credit: "Traditional Khmer wedding ensemble",
  },
  {
    id: "khmer-strings",
    file: "invitation-music/khmer-strings.mp3",
    name: { en: "Khmer strings", km: "ខ្សែតន្ត្រីខ្មែរ" },
    credit: "Tro and khim, instrumental",
  },
  {
    id: "romvong",
    file: "invitation-music/romvong.mp3",
    name: { en: "Romvong", km: "រាំវង់" },
    credit: "Slow romvong, instrumental",
  },
  {
    id: "piano-soft",
    file: "invitation-music/piano-soft.mp3",
    name: { en: "Soft piano", km: "ព្យាណូស្រាល" },
    credit: "Quiet solo piano",
  },
  {
    id: "acoustic-warm",
    file: "invitation-music/acoustic-warm.mp3",
    name: { en: "Warm acoustic", km: "អាកូស្ទិកទន់ភ្លន់" },
    credit: "Acoustic guitar, unhurried",
  },
]

export function getTrack(id?: string) {
  if (!id) return undefined
  return MUSIC_TRACKS.find((track) => track.id === id)
}

/**
 * The URL to play for a design, or undefined for silence.
 *
 * A custom upload wins over a built-in id: if a couple has gone to the trouble
 * of uploading their own song, a stale `musicId` left over from an earlier
 * choice should not override it.
 */
export function resolveMusicUrl(design: {
  musicId?: string
  musicUrl?: string
}): string | undefined {
  if (design.musicUrl) return design.musicUrl
  const track = getTrack(design.musicId)
  return track ? `/${track.file}` : undefined
}

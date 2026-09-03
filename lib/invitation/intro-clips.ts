import type { LocalizedText } from "@/lib/types"

/* ---------------------------------------------------------------------------
 * Envelope-opening clips offered as samples.
 *
 * Files live in `public/motifs/videos/`. The list may be empty and the control
 * still works — it always offers an upload — so entries can be added before the
 * footage exists, the same arrangement as `motif-assets.ts` and `music.ts`.
 *
 * mp4 only, and not by preference: the card is revealed when the clip fires its
 * `ended` event, which is the one thing a GIF never does.
 * ------------------------------------------------------------------------- */

export type IntroClip = {
  id: string
  /** Path under /public, e.g. "motifs/videos/emerald-envelope-open.mp4". */
  file: string
  name: LocalizedText
  /** Which template it was cut for, so a mismatch is at least visible. */
  hint?: LocalizedText
}

export const INTRO_CLIPS: IntroClip[] = [
  {
    id: "emerald-envelope",
    file: "motifs/videos/emerald-envelope-open.mp4",
    name: { en: "Emerald envelope", km: "ស្រោមសំបុត្រមរកត" },
    hint: { en: "Gold wax seal on deep green", km: "ត្រាមាសលើផ្ទៃបៃតងចាស់" },
  },
]

/** The stored value for a sample, so the design holds a path like any other. */
export function introClipUrl(clip: IntroClip) {
  return `/${clip.file}`
}

export function findIntroClip(url?: string) {
  if (!url) return undefined
  return INTRO_CLIPS.find((clip) => introClipUrl(clip) === url)
}

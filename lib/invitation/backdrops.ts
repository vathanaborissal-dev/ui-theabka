import type { BackdropId, LocalizedText } from "@/lib/types"

/**
 * The layer behind the whole card.
 *
 * Distinct from `patternId`, which tiles a motif *inside* a section. A backdrop
 * sits behind the entire scroll and stays put while the card moves over it —
 * the effect Cambodian e-invitations use to make a phone-width column feel like
 * a card resting on cloth rather than a web page.
 *
 * Every built-in is pure CSS. Artwork is optional here on purpose: a backdrop
 * is full-bleed, so a missing file would be the most visible way for this
 * feature to fail.
 */
export type Backdrop = {
  id: BackdropId
  name: LocalizedText
  /**
   * Applied to the fixed layer. Uses palette variables rather than fixed
   * colours so a backdrop still belongs to whichever palette is chosen.
   */
  css?: React.CSSProperties
}

export const BACKDROPS: Backdrop[] = [
  {
    id: "none",
    name: { en: "None", km: "គ្មាន" },
  },
  {
    id: "photo",
    name: { en: "Your cover photo", km: "រូបគម្របរបស់អ្នក" },
  },
  {
    id: "custom",
    name: { en: "Your own image", km: "រូបភាពរបស់អ្នក" },
  },
  {
    id: "video",
    name: { en: "Night gold (video)", km: "មាសពេលយប់ (វីដេអូ)" },
  },
  {
    id: "damask",
    name: { en: "Ivory damask", km: "ក្បាច់ស" },
    css: {
      backgroundImage: "url(/motifs/backgrounds/damask-ivory.jpg)",
      /*
       * Sized to the card column, not the viewport. `cover` would scale the
       * motif by however tall the screen happens to be — the same card would
       * show a large damask on a short window and a tiny one on a tall phone.
       * Pinning the width keeps the ornament at one physical size everywhere
       * and simply tiles to fill whatever is left.
       */
      backgroundSize: "28rem auto",
      backgroundRepeat: "repeat",
      backgroundPosition: "top center",
    },
  },
  {
    id: "silk",
    name: { en: "Silk", km: "សូត្រ" },
    css: {
      backgroundImage: [
        "repeating-linear-gradient(115deg, color-mix(in oklab, var(--inv-gold) 8%, transparent) 0 2px, transparent 2px 9px)",
        "linear-gradient(160deg, var(--inv-surface) 0%, var(--inv-bg) 55%, color-mix(in oklab, var(--inv-accent) 12%, var(--inv-bg)) 100%)",
      ].join(","),
    },
  },
  {
    id: "dawn",
    name: { en: "Dawn", km: "ព្រឹកព្រាង" },
    css: {
      backgroundImage: [
        "radial-gradient(120% 70% at 50% 0%, color-mix(in oklab, var(--inv-gold) 26%, transparent) 0%, transparent 60%)",
        "linear-gradient(180deg, var(--inv-bg) 0%, var(--inv-surface) 100%)",
      ].join(","),
    },
  },
  {
    id: "garden",
    name: { en: "Garden", km: "សួនច្បារ" },
    css: {
      backgroundImage: [
        "radial-gradient(60% 40% at 15% 12%, color-mix(in oklab, var(--inv-accent) 18%, transparent) 0%, transparent 70%)",
        "radial-gradient(55% 38% at 88% 82%, color-mix(in oklab, var(--inv-gold) 22%, transparent) 0%, transparent 70%)",
        "linear-gradient(180deg, var(--inv-bg) 0%, var(--inv-surface) 100%)",
      ].join(","),
    },
  },
  {
    id: "temple",
    name: { en: "Temple dusk", km: "ព្រលប់ប្រាសាទ" },
    css: {
      backgroundImage: [
        "radial-gradient(90% 55% at 50% 100%, color-mix(in oklab, var(--inv-accent) 45%, transparent) 0%, transparent 65%)",
        "linear-gradient(180deg, color-mix(in oklab, var(--inv-fg) 82%, var(--inv-bg)) 0%, var(--inv-accent) 100%)",
      ].join(","),
    },
  },
  {
    id: "paper",
    name: { en: "Handmade paper", km: "ក្រដាសដៃ" },
    css: {
      backgroundImage: [
        "repeating-linear-gradient(0deg, color-mix(in oklab, var(--inv-fg) 3%, transparent) 0 1px, transparent 1px 4px)",
        "repeating-linear-gradient(90deg, color-mix(in oklab, var(--inv-fg) 3%, transparent) 0 1px, transparent 1px 4px)",
        "linear-gradient(180deg, var(--inv-surface) 0%, var(--inv-bg) 100%)",
      ].join(","),
    },
  },
]

export function getBackdrop(id?: string) {
  return BACKDROPS.find((b) => b.id === id) ?? BACKDROPS[0]
}


/** The looping video a "video" backdrop plays when the design names none. */
export const DEFAULT_BACKDROP_VIDEO = "/motifs/videos/night-gold-bg.mp4"

/**
 * The emerald card's loop, used when its design names no video of its own.
 *
 * This is the scene the envelope clip ends on, so the two run as one shot: the
 * envelope opens, and what is behind it is already this.
 */
export const EMERALD_BACKDROP_VIDEO = "/motifs/videos/emerald-mist-loop.mp4"

/** The envelope-opening clip, when a template asks for one. */
export const DEFAULT_INTRO_VIDEO = "/motifs/videos/night-gold-intro.mp4"

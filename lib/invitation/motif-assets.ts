import type { LocalizedText } from "@/lib/types"

/* ---------------------------------------------------------------------------
 * Registry of supplied motif artwork.
 *
 * Files live in `public/motifs/<category>/`. Nothing here is required: every
 * slot has a hand-drawn SVG fallback in `components/invitation/`, so the app
 * works with this list empty and improves as artwork is added.
 *
 * To add artwork: drop the file in the right folder, add an entry below, and
 * record its provenance in `public/motifs/credits.json`.
 * ------------------------------------------------------------------------- */

export type MotifCategory =
  | "couple"
  | "frames"
  | "dividers"
  | "offerings"
  | "florals"
  | "patterns"
  | "seals"

export type MotifAsset = {
  id: string
  category: MotifCategory
  /** Path under /public, e.g. "motifs/couple/couple--gold.svg". */
  file: string
  name: LocalizedText
  /**
   * True when the artwork is a single-colour silhouette that may be re-tinted
   * to the palette. Only set this for genuinely monochrome files — recolouring
   * a full-colour illustration destroys it.
   */
  tintable?: boolean
}

/**
 * Supplied artwork. See `public/motifs/credits.json` for provenance.
 */
export const MOTIF_ASSETS: MotifAsset[] = [
  {
    id: "traditional-couple-red",
    category: "couple",
    file: "motifs/couple/southeast-asian-couple.png",
    name: { en: "Traditional couple", km: "គូស្វាមីភរិយាប្រពៃណី" },
  },
  {
    id: "kbach-gold-frame",
    category: "frames",
    file: "motifs/frames/kbach-gold-frame.png",
    name: { en: "Gold kbach frame", km: "ស៊ុមក្បាច់មាស" },
  },
  {
    id: "gold-floral-border",
    category: "dividers",
    file: "motifs/dividers/gold-floral-border.png",
    name: { en: "Gold floral border", km: "បន្ទាត់ផ្កាមាស" },
  },
  {
    id: "gold-geometric-border",
    category: "dividers",
    file: "motifs/dividers/gold-geometric-border.png",
    name: { en: "Gold geometric border", km: "បន្ទាត់លំនាំមាស" },
  },
  {
    id: "gold-southeast-asian-divider",
    category: "dividers",
    file: "motifs/dividers/gold-southeast-asian-divider.png",
    name: { en: "Gold ceremonial divider", km: "បន្ទាត់ពិធីមាស" },
  },
  {
    id: "khmer-unalom",
    category: "seals",
    file: "motifs/seals/khmer-unalom.svg",
    name: { en: "Khmer unalom", km: "ឧណាលោមខ្មែរ" },
    tintable: true,
  },
]

export function motifsIn(category: MotifCategory) {
  return MOTIF_ASSETS.filter((asset) => asset.category === category)
}

export function findMotif(id: string | undefined) {
  if (!id) return undefined
  return MOTIF_ASSETS.find((asset) => asset.id === id)
}

/** True when any artwork has been supplied for a slot. */
export function hasMotifs(category: MotifCategory) {
  return MOTIF_ASSETS.some((asset) => asset.category === category)
}

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
    id: "couple-traditional",
    category: "couple",
    file: "motifs/couple/couple--traditional.png",
    name: { en: "Traditional couple", km: "គូស្វាមីភរិយាប្រពៃណី" },
  },
  {
    id: "crest-top",
    category: "frames",
    file: "motifs/frames/crest--top.png",
    name: { en: "Gold crest", km: "កំពូលមាស" },
  },
  {
    id: "crest-bottom",
    category: "frames",
    file: "motifs/frames/crest--bottom.png",
    name: { en: "Gold base crest", km: "ជើងមាស" },
  },
  {
    id: "divider-lotus",
    category: "dividers",
    file: "motifs/dividers/divider--lotus.png",
    name: { en: "Lotus rule", km: "បន្ទាត់ឈូក" },
  },
  {
    id: "divider-floral-band",
    category: "dividers",
    file: "motifs/dividers/divider--floral-band.png",
    name: { en: "Floral band", km: "ក្រវាត់ផ្កា" },
  },
  {
    id: "divider-floral-drops",
    category: "dividers",
    file: "motifs/dividers/divider--floral-drops.png",
    name: { en: "Floral drops", km: "ផ្កាព្យួរ" },
  },
  {
    id: "divider-geometric",
    category: "dividers",
    file: "motifs/dividers/divider--geometric.png",
    name: { en: "Geometric band", km: "ក្រវាត់លំនាំ" },
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

import type { LocalizedText, NamePlateId } from "@/lib/types"

/**
 * The frame the invited guest's name sits in.
 *
 * Each is nine-sliced rather than stretched: the plate has to fit whatever name
 * is put in it — "Sok" and a five-word Khmer honorific are the same component —
 * and scaling a carved end to fit smears the carving. `slice` is measured in
 * the source image's own pixels, which is why every plate carries its own: the
 * gold bar's cap is 42px of a 431px image, the modern scroll's is 155px of
 * 1080px, and using one number for both would cut each in the wrong place.
 */
export type NamePlate = {
  id: NamePlateId
  name: LocalizedText
  /** Path under /public. Absent for the plain option. */
  file?: string
  /** End cap width in source pixels, for `border-image-slice`. */
  slice?: number
  /** Rendered cap width. Smaller than the source, so the ends stay crisp. */
  capPx?: number
  /**
   * Ink for the name inside the plate.
   *
   * "onPlate" is for the pale filled bars, whose middle is a painted surface
   * the card's own colours would disappear into. "onDark" is for the ones
   * whose middle is dark enough that the same brown ink vanishes. "inherit" is
   * for the open frames, which are a rule around the text rather than a ground
   * beneath it.
   */
  ink: "onPlate" | "onDark" | "inherit"
}

export const NAME_PLATES: NamePlate[] = [
  {
    id: "none",
    name: { en: "No frame", km: "គ្មានស៊ុម" },
    ink: "inherit",
  },
  {
    id: "gold",
    name: { en: "Gold bar", km: "បន្ទះមាស" },
    file: "motifs/plaques/name-frame-gold.png",
    slice: 42,
    capPx: 42,
    ink: "onPlate",
  },
  {
    id: "ivory",
    name: { en: "Ivory bar", km: "បន្ទះពណ៌ស" },
    file: "motifs/plaques/name-frame-ivory.png",
    slice: 70,
    capPx: 40,
    ink: "onPlate",
  },
  {
    id: "scroll",
    name: { en: "Scroll frame", km: "ស៊ុមរមូរ" },
    file: "motifs/frames/frame--scroll-gold.png",
    slice: 120,
    capPx: 56,
    ink: "inherit",
  },
  {
    id: "modern",
    name: { en: "Modern scroll", km: "ស៊ុមរមូរទំនើប" },
    file: "motifs/plaques/name-frame-scroll-modern.png",
    slice: 155,
    capPx: 62,
    ink: "inherit",
  },
  {
    id: "emerald",
    name: { en: "Emerald cartouche", km: "ស៊ុមមរកត" },
    file: "motifs/plaques/name-frame-emerald.png",
    // The shaped end measures ~200px into a 1177x419 source.
    slice: 200,
    capPx: 54,
    ink: "onDark",
  },
]

export function getNamePlate(id?: string) {
  return NAME_PLATES.find((plate) => plate.id === id) ?? NAME_PLATES[1]
}

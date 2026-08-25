/**
 * Type pairings offered in the invitation builder.
 *
 * Each pairing names a Latin display face and a Khmer display face separately,
 * because the two scripts do not share a family — a Khmer wedding card is
 * traditionally set in Moul, which has no Latin counterpart at all.
 */
export type FontPairing = {
  id: string
  name: { en: string; km: string }
  description: { en: string; km: string }
  display: string
  displayKhmer: string
  body: string
  /** Preview string rendered in the picker. */
  sample: { en: string; km: string }
}

export const FONT_PAIRINGS: FontPairing[] = [
  {
    id: "moul",
    name: { en: "Moul", km: "មូល" },
    description: {
      en: "The traditional Khmer wedding-card face.",
      km: "ពុម្ពអក្សរធៀបខ្មែរបុរាណ។",
    },
    display: "var(--font-latin-serif)",
    displayKhmer: "var(--font-khmer-display-stack)",
    body: "var(--font-latin-sans), var(--font-khmer-sans)",
    sample: { en: "Rithy", km: "សុខ រិទ្ធី" },
  },
  {
    id: "classic",
    name: { en: "Classic serif", km: "សេរីហ្វបុរាណ" },
    description: {
      en: "Cormorant with a Khmer serif — formal and quiet.",
      km: "អក្សរសេរីហ្វ — ផ្លូវការ និងស្ងប់ស្ងាត់។",
    },
    display: "var(--font-latin-serif)",
    displayKhmer: "var(--font-khmer-serif-stack)",
    body: "var(--font-latin-sans), var(--font-khmer-sans)",
    sample: { en: "Rithy", km: "សុខ រិទ្ធី" },
  },
  {
    id: "editorial",
    name: { en: "Editorial", km: "អក្សរទស្សនាវដ្តី" },
    description: {
      en: "High-contrast Playfair for a magazine feel.",
      km: "ផ្លេហ្វែរ ផ្ទុយពណ៌ខ្លាំង បែបទស្សនាវដ្តី។",
    },
    display: "var(--font-latin-serif-alt)",
    displayKhmer: "var(--font-khmer-serif-stack)",
    body: "var(--font-latin-sans), var(--font-khmer-sans)",
    sample: { en: "Rithy", km: "សុខ រិទ្ធី" },
  },
  {
    id: "modern",
    name: { en: "Modern", km: "ទំនើប" },
    description: {
      en: "Clean grotesk in both scripts.",
      km: "អក្សរក្រាហ្វិចស្អាតទាំងពីរភាសា។",
    },
    display: "var(--font-latin-grotesk)",
    displayKhmer: "var(--font-khmer-sans)",
    body: "var(--font-latin-sans), var(--font-khmer-sans)",
    sample: { en: "Rithy", km: "សុខ រិទ្ធី" },
  },
]

export function getFontPairing(id?: string) {
  return FONT_PAIRINGS.find((p) => p.id === id) ?? FONT_PAIRINGS[1]
}

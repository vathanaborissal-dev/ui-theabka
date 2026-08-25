import type { EventType, OrnamentLevel } from "@/lib/types"

export type TemplateId =
  | "baisei"
  | "sbai"
  | "angkor"
  | "reachny"
  | "bopha"
  | "romduol"
  | "naga"
  | "chan"
  | "kravan"
  | "sila"

export type InvitationTemplate = {
  id: TemplateId
  name: { en: string; km: string }
  description: { en: string; km: string }
  defaultPalette: string
  defaultFontPairingId: string
  defaultPattern: string
  defaultOrnamentLevel: OrnamentLevel
  /** Event types this template is offered for first. Empty means "all". */
  suitedTo: EventType[]
  /** Drives the picker's miniature preview. */
  preview:
    | "arch"
    | "silk"
    | "temple"
    | "royal"
    | "ornate"
    | "floral"
    | "night"
    | "editorial"
    | "photo"
    | "plain"
  /** Surfaced as a chip in the picker. */
  tag?: { en: string; km: string }
}

export const TEMPLATES: InvitationTemplate[] = [
  {
    id: "baisei",
    name: { en: "Baisei", km: "បាយសី" },
    description: {
      en: "Gold arch, baisei offering, white blooms and the couple in traditional dress.",
      km: "ស៊ុមមាស បាយសី ផ្កាស និងគូស្វាមីភរិយាក្នុងសម្លៀកបំពាក់ប្រពៃណី។",
    },
    defaultPalette: "pastel-dawn",
    defaultFontPairingId: "moul",
    defaultPattern: "none",
    defaultOrnamentLevel: "rich",
    suitedTo: ["wedding", "engagement"],
    preview: "arch",
    tag: { en: "Most popular", km: "ពេញនិយម" },
  },
  {
    id: "sbai",
    name: { en: "Sbai", km: "ស្បៃ" },
    description: {
      en: "Royal blue silk, gold ceremony borders, and a blessing-card composition.",
      km: "សូត្រខៀវ ស៊ុមមាស និងប្លង់ធៀបពិធីដ៏ឱឡារិក។",
    },
    defaultPalette: "royal",
    defaultFontPairingId: "moul",
    defaultPattern: "none",
    defaultOrnamentLevel: "rich",
    suitedTo: ["wedding", "engagement"],
    preview: "silk",
    tag: { en: "Ceremonial", km: "ឱឡារិក" },
  },
  {
    id: "reachny",
    name: { en: "Reachny", km: "រាជនី" },
    description: {
      en: "Formal engraved card — indigo and gold rules, cartouche, honour line.",
      km: "ធៀបផ្លូវការ — ស៊ុមខៀវមាស ក្របរូប និងបន្ទាត់គោរពអញ្ជើញ។",
    },
    defaultPalette: "indigo-gold",
    defaultFontPairingId: "moul",
    defaultPattern: "phka",
    defaultOrnamentLevel: "rich",
    suitedTo: ["wedding", "engagement", "housewarming", "corporate"],
    preview: "royal",
    tag: { en: "Formal", km: "ផ្លូវការ" },
  },
  {
    id: "angkor",
    name: { en: "Angkor", km: "អង្គរ" },
    description: {
      en: "Temple silhouette, pediment arch and carved kbach borders.",
      km: "រូបប្រាសាទ ហោជាង និងក្បាច់ចម្លាក់។",
    },
    defaultPalette: "sandstone",
    defaultFontPairingId: "moul",
    defaultPattern: "temple",
    defaultOrnamentLevel: "rich",
    suitedTo: ["wedding", "engagement"],
    preview: "temple",
    tag: { en: "Traditional", km: "បុរាណ" },
  },
  {
    id: "bopha",
    name: { en: "Bopha", km: "បុប្ផា" },
    description: {
      en: "Classic Khmer card — gold border, stacked family names.",
      km: "ធៀបខ្មែរបុរាណ — ស៊ុមមាស ឈ្មោះគ្រួសារ។",
    },
    defaultPalette: "garnet-gold",
    defaultFontPairingId: "moul",
    defaultPattern: "none",
    defaultOrnamentLevel: "subtle",
    suitedTo: ["wedding", "engagement"],
    preview: "ornate",
    tag: { en: "Traditional", km: "បុរាណ" },
  },
  {
    id: "romduol",
    name: { en: "Phka Romduol", km: "ផ្កា​រំដួល" },
    description: {
      en: "Garlands and blooms of Cambodia's national flower.",
      km: "កម្រងផ្កា និងផ្កា​រំដួល​ជាតិ។",
    },
    defaultPalette: "saffron",
    defaultFontPairingId: "moul",
    defaultPattern: "romduol",
    defaultOrnamentLevel: "rich",
    suitedTo: ["wedding", "engagement", "birthday", "baby"],
    preview: "floral",
    tag: { en: "Floral", km: "ផ្កា" },
  },
  {
    id: "naga",
    name: { en: "Naga", km: "នាគ" },
    description: {
      en: "Deep and ceremonial — naga rules over a full-bleed cover.",
      km: "ស្រអាប់ និងឱឡារិក — ក្បាច់នាគលើរូបពេញ។",
    },
    defaultPalette: "temple-night",
    defaultFontPairingId: "classic",
    defaultPattern: "kbach",
    defaultOrnamentLevel: "subtle",
    suitedTo: ["wedding", "engagement", "anniversary", "corporate"],
    preview: "night",
    tag: { en: "Traditional", km: "បុរាណ" },
  },
  {
    id: "chan",
    name: { en: "Chan", km: "ចន្ទ" },
    description: {
      en: "Modern and quiet — large serif, generous space.",
      km: "ទំនើប និងស្ងប់ស្ងាត់ — អក្សរធំ ចន្លោះទូលាយ។",
    },
    defaultPalette: "sand",
    defaultFontPairingId: "editorial",
    defaultPattern: "none",
    defaultOrnamentLevel: "none",
    suitedTo: [],
    preview: "editorial",
    tag: { en: "Minimal", km: "សាមញ្ញ" },
  },
  {
    id: "kravan",
    name: { en: "Kravan", km: "ក្រវាន់" },
    description: {
      en: "Photo first — full-bleed cover with details laid over it.",
      km: "ផ្តោតលើរូបភាព — រូបពេញអេក្រង់។",
    },
    defaultPalette: "midnight",
    defaultFontPairingId: "modern",
    defaultPattern: "none",
    defaultOrnamentLevel: "none",
    suitedTo: [],
    preview: "photo",
    tag: { en: "Photo", km: "រូបភាព" },
  },
  {
    id: "sila",
    name: { en: "Sila", km: "សីល" },
    description: {
      en: "Restrained and respectful — for memorials and ceremonies.",
      km: "សាមញ្ញ និងគួរសម — សម្រាប់ពិធីបុណ្យ។",
    },
    defaultPalette: "ivory",
    defaultFontPairingId: "classic",
    defaultPattern: "none",
    defaultOrnamentLevel: "none",
    suitedTo: ["funeral", "baby", "housewarming", "anniversary"],
    preview: "plain",
    tag: { en: "Restrained", km: "គួរសម" },
  },
]

export function getTemplate(id: string) {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]
}

/** Templates offered for an event type, most relevant first. */
export function templatesFor(type: EventType) {
  return [...TEMPLATES].sort((a, b) => {
    const fit = (t: InvitationTemplate) =>
      t.suitedTo.length === 0 ? 1 : t.suitedTo.includes(type) ? 0 : 2
    return fit(a) - fit(b)
  })
}

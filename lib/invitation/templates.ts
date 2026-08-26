import type {
  AmbientId,
  CoverMotionId,
  EntranceId,
  EventType,
  GalleryLayoutId,
  OrnamentLevel,
  PhotoFrameId,
} from "@/lib/types"

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
  | "kbach"

export type InvitationTemplate = {
  id: TemplateId
  name: { en: string; km: string }
  description: { en: string; km: string }
  defaultPalette: string
  defaultFontPairingId: string
  defaultPattern: string
  defaultOrnamentLevel: OrnamentLevel
  defaultPhotoFrame: PhotoFrameId
  defaultGalleryLayout: GalleryLayoutId
  defaultEntrance: EntranceId
  defaultAmbient: AmbientId
  defaultCoverMotion: CoverMotionId
  defaultEnvelopeIntro: boolean
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
    | "bordered"
  /** Surfaced as a chip in the picker. */
  tag?: { en: string; km: string }
}

export const TEMPLATES: InvitationTemplate[] = [
  {
    id: "kbach",
    name: { en: "Kbach", km: "ក្បាច់" },
    description: {
      en: "A carved kbach band runs unbroken around the whole card, in red and gold.",
      km: "ក្បាច់ឆ្លាក់ព័ទ្ធជុំវិញធៀបទាំងមូល ពណ៌ក្រហម និងមាស។",
    },
    defaultPalette: "garnet-gold",
    defaultFontPairingId: "moul",
    defaultPattern: "none",
    defaultOrnamentLevel: "rich",
    defaultPhotoFrame: "gold",
    defaultGalleryLayout: "strip",
    defaultEntrance: "unfold",
    defaultAmbient: "gold-dust",
    defaultCoverMotion: "none",
    defaultEnvelopeIntro: true,
    suitedTo: ["wedding", "engagement"],
    preview: "bordered",
    tag: { en: "Bordered", km: "មានស៊ុម" },
  },
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
    defaultPhotoFrame: "arch",
    defaultGalleryLayout: "carousel",
    defaultEntrance: "rise",
    defaultAmbient: "petals",
    defaultCoverMotion: "float",
    defaultEnvelopeIntro: true,
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
    defaultPhotoFrame: "gold",
    defaultGalleryLayout: "grid",
    defaultEntrance: "unfold",
    defaultAmbient: "gold-dust",
    defaultCoverMotion: "none",
    defaultEnvelopeIntro: true,
    suitedTo: ["wedding", "engagement"],
    preview: "silk",
    tag: { en: "Ceremonial", km: "ឱឡារិក" },
  },
  {
    id: "reachny",
    name: { en: "Reachny", km: "រាជនី" },
    description: {
      en: "Formal engraved card with indigo rules, a cartouche and an honour line.",
      km: "ធៀបផ្លូវការ មានស៊ុមខៀវមាស ក្របរូប និងបន្ទាត់គោរពអញ្ជើញ។",
    },
    defaultPalette: "indigo-gold",
    defaultFontPairingId: "moul",
    defaultPattern: "phka",
    defaultOrnamentLevel: "rich",
    defaultPhotoFrame: "gold",
    defaultGalleryLayout: "grid",
    defaultEntrance: "fade",
    defaultAmbient: "none",
    defaultCoverMotion: "none",
    defaultEnvelopeIntro: false,
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
    defaultPhotoFrame: "arch",
    defaultGalleryLayout: "masonry",
    defaultEntrance: "rise",
    defaultAmbient: "gold-dust",
    defaultCoverMotion: "none",
    defaultEnvelopeIntro: true,
    suitedTo: ["wedding", "engagement"],
    preview: "temple",
    tag: { en: "Traditional", km: "បុរាណ" },
  },
  {
    id: "bopha",
    name: { en: "Bopha", km: "បុប្ផា" },
    description: {
      en: "Classic Khmer card with a balanced family layout and gold corners.",
      km: "ធៀបខ្មែរបុរាណ មានស៊ុមមាស និងឈ្មោះគ្រួសារសងខាង។",
    },
    defaultPalette: "garnet-gold",
    defaultFontPairingId: "moul",
    defaultPattern: "none",
    defaultOrnamentLevel: "subtle",
    defaultPhotoFrame: "kbach",
    defaultGalleryLayout: "grid",
    defaultEntrance: "fade",
    defaultAmbient: "none",
    defaultCoverMotion: "none",
    defaultEnvelopeIntro: false,
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
    defaultPhotoFrame: "oval",
    defaultGalleryLayout: "masonry",
    defaultEntrance: "rise",
    defaultAmbient: "petals",
    defaultCoverMotion: "float",
    defaultEnvelopeIntro: true,
    suitedTo: ["wedding", "engagement", "birthday", "baby"],
    preview: "floral",
    tag: { en: "Floral", km: "ផ្កា" },
  },
  {
    id: "naga",
    name: { en: "Naga", km: "នាគ" },
    description: {
      en: "A cinematic night card with an arched portrait and naga ornament.",
      km: "ធៀបរាត្រីដ៏ឱឡារិក មានរូបក្របរាងក្លោង និងក្បាច់នាគ។",
    },
    defaultPalette: "temple-night",
    defaultFontPairingId: "classic",
    defaultPattern: "kbach",
    defaultOrnamentLevel: "subtle",
    defaultPhotoFrame: "arch",
    defaultGalleryLayout: "strip",
    defaultEntrance: "fade",
    defaultAmbient: "gold-dust",
    defaultCoverMotion: "kenburns",
    defaultEnvelopeIntro: true,
    suitedTo: ["wedding", "engagement", "anniversary", "corporate"],
    preview: "night",
    tag: { en: "Traditional", km: "បុរាណ" },
  },
  {
    id: "chan",
    name: { en: "Chan", km: "ចន្ទ" },
    description: {
      en: "An editorial split layout with a sticky date and generous space.",
      km: "ប្លង់ទស្សនាវដ្តីបែងចែកជាពីរ មានកាលបរិច្ឆេទជាប់ និងចន្លោះទូលាយ។",
    },
    defaultPalette: "sand",
    defaultFontPairingId: "editorial",
    defaultPattern: "none",
    defaultOrnamentLevel: "none",
    defaultPhotoFrame: "none",
    defaultGalleryLayout: "masonry",
    defaultEntrance: "fade",
    defaultAmbient: "none",
    defaultCoverMotion: "none",
    defaultEnvelopeIntro: false,
    suitedTo: [],
    preview: "editorial",
    tag: { en: "Minimal", km: "សាមញ្ញ" },
  },
  {
    id: "kravan",
    name: { en: "Kravan", km: "ក្រវាន់" },
    description: {
      en: "A full-bleed photo story followed by modern floating panels.",
      km: "រូបពេញអេក្រង់ បន្តដោយផ្ទាំងព័ត៌មានទំនើប។",
    },
    defaultPalette: "midnight",
    defaultFontPairingId: "modern",
    defaultPattern: "none",
    defaultOrnamentLevel: "none",
    defaultPhotoFrame: "none",
    defaultGalleryLayout: "strip",
    defaultEntrance: "rise",
    defaultAmbient: "none",
    defaultCoverMotion: "kenburns",
    defaultEnvelopeIntro: false,
    suitedTo: [],
    preview: "photo",
    tag: { en: "Photo", km: "រូបភាព" },
  },
  {
    id: "sila",
    name: { en: "Sila", km: "សីល" },
    description: {
      en: "A quiet, respectful reading layout for memorials and ceremonies.",
      km: "ប្លង់ស្ងប់ស្ងាត់ និងគួរសម សម្រាប់ពិធីបុណ្យ។",
    },
    defaultPalette: "ivory",
    defaultFontPairingId: "classic",
    defaultPattern: "none",
    defaultOrnamentLevel: "none",
    defaultPhotoFrame: "none",
    defaultGalleryLayout: "grid",
    defaultEntrance: "fade",
    defaultAmbient: "none",
    defaultCoverMotion: "none",
    defaultEnvelopeIntro: false,
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

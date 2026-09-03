import type {
  Activity,
  EventRecord,
  Expense,
  Guest,
  RsvpStatus,
  SideKey,
  Task,
} from "@/lib/types"
import { givenNamesFemale, givenNamesMale, relationships, surnames } from "./names"

/* ---------------------------------------------------------------------------
 * Deterministic pseudo-randomness.
 * The guest list is generated rather than hand-written, but it must be
 * byte-identical on the server and on the client or hydration breaks — hence a
 * seeded PRNG instead of Math.random().
 * ------------------------------------------------------------------------- */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(rng: () => number, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)]
}

function weighted<T extends { weight: number }>(rng: () => number, items: readonly T[]): T {
  const total = items.reduce((sum, i) => sum + i.weight, 0)
  let roll = rng() * total
  for (const item of items) {
    roll -= item.weight
    if (roll <= 0) return item
  }
  return items[items.length - 1]
}

/** Cambodian mobile numbers: 0XX XXX XXX across the common prefixes. */
function phone(rng: () => number) {
  const prefix = pick(rng, ["010", "011", "012", "015", "016", "017", "069", "070", "077", "081", "092", "096", "098"])
  const body = Math.floor(rng() * 900000 + 100000).toString()
  return `${prefix} ${body.slice(0, 3)} ${body.slice(3)}`
}

const WEDDING_DATE = "2026-10-17T17:00:00+07:00"

/* --------------------------------- Events -------------------------------- */

export const seedEvents: EventRecord[] = [
  {
    id: "evt_wedding",
    slug: "rithy-and-sreyneang",
    type: "wedding",
    status: "published",
    title: {
      en: "The Wedding of Rithy & Sreyneang",
      km: "ពិធីមង្គលការ រិទ្ធី និង ស្រីនាង",
    },
    date: WEDDING_DATE,
    timezone: "Asia/Phnom_Penh",
    venue: {
      name: {
        en: "Diamond Island Convention Centre",
        km: "មជ្ឈមណ្ឌលសន្និបាតកោះពេជ្រ",
      },
      address: {
        en: "Koh Pich, Tonle Bassac, Chamkarmon, Phnom Penh",
        km: "កោះពេជ្រ សង្កាត់ទន្លេបាសាក់ ខណ្ឌចំការមន រាជធានីភ្នំពេញ",
      },
      landmark: {
        en: "Hall B, second floor. Parking on the river side.",
        km: "សាល B ជាន់ទី២។ កន្លែងចតរថយន្តនៅខាងមាត់ទន្លេ។",
      },
      mapUrl: "https://maps.google.com/?q=Diamond+Island+Convention+Centre+Phnom+Penh",
      lat: 11.5449,
      lng: 104.9407,
    },
    hosts: [
      {
        id: "host_groom",
        name: { en: "Sok Rithy", km: "សុខ រិទ្ធី" },
        role: { en: "Groom", km: "កូនប្រុស" },
        parents: {
          en: "Son of Mr. Sok Chanthou & Mrs. Ly Bopha",
          km: "កូនប្រុសរបស់ លោក សុខ ចន្ធូ និង លោកស្រី លី បុប្ផា",
        },
        side: "a",
      },
      {
        id: "host_bride",
        name: { en: "Meas Sreyneang", km: "មាស ស្រីនាង" },
        role: { en: "Bride", km: "កូនស្រី" },
        parents: {
          en: "Daughter of Mr. Meas Vannak & Mrs. Tep Sophea",
          km: "កូនស្រីរបស់ លោក មាស វណ្ណៈ និង លោកស្រី ទេព សុភា",
        },
        side: "b",
      },
    ],
    contacts: [
      {
        id: "ct_1",
        name: { en: "Sok Visal", km: "សុខ វិសាល" },
        role: { en: "Groom's brother", km: "បងប្រុសកូនកំលោះ" },
        phone: "012 884 210",
        telegram: "sokvisal",
      },
      {
        id: "ct_2",
        name: { en: "Meas Chariya", km: "មាស ចរិយា" },
        role: { en: "Bride's sister", km: "បងស្រីកូនក្រមុំ" },
        phone: "096 771 458",
        telegram: "chariyameas",
      },
    ],
    schedule: [
      {
        id: "sc_1",
        time: "06:30",
        audience: "family",
        title: { en: "Groom's procession", km: "ពិធីហែជំនូន" },
        description: {
          en: "The groom's family walks to the bride's home carrying fruit and gifts.",
          km: "គ្រួសារខាងកូនប្រុសហែជំនូន ផ្លែឈើ និងអំណោយទៅផ្ទះខាងកូនស្រី។",
        },
        icon: "flower",
      },
      {
        id: "sc_2",
        time: "08:00",
        audience: "family",
        title: { en: "Monks' blessing", km: "ពិធីសូត្រមន្តជ័យតោ" },
        icon: "sparkles",
      },
      {
        id: "sc_3",
        time: "09:30",
        audience: "family",
        title: { en: "Hair cutting ceremony", km: "ពិធីកាត់សក់" },
        description: {
          en: "A symbolic new beginning for the couple.",
          km: "និមិត្តរូបនៃការចាប់ផ្តើមជីវិតថ្មីរបស់គូស្វាមីភរិយា។",
        },
        icon: "scissors",
      },
      {
        id: "sc_4",
        time: "10:30",
        audience: "family",
        title: { en: "Knot tying & Popil", km: "ពិធីសំពះផ្ទឹម និងបង្វិលពពិល" },
        description: {
          en: "Elders tie red thread on the couple's wrists and pass the popil candles.",
          km: "ចាស់ព្រឹទ្ធាចារ្យចងដៃដោយអំបោះក្រហម និងបង្វិលពពិល។",
        },
        icon: "heart",
      },
      {
        id: "sc_5",
        time: "11:30",
        audience: "family",
        title: { en: "Family lunch", km: "អាហារថ្ងៃត្រង់ជាមួយគ្រួសារ" },
        icon: "utensils",
      },
      {
        id: "sc_6",
        time: "17:00",
        title: { en: "Reception opens", km: "បើកកម្មវិធីជប់លៀង" },
        description: {
          en: "Guests are welcomed. Please arrive before 18:00.",
          km: "ស្វាគមន៍ភ្ញៀវកិត្តិយស។ សូមអញ្ជើញមកដល់មុនម៉ោង ៦ល្ងាច។",
        },
        icon: "party",
      },
      {
        id: "sc_7",
        time: "18:30",
        title: { en: "Dinner & toast", km: "អាហារពេលល្ងាច និងជូនពរ" },
        icon: "glass",
      },
      {
        id: "sc_8",
        time: "20:00",
        title: { en: "Romvong dancing", km: "រាំវង់" },
        icon: "music",
      },
    ],
    description: {
      en: "With the blessing of both families, we invite you to share in the joy of our wedding day.",
      km: "ដោយមានពរជ័យពីគ្រួសារទាំងសងខាង យើងខ្ញុំសូមគោរពអញ្ជើញលោកអ្នកចូលរួមក្នុងកម្មវិធីមង្គលការរបស់យើងខ្ញុំ។",
    },
    sides: {
      a: { en: "Groom's side", km: "ខាងកូនប្រុស" },
      b: { en: "Bride's side", km: "ខាងកូនស្រី" },
    },
    currency: "USD",
    coverPhoto:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=70",
    design: {
      templateId: "baisei",
      paletteId: "pastel-dawn",
      fontPairingId: "moul",
      patternId: "none",
      ornamentLevel: "rich",
      photoFrame: "arch",
      galleryLayout: "carousel",
      entrance: "rise",
      ambient: "petals",
      coverMotion: "kenburns",
      envelopeIntro: true,
      coupleMotifId: "couple-traditional",
      dividerMotifId: "divider-lotus",
      crestMotifId: "crest-top",
      greeting: {
        en: "Together with our families",
        km: "ដោយមានការអនុញ្ញាតពីមាតាបិតាទាំងសងខាង",
      },
      message: {
        en: "We would be honoured by your presence as we begin our life together.",
        km: "យើងខ្ញុំមានកិត្តិយសយ៉ាងខ្លាំង ប្រសិនបើលោកអ្នកអាចអញ្ជើញចូលរួមក្នុងថ្ងៃដ៏មានសិរីមង្គលនេះ។",
      },
      coverPhoto:
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=70",
      gallery: [
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=70",
        "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=70",
        "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=70",
        "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=70",
      ],
      showRsvp: true,
      showGallery: true,
      showSchedule: true,
      showMap: true,
      showGiftInfo: true,
      giftNote: {
        en: "Your presence is the greatest gift. Should you wish to give, an envelope box will be at the entrance.",
        km: "ការអញ្ជើញមករបស់លោកអ្នក គឺជាអំណោយដ៏ធំបំផុតហើយ។ ប្រសិនបើលោកអ្នកមានបំណងជូនចំណងដៃ ប្រអប់នឹងដាក់នៅច្រកចូល។",
      },
      rsvpDeadline: "2026-10-05",
    },
    createdAt: "2026-05-02T09:12:00+07:00",
  },
  {
    id: "evt_engagement",
    slug: "rithy-sreyneang-engagement",
    type: "engagement",
    status: "published",
    title: {
      en: "Engagement of Rithy & Sreyneang",
      km: "ពិធីភ្ជាប់ពាក្យ រិទ្ធី និង ស្រីនាង",
    },
    date: "2026-09-06T07:00:00+07:00",
    timezone: "Asia/Phnom_Penh",
    venue: {
      name: { en: "Meas Family Residence", km: "លំនៅឋានគ្រួសារ មាស" },
      address: {
        en: "House 42, Street 350, Boeung Keng Kang III, Phnom Penh",
        km: "ផ្ទះលេខ ៤២ ផ្លូវ ៣៥០ សង្កាត់បឹងកេងកង៣ ភ្នំពេញ",
      },
      mapUrl: "https://maps.google.com/?q=Street+350+Phnom+Penh",
    },
    hosts: [
      {
        id: "host_g2",
        name: { en: "Sok Rithy", km: "សុខ រិទ្ធី" },
        role: { en: "Groom", km: "កូនប្រុស" },
        side: "a",
      },
      {
        id: "host_b2",
        name: { en: "Meas Sreyneang", km: "មាស ស្រីនាង" },
        role: { en: "Bride", km: "កូនស្រី" },
        side: "b",
      },
    ],
    contacts: [
      {
        id: "ct_3",
        name: { en: "Meas Chariya", km: "មាស ចរិយា" },
        role: { en: "Bride's sister", km: "បងស្រីកូនក្រមុំ" },
        phone: "096 771 458",
      },
    ],
    schedule: [
      { id: "es_1", time: "07:00", title: { en: "Arrival of the groom's family", km: "គ្រួសារខាងកូនប្រុសមកដល់" }, audience: "family" },
      { id: "es_2", time: "08:00", title: { en: "Exchange of gifts", km: "ពិធីប្រគល់ជំនូន" }, audience: "family" },
      { id: "es_3", time: "10:00", title: { en: "Lunch together", km: "អាហារថ្ងៃត្រង់រួមគ្នា" } },
    ],
    description: {
      en: "A small family gathering to formally join our two families.",
      km: "ជួបជុំគ្រួសារតូចមួយ ដើម្បីភ្ជាប់គ្រួសារទាំងពីរជាផ្លូវការ។",
    },
    sides: {
      a: { en: "Groom's side", km: "ខាងកូនប្រុស" },
      b: { en: "Bride's side", km: "ខាងកូនស្រី" },
    },
    currency: "USD",
    coverPhoto:
      "https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=1600&q=70",
    design: {
      templateId: "reachny",
      paletteId: "indigo-gold",
      fontPairingId: "moul",
      patternId: "phka",
      ornamentLevel: "rich",
      photoFrame: "gold",
      galleryLayout: "grid",
      entrance: "fade",
      ambient: "petals",
      coverMotion: "float",
      envelopeIntro: true,
      dividerMotifId: "divider-geometric",
      greeting: { en: "With our families", km: "ជាមួយគ្រួសារយើងខ្ញុំ" },
      message: {
        en: "We are joining our families. Please come and celebrate with us.",
        km: "យើងខ្ញុំកំពុងភ្ជាប់គ្រួសារទាំងពីរ។ សូមអញ្ជើញចូលរួមអបអរជាមួយយើងខ្ញុំ។",
      },
      gallery: [
        "https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=1200&q=70",
        "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=70",
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=70",
      ],
      showRsvp: true,
      showGallery: true,
      showSchedule: true,
      showMap: true,
      showGiftInfo: false,
      rsvpDeadline: "2026-08-30",
    },
    createdAt: "2026-06-18T14:00:00+07:00",
  },
  {
    id: "evt_birthday",
    slug: "grandmother-bopha-80",
    type: "birthday",
    status: "draft",
    title: {
      en: "Grandmother Bopha's 80th Birthday",
      km: "ខួបកំណើតលើកទី៨០ លោកយាយ បុប្ផា",
    },
    date: "2026-11-22T11:00:00+07:00",
    timezone: "Asia/Phnom_Penh",
    venue: {
      name: { en: "Phkay Preuk Restaurant", km: "ភោជនីយដ្ឋាន ផ្កាយព្រឹក" },
      address: {
        en: "Sangkat Chroy Changvar, Phnom Penh",
        km: "សង្កាត់ជ្រោយចង្វារ រាជធានីភ្នំពេញ",
      },
    },
    hosts: [
      {
        id: "host_bd",
        name: { en: "Ly Bopha", km: "លី បុប្ផា" },
        role: { en: "Guest of honour", km: "ភ្ញៀវកិត្តិយស" },
      },
    ],
    contacts: [],
    schedule: [
      { id: "bs_1", time: "11:00", title: { en: "Family lunch", km: "អាហារថ្ងៃត្រង់គ្រួសារ" } },
      { id: "bs_2", time: "12:30", title: { en: "Blessing & photos", km: "ជូនពរ និងថតរូប" } },
    ],
    description: {
      en: "Eight decades, four generations, one very loud family lunch.",
      km: "៨០ឆ្នាំ បួនជំនាន់ និងអាហារថ្ងៃត្រង់គ្រួសារដ៏រីករាយ។",
    },
    sides: {
      a: { en: "Father's family", km: "ខាងឪពុក" },
      b: { en: "Mother's family", km: "ខាងម្តាយ" },
    },
    currency: "USD",
    coverPhoto:
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1600&q=70",
    design: {
      templateId: "chan",
      paletteId: "sage",
      greeting: { en: "Please join us", km: "សូមអញ្ជើញចូលរួម" },
      message: {
        en: "Come and celebrate 80 wonderful years with us.",
        km: "សូមអញ្ជើញមកអបអរខួប ៨០ ឆ្នាំដ៏មានន័យនេះជាមួយយើងខ្ញុំ។",
      },
      gallery: [],
      showRsvp: true,
      showGallery: false,
      showSchedule: true,
      showMap: true,
      showGiftInfo: false,
    },
    createdAt: "2026-08-11T08:30:00+07:00",
  },
]

/* --------------------------------- Guests -------------------------------- */

/**
 * Guest groups. `surname` biases the generated names, because a group called
 * "Meas family" full of unrelated surnames reads as fake immediately.
 */
const familyGroups: Array<{
  label: string
  side: SideKey
  weight: number
  surname?: [string, string]
  /** Constrains the relationship so a "colleague" is never a grandparent. */
  relationships?: string[]
}> = [
  { label: "Sok family", side: "a", weight: 10, surname: ["Sok", "សុខ"] },
  { label: "Ly family", side: "a", weight: 8, surname: ["Ly", "លី"] },
  { label: "Groom's colleagues — ACLEDA", side: "a", weight: 9, relationships: ["Colleague"] },
  {
    label: "Groom's university friends",
    side: "a",
    weight: 8,
    relationships: ["School friend"],
  },
  {
    label: "Takeo hometown",
    side: "a",
    weight: 7,
    relationships: ["Family friend", "Neighbour", "Village elder"],
  },
  { label: "Meas family", side: "b", weight: 10, surname: ["Meas", "មាស"] },
  { label: "Tep family", side: "b", weight: 8, surname: ["Tep", "ទេព"] },
  { label: "Bride's colleagues — Wing", side: "b", weight: 8, relationships: ["Colleague"] },
  { label: "Bride's school friends", side: "b", weight: 8, relationships: ["School friend"] },
  {
    label: "Battambang relatives",
    side: "b",
    weight: 7,
    relationships: ["Uncle / Aunt", "Cousin", "Grandparent"],
  },
  {
    label: "Neighbours — Street 350",
    side: "shared",
    weight: 6,
    relationships: ["Neighbour", "Family friend"],
  },
  {
    label: "Parents' business circle",
    side: "shared",
    weight: 5,
    relationships: ["Business associate"],
  },
]

const tables = Array.from({ length: 42 }, (_, i) => `${i + 1}`)

function makeWeddingGuests(): Guest[] {
  const rng = mulberry32(20261017)
  const guests: Guest[] = []
  const used = new Set<string>()
  const count = 124

  for (let i = 0; i < count; i++) {
    const group = weighted(rng, familyGroups)
    const isMale = rng() > 0.45
    // Blood-relative groups mostly share the family surname.
    const [sn, snKm] =
      group.surname && rng() < 0.72 ? group.surname : pick(rng, surnames)
    const [gn, gnKm] = pick(rng, isMale ? givenNamesMale : givenNamesFemale)
    const name = `${sn} ${gn}`
    if (used.has(name)) {
      i--
      continue
    }
    used.add(name)

    // Relationship must agree with the group, or the list reads as generated:
    // a "Bride's colleague" who is also a grandparent fools nobody.
    const allowed = group.relationships
      ? relationships.filter((r) => group.relationships!.includes(r.en))
      : group.surname
        ? relationships.filter(
            (r) => r.en !== "Colleague" && r.en !== "Business associate" && r.en !== "School friend"
          )
        : relationships
    const rel = weighted(rng, allowed)

    // Party size: most invitations cover a couple, some whole families.
    const sizeRoll = rng()
    const partySize = sizeRoll < 0.18 ? 1 : sizeRoll < 0.62 ? 2 : sizeRoll < 0.85 ? 4 : sizeRoll < 0.96 ? 6 : 8

    // RSVP distribution: a Cambodian list is mostly "yes", with a long tail of
    // people who simply never reply.
    const rsvpRoll = rng()
    const rsvp: RsvpStatus =
      rsvpRoll < 0.56 ? "confirmed" : rsvpRoll < 0.68 ? "declined" : rsvpRoll < 0.76 ? "maybe" : "pending"

    const responded = rsvp !== "pending"
    const respondedAt = responded
      ? new Date(Date.UTC(2026, 7, 1 + Math.floor(rng() * 24), 2 + Math.floor(rng() * 14))).toISOString()
      : undefined

    // Gifts are only recorded for a handful before the day — envelopes given
    // early by close relatives.
    // Envelope size tracks closeness and standing, which is how it actually
    // works: colleagues and neighbours give $20–$50, close relatives more, and
    // the parents' business circle is where the large envelopes come from.
    const generous =
      group.label === "Parents' business circle" ||
      rel.en === "Grandparent" ||
      rel.en === "Sibling" ||
      rel.en === "Business associate"
    const modest = rel.en === "Colleague" || rel.en === "School friend" || rel.en === "Neighbour"

    // Weeks before the day only close family have handed their envelope over
    // early; most guests bring theirs on the night.
    const hasGift =
      rsvp === "confirmed" && rng() < (generous ? 0.65 : modest ? 0.14 : 0.3)

    const giftTier = rng()
    const amount = generous
      ? giftTier < 0.25
        ? 100
        : giftTier < 0.7
          ? 200
          : 500
      : modest
        ? giftTier < 0.55
          ? 20
          : 50
        : giftTier < 0.3
          ? 20
          : giftTier < 0.72
            ? 50
            : 100

    guests.push({
      id: `g_${(i + 1).toString().padStart(3, "0")}`,
      eventId: "evt_wedding",
      token: `seed_${(i + 1).toString().padStart(3, "0")}`,
      name,
      nameKm: `${snKm} ${gnKm}`,
      phone: rng() < 0.88 ? phone(rng) : undefined,
      family: group.label,
      side: group.side,
      relationship: rel.en,
      partySize,
      rsvp,
      attendance: "unknown",
      gift: hasGift
        ? {
            amount,
            currency: "USD",
            method: rng() < 0.78 ? "cash" : "transfer",
            note: rng() < 0.12 ? "Given early at the house" : undefined,
          }
        : undefined,
      table: rsvp === "confirmed" ? pick(rng, tables) : undefined,
      notes: rng() < 0.09 ? pick(rng, [
        "Vegetarian — no fish paste",
        "Elderly, please seat near the entrance",
        "Arriving from Siem Reap, may be late",
        "Bringing two young children",
        "Wheelchair access needed",
      ]) : undefined,
      invitedAt: new Date(Date.UTC(2026, 6, 12 + Math.floor(rng() * 20))).toISOString(),
      respondedAt,
    })
  }
  return guests
}

function makeSmallGuestList(eventId: string, seed: number, count: number): Guest[] {
  const rng = mulberry32(seed)
  const guests: Guest[] = []
  const used = new Set<string>()
  for (let i = 0; i < count; i++) {
    const isMale = rng() > 0.5
    const [sn, snKm] = pick(rng, surnames)
    const [gn, gnKm] = pick(rng, isMale ? givenNamesMale : givenNamesFemale)
    const name = `${sn} ${gn}`
    if (used.has(name)) {
      i--
      continue
    }
    used.add(name)
    const rsvpRoll = rng()
    const rsvp: RsvpStatus = rsvpRoll < 0.62 ? "confirmed" : rsvpRoll < 0.74 ? "declined" : "pending"
    guests.push({
      id: `${eventId}_g${i + 1}`,
      eventId,
      token: `seed_${eventId}_${i + 1}`,
      name,
      nameKm: `${snKm} ${gnKm}`,
      phone: phone(rng),
      family: pick(rng, ["Immediate family", "Close relatives", "Neighbours", "Friends"]),
      side: pick(rng, ["a", "b", "shared"] as SideKey[]),
      relationship: weighted(rng, relationships).en,
      partySize: rng() < 0.5 ? 2 : rng() < 0.8 ? 3 : 5,
      rsvp,
      attendance: "unknown",
      invitedAt: "2026-08-01T00:00:00.000Z",
      respondedAt: rsvp === "pending" ? undefined : "2026-08-14T00:00:00.000Z",
    })
  }
  return guests
}

export const seedGuests: Guest[] = [
  ...makeWeddingGuests(),
  ...makeSmallGuestList("evt_engagement", 906, 28),
  ...makeSmallGuestList("evt_birthday", 1122, 19),
]

/* -------------------------------- Expenses ------------------------------- */

export const seedExpenses: Expense[] = [
  { id: "ex_1", eventId: "evt_wedding", title: "Reception hall — Hall B", category: "venue", vendor: "Diamond Island Convention Centre", amount: 2400, currency: "USD", paidAmount: 1200, status: "deposit", dueDate: "2026-10-10" },
  { id: "ex_2", eventId: "evt_wedding", title: "Dinner catering — 52 tables", category: "food", vendor: "Angkor Catering House", amount: 9880, currency: "USD", paidAmount: 3000, status: "deposit", dueDate: "2026-10-15", note: "$190 per table of 10, final count confirmed 3 days before" },
  { id: "ex_3", eventId: "evt_wedding", title: "Morning ceremony offerings", category: "ceremony", vendor: "Wat Botum arrangement", amount: 680, currency: "USD", paidAmount: 680, status: "paid" },
  { id: "ex_4", eventId: "evt_wedding", title: "Flowers & stage decoration", category: "decoration", vendor: "Rose Garden Decor", amount: 1750, currency: "USD", paidAmount: 500, status: "deposit", dueDate: "2026-10-12" },
  { id: "ex_5", eventId: "evt_wedding", title: "Photo & video package", category: "photography", vendor: "Bayon Studio", amount: 1450, currency: "USD", paidAmount: 700, status: "deposit", dueDate: "2026-10-17" },
  { id: "ex_6", eventId: "evt_wedding", title: "Live band & MC", category: "entertainment", vendor: "Preah Chan Entertainment", amount: 950, currency: "USD", paidAmount: 0, status: "planned", dueDate: "2026-10-17" },
  { id: "ex_7", eventId: "evt_wedding", title: "Printed invitations — 130 cards", category: "invitations", vendor: "Sovann Print", amount: 390, currency: "USD", paidAmount: 390, status: "paid", note: "QR code printed on the insert card" },
  { id: "ex_8", eventId: "evt_wedding", title: "Traditional costume rental & makeup", category: "clothing", vendor: "Apsara Bridal", amount: 1280, currency: "USD", paidAmount: 400, status: "deposit", dueDate: "2026-10-14" },
  { id: "ex_9", eventId: "evt_wedding", title: "Cars for the procession", category: "transport", vendor: "Mekong Transport", amount: 320, currency: "USD", paidAmount: 0, status: "planned", dueDate: "2026-10-16" },
  { id: "ex_10", eventId: "evt_wedding", title: "Wedding cake & fruit trays", category: "food", vendor: "Sweet House", amount: 460, currency: "USD", paidAmount: 460, status: "paid" },
  { id: "ex_11", eventId: "evt_wedding", title: "Guest parking attendants", category: "other", vendor: "—", amount: 180, currency: "USD", paidAmount: 0, status: "planned", dueDate: "2026-10-17" },
  { id: "ex_12", eventId: "evt_engagement", title: "Fruit and gift trays", category: "ceremony", vendor: "Central Market", amount: 340, currency: "USD", paidAmount: 340, status: "paid" },
  { id: "ex_13", eventId: "evt_engagement", title: "Lunch for 60", category: "food", vendor: "Home catering", amount: 720, currency: "USD", paidAmount: 200, status: "deposit", dueDate: "2026-09-05" },
]

/* --------------------------------- Tasks --------------------------------- */

export const seedTasks: Task[] = [
  { id: "tk_1", eventId: "evt_wedding", title: { en: "Book the reception hall", km: "កក់សាលពិធី" }, category: "venue", dueDate: "2026-06-15", done: true },
  { id: "tk_2", eventId: "evt_wedding", title: { en: "Choose the monks and set the ceremony time", km: "ជ្រើសរើសព្រះសង្ឃ និងកំណត់ម៉ោងពិធី" }, category: "ceremony", dueDate: "2026-07-01", done: true },
  { id: "tk_3", eventId: "evt_wedding", title: { en: "Finalise the guest list with both families", km: "បញ្ចប់បញ្ជីភ្ញៀវជាមួយគ្រួសារទាំងសងខាង" }, category: "guests", dueDate: "2026-07-20", done: true },
  { id: "tk_4", eventId: "evt_wedding", title: { en: "Print invitations with the QR code", km: "បោះពុម្ពធៀបជាមួយកូដ QR" }, category: "guests", dueDate: "2026-08-05", done: true },
  { id: "tk_5", eventId: "evt_wedding", title: { en: "Hand out invitations to relatives", km: "ចែកធៀបជូនសាច់ញាតិ" }, category: "guests", dueDate: "2026-08-24", done: true },
  { id: "tk_6", eventId: "evt_wedding", title: { en: "Confirm catering headcount", km: "បញ្ជាក់ចំនួនតុអាហារ" }, category: "vendors", dueDate: "2026-10-14", done: false, note: "Caterer needs the final number 3 days ahead" },
  { id: "tk_7", eventId: "evt_wedding", title: { en: "Fitting for traditional costumes", km: "សាកល្បងសម្លៀកបំពាក់ប្រពៃណី" }, category: "attire", dueDate: "2026-09-20", done: false },
  { id: "tk_8", eventId: "evt_wedding", title: { en: "Confirm photographer's schedule", km: "បញ្ជាក់កាលវិភាគអ្នកថតរូប" }, category: "vendors", dueDate: "2026-09-28", done: false },
  { id: "tk_9", eventId: "evt_wedding", title: { en: "Arrange cars for the morning procession", km: "រៀបចំរថយន្តសម្រាប់ពិធីហែជំនូន" }, category: "logistics", dueDate: "2026-10-08", done: false },
  { id: "tk_10", eventId: "evt_wedding", title: { en: "Chase guests who have not replied", km: "ទាក់ទងភ្ញៀវដែលមិនទាន់ឆ្លើយតប" }, category: "guests", dueDate: "2026-10-05", done: false },
  { id: "tk_11", eventId: "evt_wedding", title: { en: "Prepare seating chart by table", km: "រៀបចំតារាងកន្លែងអង្គុយតាមតុ" }, category: "logistics", dueDate: "2026-10-12", done: false },
  { id: "tk_12", eventId: "evt_wedding", title: { en: "Prepare envelopes and gift box", km: "រៀបចំស្រោមធៀប និងប្រអប់ចំណងដៃ" }, category: "logistics", dueDate: "2026-10-16", done: false },
  { id: "tk_13", eventId: "evt_wedding", title: { en: "Pay remaining balance to the hall", km: "បង់ប្រាក់នៅសល់ជូនសាល" }, category: "vendors", dueDate: "2026-10-10", done: false },
  { id: "tk_14", eventId: "evt_engagement", title: { en: "Prepare the gift trays", km: "រៀបចំជំនូន" }, category: "ceremony", dueDate: "2026-09-04", done: false },
  { id: "tk_15", eventId: "evt_engagement", title: { en: "Confirm the elder who will lead the ceremony", km: "បញ្ជាក់អាចារ្យដែលនាំពិធី" }, category: "ceremony", dueDate: "2026-08-28", done: false },
]

/* ------------------------------- Activity -------------------------------- */

export const seedActivity: Activity[] = [
  { id: "ac_1", eventId: "evt_wedding", kind: "rsvp", message: { en: "Chan Sopheak confirmed for 4 seats", km: "ចាន់ សុភ័ក្ត្រ បានបញ្ជាក់ ៤ កៅអី" }, at: "2026-08-24T14:20:00+07:00" },
  { id: "ac_2", eventId: "evt_wedding", kind: "gift", message: { en: "$100 gift recorded from Ly Vannary", km: "បានកត់ត្រាចំណងដៃ $១០០ ពី លី វណ្ណារី" }, at: "2026-08-24T10:05:00+07:00" },
  { id: "ac_3", eventId: "evt_wedding", kind: "rsvp", message: { en: "Kong Piseth declined with a message", km: "គង់ ពិសិដ្ឋ មិនអាចចូលរួម ព្រមទាំងផ្ញើសារ" }, at: "2026-08-23T19:41:00+07:00" },
  { id: "ac_4", eventId: "evt_wedding", kind: "guest", message: { en: "12 guests added from the Battambang list", km: "បានបន្ថែមភ្ញៀវ ១២ នាក់ពីបញ្ជីបាត់ដំបង" }, at: "2026-08-23T09:15:00+07:00" },
  { id: "ac_5", eventId: "evt_wedding", kind: "expense", message: { en: "Deposit of $500 paid to Rose Garden Decor", km: "បានបង់ប្រាក់កក់ $៥០០ ជូន Rose Garden Decor" }, at: "2026-08-22T16:30:00+07:00" },
  { id: "ac_6", eventId: "evt_wedding", kind: "share", message: { en: "Invitation link shared on Telegram", km: "បានចែករំលែកតំណធៀបតាម Telegram" }, at: "2026-08-21T20:02:00+07:00" },
  { id: "ac_7", eventId: "evt_wedding", kind: "task", message: { en: "\"Hand out invitations to relatives\" completed", km: "\"ចែកធៀបជូនសាច់ញាតិ\" បានបញ្ចប់" }, at: "2026-08-21T11:48:00+07:00" },
]

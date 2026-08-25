/* ---------------------------------------------------------------------------
 * Domain model.
 *
 * The model is event-type agnostic on purpose: weddings are the flagship, but
 * a funeral, a birthday or a housewarming reuses the same Event/Guest/Gift/
 * Expense shapes. Anything wedding-specific is expressed as configuration
 * (`sides`, `giftLabel`, template defaults) rather than as separate types.
 * ------------------------------------------------------------------------- */

export type Locale = "en" | "km"

/** Any user-authored string that can exist in both languages. */
export type LocalizedText = { en: string; km: string }

export type EventType =
  | "wedding"
  | "engagement"
  | "birthday"
  | "funeral"
  | "housewarming"
  | "graduation"
  | "baby"
  | "anniversary"
  | "corporate"
  | "other"

export type Currency = "USD" | "KHR"

export type Money = { amount: number; currency: Currency }

/**
 * Guests belong to one of two "sides" plus a shared bucket. For a wedding that
 * is the groom's and the bride's family; for a funeral it is family and
 * community. Labels live on the event so the table headers read naturally.
 */
export type SideKey = "a" | "b" | "shared"

export type RsvpStatus = "pending" | "confirmed" | "declined" | "maybe"
export type AttendanceStatus = "unknown" | "attended" | "absent"
export type GiftMethod = "cash" | "transfer" | "item"

export type Host = {
  id: string
  /** Display name of the person being celebrated, or the host. */
  name: LocalizedText
  /** e.g. "Groom", "Bride", "Family of the deceased". */
  role: LocalizedText
  /** Parents' names — printed on Cambodian invitations above the couple. */
  parents?: LocalizedText
  photo?: string
  side?: Exclude<SideKey, "shared">
}

export type Venue = {
  name: LocalizedText
  address: LocalizedText
  /** Free-form landmark note, e.g. "opposite Wat Botum". */
  landmark?: LocalizedText
  mapUrl?: string
  lat?: number
  lng?: number
}

export type ScheduleItem = {
  id: string
  /** 24h "HH:mm". */
  time: string
  title: LocalizedText
  description?: LocalizedText
  /** Lucide icon name, chosen in the builder. */
  icon?: string
}

export type ContactPerson = {
  id: string
  name: LocalizedText
  role: LocalizedText
  phone: string
  telegram?: string
}

/** How heavily a template leans on its decorative motifs. */
export type OrnamentLevel = "none" | "subtle" | "rich"

/** Shape/treatment applied to the cover and gallery photos. */
export type PhotoFrameId =
  | "none"
  | "rounded"
  | "arch"
  | "oval"
  | "circle"
  | "lotus"
  | "polaroid"
  | "gold"
  | "kbach"

/** How sections arrive as the guest scrolls. */
export type EntranceId = "none" | "fade" | "rise" | "zoom" | "unfold"

/** Drifting decoration layered over the whole card. */
export type AmbientId = "none" | "petals" | "lotus" | "sparkle" | "gold-dust"

export type GalleryLayoutId = "grid" | "carousel" | "masonry" | "strip"

/** Motion applied to the cover photo itself. */
export type CoverMotionId = "none" | "kenburns" | "float"

export type InvitationDesign = {
  templateId: string
  paletteId: string
  /** Overrides the template's default type pairing. */
  fontPairingId?: string
  /** Seamless background motif; see components/invitation/patterns.tsx. */
  patternId?: string
  ornamentLevel?: OrnamentLevel

  /* --- The parts that make it an *e*-invitation rather than a photo of one --- */
  photoFrame?: PhotoFrameId
  galleryLayout?: GalleryLayoutId
  entrance?: EntranceId
  ambient?: AmbientId
  coverMotion?: CoverMotionId
  /** Show the "tap to open" envelope before the card. */
  envelopeIntro?: boolean
  /** Id from MOTIF_ASSETS for the couple illustration; falls back to the drawn pair. */
  coupleMotifId?: string
  greeting: LocalizedText
  message: LocalizedText
  coverPhoto?: string
  gallery: string[]
  showRsvp: boolean
  showGallery: boolean
  showSchedule: boolean
  showMap: boolean
  showGiftInfo: boolean
  giftNote?: LocalizedText
  /** RSVP cut-off, ISO date. */
  rsvpDeadline?: string
}

export type EventRecord = {
  id: string
  /** Public URL segment: /i/[slug]. */
  slug: string
  type: EventType
  status: "draft" | "published"
  title: LocalizedText
  /** ISO date-time of the main ceremony. */
  date: string
  /** e.g. "Asia/Phnom_Penh". Kept for future scheduling correctness. */
  timezone: string
  venue: Venue
  hosts: Host[]
  contacts: ContactPerson[]
  schedule: ScheduleItem[]
  description: LocalizedText
  /** Labels for the two guest sides. */
  sides: { a: LocalizedText; b: LocalizedText }
  currency: Currency
  design: InvitationDesign
  coverPhoto: string
  createdAt: string
}

export type Guest = {
  id: string
  eventId: string
  name: string
  nameKm?: string
  phone?: string
  /** Family or group the invitation belongs to, e.g. "Sok family". */
  family?: string
  side: SideKey
  relationship?: string
  /** Number of people expected on this one invitation. */
  partySize: number
  rsvp: RsvpStatus
  attendance: AttendanceStatus
  /** Head-count actually recorded at the door. */
  attendedCount?: number
  gift?: { amount: number; currency: Currency; method: GiftMethod; note?: string }
  table?: string
  notes?: string
  invitedAt: string
  respondedAt?: string
}

export type ExpenseCategory =
  | "venue"
  | "food"
  | "decoration"
  | "photography"
  | "entertainment"
  | "transport"
  | "invitations"
  | "clothing"
  | "ceremony"
  | "other"

export type ExpenseStatus = "planned" | "deposit" | "paid"

export type Expense = {
  id: string
  eventId: string
  title: string
  category: ExpenseCategory
  vendor?: string
  amount: number
  currency: Currency
  /** Amount already handed over, for deposit-based vendor arrangements. */
  paidAmount: number
  status: ExpenseStatus
  dueDate?: string
  note?: string
}

export type TaskCategory =
  | "venue"
  | "guests"
  | "ceremony"
  | "vendors"
  | "attire"
  | "logistics"
  | "other"

export type Task = {
  id: string
  eventId: string
  title: LocalizedText
  category: TaskCategory
  dueDate?: string
  done: boolean
  note?: string
}

export type ActivityKind = "rsvp" | "gift" | "guest" | "task" | "expense" | "share"

export type Activity = {
  id: string
  eventId: string
  kind: ActivityKind
  /** Pre-composed, bilingual, because it is display-only. */
  message: LocalizedText
  at: string
}

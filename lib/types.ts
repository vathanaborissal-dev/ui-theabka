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

/**
 * Who a ceremony is for. A Khmer wedding runs from dawn to night, but most
 * invited guests attend only the reception — without this the schedule reads
 * as an eight-item commitment and guests arrive at the wrong hour, or not at
 * all. Undefined means everyone, so existing schedules keep working.
 */
export type ScheduleAudience = "all" | "family"

export type ScheduleItem = {
  id: string
  /** 24h "HH:mm". */
  time: string
  title: LocalizedText
  description?: LocalizedText
  /** Lucide icon name, chosen in the builder. */
  icon?: string
  audience?: ScheduleAudience
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
export type EntranceId =
  | "none"
  | "fade"
  | "rise"
  | "settle"
  | "zoom"
  | "unfold"
  | "driftLeft"
  | "driftRight"
  | "soften"
  | "tilt"
  | "curtain"
  | "sweep"
  | "flip"
  | "bloom"
  | "glide"

/** Drifting decoration layered over the whole card. */
export type AmbientId = "none" | "petals" | "lotus" | "sparkle" | "gold-dust"

export type GalleryLayoutId = "grid" | "carousel" | "masonry" | "strip"

/** Motion applied to the cover photo itself. */
export type CoverMotionId = "none" | "kenburns" | "float"

export type NamePlateId =
  | "none"
  | "gold"
  | "ivory"
  | "scroll"
  | "modern"
  | "emerald"

/** The fixed layer behind the whole card; see lib/invitation/backdrops.ts. */
export type BackdropId =
  | "none"
  | "photo"
  | "custom"
  | "damask"
  | "video"
  | "silk"
  | "dawn"
  | "garden"
  | "temple"
  | "paper"

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
  /** Fixed layer behind the whole card; see lib/invitation/backdrops.ts. */
  backdropId?: BackdropId
  /** The couple's own background image, used when backdropId is "custom". */
  backdropPhoto?: string
  /** Looping background video, used when backdropId is "video". */
  backdropVideo?: string
  /** Plays once when the envelope is opened, before the card appears. */
  introVideo?: string
  /**
   * Free-form colour overrides, applied on top of the chosen palette.
   *
   * The palettes are eight considered pairings; these two let a couple match a
   * card to a dress or a venue's flowers, which no fixed list can anticipate.
   * Primary is the bright metal — ornament, the cover title. Text is the
   * darker one everything else is set in.
   */
  primaryColor?: string
  textColor?: string
  /** Built-in track id from lib/invitation/music.ts. */
  musicId?: string
  /** The couple's own uploaded track. Wins over musicId when both are set. */
  musicUrl?: string
  /** Id from MOTIF_ASSETS for the couple illustration; falls back to the drawn pair. */
  coupleMotifId?: string
  /** Id from MOTIF_ASSETS for section-header rules; falls back to the drawn kbach. */
  dividerMotifId?: string
  /** Id from MOTIF_ASSETS for the crest above and below the card. */
  crestMotifId?: string
  /** Id from MOTIF_ASSETS for the four card corners; falls back to drawn kbach. */
  cornerMotifId?: string
  greeting: LocalizedText
  message: LocalizedText
  /**
   * @deprecated The cover photo lives on the event (`EventRecord.coverPhoto`),
   * where Settings edits it and link previews read it. Kept only so rows
   * written before the move still render; `InvitationRenderer` resolves the two
   * into this field before a template sees it. Do not write it.
   */
  coverPhoto?: string
  gallery: string[]
  showRsvp: boolean
  showGallery: boolean
  showSchedule: boolean
  showMap: boolean
  showGiftInfo: boolean
  giftNote?: LocalizedText
  /** Bank QR images guests scan to send a gift, one per currency. */
  giftQrUsd?: string
  giftQrKhr?: string
  /** Show the wall of messages guests left with their reply. */
  showWishes?: boolean
  /** Closing note of thanks, shown near the end of the card. */
  thankYouTitle?: LocalizedText
  thankYouNote?: LocalizedText
  /** A drawn or photographed map of the venue, shown instead of the placeholder. */
  venueMapImage?: string
  /** Overrides the printed "Respectfully inviting" line above the guest name. */
  honourLabel?: LocalizedText
  /** Which frame the guest's name sits in; see lib/invitation/name-plates.ts. */
  namePlateId?: NamePlateId
  /**
   * Drops the couple's names from the cover.
   *
   * For a cover photo that already has the names set into the artwork, where
   * repeating them below is the thing that makes the card look homemade.
   */
  hideCoverNames?: boolean
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
  /** When the invitation was last published. Absent if it never has been. */
  publishedAt?: string
  /**
   * True when the draft has moved on from what guests are being served.
   *
   * The event row is the couple's working copy; the API keeps a separate
   * snapshot of what /i/{slug} answers with. This is the difference between
   * them, and it is what lets the builder say "published, with changes waiting"
   * instead of implying every edit is already live.
   */
  hasUnpublishedChanges?: boolean
  /**
   * Head counts from the server, for the event list.
   *
   * The list does not load guests, so it cannot count them. These used to be
   * derived from the provider's guest cache, which that page never fills — so
   * every card read zero however many guests the event had.
   */
  guestCount?: number
  confirmedCount?: number
  createdAt: string
}

/** The deliberately smaller event shape that an anonymous invitation may expose. */
export type InvitationEvent = Pick<
  EventRecord,
  | "slug"
  | "type"
  | "title"
  | "date"
  | "timezone"
  | "venue"
  | "hosts"
  | "contacts"
  | "schedule"
  | "description"
  | "design"
  | "coverPhoto"
>

export type Guest = {
  id: string
  eventId: string
  /**
   * The guest's own invitation link segment: /i/{slug}?g={token}.
   *
   * Assigned by the server and unguessable, because it is handed out in a chat
   * message and forwarded onwards. Not the id — that is an internal key the
   * public endpoint does not accept.
   */
  token: string
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
  /** Optional proof of payment stored with the event. */
  receiptUrl?: string
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

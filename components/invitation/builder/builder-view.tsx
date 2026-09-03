"use client"

import * as React from "react"
import {ArrowDown,
  ArrowUp,
  Eye,
  GripVertical,
  Maximize2,
  Minimize2,
  Monitor,
  Play,
  Plus,
  RotateCcw,
  Smartphone,
  Sparkles,
  Trash2,
  Upload,
  X} from "lucide-react"
import { BrandSpinner } from "@/components/brand/brand-spinner"
import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui/button-link"
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { TimePicker } from "@/components/ui/time-picker"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Photo } from "@/components/shared/photo"
import {
  useData,
  useEventData,
  type EventSaveState,
} from "@/components/providers/data-provider"
import { LocaleProvider, useLocale } from "@/components/providers/locale-provider"
import { InvitationRenderer } from "../invitation-renderer"
import { BilingualField } from "./bilingual-field"
import {
  BackdropPicker,
  ColourField,
  CoupleMotifPicker,
  MotifSlotPicker,
  MusicPicker,
  NamePlatePicker,
  FontPairingPicker,
  OptionRow,
  OrnamentPicker,
  PalettePicker,
  PatternPicker,
  PhotoFramePicker,
  TemplatePicker,
} from "./pickers"
import { AMBIENT_EFFECTS } from "@/components/invitation/ambient"
import { GALLERY_LAYOUTS } from "@/components/invitation/gallery"
import { PhotoUpload } from "@/components/invitation/builder/photo-upload"
import { uploadClip } from "@/lib/uploads"
import {
  INTRO_CLIPS,
  findIntroClip,
  introClipUrl,
} from "@/lib/invitation/intro-clips"
import { PublishBadge, PublishControls } from "@/components/invitation/publish-controls"
import {
  PreviewFocusProvider,
  scrollPreviewTo,
  useSectionFocus,
} from "@/components/invitation/builder/preview-focus"
import type { InvSectionId } from "@/components/invitation/sections/common"
import { getTemplate } from "@/lib/invitation/templates"
import { cn } from "@/lib/utils"
import type {
  AmbientId,
  Locale,
  BackdropId,
  CoverMotionId,
  EntranceId,
  GalleryLayoutId,
  InvitationDesign,
  LocalizedText,
  OrnamentLevel,
  PhotoFrameId,
  ScheduleItem,
} from "@/lib/types"
import type { PatternId } from "@/components/invitation/patterns"

type Device = "mobile" | "desktop"

/** Swap two entries — the gallery order is the order guests see. */
function swap<T>(items: T[], a: number, b: number) {
  const next = [...items]
  ;[next[a], next[b]] = [next[b], next[a]]
  return next
}

/** One tap to a populated gallery, so the layouts can be judged immediately. */
const SAMPLE_PHOTOS = [
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=70",
  "https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=1200&q=70",
]

/**
 * The name in the preview, in both scripts, so the honour block and the name
 * plate show real text at a realistic length rather than a placeholder.
 */
const PREVIEW_GUEST = { name: "Sok Ratanavisal", nameKm: "លោក សុខ រតនៈវិសាល" }

export function InvitationBuilder({ eventId }: { eventId: string }) {
  const { event } = useEventData(eventId)
  const { updateDesign, updateEvent, eventSaveState } = useData()
  const { t, locale } = useLocale()

  const [device, setDevice] = React.useState<Device>("mobile")
  /*
   * The preview's language, separate from the dashboard's.
   *
   * A Cambodian card is written in both and the two are rarely the same length
   * — a line that fits in English can wrap to three in Khmer — so the couple
   * has to be able to look at each without switching the language of the whole
   * admin around them.
   */
  const [previewLocale, setPreviewLocale] = React.useState<Locale>("km")
  const [fullScreen, setFullScreen] = React.useState(false)

  /*
   * Two preview surfaces — the desktop panel and the mobile sheet — and only
   * one is mounted at a time, so the focus handler tries both rather than
   * assuming which is on screen.
   */
  const desktopPreviewRef = React.useRef<HTMLDivElement>(null)
  const sheetPreviewRef = React.useRef<HTMLDivElement>(null)

  const previewFocus = React.useMemo(
    () => ({
      focus: (section: InvSectionId) => {
        // The sheet wins when it is open, because it is what covers the screen.
        const movedSheet = scrollPreviewTo(sheetPreviewRef.current, section)
        if (!movedSheet) scrollPreviewTo(desktopPreviewRef.current, section)
      },
      showLocale: (next: Locale) => setPreviewLocale(next),
    }),
    []
  )
  const [previewOpen, setPreviewOpen] = React.useState(false)

  /*
   * Playing the card's motion inside the editor.
   *
   * The preview is deliberately still while you work — a card that re-animates
   * on every keystroke is unreadable, which is why `motionEnabled` is off here.
   * But that left the entrance settings with nowhere to be seen: you picked one
   * from a list of names and found out what it did by publishing.
   *
   * `playKey` doubles as the remount key. Reveal decides once, per mount,
   * whether a section has been seen; replaying therefore means mounting a fresh
   * copy rather than asking the old one to forget.
   */
  const [playKey, setPlayKey] = React.useState(0)
  const [playing, setPlaying] = React.useState(false)

  const playMotion = React.useCallback(() => {
    // Rewind first: sections already scrolled past have played, and an
    // animation you cannot see has not been previewed.
    const surface = sheetPreviewRef.current ?? desktopPreviewRef.current
    surface?.scrollTo({ top: 0 })
    setPlaying(true)
    setPlayKey((n) => n + 1)
  }, [])

  if (!event) return null

  const design = event.design
  const currentEventId = event.id
  const template = getTemplate(design.templateId)
  const set = (patch: Partial<InvitationDesign>) => updateDesign(currentEventId, patch)
  const saveState = eventSaveState[currentEventId] ?? "idle"

  const actions = (
    <>
      <Button variant="outline" className="lg:hidden" onClick={() => setPreviewOpen(true)}>
        <Eye />
        {t("inv.preview")}
      </Button>
      {/* More room for the editor column and the card beside it. The card is
          tall and the field list is long, and on a laptop the two together do
          not fit under the dashboard chrome. */}
      <Button
        variant="outline"
        size="icon"
        className="hidden lg:inline-flex"
        aria-pressed={fullScreen}
        aria-label={fullScreen ? t("inv.exitFullScreen") : t("inv.fullScreen")}
        title={fullScreen ? t("inv.exitFullScreen") : t("inv.fullScreen")}
        onClick={() => setFullScreen((on) => !on)}
      >
        {fullScreen ? <Minimize2 /> : <Maximize2 />}
      </Button>
      <ButtonLink
        href={`/i/${event.slug}`}
        target="_blank"
        variant="outline"
        className={fullScreen ? "hidden xl:inline-flex" : undefined}
      >
        {t("inv.openPage")}
      </ButtonLink>
      <PublishControls event={event} />
    </>
  )

  return (
    <PreviewFocusProvider value={previewFocus}>
    <div
      className={cn(
        fullScreen
          // overflow-y-auto is a safety net, not the normal path: the panes are
          // sized to fit, but full screen can outlive the width that offers it
          // if the window is dragged narrow, and content you cannot reach is
          // worse than a scrollbar you never use.
          ? "fixed inset-0 z-50 space-y-3 overflow-y-auto bg-background p-4 sm:p-5"
          : "space-y-5"
      )}
    >
      {/*
        * Two headers, because full screen is a different job.
        *
        * The page header explains what this screen is, which is worth a title,
        * a sentence and a status line the first few times. Full screen is
        * entered precisely because the panes are short — so keeping ~110px of
        * explanation there spends the room on the thing the couple just asked
        * to get rid of. Same controls, one row, no prose.
        */}
      {fullScreen ? (
        <div className="flex items-center gap-3 border-b border-border pb-3">
          <h1 className="display shrink-0 text-base">{t("inv.title")}</h1>
          <PublishBadge event={event} />
          <SaveState state={saveState} className="hidden sm:block" />
          <div className="ml-auto flex shrink-0 items-center gap-2">{actions}</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <h1 className="display text-2xl sm:text-[1.75rem]">{t("inv.title")}</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">{t("inv.subtitle")}</p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <PublishBadge event={event} />
              <SaveState state={saveState} />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        </div>
      )}

      {/*
        * A two-pane workspace, not a page.
        *
        * Both halves used to scroll the document together, which made the
        * design tab alone about six screens tall and carried the card off the
        * top of the window while you were editing it. Each pane now scrolls
        * inside its own height, so the preview stays where it is and the
        * fields move past it.
        */}
      <div
        className={cn(
          "grid gap-6 lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)] lg:gap-8",
          "lg:h-[calc(100svh-var(--builder-chrome))] lg:overflow-hidden"
        )}
        style={
          {
            // The dashboard header, the page title and the tab strip above it.
            "--builder-chrome": fullScreen ? "7.5rem" : "15rem",
          } as React.CSSProperties
        }
      >
        {/*
          * `contain-paint` on each panel is load-bearing.
          *
          * `overflow-y-auto` alone clipped the fields visually but still handed
          * their full height up to the document, so the window scrolled four
          * thousand pixels into blank space below a page that looked finished.
          * Paint containment stops that propagation without touching layout,
          * which `contain: size` would have broken for a `flex-1` pane.
          */}
        <Tabs
          defaultValue="template"
          className="min-w-0 lg:flex lg:min-h-0 lg:flex-col"
        >
          <TabsList variant="line" className="w-full shrink-0 justify-start overflow-x-auto">
            <TabsTrigger value="template">{t("inv.design")}</TabsTrigger>
            <TabsTrigger value="content">{t("inv.content")}</TabsTrigger>
            <TabsTrigger value="photos">{t("inv.photos")}</TabsTrigger>
            <TabsTrigger value="schedule">{t("inv.schedule")}</TabsTrigger>
            <TabsTrigger value="sections">{t("inv.sections")}</TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="mt-5 space-y-6 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:contain-paint lg:scroll-py-4 lg:pt-1 lg:pr-3 lg:pb-4 lg:pl-1">
            <Section title={t("inv.template")}>
              <TemplatePicker
                eventType={event.type}
                value={design.templateId}
                onChange={(id) => {
                  // Switching template adopts its whole look, otherwise you
                  // land on a temple layout wearing the previous card's palette.
                  const next = getTemplate(id)
                  set({
                    templateId: id,
                    paletteId: next.defaultPalette,
                    fontPairingId: next.defaultFontPairingId,
                    patternId: next.defaultPattern,
                    ornamentLevel: next.defaultOrnamentLevel,
                    photoFrame: next.defaultPhotoFrame,
                    galleryLayout: next.defaultGalleryLayout,
                    entrance: next.defaultEntrance,
                    ambient: next.defaultAmbient,
                    coverMotion: next.defaultCoverMotion,
                    envelopeIntro: next.defaultEnvelopeIntro,
                    backdropId: next.defaultBackdrop ?? "none",
                    // Written into the design rather than applied behind the
                    // scenes, so the Opening clip field shows what is actually
                    // playing — and can be cleared or replaced like any other.
                    introVideo: next.envelopeVideo,
                    primaryColor: undefined,
                    textColor: undefined,
                  })
                }}
              />
            </Section>
            {/*
              * Grouped, and one open at a time.
              *
              * Twelve sections stacked in a 23rem column meant scrolling past
              * everything to reach anything. Grouping also makes the two kinds
              * of colour tellable apart — a palette is a set someone chose for
              * you, the overrides are yours — which as two adjacent sections
              * both called "Colour" they were not.
              */}
            <Accordion defaultValue={["look"]} className="gap-2.5">
              <Group value="look" title={t("inv.groupLook")} hint={t("inv.groupLookHint")}>
                <Section title={t("inv.palette")}>
                <PalettePicker
                value={design.paletteId}
                onChange={(paletteId) => set({ paletteId })}
                />
                </Section>

                <Section title={t("inv.colours")}>
                <div className="grid gap-3 sm:grid-cols-2">
                <ColourField
                label={t("inv.primaryColour")}
                value={design.primaryColor}
                fallback="#f9af59"
                onChange={(primaryColor) => set({ primaryColor })}
                />
                <ColourField
                label={t("inv.textColour")}
                value={design.textColor}
                fallback="#b08e4f"
                onChange={(textColor) => set({ textColor })}
                />
                </div>
                <p className="text-xs text-muted-foreground">{t("inv.colourHelp")}</p>
                </Section>

                <Section title={t("inv.typeface")}>
                <FontPairingPicker
                value={design.fontPairingId ?? template.defaultFontPairingId}
                onChange={(fontPairingId) => set({ fontPairingId })}
                />
                </Section>
              </Group>

              <Group value="ornament" title={t("inv.groupOrnament")} hint={t("inv.groupOrnamentHint")}>
                <Section title={t("inv.ornaments")}>
                <OrnamentPicker
                value={design.ornamentLevel ?? template.defaultOrnamentLevel}
                onChange={(ornamentLevel: OrnamentLevel) => set({ ornamentLevel })}
                />
                <p className="text-xs text-muted-foreground">{t("inv.ornamentHelp")}</p>
                </Section>

                <Section title={t("inv.pattern")}>
                <PatternPicker
                value={(design.patternId ?? template.defaultPattern) as PatternId}
                onChange={(patternId) => set({ patternId })}
                />
                <p className="text-xs text-muted-foreground">{t("inv.patternHelp")}</p>
                </Section>
              </Group>

              <Group value="background" title={t("inv.groupBackground")} hint={t("inv.groupBackgroundHint")}>
                {/* The same photo Settings edits, not a second one.
                It is one picture doing two jobs — the card's opening image and
                the thumbnail a chat app shows when the link is pasted — so two
                separate uploads could only ever disagree with each other. */}
                <Section title={t("inv.coverPhoto")}>
                <ImageSlot
                eventId={event.id}
                label={t("inv.coverPhoto")}
                value={event.coverPhoto || undefined}
                aspect="aspect-9/16 w-20"
                onChange={(coverPhoto) =>
                updateEvent(currentEventId, { coverPhoto: coverPhoto ?? "" })
                }
                />
                <p className="text-xs text-muted-foreground">{t("inv.coverPhotoHelp")}</p>
                </Section>

                <Section title={t("inv.backdrop")}>
                <BackdropPicker
                value={(design.backdropId ?? template.defaultBackdrop ?? "none") as BackdropId}
                onChange={(backdropId) => set({ backdropId })}
                hasPhoto={Boolean(event.coverPhoto)}
                />
                <p className="text-xs text-muted-foreground">{t("inv.backdropHelp")}</p>
                </Section>

                {/* The same photo Settings edits, not a second one.
                It is one picture doing two jobs — the card's opening image and
                the thumbnail a chat app shows when the link is pasted — so two
                separate uploads could only ever disagree with each other. */}
                <Section title={t("inv.coverPhoto")}>
                <ImageSlot
                eventId={event.id}
                label={t("inv.coverPhoto")}
                value={event.coverPhoto || undefined}
                aspect="aspect-9/16 w-20"
                onChange={(coverPhoto) =>
                updateEvent(currentEventId, { coverPhoto: coverPhoto ?? "" })
                }
                />
                <p className="text-xs text-muted-foreground">{t("inv.coverPhotoHelp")}</p>
                </Section>

                {/* Only shown for the video backdrop: an upload slot for a file the
                chosen backdrop would never play is just a dead control. */}
                {(design.backdropId ?? template.defaultBackdrop) === "video" ? (
                <Section title={t("inv.backgroundVideo")}>
                <ImageSlot
                eventId={event.id}
                label={t("inv.backgroundVideo")}
                value={design.backdropVideo}
                aspect="aspect-9/16 w-20"
                onChange={(backdropVideo) => set({ backdropVideo })}
                />
                <p className="text-xs text-muted-foreground">{t("inv.backgroundVideoHelp")}</p>
                </Section>
                ) : null}

                <div className="flex items-start justify-between gap-3 rounded-[var(--card-radius)] border border-border p-3">
                <div className="min-w-0">
                <Label htmlFor="hide-cover-names" className="font-normal">
                {t("inv.hideCoverNames")}
                </Label>
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                {t("inv.hideCoverNamesHelp")}
                </p>
                </div>
                <Switch
                id="hide-cover-names"
                checked={Boolean(design.hideCoverNames)}
                onCheckedChange={(checked) => set({ hideCoverNames: Boolean(checked) })}
                />
                </div>
              </Group>

              <Group value="music" title={t("inv.music")} hint={t("inv.groupMusicHint")}>
                <Section title={t("inv.music")}>
                <MusicPicker
                eventId={event.id}
                musicId={design.musicId}
                musicUrl={design.musicUrl}
                onChange={(next) => set(next)}
                />
                <p className="text-xs text-muted-foreground">{t("inv.musicHelp")}</p>
                </Section>
              </Group>

              <Group value="motion" title={t("inv.motion")} hint={t("inv.groupMotionHint")}>
                <div className="space-y-4">
                <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                {t("inv.entrance")}
                </p>
                <OptionRow<EntranceId>
                label={t("inv.entrance")}
                value={design.entrance ?? "rise"}
                onChange={(entrance) => set({ entrance })}
                options={(
                  [
                    "none",
                    "fade",
                    "rise",
                    "settle",
                    "zoom",
                    "unfold",
                    "driftLeft",
                    "driftRight",
                    "soften",
                    "tilt",
                    "curtain",
                    "sweep",
                    "flip",
                    "bloom",
                    "glide",
                  ] as EntranceId[]
                ).map((id) => ({ id, label: t(`inv.entrance.${id}`) }))}
                />
                </div>

                <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                {t("inv.coverMotion")}
                </p>
                <OptionRow<CoverMotionId>
                label={t("inv.coverMotion")}
                value={design.coverMotion ?? "none"}
                onChange={(coverMotion) => set({ coverMotion })}
                options={(["none", "kenburns", "float"] as CoverMotionId[]).map((id) => ({
                id,
                label: t(`inv.coverMotion.${id}`),
                }))}
                />
                </div>

                <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">{t("inv.ambient")}</p>
                <OptionRow<AmbientId>
                label={t("inv.ambient")}
                value={design.ambient ?? "none"}
                onChange={(ambient) => set({ ambient })}
                options={AMBIENT_EFFECTS.map((effect) => ({
                id: effect.id,
                label: effect.name[locale],
                }))}
                />
                </div>

                <div className="flex items-start justify-between gap-3 rounded-[var(--card-radius)] border border-border p-3">
                <div className="min-w-0">
                <Label htmlFor="envelope-intro" className="font-normal">
                {t("inv.envelope")}
                </Label>
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                {t("inv.envelopeHelp")}
                </p>
                </div>
                <Switch
                id="envelope-intro"
                checked={Boolean(design.envelopeIntro)}
                onCheckedChange={(checked) => set({ envelopeIntro: Boolean(checked) })}
                />
                </div>

                  {/* Only meaningful when the envelope is on, so it appears
                      with it rather than sitting inert above the toggle. */}
                  {design.envelopeIntro ? (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        {t("inv.introVideo")}
                      </p>
                      <ClipSlot
                        eventId={event.id}
                        value={design.introVideo}
                        onChange={(introVideo) => set({ introVideo })}
                      />
                      <p className="text-xs text-muted-foreground">{t("inv.introVideoHelp")}</p>
                    </div>
                  ) : null}

                <p className="text-xs text-muted-foreground">{t("inv.motionHelp")}</p>
                </div>

              </Group>
            </Accordion>

            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                set({
                  paletteId: template.defaultPalette,
                  fontPairingId: template.defaultFontPairingId,
                  patternId: template.defaultPattern,
                  ornamentLevel: template.defaultOrnamentLevel,
                  photoFrame: template.defaultPhotoFrame,
                  galleryLayout: template.defaultGalleryLayout,
                  entrance: template.defaultEntrance,
                  ambient: template.defaultAmbient,
                  coverMotion: template.defaultCoverMotion,
                  envelopeIntro: template.defaultEnvelopeIntro,
                  backdropId: template.defaultBackdrop ?? "none",
                  introVideo: template.envelopeVideo,
                  primaryColor: undefined,
                  textColor: undefined,
                })
              }
            >
              <RotateCcw />
              {t("inv.resetToTemplate")}
            </Button>
          </TabsContent>

          <TabsContent value="content" className="mt-5 space-y-5 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:contain-paint lg:scroll-py-4 lg:pt-1 lg:pr-3 lg:pb-4 lg:pl-1">
            <BilingualField
              id="greeting"
              section="letter"
              label={t("inv.greeting")}
              value={design.greeting}
              onChange={(greeting) => set({ greeting })}
              placeholder={{
                en: "Together with our families",
                km: "ដោយមានការអនុញ្ញាតពីមាតាបិតា",
              }}
            />
            <BilingualField
              id="message"
              section="letter"
              label={t("inv.message")}
              value={design.message}
              onChange={(message) => set({ message })}
              multiline
              rows={4}
            />
            <BilingualField
              id="title"
              section="cover"
              label="Event title"
              value={event.title}
              onChange={(title) => updateEvent(event.id, { title })}
            />
            <div
              className="space-y-1.5"
              onFocusCapture={() => previewFocus.focus("rsvp")}
            >
              <Label htmlFor="rsvp-deadline">RSVP deadline</Label>
              <DatePicker
                id="rsvp-deadline"
                value={design.rsvpDeadline ?? ""}
                onChange={(value) => set({ rsvpDeadline: value || undefined })}
              />
            </div>
            <div
              className="space-y-2"
              onFocusCapture={() => previewFocus.focus("cover")}
            >
              <p className="text-sm font-medium">{t("inv.namePlate")}</p>
              <NamePlatePicker
                value={design.namePlateId}
                onChange={(namePlateId) => set({ namePlateId })}
              />
              <p className="text-xs text-muted-foreground">{t("inv.namePlateHelp")}</p>
            </div>

            <BilingualField
              id="honour"
              section="letter"
              label={t("inv.honourLabel")}
              value={design.honourLabel ?? { en: "", km: "" }}
              onChange={(honourLabel) => set({ honourLabel })}
            />
            <BilingualField
              id="thankyoutitle"
              section="thanks"
              label={t("inv.thankYouTitle")}
              value={design.thankYouTitle ?? { en: "", km: "" }}
              onChange={(thankYouTitle) => set({ thankYouTitle })}
            />
            <BilingualField
              id="thankyou"
              section="thanks"
              label={t("inv.thankYou")}
              value={design.thankYouNote ?? { en: "", km: "" }}
              onChange={(thankYouNote) => set({ thankYouNote })}
              multiline
              rows={3}
            />
            {design.showGiftInfo ? (
              <>
                <BilingualField
                  id="giftnote"
              section="gift"
                  label={t("public.giftTitle")}
                  value={design.giftNote ?? { en: "", km: "" }}
                  onChange={(giftNote) => set({ giftNote })}
                  multiline
                  rows={3}
                />
                {/* One QR per currency: a Cambodian bank app cannot pay riel
                    from a dollar code, so a single image would strand half the
                    guests. Either may be left empty. */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      {t("inv.giftQrUsd")}
                    </p>
                    <ImageSlot
                      eventId={event.id}
                      label={t("inv.giftQrUsd")}
                      value={design.giftQrUsd}
                      onChange={(giftQrUsd) => set({ giftQrUsd })}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      {t("inv.giftQrKhr")}
                    </p>
                    <ImageSlot
                      eventId={event.id}
                      label={t("inv.giftQrKhr")}
                      value={design.giftQrKhr}
                      onChange={(giftQrKhr) => set({ giftQrKhr })}
                    />
                  </div>
                </div>
              </>
            ) : null}
          </TabsContent>

          <TabsContent value="photos" className="mt-5 space-y-6 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:contain-paint lg:scroll-py-4 lg:pt-1 lg:pr-3 lg:pb-4 lg:pl-1">
            <Section title={t("inv.couple")}>
              <CoupleMotifPicker
                value={design.coupleMotifId}
                onChange={(coupleMotifId) => set({ coupleMotifId })}
              />
            </Section>

            <Section title={t("inv.divider")}>
              <MotifSlotPicker
                category="dividers"
                value={design.dividerMotifId}
                onChange={(dividerMotifId) => set({ dividerMotifId })}
                drawnLabel={t("inv.coupleDrawn")}
              />
            </Section>

            <Section title={t("inv.crest")}>
              <MotifSlotPicker
                category="crests"
                value={design.crestMotifId}
                onChange={(crestMotifId) => set({ crestMotifId })}
                drawnLabel={t("common.none")}
              />
            </Section>

            <Section title={t("inv.corners")}>
              <MotifSlotPicker
                category="frames"
                value={design.cornerMotifId}
                onChange={(cornerMotifId) => set({ cornerMotifId })}
                drawnLabel={t("inv.coupleDrawn")}
              />
            </Section>

            <Section previewSection="venue" title={t("inv.venueMap")}>
              <ImageSlot
                eventId={event.id}
                label={t("inv.venueMap")}
                value={design.venueMapImage}
                aspect="aspect-video w-28"
                onChange={(venueMapImage) => set({ venueMapImage })}
              />
              <p className="text-xs text-muted-foreground">{t("inv.venueMapHelp")}</p>
            </Section>

            <Section title={t("inv.photoFrame")}>
              <PhotoFramePicker
                value={(design.photoFrame ?? "rounded") as PhotoFrameId}
                onChange={(photoFrame) => set({ photoFrame })}
              />
            </Section>

            <Section
              previewSection="gallery"
              title={t("inv.gallery")}
              action={
                <span className="text-xs text-muted-foreground">
                  {design.gallery.length} {t("inv.photoCount")}
                </span>
              }
            >
              <div className="space-y-3">
                <OptionRow<GalleryLayoutId>
                  label={t("inv.galleryLayout")}
                  value={design.galleryLayout ?? "grid"}
                  onChange={(galleryLayout) => set({ galleryLayout })}
                  options={GALLERY_LAYOUTS.map((l) => ({ id: l.id, label: l.name[locale] }))}
                />

                <PhotoUpload
                  eventId={currentEventId}
                  multiple
                  label="Drop photos here, or choose them."
                  onUploaded={(urls) => set({ gallery: [...design.gallery, ...urls] })}
                />

                {design.gallery.length === 0 ? (
                  <div className="rounded-[var(--btn-radius)] border border-dashed border-border px-4 py-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      No photos yet. Add a few and they appear as a gallery on the invitation.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => set({ gallery: SAMPLE_PHOTOS })}
                    >
                      <Sparkles />
                      {t("inv.addSamplePhotos")}
                    </Button>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {design.gallery.map((src, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Photo
                          src={src}
                          alt=""
                          seed={i + 5}
                          sizes="44px"
                          className="size-11 shrink-0 rounded-[var(--btn-radius)]"
                        />
                        <Input
                          value={src}
                          placeholder="https://…"
                          aria-label={`Photo ${i + 1} URL`}
                          onChange={(e) => {
                            const gallery = [...design.gallery]
                            gallery[i] = e.target.value
                            set({ gallery })
                          }}
                        />
                        <div className="flex shrink-0">
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            aria-label={t("inv.movePhotoUp")}
                            disabled={i === 0}
                            onClick={() => set({ gallery: swap(design.gallery, i, i - 1) })}
                          >
                            <ArrowUp />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            aria-label={t("inv.movePhotoDown")}
                            disabled={i === design.gallery.length - 1}
                            onClick={() => set({ gallery: swap(design.gallery, i, i + 1) })}
                          >
                            <ArrowDown />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            aria-label={`Remove photo ${i + 1}`}
                            onClick={() =>
                              set({ gallery: design.gallery.filter((_, j) => j !== i) })
                            }
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => set({ gallery: [...design.gallery, ""] })}
                >
                  <Plus />
                  {t("inv.addPhoto")}
                </Button>
              </div>
            </Section>
          </TabsContent>

          <TabsContent value="schedule" className="mt-5 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:contain-paint lg:scroll-py-4 lg:pt-1 lg:pr-3 lg:pb-4 lg:pl-1">
            <ScheduleEditor
              items={event.schedule}
              onChange={(schedule) => updateEvent(event.id, { schedule })}
            />
          </TabsContent>

          <TabsContent value="sections" className="mt-5 space-y-1 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:contain-paint lg:scroll-py-4 lg:pt-1 lg:pr-3 lg:pb-4 lg:pl-1">
            {(
              [
                ["showSchedule", "inv.showSchedule"],
                ["showMap", "inv.showMap"],
                ["showGallery", "inv.showGallery"],
                ["showGiftInfo", "inv.showGiftInfo"],
                ["showRsvp", "inv.showRsvp"],
                ["showWishes", "inv.showWishes"],
              ] as const
            ).map(([key, labelKey]) => (
              <div
                key={key}
                className="flex items-center justify-between gap-3 rounded-[var(--btn-radius)] px-3 py-2.5 transition-colors hover:bg-muted/50"
              >
                <Label htmlFor={key} className="font-normal">
                  {t(labelKey)}
                </Label>
                <Switch
                  id={key}
                  checked={Boolean(design[key])}
                  onCheckedChange={(checked) => set({ [key]: Boolean(checked) })}
                />
              </div>
            ))}
          </TabsContent>
        </Tabs>

        {/* Live preview — sticky on desktop, behind a button on smaller screens. */}
        <div className="hidden min-h-0 lg:flex lg:flex-col">
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <p className="eyebrow text-muted-foreground">{t("inv.livePreview")}</p>
                {design.envelopeIntro ? (
                  <ButtonLink href={`/i/${event.slug}`} target="_blank" size="xs" variant="ghost">
                    <Play />
                    {t("inv.playIntro")}
                  </ButtonLink>
                ) : null}
              </div>
              <div className="flex items-center gap-1.5">
              <Button
                size="xs"
                variant={playing ? "secondary" : "outline"}
                onClick={playMotion}
                title={t("inv.playMotionHelp")}
              >
                <Play />
                {t("inv.playMotion")}
              </Button>
              <PreviewLocaleToggle value={previewLocale} onChange={setPreviewLocale} />
              <div
                className="inline-flex items-center rounded-full bg-muted p-0.5"
                role="group"
                aria-label={t("inv.livePreview")}
              >
                {(
                  [
                    ["mobile", Smartphone, t("inv.mobile")],
                    ["desktop", Monitor, t("inv.desktop")],
                  ] as const
                ).map(([value, Icon, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDevice(value)}
                    aria-pressed={device === value}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                      device === value
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="size-3.5" aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </div>
              </div>
            </div>

            <DeviceFrame device={device} scrollRef={desktopPreviewRef}>
              <LocaleProvider locale={previewLocale}>
                <InvitationRenderer
                  key={playKey}
                  event={event}
                  preview
                  motionEnabled={playing}
                  replayKey={playKey}
                  /*
                   * A stand-in guest, and the reply bar.
                   *
                   * Without them the preview was quietly a different page from
                   * the one guests open: the honour block fell back to its
                   * generic line, so the couple never saw how a name sits in
                   * the frame they were choosing, and the bar that covers the
                   * last inch of every real card was missing from the only
                   * place they could have noticed it.
                   */
                  guest={PREVIEW_GUEST}
                  guestActions
                />
              </LocaleProvider>
            </DeviceFrame>
          </div>
        </div>
      </div>

      <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
        <SheetContent side="bottom" className="h-[92svh] p-0">
          <SheetTitle className="sr-only">{t("inv.preview")}</SheetTitle>
          <div className="flex h-11 items-center justify-between border-b border-border px-3">
            <p className="text-sm font-medium">{t("inv.preview")}</p>
            <div className="flex items-center gap-1.5">
            <PreviewLocaleToggle value={previewLocale} onChange={setPreviewLocale} />
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => setPreviewOpen(false)}
              aria-label={t("action.close")}
            >
              <X />
            </Button>
            </div>
          </div>
          <div
            ref={sheetPreviewRef}
            className="h-[calc(92svh-2.75rem)] overflow-y-auto overscroll-contain"
            style={
              {
                "--inv-preview-height": "calc(92svh - 2.75rem)",
              } as React.CSSProperties
            }
          >
            <LocaleProvider locale={previewLocale}>
              <InvitationRenderer
                key={playKey}
                event={event}
                preview
                motionEnabled={playing}
                replayKey={playKey}
              />
            </LocaleProvider>
          </div>
        </SheetContent>
      </Sheet>
    </div>
    </PreviewFocusProvider>
  )
}

function DeviceFrame({
  device,
  children,
  scrollRef,
}: {
  device: Device
  children: React.ReactNode
  /** The element the builder scrolls when a field takes focus. */
  scrollRef?: React.Ref<HTMLDivElement>
}) {
  /*
   * The pane's height, published as a real length.
   *
   * Templates size their full-height cover from `--inv-preview-height`, and the
   * envelope overlay centres itself in it. A percentage cannot serve either:
   * inside a scrolling card it resolves against the card's own height — four
   * thousand pixels — so the cover became enormous and the envelope centred
   * itself a long way below anything visible. The pane is flex-sized, so the
   * only honest source for the number is the box itself.
   */
  const boxRef = React.useRef<HTMLDivElement>(null)
  const [boxHeight, setBoxHeight] = React.useState<number>()

  React.useEffect(() => {
    const node = boxRef.current
    if (!node) return
    const observer = new ResizeObserver(([entry]) =>
      setBoxHeight(Math.round(entry.contentRect.height))
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return (
    <div
      className={cn(
        "mx-auto flex min-h-0 w-full flex-col overflow-hidden border border-border bg-background shadow-(--shadow-card) transition-[max-width] duration-300",
        device === "mobile"
          ? "max-w-[23rem] rounded-[2rem] p-2.5"
          : "max-w-full rounded-[var(--card-radius)] p-0"
      )}

    >
      {/*
       * Sized to whatever room the pane has rather than a fixed height. On a
       * laptop the old 38rem box left the card clipped mid-photo with dead
       * space under it; on a tall monitor it wasted the rest of the screen.
       */}
      <div
        ref={mergeRefs(scrollRef, boxRef)}
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-contain bg-background",
          device === "mobile" ? "rounded-[1.5rem]" : ""
        )}
        style={
          {
            "--inv-preview-height": boxHeight ? `${boxHeight}px` : "38rem",
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </div>
  )
}

function ScheduleEditor({
  items,
  onChange,
}: {
  items: ScheduleItem[]
  onChange: (items: ScheduleItem[]) => void
}) {
  const { t } = useLocale()
  const focusProps = useSectionFocus("schedule")

  function update(id: string, patch: Partial<ScheduleItem>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  return (
    <div className="space-y-3" {...focusProps}>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {t("schedule.audienceHelp")}
      </p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-2 rounded-[var(--card-radius)] border border-border p-2.5"
          >
            <GripVertical
              className="mt-2.5 size-4 shrink-0 text-muted-foreground/40"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex gap-2">
                <TimePicker
                  value={item.time}
                  aria-label="Time"
                  className="w-28 shrink-0"
                  onChange={(value) => update(item.id, { time: value })}
                />
                <Input
                  value={item.title.en}
                  aria-label="Title in English"
                  placeholder="Reception opens"
                  onChange={(e) =>
                    update(item.id, { title: { ...item.title, en: e.target.value } })
                  }
                />
              </div>
              <Input
                lang="km"
                className="lang-km"
                value={item.title.km}
                aria-label="Title in Khmer"
                placeholder="បើកកម្មវិធីជប់លៀង"
                onChange={(e) => update(item.id, { title: { ...item.title, km: e.target.value } })}
              />

              {/* Two states only, so a segmented control beats a dropdown. */}
              <div
                role="group"
                aria-label={t("schedule.audience")}
                className="inline-flex rounded-[var(--btn-radius)] border border-border p-0.5"
              >
                {(["all", "family"] as const).map((value) => {
                  const selected = (item.audience ?? "all") === value
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => update(item.id, { audience: value })}
                      aria-pressed={selected}
                      className={cn(
                        "rounded-[calc(var(--btn-radius)-2px)] px-2.5 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                        selected
                          ? "bg-primary/10 text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {t(value === "all" ? "schedule.all" : "schedule.family")}
                    </button>
                  )
                })}
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              aria-label={`${t("action.delete")}: ${item.title.en}`}
              onClick={() => onChange(items.filter((i) => i.id !== item.id))}
            >
              <Trash2 />
            </Button>
          </li>
        ))}
      </ul>

      <Button
        variant="outline"
        className="w-full"
        onClick={() =>
          onChange([
            ...items,
            {
              id: `sc_${Date.now()}`,
              time: "12:00",
              title: { en: "", km: "" } as LocalizedText,
            },
          ])
        }
      >
        <Plus />
        {t("action.add")}
      </Button>
    </div>
  )
}

/**
 * A collapsible group of related controls.
 *
 * Grouping is what makes a long settings column usable: the couple opens the
 * one thing they came to change and everything else stays a single line, rather
 * than every control competing for the same twenty-three rems.
 */
/**
 * "Saved as draft" / "Saving…" / the failure.
 *
 * Its own component because both headers show it and because saving and
 * publishing are different things that were once reported by one line — "All
 * changes saved" beside a live link reads as "your guests can see this", which
 * is false whenever there are edits waiting to go out.
 */
function SaveState({ state, className }: { state: EventSaveState; className?: string }) {
  const { t } = useLocale()
  const previous = React.useRef(state)
  const [celebrating, setCelebrating] = React.useState(false)

  React.useEffect(() => {
    let startTimer: number | undefined
    let endTimer: number | undefined
    if (previous.current === "saving" && state === "saved") {
      startTimer = window.setTimeout(() => setCelebrating(true), 0)
      endTimer = window.setTimeout(() => setCelebrating(false), 1400)
    } else if (state === "saving" || state === "error") {
      startTimer = window.setTimeout(() => setCelebrating(false), 0)
    }
    previous.current = state
    return () => {
      if (startTimer) window.clearTimeout(startTimer)
      if (endTimer) window.clearTimeout(endTimer)
    }
  }, [state])

  return (
    <p
      aria-live="polite"
      className={cn(
        "flex min-h-8 items-center gap-1.5 text-xs",
        state === "error" ? "text-destructive" : "text-muted-foreground",
        className
      )}
    >
      <span className="grid h-8 w-10 shrink-0 place-items-center" aria-hidden="true">
        {state === "saving" ? (
          <BrandSpinner label="" motion="thinking" size={32} />
        ) : celebrating ? (
          <BrandSpinner label="" motion="happy" size={32} />
        ) : state === "error" ? null : (
          <BrandSpinner label="" motion="idle" size={32} />
        )}
      </span>
      {state === "saving"
        ? t("settings.saving")
        : state === "error"
          ? t("settings.saveFailed")
          : t("publish.savedAsDraft")}
    </p>
  )
}

function Group({
  value,
  title,
  hint,
  children,
}: {
  value: string
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <AccordionItem
      value={value}
      className="rounded-[var(--card-radius)] border border-border px-3.5"
    >
      <AccordionTrigger className="py-3">
        <span className="min-w-0">
          <span className="block text-sm font-medium">{title}</span>
          {hint ? (
            <span className="mt-0.5 block truncate text-xs font-normal text-muted-foreground">
              {hint}
            </span>
          ) : null}
        </span>
      </AccordionTrigger>
      <AccordionContent className="space-y-5 pb-4">{children}</AccordionContent>
    </AccordionItem>
  )
}

function Section({
  title,
  action,
  children,
  previewSection,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
  /** Scrolls the preview to this part of the card when anything here is focused. */
  previewSection?: InvSectionId
}) {
  const focusProps = useSectionFocus(previewSection)
  return (
    <section className="space-y-3" {...focusProps}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}


/**
 * One uploaded image, shown as the picture it is.
 *
 * A filename tells the couple nothing about whether the QR scans or the map is
 * the right one, so the slot always shows the artwork and offers to replace it.
 */
function ImageSlot({
  eventId,
  label,
  value,
  onChange,
  aspect = "size-16",
}: {
  eventId: string
  label: string
  value?: string
  onChange: (url: string | undefined) => void
  /** Sizing for the thumbnail — a QR is square, a map is not. */
  aspect?: string
}) {
  const { t } = useLocale()

  return (
    <div className="space-y-2">
      {value ? (
        <div className="flex items-center gap-3 rounded-[var(--btn-radius)] border border-border p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt={label}
            className={cn("rounded-sm border border-border object-contain", aspect)}
          />
          <Button variant="ghost" size="sm" onClick={() => onChange(undefined)}>
            <Trash2 />
            {t("action.delete")}
          </Button>
        </div>
      ) : (
        <PhotoUpload
          eventId={eventId}
          label={label}
          onUploaded={(urls) => onChange(urls[0])}
        />
      )}
    </div>
  )
}

/**
 * Which language the preview is rendered in.
 *
 * Scoped to the preview on purpose. Switching the whole dashboard to Khmer to
 * check a Khmer line means the couple loses the English editor labels they were
 * working from, and the point here is to compare the two — Khmer sets far
 * taller than Latin at the same size, so a heading that fits in one can wrap in
 * the other, and that is only visible side by side.
 */
function PreviewLocaleToggle({
  value,
  onChange,
}: {
  value: Locale
  onChange: (locale: Locale) => void
}) {
  const { t } = useLocale()

  return (
    <div
      className="inline-flex items-center rounded-full bg-muted p-0.5"
      role="group"
      aria-label={t("inv.previewLanguage")}
    >
      {(
        [
          ["km", "ខ្មែរ"],
          ["en", "EN"],
        ] as const
      ).map(([id, label]) => (
        <button
          key={id}
          type="button"
          lang={id}
          onClick={() => onChange(id)}
          aria-pressed={value === id}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            value === id
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

/** Lets one node satisfy both a forwarded ref and a local one. */
function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node)
      else if (ref) (ref as React.RefObject<T | null>).current = node
    }
  }
}

/**
 * The envelope's opening clip.
 *
 * mp4 only, and the reason is visible in the reveal: the card appears when the
 * clip fires its `ended` event, which a GIF never does. Shown as a playable
 * preview rather than a filename — this is the first thing every guest sees,
 * and a filename tells the couple nothing about whether it is the right take.
 */
function ClipSlot({
  eventId,
  value,
  onChange,
}: {
  eventId: string
  value?: string
  onChange: (url: string | undefined) => void
}) {
  const { t, locale } = useLocale()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [progress, setProgress] = React.useState<number | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  async function upload(file: File | undefined) {
    if (!file) return
    setError(null)
    setProgress(0)
    try {
      const { url } = await uploadClip(file, {
        eventId,
        onProgress: (p) => setProgress(p.ratio === null ? 0 : Math.round(p.ratio * 100)),
      })
      onChange(url)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("inv.introVideoFailed"))
    } finally {
      setProgress(null)
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,.mp4"
        className="sr-only"
        onChange={(e) => {
          void upload(e.target.files?.[0])
          e.target.value = ""
        }}
      />

      {value ? (
        <div className="flex items-center gap-3 rounded-[var(--btn-radius)] border border-border p-2">
          <video
            src={value}
            muted
            playsInline
            controls
            className="h-20 w-14 rounded-sm border border-border object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">
              {findIntroClip(value)?.name[locale] ?? t("inv.introVideoOwn")}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onChange(undefined)}>
            <Trash2 />
            {t("action.delete")}
          </Button>
        </div>
      ) : null}

      {/* Samples, so a couple can have the envelope without shooting one.
          Each is a real clip rather than a name: it is eight seconds of film
          and the only way to judge it is to watch it. */}
      {INTRO_CLIPS.length > 0 ? (
        <ul className="grid grid-cols-3 gap-2">
          {INTRO_CLIPS.map((clip) => {
            const url = introClipUrl(clip)
            const selected = value === url
            return (
              <li key={clip.id}>
                <button
                  type="button"
                  onClick={() => onChange(url)}
                  aria-pressed={selected}
                  title={clip.hint?.[locale]}
                  className={cn(
                    "w-full overflow-hidden rounded-[var(--btn-radius)] border text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    selected
                      ? "border-primary ring-1 ring-primary"
                      : "border-border hover:border-foreground/25"
                  )}
                >
                  <video
                    src={url}
                    muted
                    playsInline
                    preload="metadata"
                    className="aspect-[3/4] w-full object-cover"
                    onMouseEnter={(e) => void e.currentTarget.play().catch(() => {})}
                    onMouseLeave={(e) => {
                      e.currentTarget.pause()
                      e.currentTarget.currentTime = 0
                    }}
                  />
                  <span className="block truncate px-2 py-1 text-[0.6875rem] text-muted-foreground">
                    {clip.name[locale]}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={progress !== null}
          onClick={() => inputRef.current?.click()}
        >
          {progress !== null ? <BrandSpinner /> : <Upload />}
          {progress !== null ? `${t("inv.musicUploading")} ${progress}%` : t("inv.introVideoUpload")}
        </Button>
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}

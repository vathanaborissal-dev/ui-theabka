"use client"

import * as React from "react"
import {
  Eye,
  GripVertical,
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Monitor,
  Play,
  RotateCcw,
  Plus,
  Smartphone,
  Sparkles,
  Trash2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui/button-link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Photo } from "@/components/shared/photo"
import { useData, useEventData } from "@/components/providers/data-provider"
import { useLocale } from "@/components/providers/locale-provider"
import { InvitationRenderer } from "../invitation-renderer"
import { BilingualField } from "./bilingual-field"
import {
  CoupleMotifPicker,
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
import { getTemplate } from "@/lib/invitation/templates"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type {
  AmbientId,
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

export function InvitationBuilder({ eventId }: { eventId: string }) {
  const { event } = useEventData(eventId)
  const { updateDesign, updateEvent } = useData()
  const { t, locale } = useLocale()

  const [device, setDevice] = React.useState<Device>("mobile")
  const [previewOpen, setPreviewOpen] = React.useState(false)

  if (!event) return null

  const design = event.design
  const template = getTemplate(design.templateId)
  const set = (patch: Partial<InvitationDesign>) => updateDesign(event.id, patch)

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="display text-2xl sm:text-[1.75rem]">{t("inv.title")}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">{t("inv.subtitle")}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" className="lg:hidden" onClick={() => setPreviewOpen(true)}>
            <Eye />
            {t("inv.preview")}
          </Button>
          <ButtonLink href={`/i/${event.slug}`} target="_blank" variant="outline">
            {t("inv.openPage")}
          </ButtonLink>
          <Button
            onClick={() => {
              updateEvent(event.id, { status: "published" })
              toast.success("Invitation published — your link is live")
            }}
            disabled={event.status === "published"}
          >
            {event.status === "published" ? t("status.published") : t("action.publish")}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-8">
        <Tabs defaultValue="template" className="min-w-0">
          <TabsList variant="line" className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="template">{t("inv.design")}</TabsTrigger>
            <TabsTrigger value="content">{t("inv.content")}</TabsTrigger>
            <TabsTrigger value="photos">{t("inv.photos")}</TabsTrigger>
            <TabsTrigger value="schedule">{t("inv.schedule")}</TabsTrigger>
            <TabsTrigger value="sections">{t("inv.sections")}</TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="mt-5 space-y-6">
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
                  })
                }}
              />
            </Section>
            <Section title={t("inv.palette")}>
              <PalettePicker
                value={design.paletteId}
                onChange={(paletteId) => set({ paletteId })}
              />
            </Section>

            <Section title={t("inv.typeface")}>
              <FontPairingPicker
                value={design.fontPairingId ?? template.defaultFontPairingId}
                onChange={(fontPairingId) => set({ fontPairingId })}
              />
            </Section>

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

            <div className="border-t border-border pt-6">
              <Section title={t("inv.motion")}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      {t("inv.entrance")}
                    </p>
                    <OptionRow<EntranceId>
                      label={t("inv.entrance")}
                      value={design.entrance ?? "rise"}
                      onChange={(entrance) => set({ entrance })}
                      options={(["none", "fade", "rise", "zoom", "unfold"] as EntranceId[]).map(
                        (id) => ({ id, label: t(`inv.entrance.${id}`) })
                      )}
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

                  <p className="text-xs text-muted-foreground">{t("inv.motionHelp")}</p>
                </div>
              </Section>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                set({
                  paletteId: template.defaultPalette,
                  fontPairingId: template.defaultFontPairingId,
                  patternId: template.defaultPattern,
                  ornamentLevel: template.defaultOrnamentLevel,
                })
              }
            >
              <RotateCcw />
              {t("inv.resetToTemplate")}
            </Button>
          </TabsContent>

          <TabsContent value="content" className="mt-5 space-y-5">
            <BilingualField
              id="greeting"
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
              label={t("inv.message")}
              value={design.message}
              onChange={(message) => set({ message })}
              multiline
              rows={4}
            />
            <BilingualField
              id="title"
              label="Event title"
              value={event.title}
              onChange={(title) => updateEvent(event.id, { title })}
            />
            <div className="space-y-1.5">
              <Label htmlFor="rsvp-deadline">RSVP deadline</Label>
              <Input
                id="rsvp-deadline"
                type="date"
                value={design.rsvpDeadline ?? ""}
                onChange={(e) => set({ rsvpDeadline: e.target.value || undefined })}
              />
            </div>
            {design.showGiftInfo ? (
              <BilingualField
                id="giftnote"
                label={t("public.giftTitle")}
                value={design.giftNote ?? { en: "", km: "" }}
                onChange={(giftNote) => set({ giftNote })}
                multiline
                rows={3}
              />
            ) : null}
          </TabsContent>

          <TabsContent value="photos" className="mt-5 space-y-6">
            <Section title={t("inv.coverPhoto")}>
              <PhotoInput
                value={design.coverPhoto ?? ""}
                onChange={(coverPhoto) => set({ coverPhoto: coverPhoto || undefined })}
              />
            </Section>

            <Section title={t("inv.couple")}>
              <CoupleMotifPicker
                value={design.coupleMotifId}
                onChange={(coupleMotifId) => set({ coupleMotifId })}
              />
            </Section>

            <Section title={t("inv.photoFrame")}>
              <PhotoFramePicker
                value={(design.photoFrame ?? "rounded") as PhotoFrameId}
                onChange={(photoFrame) => set({ photoFrame })}
              />
            </Section>

            <Section
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

          <TabsContent value="schedule" className="mt-5">
            <ScheduleEditor
              items={event.schedule}
              onChange={(schedule) => updateEvent(event.id, { schedule })}
            />
          </TabsContent>

          <TabsContent value="sections" className="mt-5 space-y-1">
            {(
              [
                ["showSchedule", "inv.showSchedule"],
                ["showMap", "inv.showMap"],
                ["showGallery", "inv.showGallery"],
                ["showGiftInfo", "inv.showGiftInfo"],
                ["showRsvp", "inv.showRsvp"],
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
                  checked={design[key]}
                  onCheckedChange={(checked) => set({ [key]: Boolean(checked) })}
                />
              </div>
            ))}
          </TabsContent>
        </Tabs>

        {/* Live preview — sticky on desktop, behind a button on smaller screens. */}
        <div className="hidden lg:block">
          <div className="sticky top-6 space-y-3">
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

            <DeviceFrame device={device}>
              <InvitationRenderer event={event} preview />
            </DeviceFrame>
          </div>
        </div>
      </div>

      <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
        <SheetContent side="bottom" className="h-[92svh] p-0">
          <SheetTitle className="sr-only">{t("inv.preview")}</SheetTitle>
          <div className="flex h-11 items-center justify-between border-b border-border px-3">
            <p className="text-sm font-medium">{t("inv.preview")}</p>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => setPreviewOpen(false)}
              aria-label={t("action.close")}
            >
              <X />
            </Button>
          </div>
          <div className="h-[calc(92svh-2.75rem)] overflow-y-auto overscroll-contain">
            <InvitationRenderer event={event} preview />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function DeviceFrame({ device, children }: { device: Device; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "mx-auto overflow-hidden border border-border bg-background shadow-(--shadow-card) transition-[max-width] duration-300",
        device === "mobile"
          ? "max-w-[22rem] rounded-[2rem] p-2.5"
          : "max-w-full rounded-[var(--card-radius)] p-0"
      )}
    >
      <div
        className={cn(
          "overflow-y-auto overscroll-contain bg-background",
          device === "mobile" ? "h-[38rem] rounded-[1.5rem]" : "h-[40rem]"
        )}
      >
        {children}
      </div>
    </div>
  )
}

function PhotoInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <Photo src={value} alt="" seed={1} className="size-16 shrink-0 rounded-[var(--btn-radius)]" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…"
          aria-label="Cover photo URL"
        />
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ImagePlus className="size-3.5" aria-hidden="true" />
          Paste an image link. Uploading arrives with the full release.
        </p>
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

  function update(id: string, patch: Partial<ScheduleItem>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  return (
    <div className="space-y-3">
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
                <Input
                  type="time"
                  value={item.time}
                  aria-label="Time"
                  className="w-28 shrink-0"
                  onChange={(e) => update(item.id, { time: e.target.value })}
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
            </div>
            <Button
              size="icon"
              variant="ghost"
              aria-label={`${t("action.delete")} — ${item.title.en}`}
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

function Section({
  title,
  action,
  children,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

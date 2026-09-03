"use client"

import * as React from "react"
import {Camera,
  Copy,
  Download,
  Eye,
  EyeOff,
  ImageDown,
  ImageOff,
  Info,
  Printer,
  TriangleAlert,
  Trash2} from "lucide-react"
import { BrandSpinner } from "@/components/brand/brand-spinner"
import { toast } from "sonner"

import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { useEventData } from "@/components/providers/data-provider"
import { useLocale } from "@/components/providers/locale-provider"
import { QrCode, downloadQrSvg } from "@/components/share/qr-code"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui/button-link"
import { Card } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { TimePicker } from "@/components/ui/time-picker"
import {
  defaultRevealAt,
  deletePhoto,
  getCameraOverview,
  listOwnerPhotos,
  saveCameraSettings,
  setPhotoHidden,
  type CameraPhoto,
  type CameraSettings,
} from "@/lib/camera"
import {
  CAMERA_FILTERS,
  DEFAULT_CAMERA_FILTER,
  FILTER_SAMPLE_PHOTO,
  cameraFilterTransform,
  getCameraFilter,
} from "@/lib/camera-filters"
import { canTransform, cloudinaryUrl, imageSrcSet } from "@/lib/uploads"
import { exportQrPoster } from "@/lib/qr-poster"
import { invitationTheme } from "@/lib/invitation/theme"
import { PhotoLightbox } from "./photo-lightbox"
import { CameraLoading } from "./camera-loading"
import { MascotMotion } from "@/components/brand/mascot"
import { cn } from "@/lib/utils"

/**
 * The couple's camera screen.
 *
 * Three jobs, in the order they matter: switch it on and say when the photos
 * open, print the table card, and look through what has come in. The third is
 * the one that needs care — these are uploads from anyone who can read a QR
 * code, and the reveal publishes them to the entire guest list at once, so
 * hiding one has to be possible before that happens rather than after.
 */
export function CameraView({ eventId }: { eventId: string }) {
  const { event } = useEventData(eventId)
  const { t, locale, L } = useLocale()
  // Photos whose file will not load. It should not happen — the guest confirms
  // only after the upload succeeds — but a row can outlive its file, and a grid
  // of broken-image glyphs tells the couple nothing about what to do next.
  const [broken, setBroken] = React.useState<Set<string>>(new Set())
  /** Which photo is open full screen, or null. */
  const [viewing, setViewing] = React.useState<number | null>(null)
  // A filter sample that will not load leaves plain swatches rather than five
  // broken frames: the names still say what each look is.
  const [sampleBroken, setSampleBroken] = React.useState(false)
  /*
   * A look picked but not yet applied. Null means "whatever is saved".
   *
   * Choosing used to redraw the whole roll, which meant every look cost sixty
   * fresh renders from the image host before it could be judged — slow enough
   * that trying two or three of them was a chore. Now one photo carries the
   * preview and applying is a separate, deliberate press.
   */
  const [chosen, setChosen] = React.useState<string | null>(null)
  /**
   * The preview, opened full screen so a look can be judged at size — and
   * paged, so it can be judged across more than the one frame on show.
   */
  const [previewAt, setPreviewAt] = React.useState<number | null>(null)

  const [settings, setSettings] = React.useState<CameraSettings | null>(null)
  const [slug, setSlug] = React.useState("")
  const [stats, setStats] = React.useState({ photoCount: 0, hiddenCount: 0, rollCount: 0 })
  const [photos, setPhotos] = React.useState<CameraPhoto[]>([])
  /*
   * The grid is paged.
   *
   * It used to load the first sixty and stop, which is fine for a test event
   * and wrong for a wedding: a camera the couple cannot see all of is a
   * camera they cannot moderate all of, and the ones they most need to find
   * are as likely to be at the end as the start.
   */
  const [morePhotos, setMorePhotos] = React.useState(false)
  const [loadingMore, setLoadingMore] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  /*
   * The poster export is not instant — webfonts have to settle, the QR is
   * rasterised and a 2480px canvas is composed — and it used to give no sign
   * at all that anything was happening.
   */
  const [buildingPoster, setBuildingPoster] = React.useState(false)
  /*
   * The clock, read once and then ticked.
   *
   * Only used to notice that the reveal time has gone by. `Date.now()` cannot
   * be called during render, and a minute's resolution is plenty for a date
   * the couple set days ago.
   */
  const [now, setNow] = React.useState(() => Date.now())
  React.useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000)
    return () => window.clearInterval(id)
  }, [])

  /*
   * Settings first, photos only if there are any.
   *
   * Both in one effect rather than two, so the screen paints once with
   * everything rather than shifting as the grid arrives underneath the form.
   */
  React.useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const overview = await getCameraOverview(eventId)
        if (cancelled) return
        setSettings(overview.camera)
        setSlug(overview.slug)
        setStats({
          photoCount: overview.photoCount,
          hiddenCount: overview.hiddenCount,
          rollCount: overview.rollCount,
        })
        if (overview.photoCount > 0) {
          const page = await listOwnerPhotos(eventId, 0, PAGE_SIZE)
          if (!cancelled) {
            setPhotos(page.items)
            setMorePhotos(page.meta.hasMore)
          }
        }
      } catch {
        if (!cancelled) toast.error(t("camera.uploadFailed"))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [eventId, t])

  /*
   * The rest of the roll, fetched when the bottom of it comes into view.
   *
   * A wedding camera runs to hundreds of photos and the couple scrolls looking
   * for the one to hide; making them press for every sixty is a worse version
   * of the same wait. The margin starts the fetch before the end is reached,
   * so the grid usually grows before it can run out.
   */
  const endOfRoll = React.useRef<HTMLDivElement | null>(null)
  React.useEffect(() => {
    const sentinel = endOfRoll.current
    if (!sentinel || !morePhotos || loadingMore) return
    if (typeof IntersectionObserver === "undefined") return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void loadMore()
      },
      { rootMargin: "600px" }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
    // `loadMore` is stable enough for this: it is re-created each render, and
    // the effect only needs the latest one when the page actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [morePhotos, loadingMore, photos.length])

  async function loadMore() {
    setLoadingMore(true)
    try {
      // By page number, and de-duplicated by id: a photo deleted between two
      // pages shifts the rest up, which would otherwise repeat a neighbour.
      const next = await listOwnerPhotos(eventId, Math.floor(photos.length / PAGE_SIZE), PAGE_SIZE)
      setPhotos((current) => {
        const seen = new Set(current.map((photo) => photo.id))
        return [...current, ...next.items.filter((photo) => !seen.has(photo.id))]
      })
      setMorePhotos(next.meta.hasMore)
    } catch {
      toast.error(t("camera.uploadFailed"))
    } finally {
      setLoadingMore(false)
    }
  }

  async function save(next: CameraSettings) {
    setSettings(next)
    setSaving(true)
    try {
      await saveCameraSettings(eventId, next)
    } catch {
      toast.error(t("camera.uploadFailed"))
    } finally {
      setSaving(false)
    }
  }

  if (loading || !settings) {
    return <CameraLoading />
  }

  const cameraUrl =
    typeof window === "undefined" ? `/c/${slug}` : `${window.location.origin}/c/${slug}`
  // The couple's own palette and type, so the poster reads as the same object
  // as the invitation itself rather than a generic export tacked on beside it.
  const theme = event ? invitationTheme(event.design, locale) : undefined

  const reveal = settings.revealAt ? new Date(settings.revealAt) : null
  // The roll wears what has actually been applied.
  const effect = cameraFilterTransform(settings.filter)
  // The preview wears what is being considered.
  const shownFilter = getCameraFilter(chosen ?? settings.filter)
  const shownTransform = shownFilter.transform
  const unapplied = chosen !== null && chosen !== (settings.filter ?? DEFAULT_CAMERA_FILTER)


  /*
   * What the look is previewed on: their cover photo, or a stand-in.
   *
   * And how it is rendered, which is not a detail. The filters are delivery
   * transformations, so they only apply to images on the image host — a cover
   * photo hosted elsewhere, or the bundled sample, would otherwise give five
   * identical thumbnails and say the filters do nothing. Those fall back to a
   * CSS approximation of the same look.
   */
  /*
   * What the look is previewed on, best first.
   *
   * One of the guests' own photos if any have arrived — that is what the
   * filter will actually be judged against — then the couple's cover photo,
   * then a stand-in. Only one image either way: previewing on the whole roll
   * is what made this slow.
   */
  const guestPhoto = photos.find((photo) => !broken.has(photo.id))?.url
  const sample = guestPhoto || event?.coverPhoto || FILTER_SAMPLE_PHOTO
  const sampleIsTransformable = canTransform(sample)
  const sampleHelp = guestPhoto
    ? "camera.filterPreviewHelp"
    : event?.coverPhoto
      ? "camera.filterCoverHelp"
      : "camera.filterSampleHelp"

  /*
   * What the full-screen preview pages through.
   *
   * The guests' photos when there are any, opened at the one on show — so the
   * couple can look past the first frame and see the look across several. A
   * cover photo or the stand-in is a single frame with nothing to page to.
   */
  const previewPhotos: CameraPhoto[] = photos.length
    ? photos
    : [
        {
          id: "sample",
          url: sample,
          width: null,
          height: null,
          takenAt: new Date().toISOString(),
          by: null,
          hidden: false,
        },
      ]
  const previewIndex = Math.max(
    0,
    previewPhotos.findIndex((photo) => photo.url === sample)
  )

  return (
    <>
      <div className="space-y-6" data-print="hide">
      <PageHeader
        title={t("camera.title")}
        description={t("camera.subtitle")}
        actions={
          saving ? (
            <span className="text-muted-foreground flex items-center gap-2 text-sm">
              <BrandSpinner />
            </span>
          ) : null
        }
      />

      {/*
        * The camera hangs off the published invitation, so a draft event's
        * camera link 404s however carefully the switch below is set. Worth
        * saying here rather than letting it be discovered on a phone at the
        * venue, where it reads as the camera being broken.
        */}
      {settings.enabled && event?.status === "draft" ? (
        <Alert variant="destructive">
          <TriangleAlert className="size-4" aria-hidden="true" />
          <AlertTitle>{t("camera.notPublished")}</AlertTitle>
          <AlertDescription>{t("camera.notPublishedHelp")}</AlertDescription>
          <AlertAction>
            <ButtonLink variant="secondary" size="sm" href={`/events/${eventId}/invitation`}>
              {t("camera.goPublish")}
            </ButtonLink>
          </AlertAction>
        </Alert>
      ) : null}

      {/*
        * The same confusion as an unpublished invitation, from the other
        * direction: the switch says on, the camera refuses everyone, and
        * nothing on the screen connects that to the date sitting below it.
        */}
      {settings.enabled && reveal && reveal.getTime() <= now ? (
        <Alert>
          <Info className="size-4" aria-hidden="true" />
          <AlertTitle>{t("camera.alreadyOpen")}</AlertTitle>
          <AlertDescription>{t("camera.alreadyOpenHelp")}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="p-5">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-1">
            <Label htmlFor="camera-enabled" className="text-base">
              {t("camera.enable")}
            </Label>
            <p className="text-muted-foreground max-w-prose text-sm">{t("camera.enableHelp")}</p>
          </div>
          <Switch
            id="camera-enabled"
            checked={settings.enabled}
            onCheckedChange={(enabled) =>
              save({
                ...settings,
                enabled,
                // Turning it on with no reveal date would leave a camera that
                // fills up and never opens, so it is given one to edit rather
                // than an empty field to forget.
                revealAt:
                  settings.revealAt ??
                  (enabled && event ? defaultRevealAt(event.date).toISOString() : null),
              })
            }
          />
        </div>
      </Card>

      {settings.enabled ? (
        <>
          <Card className="space-y-6 p-5">
            <SectionTitle>{t("camera.sectionFilm")}</SectionTitle>
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <Label htmlFor="camera-shots">{t("camera.shotsPerGuest")}</Label>
                <span className="font-mono text-lg tabular-nums">{settings.shotsPerGuest}</span>
              </div>
              <Slider
                id="camera-shots"
                min={1}
                max={30}
                step={1}
                value={[settings.shotsPerGuest]}
                // Dragging updates the number on screen; the save waits for the
                // thumb to be let go, so one drag is one request rather than thirty.
                onValueChange={(value) =>
                  setSettings({ ...settings, shotsPerGuest: firstValue(value, settings.shotsPerGuest) })
                }
                onValueCommitted={(value) =>
                  save({ ...settings, shotsPerGuest: firstValue(value, settings.shotsPerGuest) })
                }
              />
              <p className="text-muted-foreground text-sm">{t("camera.shotsHelp")}</p>
            </div>

            <SectionTitle>{t("camera.sectionReveal")}</SectionTitle>
            <div className="space-y-3">
              <Label>{t("camera.revealAt")}</Label>
              <div className="flex flex-wrap gap-2">
                <DatePicker
                  value={reveal ? toDateInput(reveal) : ""}
                  onChange={(date) => save({ ...settings, revealAt: combine(date, reveal, true) })}
                  className="w-44"
                />
                <TimePicker
                  value={reveal ? toTimeInput(reveal) : "10:00"}
                  onChange={(time) => save({ ...settings, revealAt: combine(time, reveal, false) })}
                  aria-label={t("camera.revealAt")}
                />
              </div>
              <p
                className={cn(
                  "text-sm",
                  settings.revealAt ? "text-muted-foreground" : "text-destructive"
                )}
              >
                {settings.revealAt ? t("camera.revealHelp") : t("camera.revealMissing")}
              </p>
            </div>

            <SectionTitle>{t("camera.sectionLook")}</SectionTitle>

            <div className="space-y-3">
              <p className="text-muted-foreground max-w-prose text-sm">
                {t("camera.filterHelp")}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                {/* The look at a size you can actually judge. */}
                <figure className="w-full shrink-0 space-y-1.5 sm:w-40">
                  <button
                    type="button"
                    onClick={() => setPreviewAt(previewIndex)}
                    disabled={sampleBroken}
                    aria-label={t("camera.viewPhoto")}
                    className="bg-muted focus-visible:ring-ring block aspect-3/4 w-full cursor-zoom-in overflow-hidden rounded-lg border focus-visible:ring-2 focus-visible:outline-none"
                  >
                    {sampleBroken ? null : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={
                          sampleIsTransformable
                            ? cloudinaryUrl(
                                sample,
                                shownTransform
                                  ? `f_auto,q_auto,c_fill,ar_3:4,w_400/${shownTransform}`
                                  : "f_auto,q_auto,c_fill,ar_3:4,w_400"
                              )
                            : sample
                        }
                        alt=""
                        onError={() => setSampleBroken(true)}
                        style={sampleIsTransformable ? undefined : { filter: shownFilter.css }}
                        className="size-full object-cover"
                      />
                    )}
                  </button>
                  <figcaption className="space-y-2 text-center">
                    <span className="text-muted-foreground block text-xs">
                      {L(shownFilter.name)}
                    </span>
                    {/* Applying is its own press: it redraws every photo in the
                        roll, so it should be something the couple asks for once
                        they have decided, not a side effect of looking. */}
                    <Button
                      size="sm"
                      className="w-full"
                      disabled={!unapplied || saving}
                      onClick={() => {
                        if (chosen) void save({ ...settings, filter: chosen })
                        setChosen(null)
                      }}
                    >
                      {unapplied ? t("camera.applyFilter") : t("camera.filterApplied")}
                    </Button>
                  </figcaption>
                </figure>

                {/* All of them on the page at once, wrapping down the column.
                    A sideways strip hid two thirds of the looks behind a
                    gesture; choosing between twenty-five is a comparison, and
                    a comparison wants everything in view.

                    Auto-filled tracks rather than wrapped flex, so the rows
                    line up in columns instead of ending ragged. */}
                <div className="grid min-w-0 flex-1 grid-cols-[repeat(auto-fill,minmax(4.75rem,1fr))] gap-2">
                {CAMERA_FILTERS.map((option) => {
                  const active = (chosen ?? settings.filter ?? DEFAULT_CAMERA_FILTER) === option.id
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setChosen(option.id)}
                      aria-pressed={active}
                      className={cn(
                        "focus-visible:ring-ring space-y-1.5 rounded-lg border p-1.5 text-center transition focus-visible:ring-2 focus-visible:outline-none",
                        active ? "border-primary ring-primary/30 ring-2" : "hover:border-foreground/25"
                      )}
                    >
                      <span className="bg-muted relative block aspect-square overflow-hidden rounded">
                        {sampleBroken ? null : (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={
                              sampleIsTransformable
                              ? cloudinaryUrl(
                                  sample,
                                  option.transform
                                    ? `f_auto,q_auto,c_fill,w_180/${option.transform}`
                                      : "f_auto,q_auto,c_fill,w_180"
                                  )
                                : sample
                            }
                            alt=""
                            loading="lazy"
                            onError={() => setSampleBroken(true)}
                            style={sampleIsTransformable ? undefined : { filter: option.css }}
                            className="size-full object-cover"
                          />
                        )}
                        {!sampleBroken && !sampleIsTransformable && option.vignette > 0 ? (
                          <span
                            aria-hidden="true"
                            className="absolute inset-0"
                            style={{
                              background: `radial-gradient(circle at 50% 45%, transparent 45%, rgba(0,0,0,${option.vignette}) 100%)`,
                            }}
                          />
                        ) : null}
                      </span>
                      <span className="block truncate text-[11px]">{L(option.name)}</span>
                    </button>
                  )
                })}
                </div>
              </div>
              <p className="text-muted-foreground text-xs">
                {t(sampleHelp)}
                {sampleIsTransformable ? "" : ` ${t("camera.filterApproxHelp")}`}
              </p>
            </div>

            <div className="flex items-start justify-between gap-6">
              <div className="space-y-1">
                <Label htmlFor="camera-ask-name">{t("camera.askName")}</Label>
                <p className="text-muted-foreground text-sm">{t("camera.askNameHelp")}</p>
              </div>
              <Switch
                id="camera-ask-name"
                checked={settings.askName}
                onCheckedChange={(askName) => save({ ...settings, askName })}
              />
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="bg-background rounded-lg border p-3">
                <QrCode id="camera-qr" value={cameraUrl} className="size-40" />
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <div>
                  <h2 className="font-medium">{t("camera.poster")}</h2>
                  <p className="text-muted-foreground text-sm">{t("camera.posterHelp")}</p>
                </div>
                <code className="text-muted-foreground block truncate text-xs">{cameraUrl}</code>
                <div className="space-y-1.5 pt-1">
                  <Label htmlFor="camera-note">{t("camera.note")}</Label>
                  <Input
                    id="camera-note"
                    value={locale === "km" ? settings.noteKm : settings.noteEn}
                    placeholder={t("camera.notePlaceholder")}
                    maxLength={120}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        ...(locale === "km"
                          ? { noteKm: e.target.value }
                          : { noteEn: e.target.value }),
                      })
                    }
                    onBlur={() => save(settings)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      void navigator.clipboard.writeText(cameraUrl)
                      toast.success(t("camera.linkCopied"))
                    }}
                  >
                    <Copy className="size-3.5" aria-hidden="true" />
                    {t("camera.copyLink")}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => downloadQrSvg("camera-qr", `camera-${slug}.svg`)}
                  >
                    <Download className="size-3.5" aria-hidden="true" />
                    {t("camera.download")}
                  </Button>
                </div>
                <dl className="text-muted-foreground flex gap-5 text-sm">
                  <div>
                    <dt className="sr-only">{t("camera.rolls")}</dt>
                    <dd>
                      <span className="text-foreground font-medium">{stats.rollCount}</span>{" "}
                      {t("camera.rolls")}
                    </dd>
                  </div>
                  <div>
                    <dt className="sr-only">{t("camera.photos")}</dt>
                    <dd>
                      <span className="text-foreground font-medium">{stats.photoCount}</span>{" "}
                      {t("camera.photos")}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </Card>

          {/*
            * The wall poster.
            *
            * The table card is a small thing beside a place setting; this is
            * the one that goes on a stand at the door or gets sent to whoever
            * is printing the banner. Same QR, drawn large enough to survive
            * being blown up — the code is vector, and the type is rendered at
            * the output size rather than scaled from the screen.
            */}
          <Card className="p-5">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              {/* Styled with the invitation's own theme, so this preview shows
                  what the export will actually look like rather than a
                  generic stand-in for it. */}
              <div
                style={{
                  ...theme,
                  background: "var(--inv-surface)",
                  border: "1px solid var(--inv-gold)",
                }}
                className="mx-auto w-56 shrink-0 rounded-lg p-5 text-center"
              >
                <p
                  className="text-[0.625rem] font-medium tracking-[0.16em] uppercase"
                  style={{ color: "var(--inv-accent)" }}
                >
                  {L(event?.title ?? { en: "", km: "" })}
                </p>
                <div
                  className="mx-auto mt-3 rounded p-2"
                  style={{ background: "var(--inv-bg)", border: "1px solid var(--inv-border)" }}
                >
                  <QrCode
                    id="camera-poster-qr"
                    value={cameraUrl}
                    foreground="var(--inv-fg)"
                    background="var(--inv-bg)"
                    centerMark={false}
                  />
                </div>
                <p
                  className="mt-3 text-sm font-medium"
                  style={{ color: "var(--inv-fg)", fontFamily: "var(--inv-font-display)" }}
                >
                  {t("camera.poster.caption")}
                </p>
                <p className="mt-1 text-[0.625rem]" style={{ color: "var(--inv-muted)" }}>
                  {t("camera.shotsEach").replace("%s", String(settings.shotsPerGuest))}
                </p>
              </div>

              <div className="min-w-0 flex-1 space-y-3">
                <div>
                  <h2 className="font-medium">{t("camera.poster.title")}</h2>
                  <p className="text-muted-foreground text-sm">{t("camera.poster.help")}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={buildingPoster}
                    onClick={() => {
                      setBuildingPoster(true)
                      void exportQrPoster({
                        qrElementId: "camera-poster-qr",
                        filename: `${slug}-camera-poster.png`,
                        theme,
                        copy: {
                          eyebrow: L(event?.title ?? { en: "", km: "" }),
                          title:
                            (locale === "km" ? settings.noteKm : settings.noteEn) ||
                            t("camera.poster.caption"),
                          subtitle: t("camera.shotsEach").replace(
                            "%s",
                            String(settings.shotsPerGuest)
                          ),
                          caption: t("camera.poster.caption"),
                          footnote: cameraUrl,
                        },
                      })
                        .then((ok) =>
                          toast[ok ? "success" : "error"](
                            ok ? t("share.exported") : t("share.exportFailed")
                          )
                        )
                        .finally(() => setBuildingPoster(false))
                    }}
                  >
                    <ImageDown className="size-3.5" aria-hidden="true" />
                    {t("camera.poster.export")}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => window.print()}>
                    <Printer className="size-3.5" aria-hidden="true" />
                    {t("camera.poster.print")}
                  </Button>
                </div>

                {/* The design team's own example of this: the mascot beside a
                    line of text while something is being made. */}
                {buildingPoster ? (
                  <div className="flex items-center gap-2.5" role="status" aria-live="polite">
                    <MascotMotion motion="pushing" size={40} />
                    <span className="text-sm text-muted-foreground">
                      {t("camera.poster.building")}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </Card>

          <section className="space-y-3">
            <div>
              <h2 className="font-medium">{t("camera.moderation")}</h2>
              <p className="text-muted-foreground text-sm">{t("camera.moderationHelp")}</p>
            </div>

            {photos.length === 0 ? (
              <EmptyState icon={Camera} mascotMotion="idle" title={t("camera.empty")} />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {photos.map((photo, position) => (
                  <figure
                    key={photo.id}
                    className="bg-muted group relative overflow-hidden rounded-lg border"
                  >
                    {broken.has(photo.id) ? (
                      <div className="text-muted-foreground grid aspect-square size-full place-items-center text-xs">
                        <ImageOff className="size-5" aria-hidden="true" />
                      </div>
                    ) : (
                      /* The photo opens full screen; moderating a wedding from
                         thumbnails means deciding what to hide without being
                         able to see it. The controls below sit above this and
                         stop their own clicks. */
                      <button
                        type="button"
                        onClick={() => setViewing(position)}
                        aria-label={t("camera.viewPhoto")}
                        className="block size-full cursor-zoom-in focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      >
                        {/* No image loader is configured for the storage host. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          {...imageSrcSet(photo.url, {
                            sizes: "(min-width: 1024px) 25vw, 50vw",
                            effect,
                          })}
                          alt=""
                          loading="lazy"
                          onError={() =>
                            setBroken((current) => new Set(current).add(photo.id))
                          }
                          className={cn(
                            "aspect-square size-full object-cover transition",
                            photo.hidden && "opacity-35 grayscale"
                          )}
                        />
                      </button>
                    )}
                    <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/75 to-transparent px-2 pt-6 pb-1.5">
                      <span className="truncate text-[11px] text-white/85">{photo.by ?? ""}</span>
                      <span className="pointer-events-auto flex gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                        <IconAction
                          label={photo.hidden ? t("camera.unhide") : t("camera.hide")}
                          onClick={async () => {
                            await setPhotoHidden(eventId, photo.id, !photo.hidden)
                            setPhotos((current) =>
                              current.map((item) =>
                                item.id === photo.id ? { ...item, hidden: !item.hidden } : item
                              )
                            )
                          }}
                        >
                          {photo.hidden ? (
                            <Eye className="size-3.5" aria-hidden="true" />
                          ) : (
                            <EyeOff className="size-3.5" aria-hidden="true" />
                          )}
                        </IconAction>
                        <IconAction
                          label={t("camera.deletePhoto")}
                          onClick={async () => {
                            if (!window.confirm(t("camera.deleteConfirm"))) return
                            await deletePhoto(eventId, photo.id)
                            setPhotos((current) => current.filter((item) => item.id !== photo.id))
                            setStats((current) => ({
                              ...current,
                              photoCount: Math.max(0, current.photoCount - 1),
                            }))
                          }}
                        >
                          <Trash2 className="size-3.5" aria-hidden="true" />
                        </IconAction>
                      </span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}

            <PhotoLightbox
              photos={photos}
              index={viewing}
              filter={effect}
              onIndexChange={setViewing}
              onClose={() => setViewing(null)}
            />

            {/* The preview, full screen, in the look being considered — so a
                decision is made at the size the photos are actually looked at
                rather than from a thumbnail. */}
            <PhotoLightbox
              photos={previewPhotos}
              index={previewAt}
              filter={shownTransform}
              onIndexChange={setPreviewAt}
              onClose={() => setPreviewAt(null)}
            />

            {/* Reaching the end of the roll asks for the next page. The button
                stays for anyone who never gets an observer — a keyboard user
                tabbing past the grid, or a browser without one. */}
            <div ref={endOfRoll} aria-hidden="true" />
            {morePhotos ? (
              <div className="flex justify-center pt-2">
                <Button variant="secondary" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? (
                    <BrandSpinner />
                  ) : null}
                  {t("camera.showMore")}
                </Button>
              </div>
            ) : null}
          </section>
        </>
      ) : null}
      </div>

      {/* Paper only. Outside the wrapper above, so the print rules can hide the
          dashboard and leave the poster standing on its own sheet. */}
      {settings.enabled ? (
        <div data-print="poster" className="hidden">
          <p className="poster-eyebrow">{L(event?.title ?? { en: "", km: "" })}</p>
          <QrCode value={cameraUrl} foreground="#1c1917" background="#ffffff" centerMark={false} />
          <p className="poster-caption">{t("camera.poster.caption")}</p>
          <p className="poster-note">
            {t("camera.shotsEach").replace("%s", String(settings.shotsPerGuest))}
          </p>
          <p className="poster-url">{cameraUrl}</p>
        </div>
      ) : null}
    </>
  )
}

/**
 * A heading inside a settings card.
 *
 * The card had grown to five unrelated controls in a row — how much film, when
 * it develops, what it says on the poster, how it looks — and read as one
 * undifferentiated list. These are the seams.
 */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-muted-foreground border-b pb-2 text-xs font-medium tracking-wide uppercase">
      {children}
    </h2>
  )
}

function IconAction({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void | Promise<void>
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => void onClick()}
      className="grid size-6 place-items-center rounded bg-black/55 text-white transition hover:bg-black/75"
    >
      {children}
    </button>
  )
}

/** A screenful at a time. Large enough that most weddings need one press, at most. */
const PAGE_SIZE = 60

/** The slider speaks either a number or a range; this one only ever has one thumb. */
function firstValue(value: number | readonly number[], fallback: number) {
  const next = Array.isArray(value) ? value[0] : (value as number)
  return typeof next === "number" ? next : fallback
}

/* ------------------------------------------------------------------ dates */

function toDateInput(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function toTimeInput(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/**
 * Merges one half of a date-time without disturbing the other.
 *
 * Editing the date must not reset the time to midnight, and vice versa — a
 * couple setting "the 8th" and then "10:00" should end up with both, not with
 * whichever they touched last.
 */
function combine(value: string, current: Date | null, isDate: boolean): string | null {
  if (!value) return current ? current.toISOString() : null
  const base = current ?? new Date()
  if (isDate) {
    const [year, month, day] = value.split("-").map(Number)
    const next = new Date(base)
    next.setFullYear(year, month - 1, day)
    return next.toISOString()
  }
  const [hours, minutes] = value.split(":").map(Number)
  const next = new Date(base)
  next.setHours(hours, minutes, 0, 0)
  return next.toISOString()
}

function pad(value: number) {
  return String(value).padStart(2, "0")
}

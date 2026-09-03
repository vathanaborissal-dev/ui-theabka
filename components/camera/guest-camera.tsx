"use client"

import * as React from "react"
import { Camera, ImageIcon, Loader2, Lock, X } from "lucide-react"
import { toast } from "sonner"

import { useLocale } from "@/components/providers/locale-provider"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ApiError } from "@/lib/api-client"
import {
  getCamera,
  pickUpCamera,
  sendShot,
  type CameraState,
} from "@/lib/camera"
import { backdropForDesign, invitationTheme } from "@/lib/invitation/theme"
import { cn } from "@/lib/utils"
import { compressImage } from "@/lib/uploads"
import type { InvitationDesign } from "@/lib/types"
import { InvitationLanguageToggle } from "@/components/invitation/language-toggle"
import { Backdrop } from "@/components/invitation/backdrop"
import { KbachDivider } from "@/components/invitation/ornaments"
import { CameraLanguageToggle } from "./camera-language-toggle"
import { FilmCounter } from "./film-counter"
import { RevealCountdown } from "./reveal-countdown"
import { RevealedGallery } from "./revealed-gallery"
import { Viewfinder, type ViewfinderHandle } from "./viewfinder"

/**
 * The camera a guest gets from the QR code.
 *
 * Five screens in one, chosen by what the server says rather than by anything
 * remembered here: closed, pick up the camera, shoot, roll finished, and — once
 * the reveal passes — the gallery.
 *
 * Nothing in this file can show a photo before the reveal, because nothing in
 * this file is ever given one. That is worth stating plainly: the temptation in
 * a feature like this is a local preview "just for the person who took it", and
 * a single one of those turns a shared surprise into a private one.
 */
export function GuestCamera({
  slug,
  guestToken,
  design,
}: {
  slug: string
  guestToken?: string
  /**
   * The couple's invitation design, so the camera is recognisably part of the
   * same wedding rather than a stock dark app the QR happens to point at.
   * Null when the invitation could not be read; the defaults still work.
   */
  design?: InvitationDesign | null
}) {
  const { t, locale } = useLocale()
  const [state, setState] = React.useState<CameraState | null>(null)
  /*
   * Why the camera is not showing, kept apart from whether it is switched off.
   *
   * These used to collapse into one "the camera is closed" screen, which sent
   * couples looking for a switch that was already on: an unpublished
   * invitation 404s here, and so does a phone that cannot reach the API, and
   * neither has anything to do with the camera being closed.
   */
  const [failure, setFailure] = React.useState<"none" | "missing" | "offline">("none")
  /*
   * Whether the viewfinder is running.
   *
   * A live camera stream is the most expensive thing this page can do — it
   * holds the sensor open and the phone warm — and a guest who has taken their
   * shot for now has no reason to be paying for it. Closing unmounts the
   * viewfinder, which stops the track, which is what actually turns the
   * camera off; hiding it would keep the sensor running behind a black box.
   */
  const [shooting, setShooting] = React.useState(true)

  const refresh = React.useCallback(async () => {
    try {
      setState(await getCamera(slug))
      setFailure("none")
    } catch (error) {
      const missing = error instanceof ApiError && error.status === 404
      setFailure(missing ? "missing" : "offline")
    }
  }, [slug])

  React.useEffect(() => {
    let cancelled = false
    getCamera(slug)
      .then((next) => {
        if (!cancelled) setState(next)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        const missing = error instanceof ApiError && error.status === 404
        setFailure(missing ? "missing" : "offline")
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  /*
   * The reveal happens to a page that is already open.
   *
   * A guest who used their last shot sits on the countdown; without this it
   * reaches zero and nothing happens, and the one moment the whole feature was
   * building towards needs a manual refresh to arrive. So the page waits for
   * its own reveal time and asks again.
   */
  const revealAt = state?.revealAt
  const revealed = state?.revealed ?? false
  React.useEffect(() => {
    if (!revealAt || revealed) return
    const waitFor = new Date(revealAt).getTime() - Date.now()
    if (waitFor <= 0 || waitFor > MAX_TIMER_MS) return
    // A second past the moment, so a clock a little ahead of the server's does
    // not ask early and settle back into the countdown.
    const id = window.setTimeout(() => void refresh(), waitFor + 1000)
    return () => window.clearTimeout(id)
  }, [revealAt, revealed, refresh])

  /*
   * And when the phone comes back.
   *
   * Guests put the camera away and take it out again all evening, by which
   * time the couple may have changed the allowance, closed the camera, or the
   * reveal may have passed. Cheaper and calmer than polling.
   */
  React.useEffect(() => {
    function onVisible() {
      if (document.visibilityState === "visible") {
        void refresh()
      } else {
        // Pocketed, or switched away from. iOS suspends the stream here
        // anyway and does not always hand it back cleanly, so it is both
        // kinder to the battery and steadier to let go of it deliberately.
        setShooting(false)
      }
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [refresh])

  if (failure !== "none") {
    return (
      <Themed design={design} backdrop>
        <Shell>
          <Message
            title={failure === "missing" ? t("camera.notLive") : t("camera.offline")}
            body={failure === "missing" ? t("camera.notLiveHelp") : t("camera.offlineHelp")}
          />
        </Shell>
      </Themed>
    )
  }
  if (!state) {
    return (
      <Themed design={design} backdrop>
        <Shell>
          <Loader2 className="size-6 animate-spin text-(--inv-muted)" aria-hidden="true" />
        </Shell>
      </Themed>
    )
  }

  const title = locale === "km" ? state.titleKm || state.titleEn : state.titleEn || state.titleKm
  const note = locale === "km" ? state.noteKm || state.noteEn : state.noteEn || state.noteKm

  // The reveal is checked before anything else: once it passes, the camera is
  // finished and the only thing anyone wants is the gallery.
  if (state.revealed) {
    return (
      <Themed design={design} backdrop>
        <RevealedGallery slug={slug} title={title} filter={state.filter} />
      </Themed>
    )
  }

  if (!state.enabled) {
    return (
      <Themed design={design} backdrop>
        <Shell>
          <Message title={t("camera.closed")} body={t("camera.closedHelp")} />
        </Shell>
      </Themed>
    )
  }

  if (!state.hasRoll) {
    return (
      <Themed design={design} backdrop>
        <Shell>
          <PickUp
            slug={slug}
            state={state}
            title={title}
            note={note}
            guestToken={guestToken}
            onPickedUp={setState}
          />
        </Shell>
      </Themed>
    )
  }

  if (state.shotsLeft <= 0) {
    return (
      <Themed design={design} backdrop>
        <Shell>
          <Finished state={state} />
        </Shell>
      </Themed>
    )
  }

  /*
   * The viewfinder stays black, themed or not.
   *
   * This one screen is a camera rather than a page of the invitation: the
   * frame the guest is composing needs a neutral surround, and an ivory card
   * around a live feed would both fight the photo and blind anyone using it in
   * a dark reception hall.
   */
  if (!shooting) {
    return (
      <Themed design={design} backdrop>
        <Shell>
          <Standby state={state} onOpen={() => setShooting(true)} />
        </Shell>
      </Themed>
    )
  }

  return (
    <Themed design={design}>
      <Shooter
        slug={slug}
        state={state}
        onState={setState}
        onClose={() => setShooting(false)}
      />
    </Themed>
  )
}

/**
 * The camera, put away.
 *
 * Between shots there is nothing worth keeping the sensor open for, so this is
 * where a guest waits: the film they have left, and one button to raise the
 * camera again. It wears the card rather than the viewfinder's black, because
 * at this moment they are looking at an invitation, not composing a photo.
 */
function Standby({ state, onOpen }: { state: CameraState; onOpen: () => void }) {
  const { t } = useLocale()
  return (
    <div className="w-full max-w-sm space-y-6 text-center">
      <Camera className="mx-auto size-8 text-(--inv-gold)" aria-hidden="true" />
      <div className="space-y-3">
        <h1
          className="text-2xl text-(--inv-accent)"
          style={{ fontFamily: "var(--inv-font-display)" }}
        >
          {t("camera.standby")}
        </h1>
        <KbachDivider className="mx-auto w-32 text-(--inv-gold)" />
        <p className="text-sm text-(--inv-muted)">{t("camera.standbyHelp")}</p>
      </div>

      <div className="rounded-lg border border-(--inv-border) bg-(--inv-surface) p-5">
        <FilmCounter
          left={state.shotsLeft}
          total={state.shotsPerGuest}
          tone="onCard"
          className="mx-auto w-fit"
        />
        <p className="mt-3 text-sm text-(--inv-fg)">
          {t("camera.shotsLeft").replace("%s", String(state.shotsLeft))}
        </p>
      </div>

      <Button
        onClick={onOpen}
        size="lg"
        className="w-full bg-(--inv-accent) text-(--inv-accent-contrast) hover:bg-(--inv-accent)/90"
      >
        <Camera className="size-4" aria-hidden="true" />
        {t("camera.takePhoto")}
      </Button>
    </div>
  )
}

/**
 * The couple's palette and typefaces around the whole camera.
 *
 * `inv-root` and the `--inv-*` properties are the same ones the invitation
 * sets, so everything inside can be styled in the card's own colours — and a
 * palette the couple changes on their card changes here too, with nothing to
 * keep in step.
 */
function Themed({
  design,
  backdrop = false,
  children,
}: {
  design?: InvitationDesign | null
  /**
   * The card's own backdrop behind the screen.
   *
   * Off for the viewfinder, which has a photo to compose and needs a plain
   * dark surround, and on everywhere else — the backdrop is most of what makes
   * the invitation look like itself, and without it the camera reads as a
   * different product in matching colours.
   */
  backdrop?: boolean
  children: React.ReactNode
}) {
  const { locale } = useLocale()
  // An empty design is a valid one: every lookup behind this falls back to the
  // default template, palette and pairing.
  const resolved = design ?? ({} as InvitationDesign)
  const style = invitationTheme(resolved, locale)
  return (
    <div className="inv-root" style={style} lang={locale}>
      {backdrop ? (
        <>
          <Backdrop {...backdropForDesign(resolved)} />
          {/* The same veil the templates put between the backdrop and their
              type. A photo grid or a form directly on a misty video is a
              legibility problem before it is a style one. */}
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-0 bg-(--inv-bg)/80 backdrop-blur-[2px]"
          />
        </>
      ) : null}
      {children}
    </div>
  )
}

/**
 * The longest a timer is worth setting.
 *
 * setTimeout overflows past about 24.8 days and fires immediately, which would
 * turn a reveal set months out into a request loop. Anything further away will
 * be picked up when the phone next comes back to the page.
 */
const MAX_TIMER_MS = 24 * 60 * 60 * 1000

/* ------------------------------------------------------------------ screens */

/** Picking up the camera: what it is, how many shots, and when they open. */
function PickUp({
  slug,
  state,
  title,
  note,
  guestToken,
  onPickedUp,
}: {
  slug: string
  state: CameraState
  title: string
  note: string
  guestToken?: string
  onPickedUp: (state: CameraState) => void
}) {
  const { t } = useLocale()
  const [name, setName] = React.useState("")
  const [busy, setBusy] = React.useState(false)

  async function pickUp() {
    setBusy(true)
    try {
      onPickedUp(await pickUpCamera(slug, { name, guestToken }))
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t("camera.uploadFailed"))
      setBusy(false)
    }
  }

  return (
    <div className="w-full max-w-sm space-y-7 text-center">
      <div className="space-y-3">
        <Camera className="mx-auto size-8 text-(--inv-gold)" aria-hidden="true" />
        <h1
          className="text-2xl leading-snug text-(--inv-accent)"
          style={{ fontFamily: "var(--inv-font-display)" }}
        >
          {title}
        </h1>
        <KbachDivider className="mx-auto w-40 text-(--inv-gold)" />
        <p className="text-sm text-(--inv-muted)">{note || t("camera.subtitle")}</p>
      </div>

      <div className="rounded-lg border border-(--inv-border) bg-(--inv-surface) p-5">
        <FilmCounter
          left={state.shotsPerGuest}
          total={state.shotsPerGuest}
          tone="onCard"
          className="mx-auto w-fit"
        />
        <p className="mt-3 text-sm text-(--inv-fg)">
          {t("camera.shotsEach").replace("%s", String(state.shotsPerGuest))}
        </p>
        <p className="mt-1 text-xs text-(--inv-muted)">{t("camera.noPreviewNote")}</p>
      </div>

      {state.askName ? (
        <div className="space-y-2 text-left">
          <Label htmlFor="roll-name" className="text-(--inv-fg)">
            {t("camera.yourName")}{" "}
            <span className="text-(--inv-muted)">({t("camera.nameOptional")})</span>
          </Label>
          <Input
            id="roll-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
            className="border-(--inv-border) bg-(--inv-surface) text-(--inv-fg) placeholder:text-(--inv-muted)"
            autoComplete="name"
          />
        </div>
      ) : null}

      {/* The card's accent, not the app's primary: this button belongs to the
          couple's invitation, not to Theabka's dashboard. */}
      <Button
        onClick={pickUp}
        disabled={busy}
        size="lg"
        className="w-full bg-(--inv-accent) text-(--inv-accent-contrast) hover:bg-(--inv-accent)/90"
      >
        {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        {t("camera.pickUp")}
      </Button>
    </div>
  )
}

/**
 * The viewfinder, the shutter, and the counter.
 *
 * The shutter is deliberately the only control on the screen. Everything a
 * camera app would offer here — review, retake, delete — is exactly what this
 * one refuses to do.
 */
function Shooter({
  slug,
  state,
  onState,
  onClose,
}: {
  slug: string
  state: CameraState
  onState: (state: CameraState) => void
  /** Puts the camera away, releasing the stream. */
  onClose: () => void
}) {
  const { t, locale } = useLocale()
  const viewfinder = React.useRef<ViewfinderHandle>(null)
  const [cameraBlocked, setCameraBlocked] = React.useState(false)
  const [insecureContext, setInsecureContext] = React.useState(false)
  const [flash, setFlash] = React.useState(false)
  const [sending, setSending] = React.useState(false)

  const revealLabel = state.revealAt
    ? new Date(state.revealAt).toLocaleDateString(locale === "km" ? "km-KH" : "en-GB", {
        day: "numeric",
        month: "long",
      })
    : ""

  const onCameraError = React.useCallback(() => {
    // Camera streams are a secure-context API. A phone opening a Mac's LAN IP
    // over plain HTTP can load the page, but Safari/Chrome will not expose
    // getUserMedia. The native capture input below remains available there.
    setInsecureContext(!window.isSecureContext)
    setCameraBlocked(true)
  }, [])

  async function send(photo: Blob) {
    setSending(true)
    // The flash is the entire feedback for a shot: no preview, so the screen
    // has to acknowledge the press some other way or it reads as broken.
    setFlash(true)
    window.setTimeout(() => setFlash(false), 220)
    try {
      const next = await sendShot(slug, photo)
      onState(next)
      toast.success(t("camera.shotSaved").replace("%s", revealLabel))
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t("camera.uploadFailed"))
    } finally {
      setSending(false)
    }
  }

  async function shoot() {
    if (sending) return
    const photo = await viewfinder.current?.capture()
    if (!photo) {
      setCameraBlocked(true)
      return
    }
    await send(photo)
  }

  async function sendFromPhone(file: File) {
    if (sending) return
    try {
      // Native phone captures may be HEIC and may be much larger than the live
      // viewfinder frame. Re-encode them to the same small, supported image the
      // live camera produces before requesting an upload signature.
      const image = await compressImage(file, { maxEdge: 1800 })
      await send(image.blob)
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t("camera.uploadFailed"))
    }
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-black">
      <div className="relative flex-1 overflow-hidden">
        {cameraBlocked ? (
          <div className="flex size-full flex-col items-center justify-center gap-4 px-8 text-center">
            <p className="text-sm text-white/70">
              {insecureContext ? t("camera.insecureContext") : t("camera.permissionDenied")}
            </p>
            {/*
             * The fallback, and an honest label on it. The native picker shows
             * the guest their photo before sending — this screen cannot stop
             * that, so it says so rather than pretending the rule still holds.
             */}
            <label
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "border border-(--inv-gold)/40 bg-(--inv-surface) text-(--inv-fg)",
                sending && "pointer-events-none opacity-60"
              )}
            >
              {sending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <ImageIcon className="size-4" aria-hidden="true" />
              )}
              {sending ? t("camera.uploading") : t("camera.useFilePicker")}
              {/* Keeping the input inside its label preserves the original tap
                  as the user gesture. That is more reliable on iOS than
                  programmatically clicking a display:none input. */}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                disabled={sending}
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0]
                  event.currentTarget.value = ""
                  if (file) void sendFromPhone(file)
                }}
              />
            </label>
            <p className="max-w-xs text-xs text-white/45">{t("camera.filePickerWarning")}</p>
          </div>
        ) : (
          <Viewfinder ref={viewfinder} onError={onCameraError} />
        )}

        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-white transition-opacity duration-200",
            flash ? "opacity-90" : "opacity-0"
          )}
          aria-hidden="true"
        />

        {/* One bar rather than three floating corners: the counter needs to sit
            beside the way out, not be crowded into it. */}
        <div className="absolute inset-x-0 top-[max(1rem,env(safe-area-inset-top))] flex items-center justify-between gap-3 px-4">
          <CameraLanguageToggle />
          <FilmCounter left={state.shotsLeft} total={state.shotsPerGuest} />
          <button
            type="button"
            onClick={onClose}
            aria-label={t("camera.putAway")}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-black/55 text-white/85 backdrop-blur-sm transition hover:bg-black/75 hover:text-white focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 bg-black px-6 pt-5 pb-[max(1.75rem,env(safe-area-inset-bottom))]">
        {/* No shutter when there is no viewfinder behind it. A camera button
            that only ever repeats "your browser would not open the camera" is
            worse than no button — the file picker above is the way through. */}
        {cameraBlocked ? null : (
          <button
            type="button"
            onClick={shoot}
            disabled={sending}
            aria-label={t("camera.shoot")}
            className="grid size-[4.5rem] place-items-center rounded-full border-4 border-white/85 transition active:scale-95 disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="size-7 animate-spin text-white" aria-hidden="true" />
            ) : (
              <span className="size-14 rounded-full bg-white" />
            )}
          </button>
        )}
        <p className="text-center text-xs text-white/45">{t("camera.noPreviewNote")}</p>
      </div>
    </div>
  )
}

/** The roll is used up. What is left is the wait, which is the good part. */
function Finished({ state }: { state: CameraState }) {
  const { t } = useLocale()
  return (
    <div className="w-full max-w-sm space-y-6 text-center">
      <Lock className="mx-auto size-7 text-(--inv-gold)" aria-hidden="true" />
      <div className="space-y-3">
        <h1
          className="text-2xl text-(--inv-accent)"
          style={{ fontFamily: "var(--inv-font-display)" }}
        >
          {t("camera.rollFinished")}
        </h1>
        <KbachDivider className="mx-auto w-32 text-(--inv-gold)" />
        <p className="text-sm text-(--inv-muted)">
          {t("camera.developingHelp").replace("%s", String(state.photoCount))}
        </p>
      </div>
      <RevealCountdown revealAt={state.revealAt} />
    </div>
  )
}

/* ------------------------------------------------------------------ chrome */

/**
 * The ground every screen but the viewfinder sits on: the card's own paper,
 * ink and typeface, with the invitation's language toggle rather than a second
 * one drawn to look like it.
 */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-10 flex min-h-svh flex-col items-center justify-center px-6 py-14 text-(--inv-fg)">
      <InvitationLanguageToggle />
      {children}
    </div>
  )
}

function Message({ title, body }: { title: string; body: string }) {
  return (
    <div className="max-w-sm space-y-3 text-center">
      <h1 className="text-2xl text-(--inv-accent)" style={{ fontFamily: "var(--inv-font-display)" }}>
        {title}
      </h1>
      <KbachDivider className="mx-auto w-32 text-(--inv-gold)" />
      <p className="text-sm text-(--inv-muted)">{body}</p>
    </div>
  )
}

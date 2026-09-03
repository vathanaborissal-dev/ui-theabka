"use client"

import * as React from "react"

import { useLocale } from "@/components/providers/locale-provider"
import { getTemplate } from "@/lib/invitation/templates"
import { backdropForDesign, invitationTheme } from "@/lib/invitation/theme"
import { resolveMusicUrl } from "@/lib/invitation/music"
import { cn } from "@/lib/utils"
import { DesignProvider } from "./design-context"
import { AmbientLayer } from "./ambient"
import { Backdrop } from "./backdrop"
import { MusicPlayer } from "./music-player"
import { EnvelopeIntro } from "./envelope-intro"
import { VideoEnvelope } from "./video-envelope"
import { EnvelopeGreeting } from "./envelope-greeting"
import { GuestActionBar } from "./guest-action-bar"
import { MarakotTemplate } from "./templates/marakot"
import { SompeahTemplate } from "./templates/sompeah"
import { ChhayaTemplate } from "./templates/chhaya"
import { BaiseiTemplate } from "./templates/baisei"
import { SbaiTemplate } from "./templates/sbai"
import { ReachnyTemplate } from "./templates/reachny"
import { AngkorTemplate } from "./templates/angkor"
import { BophaTemplate } from "./templates/bopha"
import { RomduolTemplate } from "./templates/romduol"
import { NagaTemplate } from "./templates/naga"
import { ChanTemplate } from "./templates/chan"
import { KravanTemplate } from "./templates/kravan"
import { SilaTemplate } from "./templates/sila"
import { KbachTemplate } from "./templates/kbach"
import type { InvitationDesign } from "@/lib/types"
import type { TemplateProps } from "./templates/types"

const registry = {
  marakot: MarakotTemplate,
  sompeah: SompeahTemplate,
  chhaya: ChhayaTemplate,
  baisei: BaiseiTemplate,
  sbai: SbaiTemplate,
  reachny: ReachnyTemplate,
  angkor: AngkorTemplate,
  bopha: BophaTemplate,
  romduol: RomduolTemplate,
  naga: NagaTemplate,
  chan: ChanTemplate,
  kravan: KravanTemplate,
  sila: SilaTemplate,
  kbach: KbachTemplate,
} as const

/**
 * Applies the chosen palette and typefaces as CSS custom properties, then hands
 * off to the template. Templates read only `--inv-*`, so changing a palette or
 * a type pairing never requires touching a template.
 */
export function InvitationRenderer({
  event,
  guest,
  preview,
  replayKey,
  motionEnabled = false,
  guestActions = false,
}: Omit<TemplateProps, "guestName"> & {
  /**
   * The invited guest, in both languages.
   *
   * Resolved here rather than by the page, because which one to print depends
   * on the language the card is being *read* in — and that is decided inside
   * this provider, not outside it.
   */
  guest?: { name?: string; nameKm?: string } | null
  replayKey?: number
  motionEnabled?: boolean
  /** The public page's sticky reply bar. Off inside the builder preview. */
  guestActions?: boolean
}) {
  const { locale } = useLocale()
  const template = getTemplate(event.design.templateId)
  const Template = registry[template.id]

  /*
   * One cover photo, resolved once.
   *
   * It lives on the event, because it is also the thumbnail a chat app shows
   * when the link is pasted — that job belongs to the event, not to a design
   * the couple may swap. Templates all read `design.coverPhoto`, so it is
   * resolved here rather than in eleven template files: doing it per template
   * is how ten of them ended up rendering nothing while the eleventh worked.
   *
   * `design.coverPhoto` survives only as a fallback for rows written before
   * the photo moved to the event. Nothing writes it any more.
   */
  /*
   * The guest's own name, in the language the card is showing.
   *
   * Falls back to the other language rather than to nothing: a Khmer-only
   * guest reading the English card should still see their name, and an
   * honorific line with a blank under it is worse than one in the other script.
   */
  const guestName =
    locale === "km"
      ? guest?.nameKm?.trim() || guest?.name?.trim() || undefined
      : guest?.name?.trim() || guest?.nameKm?.trim() || undefined

  const design: InvitationDesign = {
    ...event.design,
    coverPhoto: event.coverPhoto || event.design.coverPhoto,
  }

  /*
   * Whether an envelope is in front of the card.
   *
   * It starts *true* whenever one is configured, so the server's own HTML —
   * the first thing painted, before any JavaScript runs — already has the card
   * hidden and the page locked. Starting false shipped the opposite: the whole
   * invitation arrived unlocked and scrollable, and the envelope only snapped
   * over it once hydration finished, by which point the guest could already
   * have read and scrolled the card the envelope is supposed to introduce.
   *
   * Everything that would make the envelope a trap clears it instead. Reduced
   * motion, a clip that fails to load and an autoplay the browser refuses all
   * report "not covering" the moment the envelope mounts, so the guest gets
   * the invitation rather than a seal that will not open. `<noscript>` below
   * covers the one case where nothing is left to report anything at all.
   */
  const gated = motionEnabled && Boolean(design.envelopeIntro)
  const [covered, setCovered] = React.useState(gated)

  // Turning the envelope on or off in the editor re-seals the preview, rather
  // than leaving the switch disagreeing with what is on screen.
  const [prevGated, setPrevGated] = React.useState(gated)
  if (gated !== prevGated) {
    setPrevGated(gated)
    setCovered(gated)
  }

  // Palette, typefaces and the couple's own colour overrides. Shared with
  // the disposable camera so both pages wear one definition of this wedding.
  const style = invitationTheme(design, locale)

  return (
    // `lang` drives Khmer line-height and letter-spacing correctness, and tells
    // screen readers which language to pronounce.
    <div
      style={style}
      className={cn(
        "inv-root @container",
        preview && "relative isolate",
        !motionEnabled && "inv-static"
      )}
      lang={locale}
    >
      <DesignProvider design={design} motionEnabled={motionEnabled}>
        {/* Fixed on the public page; contained inside the editor preview. */}
        <Backdrop {...backdropForDesign(design)} contained={preview} />
        {/*
          * The gate.
          *
          * Rendered as markup rather than set from an effect, because an
          * effect cannot run before hydration and that is exactly the window
          * this closes.
          *
          * These rules are deliberately unlayered: Tailwind's utilities live
          * in `@layer utilities`, and an unlayered rule beats a layered one
          * whatever the source order, so the reduced-motion escape below is
          * guaranteed to win over `opacity-0` rather than depending on where
          * this tag lands in the document.
          */}
        {covered && !preview ? (
          <style>{
            /*
             * The scroll *range* has to go, not just the overflow.
             *
             * `overflow: hidden` only clips: the card underneath still stood
             * four thousand pixels tall, so the scrollbar and the scroll
             * gesture both survived and the guest could ride them down past an
             * envelope that stayed put, through nothing — the card being
             * invisible at that point, not absent. Taking the body out of flow
             * collapses the document to the viewport, so there is no distance
             * left to travel. Every browser agrees about that, including the
             * iOS Safari that ignores `overflow:hidden` on the body for touch.
             *
             * Nothing is lost by pinning it: the envelope always starts at the
             * top, so there is no scroll position worth preserving.
             */
            "html,body{overflow:hidden;overscroll-behavior:none}" +
            "body{position:fixed;inset:0}" +
            "@media(prefers-reduced-motion:reduce){html,body{overflow:auto}body{position:static}.inv-card-layer{opacity:1}}"
          }</style>
        ) : null}
        {/* The preview pane has the same problem in miniature: the envelope
            covers the frame, but the card below it is still full height, so
            the pane scrolls through blank space. Capping it to the frame
            leaves nothing to scroll. The page itself is never touched here —
            locking the editor because a preview is playing would be absurd. */}
        {covered && preview ? (
          <style>{
            ".inv-card-layer{max-height:var(--inv-preview-height,38rem);overflow:hidden}"
          }</style>
        ) : null}
        {/* Nothing will ever clear the gate without JavaScript, so it is never
            put up in the first place: an unopenable envelope over an
            invitation nobody can scroll is worse than no envelope. */}
        {gated && !preview ? (
          <noscript>
            <style>{
              "html,body{overflow:auto}body{position:static}" +
              ".inv-card-layer{opacity:1}.inv-envelope{display:none}"
            }</style>
          </noscript>
        ) : null}
        {/* The reveal: the card fades up as the envelope finishes, rather than
            being uncovered at full strength behind it. Slower than the
            envelope's own 500ms fade so the two overlap instead of blinking. */}
        <div
          data-inv-section="cover"
          className={cn(
            "inv-card-layer transition-opacity duration-700 ease-out",
            covered ? "opacity-0" : "opacity-100"
          )}
        >
          <Template
            event={{ ...event, design }}
            guestName={guestName}
            preview={preview}
          />
        </div>
        <AmbientLayer effect={design.ambient ?? "none"} enabled={motionEnabled} />
        {/*
          * A template with a filmed envelope shows the film; the rest keep the
          * drawn one. Both are overlays over an already-rendered card, so a
          * guest whose video is blocked loses the animation, not the invitation.
          */}
        {design.introVideo ? (
          <VideoEnvelope
            guestName={guestName}
            /*
             * Only what the design says. A template's clip is copied into the
             * design when it is chosen, so there is nothing to fall back to —
             * and a field reading "no file chosen" while a video plays is the
             * editor telling the couple something untrue.
             */
            src={design.introVideo}
            onCoverChange={setCovered}
            enabled={gated}
            replayKey={replayKey}
            contained={preview}
          >
            <EnvelopeGreeting event={event} guestName={guestName} design={design} />
          </VideoEnvelope>
        ) : (
          <EnvelopeIntro
            event={event}
            guestName={guestName}
            onCoverChange={setCovered}
            enabled={gated}
            replayKey={replayKey}
            contained={preview}
          />
        )}
        {/* Music is for the guest-facing card only: a track looping while the
            couple edits their own invitation is a distraction, not a preview. */}
        <MusicPlayer src={resolveMusicUrl(design)} enabled={motionEnabled} />

        {/* Inside the palette scope, so it wears the card's own colours. */}
        {guestActions ? (
          <GuestActionBar
            enabled={Boolean(design.showRsvp)}
            shareTitle={event.title.km || event.title.en}
          />
        ) : null}
      </DesignProvider>
    </div>
  )
}

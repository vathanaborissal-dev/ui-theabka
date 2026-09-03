"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { useLocale } from "@/components/providers/locale-provider"
import { useReducedMotion } from "./motion"
import { cn } from "@/lib/utils"

type Phase = "sealed" | "opening" | "closing" | "gone"

/**
 * The filmed envelope.
 *
 * A template can ship an actual clip of its envelope being opened, and this
 * plays it: the first frame is held as the cover with the greeting over it, a
 * tap runs the clip through, and when the clip ends the card is revealed
 * beneath. The card's own looping backdrop takes over from there, so the two
 * videos read as one continuous shot rather than a cut.
 *
 * The drawn `EnvelopeIntro` stays for templates with no clip of their own —
 * this is not a replacement, it is the version for templates that have footage.
 *
 * When it is on it is a gate, not decoration: the page behind is locked from
 * the first paint, so a guest cannot scroll past the seal to the card. Being
 * opened is how you get in. What it must never be is a *trap* — a clip that
 * fails to load, an autoplay the browser refuses and a guest who prefers
 * reduced motion all drop the gate and hand over the invitation.
 */
export function VideoEnvelope({
  guestName,
  src,
  onCoverChange,
  replayKey = 0,
  contained = false,
  enabled = true,
  children,
}: {
  guestName?: string
  /** The opening clip. */
  src: string
  /** Changing this replays it — used by the builder's Play button. */
  replayKey?: number
  /** Keeps the overlay inside the editor's phone frame. */
  contained?: boolean
  enabled?: boolean
  /**
   * Reports whether the envelope is currently covering the card.
   *
   * The card fades in as this goes false. It is reported rather than assumed
   * because only this component knows whether it is showing at all — reduced
   * motion, a disabled envelope and a broken clip all mean "never covered", and
   * in every one of those the card must simply be there.
   */
  onCoverChange?: (covered: boolean) => void
  /** The greeting shown over the held first frame. */
  children?: React.ReactNode
}) {
  const { t } = useLocale()
  const reduced = useReducedMotion()
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const [phase, setPhase] = React.useState<Phase>("sealed")

  const [prevReplay, setPrevReplay] = React.useState(replayKey)
  if (replayKey !== prevReplay) {
    setPrevReplay(replayKey)
    setPhase("sealed")
  }

  /*
   * No `mounted` gate: this renders on the server too.
   *
   * It used to wait for hydration, which meant the invitation was painted
   * bare and scrollable first and the envelope dropped over it afterwards.
   * The envelope is the first thing the guest is meant to see, so it has to be
   * in the server's HTML. `useReducedMotion` reads false during hydration and
   * corrects itself immediately after, so this stays hydration-safe.
   */
  const visible = enabled && !reduced && phase !== "gone"

  /*
   * Covering stops one phase before unmounting. The envelope stays rendered
   * through `closing` so its exit can play, but it stops *claiming* to cover
   * the card the moment the clip ends — so the card fades in underneath while
   * the envelope fades out over it. Reporting the cover all the way to
   * `gone` instead would play the two fades back to back and leave half a
   * second of empty backdrop between them.
   */
  const covering = visible && phase !== "closing"

  // Told, not inferred: the card cannot work out on its own whether an
  // envelope is in front of it. Reduced motion, a disabled envelope and a
  // clip that fails to load all mean "never covered", and only this component
  // knows that.
  React.useEffect(() => {
    onCoverChange?.(covering)
    return () => onCoverChange?.(false)
  }, [covering, onCoverChange])

  // The fade is 500ms; unmount once it has played out rather than mid-fade.
  React.useEffect(() => {
    if (phase !== "closing") return
    const id = window.setTimeout(() => setPhase("gone"), 500)
    return () => window.clearTimeout(id)
  }, [phase])

  // Rewind on replay, so the second run starts from the sealed frame.
  React.useEffect(() => {
    if (phase !== "sealed") return
    const video = videoRef.current
    if (video) video.currentTime = 0
  }, [phase, replayKey])

  /*
   * Sealed again on every load, and always from the top.
   *
   * This used to be shown once per session, on the theory that replaying an
   * animation someone already sat through is an obstacle. On a refresh it was
   * the opposite: the browser restores the old scroll position, so skipping the
   * envelope dropped the guest halfway down a card with no idea what they were
   * looking at. Opening the envelope is the invitation — reloading should start
   * it, not skip it.
   */
  React.useEffect(() => {
    if (!visible || contained) return
    if ("scrollRestoration" in history) history.scrollRestoration = "manual"
    window.scrollTo(0, 0)
  }, [visible, contained])

  /*
   * The scroll lock lives in the renderer, not here.
   *
   * It was an effect on this component, which could only lock the page once
   * JavaScript had run — the exact window in which the card was readable and
   * scrollable. The renderer keeps it as a rendered `<style>` driven by the
   * same `onCoverChange` reported above, so it is in the server's HTML.
   */

  function open() {
    if (phase !== "sealed") return
    setPhase("opening")
    const video = videoRef.current
    if (!video) {
      setPhase("gone")
      return
    }
    void video.play().catch(() => {
      // Autoplay refused even after a tap: there is nothing to watch, so get
      // out of the guest's way rather than trapping them behind a still frame.
      setPhase("gone")
    })
  }

  if (!visible) return null

  const opening = phase === "opening" || phase === "closing"
  const closing = phase === "closing"

  return (
    <div
      className={cn(
        contained
          ? "absolute inset-x-0 top-0 h-[var(--inv-preview-height,38rem)]"
          // A touch drag that starts on the seal must not scroll the page
          // underneath — the lock CSS alone does not stop that on iOS.
          : "fixed inset-0 touch-none",
        "inv-envelope z-50 overflow-hidden bg-black motion-reduce:hidden",
        opening && "pointer-events-none"
      )}
      style={
        /*
         * The fade begins when the clip ends, not on a timer.
         *
         * It used to run on a fixed 900ms delay from the tap, which meant the
         * envelope vanished a second and a half in while the video was still
         * playing — the guest saw the opening start and then get cut off. The
         * clip's own length is the only thing that knows when it is finished,
         * and clips are swappable, so nothing here may assume a duration.
         */
        closing ? { animation: "inv-envelope-exit 500ms ease-in both" } : undefined
      }
    >
      <video
          ref={videoRef}
          src={src}
          muted
          playsInline
          preload="auto"
          // Holds the opening frame as the cover image until the guest taps.
          className="absolute inset-0 size-full object-cover"
        onEnded={() => setPhase("closing")}
        onError={() => setPhase("gone")}
      />

      {/* The greeting, over the held frame. It fades as soon as the clip runs
          so the animation is not read through a layer of type. */}
      <div
        className={cn(
          "relative flex size-full flex-col items-center justify-between px-6 py-14 text-center transition-opacity duration-500",
          opening ? "opacity-0" : "opacity-100"
        )}
      >
        {children}
      </div>

      {/* One target over the whole frame: on a phone the seal is a small thing
          to ask someone to hit, and everything here means "open". */}
      {opening ? null : (
        <button
          type="button"
          onClick={open}
          aria-label={t("public.tapToOpen")}
          className="absolute inset-0 flex flex-col items-center justify-end gap-1 pb-8 text-white outline-none focus-visible:ring-3 focus-visible:ring-white/60 focus-visible:ring-inset"
        >
          <span className="text-sm drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            {t("public.tapToOpen")}
          </span>
          <ChevronDown className="size-5 motion-safe:animate-bounce drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]" aria-hidden="true" />
        </button>
      )}

      <span className="sr-only">{guestName}</span>
    </div>
  )
}

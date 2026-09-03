"use client"

import * as React from "react"
import { useLocale } from "@/components/providers/locale-provider"
import { useReducedMotion } from "./motion"
import { KbachDivider } from "./ornaments"
import { Romduol } from "./khmer-ornaments"
import { Motif } from "./motif"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { InvitationEvent } from "@/lib/types"

type Phase = "sealed" | "opening" | "gone"

/**
 * The "tap to open" envelope.
 *
 * This is the bit a paper invitation cannot do, so it is worth getting right:
 * the guest sees a sealed envelope addressed to them, taps the wax seal, the
 * flap folds back and the card slides out.
 *
 * When it is on it is a gate, not decoration: the page behind is locked from
 * the first paint, so a guest cannot scroll past the seal to the card. It is
 * shown on every visit — opening it *is* the invitation, and a refresh that
 * skipped it dropped the guest wherever they had scrolled to before.
 *
 * What it must never be is a trap. Guests who prefer reduced motion, and any
 * page where JavaScript never runs, get the card with no gate at all.
 */
export function EnvelopeIntro({
  event,
  guestName,
  /** Changing this replays the intro — used by the builder's "replay" button. */
  onCoverChange,
  replayKey = 0,
  contained = false,
  enabled = true,
}: {
  event: InvitationEvent
  guestName?: string
  /**
   * Reports whether the envelope is covering the card, so the renderer can
   * hold the card hidden and the page locked for exactly that long. Reported
   * rather than assumed: only this component knows whether it is showing at
   * all, and every case where it is not must leave the card visible.
   */
  onCoverChange?: (covered: boolean) => void
  replayKey?: number
  /**
   * Keeps the overlay inside the editor's phone frame.
   *
   * It is `fixed` on the public page, which is right there and wrong here: in
   * the builder that covers the whole editor, so pressing Play buried the
   * fields under a full-screen envelope.
   */
  contained?: boolean
  enabled?: boolean
}) {
  const { t, L, locale } = useLocale()
  const reduced = useReducedMotion()
  const [phase, setPhase] = React.useState<Phase>("sealed")

  // Replaying (from the builder) puts the envelope back together.
  const [prevReplay, setPrevReplay] = React.useState(replayKey)
  if (replayKey !== prevReplay) {
    setPrevReplay(replayKey)
    setPhase("sealed")
  }

  /*
   * No `mounted` gate: this renders on the server too, so the envelope is in
   * the first paint rather than dropping over an invitation the guest has
   * already started reading.
   */
  const visible = enabled && !reduced && phase !== "gone"

  /*
   * Covering ends when the flap opens, not when the overlay leaves. The card
   * behind then fades up during the 1.5s opening, ready just as the envelope
   * begins to fade out at 800ms — holding the cover until the very end would
   * reveal a blank ground and fade the card in after it.
   */
  const covering = visible && phase === "sealed"

  React.useEffect(() => {
    onCoverChange?.(covering)
    return () => onCoverChange?.(false)
  }, [covering, onCoverChange])

  /*
   * Sealed again on every load, and always from the top. See `video-envelope`:
   * a refresh restores the old scroll position, so skipping the envelope left
   * the guest halfway down the card instead of at its opening.
   */
  React.useEffect(() => {
    if (!visible || contained) return
    if ("scrollRestoration" in history) history.scrollRestoration = "manual"
    window.scrollTo(0, 0)
  }, [visible, contained])

  /*
   * The scroll lock lives in the renderer, driven by `onCoverChange` above.
   * As an effect here it could only lock the page after hydration — which is
   * the window in which the card was scrollable in the first place.
   */

  function open() {
    if (phase !== "sealed") return
    setPhase("opening")
    window.setTimeout(() => setPhase("gone"), 1500)
  }

  if (!visible) return null

  const opening = phase === "opening"

  return (
    <div
      className={cn(
        // Pinned to the top of the card and given the pane's height, not the
        // card's. It cannot be `fixed` here (that covers the whole editor) and
        // it cannot be sticky either — as the last child in the flow, sticky
        // would start four thousand pixels down, which is where it was landing.
        contained
          ? "absolute inset-x-0 top-0 h-[var(--inv-preview-height,38rem)]"
          // A touch drag that starts on the seal must not scroll the page
          // underneath — the lock CSS alone does not stop that on iOS.
          : "fixed inset-0 touch-none",
        "inv-envelope z-50 flex items-center justify-center bg-(--inv-bg) px-6 motion-reduce:hidden",
        opening && "pointer-events-none"
      )}
      style={
        opening
          ? { animation: "inv-envelope-exit 700ms ease-in 800ms both" }
          : undefined
      }
      role="dialog"
      aria-modal="true"
      aria-label={t("public.tapToOpen")}
    >
      <div className="w-full max-w-sm [perspective:1400px]">
        {/* The card that slides out from behind the flap */}
        <div
          className="relative mx-auto mb-[-58%] w-[86%] rounded-t-lg border border-(--inv-gold)/40 bg-(--inv-surface) px-5 pt-7 pb-24 text-center"
          style={
            opening ? { animation: "inv-card-out 900ms cubic-bezier(0.22,1,0.36,1) 500ms both" } : { opacity: 0 }
          }
        >
          <Romduol className="mx-auto size-7 text-(--inv-gold)" />
          <p className="mt-3 text-[0.7rem] tracking-[0.24em] text-(--inv-muted) uppercase">
            {t(`event.type.${event.type}`)}
          </p>
          <p
            className="mt-3 text-xl leading-snug text-(--inv-fg)"
            style={{
              fontFamily:
                locale === "km" ? "var(--inv-font-display-km)" : "var(--inv-font-display)",
            }}
          >
            {event.hosts.map((h) => L(h.name)).join(" & ")}
          </p>
        </div>

        {/* Envelope body */}
        <div className="relative">
          <div className="relative overflow-hidden rounded-lg bg-(--inv-accent) shadow-2xl">
            <div className="aspect-[3/2] w-full" />
            {/* Diagonal seams of the envelope back */}
            <svg
              aria-hidden="true"
              viewBox="0 0 300 200"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full text-(--inv-accent-contrast)"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.18"
            >
              <path d="M0 0l150 104L300 0M0 200l150-96 150 96" />
            </svg>
          </div>

          {/* Flap, folding back on open */}
          <div
            className="absolute inset-x-0 top-0 origin-top [transform-style:preserve-3d]"
            style={
              opening
                ? { animation: "inv-envelope-flap 700ms cubic-bezier(0.5,0,0.3,1) both" }
                : undefined
            }
          >
            <svg
              viewBox="0 0 300 104"
              preserveAspectRatio="none"
              aria-hidden="true"
              className="h-auto w-full drop-shadow-sm"
            >
              <path d="M0 0h300L150 104Z" className="fill-(--inv-accent)" />
              <path
                d="M0 0h300L150 104Z"
                className="fill-black"
                opacity="0.12"
              />
            </svg>
          </div>

          {/* Wax seal — the tap target */}
          <button
            type="button"
            onClick={open}
            disabled={opening}
            className={cn(
              "absolute top-[52%] left-1/2 z-10 flex size-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full",
              "bg-(--inv-gold) text-(--inv-accent) shadow-lg transition-transform outline-none",
              "hover:scale-105 focus-visible:ring-4 focus-visible:ring-(--inv-gold)/50 active:scale-95",
              opening && "opacity-0"
            )}
          >
            {/* The unalom is the sacred mark stamped on Khmer ceremonial
                documents — the right thing to press into wax. Falls back to
                the drawn romduol if the artwork is ever removed. */}
            <Motif
              assetId="khmer-unalom"
              fallback={<Romduol className="size-8" />}
              className="h-12 w-9"
            />
            <span className="sr-only">{t("public.tapToOpen")}</span>
          </button>
        </div>

        {/* Addressed to */}
        <div className={cn("mt-8 text-center transition-opacity", opening && "opacity-0")}>
          {guestName ? (
            <p className="text-base text-(--inv-fg)">{guestName}</p>
          ) : (
            <p className="text-base text-(--inv-fg)">{L(event.title)}</p>
          )}
          <p className="mt-1 text-sm text-(--inv-muted)">
            {formatDate(event.date, locale, "long")}
          </p>
          <KbachDivider className="mx-auto mt-4 h-4 w-32 text-(--inv-gold)" />
          <p className="mt-4 animate-pulse text-sm font-medium text-(--inv-accent)">
            {t("public.tapToOpen")}
          </p>
          {/* An intro nobody can dismiss is an intro that annoys. */}
          <button
            type="button"
            onClick={open}
            className="mt-3 inline-flex h-11 items-center justify-center rounded-full px-5 text-sm text-(--inv-muted) underline underline-offset-4 transition-colors outline-none hover:text-(--inv-fg) focus-visible:ring-3 focus-visible:ring-(--inv-accent)/40"
          >
            {t("public.skipIntro")}
          </button>
        </div>
      </div>
    </div>
  )
}

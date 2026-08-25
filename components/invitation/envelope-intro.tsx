"use client"

import * as React from "react"
import { useLocale } from "@/components/providers/locale-provider"
import { useHasMounted, useReducedMotion } from "./motion"
import { KbachDivider } from "./ornaments"
import { Romduol } from "./khmer-ornaments"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { EventRecord } from "@/lib/types"

type Phase = "sealed" | "opening" | "gone"

/**
 * The "tap to open" envelope.
 *
 * This is the bit a paper invitation cannot do, so it is worth getting right:
 * the guest sees a sealed envelope addressed to them, taps the wax seal, the
 * flap folds back and the card slides out.
 *
 * It is an overlay, never a gate — the invitation is already rendered
 * underneath. If JavaScript fails, the guest simply sees the card. Guests who
 * prefer reduced motion skip it entirely, and it only shows once per session so
 * it does not become an obstacle on a second visit.
 */
export function EnvelopeIntro({
  event,
  guestName,
  /** Changing this replays the intro — used by the builder's "replay" button. */
  replayKey = 0,
  enabled = true,
}: {
  event: EventRecord
  guestName?: string
  replayKey?: number
  enabled?: boolean
}) {
  const { t, L, locale } = useLocale()
  const reduced = useReducedMotion()
  const storageKey = `theabka.opened.${event.slug}`

  const mounted = useHasMounted()

  // Read once, in a lazy initialiser rather than an effect: reading it on every
  // render would hide the envelope the instant `open()` writes the flag, which
  // would cut the exit animation short.
  const [alreadySeen] = React.useState(() => {
    if (typeof window === "undefined") return false
    try {
      return sessionStorage.getItem(storageKey) === "1"
    } catch {
      return false
    }
  })

  const [phase, setPhase] = React.useState<Phase>("sealed")

  // Replaying (from the builder) puts the envelope back together.
  const [prevReplay, setPrevReplay] = React.useState(replayKey)
  if (replayKey !== prevReplay) {
    setPrevReplay(replayKey)
    setPhase("sealed")
  }

  const dismissed = alreadySeen && replayKey === 0
  const visible = mounted && enabled && !reduced && !dismissed && phase !== "gone"

  // The page behind must not scroll while the envelope covers it.
  React.useEffect(() => {
    if (!visible) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [visible])

  function open() {
    if (phase !== "sealed") return
    setPhase("opening")
    try {
      sessionStorage.setItem(storageKey, "1")
    } catch {
      /* private mode — the intro simply replays next time */
    }
    window.setTimeout(() => setPhase("gone"), 1500)
  }

  if (!visible) return null

  const opening = phase === "opening"

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-(--inv-bg) px-6",
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
            <Romduol className="size-8" />
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
        </div>
      </div>
    </div>
  )
}

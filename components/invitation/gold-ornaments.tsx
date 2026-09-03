"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { getNamePlate } from "@/lib/invitation/name-plates"

/**
 * The gold furniture of a Cambodian invitation.
 *
 * The plate, the button and the flourish are supplied artwork; the heart is
 * drawn, because a two-colour outline gains nothing from being a bitmap and
 * loses the ability to follow `--inv-gold` when a couple recolours the card.
 *
 * The two shaped pieces are nine-sliced rather than stretched. Both have to fit
 * text of unpredictable length, and scaling a carved end to fit a long Khmer
 * honorific smears the carving; slicing pins the ends at their true width and
 * grows only the flat middle.
 */

/**
 * The cartouche the guest's name sits in.
 *
 * Rendered as a background behind real text rather than as text inside an SVG,
 * so the name stays selectable, wraps, and is read aloud by a screen reader.
 */
export function NamePlate({
  children,
  className,
  variant = "gold",
  plateId,
}: {
  children: React.ReactNode
  className?: string
  /**
   * The template's own preference, used when the couple has not chosen one.
   * "ivory" suits a dark card: on a night ground the gold plate and the gold
   * type either side of it merge into a single bright band.
   */
  variant?: "gold" | "ivory"
  /** The couple's choice, from the builder. Wins over `variant`. */
  plateId?: string
}) {
  const plate = getNamePlate(plateId ?? variant)

  /*
   * The plate decides the ink, not the template.
   *
   * A filled bar is a painted surface, so the name is set in a dark brown that
   * belongs to the artwork. An open frame is just a rule around the text, which
   * on a cover means the name is sitting directly on the couple's photograph —
   * it needs the same light-on-dark treatment as everything else there. Left to
   * the template, one colour was hardcoded for both and the open frames came
   * out unreadable.
   */
  const ink =
    plate.ink === "onPlate"
      ? "text-[#5b4526]"
      : plate.ink === "onDark"
        // Already on a dark painted ground, so it needs the light ink but not
        // the heavy halo the open frames need over a photograph.
        ? "text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]"
        : "text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.85),0_2px_10px_rgba(0,0,0,0.6)]"

  if (!plate.file) {
    return (
      <div className={cn("mx-auto w-full max-w-sm text-center", className)}>
        <span className={ink}>{children}</span>
      </div>
    )
  }

  return (
    <div className={cn("relative mx-auto w-full max-w-sm", className)}>
      {/*
       * `border-image` rather than a stretched background: the plate has to fit
       * whatever name is put in it, and a stretched bitmap smears the carved
       * ends. Slicing pins them at their true width and grows only the middle.
       */}
      <div
        className="flex min-h-[3.25rem] items-center justify-center px-3 py-2"
        style={{
          borderStyle: "solid",
          borderWidth: `0 ${plate.capPx}px`,
          borderImageSource: `url(/${plate.file})`,
          borderImageSlice: `0 ${plate.slice} fill`,
          borderImageRepeat: "stretch",
        }}
      >
        {/* Pulled back over the caps: the ends are ornament, not margin, so a
            long name may sit under them rather than being squeezed between. */}
        <div
          className={cn("text-center", ink)}
          style={{ marginInline: `-${Math.round((plate.capPx ?? 0) * 0.6)}px` }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

/**
 * A gold kbach-shaped button.
 *
 * `render`-free on purpose: it wraps whatever anchor or button is passed as
 * children, so the calendar link stays a link and the map link stays a link.
 */
export function GoldPlaque({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-[3.25rem] min-w-[15rem] items-center justify-center px-2 py-2",
        className
      )}
      style={{
        borderStyle: "solid",
        borderWidth: "0 34px",
        borderImageSource: "url(/motifs/plaques/button-gold.png)",
        // ~34px of shaped end on a 400x89 source.
        borderImageSlice: "0 34 fill",
        borderImageRepeat: "stretch",
      }}
    >
      <span className="-mx-6 block text-center">{children}</span>
    </span>
  )
}

/**
 * The small gold flourish that separates one passage from the next.
 *
 * Two mirrored kbach curls around a centre bloom — the divider printed
 * invitations use between the invitation text and the schedule.
 */
export function GoldFlourish({ className }: { className?: string }) {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src="/motifs/dividers/divider--kbach-underline-wide.png"
      alt=""
      aria-hidden="true"
      className={cn("mx-auto h-auto w-44 max-w-full", className)}
      loading="lazy"
    />
  )
}

/** The outlined heart set between the two names. */
export function GoldHeart({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 30"
      className={cn("size-7", className)}
      aria-hidden="true"
      fill="none"
    >
      <path
        d="M16 27C9 21.5 3 16.8 3 10.8 3 6.5 6.3 3.5 10.2 3.5c2.4 0 4.6 1.2 5.8 3 1.2-1.8 3.4-3 5.8-3C25.7 3.5 29 6.5 29 10.8c0 6-6 10.7-13 16.2Z"
        stroke="var(--inv-gold)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

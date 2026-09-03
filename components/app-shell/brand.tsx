import Link from "next/link"
import { cn } from "@/lib/utils"

/**
 * The identity, as delivered by the design team (see `public/brand/README.md`).
 *
 * Drawn inline rather than loaded from `public/brand/mark/*.svg` because the
 * mark appears on nearly every screen: inline costs no request, inherits the
 * page's colours where a variant asks for it, and lets the ≤20px rule below be
 * enforced in code instead of remembered at each call site.
 *
 * The colours are fixed brand values, not theme tokens. A logo that restyled
 * itself when somebody switched between Angkor, Lotus and Studio would not be
 * a logo — the previous placeholder mark did exactly that.
 */
const GARNET = "#8c2f39"
const GOLD = "#c39b52"
const PARCHMENT = "#fdfaf4"
/** The gold the design team specifies once the ground goes dark. */
const GOLD_ON_DARK = "#e8c98a"

export type BrandVariant =
  /** Garnet outline, gold seal. The primary, for light grounds. */
  | "duo"
  /** Parchment outline, warm gold seal. For garnet or dark grounds. */
  | "reverse"
  /** Inherits `currentColor` — single-ink printing, or tinting to a surface. */
  | "mono"

/**
 * The Arch Card mark.
 *
 * Below 20px the outlined master fills in and reads as a blob, so the design
 * team supplied a solid silhouette for that range. `size` selects between them
 * rather than leaving it to whoever adds the next small placement.
 */
export function BrandMark({
  className,
  variant = "duo",
  size = 28,
}: {
  className?: string
  variant?: BrandVariant
  /** Rendered size in px. Drives the ≤20px silhouette swap. */
  size?: number
}) {
  const solid = size <= 20

  const ink =
    variant === "mono" ? "currentColor" : variant === "reverse" ? PARCHMENT : GARNET
  const seal = variant === "mono" ? "currentColor" : variant === "reverse" ? GOLD_ON_DARK : GOLD

  return (
    <svg
      /*
       * Not "0 0 100 100". The arch is drawn low in the delivered files — its
       * ink spans y 25–92, centred on 58.5 rather than 50 — so a box-centred
       * lockup puts the mark 8.5% of its height below the wordmark, which is
       * the tilt visible at 28px in the sidebar. Shifting the window down by
       * that 8.5 centres the ink instead, and leaves the path itself byte-for
       * byte the design team's own.
       */
      viewBox="0 8.5 100 100"
      role="img"
      aria-label="Theabka"
      className={cn("shrink-0", className)}
      style={{ width: size, height: size }}
    >
      {solid ? (
        // The seal dot is dropped with the outline: at this size it closes up
        // against the arch and only muddies the silhouette.
        <path d="M25 87 V47 Q50 13 75 47 V87 Z" fill={ink} />
      ) : (
        <>
          <path
            d="M25 87 V47 Q50 13 75 47 V87 Z"
            fill="none"
            stroke={ink}
            strokeWidth="10"
            strokeLinejoin="round"
          />
          <circle cx="50" cy="62" r="7.5" fill={seal} />
        </>
      )}
    </svg>
  )
}

/**
 * The wordmark.
 *
 * Live text rather than the supplied SVG: the delivered wordmark files carry
 * `<text>` rather than outlines, so rendering them through `<img>` would drop
 * to a fallback face wherever Quicksand had not loaded. As HTML the same
 * glyphs are selectable, searchable, and scale with the rest of the page.
 */
export function BrandWordmark({
  className,
  variant = "duo",
}: {
  className?: string
  variant?: BrandVariant
}) {
  return (
    <span
      className={cn("text-lg leading-none font-bold tracking-tight", className)}
      style={{
        fontFamily: "var(--font-quicksand), 'Trebuchet MS', sans-serif",
        color: variant === "mono" ? "currentColor" : variant === "reverse" ? PARCHMENT : GARNET,
      }}
    >
      Theabka
    </span>
  )
}

export function Brand({
  href = "/events",
  className,
  showWordmark = true,
  variant = "duo",
  size = 28,
}: {
  href?: string
  className?: string
  showWordmark?: boolean
  variant?: BrandVariant
  size?: number
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
    >
      <BrandMark variant={variant} size={size} />
      {showWordmark ? (
        <BrandWordmark variant={variant} />
      ) : (
        <span className="sr-only">Theabka</span>
      )}
    </Link>
  )
}

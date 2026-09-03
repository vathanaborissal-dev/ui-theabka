import type { CSSProperties } from "react"

import { EMERALD_BACKDROP_VIDEO } from "@/lib/invitation/backdrops"
import { getFontPairing } from "@/lib/invitation/fonts"
import { getPalette } from "@/lib/invitation/palettes"
import { getTemplate } from "@/lib/invitation/templates"
import type { InvitationDesign, Locale } from "@/lib/types"

/**
 * The couple's palette and typefaces, as the `--inv-*` custom properties every
 * invitation component reads.
 *
 * Extracted from the renderer because the invitation is no longer the only
 * thing that wears this. The disposable camera is a second page a guest opens
 * from the same wedding, and it should look like it belongs to the same one —
 * which means one definition of "what this couple's card looks like", not two
 * that drift the first time a colour override is added to either.
 */
export function invitationTheme(design: InvitationDesign, locale: Locale): CSSProperties {
  const template = getTemplate(design.templateId)
  const palette = getPalette(design.paletteId)
  const fonts = getFontPairing(design.fontPairingId ?? template.defaultFontPairingId)

  return {
    ...palette.vars,
    /*
     * Khmer and Latin do not share a display face — Moul, the face every
     * printed Cambodian wedding card is set in, has no Latin glyphs at all. So
     * the Khmer face leads when the card is being read in Khmer and the Latin
     * face follows as the fallback, which is per-glyph: a Khmer heading gets
     * Moul and an English name inside it still gets the serif, rather than the
     * browser's default.
     */
    "--inv-font-display":
      locale === "km" ? `${fonts.displayKhmer}, ${fonts.display}` : fonts.display,
    "--inv-font-display-km": fonts.displayKhmer,
    "--inv-font-body": fonts.body,
    /*
     * Free-form colour overrides sit last so they win over the palette.
     *
     * Only the two the couple actually chose are written: leaving the rest of
     * the palette in place keeps borders, surfaces and contrast colours
     * coherent with the pair, rather than deriving six values from two and
     * getting an unreadable card.
     */
    ...(design.primaryColor ? { "--inv-gold": design.primaryColor } : {}),
    ...(design.textColor
      ? {
          "--inv-fg": design.textColor,
          "--inv-accent": design.textColor,
          // Secondary copy needs to sit back from the primary without becoming
          // a second hue, so it is the same colour thinned toward the ground.
          "--inv-muted": `color-mix(in oklab, ${design.textColor} 78%, var(--inv-bg))`,
          "--inv-border": `color-mix(in oklab, ${design.textColor} 32%, var(--inv-bg))`,
        }
      : {}),
    fontFamily: fonts.body,
  } as CSSProperties
}

/**
 * Which backdrop this design asks for, resolved the same way for the card and
 * for the camera.
 *
 * The fallbacks are the interesting part: a design that names no backdrop gets
 * its template's, and the emerald template supplies its own loop, so choosing
 * that template is enough to get the look it is named for without the couple
 * uploading anything.
 */
export function backdropForDesign(design: InvitationDesign) {
  const template = getTemplate(design.templateId)
  return {
    backdropId: design.backdropId ?? template.defaultBackdrop,
    photo: design.coverPhoto,
    customPhoto: design.backdropPhoto,
    video:
      design.backdropVideo ?? (template.id === "marakot" ? EMERALD_BACKDROP_VIDEO : undefined),
  }
}

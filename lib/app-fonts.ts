/**
 * Interface typefaces the reader can choose between.
 *
 * Separate from `lib/invitation/fonts.ts`, which sets the couple's card. This
 * one dresses the app around it — sidebar, tables, headings, the figures on the
 * dashboard — and is a personal preference rather than part of the event.
 *
 * Every stack ends in the Khmer family. None of these Latin faces carries a
 * single Khmer glyph, and font-family fallback is per-glyph: without that last
 * entry a Khmer name in a guest list renders as boxes while the English around
 * it looks fine, which is the kind of breakage that only shows up in front of
 * a Cambodian user.
 */
export type AppFontId =
  | "theme"
  | "geist"
  | "inter"
  | "dm-sans"
  | "figtree"
  | "outfit"
  | "public-sans"
  | "nunito-sans"
  | "noto-sans"
  | "roboto"
  | "raleway"
  | "space-grotesk"
  | "jakarta"
  | "playfair"
  | "lora"
  | "merriweather"
  | "noto-serif"
  | "roboto-slab"
  | "source-serif"
  | "cormorant"
  | "geist-mono"
  | "jetbrains-mono"

export type AppFontCategory = "system" | "sans" | "serif" | "mono"

export type AppFont = {
  id: AppFontId
  name: string
  category: AppFontCategory
  /**
   * What the picker sets.
   *
   * A sans or mono face takes over the whole interface, headings included —
   * that is the flat, modern dashboard look, and it is what most people are
   * asking for when they say they want a different font.
   *
   * A serif takes the headings and the big figures only, and leaves the body
   * on a sans. Serif body copy in a dense table is a readability problem, not
   * a style choice, so the pairing is made here rather than left to be
   * discovered.
   */
  ui?: string
  display?: string
}

const KHMER = "var(--font-khmer-sans)"
/** Body face used behind every serif heading option. */
const SERIF_BODY = `var(--font-inter), ui-sans-serif, system-ui, ${KHMER}`

function sans(id: AppFontId, name: string, variable: string): AppFont {
  const stack = `var(${variable}), ui-sans-serif, system-ui, ${KHMER}`
  return { id, name, category: "sans", ui: stack, display: stack }
}

function mono(id: AppFontId, name: string, variable: string): AppFont {
  const stack = `var(${variable}), ui-monospace, monospace, ${KHMER}`
  return { id, name, category: "mono", ui: stack, display: stack }
}

function serif(id: AppFontId, name: string, variable: string): AppFont {
  return {
    id,
    name,
    category: "serif",
    ui: SERIF_BODY,
    display: `var(${variable}), ui-serif, Georgia, var(--font-khmer-serif-stack)`,
  }
}

export const APP_FONTS: AppFont[] = [
  // Leaves both variables alone so the theme's own pairing applies —
  // Angkor's Cormorant headings, Studio's grotesk, and so on.
  { id: "theme", name: "Theme default", category: "system" },

  sans("geist", "Geist", "--font-geist"),
  sans("inter", "Inter", "--font-inter"),
  sans("dm-sans", "DM Sans", "--font-dm-sans"),
  sans("figtree", "Figtree", "--font-figtree"),
  sans("outfit", "Outfit", "--font-outfit"),
  sans("public-sans", "Public Sans", "--font-public-sans"),
  sans("nunito-sans", "Nunito Sans", "--font-nunito-sans"),
  sans("noto-sans", "Noto Sans", "--font-noto-sans"),
  sans("roboto", "Roboto", "--font-roboto"),
  sans("raleway", "Raleway", "--font-raleway"),
  sans("space-grotesk", "Space Grotesk", "--font-space-grotesk"),
  sans("jakarta", "Plus Jakarta Sans", "--font-jakarta"),

  serif("playfair", "Playfair Display", "--font-playfair"),
  serif("lora", "Lora", "--font-lora"),
  serif("merriweather", "Merriweather", "--font-merriweather"),
  serif("noto-serif", "Noto Serif", "--font-noto-serif"),
  serif("roboto-slab", "Roboto Slab", "--font-roboto-slab"),
  serif("source-serif", "Source Serif", "--font-source-serif"),
  serif("cormorant", "Cormorant Garamond", "--font-cormorant"),

  mono("geist-mono", "Geist Mono", "--font-geist-mono"),
  mono("jetbrains-mono", "JetBrains Mono", "--font-jetbrains-mono"),
]

export const DEFAULT_FONT: AppFontId = "theme"
export const FONT_STORAGE_KEY = "theabka.font"

export const FONT_CATEGORY_LABELS: Record<AppFontCategory, string> = {
  system: "Default",
  sans: "Sans",
  serif: "Serif headings",
  mono: "Mono",
}

export function getAppFont(id: string): AppFont {
  return APP_FONTS.find((font) => font.id === id) ?? APP_FONTS[0]
}

/**
 * The `[data-font]` rules, generated from the catalogue rather than hand-kept
 * in `globals.css`, so adding a face here cannot leave the stylesheet behind.
 *
 * Qualified with `html` on purpose. Each theme sets `--font-display` from a
 * `[data-theme="…"]` block of equal specificity on the same element, so
 * without the extra tag these rules would win or lose on source order — and
 * the order the framework emits its stylesheet against an inlined <style> is
 * not something worth betting the typography on.
 */
export function appFontCss(): string {
  return APP_FONTS.filter((font) => font.ui || font.display)
    .map((font) => {
      const declarations = [
        font.ui ? `--font-ui:${font.ui};` : "",
        font.display ? `--font-display:${font.display};` : "",
      ].join("")
      return `html[data-font="${font.id}"]{${declarations}}`
    })
    .join("")
}

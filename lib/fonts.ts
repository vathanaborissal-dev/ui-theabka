import {
  Cormorant_Garamond,
  DM_Sans,
  Figtree,
  Geist,
  Geist_Mono,
  Great_Vibes,
  Inter,
  JetBrains_Mono,
  Kantumruy_Pro,
  Lora,
  Merriweather,
  Moul,
  Noto_Sans,
  Noto_Serif,
  Noto_Serif_Khmer,
  Nunito_Sans,
  Outfit,
  Playfair_Display,
  Plus_Jakarta_Sans,
  Public_Sans,
  Quicksand,
  Raleway,
  Roboto,
  Roboto_Slab,
  Source_Serif_4,
  Space_Grotesk,
} from "next/font/google"

/** UI sans — Latin. */
export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

/** Display grotesk used by the `lotus` and `studio` themes. */
export const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
})

/** Display serif used by the `angkor` theme and several invitation templates. */
export const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

/** Alternate invitation serif. */
export const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
})

/** Modern Khmer sans — the Khmer UI face across the app. */
export const kantumruy = Kantumruy_Pro({
  variable: "--font-kantumruy",
  subsets: ["khmer", "latin"],
  display: "swap",
})

/** Khmer serif for invitation body copy. */
export const notoKhmerSerif = Noto_Serif_Khmer({
  variable: "--font-noto-khmer-serif",
  subsets: ["khmer"],
  display: "swap",
})

/**
 * English script, for cards that set a Khmer line in Moul and repeat it in
 * English underneath. Latin only — it has no Khmer glyphs, so it is always
 * paired rather than used alone.
 */
export const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
})

/**
 * The wordmark's face.
 *
 * Set by the identity, not by the theme: "Theabka" is drawn in Quicksand
 * wherever it appears, so the logo does not change shape when somebody
 * switches the interface typeface.
 */
export const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
})

/** Moul is the traditional Khmer display face seen on printed wedding cards. */
export const moul = Moul({
  variable: "--font-moul",
  subsets: ["khmer"],
  weight: "400",
  display: "swap",
})

/* ---------------------------------------------------------------------------
   Pickable interface faces.
 *
 * Declared here but not applied: next/font emits an @font-face and a CSS
 * variable per family, and the browser only fetches the files a rule actually
 * renders with. Since exactly one of these is selected at a time, listing them
 * all costs a few lines of CSS rather than a dozen downloads.
 *
 * Latin subsets only. None of these families ship Khmer glyphs, so every
 * stack in `lib/app-fonts.ts` ends in the Khmer face — see the note there.
   --------------------------------------------------------------------------- */

export const geist = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap" })
export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
})
export const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"], display: "swap" })
export const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"], display: "swap" })
export const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"], display: "swap" })
export const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  display: "swap",
})
export const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  display: "swap",
})
export const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  display: "swap",
})
export const roboto = Roboto({ variable: "--font-roboto", subsets: ["latin"], display: "swap" })
export const raleway = Raleway({ variable: "--font-raleway", subsets: ["latin"], display: "swap" })
export const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
})
export const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
})
export const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  display: "swap",
})
export const robotoSlab = Roboto_Slab({
  variable: "--font-roboto-slab",
  subsets: ["latin"],
  display: "swap",
})
export const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  display: "swap",
})
export const lora = Lora({ variable: "--font-lora", subsets: ["latin"], display: "swap" })
export const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
})

export const fontVariables = [
  inter.variable,
  jakarta.variable,
  cormorant.variable,
  playfair.variable,
  kantumruy.variable,
  notoKhmerSerif.variable,
  moul.variable,
  greatVibes.variable,
  quicksand.variable,
  geist.variable,
  geistMono.variable,
  dmSans.variable,
  figtree.variable,
  outfit.variable,
  publicSans.variable,
  nunitoSans.variable,
  notoSans.variable,
  roboto.variable,
  raleway.variable,
  spaceGrotesk.variable,
  jetbrainsMono.variable,
  notoSerif.variable,
  robotoSlab.variable,
  merriweather.variable,
  lora.variable,
  sourceSerif.variable,
].join(" ")

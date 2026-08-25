import {
  Cormorant_Garamond,
  Inter,
  Kantumruy_Pro,
  Moul,
  Noto_Serif_Khmer,
  Playfair_Display,
  Plus_Jakarta_Sans,
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

/** Moul is the traditional Khmer display face seen on printed wedding cards. */
export const moul = Moul({
  variable: "--font-moul",
  subsets: ["khmer"],
  weight: "400",
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
].join(" ")

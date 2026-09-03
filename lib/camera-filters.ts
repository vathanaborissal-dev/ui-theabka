import type { LocalizedText } from "@/lib/types"

/**
 * The look of the film.
 *
 * Applied when a photo is *delivered*, never when it is stored. The original a
 * guest shot is kept exactly as it arrived, and the look is a few characters in
 * the URL — so the couple can change their mind after the wedding, or take the
 * filter off entirely, and the photographs underneath are untouched. A filter
 * burnt in at upload time would be a decision nobody could revisit, made on a
 * phone, about somebody's wedding.
 *
 * The ids are the only thing that crosses the wire. The transform strings live
 * here and are looked up locally, because these end up inside a URL that the
 * image host will execute: an id chosen from a fixed list cannot smuggle a
 * transformation of its own.
 */
/**
 * Every look on offer. The art-preset ids are the image host's own names for
 * its colour grades — kept verbatim, so what is stored says exactly which
 * grade was chosen and nothing has to be translated back.
 */
export type CameraFilterId = string

export type CameraFilter = {
  id: CameraFilterId
  name: LocalizedText
  /** Cloudinary transformation, or "" for the untouched photograph. */
  transform: string
  /**
   * The same look as a CSS filter, for previewing on an image the transform
   * cannot reach.
   *
   * Real photos are always on the image host and get the transform above; a
   * cover photo hosted elsewhere, or the bundled sample, is served from a URL
   * no transformation applies to — and five identical thumbnails are worse
   * than an approximate five, because they say the filters do nothing.
   *
   * An approximation on purpose: grain is left out, since it would not survive
   * a thumbnail anyway.
   */
  css: string
  /** How dark the corners go in that approximation, 0–1. */
  vignette: number
}

/*
 * What makes a single-use camera look the way it does, in order of how much
 * each one matters: a hard on-camera flash that falls off at the edges, an
 * amber cast from cheap daylight film, grain, and more contrast than the scene
 * actually had. The recipes below are those four dials at different settings.
 */
export const CAMERA_FILTERS: CameraFilter[] = [
  /*
   * The three built by hand, from the four things a single-use camera actually
   * does: a hard flash that falls off at the edges, an amber cast from cheap
   * daylight film, grain, and more contrast than the scene had.
   */
  {
    id: "disposable",
    name: { en: "Disposable", km: "កាមេរ៉ាប្រើម្តង" },
    transform:
      "e_contrast:22,e_brightness:8,co_rgb:ffd9a0,e_colorize:10,e_vignette:45,e_noise:20",
    css: "contrast(1.15) brightness(1.06) saturate(0.95) sepia(0.18)",
    vignette: 0.45,
  },
  {
    id: "flash",
    name: { en: "Hard flash", km: "ពន្លឺហ្វ្លាស" },
    transform:
      "e_contrast:26,e_brightness:10,co_rgb:ffcf8f,e_colorize:14,e_vignette:55,e_noise:30",
    css: "contrast(1.22) brightness(1.09) saturate(0.9) sepia(0.24)",
    vignette: 0.58,
  },
  {
    id: "faded",
    name: { en: "Sun-faded", km: "ស្រអាប់ដោយពន្លឺថ្ងៃ" },
    transform: "e_sepia:22,e_brightness:6,e_contrast:-6,e_noise:14,e_vignette:20",
    css: "sepia(0.32) brightness(1.05) contrast(0.94)",
    vignette: 0.2,
  },

  /*
   * And the image host's own colour grades, exactly as they render — no grain
   * or falloff added on top, so what the couple picks is what they saw when
   * they compared them. Names are the host's; the thumbnail is what anyone
   * actually chooses by.
   */
  {
    id: "al_dente",
    name: { en: "Al dente", km: "Al dente" },
    transform: "e_art:al_dente",
    css: "",
    vignette: 0,
  },
  {
    id: "athena",
    name: { en: "Athena", km: "Athena" },
    transform: "e_art:athena",
    css: "",
    vignette: 0,
  },
  {
    id: "audrey",
    name: { en: "Audrey", km: "Audrey" },
    transform: "e_art:audrey",
    css: "",
    vignette: 0,
  },
  {
    id: "aurora",
    name: { en: "Aurora", km: "Aurora" },
    transform: "e_art:aurora",
    css: "",
    vignette: 0,
  },
  {
    id: "daguerre",
    name: { en: "Daguerre", km: "Daguerre" },
    transform: "e_art:daguerre",
    css: "",
    vignette: 0,
  },
  {
    id: "eucalyptus",
    name: { en: "Eucalyptus", km: "Eucalyptus" },
    transform: "e_art:eucalyptus",
    css: "",
    vignette: 0,
  },
  {
    id: "fes",
    name: { en: "Fes", km: "Fes" },
    transform: "e_art:fes",
    css: "",
    vignette: 0,
  },
  {
    id: "frost",
    name: { en: "Frost", km: "Frost" },
    transform: "e_art:frost",
    css: "",
    vignette: 0,
  },
  {
    id: "hairspray",
    name: { en: "Hairspray", km: "Hairspray" },
    transform: "e_art:hairspray",
    css: "",
    vignette: 0,
  },
  {
    id: "hokusai",
    name: { en: "Hokusai", km: "Hokusai" },
    transform: "e_art:hokusai",
    css: "",
    vignette: 0,
  },
  {
    id: "incognito",
    name: { en: "Incognito", km: "Incognito" },
    transform: "e_art:incognito",
    css: "",
    vignette: 0,
  },
  {
    id: "linen",
    name: { en: "Linen", km: "Linen" },
    transform: "e_art:linen",
    css: "",
    vignette: 0,
  },
  {
    id: "peacock",
    name: { en: "Peacock", km: "Peacock" },
    transform: "e_art:peacock",
    css: "",
    vignette: 0,
  },
  {
    id: "primavera",
    name: { en: "Primavera", km: "Primavera" },
    transform: "e_art:primavera",
    css: "",
    vignette: 0,
  },
  {
    id: "quartz",
    name: { en: "Quartz", km: "Quartz" },
    transform: "e_art:quartz",
    css: "",
    vignette: 0,
  },
  {
    id: "red_rock",
    name: { en: "Red rock", km: "Red rock" },
    transform: "e_art:red_rock",
    css: "",
    vignette: 0,
  },
  {
    id: "refresh",
    name: { en: "Refresh", km: "Refresh" },
    transform: "e_art:refresh",
    css: "",
    vignette: 0,
  },
  {
    id: "sizzle",
    name: { en: "Sizzle", km: "Sizzle" },
    transform: "e_art:sizzle",
    css: "",
    vignette: 0,
  },
  {
    id: "sonnet",
    name: { en: "Sonnet", km: "Sonnet" },
    transform: "e_art:sonnet",
    css: "",
    vignette: 0,
  },
  {
    id: "ukulele",
    name: { en: "Ukulele", km: "Ukulele" },
    transform: "e_art:ukulele",
    css: "",
    vignette: 0,
  },
  {
    id: "zorro",
    name: { en: "Zorro", km: "Zorro" },
    transform: "e_art:zorro",
    css: "",
    vignette: 0,
  },

  {
    id: "none",
    name: { en: "No filter", km: "គ្មានតម្រង" },
    transform: "",
    css: "none",
    vignette: 0,
  },
]

/**
 * Looks that were offered under a name of our own before the host's full set
 * was exposed. Kept so a camera already set to one keeps the look it was set
 * to, rather than silently reverting to the default.
 */
const RETIRED_IDS: Record<string, string> = {
  golden: "ukulele",
  sunlit: "athena",
  airy: "aurora",
  blush: "sonnet",
  leak: "sizzle",
  coolfilm: "fes",
  classic: "daguerre",
  mono: "daguerre",
}

/** The look a wedding gets when nobody chooses: the one the feature is named for. */
export const DEFAULT_CAMERA_FILTER: CameraFilterId = "disposable"

export function getCameraFilter(id?: string | null): CameraFilter {
  const wanted = id ? (RETIRED_IDS[id] ?? id) : id
  return (
    CAMERA_FILTERS.find((filter) => filter.id === wanted) ??
    CAMERA_FILTERS.find((filter) => filter.id === DEFAULT_CAMERA_FILTER)!
  )
}

/**
 * The transformation for a filter id, or "" — safe to drop straight into a
 * delivery URL, because an unknown id resolves to a known filter rather than to
 * whatever was passed in.
 */
export function cameraFilterTransform(id?: string | null): string {
  return getCameraFilter(id).transform
}

/**
 * Where the picker takes its example from.
 *
 * The couple's own cover photo when they have one — they are judging a look for
 * their wedding, so it should be their faces — and this stand-in when they do
 * not. Not a camera photo: early on there are none, and the first one to arrive
 * is as likely to be a blurred table as anything worth judging by.
 *
 * Point `NEXT_PUBLIC_FILTER_SAMPLE` at a copy on the image host and every
 * preview becomes the real transformation rather than the CSS approximation —
 * worth doing, because several of these looks are hand-tuned colour grades that
 * CSS can only gesture at. The bundled file is the fallback.
 */
export const FILTER_SAMPLE_PHOTO =
  process.env.NEXT_PUBLIC_FILTER_SAMPLE || "/motifs/couple/couple--preview.jpg"

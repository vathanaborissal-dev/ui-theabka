"use client"

import * as React from "react"
import {Check, Image as ImageIcon, Pause, Play, Upload} from "lucide-react"
import { BrandSpinner } from "@/components/brand/brand-spinner"
import { useLocale } from "@/components/providers/locale-provider"
import { PALETTES } from "@/lib/invitation/palettes"
import { FONT_PAIRINGS } from "@/lib/invitation/fonts"
import { PATTERNS, PatternBackground, type PatternId } from "@/components/invitation/patterns"
import { templatesFor, type InvitationTemplate } from "@/lib/invitation/templates"
import { cn } from "@/lib/utils"
import { PHOTO_FRAMES } from "@/components/invitation/photo-frame"
import { Motif } from "@/components/invitation/motif"
import { KhmerCouple } from "@/components/invitation/khmer-motifs"
import { motifsIn, type MotifCategory } from "@/lib/invitation/motif-assets"
import { BACKDROPS, getBackdrop } from "@/lib/invitation/backdrops"
import { NAME_PLATES } from "@/lib/invitation/name-plates"
import { MUSIC_TRACKS } from "@/lib/invitation/music"
import { uploadAudio } from "@/lib/uploads"
import { Button } from "@/components/ui/button"
import type {
  BackdropId,
  EventType,
  NamePlateId,
  OrnamentLevel,
  PhotoFrameId,
} from "@/lib/types"

export function TemplatePicker({
  eventType,
  value,
  onChange,
}: {
  eventType: EventType
  value: string
  onChange: (id: string) => void
}) {
  const { locale } = useLocale()
  const templates = templatesFor(eventType)

  return (
    /*
     * Two across, thumbnail over name.
     *
     * As a single stacked column each card ran the full width with a paragraph
     * of description, so twelve templates were roughly six screens of scrolling
     * before the palette — in the tab where the palette is the next thing you
     * reach for. A template is chosen by how it looks, so the picture carries
     * the choice and the description moves to a tooltip.
     */
    <ul className="grid grid-cols-2 gap-2.5">
      {templates.map((template) => {
        const selected = template.id === value
        return (
          <li key={template.id}>
            <button
              type="button"
              onClick={() => onChange(template.id)}
              aria-pressed={selected}
              title={`${template.name[locale]} — ${template.description[locale]}`}
              className={cn(
                "group relative block w-full overflow-hidden rounded-[var(--card-radius)] border text-left transition-[border-color,background-color,transform] outline-none active:scale-[0.99] focus-visible:ring-3 focus-visible:ring-ring/50",
                selected
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:border-foreground/30 hover:bg-muted/35"
              )}
            >
              <span className="relative block overflow-hidden border-b border-border/70">
                <TemplateThumb template={template} />
                {selected ? (
                  <span className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                    <Check className="size-3" aria-hidden="true" />
                  </span>
                ) : null}
              </span>
              <span className="block min-w-0 px-2.5 py-2">
                <span className="block truncate text-[0.8125rem] font-semibold">
                  {template.name[locale]}
                </span>
                {template.tag ? (
                  <span className="mt-0.5 block truncate text-[0.625rem] font-medium text-primary">
                    {template.tag[locale]}
                  </span>
                ) : null}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

/** Abstract miniature — conveys layout, not content. */
function TemplateThumb({ template }: { template: InvitationTemplate }) {
  const base = "block aspect-4/5 w-full p-3"

  // The bordered card's whole identity is the band, so the miniature shows the
  // real artwork rather than an abstraction of it.
  if (template.preview === "bordered") {
    return (
      <span
        className={cn(base, "flex items-center justify-center bg-[oklch(0.977_0.012_60)]")}
        style={{
          borderStyle: "solid",
          borderWidth: "10px",
          borderImageSource: "url(/motifs/frames/border--kbach-red-gold.png)",
          borderImageSlice: "92",
          borderImageRepeat: "round",
          padding: 0,
        }}
      >
        <span className="flex flex-col items-center gap-1.5">
          <span className="h-2 w-12 rounded-sm bg-[oklch(0.42_0.13_22)]" />
          <span className="h-2 w-10 rounded-sm bg-[oklch(0.42_0.13_22)]" />
          <span className="mt-1 h-px w-8 bg-[oklch(0.68_0.1_76)]" />
        </span>
      </span>
    )
  }

  // A photo cover with type over it, on a phone-shaped card — the thing that
  // makes this template different is the proportion, so the thumb keeps it.
  if (template.preview === "scroll") {
    return (
      <span className={cn(base, "relative overflow-hidden p-0")}>
        <span className="absolute inset-0 bg-linear-to-b from-[oklch(0.55_0.06_150)] via-[oklch(0.7_0.05_120)] to-[oklch(0.4_0.05_150)]" />
        <span className="absolute inset-0 bg-linear-to-b from-black/45 via-transparent to-black/60" />
        <span className="relative flex h-full w-full flex-col items-center justify-between py-3">
          <span className="flex flex-col items-center gap-1">
            <span className="h-1.5 w-10 rounded-sm bg-[oklch(0.82_0.11_78)]" />
            <span className="mt-1 h-2 w-14 rounded-sm bg-white/95" />
            <span className="h-2 w-11 rounded-sm bg-white/95" />
          </span>
          <span className="flex flex-col items-center gap-1">
            <span className="h-1 w-8 rounded-full bg-white/70" />
            <span className="h-1 w-12 rounded-full bg-[oklch(0.82_0.11_78)]" />
            <span className="mt-1.5 h-3 w-px bg-white/60" />
          </span>
        </span>
      </span>
    )
  }

  // Gold on a dark, moving ground — the two things that make this one what it is.
  if (template.preview === "night-video") {
    return (
      <span className={cn(base, "relative overflow-hidden bg-[oklch(0.18_0.02_260)] p-0")}>
        <span className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_0%,oklch(0.42_0.07_70)_0%,transparent_65%)]" />
        <span className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/70 to-transparent" />
        <span className="relative flex h-full w-full flex-col items-center justify-center gap-1.5">
          <span className="h-2 w-14 rounded-sm bg-linear-to-r from-[#facc15] via-[#fde047] to-[#ca8a04]" />
          <span className="h-2 w-11 rounded-sm bg-linear-to-r from-[#facc15] via-[#fde047] to-[#ca8a04]" />
          <span className="mt-1 h-px w-12 bg-white/40" />
          <span className="mt-1.5 h-3.5 w-16 rounded-[2px] bg-white/85" />
          {/* the play glyph, because the background moves */}
          <span className="absolute right-1.5 bottom-1.5 flex size-4 items-center justify-center rounded-full bg-black/55">
            <span className="ml-px size-0 border-y-[3px] border-l-[5px] border-y-transparent border-l-white/90" />
          </span>
        </span>
      </span>
    )
  }

  // Emerald ground, gold rule, a script line under a Khmer one — the three
  // things that identify this card at thumbnail size.
  if (template.preview === "emerald") {
    return (
      <span className={cn(base, "relative overflow-hidden bg-[oklch(0.96_0.012_150)] p-0")}>
        <span className="absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_0%,oklch(0.33_0.075_165)/0.16_0%,transparent_70%)]" />
        <span className="relative flex h-full w-full flex-col items-center justify-center gap-1.5 px-2">
          <span className="h-2 w-14 rounded-sm bg-[oklch(0.33_0.075_165)]" />
          <span className="h-1.5 w-10 rounded-full bg-[oklch(0.33_0.075_165)]/55" />
          <span className="my-1 flex items-center gap-1">
            <span className="h-px w-5 bg-[oklch(0.72_0.12_82)]" />
            <span className="text-[6px] text-[oklch(0.72_0.12_82)]">◆</span>
            <span className="h-px w-5 bg-[oklch(0.72_0.12_82)]" />
          </span>
          <span className="h-4 w-16 rounded-[3px] border-2 border-[oklch(0.72_0.12_82)] bg-[oklch(0.36_0.09_162)]" />
        </span>
      </span>
    )
  }

  if (template.preview === "ornate") {
    return (
      <span className={cn(base, "bg-[oklch(0.973_0.013_84)]")}>
        <span className="flex h-full w-full flex-col items-center justify-center gap-1.5 border border-[oklch(0.68_0.1_76)]/50 p-2">
          <span className="h-1 w-6 rounded-full bg-[oklch(0.5_0.03_45)]/40" />
          <span className="h-2 w-14 rounded-sm bg-[oklch(0.42_0.13_22)]" />
          <span className="h-2 w-12 rounded-sm bg-[oklch(0.42_0.13_22)]" />
          <span className="mt-1 h-px w-10 bg-[oklch(0.68_0.1_76)]" />
          <span className="h-1 w-8 rounded-full bg-[oklch(0.5_0.03_45)]/40" />
        </span>
      </span>
    )
  }

  if (template.preview === "arch") {
    return (
      <span className={cn(base, "relative overflow-hidden bg-[oklch(0.976_0.014_320)] p-0")}>
        <span className="absolute inset-0 bg-linear-to-b from-[oklch(0.58_0.085_322)]/12 to-[oklch(0.75_0.105_80)]/15" />
        <span className="relative flex h-full w-full flex-col items-center justify-end p-2">
          <span className="absolute inset-x-2 top-2 bottom-0 rounded-t-full border border-[oklch(0.75_0.105_80)]/80" />
          <span className="absolute top-1.5 left-1 size-3 rounded-full bg-[oklch(0.72_0.06_140)]/50" />
          <span className="absolute top-1.5 right-1 size-3 rounded-full bg-[oklch(0.72_0.06_140)]/50" />
          <span className="relative mb-1 h-2 w-8 rounded-sm bg-[oklch(0.58_0.085_322)]" />
          <span className="relative mb-2 h-2 w-6 rounded-sm bg-[oklch(0.58_0.085_322)]" />
          <span className="relative flex gap-0.5">
            <span className="h-5 w-2.5 rounded-t-full bg-[oklch(0.3_0.04_320)]" />
            <span className="h-5 w-2.5 rounded-t-full bg-[oklch(0.75_0.105_80)]" />
          </span>
        </span>
      </span>
    )
  }

  if (template.preview === "royal") {
    return (
      <span className={cn(base, "bg-[oklch(0.985_0.004_280)] p-2")}>
        <span className="flex h-full w-full flex-col items-center justify-center gap-1.5 border-2 border-[oklch(0.32_0.14_282)] p-1.5">
          <span className="flex h-full w-full flex-col items-center justify-center gap-1.5 border border-[oklch(0.72_0.11_85)]/70">
            <span className="size-4 rounded-full border border-[oklch(0.72_0.11_85)]" />
            <span className="h-2 w-14 rounded-sm bg-[oklch(0.32_0.14_282)]" />
            <span className="h-1 w-10 rounded-full bg-[oklch(0.48_0.045_282)]/50" />
            <span className="mt-0.5 h-3 w-16 rounded-[1px] border border-[oklch(0.72_0.11_85)]/70" />
          </span>
        </span>
      </span>
    )
  }

  if (template.preview === "silk") {
    return (
      <span className={cn(base, "relative overflow-hidden bg-[oklch(0.35_0.11_275)] p-2")}>
        <span className="absolute -top-5 -right-8 h-32 w-24 rotate-[28deg] rounded-full border-[7px] border-[oklch(0.75_0.11_85)]/20" />
        <span className="absolute -bottom-7 -left-6 h-28 w-20 -rotate-[28deg] rounded-full border-[6px] border-[oklch(0.75_0.11_85)]/20" />
        <span className="relative flex h-full w-full flex-col items-center justify-center gap-1.5 border border-[oklch(0.75_0.11_85)]/75 p-2">
          <span className="size-5 rounded-full border border-[oklch(0.75_0.11_85)]/90" />
          <span className="h-2 w-14 rounded-sm bg-[oklch(0.985_0.008_275)]" />
          <span className="h-1 w-10 rounded-full bg-[oklch(0.75_0.11_85)]/80" />
          <span className="mt-1 h-px w-12 bg-[oklch(0.75_0.11_85)]/70" />
        </span>
      </span>
    )
  }

  if (template.preview === "temple") {
    return (
      <span className={cn(base, "relative overflow-hidden bg-[oklch(0.955_0.016_72)]")}>
        <span className="absolute inset-0 text-[oklch(0.7_0.085_68)] opacity-25">
          <PatternBackground pattern="temple" scale={0.45} />
        </span>
        <span className="relative flex h-full w-full flex-col items-center justify-center gap-1.5 border border-[oklch(0.7_0.085_68)]/50 p-2">
          <svg viewBox="0 0 240 112" className="h-4 w-auto fill-[oklch(0.44_0.055_48)]">
            <path d="M34 82c0-16 2-28 10-36 8 8 10 20 10 36ZM186 82c0-16 2-28 10-36 8 8 10 20 10 36ZM67 82c0-20 2-38 13-52 11 14 13 32 13 52ZM147 82c0-20 2-38 13-52 11 14 13 32 13 52ZM103 82c0-24 3-48 17-74 14 26 17 50 17 74ZM18 82h204l-7 7H25Zm7 7h190v9H25Z" />
          </svg>
          <span className="mt-0.5 h-2 w-14 rounded-sm bg-[oklch(0.265_0.028_50)]" />
          <span className="h-2 w-11 rounded-sm bg-[oklch(0.265_0.028_50)]" />
          <span className="mt-0.5 h-px w-10 bg-[oklch(0.7_0.085_68)]" />
        </span>
      </span>
    )
  }

  if (template.preview === "floral") {
    return (
      <span className={cn(base, "relative overflow-hidden bg-[oklch(0.975_0.018_80)]")}>
        <span className="absolute inset-0 text-[oklch(0.52_0.15_52)] opacity-20">
          <PatternBackground pattern="romduol" scale={0.4} />
        </span>
        <span className="relative flex h-full w-full flex-col items-center justify-center gap-1.5">
          <svg viewBox="0 0 40 40" className="size-4 fill-[oklch(0.755_0.125_74)]">
            <g transform="translate(20 20)">
              <path d="M0 0C-7-4-9-11 0-17 9-11 7-4 0 0Z" />
              <path transform="rotate(120)" d="M0 0C-7-4-9-11 0-17 9-11 7-4 0 0Z" />
              <path transform="rotate(240)" d="M0 0C-7-4-9-11 0-17 9-11 7-4 0 0Z" />
            </g>
          </svg>
          <span className="h-2 w-14 rounded-sm bg-[oklch(0.255_0.032_48)]" />
          <span className="h-2 w-10 rounded-sm bg-[oklch(0.255_0.032_48)]" />
          <span className="mt-0.5 h-px w-12 bg-[oklch(0.52_0.15_52)]/50" />
        </span>
      </span>
    )
  }

  if (template.preview === "night") {
    return (
      <span className={cn(base, "relative overflow-hidden bg-[oklch(0.185_0.025_55)] p-2")}>
        <span className="grid h-full grid-cols-[0.9fr_1fr] items-center gap-2">
          <span className="h-[82%] rounded-t-full border border-[oklch(0.84_0.1_84)]/70 bg-linear-to-b from-[oklch(0.47_0.04_60)] to-[oklch(0.23_0.03_55)]" />
          <span className="flex flex-col gap-1.5">
            <span className="h-1 w-8 rounded-full bg-[oklch(0.84_0.1_84)]/55" />
            <span className="h-2 w-full rounded-sm bg-[oklch(0.955_0.014_78)]/90" />
            <span className="h-2 w-4/5 rounded-sm bg-[oklch(0.955_0.014_78)]/90" />
            <span className="mt-1 h-px w-full bg-[oklch(0.84_0.1_84)]/55" />
          </span>
        </span>
      </span>
    )
  }

  if (template.preview === "editorial") {
    return (
      <span className={cn(base, "bg-[oklch(0.968_0.009_75)]")}>
        <span className="flex h-full w-full flex-col justify-center gap-1.5">
          <span className="h-1 w-5 rounded-full bg-[oklch(0.52_0.018_60)]/40" />
          <span className="h-2.5 w-full rounded-sm bg-[oklch(0.36_0.022_60)]" />
          <span className="h-2.5 w-2/3 rounded-sm bg-[oklch(0.36_0.022_60)]" />
          <span className="mt-1.5 h-px w-full bg-[oklch(0.36_0.022_60)]/25" />
          <span className="flex gap-1">
            <span className="h-1 flex-1 rounded-full bg-[oklch(0.52_0.018_60)]/30" />
            <span className="h-1 flex-1 rounded-full bg-[oklch(0.52_0.018_60)]/30" />
          </span>
        </span>
      </span>
    )
  }

  if (template.preview === "photo") {
    return (
      <span className={cn(base, "bg-[oklch(0.175_0.022_265)] p-0")}>
        <span className="relative flex h-full w-full flex-col justify-end bg-linear-to-t from-[oklch(0.175_0.022_265)] via-[oklch(0.35_0.03_265)] to-[oklch(0.55_0.04_265)] p-3">
          <span className="h-2.5 w-4/5 rounded-sm bg-white/90" />
          <span className="mt-1.5 h-1 w-1/2 rounded-full bg-white/50" />
        </span>
      </span>
    )
  }

  return (
    <span className={cn(base, "bg-white")}>
      <span className="flex h-full w-full flex-col items-center justify-center gap-2">
        <span className="size-3 rounded-full bg-[oklch(0.5_0.006_265)]/30" />
        <span className="h-2 w-14 rounded-sm bg-[oklch(0.28_0.006_265)]" />
        <span className="h-px w-8 bg-[oklch(0.28_0.006_265)]/30" />
        <span className="h-1 w-10 rounded-full bg-[oklch(0.5_0.006_265)]/35" />
      </span>
    </span>
  )
}

export function PalettePicker({
  value,
  onChange,
}: {
  value: string
  onChange: (id: string) => void
}) {
  const { locale } = useLocale()

  return (
    <ul className="grid grid-cols-4 gap-2">
      {PALETTES.map((palette) => {
        const selected = palette.id === value
        return (
          <li key={palette.id}>
            <button
              type="button"
              onClick={() => onChange(palette.id)}
              aria-pressed={selected}
              className={cn(
                "w-full rounded-[var(--btn-radius)] border p-2 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                selected ? "border-primary ring-1 ring-primary" : "border-border hover:border-foreground/25"
              )}
            >
              <span className="flex justify-center gap-0.5" aria-hidden="true">
                {palette.swatch.map((color, i) => (
                  <span
                    key={i}
                    className="size-4 rounded-full ring-1 ring-black/10"
                    style={{ background: color }}
                  />
                ))}
              </span>
              <span className="mt-1.5 block truncate text-center text-[0.6875rem] text-muted-foreground">
                {palette.name[locale]}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

/** Type pairing picker — each option previews itself in both scripts. */
export function FontPairingPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (id: string) => void
}) {
  const { locale } = useLocale()

  return (
    <ul className="grid gap-2">
      {FONT_PAIRINGS.map((pairing) => {
        const selected = pairing.id === value
        return (
          <li key={pairing.id}>
            <button
              type="button"
              onClick={() => onChange(pairing.id)}
              aria-pressed={selected}
              className={cn(
                "flex w-full items-center gap-3 rounded-[var(--btn-radius)] border px-3 py-2.5 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                selected
                  ? "border-primary ring-1 ring-primary"
                  : "border-border hover:border-foreground/25"
              )}
            >
              <span
                lang="km"
                className="shrink-0 text-xl leading-tight"
                style={{ fontFamily: pairing.displayKhmer }}
              >
                {pairing.sample.km}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{pairing.name[locale]}</span>
                {/* Wraps rather than truncates. These are one short sentence
                    each and the whole point of them is to say what the pairing
                    is for — "The traditional Khmer wedding-ca…" tells a couple
                    nothing they could not see from the sample beside it. */}
                <span className="block text-xs text-muted-foreground">
                  {pairing.description[locale]}
                </span>
              </span>
              {selected ? <Check className="size-4 shrink-0 text-primary" /> : null}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

/** Background pattern picker, each swatch rendering the actual tile. */
export function PatternPicker({
  value,
  onChange,
}: {
  value: PatternId
  onChange: (id: PatternId) => void
}) {
  const { locale } = useLocale()

  return (
    <ul className="grid grid-cols-3 gap-2">
      {PATTERNS.map((pattern) => {
        const selected = pattern.id === value
        return (
          <li key={pattern.id}>
            <button
              type="button"
              onClick={() => onChange(pattern.id)}
              aria-pressed={selected}
              className={cn(
                "w-full overflow-hidden rounded-[var(--btn-radius)] border transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                selected
                  ? "border-primary ring-1 ring-primary"
                  : "border-border hover:border-foreground/25"
              )}
            >
              <span className="relative block h-12 bg-muted/40 text-primary">
                {pattern.id === "none" ? (
                  <span className="flex h-full items-center justify-center">
                    <span className="size-4 rounded-full border border-muted-foreground/35" />
                  </span>
                ) : (
                  <PatternBackground pattern={pattern.id} scale={0.55} className="opacity-70" />
                )}
              </span>
              <span className="block truncate px-1.5 py-1 text-center text-[0.6875rem] text-muted-foreground">
                {pattern.name[locale]}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

/** How ornate the template should be. */
export function OrnamentPicker({
  value,
  onChange,
}: {
  value: OrnamentLevel
  onChange: (level: OrnamentLevel) => void
}) {
  const { t } = useLocale()
  const levels: OrnamentLevel[] = ["none", "subtle", "rich"]

  return (
    <div className="flex gap-2" role="group" aria-label={t("inv.ornaments")}>
      {levels.map((level) => (
        <button
          key={level}
          type="button"
          onClick={() => onChange(level)}
          aria-pressed={value === level}
          className={cn(
            "flex-1 rounded-[var(--btn-radius)] border px-3 py-2 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            value === level
              ? "border-primary bg-primary/8 font-medium text-foreground"
              : "border-border text-muted-foreground hover:bg-muted"
          )}
        >
          {t(`inv.ornament.${level}`)}
        </button>
      ))}
    </div>
  )
}

/** Generic labelled option row, used by the motion controls. */
export function OptionRow<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T
  onChange: (value: T) => void
  options: Array<{ id: T; label: string }>
  label: string
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          aria-pressed={value === option.id}
          className={cn(
            "rounded-full border px-3 py-1.5 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            value === option.id
              ? "border-primary bg-primary/8 font-medium text-foreground"
              : "border-border text-muted-foreground hover:bg-muted"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

/** Photo frame picker — each swatch draws the actual silhouette. */
export function PhotoFramePicker({
  value,
  onChange,
}: {
  value: PhotoFrameId
  onChange: (id: PhotoFrameId) => void
}) {
  const { locale } = useLocale()

  const shapes: Record<PhotoFrameId, string> = {
    none: "rounded-none",
    rounded: "rounded-lg",
    arch: "rounded-t-full",
    oval: "rounded-[50%]",
    circle: "rounded-full",
    lotus: "[clip-path:polygon(50%_0,100%_38%,82%_100%,18%_100%,0_38%)]",
    polaroid: "rounded-none ring-4 ring-white",
    gold: "rounded-lg ring-2 ring-gold",
    kbach: "rounded-lg",
  }

  return (
    <ul className="grid grid-cols-3 gap-2">
      {PHOTO_FRAMES.map((frame) => {
        const selected = frame.id === value
        return (
          <li key={frame.id}>
            <button
              type="button"
              onClick={() => onChange(frame.id)}
              aria-pressed={selected}
              className={cn(
                "flex w-full flex-col items-center gap-1.5 rounded-[var(--btn-radius)] border p-2.5 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                selected ? "border-primary ring-1 ring-primary" : "border-border hover:border-foreground/25"
              )}
            >
              <span className="relative flex h-10 w-8 items-end justify-center">
                <span
                  className={cn(
                    "h-9 w-7 bg-linear-to-b from-primary/45 to-primary/15",
                    shapes[frame.id]
                  )}
                />
                {frame.id === "kbach" ? (
                  <>
                    <span className="absolute top-0 left-0 size-2 border-t border-l border-gold" />
                    <span className="absolute right-0 bottom-0 size-2 border-r border-b border-gold" />
                  </>
                ) : null}
              </span>
              <span className="truncate text-[0.6875rem] text-muted-foreground">
                {frame.name[locale]}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}


/**
 * Picks the couple illustration. Hidden entirely until artwork has been added
 * to `public/motifs/couple/` and registered, so the builder never shows an
 * empty control.
 */
export function CoupleMotifPicker({
  value,
  onChange,
}: {
  value?: string
  onChange: (id: string | undefined) => void
}) {
  const { locale, t } = useLocale()
  const options = motifsIn("couple")
  if (options.length === 0) return null

  const items = [{ id: undefined as string | undefined, label: t("inv.coupleDrawn") }].concat(
    options.map((asset) => ({ id: asset.id as string | undefined, label: asset.name[locale] }))
  )

  return (
    <ul className="grid grid-cols-3 gap-2">
      {items.map((item) => {
        const selected = value === item.id
        const asset = options.find((o) => o.id === item.id)
        return (
          <li key={item.id ?? "drawn"}>
            <button
              type="button"
              onClick={() => onChange(item.id)}
              aria-pressed={selected}
              className={cn(
                "w-full overflow-hidden rounded-[var(--btn-radius)] border p-2 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                selected
                  ? "border-primary ring-1 ring-primary"
                  : "border-border hover:border-foreground/25"
              )}
            >
              <span className="flex h-16 items-center justify-center">
                <Motif
                  assetId={asset?.id}
                  fallback={<KhmerCouple className="h-full w-auto" />}
                />
              </span>
              <span className="mt-1 block truncate text-center text-[0.6875rem] text-muted-foreground">
                {item.label}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

/**
 * Picks supplied artwork for a slot that has a drawn fallback — dividers and
 * crests. Shows nothing until artwork exists for the category, and always
 * offers "drawn" as the first option so the hand-drawn motif stays reachable.
 */
export function MotifSlotPicker({
  category,
  value,
  onChange,
  drawnLabel,
}: {
  category: MotifCategory
  value?: string
  onChange: (id: string | undefined) => void
  drawnLabel: string
}) {
  const { locale } = useLocale()
  const options = motifsIn(category)
  if (options.length === 0) return null

  const items = [{ id: undefined as string | undefined, label: drawnLabel }].concat(
    options.map((asset) => ({ id: asset.id as string | undefined, label: asset.name[locale] }))
  )

  return (
    <ul className="grid grid-cols-2 gap-2">
      {items.map((item) => {
        const selected = value === item.id
        return (
          <li key={item.id ?? "drawn"}>
            <button
              type="button"
              onClick={() => onChange(item.id)}
              aria-pressed={selected}
              className={cn(
                "w-full overflow-hidden rounded-[var(--btn-radius)] border p-2 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                selected
                  ? "border-primary ring-1 ring-primary"
                  : "border-border hover:border-foreground/25"
              )}
            >
              <span className="flex h-10 items-center justify-center">
                {item.id ? (
                  <Motif assetId={item.id} fallback={null} />
                ) : (
                  <span className="h-px w-8 bg-muted-foreground/35" />
                )}
              </span>
              <span className="mt-1 block truncate text-center text-[0.6875rem] text-muted-foreground">
                {item.label}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}


/**
 * The layer behind the whole card.
 *
 * Each swatch renders the real thing rather than a colour chip, because a
 * backdrop is defined by its gradient — a flat sample of it would make every
 * option look the same.
 */
export function BackdropPicker({
  value,
  onChange,
  hasPhoto,
}: {
  value: BackdropId
  onChange: (id: BackdropId) => void
  /** "Your cover photo" is offered only when there is one. */
  hasPhoto: boolean
}) {
  const { locale } = useLocale()
  const options = BACKDROPS.filter((b) => b.id !== "photo" || hasPhoto)

  return (
    <ul className="grid grid-cols-3 gap-2">
      {options.map((backdrop) => {
        const selected = backdrop.id === value
        return (
          <li key={backdrop.id}>
            <button
              type="button"
              onClick={() => onChange(backdrop.id)}
              aria-pressed={selected}
              className={cn(
                "w-full overflow-hidden rounded-[var(--btn-radius)] border transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                selected
                  ? "border-primary ring-1 ring-primary"
                  : "border-border hover:border-foreground/25"
              )}
            >
              <span
                className="relative block h-12 bg-muted/40"
                style={getBackdrop(backdrop.id).css}
              >
                {backdrop.id === "none" ? (
                  <span className="flex h-full items-center justify-center">
                    <span className="size-4 rounded-full border border-muted-foreground/35" />
                  </span>
                ) : null}
                {backdrop.id === "photo" ? (
                  <span className="flex h-full items-center justify-center text-[0.6875rem] text-muted-foreground">
                    <ImageIcon className="size-4" aria-hidden="true" />
                  </span>
                ) : null}
              </span>
              <span className="block truncate px-1.5 py-1 text-center text-[0.6875rem] text-muted-foreground">
                {backdrop.name[locale]}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

/**
 * Which track loops behind the card.
 *
 * The built-in list may be empty — no music ships until it is licensed — so
 * "None" and "Your own track" are always present and the picker is useful on
 * day one either way.
 */
export function MusicPicker({
  musicId,
  musicUrl,
  onChange,
  eventId,
}: {
  musicId?: string
  musicUrl?: string
  onChange: (next: { musicId?: string; musicUrl?: string }) => void
  /** Where an uploaded track is filed. */
  eventId: string
}) {
  const { t, locale } = useLocale()
  const custom = Boolean(musicUrl)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = React.useState<number | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  async function upload(file: File | undefined) {
    if (!file) return
    setError(null)
    setUploading(0)
    try {
      const { url } = await uploadAudio(file, {
        eventId,
        onProgress: (p) => setUploading(p.ratio === null ? 0 : Math.round(p.ratio * 100)),
      })
      onChange({ musicId: undefined, musicUrl: url })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("inv.musicUploadFailed"))
    } finally {
      setUploading(null)
    }
  }

  return (
    <div className="space-y-2">
      <ul className="space-y-1.5">
        <li>
          <MusicOption
            label={t("inv.musicNone")}
            selected={!custom && !musicId}
            onSelect={() => onChange({ musicId: undefined, musicUrl: undefined })}
          />
        </li>
        {MUSIC_TRACKS.map((track) => (
          <li key={track.id}>
            <MusicOption
              label={track.name[locale]}
              hint={track.credit}
              selected={!custom && musicId === track.id}
              onSelect={() => onChange({ musicId: track.id, musicUrl: undefined })}
              preview={`/${track.file}`}
            />
          </li>
        ))}
        <li>
          <MusicOption
            label={t("inv.musicOwn")}
            hint={custom ? musicUrl : undefined}
            selected={custom}
            onSelect={() => inputRef.current?.click()}
            preview={custom ? musicUrl : undefined}
          />
        </li>
      </ul>

      {/* The file picker is the primary way in; the URL box below is for a
          track already hosted somewhere. */}
      <input
        ref={inputRef}
        type="file"
        accept="audio/mpeg,audio/mp4,audio/aac,audio/ogg,audio/wav,.mp3,.m4a,.aac,.ogg,.wav"
        className="sr-only"
        onChange={(e) => {
          void upload(e.target.files?.[0])
          // Cleared so choosing the same file twice still fires a change.
          e.target.value = ""
        }}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading !== null}
          onClick={() => inputRef.current?.click()}
        >
          {uploading !== null ? <BrandSpinner /> : <Upload />}
          {uploading !== null
            ? `${t("inv.musicUploading")} ${uploading}%`
            : t("inv.musicUpload")}
        </Button>
        {custom ? (
          <button
            type="button"
            onClick={() => onChange({ musicId: undefined, musicUrl: undefined })}
            className="px-2 py-1 text-xs text-muted-foreground underline underline-offset-4 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {t("action.delete")}
          </button>
        ) : null}
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      <input
        type="url"
        inputMode="url"
        value={musicUrl ?? ""}
        onChange={(e) => onChange({ musicId: undefined, musicUrl: e.target.value || undefined })}
        placeholder={t("inv.musicUrl")}
        aria-label={t("inv.musicUrl")}
        className="h-9 w-full rounded-[var(--btn-radius)] border border-border bg-background px-3 text-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      />
    </div>
  )
}

function MusicOption({
  label,
  hint,
  selected,
  onSelect,
  preview,
}: {
  label: string
  hint?: string
  selected: boolean
  onSelect: () => void
  /** Lets the track be heard before it is chosen. */
  preview?: string
}) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-1 rounded-[var(--btn-radius)] border transition-colors",
        selected ? "border-primary ring-1 ring-primary" : "border-border hover:border-foreground/25"
      )}
    >
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className="flex min-w-0 flex-1 items-center gap-2.5 rounded-[var(--btn-radius)] px-3 py-2.5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-full border",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"
        )}
        aria-hidden="true"
      >
        {selected ? <Check className="size-3" /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm">{label}</span>
        {hint ? (
          <span className="block truncate text-xs text-muted-foreground">{hint}</span>
        ) : null}
      </span>
    </button>
    {preview ? <TrackPreviewButton src={preview} label={label} /> : null}
    </div>
  )
}

/**
 * Plays one track, and stops any other that is playing.
 *
 * A list of tracks where two can sound at once is unusable, and the couple is
 * choosing between them — so starting one is also the instruction to stop the
 * last.
 */
function TrackPreviewButton({ src, label }: { src: string; label: string }) {
  const { t } = useLocale()
  const ref = React.useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = React.useState(false)
  const [missing, setMissing] = React.useState(false)

  if (missing) return null

  return (
    <>
      <audio
        ref={ref}
        src={src}
        preload="none"
        onPlay={() => {
          document.querySelectorAll("audio").forEach((other) => {
            if (other !== ref.current) other.pause()
          })
          setPlaying(true)
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        // A track whose file has not been added yet simply offers no control,
        // rather than a play button that does nothing when pressed.
        onError={() => setMissing(true)}
      />
      <button
        type="button"
        aria-label={`${playing ? t("public.musicPause") : t("public.musicPlay")}: ${label}`}
        onClick={() => {
          const audio = ref.current
          if (!audio) return
          if (audio.paused) void audio.play().catch(() => setMissing(true))
          else audio.pause()
        }}
        className="mr-1.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
      </button>
    </>
  )
}


/**
 * A free-form colour, as a swatch and a hex field.
 *
 * The native colour input is the swatch itself rather than sitting beside one:
 * it is the only control every phone renders as its own colour wheel. The hex
 * field is there because couples arrive with a hex from a florist or a dress
 * shop, and picking it back out of a wheel by eye is hopeless.
 */
export function ColourField({
  label,
  value,
  fallback,
  onChange,
}: {
  label: string
  value?: string
  /** Shown when nothing is set, so the swatch is never an empty box. */
  fallback: string
  onChange: (hex: string | undefined) => void
}) {
  const { t } = useLocale()
  const current = value ?? fallback
  const id = React.useId()

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={normaliseHex(current) ?? "#c8a24a"}
          onChange={(e) => onChange(e.target.value)}
          className="size-9 shrink-0 cursor-pointer rounded-[var(--btn-radius)] border border-border bg-background p-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <input
          type="text"
          inputMode="text"
          spellCheck={false}
          value={value ?? ""}
          placeholder={fallback}
          aria-label={label}
          onChange={(e) => onChange(e.target.value.trim() || undefined)}
          className="h-9 min-w-0 flex-1 rounded-[var(--btn-radius)] border border-border bg-background px-3 font-mono text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="shrink-0 px-2 py-1 text-xs text-muted-foreground underline underline-offset-4 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {t("inv.resetColour")}
          </button>
        ) : null}
      </div>
    </div>
  )
}

/**
 * The native colour input accepts `#rrggbb` and nothing else. Palettes are
 * written in oklch, and a couple may type a name or a short hex, so anything
 * it cannot show falls back rather than making the swatch go black.
 */
function normaliseHex(value: string): string | undefined {
  const hex = value.trim()
  if (/^#[0-9a-f]{6}$/i.test(hex)) return hex
  if (/^#[0-9a-f]{3}$/i.test(hex)) {
    return "#" + hex.slice(1).split("").map((c) => c + c).join("")
  }
  return undefined
}


/**
 * Which frame the guest's name sits in.
 *
 * Each swatch renders the real artwork around a sample name rather than a
 * label: the plates differ only in their carving, and a list of names
 * ("Gold bar", "Scroll frame") tells you nothing about which one suits the card.
 */
export function NamePlatePicker({
  value,
  onChange,
}: {
  value?: NamePlateId
  onChange: (id: NamePlateId) => void
}) {
  const { t, locale } = useLocale()

  return (
    <ul className="grid gap-2">
      {NAME_PLATES.map((plate) => {
        const selected = (value ?? "gold") === plate.id
        return (
          <li key={plate.id}>
            <button
              type="button"
              onClick={() => onChange(plate.id)}
              aria-pressed={selected}
              className={cn(
                "flex w-full items-center gap-3 rounded-[var(--btn-radius)] border px-3 py-2 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                selected
                  ? "border-primary ring-1 ring-primary"
                  : "border-border hover:border-foreground/25"
              )}
            >
              <span className="min-w-0 flex-1">
                {plate.file ? (
                  <span
                    className="flex min-h-9 items-center justify-center px-1"
                    style={{
                      borderStyle: "solid",
                      borderWidth: `0 ${Math.round((plate.capPx ?? 40) * 0.7)}px`,
                      borderImageSource: `url(/${plate.file})`,
                      borderImageSlice: `0 ${plate.slice} fill`,
                      borderImageRepeat: "stretch",
                    }}
                  >
                    <span
                      className={cn(
                        "truncate text-xs",
                        plate.ink === "onPlate" ? "text-[#5b4526]" : "text-foreground"
                      )}
                      style={{ marginInline: `-${Math.round((plate.capPx ?? 40) * 0.45)}px` }}
                    >
                      {t("public.honourGeneric")}
                    </span>
                  </span>
                ) : (
                  <span className="block truncate py-2 text-center text-xs text-muted-foreground">
                    {t("public.honourGeneric")}
                  </span>
                )}
              </span>
              <span className="w-24 shrink-0 truncate text-left text-xs text-muted-foreground">
                {plate.name[locale]}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

"use client"

import { Check } from "lucide-react"
import { useLocale } from "@/components/providers/locale-provider"
import { PALETTES } from "@/lib/invitation/palettes"
import { FONT_PAIRINGS } from "@/lib/invitation/fonts"
import { PATTERNS, PatternBackground, type PatternId } from "@/components/invitation/patterns"
import { templatesFor, type InvitationTemplate } from "@/lib/invitation/templates"
import { cn } from "@/lib/utils"
import { PHOTO_FRAMES } from "@/components/invitation/photo-frame"
import { Motif } from "@/components/invitation/motif"
import { KhmerCouple } from "@/components/invitation/khmer-motifs"
import { motifsIn } from "@/lib/invitation/motif-assets"
import type { EventType, OrnamentLevel, PhotoFrameId } from "@/lib/types"

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
    <ul className="grid grid-cols-2 gap-3">
      {templates.map((template) => {
        const selected = template.id === value
        return (
          <li key={template.id}>
            <button
              type="button"
              onClick={() => onChange(template.id)}
              aria-pressed={selected}
              className={cn(
                "group w-full overflow-hidden rounded-[var(--card-radius)] border text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                selected
                  ? "border-primary ring-1 ring-primary"
                  : "border-border hover:border-foreground/25"
              )}
            >
              <span className="relative block">
                <TemplateThumb template={template} />
                {selected ? (
                  <span className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3" aria-hidden="true" />
                  </span>
                ) : null}
              </span>
              <span className="block p-2.5">
                <span className="flex items-center gap-1.5">
                  <span className="text-sm font-medium">{template.name[locale]}</span>
                  {template.tag ? (
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[0.625rem] text-muted-foreground">
                      {template.tag[locale]}
                    </span>
                  ) : null}
                </span>
                <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                  {template.description[locale]}
                </span>
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
      <span className={cn(base, "relative overflow-hidden bg-[oklch(0.185_0.025_55)] p-0")}>
        <span className="relative flex h-full w-full flex-col justify-end bg-linear-to-t from-[oklch(0.185_0.025_55)] via-[oklch(0.3_0.035_58)] to-[oklch(0.45_0.04_60)] p-3">
          <span className="mb-1.5 h-px w-full bg-[oklch(0.84_0.1_84)]/70" />
          <span className="h-2.5 w-4/5 rounded-sm bg-[oklch(0.955_0.014_78)]/90" />
          <span className="mt-1.5 h-1 w-1/2 rounded-full bg-[oklch(0.84_0.1_84)]/60" />
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
                <span className="block truncate text-xs text-muted-foreground">
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
                  <span className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    —
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

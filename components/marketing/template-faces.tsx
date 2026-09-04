"use client"

import * as React from "react"
import { NamePlate } from "@/components/invitation/gold-ornaments"
import { PedimentArch, Romduol, FlowerGarland } from "@/components/invitation/khmer-ornaments"
import { KbachCorner, KbachDivider } from "@/components/invitation/ornaments"
import { PatternBackground, type PatternId } from "@/components/invitation/patterns"
import { QrCode } from "@/components/share/qr-code"
import { Photo } from "@/components/shared/photo"
import { getTemplate, type TemplateId } from "@/lib/invitation/templates"
import { PAPER_GROUND } from "@/lib/invitation/palettes"
import type { Locale } from "@/lib/types"
import { cn } from "@/lib/utils"

/*
 * Hero-sized restatements of the invitation templates.
 *
 * Not the templates themselves: those are full pages that take an event, a
 * guest and the locale context, run an envelope intro and a video backdrop,
 * and render a dozen sections. None of that fits in a 350px card.
 *
 * What each face does instead is reproduce the handful of decisions that make
 * its template recognisable — the ground it sits on, how the names are set,
 * which ornament opens the card — taken from the real template component
 * rather than invented. Recolouring one layout six times, which is what this
 * did before, shows a palette rather than a template.
 */

const PHOTO =
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=70"

type FaceProps = {
  locale: Locale
  /** Present only on the card at the front of the deck. */
  qrValue?: string
}

export function TemplateFace({
  templateId,
  ...props
}: FaceProps & { templateId: TemplateId }) {
  switch (getTemplate(templateId).preview) {
    case "emerald":
      return <MarakotFace {...props} />
    case "scroll":
      return <SompeahFace {...props} />
    case "night-video":
      return <ChhayaFace {...props} />
    case "bordered":
      return <KbachFace {...props} />
    case "silk":
      return <SbaiFace {...props} />
    case "floral":
      return <RomduolFace {...props} />
    default:
      return <PlainFace {...props} />
  }
}

/* -------------------------------------------------------------------------
 * Shared type. Secondary lines step back with opacity rather than a second
 * colour, so one set of components works on a cream card and on a night one.
 * ----------------------------------------------------------------------- */

function Eyebrow({ locale, className }: { locale: Locale; className?: string }) {
  return (
    // `lang` so the global script rule drops the tracking on Khmer, which
    // splits consonant clusters from their subscripts.
    <p lang={locale} className={cn("text-[0.6rem] tracking-[0.3em] uppercase", className)}>
      {locale === "km" ? "សិរីមង្គល" : "Invitation"}
    </p>
  )
}

/**
 * The couple, set the way the templates set them: one paragraph, the two names
 * joined by a small gold "និង".
 *
 * Not two lines stacked around a script ampersand. That was a block three lines
 * deep, and Khmer names vary enough in length that it has to be free to wrap —
 * which it cannot do inside a plate built for a single line.
 */
function CoupleNames({
  locale,
  size = "text-[1.3rem]",
  sep,
  className,
}: {
  locale: Locale
  size?: string
  sep?: string
  className?: string
}) {
  return (
    <p
      className={cn("font-khmer-display leading-[1.45] text-balance", size, className)}
      lang="km"
    >
      សុខ រិទ្ធី
      <span className={cn("mx-1.5 text-[0.62em]", sep)} lang={locale}>
        {locale === "km" ? "និង" : "and"}
      </span>
      មាស ស្រីនាង
    </p>
  )
}

/**
 * The invited guest, in the cartouche the plated templates are built around.
 *
 * One short line at the size the real templates use. `NamePlate` is a bar for a
 * guest's name — nine-sliced so its carved ends stay true — and the couple's
 * names do not belong in it.
 */
function GuestPlate({
  locale,
  variant,
  plateId,
  labelClassName,
}: {
  locale: Locale
  variant?: "gold" | "ivory"
  plateId?: string
  labelClassName?: string
}) {
  return (
    <div className="mt-4">
      <p
        lang={locale}
        className={cn("text-[0.55rem] tracking-[0.2em] uppercase", labelClassName)}
      >
        {/* The app's own wording for this line — `public.honour`. */}
        {locale === "km" ? "សូមគោរពអញ្ជើញ" : "Respectfully inviting"}
      </p>
      <NamePlate variant={variant} plateId={plateId} className="mt-1.5">
        <p className="text-[0.85rem] leading-snug text-balance" lang={locale}>
          {locale === "km" ? "លោក ចាន់ សុភា និងភរិយា" : "Mr & Mrs Chan Sophea"}
        </p>
      </NamePlate>
    </div>
  )
}

function When({ locale, className }: { locale: Locale; className?: string }) {
  return (
    <div className={className}>
      <p className="text-sm" lang={locale}>
        {locale === "km" ? "ថ្ងៃសៅរ៍ ទី១៧ ខែតុលា ឆ្នាំ២០២៦" : "Saturday, 17 October 2026"}
      </p>
      <p className="mt-0.5 text-xs opacity-70" lang={locale}>
        {locale === "km" ? "កោះពេជ្រ រាជធានីភ្នំពេញ" : "Diamond Island, Phnom Penh"}
      </p>
    </div>
  )
}

/**
 * The QR compartment, shared by every face.
 *
 * The box is held open on the cards that have no code so the deck does not
 * change height as it deals — the front card is the tallest, and every other
 * card is stretched to match it by the grid.
 */
function ScanStrip({
  locale,
  qrValue,
  foreground,
  className,
}: FaceProps & { foreground: string; className?: string }) {
  return (
    <div className={cn("mt-auto flex min-h-16 items-center gap-3.5 pt-5 text-left", className)}>
      {qrValue ? (
        <QrCode value={qrValue} className="size-16 shrink-0" foreground={foreground} />
      ) : (
        <span aria-hidden="true" className="size-16 shrink-0" />
      )}
      <div className="min-w-0" lang={locale}>
        <p className="text-[0.7rem] leading-snug font-medium">
          {locale === "km" ? "ស្កេនដើម្បីឆ្លើយតប" : "Scan to reply"}
        </p>
        <p className="mt-1 text-[0.65rem] leading-snug opacity-70">
          {locale === "km" ? "មិនត្រូវការកម្មវិធី ឬគណនី" : "No app, no account"}
        </p>
      </div>
    </div>
  )
}

/** A paper card: the palette's surface over its own ground over the card. */
function Paper({
  pattern,
  children,
  className,
}: {
  pattern: PatternId
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      style={{ backgroundImage: PAPER_GROUND }}
      className={cn("relative flex h-full flex-col text-[var(--inv-fg)]", className)}
    >
      <PatternBackground
        pattern={pattern}
        scale={0.75}
        opacity={0.05}
        className="text-[var(--inv-accent)]"
      />
      {children}
    </div>
  )
}

/* -------------------------------------------------------------------------
 * The faces.
 * ----------------------------------------------------------------------- */

/** Marakot — emerald and gold, the guest in the emerald cartouche, dated block. */
function MarakotFace({ locale, qrValue }: FaceProps) {
  return (
    <Paper pattern="none" className="px-6 pt-8 pb-6 text-center">
      <div className="relative flex h-full flex-col">
      {/* `mt-auto` here and on the scan strip: the two auto margins split the
          card's free space evenly, so the type sits centred in the space above
          the strip rather than clustering against the top edge. */}
        <Eyebrow locale={locale} className="mt-auto opacity-70" />

        <CoupleNames locale={locale} size="text-[1.2rem]" sep="text-[var(--inv-gold)]" className="mt-4" />
        <GuestPlate locale={locale} plateId="emerald" labelClassName="opacity-60" />

        <div className="mt-4 flex items-center justify-center gap-2 text-[var(--inv-gold)]">
          <span className="h-px w-8 bg-current" />
          <span className="text-[0.5rem]">◆</span>
          <span className="h-px w-8 bg-current" />
        </div>

        {/* The month calendar is this template's signature, so the date gets
            the bordered block rather than a bare line. */}
        <div className="mt-3 border border-[var(--inv-gold)]/70 px-4 py-2">
          <When locale={locale} />
        </div>

        <ScanStrip
          locale={locale}
          qrValue={qrValue}
          foreground="var(--inv-fg)"
          className="border-t border-[var(--inv-gold)]/30"
        />
      </div>
    </Paper>
  )
}

/** Sompeah — a full-bleed cover photo with the type over it. */
function SompeahFace({ locale, qrValue }: FaceProps) {
  return (
    <div className="relative flex h-full flex-col text-white">
      <Photo
        src={PHOTO}
        alt=""
        rounded={false}
        sizes="(min-width: 1024px) 22rem, 90vw"
        className="absolute inset-0 h-full w-full"
      />
      {/* Scrim weighted to the ends, where the eyebrow and the scan strip sit.
          The middle stays light enough for the photograph to read — it is the
          whole point of this template — and the date carries its own shadow. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-b from-black/55 via-black/12 to-black/80"
      />

      <div className="relative flex h-full flex-col px-6 pt-8 pb-6 text-center">
        <Eyebrow locale={locale} className="text-[var(--inv-gold)]" />

        <div className="mt-3 [text-shadow:0_1px_5px_rgba(0,0,0,0.75)]">
          <CoupleNames locale={locale} size="text-[1.2rem]" sep="text-[var(--inv-gold)]" className="mt-4" />
        </div>
        <GuestPlate locale={locale} labelClassName="text-[var(--inv-gold)]" />

        <When locale={locale} className="mt-4 [text-shadow:0_1px_4px_rgba(0,0,0,0.75)]" />

        <ScanStrip
          locale={locale}
          qrValue={qrValue}
          // A code punched out of a photograph will not scan. It gets its own
          // opaque chip below rather than being drawn straight onto the image.
          foreground="#1a1a1a"
          className="border-t border-white/25 [&>svg]:rounded-sm [&>svg]:bg-white [&>svg]:p-1"
        />
      </div>
    </div>
  )
}

/** Chhaya — gold type on a moving night ground. */
function ChhayaFace({ locale, qrValue }: FaceProps) {
  return (
    <div className="relative flex h-full flex-col bg-[oklch(0.18_0.02_260)] text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_0%,oklch(0.42_0.07_70)_0%,transparent_65%)]"
      />

      <div className="relative flex h-full flex-col px-6 pt-8 pb-6 text-center">
        <Eyebrow locale={locale} className="text-[#e8c98a]" />

        {/* "ivory" on a night card: the gold plate and gold type either side of
            it merge into one bright band, which is why the real template
            switches the plate here too. */}
        <CoupleNames locale={locale} size="text-[1.2rem]" sep="text-[#e8c98a]" className="mt-4" />
        <GuestPlate locale={locale} variant="ivory" labelClassName="text-[#e8c98a]" />

        <div className="mt-4 rounded-sm bg-white/90 px-4 py-2.5 text-[oklch(0.2_0.02_260)]">
          <When locale={locale} />
        </div>

        <ScanStrip
          locale={locale}
          qrValue={qrValue}
          foreground="#1a1a1a"
          className="border-t border-white/20 [&>svg]:rounded-sm [&>svg]:bg-white [&>svg]:p-1"
        />

        {/* The ground moves, so the card says so. */}
        <span
          aria-hidden="true"
          className="absolute right-3 bottom-3 flex size-4 items-center justify-center rounded-full bg-white/20"
        >
          <span className="ml-px size-0 border-y-[3px] border-l-[5px] border-y-transparent border-l-white/90" />
        </span>
      </div>
    </div>
  )
}

/** Kbach — the carved band is the whole identity, so it is the real artwork. */
function KbachFace({ locale, qrValue }: FaceProps) {
  return (
    <Paper
      pattern="none"
      className="text-center"
      // Nine-sliced exactly as the template does it: the corner carvings keep
      // their proportions and only the straight runs repeat.
    >
      <div
        className="relative flex h-full flex-col px-4 pt-5 pb-4"
        style={{
          borderStyle: "solid",
          borderWidth: "22px",
          borderImageSource: "url(/motifs/frames/border--kbach-red-gold.png)",
          borderImageSlice: "92",
          borderImageRepeat: "round",
        }}
      >
        <Eyebrow locale={locale} className="mt-auto opacity-70" />
        <CoupleNames locale={locale} size="text-[1.25rem]" sep="text-[var(--inv-gold)]" className="mt-4" />
        <KbachDivider className="mx-auto mt-3 h-3.5 w-24 text-[var(--inv-gold)]" />
        <When locale={locale} className="mt-3" />

        <ScanStrip
          locale={locale}
          qrValue={qrValue}
          foreground="var(--inv-fg)"
          className="border-t border-[var(--inv-gold)]/30"
        />
      </div>
    </Paper>
  )
}

/** Sbai — a light blessing card laid on royal silk. */
function SbaiFace({ locale, qrValue }: FaceProps) {
  return (
    <div className="relative flex h-full flex-col bg-[var(--inv-accent)] p-3">
      {/* The silk: broad gold rings running off the edges of the card. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="absolute -top-10 -right-8 size-32 rotate-[28deg] rounded-full border-[10px] border-[var(--inv-gold)]/15" />
        <span className="absolute -bottom-12 -left-10 size-32 -rotate-[24deg] rounded-full border-[9px] border-[var(--inv-gold)]/15" />
      </div>

      <div className="relative flex h-full flex-col border border-[var(--inv-gold)]/80 bg-[var(--inv-bg)] p-1.5 text-[var(--inv-fg)]">
        <div className="relative flex h-full flex-col border border-[var(--inv-gold)]/50 px-5 pt-5 pb-4 text-center">
          <PedimentArch className="mx-auto mt-auto h-12 w-full max-w-[11rem] text-[var(--inv-gold)]" />
          <Romduol className="mx-auto -mt-4 size-7 text-[var(--inv-gold)]" />

          <Eyebrow locale={locale} className="mt-3 opacity-70" />
          <CoupleNames locale={locale} size="text-[1.15rem]" sep="text-[var(--inv-gold)]" className="mt-3" />
          <When locale={locale} className="mt-3" />

          <ScanStrip
            locale={locale}
            qrValue={qrValue}
            foreground="var(--inv-fg)"
            className="border-t border-[var(--inv-gold)]/30"
          />
        </div>
      </div>
    </div>
  )
}

/** Phka Romduol — organic and open, opening on the bloom itself. */
function RomduolFace({ locale, qrValue }: FaceProps) {
  return (
    <Paper pattern="romduol" className="px-6 pt-7 pb-6 text-center">
      <div className="relative flex h-full flex-col">
        <Romduol className="mx-auto mt-auto size-8 text-[var(--inv-gold)]" />
        <Eyebrow locale={locale} className="mt-3 opacity-70" />

        <CoupleNames locale={locale} sep="text-[var(--inv-gold)]" className="mt-3" />

        <FlowerGarland className="mx-auto mt-3 h-6 w-full max-w-[12rem] text-[var(--inv-accent)]/70" />
        <When locale={locale} className="mt-2" />

        <ScanStrip
          locale={locale}
          qrValue={qrValue}
          foreground="var(--inv-fg)"
          className="border-t border-[var(--inv-gold)]/30"
        />
      </div>
    </Paper>
  )
}

/** Anything else in the registry: the quiet, ornamented default. */
function PlainFace({ locale, qrValue }: FaceProps) {
  return (
    <Paper pattern="phka" className="px-7 pt-8 pb-6 text-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-2 border border-[var(--inv-gold)]/40"
      />
      {[
        "top-1 left-1",
        "top-1 right-1 -scale-x-100",
        "bottom-1 left-1 -scale-y-100",
        "right-1 bottom-1 -scale-100",
      ].map((position) => (
        <KbachCorner
          key={position}
          className={cn("pointer-events-none absolute size-10 text-[var(--inv-gold)]/65", position)}
        />
      ))}

      <div className="relative flex h-full flex-col">
        <Eyebrow locale={locale} className="mt-auto opacity-70" />
        <CoupleNames locale={locale} sep="text-[var(--inv-gold)]" className="mt-5" />
        <KbachDivider className="mx-auto mt-4 h-4 w-28 text-[var(--inv-gold)]" />
        <When locale={locale} className="mt-3" />

        <ScanStrip
          locale={locale}
          qrValue={qrValue}
          foreground="var(--inv-fg)"
          className="border-t border-[var(--inv-gold)]/30"
        />
      </div>
    </Paper>
  )
}

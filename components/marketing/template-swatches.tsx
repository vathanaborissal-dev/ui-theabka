"use client"

import { KbachDivider } from "@/components/invitation/ornaments"
import { PatternBackground, type PatternId } from "@/components/invitation/patterns"
import { getPalette, paletteStyle, paperInks } from "@/lib/invitation/palettes"
import { TEMPLATES, type TemplateId } from "@/lib/invitation/templates"
import type { Locale } from "@/lib/types"
import { cn } from "@/lib/utils"

/** The three couples reach for most often. Shown first, and flagged. */
const POPULAR: TemplateId[] = ["marakot", "sompeah", "chhaya"]


const isPopular = (id: TemplateId) => POPULAR.includes(id)

/**
 * Popular first, registry order within each group — `sort` is stable, so the
 * rest of the set keeps the sequence the picker shows.
 */
const ORDERED = [...TEMPLATES].sort(
  (a, b) => Number(isPopular(b.id)) - Number(isPopular(a.id))
)

/**
 * The template set, shown the way a print shop shows one: as sample chips a
 * customer can run their eye along.
 *
 * Built from the real registry rather than a hand-written list, so a template
 * added to `TEMPLATES` shows up here and the count below never goes stale. Each
 * chip is drawn with that template's own default palette and pattern, which is
 * what makes the row read as fourteen different cards instead of fourteen
 * copies of one card with the label swapped.
 */
export function TemplateSwatches({ locale }: { locale: Locale }) {
  return (
    <ul
      // Bleeds to the screen edge on a phone so the row reads as scrollable.
      // `scroll-px` matters: without it the snap area ignores the padding, and
      // the browser immediately scrolls the first chip flush against the edge.
      // Faded at the trailing edge so the row reads as continuing rather than
      // as a grid that happens to be clipped by the container.
      className="hide-scrollbar -mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 [mask-image:linear-gradient(to_right,black_calc(100%-4rem),transparent)] sm:mx-0 sm:scroll-px-0 sm:px-0"
      aria-label={locale === "km" ? "គំរូធៀប" : "Invitation templates"}
    >
      {ORDERED.map((template) => {
        const palette = getPalette(template.defaultPalette)
        const popular = isPopular(template.id)
        const { ink, muted: mutedInk } = paperInks(template.defaultPalette)

        return (
          <li
            key={template.id}
            style={paletteStyle(template.defaultPalette)}
            className={cn(
              // `bg-card`, not the palette, is the chip's own ground. Several
              // palettes are built to sit over video or a photo and carry an
              // alpha (`on-video` is 55% opaque), so painting them straight
              // onto the page would let the section show through and the chip
              // would lose its edges.
              "relative flex w-[9.5rem] shrink-0 snap-start flex-col items-center overflow-hidden rounded-xl bg-card px-3 pt-8 pb-6 text-center shadow-(--shadow-card) ring-1",
              popular ? "ring-primary/35" : "ring-[var(--inv-border)]"
            )}
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-[var(--inv-bg)]"
            />
            <PatternBackground
              pattern={template.defaultPattern as PatternId}
              scale={0.6}
              opacity={0.1}
              className="text-[var(--inv-accent)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-2 rounded-lg border border-[var(--inv-gold)]/35"
            />

            {/*
             * The ribbon sits in the page's own emphasis colour rather than the
             * template's gold: `gold-ivory` and `saffron` put their gold at
             * around 2.5:1 on their own ground, which is fine for a hairline
             * rule and not for six letters of type.
             *
             * Its row is reserved on every chip (`pt-8` above) so the names
             * stay on one line across the row instead of the three flagged
             * chips pushing their own type down.
             *
             * `lang` so the global script rule drops the tracking on the Khmer
             * label — letter-spacing splits Khmer consonant clusters from
             * their subscripts.
             */}
            {popular ? (
              <span
                lang={locale}
                className="absolute inset-x-0 top-0 bg-primary py-1 text-[0.55rem] tracking-[0.14em] text-primary-foreground uppercase"
              >
                {locale === "km" ? "ពេញនិយម" : "Popular"}
              </span>
            ) : null}

            <div className="relative flex flex-1 flex-col items-center">
              {/* The template's own ink, so a midnight card reads as a
                  midnight card rather than every chip reading as cream. */}
              <p
                className="font-khmer-display text-base leading-snug"
                style={{ color: ink }}
                lang="km"
              >
                {template.name.km}
              </p>
              <KbachDivider className="mt-2.5 h-3 w-16 text-[var(--inv-gold)]" />
              <p
                className="mt-2.5 text-[0.7rem] tracking-[0.16em] uppercase"
                style={{ color: mutedInk }}
              >
                {template.name.en}
              </p>

              {/* The palette itself, as three inks along the bottom edge. */}
              <div className="mt-auto flex gap-1 pt-3.5">
                {palette.swatch.map((colour, i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    className="size-2 rounded-full ring-1 ring-[var(--inv-fg)]/15"
                    style={{ background: colour }}
                  />
                ))}
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export const TEMPLATE_COUNT = TEMPLATES.length

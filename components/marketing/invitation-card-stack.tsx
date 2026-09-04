"use client"

import * as React from "react"
import { TemplateFace } from "@/components/marketing/template-faces"
import { paletteStyle } from "@/lib/invitation/palettes"
import { getTemplate, type TemplateId } from "@/lib/invitation/templates"
import type { Locale } from "@/lib/types"
import { cn } from "@/lib/utils"

/** The invitation the hero shows off, and the one its QR actually opens. */
const DEMO_PATH = "/i/rithy-and-sreyneang"

/** How long each template holds the front of the deck. */
const HOLD_MS = 5000

/**
 * The deck, resolved through the registry so palettes, patterns and names stay
 * in step with the picker.
 *
 * The three couples pick most often lead, so the hero opens on Marakot. They
 * are also the three built around media — Marakot and Chhaya carry alpha in
 * their surfaces and Sompeah inks its type in gold for a cover photo — which
 * is why the card below composites them over an opaque ground and takes its
 * text colour from `paperInks` rather than straight from `--inv-fg`.
 *
 * The rest follow for spread: warm garnet cream, cool royal lilac, amber
 * saffron. Every palette in the set shares roughly the same warm gold, which
 * is the house style and not something to fight — picking cards for gold
 * instead would make them look identical and the deal would read as a
 * rendering glitch.
 */
const DECK: TemplateId[] = ["marakot", "sompeah", "chhaya", "kbach", "sbai", "romduol"]

/**
 * Where each card sits once it is `n` places back from the front. The receding
 * card also shrinks and rotates away, which is what sells the movement as a
 * card going to the back of a deck rather than rectangles sliding about.
 */
const SLOTS = [
  { transform: "translate(0px, 0px) rotate(0deg) scale(1)", zIndex: 30 },
  { transform: "translate(14px, 10px) rotate(4deg) scale(0.97)", zIndex: 20 },
  { transform: "translate(-16px, 14px) rotate(-6deg) scale(0.94)", zIndex: 10 },
]

/**
 * A deck deeper than the fan is wide: everything past the last visible slot is
 * stowed in that slot's exact pose, one z-index further back, where the opaque
 * card in front hides it completely.
 *
 * Same pose rather than off-screen so a card entering the stack grows out from
 * behind the others instead of flying in from the side.
 */
function slotFor(place: number) {
  const last = SLOTS.length - 1
  if (place <= last) return SLOTS[place]
  return { ...SLOTS[last], zIndex: SLOTS[last].zIndex - (place - last) }
}

const CARD_SHADOW =
  "0 2px 4px oklch(0.3 0.05 40 / 0.06), 0 30px 60px -30px oklch(0.3 0.06 40 / 0.45)"

/**
 * The hero object: a printed invitation, not a phone.
 *
 * A device frame would say "this is an app", which is the opposite of the
 * pitch — the couple still hands out a card, and the QR on it is what carries
 * the rest. So the hero is stationery, drawn from the same palettes, ornaments
 * and Khmer display face the real templates use, dealing itself through the
 * set so the range is visible without the visitor having to scroll for it.
 */
export function InvitationCardStack({ locale }: { locale: Locale }) {
  const { front, show, next, pause, resume } = useDeck(DECK.length, HOLD_MS)

  // Rendered as the real code rather than a drawing of one: it is the single
  // claim on this page a visitor can check with their own phone. Same
  // server-safe origin read as the share sheet — the server renders the
  // relative path and the client fills the origin in on first paint.
  const origin = React.useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => ""
  )

  const current = getTemplate(DECK[front])

  return (
    <div className="mx-auto w-full max-w-[19rem] px-1 sm:max-w-[21rem] lg:max-w-[22rem]">
      {/*
       * A grid with every card in the one cell, so the deck occupies one
       * footprint and the transforms that fan it out stay purely visual.
       *
       * 5:7 because that is the shape of the object — a printed invitation is
       * A6 or five-by-seven, not a square. Left to size itself around its
       * content the card came out at 1.13, which reads as a UI tile rather
       * than a card that came out of an envelope.
       *
       * Hovering holds the current card, so a reader who stops to look at one
       * is not moved off it.
       */}
      <div
        /*
         * `isolate` is load-bearing. The slot z-indexes below are about which
         * card is in front of which — they mean nothing outside the deck. With
         * no stacking context here they were emitted straight into the page's
         * root one, where the front card's z-30 tied the sticky header's z-30
         * and won on DOM order, so the invitation slid over the top bar on
         * scroll. Isolating keeps the deck's layering to the deck.
         */
        className="isolate grid aspect-5/7"
        onMouseEnter={pause}
        onMouseLeave={resume}
        onFocusCapture={pause}
        onBlurCapture={resume}
      >
        {DECK.map((id, i) => {
          const place = (i - front + DECK.length) % DECK.length
          const isFront = place === 0
          const name = getTemplate(id).name

          return (
            <Card
              key={id}
              templateId={id}
              locale={locale}
              slot={slotFor(place)}
              isFront={isFront}
              /*
               * Every click switches, but the target decides how. A card
               * behind jumps straight to itself; the one in front deals the
               * next. Because the cards are rotated, the exposed part of a
               * back card is a wedge near its top corner rather than a
               * full-height edge, so the front card — the only large target —
               * is what has to reach the rest of the deck.
               */
              onSelect={isFront ? next : () => show(i)}
              label={
                isFront
                  ? locale === "km"
                    ? "បង្ហាញគំរូបន្ទាប់"
                    : "Show the next template"
                  : locale === "km"
                    ? `បង្ហាញគំរូ ${name.km}`
                    : `Show the ${name.en} template`
              }
              // Only the front card carries a QR. It is a thousand-odd rects
              // of SVG, and on the cards behind it every one of them is
              // hidden under the card in front.
              qrValue={isFront ? `${origin}${DEMO_PATH}` : undefined}
            />
          )
        })}
      </div>

      {/* Without a name the shuffle is just colours changing; with one it says
          "these are different templates", which is the point of showing it. */}
      <p className="mt-5 text-center text-xs text-muted-foreground">
        <span className="font-khmer" lang="km">
          {current.name.km}
        </span>
        {locale === "km" ? null : <span className="ml-2">{current.name.en}</span>}
      </p>
    </div>
  )
}

/**
 * Advances the deck on a timer, holding while the pointer or focus is on it,
 * and lets a click take over.
 *
 * Nothing rotates on its own when the reader has asked for reduced motion —
 * that is decoration, and the still card says the same thing — but clicking
 * still works, so the deck is never a dead end.
 */
function useDeck(count: number, intervalMs: number) {
  const [front, setFront] = React.useState(0)
  const [held, setHeld] = React.useState(false)
  const [reducedMotion, setReducedMotion] = React.useState(true)

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReducedMotion(query.matches)
    sync()
    query.addEventListener("change", sync)
    return () => query.removeEventListener("change", sync)
  }, [])

  React.useEffect(() => {
    if (held || reducedMotion) return
    const id = window.setInterval(() => setFront((n) => (n + 1) % count), intervalMs)
    return () => window.clearInterval(id)
    // `front` is a dependency so that picking a card restarts the countdown.
    // Without it a card chosen a moment before the next tick would be replaced
    // almost immediately, which reads as the click having been ignored.
  }, [count, intervalMs, held, reducedMotion, front])

  return {
    front,
    show: React.useCallback((index: number) => setFront(index), []),
    next: React.useCallback(() => setFront((n) => (n + 1) % count), [count]),
    pause: React.useCallback(() => setHeld(true), []),
    resume: React.useCallback(() => setHeld(false), []),
  }
}

function Card({
  templateId,
  locale,
  slot,
  isFront,
  onSelect,
  label,
  qrValue,
}: {
  templateId: TemplateId
  locale: Locale
  slot: (typeof SLOTS)[number]
  isFront: boolean
  onSelect: () => void
  /** Overrides the card's own text as the button's name — see below. */
  label: string
  /** Present only on the card currently at the front of the deck. */
  qrValue?: string
}) {
  const template = getTemplate(templateId)

  return (
    /*
     * Every card stays a button, including the one in front. If the front card
     * dropped out of the tab order on arrival, activating a card from the
     * keyboard would destroy the element that focus was sitting on and drop
     * focus to the body.
     *
     * `aria-label` deliberately replaces the card's own text. The couple, the
     * date and the venue are a fictional sample, and reading all of it out —
     * plus the QR's target URL — to announce one button is noise; the label
     * says what pressing it does instead.
     *
     * The shell owns only the deck: palette variables, the opaque base, the
     * shadow and the pose. Everything inside the rounded edge belongs to the
     * template's own face.
     */
    <button
      type="button"
      onClick={onSelect}
      aria-label={label}
      aria-current={isFront ? "true" : undefined}
      style={{
        ...paletteStyle(template.defaultPalette),
        boxShadow: CARD_SHADOW,
        transform: slot.transform,
        zIndex: slot.zIndex,
      }}
      className={cn(
        "relative isolate col-start-1 row-start-1 cursor-pointer overflow-hidden rounded-[1.75rem] bg-card text-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] outline-none focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none",
        // A card behind shows only a wedge near its top corner, so it needs a
        // hover cue that survives being almost entirely covered.
        !isFront && "hover:ring-2 hover:ring-primary/30"
      )}
    >
      <TemplateFace templateId={templateId} locale={locale} qrValue={qrValue} />
    </button>
  )
}

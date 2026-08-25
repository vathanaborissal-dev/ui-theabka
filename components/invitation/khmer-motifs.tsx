"use client"

import { cn } from "@/lib/utils"

/* ---------------------------------------------------------------------------
 * Figurative Khmer wedding motifs.
 *
 * These are the things that make a card read as *Cambodian* at a glance rather
 * than as a generic invitation with Khmer text on it: the baisei offering cone,
 * a couple in traditional dress, and the floral arch. Kept in their own file
 * because unlike the kbach line art in `khmer-ornaments.tsx`, these carry their
 * own colour.
 * ------------------------------------------------------------------------- */

/**
 * Baisei (បាយសី) — the tiered banana-leaf offering cone that stands on the
 * ceremony table at every Khmer wedding. Drawn as line art on `currentColor`,
 * so a template can render it in gold, ink, or anything else.
 */
export function Baisei({ className }: { className?: string }) {
  // Each tier is a fan of folded banana leaves, widest at the base — drawing
  // them as individual petals rather than stacked arcs is what stops it
  // reading as a stepped pyramid.
  const tiers = [
    { y: 116, half: 33, count: 9, leaf: 24 },
    { y: 97, half: 28, count: 7, leaf: 22 },
    { y: 79, half: 23, count: 6, leaf: 20 },
    { y: 62, half: 18, count: 5, leaf: 18 },
    { y: 47, half: 13, count: 4, leaf: 16 },
  ]

  return (
    <svg
      viewBox="0 0 120 172"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    >
      {tiers.map((tier) => (
        <g key={tier.y}>
          {Array.from({ length: tier.count }, (_, i) => {
            const t = tier.count === 1 ? 0 : (i / (tier.count - 1)) * 2 - 1
            const x = 60 + t * tier.half
            const lift = (1 - Math.abs(t)) * 5
            return (
              <path
                key={i}
                transform={`translate(${x} ${tier.y - lift}) rotate(${t * 26})`}
                d={`M0 0C-5-${tier.leaf * 0.4} -5-${tier.leaf * 0.78} 0-${tier.leaf}C5-${tier.leaf * 0.78} 5-${tier.leaf * 0.4} 0 0Z`}
                fill="currentColor"
                fillOpacity="0.1"
              />
            )
          })}
        </g>
      ))}

      {/* Crowning bud and its two flanking buds */}
      <path d="M60 40c-6-9-5-17 0-24 5 7 6 15 0 24Z" fill="currentColor" stroke="none" />
      <path d="M50 34c-4-4-5-9-2-13 4 3 5 9 2 13Z" fill="currentColor" stroke="none" opacity="0.7" />
      <path d="M70 34c4-4 5-9 2-13-4 3-5 9-2 13Z" fill="currentColor" stroke="none" opacity="0.7" />

      {/* Pahn — the footed offering bowl the cone stands in */}
      <path d="M24 118h72" strokeWidth="1.6" />
      <path d="M27 120c3 12 12 19 33 19s30-7 33-19" strokeWidth="1.6" />
      <path d="M54 139h12v9H54Z" strokeWidth="1.4" />
      <path d="M38 158c0-6 9-10 22-10s22 4 22 10Z" strokeWidth="1.4" fill="currentColor" fillOpacity="0.12" />
      <path d="M34 158h52" strokeWidth="1.6" />
      <path d="M33 126h54" opacity="0.4" />
    </svg>
  )
}

/**
 * The couple in traditional Khmer wedding dress — the groom in a white koh
 * with a gold sash over a sampot chong kben, the bride in a gold sbai and
 * sampot hol with a ceremonial headpiece.
 *
 * Flat colour rather than palette tokens: this is an illustration, and the
 * gold-and-cream it is drawn in is the actual costume, not a theme choice.
 */
export function KhmerCouple({ className }: { className?: string }) {
  const skin = "#F4D7B8"
  const skinDeep = "#E3BE99"
  const hair = "#241E19"
  const gold = "#C9A24C"
  const goldLight = "#E5CB84"
  const goldDeep = "#9A7930"
  const cream = "#FCF8EE"
  const creamShade = "#EDE3CE"
  const olive = "#BCA26D"

  /** Closed, smiling eyes plus blush — the expression both figures share. */
  const face = (cx: number, cy: number, spread: number) => (
    <>
      <circle cx={cx - spread - 3} cy={cy + 6} r="5.4" fill="#EDA79C" opacity="0.5" />
      <circle cx={cx + spread + 3} cy={cy + 6} r="5.4" fill="#EDA79C" opacity="0.5" />
      <path
        d={`M${cx - spread - 5} ${cy}q5 5.5 10 0M${cx + spread - 5} ${cy}q5 5.5 10 0`}
        stroke={hair}
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M${cx - 5} ${cy + 12}q5 4.5 10 0`}
        stroke={hair}
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
    </>
  )

  return (
    <svg viewBox="0 0 240 300" aria-hidden="true" className={className}>
      {/* Soft ground shadow so they stand rather than float */}
      <ellipse cx="120" cy="284" rx="74" ry="8" fill={goldDeep} opacity="0.13" />

      {/* ---------------------------------- Groom --------------------------- */}
      <g>
        {/* Feet */}
        <path d="M62 258h17v16H62ZM88 258h17v16H88Z" fill={cream} />
        <path d="M58 270h23a3 3 0 0 1 3 3v3H58ZM84 270h23a3 3 0 0 1 3 3v3H84Z" fill={hair} />

        {/* Sampot chong kben — gathered and pleated at the front */}
        <path d="M60 190h50c4 0 6 3 5 7l-9 65H64l-9-65c-1-4 1-7 5-7Z" fill={olive} />
        <path d="M74 190h22l7 72H67Z" fill={goldLight} opacity="0.7" />
        {[78, 85, 92, 99].map((x) => (
          <path key={x} d={`M${x} 194l2 66`} stroke={goldDeep} strokeWidth="1" opacity="0.3" />
        ))}
        <path d="M60 190h50l1 8H59Z" fill={goldDeep} opacity="0.45" />

        {/* Koh — the white ceremonial shirt, with sloped shoulders */}
        <path d="M85 104c16 0 29 9 29 22v66H56v-66c0-13 13-22 29-22Z" fill={cream} />
        <path d="M56 132c-6 3-9 9-9 16v34c0 4 3 7 7 7h2Z" fill={creamShade} />
        <path d="M114 132c6 3 9 9 9 16v34c0 4-3 7-7 7h-2Z" fill={creamShade} />
        {/* Hands */}
        <circle cx="50" cy="192" r="7.5" fill={skin} />
        <circle cx="120" cy="192" r="7.5" fill={skin} />

        {/* Gold sash across the chest */}
        <path d="M68 108l52 78-13 9-52-78Z" fill={gold} />
        <path d="M68 108l52 78-4 3-52-78Z" fill={goldLight} opacity="0.65" />

        {/* Mandarin collar opening and buttons */}
        <path d="M74 105h22l-11 16Z" fill={skinDeep} opacity="0.4" />
        {[142, 156, 170].map((y) => (
          <circle key={y} cx="85" cy={y} r="2.1" fill={gold} />
        ))}

        {/* Head */}
        <path d="M85 100c-4 0-7-3-7-7h14c0 4-3 7-7 7Z" fill={skinDeep} />
        <circle cx="85" cy="70" r="28" fill={skin} />
        {/* One smooth cap with a soft side-swept fringe */}
        <path d="M57 68c0-18 12-31 28-31s28 13 28 31c-4-10-11-16-20-17-3 5-10 8-19 8-8 0-14 3-17 9Z" fill={hair} />
        {face(85, 70, 9)}
      </g>

      {/* ---------------------------------- Bride --------------------------- */}
      <g>
        {/* Feet peeking below the hem */}
        <path d="M140 262h14v12h-14ZM164 262h14v12h-14Z" fill={skin} />
        <path d="M137 272h20a3 3 0 0 1 3 3v3h-23ZM161 272h20a3 3 0 0 1 3 3v3h-23Z" fill={goldDeep} />

        {/* Sampot hol — the long patterned skirt */}
        <path d="M133 186h44c5 0 8 4 9 9l10 66h-82l10-66c1-5 4-9 9-9Z" fill={gold} />
        <path d="M133 186h44c5 0 8 4 9 9l2 14h-66l2-14c1-5 4-9 9-9Z" fill={goldLight} opacity="0.6" />
        {[
          [145, 226],
          [163, 220],
          [178, 230],
          [152, 244],
          [172, 246],
          [137, 250],
          [190, 250],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2.3" fill={cream} opacity="0.7" />
        ))}
        <path d="M114 253h82l1.5 8h-85Z" fill={goldDeep} opacity="0.4" />

        {/* Bodice */}
        <path d="M155 104c14 0 25 8 25 20v62h-50v-62c0-12 11-20 25-20Z" fill={goldLight} />
        <path d="M130 130c-5 3-8 8-8 14v34c0 4 3 6 6 6h2Z" fill={gold} />
        <path d="M180 130c5 3 8 8 8 14v34c0 4-3 6-6 6h-2Z" fill={gold} />
        <circle cx="124" cy="190" r="7" fill={skin} />
        <circle cx="186" cy="190" r="7" fill={skin} />

        {/* Sbai — the shoulder cloth, pleated over one shoulder */}
        <path d="M140 106l46 78-14 8-45-77Z" fill={gold} />
        <path d="M140 106l46 78-5 3-45-77Z" fill={cream} opacity="0.5" />
        <path d="M172 192l16 26-11 3-11-24Z" fill={goldDeep} opacity="0.75" />

        {/* Beaded collar */}
        <path d="M139 108q16 15 32 0" stroke={goldDeep} strokeWidth="3.4" fill="none" strokeLinecap="round" />
        <circle cx="155" cy="119" r="3" fill={goldLight} />

        {/* Head */}
        <path d="M155 100c-4 0-7-3-7-7h14c0 4-3 7-7 7Z" fill={skinDeep} />
        <circle cx="155" cy="70" r="27" fill={skin} />
        <path d="M128 66c0-17 12-29 27-29s27 12 27 29c-5-11-14-16-27-16s-22 5-27 16Z" fill={hair} />
        {/* Bun, gathered high */}
        <circle cx="155" cy="34" r="14" fill={hair} />
        <path d="M143 44q12 8 24 0" stroke={hair} strokeWidth="5" fill="none" strokeLinecap="round" />
        {/* Ceremonial headpiece */}
        <path d="M141 50l14-22 14 22-7-4-7 6-7-6Z" fill={gold} />
        <path d="M148 44l7-11 7 11-3.5-2-3.5 3-3.5-3Z" fill={goldLight} />
        <circle cx="155" cy="26" r="3.4" fill={goldLight} />
        {/* Earrings */}
        <circle cx="129" cy="78" r="3.6" fill={gold} />
        <circle cx="181" cy="78" r="3.6" fill={gold} />
        {face(155, 70, 8.5)}
      </g>
    </svg>
  )
}

/** A spray of blooms and foliage for the corners of an arch. */
export function FloralCorner({
  className,
  flip = false,
}: {
  className?: string
  flip?: boolean
}) {
  const leaf = "#5E7A55"
  const leafLight = "#88A377"
  const petal = "#FDFBF6"
  const petalShade = "#EFE7D6"
  const centre = "#D9BE72"

  const bloom = (cx: number, cy: number, r: number) => (
    <g transform={`translate(${cx} ${cy})`}>
      {[0, 51, 102, 153, 204, 255, 306].map((angle) => (
        <ellipse
          key={angle}
          transform={`rotate(${angle}) translate(0 ${-r * 0.62})`}
          rx={r * 0.42}
          ry={r * 0.6}
          fill={petal}
          stroke={petalShade}
          strokeWidth="0.8"
        />
      ))}
      {[30, 150, 270].map((angle) => (
        <ellipse
          key={angle}
          transform={`rotate(${angle}) translate(0 ${-r * 0.3})`}
          rx={r * 0.3}
          ry={r * 0.36}
          fill={petalShade}
          opacity="0.8"
        />
      ))}
      <circle r={r * 0.2} fill={centre} />
    </g>
  )

  return (
    <svg
      viewBox="0 0 160 150"
      aria-hidden="true"
      className={cn(className, flip && "-scale-x-100")}
    >
      {/* Foliage fanning out behind the blooms */}
      {[
        { x: 20, y: 96, r: -35, s: 1.1 },
        { x: 60, y: 116, r: 15, s: 0.95 },
        { x: 116, y: 74, r: 55, s: 0.9 },
        { x: 104, y: 20, r: 95, s: 0.85 },
        { x: 22, y: 30, r: -80, s: 0.8 },
        { x: 140, y: 40, r: 70, s: 0.7 },
      ].map((sprig, i) => (
        <g
          key={i}
          transform={`translate(${sprig.x} ${sprig.y}) rotate(${sprig.r}) scale(${sprig.s})`}
        >
          <path d="M0 0C-4-14-2-28 6-38" stroke={leaf} strokeWidth="1.6" fill="none" strokeLinecap="round" />
          {[0, 1, 2, 3].map((n) => (
            <g key={n}>
              <ellipse
                cx={-3 - n * 0.6}
                cy={-6 - n * 8}
                rx="7"
                ry="4"
                transform={`rotate(${-28 - n * 5} ${-3 - n * 0.6} ${-6 - n * 8})`}
                fill={n % 2 ? leafLight : leaf}
              />
              <ellipse
                cx={5 + n * 0.6}
                cy={-10 - n * 8}
                rx="7"
                ry="4"
                transform={`rotate(${28 + n * 5} ${5 + n * 0.6} ${-10 - n * 8})`}
                fill={n % 2 ? leaf : leafLight}
              />
            </g>
          ))}
        </g>
      ))}

      {bloom(44, 62, 30)}
      {bloom(100, 44, 24)}
      {bloom(84, 100, 19)}
      {bloom(18, 112, 14)}
    </svg>
  )
}

/** A strand of beads hanging from the arch, as on a Khmer ceremonial canopy. */
export function HangingBeads({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 96" aria-hidden="true" className={className} fill="currentColor">
      <path d="M8 0v58" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      {[16, 28, 40].map((y, i) => (
        <circle key={y} cx="8" cy={y} r={2.6 - i * 0.4} opacity={0.8 - i * 0.12} />
      ))}
      <circle cx="8" cy="62" r="5" />
      <path d="M4 66h8l-2 22a2 2 0 0 1-4 0Z" opacity="0.85" />
      <path d="M8 88v6" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    </svg>
  )
}

/** Oval cartouche used to frame a monogram on formal Khmer cards. */
export function Cartouche({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        viewBox="0 0 120 150"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      >
        <ellipse cx="60" cy="75" rx="46" ry="62" />
        <ellipse cx="60" cy="75" rx="40" ry="56" opacity="0.45" />
        {/* Flourishes top and bottom */}
        <path d="M60 13c-6-6-14-7-20-3 5 5 12 7 20 3Zm0 0c6-6 14-7 20-3-5 5-12 7-20 3Z" fill="currentColor" stroke="none" opacity="0.8" />
        <path d="M60 137c-6 6-14 7-20 3 5-5 12-7 20-3Zm0 0c6 6 14 7 20 3-5-5-12-7-20-3Z" fill="currentColor" stroke="none" opacity="0.8" />
        <path d="M14 75c-6-5-7-12-3-18 5 5 7 12 3 18Zm92 0c6-5 7-12 3-18-5 5-7 12-3 18Z" fill="currentColor" stroke="none" opacity="0.6" />
      </svg>
      <div className="relative z-10 px-6 text-center">{children}</div>
    </div>
  )
}

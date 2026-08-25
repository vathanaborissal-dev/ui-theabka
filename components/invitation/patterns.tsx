"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/* ---------------------------------------------------------------------------
 * Seamless Khmer background patterns.
 *
 * Rendered as inline <pattern> rather than CSS background data-URIs so they can
 * inherit a palette token through `currentColor` — a data-URI cannot read a CSS
 * custom property. Each tile is built so its edge motifs meet across the seam.
 * ------------------------------------------------------------------------- */

export type PatternId = "none" | "phka" | "lotus" | "kbach" | "temple" | "romduol"

export const PATTERNS: Array<{ id: PatternId; name: { en: string; km: string } }> = [
  { id: "none", name: { en: "None", km: "គ្មាន" } },
  { id: "phka", name: { en: "Kbach phka", km: "ក្បាច់ផ្កា" } },
  { id: "romduol", name: { en: "Romduol", km: "ផ្កា​រំដួល" } },
  { id: "lotus", name: { en: "Lotus lattice", km: "ក្បាច់ឈូក" } },
  { id: "kbach", name: { en: "Kbach curl", km: "ក្បាច់វេលា" } },
  { id: "temple", name: { en: "Temple tile", km: "ក្បាច់ប្រាសាទ" } },
]

/** Eight-petal kbach flower with quarter flowers meeting at every corner. */
function PhkaTile() {
  const petals = [0, 45, 90, 135, 180, 225, 270, 315]
  const flower = (cx: number, cy: number, scale: number, opacity: number) => (
    <g transform={`translate(${cx} ${cy}) scale(${scale})`} opacity={opacity}>
      {petals.map((angle) => (
        <path
          key={angle}
          transform={`rotate(${angle})`}
          d="M0 0C-3.4-2.2-4.4-6.4 0-11 4.4-6.4 3.4-2.2 0 0Z"
        />
      ))}
      <circle r="1.6" />
    </g>
  )
  return (
    <>
      {flower(24, 24, 1, 1)}
      {flower(0, 0, 0.62, 0.75)}
      {flower(48, 0, 0.62, 0.75)}
      {flower(0, 48, 0.62, 0.75)}
      {flower(48, 48, 0.62, 0.75)}
      {[
        [24, 0],
        [0, 24],
        [48, 24],
        [24, 48],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.1" opacity="0.5" />
      ))}
    </>
  )
}

/** Three-petal romduol scattered on a half-drop grid. */
function RomduolTile() {
  const bloom = (cx: number, cy: number, rotate: number, scale: number, opacity: number) => (
    <g transform={`translate(${cx} ${cy}) rotate(${rotate}) scale(${scale})`} opacity={opacity}>
      {[0, 120, 240].map((angle) => (
        <path key={angle} transform={`rotate(${angle})`} d="M0 0C-5-3-6-8 0-13 6-8 5-3 0 0Z" />
      ))}
      <circle r="1.5" opacity="0.8" />
    </g>
  )
  return (
    <>
      {bloom(16, 16, 0, 1, 1)}
      {bloom(48, 48, 40, 1, 1)}
      {bloom(48, 16, 200, 0.7, 0.7)}
      {bloom(16, 48, 160, 0.7, 0.7)}
      {bloom(0, 32, 90, 0.5, 0.5)}
      {bloom(64, 32, 90, 0.5, 0.5)}
      {bloom(32, 0, 0, 0.5, 0.5)}
      {bloom(32, 64, 0, 0.5, 0.5)}
    </>
  )
}

/** Interlocking lotus buds in a diamond lattice. */
function LotusTile() {
  const bud = (cx: number, cy: number, opacity: number) => (
    <g transform={`translate(${cx} ${cy})`} opacity={opacity}>
      <path d="M0-9c3.6 5 3.6 10 0 15-3.6-5-3.6-10 0-15Z" />
      <path d="M0 6c5-3.6 10-3.6 15 0-5 3.6-10 3.6-15 0Z" opacity="0.6" />
      <path d="M0 6c-5-3.6-10-3.6-15 0 5 3.6 10 3.6 15 0Z" opacity="0.6" />
    </g>
  )
  return (
    <>
      <g fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.35">
        <path d="M0 28L28 0l28 28-28 28Z" />
        <path d="M-28 0L0-28M56 0L28-28M-28 56L0 28M56 56L28 28" />
      </g>
      {bud(28, 22, 0.9)}
      {bud(0, -6, 0.55)}
      {bud(56, -6, 0.55)}
      {bud(0, 50, 0.55)}
      {bud(56, 50, 0.55)}
    </>
  )
}

/** The running-curl motif carved along temple bases. */
function KbachTile() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
      <path d="M0 30c8 0 12-5 12-12s5-12 12-12 12 5 12 12-4 12-12 12" />
      <path d="M36 30c8 0 12-5 12-12s5-12 12-12" opacity="0.7" />
      <path d="M0 30c0 8 5 12 12 12s12-5 12-12" opacity="0.45" />
      <circle cx="24" cy="18" r="2" fill="currentColor" stroke="none" opacity="0.8" />
      <circle cx="60" cy="6" r="1.4" fill="currentColor" stroke="none" opacity="0.5" />
    </g>
  )
}

/** Stepped prasat outlines, like a wall of miniature towers. */
function TempleTile() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round">
      <path d="M6 46c0-12 2-22 12-30 10 8 12 18 12 30Z" />
      <path d="M34 46c0-8 1-15 8-20 7 5 8 12 8 20Z" opacity="0.6" />
      <path d="M0 46h56" opacity="0.5" />
      <path d="M18 8v-5M42 22v-4" opacity="0.6" />
      <path d="M6 0c0-6 4-10 12-10s12 4 12 10" opacity="0.3" />
    </g>
  )
}

const tiles: Record<
  Exclude<PatternId, "none">,
  { size: number; render: () => React.ReactElement }
> = {
  phka: { size: 48, render: PhkaTile },
  romduol: { size: 64, render: RomduolTile },
  lotus: { size: 56, render: LotusTile },
  kbach: { size: 60, render: KbachTile },
  temple: { size: 56, render: TempleTile },
}

/**
 * Fills its positioned parent with a repeating motif. Opacity is driven by the
 * template's ornament level, so "subtle" reads as texture and "rich" reads as
 * decorated paper.
 */
export function PatternBackground({
  pattern,
  className,
  scale = 1,
  opacity,
}: {
  pattern: PatternId
  className?: string
  scale?: number
  /** Kept low by default: a background motif that competes with the names
   *  stops being a background. */
  opacity?: number
}) {
  const id = React.useId().replace(/:/g, "")
  if (pattern === "none") return null

  const tile = tiles[pattern]
  const size = tile.size * scale
  const Tile = tile.render

  return (
    <svg
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      fill="currentColor"
      style={opacity === undefined ? undefined : { opacity }}
    >
      <defs>
        <pattern
          id={`pat-${id}`}
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
          patternTransform={`scale(${scale})`}
          viewBox={`0 0 ${tile.size} ${tile.size}`}
        >
          <Tile />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#pat-${id})`} />
    </svg>
  )
}

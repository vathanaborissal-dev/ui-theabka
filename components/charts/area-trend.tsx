"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type TrendPoint = { label: string; value: number }

/**
 * Small cumulative-trend chart, hand-drawn as SVG.
 *
 * Deliberately not a charting library: one series, no axes furniture, and it
 * inherits theme tokens directly. The underlying numbers are also exposed to
 * assistive tech as a table, since a sparkline alone is not readable.
 */
export function AreaTrend({
  points,
  className,
  height = 96,
  caption,
}: {
  points: TrendPoint[]
  className?: string
  height?: number
  caption: string
}) {
  const id = React.useId()

  if (points.length < 2) return null

  const width = 320
  const pad = 2
  const max = Math.max(...points.map((p) => p.value), 1)
  const stepX = (width - pad * 2) / (points.length - 1)

  const coords = points.map((p, i) => ({
    x: pad + i * stepX,
    y: height - pad - (p.value / max) * (height - pad * 2),
  }))

  // Catmull-Rom style smoothing keeps the line calm without hiding the shape.
  const line = coords
    .map((c, i) => {
      if (i === 0) return `M ${c.x} ${c.y}`
      const prev = coords[i - 1]
      const cx = (prev.x + c.x) / 2
      return `C ${cx} ${prev.y} ${cx} ${c.y} ${c.x} ${c.y}`
    })
    .join(" ")

  const area = `${line} L ${coords[coords.length - 1].x} ${height} L ${coords[0].x} ${height} Z`
  const last = coords[coords.length - 1]

  return (
    <figure className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full overflow-visible"
        preserveAspectRatio="none"
        role="img"
        aria-label={caption}
      >
        <defs>
          <linearGradient id={`fill-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#fill-${id})`} />
        <path
          d={line}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx={last.x} cy={last.y} r="3.5" fill="var(--primary)" />
      </svg>
      <figcaption className="sr-only">
        <table>
          <caption>{caption}</caption>
          <tbody>
            {points.map((p) => (
              <tr key={p.label}>
                <th scope="row">{p.label}</th>
                <td>{p.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  )
}

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type TrendPoint = { label: string; value: number }

const MARGIN = { top: 10, right: 10, bottom: 22, left: 34 }

/**
 * Axis ticks at round numbers (0 / 5 / 10), so the grid carries the values that
 * are not directly labelled.
 */
function niceTicks(max: number, count = 4) {
  if (max <= 0) return [0, 1]
  const rough = max / count
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const normalised = rough / magnitude
  const step = (normalised <= 1 ? 1 : normalised <= 2 ? 2 : normalised <= 5 ? 5 : 10) * magnitude
  const ticks: number[] = []
  for (let v = 0; v <= max + step * 0.5; v += step) ticks.push(Math.round(v * 1000) / 1000)
  return ticks
}

/** Tracks the rendered width so the chart draws at true pixel size. */
function useMeasuredWidth() {
  const ref = React.useRef<HTMLDivElement>(null)
  const [width, setWidth] = React.useState(0)

  React.useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return [ref, width] as const
}

/**
 * Single-series trend chart, hand-drawn as SVG.
 *
 * Deliberately not a charting library: it inherits theme tokens directly, so it
 * re-skins with the rest of the app. Drawn at measured pixel size rather than a
 * stretched viewBox, so strokes and type keep their true weight at any width.
 * The numbers are also exposed as a table, since a line alone is not readable
 * by assistive tech.
 */
export function AreaTrend({
  points,
  className,
  height = 168,
  caption,
  color = "var(--primary)",
  formatLabel = (label) => label,
  formatValue = (value) => String(value),
  emptyLabel = "No activity yet",
}: {
  points: TrendPoint[]
  className?: string
  height?: number
  caption: string
  /** A CSS color, for telling two of these apart when they sit side by side. */
  color?: string
  formatLabel?: (label: string) => string
  formatValue?: (value: number) => string
  emptyLabel?: string
}) {
  const gradientId = React.useId()
  const [containerRef, width] = useMeasuredWidth()
  const [active, setActive] = React.useState<number | null>(null)

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 0)
  const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 0)

  const ticks = niceTicks(Math.max(...points.map((p) => p.value), 0))
  const yMax = ticks[ticks.length - 1] || 1

  const x = (i: number) =>
    MARGIN.left + (points.length < 2 ? plotWidth / 2 : (i / (points.length - 1)) * plotWidth)
  const y = (value: number) => MARGIN.top + plotHeight - (value / yMax) * plotHeight

  // Straight segments, not a spline: the series is a cumulative count, and
  // smoothing would invent values between the days that were actually recorded.
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.value)}`).join(" ")
  const area = points.length >= 2
    ? `${line} L ${x(points.length - 1)} ${MARGIN.top + plotHeight} L ${x(0)} ${
        MARGIN.top + plotHeight
      } Z`
    : ""

  const lastIndex = points.length - 1
  const shown = active ?? lastIndex
  const canDraw = width > 0 && points.length >= 1
  const singlePoint = points.length === 1

  function pointerIndex(event: React.PointerEvent<SVGSVGElement>) {
    const bounds = event.currentTarget.getBoundingClientRect()
    const offset = event.clientX - bounds.left - MARGIN.left
    const ratio = plotWidth === 0 ? 0 : offset / plotWidth
    return Math.min(points.length - 1, Math.max(0, Math.round(ratio * (points.length - 1))))
  }

  function onKeyDown(event: React.KeyboardEvent<SVGSVGElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
    event.preventDefault()
    const step = event.key === "ArrowRight" ? 1 : -1
    setActive((current) => {
      const next = (current ?? lastIndex) + step
      return Math.min(points.length - 1, Math.max(0, next))
    })
  }

  return (
    <figure className={cn("w-full", className)}>
      <div ref={containerRef} className="relative w-full">
        {canDraw ? (
          <svg
            width={width}
            height={height}
            className="block touch-none"
            role="img"
            aria-label={caption}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onPointerMove={(event) => setActive(pointerIndex(event))}
            onPointerLeave={() => setActive(null)}
            onBlur={() => setActive(null)}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.14" />
                <stop offset="100%" stopColor={color} stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Grid — hairline, solid, one step off the surface. */}
            {ticks.map((tick) => (
              <g key={tick}>
                <line
                  x1={MARGIN.left}
                  x2={MARGIN.left + plotWidth}
                  y1={y(tick)}
                  y2={y(tick)}
                  stroke="var(--border)"
                  strokeWidth="1"
                  shapeRendering="crispEdges"
                />
                <text
                  x={MARGIN.left - 8}
                  y={y(tick)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="tnum fill-muted-foreground text-[10px]"
                >
                  {tick}
                </text>
              </g>
            ))}

            {!singlePoint ? (
              <>
                <path d={area} fill={`url(#${gradientId})`} />
                <path
                  d={line}
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            ) : null}

            {/* First and last day anchor the x-axis without crowding it. */}
            {singlePoint ? (
              <text
                x={x(0)}
                y={height - 6}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px]"
              >
                {formatLabel(points[0].label)}
              </text>
            ) : (
              <>
                <text
                  x={MARGIN.left}
                  y={height - 6}
                  textAnchor="start"
                  className="fill-muted-foreground text-[10px]"
                >
                  {formatLabel(points[0].label)}
                </text>
                <text
                  x={MARGIN.left + plotWidth}
                  y={height - 6}
                  textAnchor="end"
                  className="fill-muted-foreground text-[10px]"
                >
                  {formatLabel(points[lastIndex].label)}
                </text>
              </>
            )}

            {active !== null ? (
              <line
                x1={x(active)}
                x2={x(active)}
                y1={MARGIN.top}
                y2={MARGIN.top + plotHeight}
                stroke="var(--border)"
                strokeWidth="1"
              />
            ) : null}

            {/* Surface ring keeps the marker legible where it crosses the line. */}
            <circle
              cx={x(shown)}
              cy={y(points[shown].value)}
              r="4"
              fill={color}
              stroke="var(--card)"
              strokeWidth="2"
            />

            {singlePoint ? (
              <text
                x={x(0)}
                y={Math.max(y(points[0].value) - 12, 12)}
                textAnchor="middle"
                className="fill-foreground text-[11px] font-medium"
              >
                {formatValue(points[0].value)}
              </text>
            ) : null}
          </svg>
        ) : (
          <div
            style={{ height }}
            className="flex items-center justify-center text-sm text-muted-foreground"
            role="status"
          >
            {emptyLabel}
          </div>
        )}

        {canDraw && active !== null ? (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md border border-border bg-popover px-2 py-1.5 shadow-md"
            style={{ left: x(active), top: y(points[active].value) - 10 }}
          >
            <p className="tnum text-xs font-medium text-popover-foreground">
              {formatValue(points[active].value)}
            </p>
            <p className="text-[0.6875rem] whitespace-nowrap text-muted-foreground">
              {formatLabel(points[active].label)}
            </p>
          </div>
        ) : null}
      </div>

      <figcaption className="sr-only">
        <table>
          <caption>{caption}</caption>
          <tbody>
            {points.map((p) => (
              <tr key={p.label}>
                <th scope="row">{formatLabel(p.label)}</th>
                <td>{p.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  )
}

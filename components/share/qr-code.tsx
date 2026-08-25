"use client"

import * as React from "react"
import qrcode from "qrcode-generator"
import { cn } from "@/lib/utils"

/**
 * QR rendered as SVG rather than canvas so it stays crisp at print sizes — the
 * whole point is that couples put this on a physical invitation card.
 *
 * Rounded module "dots" plus enlarged finder patterns read as designed rather
 * than machine-generated, while staying within the spec's tolerance. Error
 * correction is set to H so the centre mark can be punched out safely.
 */
export function QrCode({
  value,
  className,
  foreground = "currentColor",
  background = "transparent",
  centerMark = true,
  id,
}: {
  value: string
  className?: string
  foreground?: string
  background?: string
  centerMark?: boolean
  id?: string
}) {
  const { count, cells } = React.useMemo(() => {
    const qr = qrcode(0, "H")
    qr.addData(value)
    qr.make()
    const n = qr.getModuleCount()
    const dark: Array<[number, number]> = []
    for (let row = 0; row < n; row++) {
      for (let col = 0; col < n; col++) {
        if (qr.isDark(row, col)) dark.push([row, col])
      }
    }
    return { count: n, cells: dark }
  }, [value])

  const quiet = 2
  const total = count + quiet * 2
  const center = count / 2
  const holeRadius = centerMark ? 3.2 : 0

  const isFinder = (row: number, col: number) =>
    (row < 7 && col < 7) || (row < 7 && col >= count - 7) || (row >= count - 7 && col < 7)

  return (
    <svg
      id={id}
      viewBox={`0 0 ${total} ${total}`}
      className={cn("h-auto w-full", className)}
      role="img"
      aria-label={`QR code linking to ${value}`}
      shapeRendering="geometricPrecision"
    >
      <rect width={total} height={total} fill={background} />
      <g transform={`translate(${quiet} ${quiet})`} fill={foreground}>
        {cells.map(([row, col]) => {
          if (isFinder(row, col)) return null
          // Clear a circle in the middle for the brand mark.
          if (
            centerMark &&
            Math.hypot(row + 0.5 - center, col + 0.5 - center) < holeRadius
          ) {
            return null
          }
          return (
            // Modules are only slightly inset: rounding them further looks
            // nicer on screen but costs contrast, and this code has to scan
            // from a printed card under hall lighting.
            <rect
              key={`${row}-${col}`}
              x={col + 0.04}
              y={row + 0.04}
              width={0.92}
              height={0.92}
              rx={0.22}
            />
          )
        })}

        {/* Finder patterns, drawn as rounded frames. */}
        {[
          [0, 0],
          [0, count - 7],
          [count - 7, 0],
        ].map(([row, col]) => (
          <g key={`f-${row}-${col}`}>
            <rect
              x={col + 0.4}
              y={row + 0.4}
              width={6.2}
              height={6.2}
              rx={1.9}
              fill="none"
              stroke={foreground}
              strokeWidth={1}
            />
            <rect x={col + 2} y={row + 2} width={3} height={3} rx={1} />
          </g>
        ))}

        {centerMark ? (
          <g transform={`translate(${center} ${center}) scale(0.19) translate(-16 -16)`}>
            <path d="M16 3.5c3.3 4.6 3.3 9.1 0 13.7-3.3-4.6-3.3-9.1 0-13.7Z" />
            <path d="M16 17.2c4.6-3.3 9.1-3.3 13.7 0-4.6 3.3-9.1 3.3-13.7 0Z" opacity="0.7" />
            <path d="M16 17.2c-4.6-3.3-9.1-3.3-13.7 0 4.6 3.3 9.1 3.3 13.7 0Z" opacity="0.7" />
            <path d="M16 17.2c3.3 4.6 3.3 8.2 0 11.3-3.3-3.1-3.3-6.7 0-11.3Z" opacity="0.5" />
          </g>
        ) : null}
      </g>
    </svg>
  )
}

/** Serialises the rendered QR to a downloadable SVG file. */
export function downloadQrSvg(elementId: string, filename: string) {
  const el = document.getElementById(elementId)
  if (!el) return
  const clone = el.cloneNode(true) as SVGElement
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg")
  clone.setAttribute("width", "1024")
  clone.setAttribute("height", "1024")

  const blob = new Blob([new XMLSerializer().serializeToString(clone)], {
    type: "image/svg+xml;charset=utf-8",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

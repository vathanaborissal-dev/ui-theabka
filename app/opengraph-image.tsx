import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

/**
 * The link preview card.
 *
 * Rendered here rather than shipped as a file because the design team's
 * `social/share-1200x630.svg` sets its type in live `<text>`: as an image it
 * would fall back to whatever face the reader's machine happened to have, and
 * every platform that matters wants a PNG anyway. This is the same layout,
 * rasterised with the real faces embedded.
 */
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "Theabka — digital invitations, RSVPs and guest lists for Cambodian weddings"

const GARNET = "#8c2f39"
const GOLD = "#c39b52"
const GOLD_ON_DARK = "#e8c98a"
const PARCHMENT = "#fdfaf4"

/** The Arch Card, as inline SVG so it rasterises with everything else. */
function Arch({ scale, stroke, seal }: { scale: number; stroke: string; seal: string }) {
  return (
    <svg width={100 * scale} height={100 * scale} viewBox="0 0 100 100">
      <path
        d="M25 87 V47 Q50 13 75 47 V87 Z"
        fill="none"
        stroke={stroke}
        strokeWidth="10"
        strokeLinejoin="round"
      />
      <circle cx="50" cy="62" r="7.5" fill={seal} />
    </svg>
  )
}

export default async function Image() {
  /*
   * Read from disk rather than fetched. next/og needs the faces as bytes, and
   * a build that reaches out to Google for them fails on a machine with no
   * network — which includes most CI. Both are OFL-licensed, so they travel
   * with the repository.
   */
  const fonts = join(process.cwd(), "app", "_fonts")
  const [quicksand, khmer] = await Promise.all([
    readFile(join(fonts, "Quicksand-Bold.ttf")),
    readFile(join(fonts, "KantumruyPro-SemiBold.ttf")),
  ])

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: PARCHMENT }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            // Fixed to the parchment half rather than flexed, so the two
            // tagline lines break where the layout says and not wherever the
            // measured text happens to run out.
            width: 740,
            padding: "0 32px 0 96px",
          }}
        >
          <div style={{ display: "flex", marginBottom: 40 }}>
            <Arch scale={1.15} stroke={GARNET} seal={GOLD} />
          </div>
          <div style={{ display: "flex", fontFamily: "Quicksand", fontSize: 86, fontWeight: 700, color: "#2b1f1c" }}>
            Theabka
          </div>
          <div style={{ display: "flex", fontFamily: "Kantumruy", fontSize: 60, fontWeight: 600, color: GARNET, marginTop: 12 }}>
            ធៀបការ
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontFamily: "Quicksand", fontSize: 28, color: "#5a4a44", marginTop: 28, lineHeight: 1.45 }}>
            <span style={{ whiteSpace: "nowrap" }}>Digital invitations, RSVPs and guest lists</span>
            <span style={{ whiteSpace: "nowrap" }}>for Cambodian weddings.</span>
          </div>
        </div>

        {/* The garnet panel from the supplied layout, mark reversed out of it. */}
        <div
          style={{
            display: "flex",
            width: 460,
            background: GARNET,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Arch scale={2.4} stroke={PARCHMENT} seal={GOLD_ON_DARK} />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Quicksand", data: quicksand, weight: 700, style: "normal" },
        { name: "Kantumruy", data: khmer, weight: 600, style: "normal" },
      ],
    }
  )
}

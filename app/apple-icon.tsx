import { ImageResponse } from "next/og"

/**
 * The home-screen icon.
 *
 * A PNG rather than the supplied SVG because Safari still will not take an SVG
 * for `apple-touch-icon`. Same artwork, rasterised at the size iOS asks for.
 */
export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#8c2f39",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="144" height="144" viewBox="0 0 100 100">
          <path
            d="M25 87 V47 Q50 13 75 47 V87 Z"
            fill="none"
            stroke="#fdfaf4"
            strokeWidth="10"
            strokeLinejoin="round"
          />
          <circle cx="50" cy="62" r="7.5" fill="#e8c98a" />
        </svg>
      </div>
    ),
    size
  )
}

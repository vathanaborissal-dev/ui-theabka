"use client"

import { useReducedMotion } from "./motion"
import { cn } from "@/lib/utils"
import type { AmbientId } from "@/lib/types"

export const AMBIENT_EFFECTS: Array<{ id: AmbientId; name: { en: string; km: string } }> = [
  { id: "none", name: { en: "None", km: "គ្មាន" } },
  { id: "petals", name: { en: "Falling petals", km: "ក្លីបផ្កាជ្រុះ" } },
  { id: "lotus", name: { en: "Drifting lotus", km: "ផ្កាឈូកអណ្តែត" } },
  { id: "sparkle", name: { en: "Twinkle", km: "ពន្លឺភ្លឹបភ្លែត" } },
  { id: "gold-dust", name: { en: "Gold dust", km: "ធូលីមាស" } },
]

/**
 * Fixed drift parameters rather than Math.random(): the same values must be
 * produced on the server and the client, and a handful of hand-picked lanes
 * looks less clumpy than true randomness anyway.
 */
const LANES = [
  { left: 4, delay: 0, duration: 15, drift: 5, size: 20, spin: 210 },
  { left: 15, delay: 6, duration: 19, drift: -4, size: 14, spin: -180 },
  { left: 27, delay: 2.5, duration: 13, drift: 6, size: 17, spin: 250 },
  { left: 38, delay: 9, duration: 21, drift: -3, size: 12, spin: 160 },
  { left: 49, delay: 4, duration: 16, drift: 4, size: 22, spin: -240 },
  { left: 61, delay: 11, duration: 18, drift: -6, size: 15, spin: 200 },
  { left: 72, delay: 1.5, duration: 14, drift: 5, size: 18, spin: -200 },
  { left: 83, delay: 7.5, duration: 20, drift: -4, size: 13, spin: 230 },
  { left: 93, delay: 3.5, duration: 17, drift: 3, size: 16, spin: -160 },
]

const SPARKS = [
  { left: 8, top: 18, delay: 0, size: 6 },
  { left: 22, top: 62, delay: 1.4, size: 4 },
  { left: 35, top: 30, delay: 2.6, size: 7 },
  { left: 47, top: 78, delay: 0.8, size: 5 },
  { left: 58, top: 14, delay: 3.2, size: 6 },
  { left: 70, top: 55, delay: 1.9, size: 4 },
  { left: 81, top: 34, delay: 2.2, size: 7 },
  { left: 92, top: 70, delay: 0.4, size: 5 },
  { left: 15, top: 88, delay: 3.8, size: 5 },
  { left: 64, top: 92, delay: 2.9, size: 4 },
]

/**
 * A drifting decorative layer over the whole invitation.
 *
 * Pinned with `position: fixed` and `pointer-events: none` so it never
 * intercepts a tap, and skipped entirely when the guest prefers reduced motion
 * — falling petals are exactly the kind of thing that setting exists for.
 */
export function AmbientLayer({ effect, enabled }: { effect: AmbientId; enabled: boolean }) {
  const reduced = useReducedMotion()
  if (!enabled || effect === "none" || reduced) return null

  if (effect === "sparkle" || effect === "gold-dust") {
    const gold = effect === "gold-dust"
    return (
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
        {SPARKS.map((spark, i) => (
          <span
            key={i}
            className={cn(
              "absolute rounded-full",
              gold ? "bg-(--inv-gold)" : "bg-(--inv-accent)"
            )}
            style={{
              left: `${spark.left}%`,
              top: `${spark.top}%`,
              width: gold ? spark.size / 2 : spark.size,
              height: gold ? spark.size / 2 : spark.size,
              animation: `inv-twinkle ${3 + (i % 4)}s ease-in-out ${spark.delay}s infinite`,
            }}
          />
        ))}
      </div>
    )
  }

  const Shape = effect === "lotus" ? LotusPetal : RomduolPetal

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
      {LANES.map((lane, i) => (
        <span
          key={i}
          className="absolute top-0 block text-(--inv-gold)"
          style={
            {
              left: `${lane.left}%`,
              width: lane.size,
              height: lane.size,
              "--drift-x": `${lane.drift}vw`,
              "--drift-spin": `${lane.spin}deg`,
              "--drift-opacity": effect === "lotus" ? 0.5 : 0.65,
              animation: `inv-drift ${lane.duration}s linear ${lane.delay}s infinite`,
            } as React.CSSProperties
          }
        >
          <Shape />
        </span>
      ))}
    </div>
  )
}

function RomduolPetal() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="currentColor">
      <path d="M12 1c6 4 8 10 0 22C4 11 6 5 12 1Z" />
    </svg>
  )
}

function LotusPetal() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" fill="currentColor">
      <path d="M12 2c4.5 5 4.5 12 0 20-4.5-8-4.5-15 0-20Z" opacity="0.9" />
      <path d="M12 12c3-2.2 7-2.2 10 0-3 2.2-7 2.2-10 0Z" opacity="0.45" />
    </svg>
  )
}

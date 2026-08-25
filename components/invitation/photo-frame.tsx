"use client"

import * as React from "react"
import { Photo } from "@/components/shared/photo"
import { KbachCornerRich, Romduol } from "./khmer-ornaments"
import { cn } from "@/lib/utils"
import type { CoverMotionId, PhotoFrameId } from "@/lib/types"

export const PHOTO_FRAMES: Array<{ id: PhotoFrameId; name: { en: string; km: string } }> = [
  { id: "rounded", name: { en: "Rounded", km: "ជ្រុងមូល" } },
  { id: "arch", name: { en: "Temple arch", km: "ស៊ុមប្រាសាទ" } },
  { id: "oval", name: { en: "Oval", km: "ពងក្រពើ" } },
  { id: "circle", name: { en: "Circle", km: "រង្វង់" } },
  { id: "lotus", name: { en: "Lotus", km: "ក្លីបឈូក" } },
  { id: "kbach", name: { en: "Kbach corners", km: "ក្បាច់ជ្រុង" } },
  { id: "gold", name: { en: "Gold frame", km: "ស៊ុមមាស" } },
  { id: "polaroid", name: { en: "Photo print", km: "រូបបោះពុម្ព" } },
  { id: "none", name: { en: "Square", km: "ចតុកោណ" } },
]

/**
 * Clip paths in objectBoundingBox units, so one path works at any aspect ratio.
 * Shapes are chosen to survive that stretching — a circle becomes an ellipse,
 * which is fine, whereas scalloped edges would shear.
 */
const clipPaths: Partial<Record<PhotoFrameId, string>> = {
  arch: "M0,1 L0,0.44 C0,0.16 0.22,0 0.5,0 C0.78,0 1,0.16 1,0.44 L1,1 Z",
  oval: "M0.5,0 C0.84,0 1,0.22 1,0.5 C1,0.78 0.84,1 0.5,1 C0.16,1 0,0.78 0,0.5 C0,0.22 0.16,0 0.5,0 Z",
  lotus:
    "M0.5,0 C0.85,0.2 1,0.36 1,0.5 C1,0.68 0.82,0.9 0.5,1 C0.18,0.9 0,0.68 0,0.5 C0,0.36 0.15,0.2 0.5,0 Z",
}

const motionClass: Record<CoverMotionId, string> = {
  none: "",
  kenburns: "inv-kenburns",
  float: "inv-float",
}

/**
 * A photo with a chosen frame treatment.
 *
 * Some frames are clips (arch, oval, lotus), some are overlays (gold, kbach,
 * polaroid). Keeping both behind one component means templates just say
 * "render the cover" and the guest's chosen frame is applied consistently.
 */
export function FramedPhoto({
  src,
  alt,
  frame = "rounded",
  motion = "none",
  seed = 0,
  className,
  aspect = "aspect-4/5",
}: {
  src?: string
  alt: string
  frame?: PhotoFrameId
  motion?: CoverMotionId
  seed?: number
  className?: string
  aspect?: string
}) {
  const id = React.useId().replace(/:/g, "")
  const clip = clipPaths[frame]

  const shape =
    frame === "circle"
      ? "rounded-full"
      : frame === "rounded" || frame === "kbach" || frame === "gold"
        ? "rounded-[1.75rem]"
        : frame === "polaroid"
          ? "rounded-sm"
          : ""

  const photo = (
    <div
      className={cn("relative overflow-hidden", shape, motionClass[motion])}
      style={clip ? { clipPath: `url(#frame-${id})` } : undefined}
    >
      {clip ? (
        <svg aria-hidden="true" className="absolute size-0">
          <defs>
            <clipPath id={`frame-${id}`} clipPathUnits="objectBoundingBox">
              <path d={clip} />
            </clipPath>
          </defs>
        </svg>
      ) : null}

      <Photo
        src={src}
        alt={alt}
        seed={seed}
        rounded={false}
        className={cn("w-full", frame === "circle" ? "aspect-square" : aspect)}
      />
    </div>
  )

  if (frame === "polaroid") {
    return (
      <div
        className={cn(
          "bg-white p-3 pb-10 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)]",
          "rotate-[-1.4deg] transition-transform duration-500 hover:rotate-0",
          className
        )}
      >
        {photo}
      </div>
    )
  }

  if (frame === "gold") {
    return (
      <div className={cn("relative", className)}>
        <div className="rounded-[2rem] p-[3px] ring-1 ring-(--inv-gold)/60">
          <div className="rounded-[1.85rem] p-[3px] ring-1 ring-(--inv-gold)/35">{photo}</div>
        </div>
        <Romduol className="absolute -top-3 left-1/2 size-8 -translate-x-1/2 text-(--inv-gold)" />
      </div>
    )
  }

  if (frame === "kbach") {
    return (
      <div className={cn("relative", className)}>
        {photo}
        <KbachCornerRich className="absolute -top-3 -left-3 size-12 text-(--inv-gold)" />
        <KbachCornerRich className="absolute -top-3 -right-3 size-12 scale-x-[-1] text-(--inv-gold)" />
        <KbachCornerRich className="absolute -bottom-3 -left-3 size-12 scale-y-[-1] text-(--inv-gold)" />
        <KbachCornerRich className="absolute -right-3 -bottom-3 size-12 scale-[-1] text-(--inv-gold)" />
      </div>
    )
  }

  return <div className={className}>{photo}</div>
}

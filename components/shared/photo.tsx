"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Images in this prototype point at remote stock photos. `Photo` degrades to a
 * tasteful tinted placeholder when a URL is missing or fails to load, so the
 * invitation never shows a broken-image icon in front of a guest.
 */
export function Photo({
  src,
  alt,
  className,
  seed = 0,
  rounded = true,
}: {
  src?: string
  alt: string
  className?: string
  /** Varies the placeholder gradient so galleries don't look repetitive. */
  seed?: number
  rounded?: boolean
}) {
  const [failed, setFailed] = React.useState(false)
  const showPlaceholder = !src || failed

  // See Motif: an image that failed before hydration never fires onError, so
  // check the element itself once it is attached.
  const checkOnMount = React.useCallback((node: HTMLImageElement | null) => {
    if (node && node.complete && node.naturalWidth === 0) setFailed(true)
  }, [])

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted",
        rounded && "rounded-[inherit]",
        className
      )}
    >
      {showPlaceholder ? (
        <PhotoPlaceholder seed={seed} label={alt} />
      ) : (
        /* Remote demo imagery that must degrade gracefully when a URL 404s;
           next/image has no onError fallback, so a plain <img> is correct here. */
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={checkOnMount}
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  )
}

function PhotoPlaceholder({ seed, label }: { seed: number; label: string }) {
  const hue = (seed * 47) % 360
  return (
    <div
      role="img"
      aria-label={label}
      className="flex h-full w-full items-center justify-center"
      style={{
        background: `linear-gradient(145deg,
          oklch(0.93 0.04 ${hue}) 0%,
          oklch(0.88 0.055 ${(hue + 30) % 360}) 55%,
          oklch(0.82 0.05 ${(hue + 60) % 360}) 100%)`,
      }}
    >
      <svg
        viewBox="0 0 64 64"
        aria-hidden="true"
        className="h-1/3 max-h-16 w-1/3 max-w-16 opacity-45"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          d="M32 8c5 7 5 13 0 20-5-7-5-13 0-20Zm0 20c7-5 13-5 20 0-7 5-13 5-20 0Zm0 0c-7-5-13-5-20 0 7 5 13 5 20 0Zm0 0c5 7 5 13 0 20-5-7-5-13 0-20Z"
          className="text-foreground/50"
        />
        <circle cx="32" cy="28" r="2" className="text-foreground/50" />
      </svg>
    </div>
  )
}

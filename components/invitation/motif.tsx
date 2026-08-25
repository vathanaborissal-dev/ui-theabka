"use client"

import * as React from "react"
import { findMotif } from "@/lib/invitation/motif-assets"
import { cn } from "@/lib/utils"

/**
 * Renders supplied artwork for a motif slot, falling back to the hand-drawn
 * component when none has been provided — or when the file fails to load.
 *
 * This is what lets artwork be added incrementally: every call site names the
 * slot and passes its drawn fallback, so the invitation is never broken by a
 * missing or mistyped file.
 */
export function Motif({
  assetId,
  fallback,
  alt = "",
  className,
  tint,
}: {
  /** Id from MOTIF_ASSETS; undefined uses the fallback. */
  assetId?: string
  fallback: React.ReactNode
  alt?: string
  className?: string
  /** CSS colour applied to tintable single-colour artwork. */
  tint?: string
}) {
  const asset = findMotif(assetId)
  const [failed, setFailed] = React.useState(false)

  // An image that 404s during SSR hydration has already fired (and lost) its
  // error event by the time React attaches onError, so also inspect the
  // element on mount: a complete image with no intrinsic width has failed.
  const checkOnMount = React.useCallback((node: HTMLImageElement | null) => {
    if (node && node.complete && node.naturalWidth === 0) setFailed(true)
  }, [])

  if (!asset || failed) return <>{fallback}</>

  // A tintable silhouette is painted with a CSS mask so it picks up the
  // palette, exactly like the drawn motifs do.
  if (asset.tintable) {
    return (
      <span
        aria-hidden={alt ? undefined : true}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        className={cn("block", className)}
        style={{
          backgroundColor: tint ?? "currentColor",
          maskImage: `url(/${asset.file})`,
          WebkitMaskImage: `url(/${asset.file})`,
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
          maskSize: "contain",
          WebkitMaskSize: "contain",
        }}
      />
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={checkOnMount}
      src={`/${asset.file}`}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cn("block h-full w-full object-contain", className)}
    />
  )
}

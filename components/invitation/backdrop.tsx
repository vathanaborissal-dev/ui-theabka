"use client"

import { DEFAULT_BACKDROP_VIDEO, getBackdrop } from "@/lib/invitation/backdrops"
import { cloudinaryUrl } from "@/lib/uploads"
import { cn } from "@/lib/utils"

/**
 * The background layer behind the whole invitation.
 *
 * The public page uses `fixed` so the card slides over a background that stays
 * put. Editor previews use `absolute` instead, keeping that layer inside the
 * phone frame rather than letting it cover the dashboard. It is inert to
 * pointers so it never swallows a tap meant for the card.
 */
export function Backdrop({
  backdropId,
  photo,
  customPhoto,
  video,
  contained = false,
  className,
}: {
  backdropId?: string
  /** Used only by the "photo" backdrop. */
  photo?: string
  /** Used only by the "custom" backdrop. */
  customPhoto?: string
  /** Used only by the "video" backdrop. */
  video?: string
  /** Keep the layer inside an editor preview instead of covering the browser. */
  contained?: boolean
  className?: string
}) {
  const backdrop = getBackdrop(backdropId)
  const position = contained ? "absolute" : "fixed"
  if (backdrop.id === "none") return null

  if (backdrop.id === "video") {
    return (
      <div
        aria-hidden="true"
        className={cn("pointer-events-none inset-0 z-0 bg-black", position, className)}
      >
        {/*
         * `muted` and `playsInline` are load-bearing rather than stylistic.
         * Without muted no browser will autoplay this at all, and without
         * playsInline iOS takes the video fullscreen the moment it starts —
         * which would put a video player over the invitation instead of
         * behind it.
         *
         * No controls and no sound: this is wallpaper. Audio on this card is
         * the music player's job, where a guest can actually stop it.
         */}
        <video
          className="size-full object-cover"
          src={video || DEFAULT_BACKDROP_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      </div>
    )
  }

  if (backdrop.id === "photo" || backdrop.id === "custom") {
    const image = backdrop.id === "custom" ? customPhoto : photo
    if (!image) return null
    return (
      <div
        aria-hidden="true"
        className={cn("pointer-events-none inset-0 z-0", position, className)}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${cloudinaryUrl(image, "f_auto,q_auto,c_fill,w_1200")})`,
          }}
        />
        {/* The card sits on top at partial opacity, so the photo has to be
            quietened or every line of text loses its contrast. */}
        <div className="absolute inset-0 bg-(--inv-bg)/55" />
      </div>
    )
  }

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none inset-0 z-0", position, className)}
      style={backdrop.css}
    />
  )
}

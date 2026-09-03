"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { ChevronLeft, ChevronRight, ImageOff, X } from "lucide-react"

import { useLocale } from "@/components/providers/locale-provider"
import { cloudinaryUrl } from "@/lib/uploads"
import { cn } from "@/lib/utils"
import type { CameraPhoto } from "@/lib/camera"

/**
 * One photo, filling the screen.
 *
 * The grid crops every photo to a square so the wall of them reads evenly;
 * this is where the picture someone actually took gets to be the shape they
 * took it. Hence `c_limit` rather than the grid's `c_fill` — a portrait of the
 * couple's grandmother should not be cropped to her forehead because the
 * thumbnail was square.
 *
 * Built on the dialog primitive for the parts that are easy to get wrong:
 * focus goes into the viewer and comes back out to the photo that was clicked,
 * Escape closes, and the page behind stops scrolling.
 */
export function PhotoLightbox({
  photos,
  index,
  filter = "",
  onIndexChange,
  onClose,
}: {
  photos: CameraPhoto[]
  /** The photo being viewed, or null when the viewer is closed. */
  index: number | null
  /** The developed look, so full screen matches the thumbnail it came from. */
  filter?: string
  onIndexChange: (index: number) => void
  onClose: () => void
}) {
  const { t } = useLocale()
  const open = index !== null && index >= 0 && index < photos.length
  const photo = open ? photos[index] : null
  /*
   * A photo whose file will not load says so.
   *
   * The couple's grid deliberately keeps a tile for one of these so they can
   * delete it, and arrowing along would otherwise land on a torn frame with no
   * explanation of what happened to it.
   */
  const [failed, setFailed] = React.useState<Set<string>>(new Set())

  const step = React.useCallback(
    (by: number) => {
      if (index === null || photos.length === 0) return
      // Wraps, because a gallery is a loop and hunting for the end of one is
      // not a thing anyone wants to do on a phone.
      onIndexChange((index + by + photos.length) % photos.length)
    },
    [index, photos.length, onIndexChange]
  )

  React.useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") step(1)
      if (event.key === "ArrowLeft") step(-1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, step])

  /*
   * Swipe, which on a phone is how anyone will actually move between photos.
   *
   * Pointer events rather than touch events so a trackpad drag works the same,
   * and a threshold generous enough that a slightly diagonal thumb still
   * counts as a swipe rather than a tap.
   */
  const swipeFrom = React.useRef<{ x: number; y: number } | null>(null)

  function onPointerDown(event: React.PointerEvent) {
    swipeFrom.current = { x: event.clientX, y: event.clientY }
  }

  function onPointerUp(event: React.PointerEvent) {
    const from = swipeFrom.current
    swipeFrom.current = null
    if (!from) return
    const dx = event.clientX - from.x
    const dy = event.clientY - from.y
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      step(dx < 0 ? 1 : -1)
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogPrimitive.Portal>
        {/* Fully opaque, not a tint. At 95% the gallery underneath showed
            through — bright photos on a dark page read straight past it, and
            the page's own controls collided with the viewer's. A photo viewer
            should have the photo and nothing else in it. */}
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup
          className="fixed inset-0 z-50 flex flex-col outline-none duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
          // The photo is the content; a visible heading would sit on top of it.
          aria-label={t("camera.viewPhoto")}
        >
          <div className="flex items-center justify-between px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
            <span className="font-mono text-xs text-white/55 tabular-nums">
              {open ? `${index + 1} / ${photos.length}` : null}
            </span>
            <DialogPrimitive.Close
              className="grid size-10 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
              aria-label={t("camera.close")}
            >
              <X className="size-5" aria-hidden="true" />
            </DialogPrimitive.Close>
          </div>

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-2"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
          >
            {photo && failed.has(photo.id) ? (
              <p className="flex items-center gap-2 text-sm text-white/50">
                <ImageOff className="size-5" aria-hidden="true" />
                {t("camera.photoUnavailable")}
              </p>
            ) : photo ? (
              /* eslint-disable-next-line @next/next/no-img-element -- no image
                 loader is configured for the storage host. */
              <img
                // Keyed so the browser paints the new photo rather than holding
                // the previous one on screen while the next decodes.
                key={photo.id}
                src={cloudinaryUrl(
                  photo.url,
                  filter ? `f_auto,q_auto,c_limit,w_1600/${filter}` : "f_auto,q_auto,c_limit,w_1600"
                )}
                alt=""
                onError={() => setFailed((current) => new Set(current).add(photo.id))}
                className="max-h-full max-w-full object-contain select-none"
                draggable={false}
              />
            ) : null}

            {photos.length > 1 ? (
              <>
                <Arrow side="left" label={t("camera.previous")} onClick={() => step(-1)} />
                <Arrow side="right" label={t("camera.next")} onClick={() => step(1)} />
              </>
            ) : null}
          </div>

          <div className="min-h-10 px-6 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] text-center">
            {photo?.by ? (
              <p className="text-sm text-white/70">
                {t("camera.byLine").replace("%s", photo.by)}
              </p>
            ) : null}
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

/** Big enough to hit with a thumb, quiet enough not to compete with the photo. */
function Arrow({
  side,
  label,
  onClick,
}: {
  side: "left" | "right"
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "absolute top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white/80 backdrop-blur-sm transition hover:bg-black/60 hover:text-white focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none",
        side === "left" ? "left-2" : "right-2"
      )}
    >
      {side === "left" ? (
        <ChevronLeft className="size-6" aria-hidden="true" />
      ) : (
        <ChevronRight className="size-6" aria-hidden="true" />
      )}
    </button>
  )
}

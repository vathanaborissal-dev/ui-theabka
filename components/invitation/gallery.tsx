"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Photo } from "@/components/shared/photo"
import { useLocale } from "@/components/providers/locale-provider"
import { cn } from "@/lib/utils"
import type { GalleryLayoutId, PhotoFrameId } from "@/lib/types"
import { FramedPhoto } from "./photo-frame"

export const GALLERY_LAYOUTS: Array<{
  id: GalleryLayoutId
  name: { en: string; km: string }
}> = [
  { id: "grid", name: { en: "Grid", km: "ក្រឡាចត្រង្គ" } },
  { id: "carousel", name: { en: "Swipe", km: "អូសមើល" } },
  { id: "masonry", name: { en: "Mosaic", km: "ម៉ូសាអ៊ិក" } },
  { id: "strip", name: { en: "Film strip", km: "ខ្សែភាពយន្ត" } },
]

/**
 * The photo gallery, in four arrangements, with a tap-to-enlarge lightbox.
 *
 * "Swipe" is the default worth reaching for on a phone: it keeps the page short
 * while letting a couple show twenty photos, which is the whole reason to have
 * a digital invitation alongside the printed card.
 */
export function InvitationGallery({
  photos,
  layout = "grid",
  frame = "rounded",
}: {
  photos: string[]
  layout?: GalleryLayoutId
  frame?: PhotoFrameId
}) {
  const [lightbox, setLightbox] = React.useState<number | null>(null)
  if (photos.length === 0) return null

  // Ornate frames on every thumbnail is too much; keep gallery tiles simple
  // unless the frame is a plain shape.
  const tileFrame: PhotoFrameId =
    frame === "gold" || frame === "kbach" || frame === "polaroid" ? "rounded" : frame

  const open = (index: number) => setLightbox(index)

  return (
    <>
      {layout === "carousel" ? (
        <Carousel photos={photos} frame={tileFrame} onOpen={open} />
      ) : layout === "strip" ? (
        <FilmStrip photos={photos} onOpen={open} />
      ) : layout === "masonry" ? (
        <Masonry photos={photos} frame={tileFrame} onOpen={open} />
      ) : (
        <Grid photos={photos} frame={tileFrame} onOpen={open} />
      )}

      <Lightbox
        photos={photos}
        index={lightbox}
        onClose={() => setLightbox(null)}
        onIndex={setLightbox}
      />
    </>
  )
}

type TileProps = { photos: string[]; frame: PhotoFrameId; onOpen: (i: number) => void }

function Grid({ photos, frame, onOpen }: TileProps) {
  return (
    <ul className="mx-auto grid max-w-3xl grid-cols-2 gap-2 @xl:gap-3 @3xl:grid-cols-4">
      {photos.map((src, i) => (
        <li key={`${src}-${i}`} className={cn(i === 0 && "col-span-2 row-span-2")}>
          <PhotoButton src={src} index={i} frame={frame} onOpen={onOpen} aspect="aspect-square" />
        </li>
      ))}
    </ul>
  )
}

function Masonry({ photos, frame, onOpen }: TileProps) {
  return (
    <ul className="mx-auto max-w-3xl columns-2 gap-2 @xl:gap-3 @3xl:columns-3">
      {photos.map((src, i) => (
        <li key={`${src}-${i}`} className="mb-2 break-inside-avoid @xl:mb-3">
          <PhotoButton
            src={src}
            index={i}
            frame={frame}
            onOpen={onOpen}
            aspect={i % 3 === 0 ? "aspect-3/4" : i % 3 === 1 ? "aspect-square" : "aspect-4/5"}
          />
        </li>
      ))}
    </ul>
  )
}

function Carousel({ photos, frame, onOpen }: TileProps) {
  const { t } = useLocale()
  const scroller = React.useRef<HTMLUListElement>(null)

  const nudge = (direction: 1 | -1) => {
    const node = scroller.current
    if (!node) return
    node.scrollBy({ left: direction * node.clientWidth * 0.8, behavior: "smooth" })
  }

  return (
    <div className="relative">
      <ul
        ref={scroller}
        className="hide-scrollbar -mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-6 pb-2"
      >
        {photos.map((src, i) => (
          <li key={`${src}-${i}`} className="w-[72%] shrink-0 snap-center @xl:w-[46%]">
            <PhotoButton src={src} index={i} frame={frame} onOpen={onOpen} aspect="aspect-4/5" />
          </li>
        ))}
      </ul>

      {photos.length > 1 ? (
        <div className="mt-3 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => nudge(-1)}
            aria-label={t("action.back")}
            className="flex size-9 items-center justify-center rounded-full border border-(--inv-border) text-(--inv-fg) outline-none hover:bg-(--inv-surface) focus-visible:ring-3 focus-visible:ring-(--inv-accent)/40"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => nudge(1)}
            aria-label={t("action.next")}
            className="flex size-9 items-center justify-center rounded-full border border-(--inv-border) text-(--inv-fg) outline-none hover:bg-(--inv-surface) focus-visible:ring-3 focus-visible:ring-(--inv-accent)/40"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      ) : null}
    </div>
  )
}

function FilmStrip({ photos, onOpen }: Omit<TileProps, "frame">) {
  return (
    <ul className="hide-scrollbar -mx-6 flex gap-1 overflow-x-auto px-6">
      {photos.map((src, i) => (
        <li key={`${src}-${i}`} className="w-40 shrink-0 @xl:w-56">
          <PhotoButton src={src} index={i} frame="none" onOpen={onOpen} aspect="aspect-3/4" />
        </li>
      ))}
    </ul>
  )
}

function PhotoButton({
  src,
  index,
  frame,
  onOpen,
  aspect,
}: {
  src: string
  index: number
  frame: PhotoFrameId
  onOpen: (i: number) => void
  aspect: string
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      className="group block w-full cursor-zoom-in overflow-hidden outline-none focus-visible:ring-3 focus-visible:ring-(--inv-accent)/50"
      aria-label={`Enlarge photograph ${index + 1}`}
    >
      <FramedPhoto
        src={src}
        alt={`Photograph ${index + 1}`}
        frame={frame}
        seed={index + 5}
        aspect={aspect}
        className="transition-transform duration-500 group-hover:scale-[1.03]"
      />
    </button>
  )
}

function Lightbox({
  photos,
  index,
  onClose,
  onIndex,
}: {
  photos: string[]
  index: number | null
  onClose: () => void
  onIndex: (i: number) => void
}) {
  const { t } = useLocale()

  React.useEffect(() => {
    if (index === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") onIndex((index + 1) % photos.length)
      if (e.key === "ArrowLeft") onIndex((index - 1 + photos.length) % photos.length)
    }
    window.addEventListener("keydown", onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = previous
    }
  }, [index, photos.length, onClose, onIndex])

  if (index === null) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t("inv.gallery")}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t("action.close")}
        className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white outline-none hover:bg-white/20 focus-visible:ring-3 focus-visible:ring-white/50"
      >
        <X className="size-5" />
      </button>

      <Photo
        src={photos[index]}
        alt={`Photograph ${index + 1}`}
        seed={index + 5}
        className="max-h-[85svh] w-auto max-w-full rounded-lg"
      />

      {photos.length > 1 ? (
        <>
          <NavButton
            side="left"
            label={t("action.back")}
            onClick={(e) => {
              e.stopPropagation()
              onIndex((index - 1 + photos.length) % photos.length)
            }}
          />
          <NavButton
            side="right"
            label={t("action.next")}
            onClick={(e) => {
              e.stopPropagation()
              onIndex((index + 1) % photos.length)
            }}
          />
          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-sm text-white/70">
            {index + 1} / {photos.length}
          </p>
        </>
      ) : null}
    </div>
  )
}

function NavButton({
  side,
  label,
  onClick,
}: {
  side: "left" | "right"
  label: string
  onClick: (e: React.MouseEvent) => void
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "absolute top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white outline-none hover:bg-white/20 focus-visible:ring-3 focus-visible:ring-white/50",
        side === "left" ? "left-3" : "right-3"
      )}
    >
      <Icon className="size-5" />
    </button>
  )
}

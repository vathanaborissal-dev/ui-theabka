"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"

import { useLocale } from "@/components/providers/locale-provider"
import { Button } from "@/components/ui/button"
import { listCameraPhotos, type CameraPhoto } from "@/lib/camera"
import { cameraFilterTransform } from "@/lib/camera-filters"
import { imageSrcSet } from "@/lib/uploads"
import { InvitationLanguageToggle } from "@/components/invitation/language-toggle"
import { KbachDivider } from "@/components/invitation/ornaments"
import { PhotoLightbox } from "./photo-lightbox"

/**
 * The roll, developed.
 *
 * Loads a page at a time — a wedding camera with two hundred guests on it is
 * not something to hand a phone in one response — and appends rather than
 * paging, because this is a gallery to scroll through, not a table to page.
 */
export function RevealedGallery({
  slug,
  title,
  filter,
}: {
  slug: string
  title: string
  /** The couple's chosen look, applied on delivery — the stored photo is untouched. */
  filter?: string
}) {
  const { t } = useLocale()
  const [photos, setPhotos] = React.useState<CameraPhoto[]>([])
  const [page, setPage] = React.useState(0)
  const [hasMore, setHasMore] = React.useState(true)
  const [loading, setLoading] = React.useState(true)
  /*
   * A photo whose file will not load is dropped rather than shown as a broken
   * frame. There is nothing a guest could do about it, and the gallery reads
   * better with one fewer photo than with a torn one.
   */
  const [broken, setBroken] = React.useState<Set<string>>(new Set())
  const effect = cameraFilterTransform(filter)
  /** Which photo is open full screen, or null. */
  const [viewing, setViewing] = React.useState<number | null>(null)

  React.useEffect(() => {
    let cancelled = false
    listCameraPhotos(slug, page)
      .then((result) => {
        if (cancelled) return
        // Appending by page rather than replacing, and de-duplicated by id: a
        // photo deleted between two pages shifts everything up by one, which
        // would otherwise show a neighbour twice.
        setPhotos((current) => {
          const seen = new Set(current.map((photo) => photo.id))
          return [...current, ...result.items.filter((photo) => !seen.has(photo.id))]
        })
        setHasMore(result.meta.hasMore)
      })
      .catch(() => !cancelled && setHasMore(false))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [slug, page])

  /*
   * The grid and the full-screen viewer page through the same list, so "the
   * third photo" means the same thing in both. Photos whose file will not load
   * are dropped from it, which is also why the viewer never lands on one.
   */
  const visible = photos.filter((photo) => !broken.has(photo.id))

  return (
    <div className="relative z-10 min-h-svh px-4 py-12 text-(--inv-fg)">
      <InvitationLanguageToggle />
      <header className="mx-auto mb-8 max-w-2xl space-y-3 text-center">
        <h1
          className="text-2xl leading-snug text-(--inv-accent)"
          style={{ fontFamily: "var(--inv-font-display)" }}
        >
          {title}
        </h1>
        <KbachDivider className="mx-auto w-40 text-(--inv-gold)" />
        <p className="text-sm text-(--inv-muted)">{t("camera.gallery")}</p>
      </header>

      {photos.length === 0 && !loading ? (
        <p className="text-center text-sm text-(--inv-muted)">{t("camera.galleryEmpty")}</p>
      ) : (
        <div className="mx-auto grid max-w-2xl grid-cols-2 gap-2 sm:grid-cols-3">
          {visible.map((photo, position) => (
            <figure
              key={photo.id}
              className="group relative overflow-hidden rounded-sm border border-(--inv-border) bg-(--inv-surface)"
            >
              {/* A button, not a div with a click handler: this is the way into
                  the photo, so it should be reachable by keyboard and announced
                  as something you can press. */}
              <button
                type="button"
                onClick={() => setViewing(position)}
                aria-label={t("camera.viewPhoto")}
                className="block size-full cursor-zoom-in focus-visible:ring-2 focus-visible:ring-(--inv-accent) focus-visible:outline-none"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- the
                    gallery is a public page with no image loader configured for
                    the storage host, and these are already resized on the way in. */}
                <img
                  {...imageSrcSet(photo.url, {
                    sizes: "(min-width: 640px) 33vw, 50vw",
                    effect,
                  })}
                  alt=""
                  loading="lazy"
                  onError={() => setBroken((current) => new Set(current).add(photo.id))}
                  className="aspect-square size-full object-cover transition duration-300 group-hover:scale-[1.02]"
                />
              </button>
              {photo.by ? (
                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pt-6 pb-1.5 text-[11px] text-white/85">
                  {t("camera.byLine").replace("%s", photo.by)}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      )}

      <PhotoLightbox
        photos={visible}
        index={viewing}
        filter={effect}
        onIndexChange={setViewing}
        onClose={() => setViewing(null)}
      />

      <div className="mt-8 flex justify-center">
        {loading ? (
          <Loader2 className="size-5 animate-spin text-(--inv-muted)" aria-hidden="true" />
        ) : hasMore ? (
          <Button
            variant="secondary"
            className="border border-(--inv-border) bg-(--inv-surface) text-(--inv-fg) hover:bg-(--inv-bg)"
            onClick={() => {
              // Set from the click rather than from the effect: the spinner
              // belongs to the press that asked for more, and setting it inside
              // the effect is a second render for something already known here.
              setLoading(true)
              setPage((current) => current + 1)
            }}
          >
            {t("camera.showMore")}
          </Button>
        ) : null}
      </div>
    </div>
  )
}

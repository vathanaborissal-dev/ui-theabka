"use client"

import { MapPin, Navigation } from "lucide-react"
import { useLocale } from "@/components/providers/locale-provider"
import type { Venue } from "@/lib/types"

export function InvitationVenue({ venue, showMap }: { venue: Venue; showMap: boolean }) {
  const { t, L } = useLocale()

  return (
    <div className="mx-auto max-w-md text-center">
      <p
        className="text-xl text-(--inv-fg)"
        style={{ fontFamily: "var(--inv-font-display)" }}
      >
        {L(venue.name)}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-(--inv-muted)">{L(venue.address)}</p>
      {venue.landmark ? (
        <p className="mt-1.5 text-sm text-(--inv-muted)">{L(venue.landmark)}</p>
      ) : null}

      {showMap && venue.mapUrl ? (
        <a
          href={venue.mapUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-(--inv-accent) px-5 py-2.5 text-sm font-medium text-(--inv-accent) transition-colors outline-none hover:bg-(--inv-accent) hover:text-(--inv-accent-contrast) focus-visible:ring-3 focus-visible:ring-(--inv-accent)/40"
        >
          <Navigation className="size-4" aria-hidden="true" />
          {t("public.getDirections")}
        </a>
      ) : null}

      {showMap ? (
        <div
          className="mt-6 flex aspect-[16/9] w-full items-center justify-center rounded-lg border border-(--inv-border) bg-(--inv-surface)"
          role="img"
          aria-label={`Map showing ${L(venue.name)}`}
        >
          <div className="flex flex-col items-center gap-1.5 text-(--inv-muted)">
            <MapPin className="size-6" aria-hidden="true" />
            <span className="text-xs">{L(venue.name)}</span>
          </div>
        </div>
      ) : null}
    </div>
  )
}

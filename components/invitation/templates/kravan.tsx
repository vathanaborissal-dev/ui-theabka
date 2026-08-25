"use client"

import { ChevronDown } from "lucide-react"
import { Photo } from "@/components/shared/photo"
import { useLocale } from "@/components/providers/locale-provider"
import { cn } from "@/lib/utils"
import { formatDate, formatTime } from "@/lib/format"
import { InvitationCountdown } from "../sections/countdown"
import { InvitationSchedule } from "../sections/schedule"
import { InvitationVenue } from "../sections/venue"
import { InvitationRsvpForm } from "../sections/rsvp-form"
import {
  AddToCalendar,
  ContactList,
  GalleryStrip,
  GiftNote,
  InvSection,
  InvitationFooter,
} from "../sections/common"
import type { TemplateProps } from "./types"

/**
 * Kravan — photo first.
 *
 * A full-height cover with the names set over it, then content on raised
 * panels. Designed for couples who have a photo they want to lead with.
 */
export function KravanTemplate({ event, guestName }: TemplateProps) {
  const { t, L, locale } = useLocale()
  const design = event.design

  return (
    <article className="bg-(--inv-bg) text-(--inv-fg)">
      <header className="relative flex min-h-[86svh] flex-col justify-end overflow-hidden">
        <Photo
          src={design.coverPhoto ?? event.coverPhoto}
          alt=""
          seed={4}
          rounded={false}
          className={cn(
            "absolute inset-0 h-full w-full",
            design.coverMotion === "kenburns" && "inv-kenburns",
            design.coverMotion === "float" && "inv-float"
          )}
        />
        <div
          className="absolute inset-0 bg-linear-to-t from-black/80 via-black/35 to-black/25"
          aria-hidden="true"
        />

        <div className="relative px-6 pb-16 text-center text-white @xl:pb-24">
          <p className="text-[0.75rem] tracking-[0.3em] uppercase opacity-85">
            {t(`event.type.${event.type}`)}
          </p>
          <h1
            className="mt-5 text-[clamp(2rem,8.5cqi,3.75rem)] leading-[1.08] tracking-tight text-balance break-words"
            style={{ fontFamily: "var(--inv-font-display)" }}
          >
            {event.hosts.map((h) => L(h.name)).join("  &  ")}
          </h1>
          <p className="mt-5 text-base opacity-90">
            {formatDate(event.date, locale, "long")} · {formatTime(event.date, locale)}
          </p>
          <p className="mt-1 text-sm opacity-75">{L(event.venue.name)}</p>

          <ChevronDown
            className="mx-auto mt-10 size-5 animate-bounce opacity-70"
            aria-hidden="true"
          />
        </div>
      </header>

      <InvSection>
        <div className="mx-auto max-w-md rounded-2xl border border-(--inv-border) bg-(--inv-surface) p-8 text-center">
          <p className="text-sm leading-relaxed text-(--inv-muted)">{L(design.greeting)}</p>
          <p className="mt-4 text-base leading-loose text-(--inv-fg)">{L(design.message)}</p>
          <div className="mt-8">
            <AddToCalendar event={event} />
          </div>
        </div>
        <div className="mt-12">
          <InvitationCountdown date={event.date} />
        </div>
      </InvSection>

      {design.showGallery && design.gallery.length > 0 ? (
        <InvSection title={t("inv.gallery")} ornament="rule">
          <GalleryStrip photos={design.gallery} />
        </InvSection>
      ) : null}

      {design.showSchedule && event.schedule.length > 0 ? (
        <InvSection title={t("public.scheduleTitle")} ornament="rule">
          <div className="mx-auto max-w-lg rounded-2xl border border-(--inv-border) bg-(--inv-surface) p-6 @xl:p-8">
            <InvitationSchedule items={event.schedule} />
          </div>
        </InvSection>
      ) : null}

      <InvSection title={t("public.venueTitle")} ornament="rule">
        <InvitationVenue venue={event.venue} showMap={design.showMap} />
      </InvSection>

      {design.showGiftInfo && design.giftNote ? (
        <InvSection title={t("public.giftTitle")} ornament="rule">
          <GiftNote note={design.giftNote} />
        </InvSection>
      ) : null}

      {design.showRsvp ? (
        <InvSection id="rsvp" title={t("public.rsvpTitle")} ornament="rule">
          <InvitationRsvpForm event={event} guestName={guestName} />
        </InvSection>
      ) : null}

      {event.contacts.length > 0 ? (
        <InvSection title={t("public.contactHosts")} ornament="rule">
          <ContactList contacts={event.contacts} />
        </InvSection>
      ) : null}

      <InvitationFooter event={event} />
    </article>
  )
}

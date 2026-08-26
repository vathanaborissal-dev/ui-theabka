"use client"

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
/** One floating card in the stack. */
const PANEL =
  "rounded-[1.75rem] bg-(--inv-bg) px-6 py-10 shadow-sm ring-1 ring-(--inv-border) @xl:px-10 @xl:py-12"

export function KravanTemplate({ event, guestName }: TemplateProps) {
  const { t, L, locale } = useLocale()
  const design = event.design

  return (
    <article data-inv-template="kravan" className="bg-(--inv-bg) text-(--inv-fg)">
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

        <div className="relative px-6 pb-16 text-left text-white @xl:max-w-2xl @xl:px-12 @xl:pb-24">
          <p className="text-[0.75rem] tracking-[0.3em] uppercase opacity-85">
            {t(`event.type.${event.type}`)}
          </p>
          <h1
            className="mt-5 text-[clamp(2rem,8.5cqi,3.75rem)] leading-[1.08] tracking-tight text-balance break-words"
            style={{ fontFamily: "var(--inv-font-display)" }}
          >
            {event.hosts.map((h) => L(h.name)).join("  &  ")}
          </h1>
          <p className="mt-5 text-base opacity-90">{formatDate(event.date, locale, "long")}</p>
          <p className="mt-1 text-sm opacity-75">
            {formatTime(event.date, locale)}, {L(event.venue.name)}
          </p>
        </div>
      </header>

      {/* The body is a stack of separate panels on a tinted ground, and the
          first one lifts over the photo — so the card reads as a set of cards
          rather than one continuous scroll. */}
      <div className="relative -mt-14 space-y-5 rounded-t-[2rem] bg-(--inv-surface) px-4 pt-6 pb-10 @xl:-mt-20 @xl:space-y-6 @xl:px-8 @xl:pt-10">
        <InvSection align="left" className={PANEL}>
          <p className="text-sm leading-relaxed text-(--inv-muted)">{L(design.greeting)}</p>
          <p className="mt-4 text-base leading-loose text-(--inv-fg)">{L(design.message)}</p>
          <div className="mt-8">
            <AddToCalendar event={event} />
          </div>
          <div className="mt-10">
            <InvitationCountdown variant="boxed" date={event.date} />
          </div>
        </InvSection>

        {design.showGallery && design.gallery.length > 0 ? (
          <InvSection align="left" title={t("inv.gallery")} ornament="rule" className={PANEL}>
            <GalleryStrip photos={design.gallery} />
          </InvSection>
        ) : null}

        {design.showSchedule && event.schedule.length > 0 ? (
          <InvSection
            align="left"
            title={t("public.scheduleTitle")}
            ornament="rule"
            className={PANEL}
          >
            <InvitationSchedule items={event.schedule} variant="cards" />
          </InvSection>
        ) : null}

        <InvSection
          align="left"
          title={t("public.venueTitle")}
          ornament="rule"
          className={PANEL}
        >
          <InvitationVenue variant="split" venue={event.venue} showMap={design.showMap} />
        </InvSection>

        {design.showGiftInfo && design.giftNote ? (
          <InvSection align="left" title={t("public.giftTitle")} ornament="rule" className={PANEL}>
            <GiftNote note={design.giftNote} />
          </InvSection>
        ) : null}

        {design.showRsvp ? (
          <InvSection
            align="left"
            id="rsvp"
            title={t("public.rsvpTitle")}
            ornament="rule"
            className={PANEL}
          >
            <InvitationRsvpForm event={event} guestName={guestName} />
          </InvSection>
        ) : null}

        {event.contacts.length > 0 ? (
          <InvSection
            align="left"
            title={t("public.contactHosts")}
            ornament="rule"
            className={PANEL}
          >
            <ContactList contacts={event.contacts} />
          </InvSection>
        ) : null}
      </div>

      <InvitationFooter event={event} />
    </article>
  )
}

"use client"

import { useLocale } from "@/components/providers/locale-provider"
import { formatDate, formatTime } from "@/lib/format"
import { FramedPhoto } from "@/components/invitation/photo-frame"
import { Motif } from "@/components/invitation/motif"
import { PatternBackground } from "@/components/invitation/patterns"
import { InvitationCountdown } from "../sections/countdown"
import { InvitationSchedule } from "../sections/schedule"
import { InvitationVenue } from "../sections/venue"
import { InvitationRsvpForm } from "../sections/rsvp-form"
import { GuestHonour } from "../sections/guest-honour"
import {
  AddToCalendar,
  ContactList,
  GalleryStrip,
  GiftNote,
  InvSection,
  InvitationFooter,
} from "../sections/common"
import { useOrnaments } from "./use-ornaments"
import type { TemplateProps } from "./types"

/**
 * Kbach — the carved-border card.
 *
 * Where the other templates decorate a section at a time, this one is defined
 * by a single continuous kbach band running around the whole card. It is drawn
 * with CSS `border-image` rather than four positioned images: the artwork is
 * nine-sliced, so the corner carvings stay at their true proportions while only
 * the straight runs repeat, and the frame therefore survives any card height
 * from a phone to a desktop preview.
 */
const BORDER: React.CSSProperties = {
  borderStyle: "solid",
  // Thin enough on a phone that the band never eats the text column.
  borderWidth: "clamp(18px, 6cqi, 40px)",
  borderImageSource: "url(/motifs/frames/border--kbach-red-gold.png)",
  // The band measures ~88px into a 1392x1000 source, plus a little padding.
  borderImageSlice: "92",
  // "round" keeps whole repeats of the motif; "stretch" would smear it.
  borderImageRepeat: "round",
}

export function KbachTemplate({ event, guestName }: TemplateProps) {
  const { t, L, locale } = useLocale()
  const design = event.design
  const orn = useOrnaments(design, "rich")

  return (
    <article
      data-inv-template="kbach"
      className="relative bg-(--inv-bg) text-(--inv-fg)"
      style={BORDER}
    >
      {orn.pattern !== "none" ? (
        <PatternBackground
          pattern={orn.pattern}
          className="text-(--inv-accent)"
          scale={0.75}
          opacity={orn.patternOpacity}
        />
      ) : null}

      <div className="relative">
        <header className="px-5 pt-12 pb-6 text-center @xl:pt-16">
          {/* The diamond seal stands in for the wax seal on the printed card. */}
          <div className="mx-auto h-20 w-16 @xl:h-24 @xl:w-20">
            <Motif assetId="seal-kbach-diamond" fallback={null} />
          </div>

          <p className="mt-6 text-sm tracking-[0.24em] text-(--inv-muted) uppercase">
            {L(design.greeting) || t("public.withBlessing")}
          </p>

          <h1
            className="mt-5 text-[clamp(2rem,11cqi,3.25rem)] leading-[1.15] text-(--inv-accent)"
            style={{ fontFamily: "var(--inv-font-display)" }}
          >
            {event.hosts.map((host, i) => (
              <span key={host.id} className="block">
                {i > 0 ? (
                  <span className="my-1 block text-[0.4em] tracking-[0.3em] text-(--inv-gold) uppercase">
                    {locale === "km" ? "និង" : "and"}
                  </span>
                ) : null}
                {L(host.name)}
              </span>
            ))}
          </h1>

          <div className="mx-auto mt-7 w-full max-w-xs">
            <Motif assetId="divider-kbach-temple" fallback={null} fit="width" />
          </div>

          <p className="mt-7 text-lg text-(--inv-fg)">
            {formatDate(event.date, locale, "full")}
          </p>
          <p className="mt-1 text-sm text-(--inv-muted)">{formatTime(event.date, locale)}</p>
        </header>

        {design.coverPhoto ? (
          <div className="px-6 pb-4">
            <FramedPhoto
              src={design.coverPhoto}
              alt=""
              seed={4}
              frame={design.photoFrame ?? "gold"}
              motion={design.coverMotion ?? "none"}
              aspect="aspect-4/5 @xl:aspect-3/2"
              className="mx-auto max-w-lg"
            />
          </div>
        ) : null}

        <InvSection>
          <GuestHonour guestName={guestName} />
          <p className="mx-auto mt-8 max-w-md text-center text-base leading-loose text-(--inv-muted)">
            {L(design.message)}
          </p>
          <div className="mt-10">
            <InvitationCountdown variant="row" date={event.date} />
          </div>
          <p className="mt-8 text-center">
            <AddToCalendar event={event} />
          </p>
        </InvSection>

        {design.showSchedule && event.schedule.length > 0 ? (
          <InvSection
            title={t("public.scheduleTitle")}
            ornament="kbach"
            className="bg-(--inv-surface)"
          >
            <InvitationSchedule items={event.schedule} variant="cards" />
          </InvSection>
        ) : null}

        {design.showGallery && design.gallery.length > 0 ? (
          <InvSection title={t("inv.gallery")} ornament="lotus">
            <GalleryStrip photos={design.gallery} />
          </InvSection>
        ) : null}

        <InvSection
          title={t("public.venueTitle")}
          ornament="kbach"
          className="bg-(--inv-surface)"
        >
          <InvitationVenue variant="split" venue={event.venue} showMap={design.showMap} />
        </InvSection>

        {design.showGiftInfo && design.giftNote ? (
          <InvSection title={t("public.giftTitle")} ornament="lotus">
            <GiftNote note={design.giftNote} />
          </InvSection>
        ) : null}

        {design.showRsvp ? (
          <InvSection
            id="rsvp"
            title={t("public.rsvpTitle")}
            ornament="kbach"
            className="bg-(--inv-surface)"
          >
            <InvitationRsvpForm event={event} guestName={guestName} />
          </InvSection>
        ) : null}

        {event.contacts.length > 0 ? (
          <InvSection title={t("public.contactHosts")} ornament="rule">
            <ContactList contacts={event.contacts} />
          </InvSection>
        ) : null}

        <InvitationFooter event={event} />
      </div>
    </article>
  )
}

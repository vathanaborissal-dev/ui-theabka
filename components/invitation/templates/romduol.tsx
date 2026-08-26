"use client"

import { FramedPhoto } from "@/components/invitation/photo-frame"
import { useLocale } from "@/components/providers/locale-provider"
import { formatDate, formatTime } from "@/lib/format"
import { FlowerGarland, Romduol } from "@/components/invitation/khmer-ornaments"
import { PatternBackground } from "@/components/invitation/patterns"
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
import { useOrnaments } from "./use-ornaments"
import type { TemplateProps } from "./types"

/**
 * Phka Romduol — the floral template.
 *
 * Built around the romduol, Cambodia's national flower: a garland across the
 * head of the card, a repeating bloom pattern behind the paper, and a soft
 * oval photo frame. Where Angkor is architectural and symmetrical, this one is
 * organic and lighter.
 */
export function RomduolTemplate({ event, guestName }: TemplateProps) {
  const { t, L, locale } = useLocale()
  const design = event.design
  const orn = useOrnaments(design, "rich")

  return (
    <article className="relative bg-(--inv-bg) text-(--inv-fg)">
      {orn.pattern !== "none" ? (
        <PatternBackground pattern={orn.pattern} className="text-(--inv-accent)" scale={0.9}
          opacity={orn.patternOpacity} />
      ) : null}

      <div className="relative">
        <header className="px-5 pt-16 pb-4 text-center @xl:pt-24">
          <Romduol className="mx-auto size-10 text-(--inv-gold)" />

          <p className="mt-5 text-[0.75rem] tracking-[0.26em] text-(--inv-muted) uppercase">
            {t(`event.type.${event.type}`)}
          </p>

          {orn.showBorders ? (
            <FlowerGarland className="mx-auto mt-6 h-10 w-full max-w-sm text-(--inv-accent)/70" />
          ) : null}

          <p className="mx-auto mt-6 max-w-sm text-sm leading-relaxed text-(--inv-muted)">
            {L(design.greeting)}
          </p>

          <h1
            className="mt-6 text-[clamp(1.9rem,8.5cqi,3.25rem)] leading-[1.15] break-words"
            style={{
              fontFamily:
                locale === "km" ? "var(--inv-font-display-km)" : "var(--inv-font-display)",
            }}
          >
            {event.hosts.map((host, i) => (
              <span key={host.id} className="block">
                {L(host.name)}
                {i < event.hosts.length - 1 ? (
                  <span className="my-1 block text-[0.55em] text-(--inv-gold)">&amp;</span>
                ) : null}
              </span>
            ))}
          </h1>

          {orn.showBorders ? (
            <FlowerGarland className="mx-auto mt-7 h-10 w-full max-w-sm rotate-180 text-(--inv-accent)/70" />
          ) : null}

          <p className="mt-6 text-base">{formatDate(event.date, locale, "full")}</p>
          <p className="mt-1 text-sm text-(--inv-muted)">{formatTime(event.date, locale)}</p>
        </header>

        {design.coverPhoto || event.coverPhoto ? (
          <div className="px-6 pt-6">
            <div className="relative mx-auto max-w-md">
              <FramedPhoto
                src={design.coverPhoto ?? event.coverPhoto}
                alt=""
                seed={2}
                frame={design.photoFrame ?? "oval"}
                motion={design.coverMotion ?? "none"}
                aspect="aspect-4/5"
              />
              {orn.showCorners ? (
                <>
                  <Romduol className="absolute -top-3 -left-2 size-9 text-(--inv-gold)" />
                  <Romduol className="absolute -right-2 -bottom-3 size-9 text-(--inv-gold)" />
                </>
              ) : null}
            </div>
          </div>
        ) : null}

        <InvSection>
          <p className="mx-auto max-w-md text-center text-base leading-loose text-(--inv-muted)">
            {L(design.message)}
          </p>
          <div className="mt-10">
            <InvitationCountdown variant="inline" date={event.date} />
          </div>
          <p className="mt-8 text-center">
            <AddToCalendar event={event} />
          </p>
        </InvSection>

        {design.showSchedule && event.schedule.length > 0 ? (
          <InvSection
            title={t("public.scheduleTitle")}
            ornament={orn.sectionOrnament}
            className="bg-(--inv-surface)/75"
          >
            <InvitationSchedule items={event.schedule} variant="centred" />
          </InvSection>
        ) : null}

        {design.showGallery && design.gallery.length > 0 ? (
          <InvSection title={t("inv.gallery")} ornament={orn.sectionOrnament}>
            <GalleryStrip photos={design.gallery} />
          </InvSection>
        ) : null}

        <InvSection
          title={t("public.venueTitle")}
          ornament={orn.sectionOrnament}
          className="bg-(--inv-surface)/75"
        >
          <InvitationVenue variant="centred" venue={event.venue} showMap={design.showMap} />
        </InvSection>

        {design.showGiftInfo && design.giftNote ? (
          <InvSection title={t("public.giftTitle")} ornament={orn.sectionOrnament}>
            <GiftNote note={design.giftNote} />
          </InvSection>
        ) : null}

        {design.showRsvp ? (
          <InvSection
            id="rsvp"
            title={t("public.rsvpTitle")}
            ornament={orn.sectionOrnament}
            className="bg-(--inv-surface)/75"
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

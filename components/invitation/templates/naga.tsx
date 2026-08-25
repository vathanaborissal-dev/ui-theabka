"use client"

import { Photo } from "@/components/shared/photo"
import { useLocale } from "@/components/providers/locale-provider"
import { cn } from "@/lib/utils"
import { formatDate, formatTime } from "@/lib/format"
import { LotusFrieze, NagaBorder, Romduol } from "@/components/invitation/khmer-ornaments"
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
 * Naga — ceremonial, photo-led, dark.
 *
 * The naga balustrade that lines a temple causeway becomes the rule that runs
 * across this card. Designed for the "temple night" and "royal" palettes: a
 * full-bleed cover, gold rules on a deep ground, and content on raised panels.
 */
export function NagaTemplate({ event, guestName }: TemplateProps) {
  const { t, L, locale } = useLocale()
  const design = event.design
  const orn = useOrnaments(design, "subtle")

  return (
    <article className="relative bg-(--inv-bg) text-(--inv-fg)">
      <header className="relative flex min-h-[82svh] flex-col justify-end overflow-hidden">
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
          className="absolute inset-0 bg-linear-to-t from-(--inv-bg) via-(--inv-bg)/70 to-(--inv-bg)/30"
          aria-hidden="true"
        />

        <div className="relative px-6 pb-14 text-center @xl:pb-20">
          {orn.showBorders ? (
            <NagaBorder className="mx-auto mb-7 h-7 w-full max-w-sm text-(--inv-gold)" />
          ) : null}

          <p className="text-[0.75rem] tracking-[0.28em] text-(--inv-gold) uppercase">
            {t(`event.type.${event.type}`)}
          </p>

          <h1
            className="mt-5 text-[clamp(1.9rem,8cqi,3.5rem)] leading-[1.12] break-words text-(--inv-fg)"
            style={{
              fontFamily:
                locale === "km" ? "var(--inv-font-display-km)" : "var(--inv-font-display)",
            }}
          >
            {event.hosts.map((h) => L(h.name)).join("  ·  ")}
          </h1>

          <LotusFrieze className="mx-auto mt-6 h-4 w-40 text-(--inv-gold)/70" />

          <p className="mt-5 text-base text-(--inv-fg)/90">
            {formatDate(event.date, locale, "long")}
          </p>
          <p className="mt-1 text-sm text-(--inv-muted)">
            {formatTime(event.date, locale)} · {L(event.venue.name)}
          </p>
        </div>
      </header>

      <div className="relative">
        {orn.pattern !== "none" ? (
          <PatternBackground pattern={orn.pattern} className="text-(--inv-gold)" scale={1}
          opacity={orn.patternOpacity} />
        ) : null}

        <div className="relative">
          <InvSection>
            <div className="mx-auto max-w-md rounded-lg border border-(--inv-gold)/30 bg-(--inv-surface)/85 p-8 text-center">
              <Romduol className="mx-auto size-7 text-(--inv-gold)" />
              <p className="mt-4 text-sm leading-relaxed text-(--inv-muted)">
                {L(design.greeting)}
              </p>
              <p className="mt-4 text-base leading-loose text-(--inv-fg)">{L(design.message)}</p>
              <div className="mt-7">
                <AddToCalendar event={event} />
              </div>
            </div>
            <div className="mt-12">
              <InvitationCountdown date={event.date} />
            </div>
          </InvSection>

          {design.showSchedule && event.schedule.length > 0 ? (
            <InvSection title={t("public.scheduleTitle")} ornament={orn.sectionOrnament}>
              <div className="mx-auto max-w-lg rounded-lg border border-(--inv-gold)/25 bg-(--inv-surface)/85 p-6 @xl:p-8">
                <InvitationSchedule items={event.schedule} />
              </div>
            </InvSection>
          ) : null}

          {design.showGallery && design.gallery.length > 0 ? (
            <InvSection title={t("inv.gallery")} ornament={orn.sectionOrnament}>
              <GalleryStrip photos={design.gallery} />
            </InvSection>
          ) : null}

          <InvSection title={t("public.venueTitle")} ornament={orn.sectionOrnament}>
            <InvitationVenue venue={event.venue} showMap={design.showMap} />
          </InvSection>

          {design.showGiftInfo && design.giftNote ? (
            <InvSection title={t("public.giftTitle")} ornament={orn.sectionOrnament}>
              <GiftNote note={design.giftNote} />
            </InvSection>
          ) : null}

          {design.showRsvp ? (
            <InvSection id="rsvp" title={t("public.rsvpTitle")} ornament={orn.sectionOrnament}>
              <InvitationRsvpForm event={event} guestName={guestName} />
            </InvSection>
          ) : null}

          {event.contacts.length > 0 ? (
            <InvSection title={t("public.contactHosts")} ornament="rule">
              <ContactList contacts={event.contacts} />
            </InvSection>
          ) : null}

          {orn.showBorders ? (
            <NagaBorder className="mx-auto h-7 w-full max-w-sm text-(--inv-gold)/60" />
          ) : null}

          <InvitationFooter event={event} />
        </div>
      </div>
    </article>
  )
}

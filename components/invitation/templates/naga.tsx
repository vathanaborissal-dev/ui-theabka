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
 * tall arched portrait, gold rules on a deep ground, and content on raised
 * panels.
 */
export function NagaTemplate({ event, guestName }: TemplateProps) {
  const { t, L, locale } = useLocale()
  const design = event.design
  const orn = useOrnaments(design, "subtle")

  return (
    <article data-inv-template="naga" className="relative bg-(--inv-bg) text-(--inv-fg)">
      <header className="relative min-h-[100dvh] overflow-hidden px-5 py-8 @xl:px-8 @2xl:grid @2xl:grid-cols-[1.08fr_0.92fr] @2xl:items-center @2xl:gap-10 @2xl:py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,color-mix(in_oklch,var(--inv-gold)_12%,transparent),transparent_34%)]"
        />

        <div className="relative flex items-center justify-center">
          <div className="relative h-[49dvh] min-h-72 w-full max-w-md overflow-hidden rounded-t-[999px] border border-(--inv-gold)/55 @2xl:h-[78dvh] @2xl:max-w-lg">
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
              className="absolute inset-0 bg-linear-to-t from-(--inv-bg)/70 via-transparent to-(--inv-bg)/15"
              aria-hidden="true"
            />
            {orn.showBorders ? (
              <NagaBorder className="absolute inset-x-5 bottom-5 h-7 text-(--inv-gold)" />
            ) : null}
          </div>
        </div>

        <div className="relative mx-auto flex max-w-lg flex-col justify-center px-2 pt-8 pb-4 text-left @2xl:mx-0 @2xl:px-0 @2xl:py-12">
          <p className="text-[0.72rem] tracking-[0.24em] text-(--inv-gold) uppercase">
            {t(`event.type.${event.type}`)}
          </p>

          <h1
            className="mt-5 text-[clamp(2rem,8cqi,3.75rem)] leading-[1.08] break-words text-(--inv-fg)"
            style={{
              fontFamily:
                locale === "km" ? "var(--inv-font-display-km)" : "var(--inv-font-display)",
            }}
          >
            {event.hosts.map((host, index) => (
              <span key={host.id} className="block">
                {index > 0 ? (
                  <span className="my-1 block text-[0.42em] text-(--inv-gold)">
                    {locale === "km" ? "និង" : "and"}
                  </span>
                ) : null}
                {L(host.name)}
              </span>
            ))}
          </h1>

          <LotusFrieze className="mt-6 h-4 w-44 text-(--inv-gold)/75" />

          <div className="mt-6 border-l border-(--inv-gold)/45 pl-4">
            <p className="text-base text-(--inv-fg)/90">
              {formatDate(event.date, locale, "long")}
            </p>
            <p className="mt-1 text-sm text-(--inv-muted)">{formatTime(event.date, locale)}</p>
            <p className="mt-1 text-sm text-(--inv-muted)">{L(event.venue.name)}</p>
          </div>
        </div>
      </header>

      <div className="relative">
        {orn.pattern !== "none" ? (
          <PatternBackground
            pattern={orn.pattern}
            className="text-(--inv-gold)"
            scale={1}
            opacity={orn.patternOpacity}
          />
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
              <InvitationCountdown variant="lead" date={event.date} />
            </div>
          </InvSection>

          {design.showSchedule && event.schedule.length > 0 ? (
            <InvSection title={t("public.scheduleTitle")} ornament={orn.sectionOrnament}>
              <div className="mx-auto max-w-lg rounded-lg border border-(--inv-gold)/25 bg-(--inv-surface)/85 p-6 @xl:p-8">
                <InvitationSchedule items={event.schedule} variant="line" />
              </div>
            </InvSection>
          ) : null}

          {design.showGallery && design.gallery.length > 0 ? (
            <InvSection title={t("inv.gallery")} ornament={orn.sectionOrnament}>
              <GalleryStrip photos={design.gallery} />
            </InvSection>
          ) : null}

          <InvSection title={t("public.venueTitle")} ornament={orn.sectionOrnament}>
            <InvitationVenue variant="split" venue={event.venue} showMap={design.showMap} />
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

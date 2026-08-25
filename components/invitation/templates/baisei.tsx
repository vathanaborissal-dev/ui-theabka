"use client"

import { useLocale } from "@/components/providers/locale-provider"
import { formatDate, formatTime } from "@/lib/format"
import { FramedPhoto } from "@/components/invitation/photo-frame"
import {
  Baisei,
  FloralCorner,
  HangingBeads,
  KhmerCouple,
} from "@/components/invitation/khmer-motifs"
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
 * Baisei — the modern Khmer e-invitation.
 *
 * Modelled on the cards Cambodian couples actually send on Telegram today: a
 * slim gold arch on a soft gradient, white blooms spilling into the corners,
 * the baisei offering cone crowning the arch, and the couple illustrated in
 * traditional dress at the foot of the card.
 */
export function BaiseiTemplate({ event, guestName }: TemplateProps) {
  const { t, L, locale } = useLocale()
  const design = event.design
  const orn = useOrnaments(design, "rich")

  return (
    <article className="relative bg-(--inv-bg) text-(--inv-fg)">
      {/* Soft wash behind the whole card, as on the printed originals */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-(--inv-accent)/10 via-transparent to-(--inv-gold)/12"
      />
      {orn.pattern !== "none" ? (
        <PatternBackground
          pattern={orn.pattern}
          className="text-(--inv-accent)"
          scale={0.85}
          opacity={orn.patternOpacity}
        />
      ) : null}

      <div className="relative">
        <header className="px-5 pt-12 pb-6 @xl:pt-16">
          <div className="relative mx-auto max-w-lg">
            {/* The gold arch */}
            <div className="pointer-events-none absolute inset-x-2 top-6 bottom-0 rounded-t-[999px] border border-(--inv-gold)/70" />
            <div className="pointer-events-none absolute inset-x-5 top-9 bottom-0 rounded-t-[999px] border border-(--inv-gold)/30" />

            {orn.showCorners ? (
              <>
                <FloralCorner className="pointer-events-none absolute -top-2 -left-6 w-32 @xl:w-40" />
                <FloralCorner
                  flip
                  className="pointer-events-none absolute -top-2 -right-6 w-32 @xl:w-40"
                />
                <HangingBeads className="pointer-events-none absolute top-24 left-6 h-20 text-(--inv-gold)/70" />
                <HangingBeads className="pointer-events-none absolute top-24 right-6 h-20 text-(--inv-gold)/70" />
              </>
            ) : null}

            <div className="relative px-8 pt-10 pb-4 text-center @xl:px-12">
              {/* Baisei crowning the arch */}
              <Baisei className="mx-auto h-24 w-auto text-(--inv-gold) @xl:h-28" />

              <p className="mt-5 text-[0.7rem] tracking-[0.26em] text-(--inv-muted) uppercase">
                {t(`event.type.${event.type}`)}
              </p>

              <h1 className="mt-6 space-y-1">
                {event.hosts.map((host, i) => (
                  <span key={host.id} className="block">
                    <span
                      className="block text-[clamp(1.9rem,9cqi,3.25rem)] leading-[1.1] break-words text-(--inv-accent)"
                      style={{
                        fontFamily:
                          locale === "km"
                            ? "var(--inv-font-display-km)"
                            : "var(--inv-font-display)",
                      }}
                    >
                      {L(host.name)}
                    </span>
                    {i < event.hosts.length - 1 ? (
                      <span className="my-2 block text-sm tracking-[0.2em] text-(--inv-muted) uppercase">
                        {locale === "km" ? "និង" : "and"}
                      </span>
                    ) : null}
                  </span>
                ))}
              </h1>

              <p className="mt-6 text-sm leading-relaxed text-(--inv-muted) italic">
                {L(design.greeting) || t("public.withBlessing")}
              </p>

              <p className="mt-5 text-base text-(--inv-fg)">
                {formatDate(event.date, locale, "full")}
              </p>
              <p className="mt-1 text-sm text-(--inv-muted)">{formatTime(event.date, locale)}</p>

              {/* The couple, in traditional dress, standing under the arch.
                  Uses supplied artwork when there is any, else the drawn pair. */}
              <div className="mx-auto mt-6 h-56 @xl:h-64">
                <Motif
                  assetId={design.coupleMotifId}
                  fallback={<KhmerCouple className="mx-auto h-full w-auto" />}
                />
              </div>
            </div>
          </div>
        </header>

        <InvSection>
          <GuestHonour guestName={guestName} />
          <p className="mx-auto mt-8 max-w-md text-center text-base leading-loose text-(--inv-muted)">
            {L(design.message)}
          </p>
          <div className="mt-10">
            <InvitationCountdown date={event.date} />
          </div>
          <p className="mt-8 text-center">
            <AddToCalendar event={event} />
          </p>
        </InvSection>

        {design.coverPhoto || event.coverPhoto ? (
          <InvSection className="pt-0">
            <div className="mx-auto max-w-md">
              <FramedPhoto
                src={design.coverPhoto ?? event.coverPhoto}
                alt=""
                seed={2}
                frame={design.photoFrame ?? "arch"}
                motion={design.coverMotion ?? "none"}
                aspect="aspect-4/5"
              />
            </div>
          </InvSection>
        ) : null}

        {design.showSchedule && event.schedule.length > 0 ? (
          <InvSection
            title={t("public.scheduleTitle")}
            ornament={orn.sectionOrnament}
            className="bg-(--inv-surface)/70"
          >
            <InvitationSchedule items={event.schedule} />
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
          className="bg-(--inv-surface)/70"
        >
          <InvitationVenue venue={event.venue} showMap={design.showMap} />
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
            className="bg-(--inv-surface)/70"
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

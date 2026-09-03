"use client"

import { FramedPhoto } from "@/components/invitation/photo-frame"
import { useLocale } from "@/components/providers/locale-provider"
import { formatDate, formatTime } from "@/lib/format"
import { FlowerGarland, KbachCornerRich, LotusFrieze, PedimentArch, Romduol } from "../khmer-ornaments"
import { MotifCorners } from "@/components/invitation/motif"
import { InvitationCountdown } from "../sections/countdown"
import { GuestHonour } from "../sections/guest-honour"
import { InvitationRsvpForm } from "../sections/rsvp-form"
import { InvitationSchedule } from "../sections/schedule"
import { InvitationVenue } from "../sections/venue"
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
 * Sbai — a royal-blue blessing card.
 *
 * Inspired by the blue silk and gold adornment commonly seen in Khmer wedding
 * attire. Its layers suggest a ceremonial sbai without reproducing any single
 * printed invitation or costume.
 */
export function SbaiTemplate({ event, guestName }: TemplateProps) {
  const { t, L, locale } = useLocale()
  const design = event.design
  const orn = useOrnaments(design, "rich")

  return (
    <article data-inv-template="sbai" className="relative overflow-hidden bg-(--inv-accent) text-(--inv-fg)">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-28 -right-20 size-72 rotate-[28deg] rounded-full border-[22px] border-(--inv-gold)/12" />
        <div className="absolute top-96 -left-24 size-64 -rotate-[24deg] rounded-full border-[18px] border-(--inv-gold)/12" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,color-mix(in_oklch,var(--inv-gold)_18%,transparent),transparent_42%)]" />
      </div>

      <div className="relative px-4 py-8 @xl:px-8 @xl:py-12">
        <div className="relative mx-auto max-w-2xl border border-(--inv-gold)/80 bg-(--inv-bg) p-1.5 shadow-[0_18px_50px_-24px_color-mix(in_oklch,var(--inv-fg)_65%,transparent)]">
          <div className="relative overflow-hidden border border-(--inv-gold)/50 px-5 py-11 @xl:px-12 @xl:py-16">
            {orn.showCorners ? (
              <MotifCorners
                assetId={design.cornerMotifId}
                className="size-16 @xl:size-24"
                fallback={
                  <>
                    <KbachCornerRich className="absolute top-1 left-1 size-16 text-(--inv-gold)/75" />
                    <KbachCornerRich className="absolute top-1 right-1 size-16 scale-x-[-1] text-(--inv-gold)/75" />
                    <KbachCornerRich className="absolute bottom-1 left-1 size-16 scale-y-[-1] text-(--inv-gold)/75" />
                    <KbachCornerRich className="absolute right-1 bottom-1 size-16 scale-[-1] text-(--inv-gold)/75" />
                  </>
                }
              />
            ) : null}

            <PedimentArch className="mx-auto h-20 w-full max-w-sm text-(--inv-gold)" />
            <Romduol className="mx-auto -mt-6 size-10 text-(--inv-gold)" />
            <p className="mt-5 text-center text-[0.68rem] tracking-[0.24em] text-(--inv-muted) uppercase">
              {t(`event.type.${event.type}`)}
            </p>

            <p className="mx-auto mt-5 max-w-md text-center text-sm leading-relaxed text-(--inv-muted)">
              {L(design.greeting) || t("public.withBlessing")}
            </p>

            <div className="mt-7 text-center">
              {event.hosts.map((host, index) => (
                <div key={host.id}>
                  {host.parents ? (
                    <p className="mb-1 text-xs leading-relaxed text-(--inv-muted)">{L(host.parents)}</p>
                  ) : null}
                  <p
                    className="text-[clamp(1.7rem,7cqi,2.8rem)] leading-tight break-words text-(--inv-accent)"
                    style={{
                      fontFamily:
                        locale === "km" ? "var(--inv-font-display-km)" : "var(--inv-font-display)",
                    }}
                  >
                    {L(host.name)}
                  </p>
                  {index < event.hosts.length - 1 ? (
                    <FlowerGarland className="mx-auto my-3 h-7 w-40 text-(--inv-gold)" />
                  ) : null}
                </div>
              ))}
            </div>

            <LotusFrieze className="mx-auto mt-8 h-4 w-48 text-(--inv-gold)" />
            <div className="mt-6 text-center">
              <p className="text-base text-(--inv-fg)">{formatDate(event.date, locale, "full")}</p>
              <p className="mt-1 text-sm text-(--inv-muted)">{formatTime(event.date, locale)}</p>
              <p className="mt-3 text-sm text-(--inv-muted)">{L(event.venue.name)}</p>
            </div>

            <div className="mt-8">
              <GuestHonour guestName={guestName} />
            </div>
          </div>
        </div>
      </div>

      {design.coverPhoto || event.coverPhoto ? (
        <div className="relative px-6 pb-4 @xl:px-10">
          <div className="mx-auto max-w-md border border-(--inv-gold)/45 bg-(--inv-bg) p-2">
            <FramedPhoto
              src={design.coverPhoto}
              alt=""
              seed={10}
              frame={design.photoFrame ?? "gold"}
              motion={design.coverMotion ?? "none"}
              aspect="aspect-4/5"
            />
          </div>
        </div>
      ) : null}

      <div className="relative mt-4 bg-(--inv-bg) text-(--inv-fg)">
        <InvSection section="letter">
          <p className="mx-auto max-w-md text-center text-base leading-loose text-(--inv-muted)">{L(design.message)}</p>
          <div className="mt-10"><InvitationCountdown variant="boxed" date={event.date} /></div>
          <p className="mt-8 text-center"><AddToCalendar event={event} /></p>
        </InvSection>

        {design.showSchedule && event.schedule.length > 0 ? (
          <InvSection title={t("public.scheduleTitle")} section="schedule" ornament={orn.sectionOrnament} className="bg-(--inv-surface)">
            <InvitationSchedule items={event.schedule} variant="centred" />
          </InvSection>
        ) : null}

        {design.showGallery && design.gallery.length > 0 ? (
          <InvSection title={t("inv.gallery")} section="gallery" ornament={orn.sectionOrnament}>
            <GalleryStrip photos={design.gallery} />
          </InvSection>
        ) : null}

        <InvSection title={t("public.venueTitle")} section="venue" ornament={orn.sectionOrnament} className="bg-(--inv-surface)">
          <InvitationVenue variant="split" venue={event.venue} showMap={design.showMap} />
        </InvSection>

        {design.showGiftInfo && design.giftNote ? (
          <InvSection title={t("public.giftTitle")} section="gift" ornament={orn.sectionOrnament}>
            <GiftNote note={design.giftNote} />
          </InvSection>
        ) : null}

        {design.showRsvp ? (
          <InvSection id="rsvp" title={t("public.rsvpTitle")} section="rsvp" ornament={orn.sectionOrnament} className="bg-(--inv-surface)">
            <InvitationRsvpForm event={event} guestName={guestName} />
          </InvSection>
        ) : null}

        {event.contacts.length > 0 ? (
          <InvSection title={t("public.contactHosts")} section="contacts" ornament="rule">
            <ContactList contacts={event.contacts} />
          </InvSection>
        ) : null}

        <InvitationFooter event={event} />
      </div>
    </article>
  )
}

"use client"

import { FramedPhoto } from "@/components/invitation/photo-frame"
import { useLocale } from "@/components/providers/locale-provider"
import { formatDate, formatTime } from "@/lib/format"
import {
  AngkorSilhouette,
  KbachCornerRich,
  LotusFrieze,
  PedimentArch,
} from "@/components/invitation/khmer-ornaments"
import { PatternBackground } from "@/components/invitation/patterns"
import { MotifCorners } from "@/components/invitation/motif"
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
 * Angkor — the temple template.
 *
 * Structured like a temple elevation read from the bottom up: a carved kbach
 * border, the Angkor Wat profile as a crest, then the couple's names set inside
 * a pediment arch the way a deity is framed above a doorway. Section headings
 * sit on lotus friezes copied from gallery carvings.
 */
export function AngkorTemplate({ event, guestName }: TemplateProps) {
  const { t, L, locale } = useLocale()
  const design = event.design
  const orn = useOrnaments(design, "rich")
  const [first, second] = event.hosts

  return (
    <article data-inv-template="angkor" className="relative bg-(--inv-bg) text-(--inv-fg)">
      {orn.pattern !== "none" ? (
        <PatternBackground
          pattern={orn.pattern}
          className="text-(--inv-gold)"
          scale={1.1}
          opacity={orn.patternOpacity}
        />
      ) : null}

      <div className="relative">
        <header className="px-4 pt-14 pb-2 @xl:px-8 @xl:pt-20">
          <div className="relative mx-auto max-w-2xl border-2 border-(--inv-gold)/35 bg-(--inv-bg)/85 px-5 py-10 @xl:px-10 @xl:py-14">
            {orn.showCorners ? (
              <MotifCorners
                assetId={design.cornerMotifId}
                className="size-16 @xl:size-24"
                fallback={
                  <>
                    <KbachCornerRich className="absolute -top-2 -left-2 size-14 text-(--inv-gold) @xl:size-16" />
                    <KbachCornerRich className="absolute -top-2 -right-2 size-14 scale-x-[-1] text-(--inv-gold) @xl:size-16" />
                    <KbachCornerRich className="absolute -bottom-2 -left-2 size-14 scale-y-[-1] text-(--inv-gold) @xl:size-16" />
                    <KbachCornerRich className="absolute -right-2 -bottom-2 size-14 scale-[-1] text-(--inv-gold) @xl:size-16" />
                  </>
                }
              />
            ) : null}

            <AngkorSilhouette className="mx-auto h-16 w-auto text-(--inv-accent) @xl:h-20" />

            <p className="mt-6 text-center text-[0.75rem] tracking-[0.24em] text-(--inv-muted) uppercase">
              {t(`event.type.${event.type}`)}
            </p>

            <p className="mt-5 text-center text-sm leading-relaxed text-(--inv-muted)">
              {L(design.greeting)}
            </p>

            {/* The pediment sits over the names, as a lintel sits over a doorway. */}
            <div className="mt-8">
              {orn.showArch ? (
                <PedimentArch className="mx-auto -mb-3 h-14 w-full max-w-[15rem] text-(--inv-gold)/70 @xl:h-16 @xl:max-w-xs" />
              ) : null}

              <div className="space-y-6">
                {[first, second].filter(Boolean).map((host, i) => (
                  <div key={host.id}>
                    {i === 1 ? (
                      <p
                        className="mb-5 text-center text-xl text-(--inv-gold)"
                        style={{ fontFamily: "var(--inv-font-display)" }}
                      >
                        &amp;
                      </p>
                    ) : null}
                    {host.parents ? (
                      <p className="text-center text-xs leading-relaxed text-(--inv-muted)">
                        {L(host.parents)}
                      </p>
                    ) : null}
                    <p
                      className="mt-2 text-center text-[clamp(1.6rem,7cqi,2.5rem)] leading-tight break-words text-(--inv-fg)"
                      style={{
                        fontFamily:
                          locale === "km"
                            ? "var(--inv-font-display-km)"
                            : "var(--inv-font-display)",
                      }}
                    >
                      {L(host.name)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <LotusFrieze className="mx-auto mt-10 h-5 w-56 text-(--inv-gold)" />

            <div className="mt-7 text-center">
              <p className="text-base text-(--inv-fg)">{formatDate(event.date, locale, "full")}</p>
              <p className="mt-1 text-sm text-(--inv-muted)">{formatTime(event.date, locale)}</p>
              <p className="mt-4 text-sm text-(--inv-muted)">{L(event.venue.name)}</p>
            </div>
          </div>
        </header>

        {design.coverPhoto || event.coverPhoto ? (
          <div className="px-4 pt-10 @xl:px-8">
            <div className="mx-auto max-w-2xl">
              <FramedPhoto
                src={design.coverPhoto}
                alt=""
                seed={1}
                frame={design.photoFrame ?? "arch"}
                motion={design.coverMotion ?? "none"}
                aspect="aspect-4/5 @xl:aspect-3/2"
              />
            </div>
          </div>
        ) : null}

        <InvSection section="letter">
          <GuestHonour guestName={guestName} className="mb-8" />
          <p className="mx-auto max-w-md text-center text-base leading-loose text-(--inv-muted)">
            {L(design.message)}
          </p>
          <div className="mt-10">
            <InvitationCountdown variant="boxed" date={event.date} />
          </div>
          <p className="mt-8 text-center">
            <AddToCalendar event={event} />
          </p>
        </InvSection>

        {design.showSchedule && event.schedule.length > 0 ? (
          <InvSection
            title={t("public.scheduleTitle")} section="schedule"
            ornament={orn.sectionOrnament}
            className="border-y border-(--inv-gold)/25 bg-(--inv-surface)/70"
          >
            <InvitationSchedule items={event.schedule} variant="cards" />
          </InvSection>
        ) : null}

        <InvSection title={t("public.venueTitle")} section="venue" ornament={orn.sectionOrnament}>
          <InvitationVenue variant="centred" venue={event.venue} showMap={design.showMap} />
        </InvSection>

        {design.showGallery && design.gallery.length > 0 ? (
          <InvSection
            title={t("inv.gallery")} section="gallery"
            ornament={orn.sectionOrnament}
            className="border-y border-(--inv-gold)/25 bg-(--inv-surface)/70"
          >
            <GalleryStrip photos={design.gallery} />
          </InvSection>
        ) : null}

        {design.showGiftInfo && design.giftNote ? (
          <InvSection title={t("public.giftTitle")} section="gift" ornament={orn.sectionOrnament}>
            <GiftNote note={design.giftNote} />
          </InvSection>
        ) : null}

        {design.showRsvp ? (
          <InvSection
            id="rsvp"
            title={t("public.rsvpTitle")} section="rsvp"
            ornament={orn.sectionOrnament}
            className="border-t border-(--inv-gold)/25 bg-(--inv-surface)/70"
          >
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

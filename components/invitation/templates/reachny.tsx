"use client"

import { useLocale } from "@/components/providers/locale-provider"
import { formatDate, formatTime } from "@/lib/format"
import { FramedPhoto } from "@/components/invitation/photo-frame"
import { KbachCornerRich, LotusFrieze } from "@/components/invitation/khmer-ornaments"
import { Baisei, Cartouche } from "@/components/invitation/khmer-motifs"
import { MotifCorners } from "@/components/invitation/motif"
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
 * Reachny — the formal engraved card.
 *
 * Follows the conventions of a printed Cambodian ceremony invitation: a heavy
 * double rule in indigo and gold, a cartouche medallion above the title, the
 * Khmer heading set larger than its English translation beneath it, and the
 * ruled honour line where the guest's name is written.
 */
export function ReachnyTemplate({ event, guestName }: TemplateProps) {
  const { t, L, locale } = useLocale()
  const design = event.design
  const orn = useOrnaments(design, "rich")
  const [first, second] = event.hosts

  return (
    <article data-inv-template="reachny" className="relative bg-(--inv-bg) text-(--inv-fg)">
      {orn.pattern !== "none" ? (
        <PatternBackground
          pattern={orn.pattern}
          className="text-(--inv-accent)"
          scale={0.7}
          opacity={orn.patternOpacity}
        />
      ) : null}

      <div className="relative">
        <header className="px-4 pt-12 pb-4 @xl:px-8 @xl:pt-16">
          {/* Double rule, as struck on the printed original */}
          <div className="relative mx-auto max-w-2xl border-[3px] border-(--inv-accent) p-1.5">
            <div className="relative border border-(--inv-gold)/70 px-5 py-10 @xl:px-10 @xl:py-14">
              {orn.showCorners ? (
                <MotifCorners
                  assetId={design.cornerMotifId}
                  className="size-14 @sm:size-20 @xl:size-24"
                  fallback={
                    <>
                      <KbachCornerRich className="absolute top-1 left-1 size-16 text-(--inv-accent)/45" />
                      <KbachCornerRich className="absolute top-1 right-1 size-16 scale-x-[-1] text-(--inv-accent)/45" />
                      <KbachCornerRich className="absolute bottom-1 left-1 size-16 scale-y-[-1] text-(--inv-accent)/45" />
                      <KbachCornerRich className="absolute right-1 bottom-1 size-16 scale-[-1] text-(--inv-accent)/45" />
                    </>
                  }
                />
              ) : null}

              <Cartouche className="mx-auto h-32 w-28 text-(--inv-gold)">
                <Baisei className="mx-auto h-20 w-auto text-(--inv-accent)" />
              </Cartouche>

              {/* Khmer heading dominant, English translation beneath */}
              <h1 className="mt-6 text-center">
                <span
                  className="block text-[clamp(1.5rem,6.5cqi,2.25rem)] leading-snug text-balance text-(--inv-accent)"
                  style={{ fontFamily: "var(--inv-font-display-km)" }}
                  lang="km"
                >
                  {event.title.km || event.title.en}
                </span>
                {event.title.en ? (
                  <span
                    className="mt-2 block text-[clamp(1rem,4cqi,1.35rem)] text-(--inv-muted) italic"
                    style={{ fontFamily: "var(--inv-font-display)" }}
                    lang="en"
                  >
                    {event.title.en}
                  </span>
                ) : null}
              </h1>

              <LotusFrieze className="mx-auto mt-5 h-4 w-44 text-(--inv-gold)" />

              <div className="mt-7">
                <GuestHonour guestName={guestName} />
              </div>

              <p className="mx-auto mt-7 max-w-md text-center text-sm leading-relaxed text-(--inv-muted)">
                {L(design.greeting) || t("public.withBlessing")}
              </p>

              {/* Both families named, side by side, as on the printed card */}
              <div className="mt-7 grid gap-5 @xl:grid-cols-2">
                {[first, second].filter(Boolean).map((host) => (
                  <div key={host.id} className="text-center">
                    <p className="text-[0.6875rem] tracking-[0.18em] text-(--inv-muted) uppercase">
                      {L(host.role)}
                    </p>
                    {host.parents ? (
                      <p className="mt-1.5 text-xs leading-relaxed text-(--inv-muted)">
                        {L(host.parents)}
                      </p>
                    ) : null}
                    <p
                      className="mt-2 text-[clamp(1.3rem,5.5cqi,1.85rem)] leading-tight break-words text-(--inv-fg)"
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

              <LotusFrieze className="mx-auto mt-8 h-4 w-44 rotate-180 text-(--inv-gold)" />

              <div className="mt-6 text-center">
                <p className="text-base text-(--inv-fg)">
                  {formatDate(event.date, locale, "full")}
                </p>
                <p className="mt-1 text-sm text-(--inv-muted)">
                  {formatTime(event.date, locale)}
                </p>
                <p className="mt-3 text-sm text-(--inv-muted)">{L(event.venue.name)}</p>
              </div>
            </div>
          </div>
        </header>

        {design.coverPhoto || event.coverPhoto ? (
          <InvSection align="left" className="pb-0">
            <div className="mx-auto max-w-md">
              <FramedPhoto
                src={design.coverPhoto}
                alt=""
                seed={1}
                frame={design.photoFrame ?? "gold"}
                motion={design.coverMotion ?? "none"}
                aspect="aspect-4/5"
              />
            </div>
          </InvSection>
        ) : null}

        <InvSection align="left" section="letter">
          <p className="mx-auto max-w-md text-center text-base leading-loose text-(--inv-muted)">
            {L(design.message)}
          </p>
          <div className="mt-10">
            <InvitationCountdown variant="lead" date={event.date} />
          </div>
          <p className="mt-8 text-center">
            <AddToCalendar event={event} />
          </p>
        </InvSection>

        {design.showSchedule && event.schedule.length > 0 ? (
          <InvSection align="left"
            title={t("public.scheduleTitle")} section="schedule"
            ornament={orn.sectionOrnament}
            className="border-y border-(--inv-accent)/20 bg-(--inv-surface)/70"
          >
            <InvitationSchedule items={event.schedule} variant="plain" />
          </InvSection>
        ) : null}

        {design.showGallery && design.gallery.length > 0 ? (
          <InvSection align="left" title={t("inv.gallery")} section="gallery" ornament={orn.sectionOrnament}>
            <GalleryStrip photos={design.gallery} />
          </InvSection>
        ) : null}

        <InvSection align="left"
          title={t("public.venueTitle")} section="venue"
          ornament={orn.sectionOrnament}
          className="border-t border-(--inv-accent)/20"
        >
          <InvitationVenue variant="left" venue={event.venue} showMap={design.showMap} />
        </InvSection>

        {design.showGiftInfo && design.giftNote ? (
          <InvSection align="left" title={t("public.giftTitle")} section="gift" ornament={orn.sectionOrnament}>
            <GiftNote note={design.giftNote} />
          </InvSection>
        ) : null}

        {design.showRsvp ? (
          <InvSection align="left"
            id="rsvp"
            title={t("public.rsvpTitle")} section="rsvp"
            ornament={orn.sectionOrnament}
            className="border-t border-(--inv-accent)/20 bg-(--inv-surface)/70"
          >
            <InvitationRsvpForm event={event} guestName={guestName} />
          </InvSection>
        ) : null}

        {event.contacts.length > 0 ? (
          <InvSection align="left" title={t("public.contactHosts")} section="contacts" ornament="rule">
            <ContactList contacts={event.contacts} />
          </InvSection>
        ) : null}

        <InvitationFooter event={event} />
      </div>
    </article>
  )
}

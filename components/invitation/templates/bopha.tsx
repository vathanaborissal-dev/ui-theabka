"use client"

import { FramedPhoto } from "@/components/invitation/photo-frame"
import { useLocale } from "@/components/providers/locale-provider"
import { formatDate, formatTime } from "@/lib/format"
import { KbachCorner, KbachDivider } from "@/components/invitation/ornaments"
import { MotifCorners } from "@/components/invitation/motif"
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
 * Bopha — the traditional Khmer card.
 *
 * Follows the conventions of a printed Cambodian wedding invitation: the
 * parents are named above the couple, the two families are given equal weight
 * side by side, and the whole card sits inside a gold kbach frame.
 */
export function BophaTemplate({ event, guestName }: TemplateProps) {
  const { t, L, locale } = useLocale()
  const design = event.design
  const [first, second] = event.hosts

  return (
    <article data-inv-template="bopha" className="bg-(--inv-bg) text-(--inv-fg)">
      <header className="relative px-4 pt-16 pb-2 @xl:px-8 @xl:pt-20">
        <div className="relative mx-auto max-w-2xl border border-(--inv-gold)/45 px-5 py-12 @xl:px-10 @xl:py-16">
          <MotifCorners
            assetId={design.cornerMotifId}
            className="size-16 @xl:size-24"
            fallback={
              <>
                <KbachCorner className="absolute -top-px -left-px size-12 text-(--inv-gold) @xl:size-14" />
                <KbachCorner className="absolute -top-px -right-px size-12 scale-x-[-1] text-(--inv-gold) @xl:size-14" />
                <KbachCorner className="absolute -bottom-px -left-px size-12 scale-y-[-1] text-(--inv-gold) @xl:size-14" />
                <KbachCorner className="absolute -right-px -bottom-px size-12 scale-[-1] text-(--inv-gold) @xl:size-14" />
              </>
            }
          />

          <p className="text-center text-[0.75rem] tracking-[0.24em] text-(--inv-muted) uppercase">
            {t(`event.type.${event.type}`)}
          </p>

          <p className="mt-6 text-center text-sm leading-relaxed text-(--inv-muted)">
            {L(design.greeting)}
          </p>

          <div
            className={
              second
                ? "mt-10 grid items-center gap-7 @xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]"
                : "mx-auto mt-10 max-w-sm"
            }
          >
            {first ? (
              <div className="text-center">
                <p className="text-[0.6875rem] font-medium text-(--inv-accent)">
                  {L(first.role)}
                </p>
                {first.parents ? (
                  <p className="mt-2 text-xs leading-relaxed text-(--inv-muted)">
                    {L(first.parents)}
                  </p>
                ) : null}
                <p
                  className="mt-3 text-[clamp(1.6rem,7cqi,2.5rem)] leading-tight break-words text-(--inv-fg)"
                  style={{
                    fontFamily:
                      locale === "km" ? "var(--inv-font-display-km)" : "var(--inv-font-display)",
                  }}
                >
                  {L(first.name)}
                </p>
              </div>
            ) : null}
            {second ? (
              <div
                className="flex items-center justify-center text-(--inv-gold) @xl:flex-col"
                aria-hidden="true"
              >
                <span className="h-px w-8 bg-(--inv-gold)/55 @xl:h-8 @xl:w-px" />
                <span className="mx-2 text-lg @xl:mx-0 @xl:my-2">&amp;</span>
                <span className="h-px w-8 bg-(--inv-gold)/55 @xl:h-8 @xl:w-px" />
              </div>
            ) : null}
            {second ? (
              <div className="text-center">
                <p className="text-[0.6875rem] font-medium text-(--inv-accent)">
                  {L(second.role)}
                </p>
                {second.parents ? (
                  <p className="mt-2 text-xs leading-relaxed text-(--inv-muted)">
                    {L(second.parents)}
                  </p>
                ) : null}
                <p
                  className="mt-3 text-[clamp(1.6rem,7cqi,2.5rem)] leading-tight break-words text-(--inv-fg)"
                  style={{
                    fontFamily:
                      locale === "km" ? "var(--inv-font-display-km)" : "var(--inv-font-display)",
                  }}
                >
                  {L(second.name)}
                </p>
              </div>
            ) : null}
          </div>

          <KbachDivider className="mx-auto mt-10 h-5 w-52 text-(--inv-gold)" />

          <div className="mt-8 text-center">
            <p className="text-base text-(--inv-fg)">{formatDate(event.date, locale, "full")}</p>
            <p className="mt-1 text-sm text-(--inv-muted)">{formatTime(event.date, locale)}</p>
            <p className="mt-4 text-sm text-(--inv-muted)">{L(event.venue.name)}</p>
          </div>
        </div>
      </header>

      {design.coverPhoto || event.coverPhoto ? (
        <div className="px-4 pt-8 @xl:px-8">
          <div className="mx-auto max-w-2xl">
            <FramedPhoto
              src={design.coverPhoto ?? event.coverPhoto}
              alt=""
              seed={1}
              frame={design.photoFrame ?? "arch"}
              motion={design.coverMotion ?? "none"}
              aspect="aspect-4/5 @xl:aspect-3/2"
            />
          </div>
        </div>
      ) : null}

      <InvSection>
        <p className="mx-auto max-w-md text-center text-base leading-loose text-(--inv-muted)">
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
        <InvSection title={t("public.scheduleTitle")} ornament="kbach" className="bg-(--inv-surface)">
          <InvitationSchedule items={event.schedule} variant="plain" />
        </InvSection>
      ) : null}

      <InvSection title={t("public.venueTitle")} ornament="kbach">
        <InvitationVenue variant="left" venue={event.venue} showMap={design.showMap} />
      </InvSection>

      {design.showGallery && design.gallery.length > 0 ? (
        <InvSection title={t("inv.gallery")} ornament="lotus" className="bg-(--inv-surface)">
          <GalleryStrip photos={design.gallery} />
        </InvSection>
      ) : null}

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
    </article>
  )
}

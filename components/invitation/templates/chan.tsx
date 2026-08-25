"use client"

import { FramedPhoto } from "@/components/invitation/photo-frame"
import { useLocale } from "@/components/providers/locale-provider"
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
 * Chan — modern editorial.
 *
 * Left-aligned, asymmetric, and quiet. Where Bopha centres everything inside a
 * frame, Chan runs the names across a wide measure with hairline rules and lets
 * the whitespace carry the formality.
 */
export function ChanTemplate({ event, guestName }: TemplateProps) {
  const { t, L, locale } = useLocale()
  const design = event.design

  return (
    <article className="bg-(--inv-bg) text-(--inv-fg)">
      <header className="mx-auto max-w-4xl px-6 pt-20 pb-12 @xl:pt-28">
        <p className="text-[0.75rem] tracking-[0.3em] text-(--inv-muted) uppercase">
          {t(`event.type.${event.type}`)}
        </p>

        <h1
          className="mt-8 text-[clamp(2.25rem,9cqi,4.5rem)] leading-[1.05] text-balance break-words text-(--inv-fg)"
          style={{ fontFamily: "var(--inv-font-display)" }}
        >
          {event.hosts.map((host, i) => (
            <span key={host.id} className="block">
              {L(host.name)}
              {i < event.hosts.length - 1 ? (
                <span className="text-(--inv-accent)/50"> &amp;</span>
              ) : null}
            </span>
          ))}
        </h1>

        <div className="mt-10 grid gap-6 border-t border-(--inv-border) pt-6 @xl:grid-cols-3">
          <div>
            <p className="text-[0.6875rem] tracking-[0.18em] text-(--inv-muted) uppercase">
              {t("public.saveTheDate")}
            </p>
            <p className="mt-1.5 text-(--inv-fg)">{formatDate(event.date, locale, "long")}</p>
            <p className="text-sm text-(--inv-muted)">{formatTime(event.date, locale)}</p>
          </div>
          <div>
            <p className="text-[0.6875rem] tracking-[0.18em] text-(--inv-muted) uppercase">
              {t("public.venueTitle")}
            </p>
            <p className="mt-1.5 text-(--inv-fg)">{L(event.venue.name)}</p>
            <p className="text-sm text-(--inv-muted)">{L(event.venue.address)}</p>
          </div>
          <div className="@xl:text-right">
            <AddToCalendar event={event} />
          </div>
        </div>
      </header>

      {design.coverPhoto || event.coverPhoto ? (
        <FramedPhoto
          src={design.coverPhoto ?? event.coverPhoto}
          alt=""
          seed={2}
          frame={design.photoFrame ?? "none"}
          motion={design.coverMotion ?? "none"}
          aspect="aspect-3/2 @xl:aspect-[21/9]"
        />
      ) : null}

      <InvSection>
        <div className="mx-auto max-w-2xl">
          <p className="text-lg leading-relaxed text-(--inv-muted) @xl:text-xl">
            {L(design.greeting)}
          </p>
          <p className="mt-4 text-base leading-loose text-(--inv-fg)">{L(design.message)}</p>
        </div>
        <div className="mt-12">
          <InvitationCountdown date={event.date} />
        </div>
      </InvSection>

      {design.showSchedule && event.schedule.length > 0 ? (
        <InvSection
          title={t("public.scheduleTitle")}
          ornament="rule"
          className="border-y border-(--inv-border)"
        >
          <InvitationSchedule items={event.schedule} />
        </InvSection>
      ) : null}

      {design.showGallery && design.gallery.length > 0 ? (
        <InvSection title={t("inv.gallery")} ornament="rule">
          <GalleryStrip photos={design.gallery} />
        </InvSection>
      ) : null}

      <InvSection
        title={t("public.venueTitle")}
        ornament="rule"
        className="border-t border-(--inv-border)"
      >
        <InvitationVenue venue={event.venue} showMap={design.showMap} />
      </InvSection>

      {design.showGiftInfo && design.giftNote ? (
        <InvSection title={t("public.giftTitle")} ornament="rule">
          <GiftNote note={design.giftNote} />
        </InvSection>
      ) : null}

      {design.showRsvp ? (
        <InvSection
          id="rsvp"
          title={t("public.rsvpTitle")}
          ornament="rule"
          className="border-t border-(--inv-border) bg-(--inv-surface)"
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

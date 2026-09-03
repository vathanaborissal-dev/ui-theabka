"use client"

import { FramedPhoto } from "@/components/invitation/photo-frame"
import { useLocale } from "@/components/providers/locale-provider"
import { formatDate, formatTime } from "@/lib/format"
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
import type { TemplateProps } from "./types"

/**
 * Chan — the editorial masthead.
 *
 * Structurally unlike the other cards: instead of one column of stacked
 * sections, a wide screen splits this into a fixed masthead and a scrolling
 * column beside it. The names, the date and the reply button stay in view the
 * whole way down, which is the point — the guest never loses the "what and
 * when" while reading the detail. Below the split it collapses to a single
 * column and the masthead becomes an ordinary hero.
 */
export function ChanTemplate({ event, guestName }: TemplateProps) {
  const { t, L, locale } = useLocale()
  const design = event.design

  return (
    <article data-inv-template="chan" className="bg-(--inv-bg) text-(--inv-fg) @3xl:grid @3xl:grid-cols-[minmax(0,21rem)_minmax(0,1fr)]">
      {/* Masthead — sticky beside the content once there is room for two columns. */}
      <aside className="border-(--inv-border) px-7 pt-16 pb-10 @3xl:sticky @3xl:top-0 @3xl:flex @3xl:h-svh @3xl:flex-col @3xl:justify-center @3xl:border-r @3xl:py-14">
        <p className="text-[0.75rem] tracking-[0.3em] text-(--inv-muted) uppercase">
          {t(`event.type.${event.type}`)}
        </p>

        <h1
          className="mt-7 text-[clamp(2rem,8cqi,3rem)] leading-[1.08] text-balance break-words"
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

        <dl className="mt-9 space-y-5 border-t border-(--inv-border) pt-6 text-sm">
          <div>
            <dt className="text-[0.6875rem] tracking-[0.18em] text-(--inv-muted) uppercase">
              {t("public.saveTheDate")}
            </dt>
            <dd className="mt-1.5 text-(--inv-fg)">{formatDate(event.date, locale, "long")}</dd>
            <dd className="text-(--inv-muted)">{formatTime(event.date, locale)}</dd>
          </div>
          <div>
            <dt className="text-[0.6875rem] tracking-[0.18em] text-(--inv-muted) uppercase">
              {t("public.venueTitle")}
            </dt>
            <dd className="mt-1.5 text-(--inv-fg)">{L(event.venue.name)}</dd>
            <dd className="text-(--inv-muted)">{L(event.venue.address)}</dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2">
          {design.showRsvp ? (
            <a
              href="#rsvp"
              className="inline-flex min-h-11 items-center rounded-full bg-(--inv-accent) px-6 text-sm font-medium text-(--inv-accent-contrast) transition-opacity outline-none hover:opacity-90 focus-visible:ring-3 focus-visible:ring-(--inv-accent)/40"
            >
              {t("public.replyNow")}
            </a>
          ) : null}
          <AddToCalendar event={event} />
        </div>
      </aside>

      {/* The reading column. */}
      <div className="min-w-0">
        {design.coverPhoto || event.coverPhoto ? (
          <FramedPhoto
            src={design.coverPhoto}
            alt=""
            seed={2}
            frame={design.photoFrame ?? "none"}
            motion={design.coverMotion ?? "none"}
            aspect="aspect-3/2 @3xl:aspect-4/3"
          />
        ) : null}

        <InvSection align="left" section="letter">
          {/* Ranged left with the rest of this card's type, not centred. */}
          <GuestHonour guestName={guestName} variant="plain" className="mx-0 mb-6 text-left" />
          <p className="text-lg leading-relaxed text-(--inv-muted) @xl:text-xl">
            {L(design.greeting)}
          </p>
          <p className="mt-4 max-w-prose text-base leading-loose text-(--inv-fg)">
            {L(design.message)}
          </p>
          <div className="mt-11">
            <InvitationCountdown variant="inline" date={event.date} />
          </div>
        </InvSection>

        {design.showSchedule && event.schedule.length > 0 ? (
          <InvSection
            align="left"
            title={t("public.scheduleTitle")} section="schedule"
            ornament="rule"
            className="border-y border-(--inv-border)"
          >
            <InvitationSchedule items={event.schedule} variant="plain" />
          </InvSection>
        ) : null}

        {design.showGallery && design.gallery.length > 0 ? (
          <InvSection align="left" title={t("inv.gallery")} section="gallery" ornament="rule">
            <GalleryStrip photos={design.gallery} />
          </InvSection>
        ) : null}

        <InvSection
          align="left"
          title={t("public.venueTitle")} section="venue"
          ornament="rule"
          className="border-t border-(--inv-border)"
        >
          <InvitationVenue variant="left" venue={event.venue} showMap={design.showMap} />
        </InvSection>

        {design.showGiftInfo && design.giftNote ? (
          <InvSection align="left" title={t("public.giftTitle")} section="gift" ornament="rule">
            <GiftNote note={design.giftNote} />
          </InvSection>
        ) : null}

        {design.showRsvp ? (
          <InvSection
            align="left"
            id="rsvp"
            title={t("public.rsvpTitle")} section="rsvp"
            ornament="rule"
            className="border-t border-(--inv-border) bg-(--inv-surface)"
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

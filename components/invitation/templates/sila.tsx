"use client"

import { useLocale } from "@/components/providers/locale-provider"
import { formatDate, formatTime } from "@/lib/format"
import { LotusMark } from "@/components/invitation/ornaments"
import { InvitationSchedule } from "../sections/schedule"
import { InvitationVenue } from "../sections/venue"
import { InvitationRsvpForm } from "../sections/rsvp-form"
import {
  AddToCalendar,
  ContactList,
  GiftNote,
  InvSection,
  InvitationFooter,
} from "../sections/common"
import type { TemplateProps } from "./types"

/**
 * Sila — restrained.
 *
 * For memorials, almsgiving and other ceremonies where a photo-led, celebratory
 * layout would be inappropriate. No cover image, no countdown, no gallery: just
 * the information a guest needs, set quietly.
 */
export function SilaTemplate({ event, guestName }: TemplateProps) {
  const { t, L, locale } = useLocale()
  const design = event.design

  return (
    <article className="bg-(--inv-bg) text-(--inv-fg)">
      <header className="mx-auto max-w-xl px-6 pt-24 pb-12 text-center @xl:pt-32">
        <LotusMark className="mx-auto size-8 text-(--inv-muted)" />

        <p className="mt-8 text-[0.75rem] tracking-[0.28em] text-(--inv-muted) uppercase">
          {t(`event.type.${event.type}`)}
        </p>

        <h1
          className="mt-6 text-[clamp(1.6rem,6.5cqi,2.75rem)] leading-snug text-balance break-words"
          style={{ fontFamily: "var(--inv-font-display)" }}
        >
          {L(event.title)}
        </h1>

        {event.hosts.length > 0 ? (
          <p className="mt-5 text-base text-(--inv-muted)">
            {event.hosts.map((h) => L(h.name)).join(" · ")}
          </p>
        ) : null}

        <span className="mx-auto mt-10 block h-px w-16 bg-(--inv-border)" aria-hidden="true" />

        <p className="mt-8 text-base text-(--inv-fg)">{formatDate(event.date, locale, "full")}</p>
        <p className="mt-1 text-sm text-(--inv-muted)">{formatTime(event.date, locale)}</p>

        <p className="mt-8 text-base leading-loose text-(--inv-muted)">{L(design.message)}</p>

        <p className="mt-8">
          <AddToCalendar event={event} />
        </p>
      </header>

      {design.showSchedule && event.schedule.length > 0 ? (
        <InvSection
          title={t("public.scheduleTitle")}
          ornament="rule"
          className="border-t border-(--inv-border)"
        >
          <InvitationSchedule items={event.schedule} variant="plain" />
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
        <InvSection
          title={t("public.giftTitle")}
          ornament="rule"
          className="border-t border-(--inv-border)"
        >
          <GiftNote note={design.giftNote} />
        </InvSection>
      ) : null}

      {design.showRsvp ? (
        <InvSection
          id="rsvp"
          title={t("public.rsvpTitle")}
          ornament="rule"
          className="border-t border-(--inv-border)"
        >
          <InvitationRsvpForm event={event} guestName={guestName} />
        </InvSection>
      ) : null}

      {event.contacts.length > 0 ? (
        <InvSection
          title={t("public.contactHosts")}
          ornament="rule"
          className="border-t border-(--inv-border)"
        >
          <ContactList contacts={event.contacts} />
        </InvSection>
      ) : null}

      <InvitationFooter event={event} />
    </article>
  )
}

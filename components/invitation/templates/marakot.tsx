"use client"

import { Navigation } from "lucide-react"
import { useLocale } from "@/components/providers/locale-provider"
import { dateFieldParts, formatDate, formatTime } from "@/lib/format"
import { imageSrcSet } from "@/lib/uploads"
import {
  useDesign,
  useInvitationMotionEnabled,
} from "@/components/invitation/design-context"
import { Motif } from "@/components/invitation/motif"
import { Reveal } from "@/components/invitation/motion"
import { NamePlate } from "@/components/invitation/gold-ornaments"
import { FramedPhoto } from "@/components/invitation/photo-frame"
import { BilingualHeading } from "../sections/bilingual-heading"
import { WeddingCalendar } from "../sections/wedding-calendar"
import { InvitationSchedule } from "../sections/schedule"
import { InvitationRsvpForm } from "../sections/rsvp-form"
import { InvitationWishes } from "../sections/wishes"
import { GiftQr } from "../sections/gift-qr"
import { GalleryStrip, ContactList, GiftNote } from "../sections/common"
import type { TemplateProps } from "./types"

/**
 * Marakot — the emerald card.
 *
 * Deep forest green as the ink, gold kept for ornament, over a soft moving
 * ground. Its distinguishing habit is that it says everything twice: the Khmer
 * line in Moul and the English beneath it in a script hand. That is not a
 * translation toggle — a Cambodian family sends one link to relatives who read
 * Khmer and relatives who read Latin, and this card is designed so neither has
 * to change a setting to read it.
 *
 * The month calendar is the other thing that sets it apart. A date in a
 * sentence says when; the grid says which day of their week it lands on, which
 * is what a guest actually needs to know before they answer.
 */
export function MarakotTemplate({ event, guestName }: TemplateProps) {
  const { t, L, locale } = useLocale()
  const design = event.design
  const [groom, bride] = event.hosts
  const coverPhoto = design.coverPhoto
  const parts = dateFieldParts(event.date, locale)

  return (
    <article
      data-inv-template="marakot"
      className="relative z-10 mx-auto w-full max-w-md text-(--inv-fg)"
    >
      {/* --------------------------------------------------------- cover */}
      <header className="flex min-h-svh flex-col items-center justify-between px-6 py-14 text-center">
        <div>
          <BilingualHeading value={event.title} size="lead" />
          <BilingualHeading
            value={
              design.honourLabel ?? { km: t("public.honour"), en: "Invitation" }
            }
            className="mt-8"
          />
        </div>

        {/* The couple, once the envelope is open.
            The envelope carries only the greeting, so this is the first time
            the guest sees them — which is what the photo is for. */}
        {coverPhoto ? (
          <FramedPhoto
            src={coverPhoto}
            alt=""
            seed={6}
            frame={design.photoFrame ?? "arch"}
            motion={design.coverMotion ?? "none"}
            aspect="aspect-3/4"
            className="mx-auto w-full max-w-[14rem]"
          />
        ) : null}

        <div className="w-full">
          {/* The guest's own name, in the frame this template is built around. */}
          <NamePlate plateId={design.namePlateId ?? "emerald"}>
            <p
              className="text-[clamp(0.9375rem,4.4cqi,1.125rem)] leading-snug text-balance"
              style={{ fontFamily: "var(--inv-font-display)" }}
            >
              {guestName || t("public.honourGeneric")}
            </p>
          </NamePlate>

          <p className="mt-6 text-sm text-(--inv-muted)">
            {formatDate(event.date, locale, "full")}
          </p>
        </div>
      </header>

      {/* A heavier veil than the cover needs.
          The loop passes through a wax seal and a folded flap, so a thin wash
          leaves body copy sitting on whatever frame happens to be showing.
          Enough opacity to hold the text, little enough to keep the movement. */}
      <div className="relative bg-(--inv-bg)/78 backdrop-blur-[2px]">
        {/* -------------------------------------------------------- parents */}
        {groom?.parents || bride?.parents ? (
          <Section>
            <BilingualHeading
              value={{ km: "ដោយមានពរជ័យពីមាតាបិតា", en: "With our parents' blessing" }}
            />
            <Rule />
            <div className="flex items-start justify-center gap-5">
              {[groom, bride].filter(Boolean).map((host) => (
                <div key={host!.id} className="min-w-0 flex-1 text-center">
                  <p className="text-xs text-(--inv-muted)">{L(host!.role)}</p>
                  {host!.parents ? (
                    <p className="mt-1.5 text-sm leading-relaxed">{L(host!.parents)}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {/* --------------------------------------------------------- letter */}
        <Section section="letter">
          <BilingualHeading value={design.greeting} />
          <Rule />
          <p className="text-center text-[0.9375rem] leading-loose text-(--inv-fg)/90">
            {L(design.message)}
          </p>
        </Section>

        {/* ---------------------------------------------------- the couple */}
        <Section>
          <div className="flex items-start justify-center gap-4">
            {[groom, bride].filter(Boolean).map((host, i) => (
              <div key={host!.id} className="contents">
                {i > 0 ? (
                  <span className="mt-8 shrink-0 text-lg text-(--inv-gold)" aria-hidden="true">
                    ✦
                  </span>
                ) : null}
                <div className="min-w-0 flex-1 text-center">
                  <p className="text-xs text-(--inv-muted)">{L(host!.role)}</p>
                  <p
                    className="mt-2 text-lg leading-snug text-balance text-(--inv-accent)"
                    style={{ fontFamily: "var(--font-khmer-display-stack)" }}
                    lang="km"
                  >
                    {host!.name.km || host!.name.en}
                  </p>
                  {host!.name.en ? (
                    <p
                      className="mt-1 text-base text-(--inv-accent)/75"
                      style={{ fontFamily: "var(--font-latin-script)" }}
                      lang="en"
                    >
                      {host!.name.en}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ----------------------------------------------------------- date */}
        <Section section="countdown">
          <BilingualHeading
            value={{ km: "ដែលនឹងប្រារព្ធទៅនៅ", en: "Wedding Ceremony" }}
          />
          <Rule />
          <p className="text-center text-lg text-(--inv-accent)" lang={locale}>
            {formatDate(event.date, locale, "full")}
          </p>
          <p className="mt-1 text-center text-sm text-(--inv-muted)">
            {formatTime(event.date, locale)}
          </p>
          <div className="mt-8">
            <WeddingCalendar date={event.date} />
          </div>
        </Section>

        {/* ------------------------------------------------------- schedule */}
        {design.showSchedule && event.schedule.length > 0 ? (
          <Section section="schedule">
            <BilingualHeading
              value={{ km: "កម្មវិធីសិរីមង្គល", en: "Program Timeline" }}
            />
            <Rule />
            <InvitationSchedule items={event.schedule} variant="centred" />
          </Section>
        ) : null}

        {/* ---------------------------------------------------------- venue */}
        <Section section="venue">
          <BilingualHeading value={{ km: "ទីតាំង", en: "Location" }} />
          <Rule />
          <p className="text-center text-[0.9375rem] leading-relaxed">{L(event.venue.name)}</p>
          <p className="mt-1 text-center text-sm text-(--inv-muted)">{L(event.venue.address)}</p>

          {design.showMap && design.venueMapImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              {...imageSrcSet(design.venueMapImage, { sizes: "100vw", crop: "fit" })}
              alt={`${t("public.venueTitle")}: ${L(event.venue.name)}`}
              className="mt-5 w-full rounded-xl border border-(--inv-border)"
              loading="lazy"
            />
          ) : null}

          {design.showMap && event.venue.mapUrl ? (
            <p className="mt-6 text-center">
              <a
                href={event.venue.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-(--inv-accent) px-6 text-sm font-medium text-(--inv-accent-contrast) transition-opacity outline-none hover:opacity-90 focus-visible:ring-3 focus-visible:ring-(--inv-accent)/40"
              >
                <Navigation className="size-4" aria-hidden="true" />
                {t("public.getDirections")}
              </a>
            </p>
          ) : null}
        </Section>

        {design.showGallery && design.gallery.length > 0 ? (
          <Section section="gallery">
            <BilingualHeading value={{ km: "រូបភាព", en: "Images" }} />
            <Rule />
            <GalleryStrip photos={design.gallery} />
          </Section>
        ) : null}

        {design.showGiftInfo ? (
          <Section section="gift">
            <BilingualHeading value={{ km: "អំណោយមង្គលការ", en: "Wedding Gift" }} />
            <Rule />
            <GiftNote note={design.giftNote} />
            <div className="mt-6">
              <GiftQr usd={design.giftQrUsd} khr={design.giftQrKhr} />
            </div>
          </Section>
        ) : null}

        {design.showRsvp ? (
          <Section section="rsvp" id="inv-rsvp">
            <BilingualHeading value={{ km: "ឆ្លើយតប", en: "Will you join us?" }} />
            <Rule />
            <InvitationRsvpForm event={event} guestName={guestName} />
          </Section>
        ) : null}

        {design.showWishes ? (
          <Section section="wishes">
            <BilingualHeading value={{ km: "សារជូនពរ", en: "Messages" }} />
            <Rule />
            <InvitationWishes />
          </Section>
        ) : null}

        {/* --------------------------------------------------- the apology */}
        {design.thankYouNote && L(design.thankYouNote) ? (
          <Section section="thanks">
            <BilingualHeading
              value={
                design.thankYouTitle ?? { km: "សូមអភ័យទោស", en: "Our apologies" }
              }
            />
            <Rule />
            <p className="text-center text-[0.9375rem] leading-loose text-(--inv-fg)/90">
              {L(design.thankYouNote)}
            </p>
          </Section>
        ) : null}

        {event.contacts.length > 0 ? (
          <Section section="contacts">
            <BilingualHeading value={{ km: "ទាក់ទងគ្រួសារ", en: "Contact the family" }} />
            <Rule />
            <ContactList contacts={event.contacts} />
          </Section>
        ) : null}

        <footer className="px-6 pt-4 pb-12 text-center">
          {/* The couple, closing the card — shown when an illustration is chosen. */}
          {design.coupleMotifId ? (
            <div className="mx-auto mb-6 h-40 @xl:h-48">
              <Motif
                assetId={design.coupleMotifId}
                fallback={null}
                className="mx-auto h-full w-auto"
              />
            </div>
          ) : null}
          <Rule />
          <p
            className="mt-4 text-lg text-(--inv-accent)"
            style={{ fontFamily: "var(--font-latin-script)" }}
          >
            {event.hosts.map((h) => h.name.en || h.name.km).join(" & ")}
          </p>
          <p className="mt-1 text-sm text-(--inv-muted)" lang="km">
            {parts.day} {parts.month} {parts.year}
          </p>
          <p className="mt-5 text-xs text-(--inv-muted)/70">Made with Theabka</p>
        </footer>
      </div>
    </article>
  )
}

/**
 * One passage of the card.
 *
 * At module scope, not inside the template: a component declared during render
 * is a new type on every render, so React unmounts and remounts its subtree and
 * every bit of state inside — the reply form mid-typing included — is thrown
 * away. It reads the entrance from context for the same reason the shared shell
 * does, so the Motion setting means the same thing here as everywhere else.
 */
function Section({
  children,
  section,
  id,
}: {
  children: React.ReactNode
  section?: string
  id?: string
}) {
  const { entrance = "rise" } = useDesign()
  const motionEnabled = useInvitationMotionEnabled()

  return (
    <section
      id={id ?? (section ? `inv-${section}` : undefined)}
      data-inv-section={section}
      className="px-6 py-10"
    >
      <Reveal entrance={motionEnabled ? entrance : "none"}>{children}</Reveal>
    </section>
  )
}

/** A gold hairline with a diamond at its centre — the divider between passages. */
function Rule() {
  return (
    <div className="my-5 flex items-center justify-center gap-2" aria-hidden="true">
      <span className="h-px w-14 bg-linear-to-r from-transparent to-(--inv-gold)/70" />
      <span className="text-[0.625rem] text-(--inv-gold)">◆</span>
      <span className="h-px w-14 bg-linear-to-l from-transparent to-(--inv-gold)/70" />
    </div>
  )
}

"use client"

import { useLocale } from "@/components/providers/locale-provider"
import { dateFieldParts, formatDate, formatTime } from "@/lib/format"
import { imageSrcSet } from "@/lib/uploads"
import { Motif } from "@/components/invitation/motif"
import { cn } from "@/lib/utils"
import {
  useDesign,
  useInvitationMotionEnabled,
} from "@/components/invitation/design-context"
import { Reveal } from "@/components/invitation/motion"
import { NamePlate, GoldPlaque } from "@/components/invitation/gold-ornaments"
import { FramedPhoto } from "@/components/invitation/photo-frame"
import { InvitationCountdown } from "../sections/countdown"
import { InvitationSchedule } from "../sections/schedule"
import { InvitationRsvpForm } from "../sections/rsvp-form"
import { InvitationWishes } from "../sections/wishes"
import { GiftQr } from "../sections/gift-qr"
import { GalleryStrip, ContactList, GiftNote, AddToCalendar } from "../sections/common"
import type { InvSectionId } from "../sections/common"
import type { TemplateProps } from "./types"

/**
 * Chhaya — the card read over a moving picture.
 *
 * The backdrop is a video, and the whole design follows from one decision about
 * it: the type is dark, so the video never has to be dimmed. A wedding backdrop
 * is almost always pale — drifting florals, sky, silk — and light type over it
 * survives only behind a scrim, which turns the footage into a grey rectangle
 * and removes the reason for playing it. Warm brown and gold on pale footage
 * need nothing behind them at all.
 *
 * So there are no panels here, and no text shadows. The two places that do get
 * a surface are the reply form and the wishes list, because a form's controls
 * need edges and a long list is read for minutes rather than seconds; both use
 * frosted white so the picture still shows through.
 */
export function ChhayaTemplate({ event, guestName }: TemplateProps) {
  const { t, L, locale } = useLocale()
  const design = event.design
  const [groom, bride] = event.hosts
  const coverPhoto = design.coverPhoto

  return (
    <article
      data-inv-template="chhaya"
      className="relative z-10 mx-auto w-full max-w-md text-(--inv-fg)"
    >
      {/* ------------------------------------------------------------ cover */}
      <header className="flex min-h-svh flex-col justify-between gap-8 px-6 py-14 text-center">
        <div>
          <h1 className={cn(DISPLAY, "text-[clamp(1.5rem,8cqi,2.125rem)] leading-[1.55] text-(--inv-accent)")}>
            {L(event.title)}
          </h1>

          {design.hideCoverNames ? null : (
            <p className={cn(DISPLAY, "mt-6 text-[clamp(1.375rem,7.5cqi,2rem)] leading-[1.5] text-(--inv-accent)")}>
              {groom ? L(groom.name) : null}
              {groom && bride ? (
                <span className="mx-2 text-[0.6em] text-(--inv-gold)">
                  {locale === "km" ? "និង" : "and"}
                </span>
              ) : null}
              {bride ? L(bride.name) : null}
            </p>
          )}

          {/* Above the fold on purpose.
              A personal link exists so the guest sees their own name; putting
              it at the foot of a full-height cover means they only find it if
              they scroll, and most people decide how they feel about a card
              before they do. */}
          <div className="mt-8">
            <p className={cn(DISPLAY, "text-[clamp(0.9375rem,4.5cqi,1.0625rem)] text-(--inv-gold)")}>
              {(design.honourLabel && L(design.honourLabel)) || t("public.honour")}
            </p>
            <NamePlate variant="ivory" plateId={design.namePlateId} className="mt-3">
              <p
                className="text-[clamp(0.9375rem,4.4cqi,1.125rem)] leading-snug text-balance"
                style={{ fontFamily: "var(--inv-font-display)" }}
              >
                {guestName || t("public.honourGeneric")}
              </p>
            </NamePlate>
          </div>
        </div>

        {/* The composition's middle. Without it the cover is two clusters of
            type pinned to the top and bottom of the screen with a void between
            them — which is what a full-height cover looks like when nothing
            occupies its centre. */}
        {coverPhoto ? (
          <FramedPhoto
            src={coverPhoto}
            alt=""
            seed={5}
            frame={design.photoFrame ?? "arch"}
            motion={design.coverMotion ?? "none"}
            aspect="aspect-3/4"
            className="mx-auto w-full max-w-[15rem]"
          />
        ) : null}

        <div>
          <DateBand date={event.date} />
        </div>
      </header>

      <div className="px-6 pb-14">
        {/* ------------------------------------------------------- parents */}
        {groom?.parents || bride?.parents ? (
          <section className="flex items-start justify-center gap-5">
            {[groom, bride].filter(Boolean).map((host) => (
              <div key={host!.id} className="min-w-0 flex-1 text-center">
                <p className="text-xs tracking-wide text-(--inv-muted)">{L(host!.role)}</p>
                {host!.parents ? (
                  <p className={cn(DISPLAY, "mt-1.5 text-sm leading-relaxed text-(--inv-fg)")}>
                    {L(host!.parents)}
                  </p>
                ) : null}
              </div>
            ))}
          </section>
        ) : null}

        {/* -------------------------------------------------------- letter */}
        <Section section="letter">
          <h2 className={HEADING}>{L(design.greeting) || t("public.withBlessing")}</h2>
          <Rule />
          <p className="text-center text-[0.9375rem] leading-loose text-(--inv-fg)">
            {L(design.message)}
          </p>
        </Section>

        {/* ----------------------------------------------------- countdown */}
        <Section section="countdown">
          <h2 className={HEADING}>{t("public.countdownTitle")}</h2>
          <p className="mt-3 text-center text-sm text-(--inv-muted)">
            {formatDate(event.date, locale, "full")}
            <span className="mx-1.5">·</span>
            {formatTime(event.date, locale)}
          </p>
          <div className="mt-6">
            <InvitationCountdown variant="row" date={event.date} />
          </div>
          <p className="mt-8 text-center">
            <AddToCalendar event={event} variant="plaque" />
          </p>
        </Section>

        {design.showSchedule && event.schedule.length > 0 ? (
          <Section section="schedule">
            <h2 className={HEADING}>{t("public.scheduleTitle")}</h2>
            <Rule />
            <InvitationSchedule items={event.schedule} variant="centred" />
          </Section>
        ) : null}

        {/* --------------------------------------------------------- venue */}
        <Section section="venue">
          <h2 className={HEADING}>{t("public.venueTitle")}</h2>
          <Rule />
          <p className="text-center text-[0.9375rem] leading-relaxed text-(--inv-fg)">
            {L(event.venue.name)}
          </p>
          <p className="mt-1 text-center text-sm leading-relaxed text-(--inv-muted)">
            {L(event.venue.address)}
          </p>

          {design.showMap && design.venueMapImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              {...imageSrcSet(design.venueMapImage, { sizes: "100vw", crop: "fit" })}
              alt={`${t("public.venueTitle")}: ${L(event.venue.name)}`}
              className="mt-5 w-full rounded-lg border border-(--inv-border)"
              loading="lazy"
            />
          ) : null}

          {design.showMap && event.venue.mapUrl ? (
            <p className="mt-6 text-center">
              <a
                href={event.venue.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block outline-none focus-visible:ring-3 focus-visible:ring-(--inv-accent)/40"
              >
                <GoldPlaque>
                  <span className={PLAQUE_LABEL}>{t("public.getDirections")}</span>
                </GoldPlaque>
              </a>
            </p>
          ) : null}
        </Section>

        {design.showGallery && design.gallery.length > 0 ? (
          <Section section="gallery">
            <h2 className={HEADING}>{t("inv.gallery")}</h2>
            <Rule />
            <GalleryStrip photos={design.gallery} />
          </Section>
        ) : null}

        {design.thankYouNote && L(design.thankYouNote) ? (
          <Section section="thanks">
            <h2 className={HEADING}>
              {(design.thankYouTitle && L(design.thankYouTitle)) || t("public.thankYouTitle")}
            </h2>
            <Rule />
            <p className="text-center text-[0.9375rem] leading-loose text-(--inv-fg)">
              {L(design.thankYouNote)}
            </p>
          </Section>
        ) : null}

        {design.showGiftInfo ? (
          <Section section="gift">
            <h2 className={HEADING}>{t("public.giftTitle")}</h2>
            <Rule />
            <GiftNote note={design.giftNote} />
            <div className="mt-6">
              <GiftQr usd={design.giftQrUsd} khr={design.giftQrKhr} />
            </div>
          </Section>
        ) : null}

        {/* A form's controls need edges, so this one gets a surface. */}
        {design.showRsvp ? (
          <Section id="rsvp" frosted>
            <h2 className={HEADING}>{t("public.rsvpTitle")}</h2>
            <Rule />
            <InvitationRsvpForm event={event} guestName={guestName} />
          </Section>
        ) : null}

        {design.showWishes ? (
          <Section frosted>
            <h2 className={HEADING}>{t("public.wishesTitle")}</h2>
            <Rule />
            <InvitationWishes />
          </Section>
        ) : null}

        {event.contacts.length > 0 ? (
          <Section section="contacts">
            <h2 className={HEADING}>{t("public.contactHosts")}</h2>
            <Rule />
            <ContactList contacts={event.contacts} />
          </Section>
        ) : null}

        <footer className="mt-14 text-center">
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
          <p className={cn(DISPLAY, "mt-4 text-lg text-(--inv-accent)")}>
            {event.hosts.map((h) => L(h.name)).join(locale === "km" ? " និង " : " & ")}
          </p>
          <p className="mt-4 text-xs text-(--inv-muted)">Made with Theabka</p>
        </footer>
      </div>
    </article>
  )
}

/* --------------------------------------------------------------- internals */

/**
 * The day, set between two rules.
 *
 * The printed card gives the date this treatment rather than a sentence: the
 * numeral is what a guest is trying to find, so it is the largest thing on the
 * line and the month and hour sit either side of it.
 */
function DateBand({ date }: { date: string }) {
  const { locale } = useLocale()
  const { day, month } = dateFieldParts(date, locale)

  return (
    <div className="mt-7 flex items-center justify-center gap-4">
      <span className="flex-1 text-right text-sm text-(--inv-muted)">{month}</span>
      <span
        className="border-x border-(--inv-gold)/50 px-4 text-[2rem] leading-none text-(--inv-accent)"
        style={{ fontFamily: "var(--inv-font-display)" }}
      >
        {day}
      </span>
      <span className="flex-1 text-left text-sm text-(--inv-muted)">
        {formatTime(date, locale)}
      </span>
    </div>
  )
}

/**
 * One passage.
 *
 * Unpainted by default: the point of this template is the picture behind it,
 * and a panel per section would cover the picture with rectangles. `frosted` is
 * the exception, for the two places that need a real surface.
 */
function Section({
  children,
  id,
  section,
  frosted = false,
}: {
  children: React.ReactNode
  id?: string
  section?: InvSectionId
  frosted?: boolean
}) {
  /*
   * The entrance is applied here, not left to the shared shell.
   *
   * This template has its own section wrapper, so it was silently opting out of
   * the setting the builder offers — every choice in the Motion list did
   * nothing on this card. Reading it from the design keeps the one control
   * meaning the same thing on every template.
   */
  const { entrance = "rise" } = useDesign()
  const motionEnabled = useInvitationMotionEnabled()

  return (
    <section
      id={id ?? (section ? `inv-${section}` : undefined)}
      data-inv-section={section}
      className={cn(
        "mt-12",
        frosted &&
          "rounded-2xl border border-(--inv-border) bg-(--inv-surface) px-4 py-7 backdrop-blur-md"
      )}
    >
      <Reveal entrance={motionEnabled ? entrance : "none"}>{children}</Reveal>
    </section>
  )
}

function Rule() {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src="/motifs/dividers/divider--kbach-silver.png"
      alt=""
      aria-hidden="true"
      className="mx-auto my-5 h-auto w-36 max-w-full opacity-70 [filter:sepia(1)_saturate(2)_hue-rotate(3deg)]"
      loading="lazy"
    />
  )
}

const DISPLAY = "[font-family:var(--inv-font-display)]"

const HEADING =
  "text-center text-[clamp(1.0625rem,5cqi,1.25rem)] leading-relaxed text-(--inv-accent) " +
  "[font-family:var(--inv-font-display)]"

const PLAQUE_LABEL =
  "text-sm leading-tight text-[#5b4526] [font-family:var(--inv-font-display)]"

"use client"

import { PointerIcon } from "lucide-react"
import { useLocale } from "@/components/providers/locale-provider"
import { formatDate, formatTime } from "@/lib/format"
import { cloudinaryUrl, imageSrcSet } from "@/lib/uploads"
import { Motif } from "@/components/invitation/motif"
import { cn } from "@/lib/utils"
import {
  useDesign,
  useInvitationMotionEnabled,
} from "@/components/invitation/design-context"
import { Reveal } from "@/components/invitation/motion"
import { PatternBackground } from "@/components/invitation/patterns"
import {
  GoldFlourish,
  GoldHeart,
  GoldPlaque,
  NamePlate,
} from "@/components/invitation/gold-ornaments"
import { InvitationCountdown } from "../sections/countdown"
import { InvitationSchedule } from "../sections/schedule"
import { InvitationRsvpForm } from "../sections/rsvp-form"
import { InvitationWishes } from "../sections/wishes"
import { GiftQr } from "../sections/gift-qr"
import { AddToCalendar, GalleryStrip, ContactList, GiftNote } from "../sections/common"
import { useOrnaments } from "./use-ornaments"
import type { TemplateProps } from "./types"

/**
 * Sompeah — the gold-on-ivory scrolling card.
 *
 * Modelled on the Cambodian e-invitation people actually receive in Telegram:
 * a full-bleed photo of the couple that greets the guest by name in a gold
 * cartouche, then one continuous scroll on ivory patterned ground where every
 * word — headings, body copy, the buttons — is set in the same gold.
 *
 * It deliberately does not use `InvSection`. That shell gives the other
 * templates their variety: tinted bands, ranged-left headings, lotus marks. A
 * card of this kind has none of those. It is one uninterrupted sheet, and
 * borrowing the shell would have put surfaces and rules across it that the
 * printed original does not have.
 *
 * Narrow at every screen size on purpose. This is opened on a phone in a chat
 * app; letting it stretch across a desktop would make the one layout everybody
 * sees the one nobody designed.
 */
export function SompeahTemplate({ event, guestName }: TemplateProps) {
  const { t, L, locale } = useLocale()
  const design = event.design
  const { entrance = "rise" } = useDesign()
  const motionEnabled = useInvitationMotionEnabled()
  const orn = useOrnaments(design, "rich")
  // Already resolved by the renderer, which folds the event's photo in.
  const coverPhoto = design.coverPhoto
  const [groom, bride] = event.hosts
  // The drop shadow earns its place only over a photograph; on the ivory
  // fallback it just muddies the gold.
  const gold = coverPhoto ? GOLD_ON_PHOTO : DISPLAY_GOLD

  return (
    <article
      data-inv-template="sompeah"
      className="relative z-10 mx-auto w-full max-w-md text-(--inv-fg)"
    >
      {/* ------------------------------------------------------------ cover */}
      <header className="relative flex min-h-[var(--inv-preview-height,100dvh)] flex-col justify-between overflow-hidden text-center">
        {coverPhoto ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${cloudinaryUrl(coverPhoto, "f_auto,q_auto,c_fill,g_auto,w_900,h_1600")})`,
            }}
            aria-hidden="true"
          />
        ) : (
          // Without a photo the cover would be a flat slab of accent colour,
          // so it falls back to the card's own ground with its pattern showing.
          <div className="absolute inset-0 bg-(--inv-bg)" aria-hidden="true">
            <PatternBackground
              pattern={orn.pattern === "none" ? "phka" : orn.pattern}
              className="text-(--inv-gold)"
              scale={1.15}
              opacity={0.16}
            />
          </div>
        )}

        {/* Gold type on a photograph the couple chose, not one we picked. The
            scrim has to be strongest where the type is and clear through the
            middle, where the faces are. */}
        {coverPhoto ? (
          <div
            className="absolute inset-0 bg-linear-to-b from-black/45 via-black/10 to-black/55"
            aria-hidden="true"
          />
        ) : null}

        <div className="relative px-6 pt-[max(4.5rem,10dvh)]">
          <h1 className={cn(gold, "mx-auto max-w-sm text-[clamp(1.5rem,8cqi,2.1rem)] leading-[1.55] text-balance")}>
            {L(event.title)}
          </h1>

          {design.hideCoverNames ? null : (
            <p className={cn(gold, "mt-3 text-[clamp(1.125rem,6cqi,1.5rem)] leading-[1.5]")}>
              {groom ? L(groom.name) : null}
              {groom && bride ? (
                <span className="mx-2 text-[0.75em]">{locale === "km" ? "និង" : "and"}</span>
              ) : null}
              {bride ? L(bride.name) : null}
            </p>
          )}
        </div>

        <div className="relative px-4 pb-8">
          {/* The whole point of a personal link: the guest reads their own name
              on the card before anything else. */}
          <p className={cn(gold, "text-[clamp(1rem,5cqi,1.25rem)]")}>
            {(design.honourLabel && L(design.honourLabel)) || t("public.honour")}
          </p>
          <NamePlate plateId={design.namePlateId} className="mt-2">
            <p
              className="text-[clamp(0.9375rem,4.6cqi,1.125rem)] leading-snug text-balance"
              style={{ fontFamily: "var(--inv-font-display)" }}
            >
              {guestName || t("public.honourGeneric")}
            </p>
          </NamePlate>

          <p className={cn(gold, "mt-4 text-[0.9375rem] leading-relaxed")}>
            <span className="block">{formatDate(event.date, locale, "full")}</span>
            <span className="mt-0.5 block">{formatTime(event.date, locale)}</span>
          </p>

          {/* The capsule is the affordance: a bare chevron on a photograph reads
              as decoration, and people stop at the cover. */}
          <p className="mt-8 inline-flex items-center gap-2 rounded-full bg-black/25 px-5 py-2.5 text-white/95 backdrop-blur-sm">
            <PointerIcon className="size-5 motion-safe:animate-bounce" aria-hidden="true" />
            <span className="text-sm leading-tight">
              <span className="block">{t("public.scrollDown")}</span>
              {locale === "km" ? (
                <span className="block text-xs text-white/75">Scroll down</span>
              ) : null}
            </span>
          </p>
        </div>
      </header>

      {/* ------------------------------------------------------------- body */}
      {/* A thin veil, not a sheet. It exists to hold text contrast over a photo
          backdrop; over the ivory damask the two grounds are near-identical, so
          anything heavier simply hides the pattern the couple chose. */}
      {/*
       * The card body opens as one piece.
       *
       * This template sets its sections as siblings in a single flow rather
       * than in a wrapper each, so there is nothing to animate one at a time.
       * Opening the whole body honours the entrance the couple chose — better
       * than the setting doing nothing here, as it did before — and suits a
       * card read as one continuous scroll anyway.
       */}
      <Reveal
        entrance={motionEnabled ? entrance : "none"}
        className="relative bg-(--inv-bg)/30"
      >
        {/* The tiled ground the whole card sits on. Held at a low opacity: it
            has to be legible as ornament without competing with gold text. */}
        {orn.pattern !== "none" ? (
          <PatternBackground
            pattern={orn.pattern}
            className="text-(--inv-gold)"
            scale={1.15}
            opacity={orn.patternOpacity + 0.06}
          />
        ) : null}

        <div className="relative px-6 py-12">
          {/* ------------------------------------------------------ couple */}
          <div className="flex items-start justify-center gap-3">
            {[groom, bride].filter(Boolean).map((host, i) => (
              <div key={host!.id} className="contents">
                {i > 0 ? <GoldHeart className="mt-8 shrink-0" /> : null}
                <div className="min-w-0 flex-1 text-center">
                  <p className="text-sm text-(--inv-muted)">{L(host!.role)}</p>
                  <p className={cn(DISPLAY, "mt-1.5 text-xl leading-snug text-balance")}>
                    {L(host!.name)}
                  </p>
                  {host!.parents ? (
                    <p className="mt-1.5 text-xs leading-relaxed text-(--inv-muted)">
                      {L(host!.parents)}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {/* ---------------------------------------------------- the letter */}
          <span id="inv-letter" data-inv-section="letter" className="block scroll-mt-4" />
          <h2 className={cn(HEADING, "mt-10")}>
            {L(design.greeting) || t("public.withBlessing")}
          </h2>
          <p className="mt-5 text-center text-[0.9375rem] leading-loose text-(--inv-fg)">
            {L(design.message)}
          </p>
          <GoldFlourish className="mt-8" />

          {/* ------------------------------------------------------ counting */}
          <span id="inv-countdown" data-inv-section="countdown" className="block scroll-mt-4" />
          <h2 className={cn(HEADING, "mt-12")}>{t("public.countdownTitle")}</h2>
          <p className="mt-4 text-center text-sm leading-relaxed text-(--inv-fg)">
            <span className="block">{formatDate(event.date, locale, "full")}</span>
            <span className="block">{formatTime(event.date, locale)}</span>
          </p>
          <div className="mt-6">
            <InvitationCountdown variant="row" date={event.date} />
          </div>
          <p className="mt-8 text-center">
            <AddToCalendar event={event} variant="plaque" />
          </p>

          {/* ------------------------------------------------------ schedule */}
          {design.showSchedule && event.schedule.length > 0 ? (
            <>
              <span id="inv-schedule" data-inv-section="schedule" className="block scroll-mt-4" />
          <h2 className={cn(HEADING, "mt-14")}>{t("public.scheduleTitle")}</h2>
              <div className="mt-6">
                <InvitationSchedule items={event.schedule} variant="sompeah" />
              </div>
              <GoldFlourish className="mt-8" />
            </>
          ) : null}

          {/* --------------------------------------------------------- venue */}
          <span id="inv-venue" data-inv-section="venue" className="block scroll-mt-4" />
          <h2 className={cn(HEADING, "mt-12")}>{t("public.venueTitle")}</h2>
          <p className="mt-4 text-center text-[0.9375rem] leading-relaxed text-(--inv-fg)">
            {L(event.venue.name)}
          </p>
          <p className="mt-1 text-center text-sm leading-relaxed text-(--inv-muted)">
            {L(event.venue.address)}
          </p>
          {/* A drawn map beats an embedded one here: Cambodian venues are found
              by landmark, and the family's own sketch is what guests are used
              to reading. */}
          {design.showMap && design.venueMapImage ? (
            <div className="mt-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                {...imageSrcSet(design.venueMapImage, { sizes: "100vw", crop: "fit" })}
                alt={`${t("public.venueTitle")}: ${L(event.venue.name)}`}
                className="w-full rounded-lg border border-(--inv-border)"
                loading="lazy"
              />
            </div>
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
                  <span className={cn(PLAQUE_LABEL)}>{t("public.getDirections")}</span>
                </GoldPlaque>
              </a>
            </p>
          ) : null}

          {/* ------------------------------------------------------- gallery */}
          {design.showGallery && design.gallery.length > 0 ? (
            <>
              <span id="inv-gallery" data-inv-section="gallery" className="block scroll-mt-4" />
          <h2 className={cn(HEADING, "mt-14")}>{t("inv.gallery")}</h2>
              <div className="mt-6">
                <GalleryStrip photos={design.gallery} />
              </div>
              <GoldFlourish className="mt-8" />
            </>
          ) : null}

          {/* ----------------------------------------------------- thank you */}
          {design.thankYouNote && L(design.thankYouNote) ? (
            <>
              <span id="inv-thanks" data-inv-section="thanks" className="block scroll-mt-4" />
              <h2 className={cn(HEADING, "mt-12")}>
                {(design.thankYouTitle && L(design.thankYouTitle)) ||
                  t("public.thankYouTitle")}
              </h2>
              <p className="mt-5 text-center text-[0.9375rem] leading-loose text-(--inv-fg)">
                {L(design.thankYouNote)}
              </p>
            </>
          ) : null}

          {/* ---------------------------------------------------------- gift */}
          {design.showGiftInfo ? (
            <>
              <span id="inv-gift" data-inv-section="gift" className="block scroll-mt-4" />
          <h2 className={cn(HEADING, "mt-14")}>{t("public.giftTitle")}</h2>
              <div className="mt-5">
                <GiftNote note={design.giftNote} />
              </div>
              <div className="mt-6">
                <GiftQr usd={design.giftQrUsd} khr={design.giftQrKhr} />
              </div>
              <GoldFlourish className="mt-8" />
            </>
          ) : null}

          {/* ---------------------------------------------------------- rsvp */}
          {design.showRsvp ? (
            <div id="rsvp">
              <span id="inv-rsvp" data-inv-section="rsvp" className="block scroll-mt-4" />
          <h2 className={cn(HEADING, "mt-12")}>{t("public.rsvpTitle")}</h2>
              <div className="mt-6">
                <InvitationRsvpForm event={event} guestName={guestName} />
              </div>
            </div>
          ) : null}

          {/* -------------------------------------------------------- wishes */}
          {design.showWishes ? (
            <>
              <span id="inv-wishes" data-inv-section="wishes" className="block scroll-mt-4" />
          <h2 className={cn(HEADING, "mt-14")}>{t("public.wishesTitle")}</h2>
              <div className="mt-6">
                <InvitationWishes />
              </div>
            </>
          ) : null}

          {/* ------------------------------------------------------ contacts */}
          {event.contacts.length > 0 ? (
            <>
              <span id="inv-contacts" data-inv-section="contacts" className="block scroll-mt-4" />
          <h2 className={cn(HEADING, "mt-14")}>{t("public.contactHosts")}</h2>
              <div className="mt-6">
                <ContactList contacts={event.contacts} />
              </div>
            </>
          ) : null}

          {/* -------------------------------------------------------- footer */}
          <footer className="mt-16 text-center">
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
          <GoldFlourish />
            <p className={cn(DISPLAY, "mt-5 text-lg")}>
              {event.hosts.map((h) => L(h.name)).join(locale === "km" ? " និង " : " & ")}
            </p>
            <p className="mt-4 text-xs text-(--inv-muted)/70">Made with Theabka</p>
          </footer>
        </div>
      </Reveal>
    </article>
  )
}

/* --------------------------------------------------------------- shorthands */

/**
 * Gold type on a photograph needs a dark shadow, not a lighter weight. The
 * photo underneath is the couple's own and may be pale or dark in the same
 * frame, so the contrast has to come from the type rather than the scrim.
 */
const GOLD_ON_PHOTO =
  "text-(--inv-gold) [font-family:var(--inv-font-display)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.75)]"

const DISPLAY = "text-(--inv-accent) [font-family:var(--inv-font-display)]"

const DISPLAY_GOLD = "text-(--inv-gold) [font-family:var(--inv-font-display)]"

const HEADING =
  "text-center text-[clamp(1.0625rem,5cqi,1.25rem)] leading-relaxed text-(--inv-accent) [font-family:var(--inv-font-display)]"

const PLAQUE_LABEL =
  "text-sm leading-tight text-(--inv-accent-contrast) [font-family:var(--inv-font-display)] drop-shadow-[0_1px_2px_rgba(90,60,10,0.55)]"

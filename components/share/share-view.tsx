"use client"

import * as React from "react"
import { Check, Copy, ImageDown, Link2, Mail, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui/button-link"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/page-header"
import { Panel } from "@/components/shared/panel"
import { guestInviteUrl } from "@/lib/guests"
import { useAllGuests, useEventData } from "@/components/providers/data-provider"
import { useLocale } from "@/components/providers/locale-provider"
import { DraftNotice } from "@/components/invitation/publish-controls"
import { invitationTheme } from "@/lib/invitation/theme"
import { QrCode } from "./qr-code"
import { exportInsertCard } from "@/lib/qr-poster"
import { SendInvitations } from "./send-invitations"
import { MascotMotion } from "@/components/brand/mascot"
import { formatDate, formatNumber, formatTime } from "@/lib/format"
import { downloadCsv, toCsv } from "@/lib/csv"
import { toast } from "sonner"

export function ShareView({ eventId }: { eventId: string }) {
  const { event } = useEventData(eventId)
  // Loads every row on purpose — one invitation link is printed per guest.
  const { guests } = useAllGuests(event?.id)
  const { t, L, locale } = useLocale()

  const [copied, setCopied] = React.useState<string | null>(null)
  /*
   * Who the printed sheet is for.
   *
   * Empty means "the event's own card" — a single generic insert — which is
   * what the couple wants before the guest list exists and what they reach for
   * when they just need one QR on a table.
   */
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  /** Same reasoning as the camera poster: composing the card takes a moment. */
  const [buildingCard, setBuildingCard] = React.useState(false)

  // window is not available during SSR, so the origin is read as an external
  // value: the server renders the relative path and the client fills in the
  // real origin on first paint.
  const origin = React.useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => ""
  )

  if (!event) return null

  const path = `/i/${event.slug}`
  const url = `${origin}${path}`
  // The couple's own palette and type, so the card that goes in the envelope
  // reads as the same object as the invitation itself rather than a generic
  // export tacked on beside it.
  const theme = invitationTheme(event.design, locale)

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      toast.success(t("action.copied"))
      setTimeout(() => setCopied(null), 2000)
    } catch {
      toast.error("Could not copy. Please copy the link manually.")
    }
  }

  function exportPersonalLinks() {
    if (!event) return
    const csv = toCsv(
      [
        t("guests.field.name"),
        t("guests.field.nameKm"),
        t("guests.field.phone"),
        t("share.personalLinks"),
      ],
      guests.map((guest) => [guest.name, guest.nameKm, guest.phone, guestInviteUrl(event.slug, guest.token, origin)])
    )
    downloadCsv(`${event.slug}-invitation-links.csv`, csv)
    toast.success(`${formatNumber(guests.length, locale)} ${t("guests.count").toLowerCase()}`)
  }

  const shareText = `${L(event.title)} - ${formatDate(event.date, locale, "long")}`
  const telegramHref = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`
  const mailHref = `mailto:?subject=${encodeURIComponent(L(event.title))}&body=${encodeURIComponent(`${shareText}\n\n${url}`)}`

  return (
    <div className="space-y-5">
      <div data-print="hide">
        <PageHeader title={t("share.title")} description={t("share.subtitle")} />
      </div>

      {/* Everything below hands out a link or a QR for it. If the invitation is
          still a draft that link answers 404, and the couple finds out after
          the QR is printed on the card — so the warning goes above all of it,
          with the publish button in reach. */}
      <DraftNotice event={event} />

      <div className="grid gap-4">
        <div className="space-y-4 lg:space-y-5">
          <div data-print="hide">
          <Panel title={t("share.link")}>
            <div className="flex gap-2">
              <Input
                readOnly
                value={url || path}
                aria-label={t("share.link")}
                onFocus={(e) => e.currentTarget.select()}
                className="font-mono text-[0.8125rem]"
              />
              <Button onClick={() => copy(url, "link")} className="shrink-0">
                {copied === "link" ? <Check /> : <Copy />}
                <span className="hidden sm:inline">
                  {copied === "link" ? t("action.copied") : t("action.copy")}
                </span>
              </Button>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <ButtonLink href={telegramHref} target="_blank" variant="outline">
                <Send />
                Telegram
              </ButtonLink>
              <ButtonLink href={mailHref} variant="outline">
                <Mail />
                {t("share.email")}
              </ButtonLink>
              <ButtonLink href={path} target="_blank" variant="outline">
                <Link2 />
                {t("action.preview")}
              </ButtonLink>
            </div>
          </Panel>
          </div>

          {/* Printed insert card mock — what actually goes inside the envelope. */}
          <Panel title={t("share.insertCard")}>
            <p data-print="hide" className="mb-4 text-sm text-muted-foreground">
              {t("share.insertCardHelp")}
            </p>
            {/* Styled with the invitation's own theme, so this preview shows
                what the export will actually look like rather than a generic
                stand-in for it. */}
            <div
              style={{ ...theme, background: "var(--inv-surface)", border: "1px solid var(--inv-border)" }}
              className="mx-auto flex max-w-sm items-center gap-4 rounded-[var(--card-radius)] p-5"
            >
              <div
                className="w-24 shrink-0 rounded-md p-2"
                style={{ background: "var(--inv-bg)", border: "1px solid var(--inv-gold)" }}
              >
                <QrCode
                  id="insert-card-qr"
                  value={url || path}
                  foreground="var(--inv-fg)"
                  background="var(--inv-bg)"
                  centerMark={false}
                />
              </div>
              <div className="min-w-0">
                <p
                  className="text-[0.6875rem] font-medium tracking-[0.14em] uppercase"
                  style={{ color: "var(--inv-accent)" }}
                >
                  {t("public.rsvpTitle")}
                </p>
                <p
                  className="mt-1.5 truncate text-base"
                  style={{ color: "var(--inv-fg)", fontFamily: "var(--inv-font-display)" }}
                >
                  {L(event.title)}
                </p>
                <p className="mt-1 text-xs" style={{ color: "var(--inv-muted)" }}>
                  {formatDate(event.date, locale, "long")} · {formatTime(event.date, locale)}
                </p>
                <p className="mt-2 text-xs font-medium" style={{ color: "var(--inv-accent)" }}>
                  {t("share.scanToReply")}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={buildingCard}
                onClick={() => {
                  setBuildingCard(true)
                  void exportInsertCard({
                    qrElementId: "insert-card-qr",
                    filename: `${event.slug}-insert-card.png`,
                    theme,
                    copy: {
                      eyebrow: t("public.rsvpTitle"),
                      title: L(event.title),
                      subtitle: `${formatDate(event.date, locale, "long")} · ${formatTime(event.date, locale)}`,
                      caption: t("share.scanToReply"),
                    },
                  })
                    .then((ok) =>
                      toast[ok ? "success" : "error"](
                        ok ? t("share.exported") : t("share.exportFailed")
                      )
                    )
                    .finally(() => setBuildingCard(false))
                }}
              >
                <ImageDown />
                {t("share.exportPng")}
              </Button>

              {buildingCard ? (
                <div className="flex items-center gap-2.5" role="status" aria-live="polite">
                  <MascotMotion motion="pushing" size={40} />
                  <span className="text-sm text-muted-foreground">{t("share.building")}</span>
                </div>
              ) : null}
            </div>
          </Panel>

          <SendInvitations
            event={event}
            guests={guests}
            origin={origin}
            shareText={shareText}
            selected={selected}
            onSelectedChange={setSelected}
            onExport={exportPersonalLinks}
          />
        </div>
      </div>
    </div>
  )
}

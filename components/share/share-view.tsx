"use client"

import * as React from "react"
import { Check, Copy, Download, Link2, Mail, QrCode as QrIcon, Send, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui/button-link"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/shared/page-header"
import { Panel } from "@/components/shared/panel"
import { useEventData } from "@/components/providers/data-provider"
import { useLocale } from "@/components/providers/locale-provider"
import { QrCode, downloadQrSvg } from "./qr-code"
import { formatDate, formatNumber, formatTime } from "@/lib/format"
import { toast } from "sonner"

export function ShareView({ eventId }: { eventId: string }) {
  const { event, guests } = useEventData(eventId)
  const { t, L, locale } = useLocale()

  const [copied, setCopied] = React.useState<string | null>(null)

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

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      toast.success(t("action.copied"))
      setTimeout(() => setCopied(null), 2000)
    } catch {
      toast.error("Could not copy — please copy the link manually")
    }
  }

  const shareText = `${L(event.title)} — ${formatDate(event.date, locale, "long")}`
  const telegramHref = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`
  const mailHref = `mailto:?subject=${encodeURIComponent(L(event.title))}&body=${encodeURIComponent(`${shareText}\n\n${url}`)}`

  return (
    <div className="space-y-5">
      <div data-print="hide">
        <PageHeader title={t("share.title")} description={t("share.subtitle")} />
      </div>

      <div className="grid gap-4 lg:grid-cols-5 lg:gap-5">
        {/* QR is the headline: it is what goes on the printed card. */}
        <section
          data-print="hide"
          className="rounded-[var(--card-radius)] border border-[var(--card-border-color)] bg-card p-6 shadow-(--shadow-card) lg:col-span-2"
        >
          <h2 className="display text-base">{t("share.qr")}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t("share.qrHelp")}</p>

          <div className="mx-auto mt-6 max-w-[15rem] rounded-[var(--card-radius)] bg-white p-5 ring-1 ring-border">
            <QrCode
              id="event-qr"
              value={url || path}
              foreground="#1c1917"
              background="#ffffff"
            />
          </div>

          <div className="mt-5 flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={() => downloadQrSvg("event-qr", `${event.slug}-qr.svg`)}
            >
              <Download />
              {t("share.downloadQr")}
            </Button>
            <Button variant="ghost" onClick={() => window.print()}>
              {t("share.printCard")}
            </Button>
          </div>
        </section>

        <div className="space-y-4 lg:col-span-3 lg:space-y-5">
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
            <div
              data-print="card"
              className="mx-auto flex max-w-sm items-center gap-4 rounded-[var(--card-radius)] border border-border bg-background p-5"
            >
              <div className="w-24 shrink-0 rounded-md bg-white p-2 ring-1 ring-border">
                <QrCode value={url || path} foreground="#1c1917" background="#ffffff" centerMark={false} />
              </div>
              <div className="min-w-0">
                <p className="eyebrow text-muted-foreground">{t("public.rsvpTitle")}</p>
                <p className="display mt-1.5 truncate text-base">{L(event.title)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(event.date, locale, "long")} · {formatTime(event.date, locale)}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">{t("share.scanToReply")}</p>
              </div>
            </div>
          </Panel>

          <Panel
            className="print:hidden"
            title={t("share.personalLinks")}
            action={
              <span className="text-xs text-muted-foreground">
                {formatNumber(guests.length, locale)} {t("guests.count").toLowerCase()}
              </span>
            }
          >
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              {t("share.personalLinksHelp")}
            </p>

            {guests.length === 0 ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="size-4" aria-hidden="true" />
                Add guests first and their personal links appear here.
              </p>
            ) : (
              <ul className="divide-y divide-border/60">
                {guests.slice(0, 6).map((guest) => {
                  const personal = `${url}?g=${guest.id}`
                  return (
                    <li key={guest.id} className="flex items-center gap-3 py-2.5">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{guest.name}</span>
                        <span className="block truncate font-mono text-xs text-muted-foreground">
                          {personal}
                        </span>
                      </span>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label={`${t("action.copy")} — ${guest.name}`}
                        onClick={() => copy(personal, guest.id)}
                      >
                        {copied === guest.id ? <Check /> : <Copy />}
                      </Button>
                    </li>
                  )
                })}
              </ul>
            )}

            {guests.length > 6 ? (
              <div className="mt-3 flex items-center gap-2">
                <ButtonLink href={`/events/${event.id}/guests`} variant="outline" size="sm">
                  {t("action.viewAll")}
                </ButtonLink>
                <Button variant="ghost" size="sm">
                  <QrIcon />
                  {t("action.export")} CSV
                </Button>
              </div>
            ) : null}
          </Panel>
        </div>
      </div>
    </div>
  )
}

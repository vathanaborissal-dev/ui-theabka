"use client"

import * as React from "react"
import {
  Check,
  CircleCheck,
  Copy,
  Download,
  ExternalLink,
  MessageSquare,
  Search,
  Send,
  Users,
  UsersRound,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui/button-link"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Panel } from "@/components/shared/panel"
import { useLocale } from "@/components/providers/locale-provider"
import { guestInviteUrl } from "@/lib/guests"
import { formatNumber } from "@/lib/format"
import {
  invitationMessage,
  normalizeTelegramGroupLink,
  smsLink,
  telegramChatLink,
  telegramNewGroupLink,
  telegramShareLink,
  toInternational,
} from "@/lib/telegram"
import { cn } from "@/lib/utils"
import type { Guest, InvitationEvent } from "@/lib/types"

type QueueKind = "invitation" | "group"

type SendQueue = {
  guestIds: string[]
  kind: QueueKind
  groupLink?: string
}

/**
 * Handing every guest their own invitation.
 *
 * The list used to stop at six with a link to the guest page, which is fine as
 * a summary and useless as the place the sending actually happens — this is
 * that place: everyone, searchable, selectable, one row per invitation.
 */
export function SendInvitations({
  event,
  guests,
  origin,
  shareText,
  onExport,
  selected,
  onSelectedChange,
}: {
  event: InvitationEvent
  guests: Guest[]
  origin: string
  shareText: string
  /** Every guest's link as a spreadsheet, for a mail merge or a printer. */
  onExport: () => void
  selected: Set<string>
  onSelectedChange: (next: Set<string>) => void
}) {
  const { t, L, locale } = useLocale()
  const [query, setQuery] = React.useState("")
  const [copiedId, setCopiedId] = React.useState<string | null>(null)
  /*
   * Working through a selection, one guest at a time.
   *
   * Opening twelve Telegram tabs at once is not sending twelve invitations —
   * the browser blocks all but the first, and the couple loses track of who
   * actually received one. So the batch is a queue: the current guest, one
   * press, then the next.
   */
  const [queue, setQueue] = React.useState<SendQueue | null>(null)
  const [queueAt, setQueueAt] = React.useState(0)
  const [openedGuestId, setOpenedGuestId] = React.useState<string | null>(null)
  const [groupLinkInput, setGroupLinkInput] = React.useState("")

  const needle = query.trim().toLowerCase()
  const digits = needle.replace(/\D/g, "")
  const matches = needle
    ? guests.filter(
        (guest) =>
          guest.name.toLowerCase().includes(needle) ||
          (guest.nameKm ?? "").includes(query.trim()) ||
          (guest.family ?? "").toLowerCase().includes(needle) ||
          (digits.length >= 3 && (guest.phone ?? "").replace(/\D/g, "").includes(digits))
      )
    : guests

  const withPhone = matches.filter((guest) => toInternational(guest.phone))
  const allShown = matches.length > 0 && matches.every((guest) => selected.has(guest.id))

  function toggle(id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onSelectedChange(next)
  }

  function personalUrl(guest: Guest) {
    return guestInviteUrl(event.slug, guest.token, origin)
  }

  function invitationIntroFor(guest: Guest) {
    return invitationMessage({
      greeting: `${t("public.honour")} ${L({ en: guest.name, km: guest.nameKm || guest.name })}`,
      title: L(event.title),
      when: shareText,
    })
  }

  function messageFor(guest: Guest) {
    return `${invitationIntroFor(guest)}\n\n${personalUrl(guest)}`
  }

  function groupMessageFor(guest: Guest, groupLink: string, includeGroupLink = true) {
    return [
      `${t("public.honour")} ${L({ en: guest.name, km: guest.nameKm || guest.name })}`,
      t("share.groupMessage"),
      includeGroupLink ? groupLink : null,
      `${t("share.groupPersonalInvite")}\n${personalUrl(guest)}`,
    ]
      .filter(Boolean)
      .join("\n\n")
  }

  async function copyText(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(key)
      setTimeout(() => setCopiedId(null), 2000)
      return true
    } catch {
      toast.error(t("share.copyFailed"))
      return false
    }
  }

  /**
   * Opens the exact guest by phone when one is available. Guests without a
   * number use Telegram's share picker. Telegram does not report phone-privacy
   * failures back to the website, so the queue also keeps a copy action nearby.
   */
  function sendOne(guest: Guest, kind: QueueKind = "invitation", groupLink?: string) {
    const sharedUrl = kind === "group" && groupLink ? groupLink : personalUrl(guest)
    const directMessage = kind === "group" && groupLink
      ? groupMessageFor(guest, groupLink)
      : messageFor(guest)
    const pickerText = kind === "group" && groupLink
      ? groupMessageFor(guest, groupLink, false)
      : invitationIntroFor(guest)
    const href = telegramChatLink(guest.phone, directMessage)
      ?? telegramShareLink(sharedUrl, pickerText)

    window.open(href, "_blank", "noopener")
  }

  const chosen = guests.filter((guest) => selected.has(guest.id))
  const queued = queue
    ? queue.guestIds
        .map((id) => guests.find((guest) => guest.id === id))
        .filter((guest): guest is Guest => Boolean(guest))
    : []
  const current = queue && queueAt < queued.length ? queued[queueAt] : null
  const normalizedGroupLink = normalizeTelegramGroupLink(groupLinkInput)
  const groupLinkInvalid = groupLinkInput.trim().length > 0 && !normalizedGroupLink

  function advance() {
    if (!queue) return
    if (queueAt + 1 >= queued.length) {
      setQueue(null)
      setQueueAt(0)
      setOpenedGuestId(null)
      toast.success(t("share.queueDone"))
      return
    }
    setQueueAt(queueAt + 1)
    setOpenedGuestId(null)
  }

  function startQueue(kind: QueueKind, groupLink?: string) {
    setQueue({ guestIds: chosen.map((guest) => guest.id), kind, groupLink })
    setQueueAt(0)
    setOpenedGuestId(null)
  }

  return (
    <Panel
      title={t("share.sendTitle")}
      action={
        <span className="text-muted-foreground text-xs">
          {formatNumber(guests.length, locale)} {t("guests.count").toLowerCase()}
        </span>
      }
    >
      <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
        {t("share.sendHelp")}
      </p>

      {guests.length === 0 ? (
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <Users className="size-4" aria-hidden="true" />
          {t("share.noGuests")}
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-48 flex-1">
              <Search
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("share.searchGuests")}
                aria-label={t("share.searchGuests")}
                className="pl-8"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onSelectedChange(
                  allShown
                    ? new Set([...selected].filter((id) => !matches.some((g) => g.id === id)))
                    : new Set([...selected, ...matches.map((g) => g.id)])
                )
              }
            >
              {allShown ? t("share.selectNone") : t("share.selectAll")}
            </Button>
          </div>

          <ul className="divide-border/60 mt-3 divide-y">
            {matches.map((guest) => {
              const personal = personalUrl(guest)
              const number = toInternational(guest.phone)
              return (
                <li
                  key={guest.id}
                  className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 py-3 sm:grid-cols-[auto_minmax(0,1fr)_auto]"
                >
                  <Checkbox
                    checked={selected.has(guest.id)}
                    onCheckedChange={() => toggle(guest.id)}
                    aria-label={guest.name}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{guest.name}</span>
                    <span
                      className={cn(
                        "block truncate font-mono text-xs",
                        number ? "text-muted-foreground" : "text-muted-foreground/60 italic"
                      )}
                    >
                      {guest.phone || t("share.noPhone")}
                    </span>
                  </span>
                  <span className="col-start-2 flex items-center gap-1 sm:col-start-3 sm:row-start-1">
                    <Button
                      size="sm"
                      variant="outline"
                      title={number ? `+${number}` : t("share.noPhoneHint")}
                      onClick={() => sendOne(guest)}
                    >
                      <Send className="size-3.5" aria-hidden="true" />
                      Telegram
                    </Button>
                    {/* SMS keeps its own fallback because it can address a
                        number and carry a prepared body in the same link. */}
                    {number ? (
                      <ButtonLink
                        href={smsLink(guest.phone, messageFor(guest)) ?? "#"}
                        size="icon-sm"
                        variant="ghost"
                        aria-label={`${t("share.sms")} - ${guest.name}`}
                        title={`${t("share.sms")} - +${number}`}
                      >
                        <MessageSquare />
                      </ButtonLink>
                    ) : null}
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label={`${t("share.copyGuestLink")} - ${guest.name}`}
                      title={t("share.copyGuestLink")}
                      onClick={() => void copyText(personal, guest.id)}
                    >
                      {copiedId === guest.id ? <Check /> : <Copy />}
                    </Button>
                  </span>
                </li>
              )
            })}
          </ul>

          {/* What can be done to a selection at once. Telegram cannot be sent
              in bulk from a browser at all, so the honest batch actions are the
              ones that prepare the sending rather than perform it. */}
          {current && queue ? (
            <div className="bg-muted/40 mt-4 space-y-3 rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground font-mono text-xs tabular-nums">
                  {queueAt + 1} / {queued.length}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{current.name}</span>
                  <span className="text-muted-foreground block truncate font-mono text-xs">
                    {current.phone || t("share.noPhone")}
                  </span>
                </span>
                <span className="text-muted-foreground hidden text-xs sm:inline">
                  {queue.kind === "group" ? t("share.groupQueueLabel") : t("share.invitationQueueLabel")}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {openedGuestId === current.id ? (
                  <>
                    <Button size="sm" onClick={advance}>
                      <CircleCheck className="size-3.5" aria-hidden="true" />
                      {t("share.sentNext")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sendOne(current, queue.kind, queue.groupLink)}
                    >
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                      {t("share.openAgain")}
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      sendOne(current, queue.kind, queue.groupLink)
                      setOpenedGuestId(current.id)
                    }}
                  >
                    <Send className="size-3.5" aria-hidden="true" />
                    {t("share.openTelegram")}
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={advance}>
                  {t("share.skip")}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const text = queue.kind === "group" && queue.groupLink
                      ? groupMessageFor(current, queue.groupLink)
                      : messageFor(current)
                    void copyText(text, "queue").then(
                      (ok) => ok && toast.success(t("share.messageCopied"))
                    )
                  }}
                >
                  <Copy className="size-3.5" aria-hidden="true" />
                  {t("share.copyMessage")}
                </Button>
                <span className="flex-1" />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setQueue(null)
                    setQueueAt(0)
                    setOpenedGuestId(null)
                  }}
                >
                  {t("share.stop")}
                </Button>
              </div>
            </div>
          ) : chosen.length > 0 ? (
            <div className="bg-muted/40 mt-4 flex flex-wrap items-center gap-2 rounded-lg border p-3">
              <span className="text-sm font-medium">
                {t("share.chosen").replace("%s", formatNumber(chosen.length, locale))}
              </span>
              <span className="flex-1" />
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  void copyText(chosen.map(messageFor).join("\n\n-----\n\n"), "batch").then(
                    (ok) => ok && toast.success(t("share.messagesCopied"))
                  )
                }
              >
                <Copy className="size-3.5" aria-hidden="true" />
                {t("share.copyMessages")}
              </Button>
              <Button
                size="sm"
                onClick={() => startQueue("invitation")}
              >
                <Send className="size-3.5" aria-hidden="true" />
                {t("share.sendToSelected").replace("%s", formatNumber(chosen.length, locale))}
              </Button>
              <Button size="sm" variant="ghost" onClick={onExport}>
                <Download className="size-3.5" aria-hidden="true" />
                CSV
              </Button>
            </div>
          ) : null}

          <p className="text-muted-foreground mt-3 text-xs">
            {t("share.telegramNote").replace("%s", formatNumber(withPhone.length, locale))}
          </p>

          <section className="border-border mt-5 border-t pt-5" aria-labelledby="telegram-group-title">
            <div className="flex items-start gap-3">
              <span className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-lg">
                <UsersRound className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h3 id="telegram-group-title" className="text-sm font-semibold">
                  {t("share.groupTitle")}
                </h3>
                <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
                  {t("share.groupHelp")}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-end">
              <Button
                nativeButton={false}
                variant="outline"
                render={<a href={telegramNewGroupLink()} />}
              >
                <UsersRound aria-hidden="true" />
                {t("share.createGroup")}
                <ExternalLink aria-hidden="true" />
              </Button>

              <div className="space-y-1.5">
                <Label htmlFor="telegram-group-link">{t("share.groupLinkLabel")}</Label>
                <Input
                  id="telegram-group-link"
                  type="url"
                  inputMode="url"
                  value={groupLinkInput}
                  onChange={(event) => setGroupLinkInput(event.target.value)}
                  placeholder="https://t.me/+..."
                  aria-invalid={groupLinkInvalid || undefined}
                  aria-describedby="telegram-group-link-help"
                />
                <p
                  id="telegram-group-link-help"
                  className={cn(
                    "text-xs",
                    groupLinkInvalid ? "text-destructive" : "text-muted-foreground"
                  )}
                >
                  {groupLinkInvalid ? t("share.groupLinkInvalid") : t("share.groupLinkHelp")}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                disabled={!normalizedGroupLink || chosen.length === 0 || Boolean(current)}
                onClick={() => {
                  if (normalizedGroupLink) startQueue("group", normalizedGroupLink)
                }}
              >
                <Send className="size-3.5" aria-hidden="true" />
                {t("share.sendGroupToSelected").replace("%s", formatNumber(chosen.length, locale))}
              </Button>
              {chosen.length === 0 ? (
                <span className="text-muted-foreground text-xs">{t("share.groupSelectGuests")}</span>
              ) : null}
            </div>

            <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
              {t("share.groupPrivacy")}
            </p>
          </section>
        </>
      )}
    </Panel>
  )
}

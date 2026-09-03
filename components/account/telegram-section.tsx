"use client"

import * as React from "react"
import {Check, ExternalLink, Send, Unlink} from "lucide-react"
import { BrandSpinner } from "@/components/brand/brand-spinner"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { ButtonLink } from "@/components/ui/button-link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useLocale } from "@/components/providers/locale-provider"
import { formatDate } from "@/lib/format"
import {
  createTelegramLink,
  disconnectTelegram,
  getTelegramStatus,
  type TelegramStatus,
} from "@/lib/telegram-bot"

/**
 * Connecting the account to the Telegram bot.
 *
 * The flow is one tap: the button asks the server for a single-use deep link
 * and opens it, Telegram takes over, and the bot binds the chat. There is
 * deliberately no code to copy — a code a person has to carry between two apps
 * is a code they will paste into the wrong one.
 */
/** How often to look while waiting for the tap in Telegram. */
const POLL_MS = 2000
/**
 * How long to keep looking. The connect code itself expires in ten minutes,
 * so watching beyond that would be watching for something that can no longer
 * happen.
 */
const WAIT_MS = 10 * 60 * 1000

export function TelegramSection() {
  const { locale } = useLocale()
  const [status, setStatus] = React.useState<TelegramStatus | null>(null)
  const [failed, setFailed] = React.useState(false)
  const [connecting, setConnecting] = React.useState(false)
  const [confirmOff, setConfirmOff] = React.useState(false)
  const [disconnecting, setDisconnecting] = React.useState(false)
  /** Set once the deep link is opened, and cleared the moment it lands. */
  const [waiting, setWaiting] = React.useState(false)
  const [lastLink, setLastLink] = React.useState<string | null>(null)

  const refresh = React.useCallback(async () => {
    try {
      setStatus(await getTelegramStatus())
    } catch {
      setFailed(true)
    }
  }, [])

  React.useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        const loaded = await getTelegramStatus()
        if (!cancelled) setStatus(loaded)
      } catch {
        if (!cancelled) setFailed(true)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [])

  /*
   * Watch for the connection instead of asking whether it happened.
   *
   * Connecting finishes in another app, so the page has no event to listen
   * for — the only honest options are to poll or to make the reader confirm
   * something the server already knows. Polling is the cheap one, and it only
   * runs in the window between opening the link and the bot binding the chat.
   */
  React.useEffect(() => {
    if (!waiting) return

    let cancelled = false
    const startedAt = Date.now()

    const timer = setInterval(async () => {
      if (Date.now() - startedAt > WAIT_MS) {
        if (!cancelled) setWaiting(false)
        return
      }
      try {
        const loaded = await getTelegramStatus()
        if (cancelled) return
        setStatus(loaded)
        if (loaded.connected) {
          setWaiting(false)
          toast.success("Telegram connected")
        }
      } catch {
        // A blip mid-wait is not worth surfacing; the next tick tries again.
      }
    }, POLL_MS)

    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [waiting])

  /*
   * Coming back to the tab is the strongest hint there is that something
   * happened elsewhere — connecting means leaving for Telegram and returning.
   * Checked once on return rather than left to the next poll tick, so the card
   * is already right by the time it is looked at.
   */
  const connected = status?.connected ?? false

  React.useEffect(() => {
    // Nothing left to watch for once it is connected, so no listener at all.
    if (connected) return

    function onVisible() {
      if (document.visibilityState === "visible") void refresh()
    }
    document.addEventListener("visibilitychange", onVisible)
    window.addEventListener("focus", onVisible)
    return () => {
      document.removeEventListener("visibilitychange", onVisible)
      window.removeEventListener("focus", onVisible)
    }
  }, [connected, refresh])

  async function connect() {
    setConnecting(true)
    try {
      const { url } = await createTelegramLink()
      setLastLink(url)
      /*
       * Opened rather than shown. On a phone this hands straight over to the
       * Telegram app; on a desktop it opens web Telegram, which then offers
       * the desktop client.
       */
      window.open(url, "_blank", "noopener,noreferrer")
      setWaiting(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create a connect link")
    } finally {
      setConnecting(false)
    }
  }

  async function disconnect() {
    setDisconnecting(true)
    try {
      await disconnectTelegram()
      setWaiting(false)
      await refresh()
      setConfirmOff(false)
      toast.success("Telegram disconnected")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not disconnect")
    } finally {
      setDisconnecting(false)
    }
  }

  if (failed) {
    return <p className="text-sm text-muted-foreground">Could not load your Telegram settings.</p>
  }

  if (!status) {
    return (
      <div className="flex min-h-16 items-center">
        <BrandSpinner className="text-muted-foreground" />
      </div>
    )
  }

  // Nothing to offer without a bot on the server, and a dead button would be
  // worse than an honest sentence.
  if (!status.configured) {
    return (
      <p className="text-sm text-muted-foreground">
        The Telegram bot is not set up on this server yet.
      </p>
    )
  }

  if (status.connected) {
    return (
      <>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success/12 text-success"
            >
              <Check className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {status.displayName || status.username || "Connected"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {status.username ? `@${status.username} · ` : ""}
                {status.connectedAt
                  ? `connected ${formatDate(status.connectedAt, locale, "medium")}`
                  : "connected"}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setConfirmOff(true)}>
            <Unlink />
            Disconnect
          </Button>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Send <span className="font-medium text-foreground">/help</span> in the chat to see
          everything the bot answers — head counts, who has not replied, guest lookup, envelope
          totals and your invitation link.
        </p>

        <Dialog open={confirmOff} onOpenChange={(open) => !open && setConfirmOff(false)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Disconnect Telegram?</DialogTitle>
              <DialogDescription>
                You will stop getting a message when a guest replies. Your events and guests are
                untouched, and you can reconnect any time.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmOff(false)} disabled={disconnecting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => void disconnect()} disabled={disconnecting}>
                {disconnecting ? <BrandSpinner /> : null}
                Disconnect
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-1.5 text-sm text-muted-foreground">
        <li>· A message the moment a guest replies, with their name and seats</li>
        <li>
          · <span className="font-medium text-foreground">/status</span> and{" "}
          <span className="font-medium text-foreground">/today</span> for head counts and arrivals
        </li>
        <li>
          · <span className="font-medium text-foreground">/pending</span> to see who still owes you
          a reply, <span className="font-medium text-foreground">/find</span> to look one up
        </li>
        <li>
          · <span className="font-medium text-foreground">/gifts</span> for envelope totals, and{" "}
          <span className="font-medium text-foreground">/link</span> to forward the invitation
        </li>
      </ul>

      {waiting ? (
        // No "I have connected" button: the server already knows, so asking
        // would be the page making its own job into a question.
        <div className="flex flex-wrap items-center gap-3 rounded-[var(--btn-radius)] border border-border bg-muted/40 px-3 py-2.5">
          <BrandSpinner className="shrink-0 text-primary" />
          <p className="min-w-0 flex-1 text-sm" aria-live="polite">
            Waiting for you to tap <span className="font-medium">Start</span> in Telegram…
          </p>
          {lastLink ? (
            <ButtonLink variant="outline" size="sm" href={lastLink} target="_blank">
              Open again
              <ExternalLink />
            </ButtonLink>
          ) : null}
          <Button variant="ghost" size="sm" onClick={() => setWaiting(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => void connect()} disabled={connecting}>
            {connecting ? <BrandSpinner /> : <Send />}
            Connect Telegram
          </Button>
          {status.botUsername ? (
            <ButtonLink
              variant="ghost"
              size="sm"
              href={`https://t.me/${status.botUsername}`}
              target="_blank"
            >
              @{status.botUsername}
              <ExternalLink />
            </ButtonLink>
          ) : null}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        The link works once and expires in ten minutes.
      </p>
    </div>
  )
}

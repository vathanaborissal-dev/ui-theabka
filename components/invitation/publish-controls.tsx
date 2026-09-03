"use client"

import * as React from "react"
import {Check, Copy, Send, Upload} from "lucide-react"
import { BrandSpinner } from "@/components/brand/brand-spinner"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useData } from "@/components/providers/data-provider"
import { useLocale } from "@/components/providers/locale-provider"
import { formatRelative } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { EventRecord } from "@/lib/types"

/**
 * Which of the four things is actually true right now.
 *
 * These are not the same as `status`. "Published" and "published, but the
 * couple has edited since" are one status and two completely different
 * situations — in the second, what the couple is looking at is not what their
 * guests can see, and that is the thing they most need to be told.
 */
export type PublishState = "never" | "hidden" | "live" | "pending"

export function publishStateOf(event: EventRecord): PublishState {
  if (event.status === "published") {
    return event.hasUnpublishedChanges ? "pending" : "live"
  }
  return event.publishedAt ? "hidden" : "never"
}

const TONE: Record<PublishState, string> = {
  never: "border-border bg-muted/60 text-muted-foreground",
  hidden: "border-border bg-muted/60 text-muted-foreground",
  live: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  pending: "border-amber-500/45 bg-amber-500/12 text-amber-700 dark:text-amber-400",
}

const LABEL: Record<PublishState, string> = {
  never: "publish.state.draft",
  hidden: "publish.state.hidden",
  live: "publish.state.live",
  pending: "publish.state.pending",
}

const HELP: Record<PublishState, string> = {
  never: "publish.state.draftHelp",
  hidden: "publish.state.hiddenHelp",
  live: "publish.state.liveHelp",
  pending: "publish.state.pendingHelp",
}

/** The badge. Small, always visible, and never says "published" on its own. */
export function PublishBadge({ event, className }: { event: EventRecord; className?: string }) {
  const { t } = useLocale()
  const state = publishStateOf(event)

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        TONE[state],
        className
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          state === "live" ? "bg-emerald-500" : state === "pending" ? "bg-amber-500" : "bg-muted-foreground/50"
        )}
        aria-hidden="true"
      />
      {t(LABEL[state] as Parameters<typeof t>[0])}
    </span>
  )
}

/**
 * Publish, unpublish, and hand over the link.
 *
 * Shared by the builder header and the share page rather than written twice.
 * The two screens disagreeing about whether an invitation is live is the one
 * failure that matters here: a couple prints a QR from one while the other
 * still calls it a draft, and the code on the printed card opens nothing.
 */
export function PublishControls({
  event,
  showState = false,
}: {
  event: EventRecord
  /** Renders the badge and the "last published" line above the buttons. */
  showState?: boolean
}) {
  const { publishEvent, unpublishEvent } = useData()
  const { t, locale } = useLocale()

  const [busy, setBusy] = React.useState<"publishing" | "unpublishing" | null>(null)
  const [copied, setCopied] = React.useState(false)
  const [confirmUnpublish, setConfirmUnpublish] = React.useState(false)

  const state = publishStateOf(event)
  const published = event.status === "published"

  async function publish() {
    setBusy("publishing")
    try {
      await publishEvent(event.id)
      toast.success(state === "pending" ? t("publish.changesPublished") : t("publish.liveNote"))
    } catch {
      toast.error("Could not publish the invitation. Please try again.")
    } finally {
      setBusy(null)
    }
  }

  async function unpublish() {
    setBusy("unpublishing")
    try {
      await unpublishEvent(event.id)
      setConfirmUnpublish(false)
      toast.success(t("publish.unpublished"))
    } catch {
      toast.error(t("publish.unpublishFailed"))
    } finally {
      setBusy(null)
    }
  }

  async function copyLink() {
    try {
      // Read at click time rather than held in state: the origin is wherever
      // this is being served from, it cannot change between render and click,
      // and keeping it out of state avoids a render that renders nothing new.
      await navigator.clipboard.writeText(`${window.location.origin}/i/${event.slug}`)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Could not copy — please copy the link manually")
    }
  }

  return (
    <>
      <div className={cn(showState && "space-y-2.5")}>
        {showState ? (
          <div className="space-y-1">
            <PublishBadge event={event} />
            <p className="text-xs leading-relaxed text-muted-foreground">
              {t(HELP[state] as Parameters<typeof t>[0])}
              {event.publishedAt ? (
                <>
                  {" "}
                  <span className="whitespace-nowrap">
                    {t("publish.lastPublished")} {formatRelative(event.publishedAt, locale)}.
                  </span>
                </>
              ) : null}
            </p>
          </div>
        ) : null}

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {/* The primary action is whatever is actually outstanding: publish it
              for the first time, push the pending edits, or turn it back on. */}
          {state === "pending" ? (
            <Button onClick={() => void publish()} disabled={busy !== null}>
              <span className="grid w-9 shrink-0 place-items-center" aria-hidden="true">
                {busy === "publishing" ? (
                  <BrandSpinner label="" motion="pushing" size={28} />
                ) : (
                  <Upload />
                )}
              </span>
              {t("publish.publishChanges")}
            </Button>
          ) : null}

          {!published ? (
            <Button onClick={() => void publish()} disabled={busy !== null}>
              <span className="grid w-9 shrink-0 place-items-center" aria-hidden="true">
                {busy === "publishing" ? (
                  <BrandSpinner label="" motion="pushing" size={28} />
                ) : (
                  <Send />
                )}
              </span>
              {t("action.publish")}
            </Button>
          ) : null}

          {published ? (
            <>
              <Button
                variant={state === "pending" ? "outline" : "default"}
                onClick={() => void copyLink()}
                disabled={busy !== null}
              >
                {copied ? <Check /> : <Copy />}
                {copied ? t("action.copied") : t("publish.copyLink")}
              </Button>
              <Button
                variant="ghost"
                disabled={busy !== null}
                onClick={() => setConfirmUnpublish(true)}
              >
                {t("publish.unpublish")}
              </Button>
            </>
          ) : null}
        </div>
      </div>

      {/* Confirmed, because it breaks links already in guests' hands — which is
          not something to discover from a single mis-tap. */}
      <Dialog open={confirmUnpublish} onOpenChange={setConfirmUnpublish}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("publish.confirmUnpublish")}</DialogTitle>
            <DialogDescription>{t("publish.confirmUnpublishBody")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setConfirmUnpublish(false)}
              disabled={busy === "unpublishing"}
            >
              {t("action.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => void unpublish()}
              disabled={busy === "unpublishing"}
            >
              {busy === "unpublishing" ? <BrandSpinner label="" size={24} /> : null}
              {t("publish.unpublish")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

/**
 * The warning shown wherever a draft's link or QR is on screen.
 *
 * Without it the share page happily hands over a QR for a URL that answers 404,
 * and the couple finds out after it is printed on the card. It also covers the
 * subtler case: a published invitation whose edits are not live yet, where the
 * link works but shows something older than what the couple is looking at.
 */
export function DraftNotice({ event }: { event: EventRecord }) {
  // Nothing to warn about only when the link is live *and* current.
  if (publishStateOf(event) === "live") return null

  return (
    <div
      data-print="hide"
      className="rounded-[var(--card-radius)] border border-amber-500/40 bg-amber-500/8 p-4"
    >
      <PublishControls event={event} showState />
    </div>
  )
}

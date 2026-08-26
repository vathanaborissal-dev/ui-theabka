"use client"

import * as React from "react"
import { Check, Share2 } from "lucide-react"
import { useLocale } from "@/components/providers/locale-provider"
import { cn } from "@/lib/utils"

/**
 * A persistent reply affordance for the guest.
 *
 * The card runs to six screens on a phone, and the RSVP sits near the bottom —
 * so a guest who skims never reaches the one thing the family needs from them.
 * This bar appears once the hero is behind you and steps aside as soon as the
 * RSVP section is actually on screen, so it never sits on top of the form it
 * points at.
 */
export function GuestActionBar({
  enabled,
  shareTitle,
}: {
  enabled: boolean
  shareTitle: string
}) {
  const { t } = useLocale()
  const [pastHero, setPastHero] = React.useState(false)
  const [rsvpInView, setRsvpInView] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  // Measured on scroll rather than with an IntersectionObserver: the RSVP
  // section is rendered by the template, which mounts after this bar, so an
  // observer attached once on mount would find nothing to watch.
  React.useEffect(() => {
    if (!enabled) return
    const onScroll = () => {
      const viewport = window.innerHeight
      setPastHero(window.scrollY > viewport * 0.9)
      const target = document.getElementById("rsvp")
      if (!target) {
        setRsvpInView(false)
        return
      }
      const box = target.getBoundingClientRect()
      setRsvpInView(box.top < viewport * 0.85 && box.bottom > viewport * 0.15)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [enabled])

  if (!enabled) return null

  async function share() {
    const url = window.location.href
    // The native sheet is the right thing on a phone — most of these are
    // forwarded to family on Telegram. Clipboard is the desktop fallback.
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, url })
        return
      } catch {
        /* dismissed — fall through to copying */
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked; the address bar still has the link */
    }
  }

  const visible = pastHero && !rsvpInView

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 transition-all duration-300",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
      )}
    >
      <div className="border-t border-(--inv-border) bg-(--inv-bg)/92 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <button
            type="button"
            onClick={share}
            aria-label={t("action.share")}
            className="flex size-12 shrink-0 items-center justify-center rounded-full border border-(--inv-border) text-(--inv-accent) transition-colors outline-none hover:bg-(--inv-surface) focus-visible:ring-3 focus-visible:ring-(--inv-accent)/40"
          >
            {copied ? (
              <Check className="size-5" aria-hidden="true" />
            ) : (
              <Share2 className="size-5" aria-hidden="true" />
            )}
          </button>
          <a
            href="#rsvp"
            className="flex h-12 min-w-0 flex-1 items-center justify-center rounded-full bg-(--inv-accent) px-5 text-sm font-medium text-(--inv-accent-contrast) transition-opacity outline-none hover:opacity-90 focus-visible:ring-3 focus-visible:ring-(--inv-accent)/40"
          >
            <span className="truncate">{t("public.replyNow")}</span>
          </a>
        </div>
      </div>
    </div>
  )
}

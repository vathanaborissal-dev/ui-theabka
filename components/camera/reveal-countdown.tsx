"use client"

import * as React from "react"
import { useLocale } from "@/components/providers/locale-provider"

/**
 * How long until the photos open.
 *
 * Ticks once a minute rather than once a second: this is usually days away, a
 * seconds display would be a stopwatch on a wedding, and it would wake the
 * phone every second to say nothing new.
 */
export function RevealCountdown({ revealAt }: { revealAt: string | null }) {
  const { t, locale } = useLocale()
  const [now, setNow] = React.useState(() => Date.now())

  React.useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000)
    return () => window.clearInterval(id)
  }, [])

  if (!revealAt) return null

  const target = new Date(revealAt)
  const remaining = target.getTime() - now

  const date = target.toLocaleDateString(locale === "km" ? "km-KH" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
  const time = target.toLocaleTimeString(locale === "km" ? "km-KH" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  })

  if (remaining <= 0) {
    return <p className="text-sm text-(--inv-muted)">{t("camera.opensOn").replace("%s", date)}</p>
  }

  const minutes = Math.floor(remaining / 60_000)
  const days = Math.floor(minutes / 1440)
  const hours = Math.floor((minutes % 1440) / 60)

  return (
    <div className="space-y-2">
      <p className="text-xs tracking-wide text-(--inv-muted) uppercase">{t("camera.opensIn")}</p>
      <p className="font-mono text-3xl text-(--inv-gold) tabular-nums">
        {days > 0 ? `${days}${t("camera.days")} ` : ""}
        {days > 0 || hours > 0 ? `${hours}${t("camera.hours")} ` : ""}
        {`${minutes % 60}${t("camera.minutes")}`}
      </p>
      <p className="text-sm text-(--inv-muted)">
        {date} · {time}
      </p>
    </div>
  )
}

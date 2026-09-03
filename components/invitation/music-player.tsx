"use client"

import * as React from "react"
import { Music, Pause } from "lucide-react"
import { useLocale } from "@/components/providers/locale-provider"

/**
 * Background music, with a control the guest can always reach.
 *
 * Two rules shape this component. Browsers refuse to start audio without a
 * user gesture, so playback is armed on the first tap anywhere — usually the
 * "tap to open" envelope, which is why the sound seems to start with the card.
 * And music a guest cannot silence is worse than no music at all: someone may
 * open this in an office or on a bus, so the toggle is always visible and
 * starts paused rather than assuming consent.
 */
export function MusicPlayer({ src, enabled = true }: { src?: string; enabled?: boolean }) {
  const { t } = useLocale()
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = React.useState(false)

  // The first gesture anywhere on the page is the one the autoplay policy
  // accepts. After it fires there is nothing left to listen for.
  React.useEffect(() => {
    if (!src || !enabled) return
    let done = false

    const start = () => {
      if (done) return
      done = true
      const audio = audioRef.current
      if (!audio) return
      audio
        .play()
        .then(() => setPlaying(true))
        // A refusal here is normal — some browsers want a gesture *on the
        // player itself*. The button still works, so there is nothing to say.
        .catch(() => setPlaying(false))
    }

    const events = ["pointerdown", "keydown", "touchstart"] as const
    events.forEach((e) => document.addEventListener(e, start, { once: true, passive: true }))
    return () => events.forEach((e) => document.removeEventListener(e, start))
  }, [src, enabled])

  if (!src || !enabled) return null

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    } else {
      audio.pause()
      setPlaying(false)
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={src}
        loop
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? t("public.musicPause") : t("public.musicPlay")}
        title={playing ? t("public.musicPause") : t("public.musicPlay")}
        className="fixed top-4 left-4 z-40 inline-flex size-11 items-center justify-center rounded-full border border-(--inv-gold)/40 bg-(--inv-surface)/85 text-(--inv-accent) shadow-sm backdrop-blur-sm transition-colors outline-none hover:border-(--inv-gold) focus-visible:ring-3 focus-visible:ring-(--inv-accent)/40"
      >
        {playing ? (
          <Pause className="size-4" aria-hidden="true" />
        ) : (
          <Music className="size-4" aria-hidden="true" />
        )}
        {/* A quiet ring while it plays, so the control reads as "on" at a
            glance without animating anything a guest has to look away from. */}
        {playing ? (
          <span
            className="absolute inset-0 animate-ping rounded-full border border-(--inv-gold)/40 [animation-duration:2.5s]"
            aria-hidden="true"
          />
        ) : null}
      </button>
    </>
  )
}

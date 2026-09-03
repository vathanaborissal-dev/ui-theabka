"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type ViewfinderHandle = {
  /** Grabs the current frame as a JPEG. Null when the stream is not running. */
  capture: () => Promise<Blob | null>
}

/**
 * The live camera feed.
 *
 * This is what makes it a disposable camera rather than a file upload: the
 * guest frames the shot here, presses the shutter, and the picture goes
 * straight to the roll without ever being shown back to them. The browser's
 * own camera UI cannot do that — the native picker shows a "Use Photo"
 * preview, which is the one thing this feature exists to withhold.
 *
 * When the stream cannot start — permission refused, no camera, a browser
 * without it — this reports the failure and the screen falls back to a file
 * picker. That fallback does show the guest their photo on iOS, which is a
 * real gap and better than a camera that does not work at all.
 */
export const Viewfinder = React.forwardRef<
  ViewfinderHandle,
  {
    /** Longest edge of the saved photo. Party wifi, not a print shop. */
    maxEdge?: number
    onError?: (error: unknown) => void
    onReady?: () => void
    className?: string
  }
>(function Viewfinder({ maxEdge = 1800, onError, onReady, className }, ref) {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const [live, setLive] = React.useState(false)

  React.useEffect(() => {
    let stream: MediaStream | null = null
    let cancelled = false

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          // The back camera, and a resolution that is worth keeping without
          // being a 12 megapixel upload over a hotel's wifi.
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1440 },
          },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        const video = videoRef.current
        if (!video) return
        video.srcObject = stream
        await video.play()
        setLive(true)
        onReady?.()
      } catch (error) {
        if (!cancelled) onError?.(error)
      }
    }

    void start()
    return () => {
      cancelled = true
      // Releasing the track is what turns the phone's camera light off. Left
      // running it keeps the camera warm and the battery draining after the
      // guest has wandered back to their table.
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [onError, onReady])

  React.useImperativeHandle(
    ref,
    () => ({
      capture: async () => {
        const video = videoRef.current
        if (!video || !video.videoWidth) return null

        const scale = Math.min(1, maxEdge / Math.max(video.videoWidth, video.videoHeight))
        const canvas = document.createElement("canvas")
        canvas.width = Math.round(video.videoWidth * scale)
        canvas.height = Math.round(video.videoHeight * scale)

        const context = canvas.getContext("2d")
        if (!context) return null
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        return new Promise<Blob | null>((resolve) => {
          canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.85)
        })
      },
    }),
    [maxEdge]
  )

  return (
    <video
      ref={videoRef}
      className={cn(
        "size-full object-cover transition-opacity duration-500",
        live ? "opacity-100" : "opacity-0",
        className
      )}
      muted
      playsInline
      // Without this iOS takes the feed fullscreen over the whole page.
      autoPlay
    />
  )
})

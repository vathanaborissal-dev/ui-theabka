"use client"

import * as React from "react"
import {ImagePlus, Trash2, X} from "lucide-react"
import { BrandSpinner } from "@/components/brand/brand-spinner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  cloudinaryUrl,
  formatBytes,
  uploadPhoto,
  type UploadProgress,
} from "@/lib/uploads"

type Status =
  | { state: "idle" }
  | { state: "working"; progress: UploadProgress; name: string }
  | { state: "error"; message: string }

/**
 * Picks, previews and clears one photo.
 *
 * Shows the actual image once uploaded rather than a filename or a tick: the
 * cover is the first thing a guest sees and the first thing a link preview
 * shows, so the only useful confirmation is seeing it.
 *
 * Works before the event exists — `eventId` is optional, and uploads without
 * one are filed under the planner, which is what the create-event wizard needs.
 */
export function CoverPhotoField({
  value,
  onChange,
  eventId,
  label = "Cover photo",
  hint = "Shown on the invitation and when the link is shared.",
  className,
}: {
  value?: string
  onChange: (url: string | undefined) => void
  eventId?: string
  label?: string
  hint?: string
  className?: string
}) {
  const [status, setStatus] = React.useState<Status>({ state: "idle" })
  const [dragging, setDragging] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const abortRef = React.useRef<AbortController | null>(null)

  React.useEffect(() => () => abortRef.current?.abort(), [])

  async function handleFiles(files: FileList | null) {
    const file = Array.from(files ?? []).find((candidate) =>
      candidate.type.startsWith("image/")
    )
    if (!file) return

    const controller = new AbortController()
    abortRef.current = controller
    setStatus({
      state: "working",
      name: file.name,
      progress: { ratio: null, loaded: 0, total: file.size },
    })

    try {
      const result = await uploadPhoto(file, {
        eventId,
        signal: controller.signal,
        onProgress: (progress) =>
          setStatus((current) =>
            current.state === "working" ? { ...current, progress } : current
          ),
      })
      onChange(result.url)
      setStatus({ state: "idle" })
    } catch (error) {
      if (controller.signal.aborted) {
        setStatus({ state: "idle" })
        return
      }
      setStatus({
        state: "error",
        message: error instanceof Error ? error.message : "Upload failed",
      })
    } finally {
      abortRef.current = null
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const working = status.state === "working"
  const percent =
    working && status.progress.ratio !== null
      ? Math.round(status.progress.ratio * 100)
      : null

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => void handleFiles(e.target.files)}
      />

      {value && !working ? (
        <figure className="overflow-hidden rounded-[var(--card-radius)] border border-border">
          {/* A wide crop, matching where it actually appears. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cloudinaryUrl(value, "f_auto,q_auto,c_fill,g_auto,w_800,h_320")}
            alt="Cover photo"
            className="aspect-[5/2] w-full object-cover"
          />
          <figcaption className="flex items-center justify-between gap-2 px-3 py-2">
            <span className="text-xs text-muted-foreground">{hint}</span>
            <span className="flex shrink-0 gap-1">
              <Button variant="ghost" size="sm" onClick={() => inputRef.current?.click()}>
                Replace
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onChange(undefined)
                  setStatus({ state: "idle" })
                }}
              >
                <Trash2 />
                Remove
              </Button>
            </span>
          </figcaption>
        </figure>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            void handleFiles(e.dataTransfer.files)
          }}
          className={cn(
            "flex aspect-[5/2] flex-col items-center justify-center gap-2 rounded-[var(--card-radius)] border border-dashed px-4 text-center transition-colors",
            dragging ? "border-primary bg-primary/5" : "border-border"
          )}
        >
          {working ? (
            <div className="w-full max-w-xs space-y-2">
              <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <BrandSpinner />
                <span className="truncate">{status.name}</span>
              </p>
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent ?? undefined}
                aria-label={`Uploading ${status.name}`}
                className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
              >
                <div
                  className={cn(
                    "h-full rounded-full bg-primary transition-[width] duration-150",
                    percent === null && "w-1/3 animate-pulse"
                  )}
                  style={percent === null ? undefined : { width: `${percent}%` }}
                />
              </div>
              <p className="tnum text-xs text-muted-foreground">
                {percent === null
                  ? "Preparing…"
                  : `${percent}% · ${formatBytes(status.progress.loaded)} of ${formatBytes(status.progress.total)}`}
              </p>
              <Button variant="ghost" size="sm" onClick={() => abortRef.current?.abort()}>
                <X />
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{hint}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-1"
                onClick={() => inputRef.current?.click()}
              >
                <ImagePlus />
                Choose a photo
              </Button>
              <p className="text-xs text-muted-foreground">or drag one here</p>
            </>
          )}
        </div>
      )}

      {status.state === "error" ? (
        <p role="alert" className="text-xs text-destructive">
          {status.message}
        </p>
      ) : null}
    </div>
  )
}

"use client"

import * as React from "react"
import {ImagePlus, X} from "lucide-react"
import { BrandSpinner } from "@/components/brand/brand-spinner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  formatBytes,
  uploadPhoto,
  type UploadProgress,
} from "@/lib/uploads"

type Status =
  | { state: "idle" }
  | { state: "working"; progress: UploadProgress; name: string }
  | { state: "done"; saved: string }
  | { state: "error"; message: string }

/**
 * Drop target and file picker for invitation photos.
 *
 * Progress is shown as a real determinate bar wherever the browser reports
 * byte counts, because these uploads happen on phones over mobile data and a
 * spinner that might mean "two seconds" or "two minutes" is not information.
 * Compression happens first and is reported afterwards, so the saving is
 * visible rather than merely claimed.
 */
export function PhotoUpload({
  eventId,
  multiple = false,
  label,
  onUploaded,
  className,
}: {
  eventId: string
  multiple?: boolean
  label: string
  onUploaded: (urls: string[]) => void
  className?: string
}) {
  const [status, setStatus] = React.useState<Status>({ state: "idle" })
  const [dragging, setDragging] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const abortRef = React.useRef<AbortController | null>(null)

  React.useEffect(() => () => abortRef.current?.abort(), [])

  async function handleFiles(files: FileList | null) {
    const chosen = Array.from(files ?? []).filter((file) => file.type.startsWith("image/"))
    if (chosen.length === 0) return

    const controller = new AbortController()
    abortRef.current = controller
    const uploaded: string[] = []
    let savedFrom = 0
    let savedTo = 0

    try {
      for (const file of chosen) {
        setStatus({
          state: "working",
          name: file.name,
          progress: { ratio: null, loaded: 0, total: file.size },
        })
        const result = await uploadPhoto(file, {
          eventId,
          signal: controller.signal,
          onProgress: (progress) =>
            setStatus((current) =>
              current.state === "working" ? { ...current, progress } : current
            ),
        })
        uploaded.push(result.url)
        savedFrom += result.originalBytes
        savedTo += result.bytes
        if (!multiple) break
      }

      onUploaded(uploaded)
      setStatus({
        state: "done",
        saved: `${formatBytes(savedFrom)} → ${formatBytes(savedTo)}`,
      })
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
  const ratio = working ? status.progress.ratio : null
  const percent = ratio === null ? null : Math.round(ratio * 100)

  return (
    <div className={cn("space-y-2", className)}>
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
          "rounded-[var(--btn-radius)] border border-dashed px-4 py-6 text-center transition-colors",
          dragging ? "border-primary bg-primary/5" : "border-border"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          className="sr-only"
          onChange={(e) => void handleFiles(e.target.files)}
        />

        {working ? (
          <div className="space-y-2">
            <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <BrandSpinner />
              <span className="truncate">{status.name}</span>
            </p>

            {/* Indeterminate only while the browser has told us nothing. */}
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

            <Button
              variant="ghost"
              size="sm"
              onClick={() => abortRef.current?.abort()}
            >
              <X />
              Cancel
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">{label}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => inputRef.current?.click()}
            >
              <ImagePlus />
              Choose {multiple ? "photos" : "a photo"}
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Compressed before upload, then resized per device on delivery.
            </p>
          </>
        )}
      </div>

      {status.state === "done" ? (
        <p className="text-xs text-muted-foreground">Uploaded · {status.saved}</p>
      ) : null}
      {status.state === "error" ? (
        <p role="alert" className="text-xs text-destructive">
          {status.message}
        </p>
      ) : null}
    </div>
  )
}

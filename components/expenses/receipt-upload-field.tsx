"use client"

import * as React from "react"
import {ImagePlus, Maximize2, RefreshCw, Trash2, X} from "lucide-react"
import { BrandSpinner } from "@/components/brand/brand-spinner"
import { Button } from "@/components/ui/button"
import { useLocale } from "@/components/providers/locale-provider"
import { ImagePreviewDialog } from "@/components/shared/image-preview-dialog"
import { cn } from "@/lib/utils"
import {
  cloudinaryUrl,
  formatBytes,
  uploadPhoto,
  type UploadProgress,
} from "@/lib/uploads"

type UploadStatus =
  | { state: "idle" }
  | { state: "working"; name: string; progress: UploadProgress }
  | { state: "error"; message: string }

export function ReceiptUploadField({
  value,
  eventId,
  onChange,
  onUploadingChange,
}: {
  value?: string
  eventId: string
  onChange: (url: string | undefined) => void
  onUploadingChange?: (uploading: boolean) => void
}) {
  const { t } = useLocale()
  const [status, setStatus] = React.useState<UploadStatus>({ state: "idle" })
  const [dragging, setDragging] = React.useState(false)
  const [previewOpen, setPreviewOpen] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const abortRef = React.useRef<AbortController | null>(null)

  React.useEffect(() => () => abortRef.current?.abort(), [])

  async function handleFiles(files: FileList | null) {
    const file = Array.from(files ?? []).find((candidate) =>
      candidate.type.startsWith("image/")
    )
    if (!file) {
      setStatus({ state: "error", message: t("expenses.receiptImageOnly") })
      return
    }

    const controller = new AbortController()
    abortRef.current = controller
    onUploadingChange?.(true)
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
    } catch {
      setStatus(
        controller.signal.aborted
          ? { state: "idle" }
          : { state: "error", message: t("expenses.receiptUploadFailed") }
      )
    } finally {
      abortRef.current = null
      onUploadingChange?.(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const working = status.state === "working"
  const percent =
    working && status.progress.ratio !== null
      ? Math.round(status.progress.ratio * 100)
      : null

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor="ex-receipt" className="text-sm font-medium">
          {t("expenses.receipt")}
        </label>
        <span className="text-xs text-muted-foreground">{t("common.optional")}</span>
      </div>

      <input
        ref={inputRef}
        id="ex-receipt"
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => void handleFiles(event.target.files)}
      />

      {working ? (
        <div className="space-y-2 rounded-[var(--card-radius)] border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-2 text-sm">
            <BrandSpinner className="shrink-0 text-primary" />
            <span className="min-w-0 flex-1 truncate">{status.name}</span>
            <span className="tnum shrink-0 text-xs text-muted-foreground">
              {percent === null ? t("expenses.receiptPreparing") : `${percent}%`}
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent ?? undefined}
            aria-label={t("expenses.receiptUploading")}
            className="h-1.5 overflow-hidden rounded-full bg-muted"
          >
            <div
              className={cn(
                "h-full rounded-full bg-primary transition-[width] duration-150",
                percent === null && "w-1/3 animate-pulse"
              )}
              style={percent === null ? undefined : { width: `${percent}%` }}
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="tnum text-xs text-muted-foreground">
              {formatBytes(status.progress.loaded)} / {formatBytes(status.progress.total)}
            </span>
            <Button type="button" variant="ghost" size="xs" onClick={() => abortRef.current?.abort()}>
              <X />
              {t("action.cancel")}
            </Button>
          </div>
        </div>
      ) : value ? (
        <div className="flex items-center gap-3 rounded-[var(--card-radius)] border border-border p-2">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="group flex min-w-0 flex-1 items-center gap-3 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cloudinaryUrl(value, "f_auto,q_auto,c_fill,g_auto,w_160,h_160")}
              alt={t("expenses.receipt")}
              className="size-14 shrink-0 rounded-md bg-muted object-cover"
            />
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">
                {t("expenses.receiptAttached")}
              </span>
              <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground">
                {t("expenses.receiptPreview")}
                <Maximize2 className="size-3" aria-hidden="true" />
              </span>
            </span>
          </button>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={t("expenses.receiptReplace")}
              onClick={() => inputRef.current?.click()}
            >
              <RefreshCw />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={t("expenses.receiptRemove")}
              onClick={() => {
                setPreviewOpen(false)
                onChange(undefined)
                setStatus({ state: "idle" })
              }}
            >
              <Trash2 />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(false)
            void handleFiles(event.dataTransfer.files)
          }}
          className={cn(
            "flex w-full items-center gap-3 rounded-[var(--card-radius)] border border-dashed px-3 py-3 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            dragging ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
          )}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[var(--btn-radius)] bg-muted text-primary">
            <ImagePlus className="size-4" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium">{t("expenses.receiptAdd")}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {t("expenses.receiptHelp")}
            </span>
          </span>
        </button>
      )}

      {status.state === "error" ? (
        <p role="alert" className="text-xs font-medium text-destructive">
          {status.message}
        </p>
      ) : null}

      <ImagePreviewDialog
        src={value}
        open={previewOpen}
        label={t("expenses.receipt")}
        closeLabel={t("action.close")}
        unavailableLabel={t("expenses.receiptPreviewUnavailable")}
        onOpenChange={setPreviewOpen}
      />
    </div>
  )
}

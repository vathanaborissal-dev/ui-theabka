"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { ImageOff, X } from "lucide-react"
import { cloudinaryUrl } from "@/lib/uploads"

/** Full-screen, focus-trapped preview for a single private app image. */
export function ImagePreviewDialog({
  src,
  open,
  label,
  closeLabel,
  unavailableLabel,
  onOpenChange,
}: {
  src?: string
  open: boolean
  label: string
  closeLabel: string
  unavailableLabel: string
  onOpenChange: (open: boolean) => void
}) {
  const [failedSrc, setFailedSrc] = React.useState<string>()
  const failed = Boolean(src && failedSrc === src)

  return (
    <DialogPrimitive.Root open={open && Boolean(src)} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-[60] bg-black/90 duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup
          className="fixed inset-0 z-[60] flex flex-col outline-none duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
          aria-label={label}
        >
          <DialogPrimitive.Title className="sr-only">{label}</DialogPrimitive.Title>
          <div className="flex justify-end px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
            <DialogPrimitive.Close
              className="grid size-10 place-items-center rounded-full text-white/80 transition-colors outline-none hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/60"
              aria-label={closeLabel}
            >
              <X className="size-5" aria-hidden="true" />
            </DialogPrimitive.Close>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {failed ? (
              <p className="flex items-center gap-2 text-sm text-white/65">
                <ImageOff className="size-5" aria-hidden="true" />
                {unavailableLabel}
              </p>
            ) : src ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={cloudinaryUrl(src, "f_auto,q_auto,c_limit,w_2000,h_2000")}
                alt={label}
                onError={() => setFailedSrc(src)}
                className="max-h-full max-w-full object-contain select-none"
                draggable={false}
              />
            ) : null}
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

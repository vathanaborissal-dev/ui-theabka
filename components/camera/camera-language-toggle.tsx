"use client"

import { useLocale } from "@/components/providers/locale-provider"
import { cn } from "@/lib/utils"

/**
 * Khmer/English switch for the camera.
 *
 * The viewfinder's own, because the invitation's toggle is painted in the
 * card's pale surface and would be a bright slab over a live feed. This one
 * keeps the dark ground and borrows only the card's gold, so it belongs to the
 * same wedding without lighting up the frame someone is composing.
 *
 * It sits out of the way of the shutter deliberately: a guest who taps
 * "English" by accident while aiming has lost a shot they cannot retake.
 */
export function CameraLanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLocale()

  return (
    <div
      role="group"
      aria-label={t("common.language")}
      className={cn(
        "inline-flex items-center rounded-full border border-white/15 bg-black/55 p-0.5 backdrop-blur-sm",
        className
      )}
    >
      {(["km", "en"] as const).map((code) => (
        <button
          key={code}
          type="button"
          lang={code}
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
          className={cn(
            "inline-flex h-8 min-w-11 items-center justify-center rounded-full px-3 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-(--inv-gold)/60",
            locale === code
              ? "bg-(--inv-gold) text-(--inv-bg)"
              : "text-white/65 hover:text-white"
          )}
        >
          {code === "en" ? "EN" : "ខ្មែរ"}
        </button>
      ))}
    </div>
  )
}

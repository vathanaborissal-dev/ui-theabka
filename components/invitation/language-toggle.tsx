"use client"

import { useLocale } from "@/components/providers/locale-provider"
import { cn } from "@/lib/utils"

/** Floating language switch on the public page. */
export function InvitationLanguageToggle() {
  const { locale, setLocale, t } = useLocale()

  return (
    <div
      role="group"
      aria-label={t("common.language")}
      className="fixed top-3 right-3 z-50 inline-flex items-center rounded-full border border-(--inv-border) bg-(--inv-surface)/90 p-0.5 shadow-sm backdrop-blur"
    >
      {(["km", "en"] as const).map((code) => (
        <button
          key={code}
          type="button"
          lang={code}
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-(--inv-accent)/40",
            locale === code
              ? "bg-(--inv-accent) text-(--inv-accent-contrast)"
              : "text-(--inv-muted) hover:text-(--inv-fg)"
          )}
        >
          {code === "en" ? "EN" : "ខ្មែរ"}
        </button>
      ))}
    </div>
  )
}

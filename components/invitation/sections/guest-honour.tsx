"use client"

import { useLocale } from "@/components/providers/locale-provider"
import { cn } from "@/lib/utils"

/**
 * The honour line.
 *
 * Printed Khmer invitations leave a ruled blank here for the family to write
 * the guest's name by hand. A digital invitation can do better: when the guest
 * arrives through their personal link we already know who they are, so the line
 * is filled in for them. Without a personal link it falls back to the honorific
 * that is actually pre-printed on Cambodian cards —
 * "លោក លោកស្រី អ្នកនាង កញ្ញា" — rather than an empty rule.
 */
export function GuestHonour({
  guestName,
  className,
  variant = "ruled",
  tone = "card",
}: {
  guestName?: string
  className?: string
  variant?: "ruled" | "plain"
  /**
   * "light" is for an honour line sitting on a cover photograph, where the
   * palette's own foreground colour would disappear into the image.
   */
  tone?: "card" | "light"
}) {
  const { t } = useLocale()

  return (
    <div className={cn("mx-auto max-w-sm text-center", className)}>
      <p
        className={cn(
          "text-[0.8125rem] tracking-[0.14em] uppercase",
          tone === "light"
            ? "text-white/85 drop-shadow-[0_1px_6px_rgba(0,0,0,0.55)]"
            : "text-(--inv-muted)"
        )}
      >
        {t("public.honour")}
      </p>

      {variant === "ruled" ? (
        <div className="relative mt-3">
          <div className="rounded-sm border border-(--inv-gold)/50 px-5 py-3">
            <div className="rounded-[2px] border border-(--inv-gold)/30 px-4 py-2">
              <p
                className={cn(
                  "truncate text-lg",
                  guestName ? "text-(--inv-fg)" : "text-(--inv-muted)"
                )}
                style={{ fontFamily: "var(--inv-font-display)" }}
              >
                {guestName || t("public.honourGeneric")}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p
          className={cn(
            "mt-2 text-xl",
            tone === "light"
              ? "text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)]"
              : "text-(--inv-fg)"
          )}
          style={{ fontFamily: "var(--inv-font-display)" }}
        >
          {guestName || t("public.honourGeneric")}
        </p>
      )}
    </div>
  )
}
